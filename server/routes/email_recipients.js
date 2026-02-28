/**
 * TruFleet — /api/email-recipients
 * CRUD for managing email report recipients.
 * Also exposes POST /api/email-recipients/test-send for manual sends.
 */

'use strict';

const express  = require('express');
const supabase = require('../supabase');
const { sendDailyReport, sendAlertEmail } = require('../services/mailer');
const { getFleetSummary } = require('../services/scheduler');

const router = express.Router();
const TABLE  = 'email_recipients';

/* ── GET / — list all recipients ── */
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('[GET /api/email-recipients]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── POST / — add a recipient ── */
router.post('/', async (req, res) => {
  try {
    const { name, email, report_types, active = true } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });

    const { data, error } = await supabase
      .from(TABLE)
      .insert([{ name: name || email.split('@')[0], email: email.toLowerCase(), report_types: report_types || ['daily_report', 'alerts'], active }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, recipient: data });
  } catch (err) {
    console.error('[POST /api/email-recipients]', err.message);
    if (err.message.includes('unique') || err.message.includes('duplicate')) {
      return res.status(409).json({ error: 'This email is already a recipient.' });
    }
    res.status(500).json({ error: err.message });
  }
});

/* ── PATCH /:id — update recipient ── */
router.patch('/:id', async (req, res) => {
  try {
    const { name, active, report_types } = req.body;
    const patch = {};
    if (name         !== undefined) patch.name         = name;
    if (active       !== undefined) patch.active       = active;
    if (report_types !== undefined) patch.report_types = report_types;

    const { data, error } = await supabase
      .from(TABLE)
      .update(patch)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, recipient: data });
  } catch (err) {
    console.error('[PATCH /api/email-recipients/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── DELETE /:id — remove recipient ── */
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/email-recipients/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /test-send — send a test daily report now ── */
router.post('/test-send', async (req, res) => {
  try {
    const { email, type = 'daily_report' } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });

    if (type === 'daily_report') {
      const summary = await getFleetSummary();
      await sendDailyReport(email, summary || {
        totalVehicles: 0, activeVehicles: 0, criticalExpiry: 0,
        expiringSoon: 0, blockedVehicles: 0,
      });
    } else {
      await sendAlertEmail(email, {
        severity: 'warning',
        title:    'Test Alert from TruFleet',
        message:  'This is a test alert email to confirm your notification preferences are configured correctly.',
        detail:   'No action required — this was triggered manually.',
      });
    }
    res.json({ success: true, message: `Test ${type} sent to ${email}` });
  } catch (err) {
    console.error('[POST /api/email-recipients/test-send]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
