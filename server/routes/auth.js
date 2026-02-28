/**
 * TruFleet — /api/auth
 * Auth layer with OTP support via Supabase Magic Link / email OTP.
 * In-memory OTP store (replace with Redis/DB in production).
 */

'use strict';

const express         = require('express');
const supabase        = require('../supabase');
const { sendOtpEmail } = require('../services/mailer');

const router = express.Router();
const TABLE  = 'users';

/* ── In-memory OTP store — { email: { otp, expiresAt, tries } } ── */
const otpStore = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanExpired() {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) otpStore.delete(email);
  }
}

/* ── POST /api/auth/login ── */
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select('id, name, email, role, initials')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Note: In production, use bcrypt to compare hashed passwords.
    // For demo, we just return the user profile.
    res.json({
      success: true,
      user: {
        id:       data.id,
        name:     data.name,
        email:    data.email,
        role:     data.role || role || 'Fleet Admin',
        initials: data.initials || data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      }
    });
  } catch (err) {
    console.error('[POST /api/auth/login]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/auth/register ── */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const { data, error } = await supabase
      .from(TABLE)
      .insert([{
        name,
        email:    email.toLowerCase(),
        role:     role || 'Fleet Admin',
        company:  company || null,
        initials,
      }])
      .select('id, name, email, role, initials')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      user: data
    });
  } catch (err) {
    console.error('[POST /api/auth/register]', err.message);
    if (err.message.includes('duplicate') || err.message.includes('unique')) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


/* ─────────────────────────────────────────────────────────
 *  OTP — POST /api/auth/otp/send
 *  Generates a 6-digit OTP, saves it, and emails the user.
 * ───────────────────────────────────────────────────────── */
router.post('/otp/send', async (req, res) => {
  cleanExpired();
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  // Rate limit: block if a valid OTP already exists and was sent <60s ago
  const existing = otpStore.get(email.toLowerCase());
  if (existing && existing.expiresAt > Date.now() && existing.sentAt > Date.now() - 60_000) {
    return res.status(429).json({ error: 'Please wait 60 seconds before requesting another code.' });
  }

  const otp = generateOtp();
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    sentAt:    Date.now(),
    tries:     0,
  });

  try {
    await sendOtpEmail(email, otp);
    res.json({ success: true, message: `OTP sent to ${email}` });
  } catch (err) {
    otpStore.delete(email.toLowerCase()); // clean up if send failed
    console.error('[POST /api/auth/otp/send]', err.message);
    res.status(500).json({ error: 'Failed to send OTP email. Check SMTP credentials.' });
  }
});

/* ─────────────────────────────────────────────────────────
 *  OTP — POST /api/auth/otp/verify
 *  Verifies the code, looks up or creates the user profile.
 * ───────────────────────────────────────────────────────── */
router.post('/otp/verify', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'email and otp are required' });

  const record = otpStore.get(email.toLowerCase());

  if (!record)                    return res.status(401).json({ error: 'No OTP found for this email. Please request a new code.' });
  if (record.expiresAt < Date.now()) { otpStore.delete(email.toLowerCase()); return res.status(401).json({ error: 'OTP expired. Please request a new code.' }); }

  record.tries = (record.tries || 0) + 1;
  if (record.tries > 5) { otpStore.delete(email.toLowerCase()); return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new code.' }); }
  if (record.otp !== otp.trim()) return res.status(401).json({ error: `Incorrect code. ${5 - record.tries} attempt(s) remaining.` });

  // ✅ OTP valid — consume it
  otpStore.delete(email.toLowerCase());

  // Look up user in DB, create one if not found (magic-link style)
  let { data: user, error } = await supabase
    .from(TABLE)
    .select('id, name, email, role, initials')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: error.message });
  }

  if (!user) {
    // First-time OTP login → auto-create profile
    const name     = email.split('@')[0];
    const initials = name.slice(0, 2).toUpperCase();
    const { data: newUser, error: insErr } = await supabase
      .from(TABLE)
      .insert([{ name, email: email.toLowerCase(), role: 'Fleet Admin', initials }])
      .select('id, name, email, role, initials')
      .single();
    if (insErr) return res.status(500).json({ error: insErr.message });
    user = newUser;
  }

  res.json({
    success: true,
    user: {
      id:       user.id,
      name:     user.name,
      email:    user.email,
      role:     user.role || 'Fleet Admin',
      initials: user.initials || user.name.slice(0, 2).toUpperCase(),
    },
  });
});
