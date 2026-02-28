/**
 * TruFleet — /api/vehicles
 * CRUD operations for fleet vehicles via Supabase.
 */

'use strict';

const express  = require('express');
const supabase = require('../supabase');

const router = express.Router();
const TABLE  = 'vehicles';

/* ── Helpers ── */
function daysUntilExpiry(isoDate) {
  if (!isoDate) return 9999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(isoDate) - today) / (1000 * 60 * 60 * 24));
}

function riskClass(isoDate) {
  const d = daysUntilExpiry(isoDate);
  if (d < 0)  return 'crit';
  if (d <= 7) return 'warn';
  return 'safe';
}

function insuranceHealthPct(isoDate) {
  const d = daysUntilExpiry(isoDate);
  return Math.max(0, Math.min(100, Math.round((d / 365) * 100)));
}

/* ── GET /api/vehicles ── */
// Optional query params: status=Active|Blocked, risk=expiring, search=<string>
router.get('/', async (req, res) => {
  try {
    let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });

    const { status, risk, search } = req.query;

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    let results = data;

    // Filter: expiring soon (days 0–7)
    if (risk === 'expiring') {
      results = results.filter(v => {
        const d = daysUntilExpiry(v.insurance_expiry);
        return d >= 0 && d <= 7;
      });
    }

    // Search across plate, owner, make, vin
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(v =>
        (v.id          || '').toLowerCase().includes(q) ||
        (v.owner       || '').toLowerCase().includes(q) ||
        (v.make        || '').toLowerCase().includes(q) ||
        (v.vin         || '').toLowerCase().includes(q)
      );
    }

    // Attach computed fields
    results = results.map(v => ({
      ...v,
      insurance_health_pct: insuranceHealthPct(v.insurance_expiry),
      days_until_expiry:    daysUntilExpiry(v.insurance_expiry),
      risk_class:           riskClass(v.insurance_expiry),
    }));

    res.json(results);
  } catch (err) {
    console.error('[GET /api/vehicles]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/vehicles/kpis ── */
// Returns computed KPI values for the dashboard
router.get('/kpis', async (_req, res) => {
  try {
    const { data, error } = await supabase.from(TABLE).select('status, insurance_expiry');
    if (error) throw error;

    const total    = data.length;
    const active   = data.filter(v => v.status === 'Active').length;
    const blocked  = data.filter(v => v.status === 'Blocked').length;
    const expiring = data.filter(v => {
      const d = daysUntilExpiry(v.insurance_expiry);
      return d >= 0 && d <= 7;
    }).length;
    const compliant = data.filter(v => daysUntilExpiry(v.insurance_expiry) > 7).length;
    const nonComp   = data.filter(v => daysUntilExpiry(v.insurance_expiry) < 0).length;
    const utilPct   = total > 0 ? Math.round((active / total) * 100) : 0;
    const compPct   = total > 0 ? Math.round((compliant / total) * 100) : 0;

    res.json({ total, active, blocked, expiring, compliant, nonComp, utilPct, compPct });
  } catch (err) {
    console.error('[GET /api/vehicles/kpis]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/vehicles/:id ── */
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Vehicle not found' });

    res.json({
      ...data,
      insurance_health_pct: insuranceHealthPct(data.insurance_expiry),
      days_until_expiry:    daysUntilExpiry(data.insurance_expiry),
      risk_class:           riskClass(data.insurance_expiry),
    });
  } catch (err) {
    console.error('[GET /api/vehicles/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/vehicles ── */
router.post('/', async (req, res) => {
  try {
    const {
      id, make, type, vin, engine_no, year, owner,
      owner_initials, owner_color, status,
      photo, insurance_provider, policy_number, insurance_expiry
    } = req.body;

    // Basic validation
    const required = { id, make, type, vin, year, owner, insurance_provider, policy_number, insurance_expiry };
    const missing  = Object.keys(required).filter(k => !required[k]);
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert([{
        id, make, type, vin,
        engine_no:          engine_no || null,
        year:               parseInt(year),
        owner,
        owner_initials:     owner_initials || owner.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        owner_color:        owner_color || '#3B82F6',
        status:             status || 'Active',
        photo:              photo || null,
        insurance_provider,
        policy_number,
        insurance_expiry,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('[POST /api/vehicles]', err.message);
    // Duplicate key
    if (err.message.includes('duplicate') || err.message.includes('unique')) {
      return res.status(409).json({ error: 'A vehicle with this plate number already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

/* ── PATCH /api/vehicles/:id ── */
router.patch('/:id', async (req, res) => {
  try {
    const patch = req.body;
    if (!patch || Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Vehicle not found' });

    res.json(data);
  } catch (err) {
    console.error('[PATCH /api/vehicles/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── DELETE /api/vehicles/:id ── */
router.delete('/:id', async (req, res) => {
  try {
    // First fetch the vehicle so we can return it / confirm it exists
    const { data: existing, error: fetchErr } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    // Log the deletion
    await supabase.from('audit_logs').insert([{
      id:          `EVT_${Date.now()}`,
      type:        'ADMIN',
      entity_id:   req.params.id,
      description: `Vehicle ${req.params.id} permanently deleted`,
      status:      'SUCCESS',
      detail:      `${existing.make} ${existing.type} owned by ${existing.owner}`,
      json_data:   existing,
      timestamp:   new Date().toISOString(),
    }]);

    res.json({ success: true, deleted: existing });
  } catch (err) {
    console.error('[DELETE /api/vehicles/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/vehicles/bulk-delete ── */
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids (array of plate IDs) is required' });
    }

    const { data, error } = await supabase
      .from(TABLE)
      .delete()
      .in('id', ids)
      .select();

    if (error) throw error;

    // Log the bulk deletion
    await supabase.from('audit_logs').insert([{
      id:          `EVT_${Date.now()}`,
      type:        'ADMIN',
      entity_id:   'BULK',
      description: `Bulk deletion of ${data.length} vehicles`,
      status:      'SUCCESS',
      detail:      ids.join(', '),
      json_data:   { deleted_ids: ids, count: data.length },
      timestamp:   new Date().toISOString(),
    }]);

    res.json({ success: true, deleted: data.length, vehicles: data });
  } catch (err) {
    console.error('[POST /api/vehicles/bulk-delete]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/vehicles/bulk-status ── */
router.post('/bulk-status', async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids (array) is required' });
    }
    if (!status || !['Active', 'Blocked'].includes(status)) {
      return res.status(400).json({ error: 'status must be Active or Blocked' });
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids)
      .select();

    if (error) throw error;

    await supabase.from('audit_logs').insert([{
      id:          `EVT_${Date.now()}`,
      type:        'ADMIN',
      entity_id:   'BULK',
      description: `Bulk status change to ${status} for ${data.length} vehicles`,
      status:      'SUCCESS',
      detail:      ids.join(', '),
      json_data:   { updated_ids: ids, new_status: status, count: data.length },
      timestamp:   new Date().toISOString(),
    }]);

    res.json({ success: true, updated: data.length, vehicles: data });
  } catch (err) {
    console.error('[POST /api/vehicles/bulk-status]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/vehicles/:id/history ── */
router.get('/:id/history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_id', req.params.id)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('[GET /api/vehicles/:id/history]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
