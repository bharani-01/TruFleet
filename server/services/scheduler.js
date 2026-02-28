/**
 * TruFleet — Scheduler Service
 * Runs cron jobs for daily reports and proactive alert checks.
 * Called once from server/index.js on startup.
 */

'use strict';

const cron     = require('node-cron');
const supabase = require('../supabase');
const { sendDailyReport, sendAlertEmail } = require('./mailer');

/* ── Helper: fetch report data from Supabase ─────────── */
async function getFleetSummary() {
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('status, insurance_expiry');

  if (error || !vehicles) return null;

  const today      = new Date();
  const in30days   = new Date(today); in30days.setDate(in30days.getDate() + 30);
  const in7days    = new Date(today); in7days.setDate(in7days.getDate() + 7);

  let activeVehicles  = 0;
  let blockedVehicles = 0;
  let criticalExpiry  = 0;
  let expiringSoon    = 0;

  for (const v of vehicles) {
    const s = (v.status || '').toLowerCase();
    if (s === 'active') activeVehicles++;
    if (s === 'blocked' || s === 'suspended') blockedVehicles++;

    if (v.insurance_expiry) {
      const exp = new Date(v.insurance_expiry);
      if (exp < today)          criticalExpiry++;
      else if (exp <= in30days) expiringSoon++;
    }
  }

  return {
    totalVehicles: vehicles.length,
    activeVehicles,
    blockedVehicles,
    criticalExpiry,
    expiringSoon,
    date: today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  };
}

/* ── Helper: fetch active recipients ──────────────────── */
async function getRecipients(type = null) {
  let query = supabase.from('email_recipients').select('email, name').eq('active', true);
  if (type) query = query.contains('report_types', [type]);
  const { data } = await query;
  return data || [];
}

/* ── Helper: critical alerts check ───────────────────── */
async function checkAndSendAlerts() {
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('plate_number, insurance_expiry, status');

  if (error || !vehicles) return;

  const today    = new Date();
  const in7days  = new Date(today); in7days.setDate(in7days.getDate() + 7);

  const criticals = vehicles.filter(v => {
    if (!v.insurance_expiry) return false;
    return new Date(v.insurance_expiry) < today;
  });

  const expiring = vehicles.filter(v => {
    if (!v.insurance_expiry) return false;
    const exp = new Date(v.insurance_expiry);
    return exp >= today && exp <= in7days;
  });

  if (criticals.length === 0 && expiring.length === 0) return;

  const alertRecipients = await getRecipients('alerts');
  if (alertRecipients.length === 0) return;

  for (const r of alertRecipients) {
    if (criticals.length > 0) {
      await sendAlertEmail(r.email, {
        severity: 'critical',
        title:    'Insurance Expired — Immediate Action Required',
        message:  `${criticals.length} vehicle(s) have expired insurance and may be non-compliant.`,
        detail:   criticals.map(v => `• ${v.plate_number} — expired ${v.insurance_expiry}`).join('\n'),
      }).catch(err => console.error('[Scheduler] Alert email failed:', err.message));
    }
    if (expiring.length > 0) {
      await sendAlertEmail(r.email, {
        severity: 'warning',
        title:    'Insurance Expiring Within 7 Days',
        message:  `${expiring.length} vehicle(s) need insurance renewal within the next 7 days.`,
        detail:   expiring.map(v => `• ${v.plate_number} — expires ${v.insurance_expiry}`).join('\n'),
      }).catch(err => console.error('[Scheduler] Alert email failed:', err.message));
    }
  }
}

/* ── Register cron jobs ───────────────────────────────── */
function startScheduler() {
  // Daily report — every day at 7:00 AM
  cron.schedule('0 7 * * *', async () => {
    console.log('[Scheduler] Running daily fleet report…');
    try {
      const summary    = await getFleetSummary();
      const recipients = await getRecipients('daily_report');
      if (!summary)              { console.warn('[Scheduler] No fleet data'); return; }
      if (!recipients.length)    { console.warn('[Scheduler] No report recipients'); return; }

      for (const r of recipients) {
        await sendDailyReport(r.email, summary)
          .catch(err => console.error(`[Scheduler] Daily report to ${r.email} failed:`, err.message));
      }
      console.log(`[Scheduler] Daily report sent to ${recipients.length} recipient(s).`);
    } catch (err) {
      console.error('[Scheduler] Daily report error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  // Alert check — every day at 8:00 AM and 2:00 PM
  cron.schedule('0 8,14 * * *', async () => {
    console.log('[Scheduler] Running alert check…');
    try {
      await checkAndSendAlerts();
      console.log('[Scheduler] Alert check complete.');
    } catch (err) {
      console.error('[Scheduler] Alert check error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log('📅  Scheduler started — daily report @ 7:00 AM IST, alerts @ 8:00 AM & 2:00 PM IST');
}

module.exports = { startScheduler, getFleetSummary, checkAndSendAlerts, getRecipients };
