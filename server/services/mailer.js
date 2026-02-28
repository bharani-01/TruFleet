/**
 * TruFleet — Mailer Service
 * Uses Nodemailer + Brevo (Sendinblue) SMTP relay for all outbound email.
 */

'use strict';

require('dotenv').config();
const nodemailer = require('nodemailer');

/* ── Transport ─────────────────────────────────────────── */
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // STARTTLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.MAIL_FROM || '"TruFleet Platform" <trufleet.info@gmail.com>';

/* ── Generic send ───────────────────────────────────────── */
async function sendMail({ to, subject, html, text }) {
  const info = await transport.sendMail({ from: FROM, to, subject, html, text });
  console.log(`[Mailer] Sent "${subject}" → ${to} (msgId: ${info.messageId})`);
  return info;
}

/* ── OTP Email ──────────────────────────────────────────── */
async function sendOtpEmail(email, otp) {
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#F8FAFC;">
      <div style="background:#0F172A;border-radius:12px;padding:24px 28px;margin-bottom:24px;">
        <span style="color:#3B82F6;font-size:1.5rem;font-weight:800;">🚛 TRUFLEET</span>
      </div>
      <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:32px 28px;">
        <h2 style="color:#0F172A;font-size:1.2rem;margin-bottom:8px;">Your Sign-In Code</h2>
        <p style="color:#64748B;font-size:0.9rem;margin-bottom:28px;">Use the code below to complete your sign-in. It expires in <strong>10 minutes</strong>.</p>
        <div style="background:#F1F5F9;border:2px dashed #CBD5E1;border-radius:10px;padding:20px;text-align:center;letter-spacing:0.35em;font-family:'Courier New',monospace;font-size:2.2rem;font-weight:700;color:#0F172A;">${otp}</div>
        <p style="color:#94A3B8;font-size:0.8rem;margin-top:20px;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
      <p style="color:#CBD5E1;font-size:0.75rem;text-align:center;margin-top:16px;">TruFleet — Enterprise Fleet Intelligence Platform</p>
    </div>`;
  return sendMail({ to: email, subject: 'TruFleet — Your sign-in code', html, text: `Your TruFleet sign-in OTP is: ${otp}. Expires in 10 minutes.` });
}

/* ── Daily Fleet Report ─────────────────────────────────── */
async function sendDailyReport(recipient, reportData) {
  const {
    totalVehicles = 0, activeVehicles = 0, criticalExpiry = 0,
    expiringSoon = 0, blockedVehicles = 0, date = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  } = reportData;

  const statusColor = criticalExpiry > 0 ? '#EF4444' : expiringSoon > 0 ? '#F59E0B' : '#10B981';
  const statusText  = criticalExpiry > 0 ? 'Action Required' : expiringSoon > 0 ? 'Attention Needed' : 'All Clear';

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#F8FAFC;">
      <div style="background:#0F172A;border-radius:12px;padding:24px 28px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#3B82F6;font-size:1.3rem;font-weight:800;">🚛 TRUFLEET</span>
        <span style="background:${statusColor};color:white;font-size:0.75rem;font-weight:700;padding:4px 10px;border-radius:6px;letter-spacing:0.05em;">${statusText}</span>
      </div>
      <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:28px;">
        <h2 style="color:#0F172A;font-size:1.1rem;margin-bottom:4px;">Daily Fleet Report</h2>
        <p style="color:#94A3B8;font-size:0.8rem;margin-bottom:24px;">${date}</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;color:#64748B;font-size:0.85rem;">Total Vehicles</td>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;text-align:right;font-weight:700;color:#0F172A;">${totalVehicles}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;color:#64748B;font-size:0.85rem;">Active</td>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;text-align:right;font-weight:700;color:#10B981;">${activeVehicles}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;color:#64748B;font-size:0.85rem;">Blocked / Suspended</td>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;text-align:right;font-weight:700;color:#EF4444;">${blockedVehicles}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;color:#64748B;font-size:0.85rem;">Insurance Expired / Critical</td>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;text-align:right;font-weight:700;color:#EF4444;">${criticalExpiry}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#64748B;font-size:0.85rem;">Expiring within 30 days</td>
            <td style="padding:10px 0;text-align:right;font-weight:700;color:#F59E0B;">${expiringSoon}</td>
          </tr>
        </table>
        <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard.html" style="display:block;margin-top:24px;background:#3B82F6;color:white;text-align:center;padding:12px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9rem;">Open Dashboard →</a>
      </div>
      <p style="color:#CBD5E1;font-size:0.75rem;text-align:center;margin-top:16px;">You received this because you are a TruFleet report recipient. <a href="${process.env.APP_URL || 'http://localhost:3000'}/email_recipients.html" style="color:#94A3B8;">Manage preferences</a></p>
    </div>`;

  return sendMail({
    to: recipient,
    subject: `TruFleet Daily Report — ${statusText} (${date})`,
    html,
    text: `TruFleet Daily Report\n${date}\n\nTotal: ${totalVehicles} | Active: ${activeVehicles} | Blocked: ${blockedVehicles} | Critical Expiry: ${criticalExpiry} | Expiring Soon: ${expiringSoon}`,
  });
}

/* ── Problem / Alert Email ──────────────────────────────── */
async function sendAlertEmail(recipient, alert) {
  const {
    severity = 'warning',
    title = 'Fleet Alert',
    message = '',
    vehicleId = '',
    detail = '',
  } = alert;

  const colors = {
    critical: { bg: '#FEF2F2', border: '#FECACA', badge: '#EF4444', text: 'CRITICAL' },
    warning:  { bg: '#FFFBEB', border: '#FDE68A', badge: '#F59E0B', text: 'WARNING' },
    info:     { bg: '#EFF6FF', border: '#BFDBFE', badge: '#3B82F6', text: 'INFO' },
  };
  const c = colors[severity] || colors.info;

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#F8FAFC;">
      <div style="background:#0F172A;border-radius:12px;padding:24px 28px;margin-bottom:24px;">
        <span style="color:#3B82F6;font-size:1.3rem;font-weight:800;">🚛 TRUFLEET</span>
      </div>
      <div style="background:${c.bg};border:1px solid ${c.border};border-radius:12px;padding:28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="background:${c.badge};color:white;font-size:0.7rem;font-weight:700;padding:3px 9px;border-radius:5px;letter-spacing:0.07em;">${c.text}</span>
          <h2 style="color:#0F172A;font-size:1.05rem;margin:0;">${title}</h2>
        </div>
        ${vehicleId ? `<p style="color:#64748B;font-size:0.8rem;font-weight:600;margin-bottom:8px;font-family:'Courier New',monospace;">Vehicle: ${vehicleId}</p>` : ''}
        <p style="color:#334155;font-size:0.9rem;line-height:1.6;margin-bottom:${detail ? '16px' : '0'};">${message}</p>
        ${detail ? `<pre style="background:white;border:1px solid #E2E8F0;border-radius:8px;padding:12px;font-size:0.8rem;color:#64748B;white-space:pre-wrap;overflow:auto;">${detail}</pre>` : ''}
        <a href="${process.env.APP_URL || 'http://localhost:3000'}/vehicle_management.html" style="display:block;margin-top:20px;background:#0F172A;color:white;text-align:center;padding:11px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.85rem;">Review in Fleet Manager →</a>
      </div>
      <p style="color:#CBD5E1;font-size:0.75rem;text-align:center;margin-top:16px;">TruFleet Fleet Intelligence Platform</p>
    </div>`;

  return sendMail({
    to: recipient,
    subject: `[TruFleet ${c.text}] ${title}${vehicleId ? ' — ' + vehicleId : ''}`,
    html,
    text: `TruFleet ${c.text}\n${title}\n${vehicleId ? 'Vehicle: ' + vehicleId + '\n' : ''}\n${message}\n${detail}`,
  });
}

module.exports = { sendMail, sendOtpEmail, sendDailyReport, sendAlertEmail };
