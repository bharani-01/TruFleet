/**
 * TruFleet — /api/notifications
 * Notification service — insurance expiry alerts, system notifications.
 * Uses the audit_logs table with type = 'NOTIFICATION' for persistence,
 * and auto-generates alerts from vehicle insurance data.
 */

'use strict';

const express  = require('express');
const supabase = require('../supabase');

const router = express.Router();
const TABLE  = 'audit_logs';

/* ── GET /api/notifications ── */
// Returns all notifications (audit_logs where type = NOTIFICATION + auto-generated alerts)
router.get('/', async (req, res) => {
  try {
    const { read, limit = 50 } = req.query;

    // 1. Fetch persisted notifications
    let query = supabase
      .from(TABLE)
      .select('*')
      .eq('type', 'NOTIFICATION')
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit));

    if (read === 'false') {
      query = query.eq('status', 'UNREAD');
    }

    const { data: persisted, error: logErr } = await query;
    if (logErr) throw logErr;

    // 2. Auto-generate insurance expiry alerts from vehicle data
    const { data: vehicles, error: vErr } = await supabase
      .from('vehicles')
      .select('id, make, type, owner, insurance_expiry, insurance_provider');

    if (vErr) throw vErr;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const alerts = (vehicles || [])
      .filter(v => {
        if (!v.insurance_expiry) return false;
        const d = Math.round((new Date(v.insurance_expiry) - now) / (1000 * 60 * 60 * 24));
        return d <= 14; // expiring within 14 days or already expired
      })
      .map(v => {
        const d = Math.round((new Date(v.insurance_expiry) - now) / (1000 * 60 * 60 * 24));
        let severity, title;
        if (d < 0) {
          severity = 'critical';
          title = `EXPIRED: ${v.id} insurance expired ${Math.abs(d)} days ago`;
        } else if (d === 0) {
          severity = 'critical';
          title = `URGENT: ${v.id} insurance expires today`;
        } else if (d <= 3) {
          severity = 'warning';
          title = `WARNING: ${v.id} insurance expires in ${d} day${d === 1 ? '' : 's'}`;
        } else {
          severity = 'info';
          title = `NOTICE: ${v.id} insurance expires in ${d} days`;
        }

        return {
          id:          `ALERT_${v.id}_EXP`,
          type:        'NOTIFICATION',
          entity_id:   v.id,
          description: title,
          status:      'UNREAD',
          detail:      `${v.make} ${v.type} — ${v.insurance_provider || 'Unknown Provider'}`,
          severity,
          auto_generated: true,
          timestamp:   v.insurance_expiry,
          json_data:   { vehicle: v, days_remaining: d },
        };
      })
      .sort((a, b) => (a.json_data.days_remaining || 0) - (b.json_data.days_remaining || 0));

    // Combine: auto-generated first, then persisted
    const all = [...alerts, ...(persisted || []).map(n => ({ ...n, auto_generated: false, severity: n.json_data?.severity || 'info' }))];

    // Stats
    const unread = all.filter(n => n.status === 'UNREAD').length;
    const critical = all.filter(n => n.severity === 'critical').length;

    res.json({
      total: all.length,
      unread,
      critical,
      notifications: read === 'false' ? all.filter(n => n.status === 'UNREAD') : all,
    });
  } catch (err) {
    console.error('[GET /api/notifications]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/notifications ── */
// Create a custom notification
router.post('/', async (req, res) => {
  try {
    const { entity_id, description, severity, detail } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'description is required' });
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert([{
        id:          `NOTIF_${Date.now()}`,
        type:        'NOTIFICATION',
        entity_id:   entity_id || 'SYSTEM',
        description,
        status:      'UNREAD',
        detail:      detail || null,
        json_data:   { severity: severity || 'info' },
        timestamp:   new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('[POST /api/notifications]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── PATCH /api/notifications/:id/read ── */
// Mark a notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ status: 'READ' })
      .eq('id', req.params.id)
      .eq('type', 'NOTIFICATION')
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Notification not found' });
    res.json(data);
  } catch (err) {
    console.error('[PATCH /api/notifications/:id/read]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/notifications/mark-all-read ── */
router.post('/mark-all-read', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ status: 'READ' })
      .eq('type', 'NOTIFICATION')
      .eq('status', 'UNREAD')
      .select();

    if (error) throw error;
    res.json({ success: true, marked: (data || []).length });
  } catch (err) {
    console.error('[POST /api/notifications/mark-all-read]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── DELETE /api/notifications/:id ── */
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', req.params.id)
      .eq('type', 'NOTIFICATION');

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/notifications/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
