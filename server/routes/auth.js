/**
 * TruFleet — /api/auth
 * Thin auth layer. Uses Supabase users table for profile storage.
 * In production, replace with Supabase Auth (supabase.auth.signIn).
 */

'use strict';

const express  = require('express');
const supabase = require('../supabase');

const router = express.Router();
const TABLE  = 'users';

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
