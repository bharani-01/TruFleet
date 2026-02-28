/**
 * TruFleet — Insurance Policies API
 * Manages insurance policies linked to vehicles, with full lifecycle tracking
 *
 * Endpoints
 *   GET    /api/insurance                        — list all policies (optional ?vehicle_id= &status=)
 *   GET    /api/insurance/:id                    — policy detail
 *   GET    /api/insurance/vehicle/:vehicleId     — all policies for a specific vehicle
 *   POST   /api/insurance                        — create policy for a vehicle
 *   PATCH  /api/insurance/:id                    — update policy
 *   PATCH  /api/insurance/:id/status             — change policy status (cancel/suspend/reactivate)
 *   DELETE /api/insurance/:id                    — delete policy
 *   GET    /api/insurance/expiring               — vehicles with expiry ≤ N days (?days=30)
 */

'use strict';

const express  = require('express');
const router   = express.Router();
const supabase = require('../supabase');

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function daysRemaining(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function policyRisk(days) {
  if (days === null) return 'unknown';
  if (days < 0)  return 'expired';
  if (days <= 7)  return 'critical';
  if (days <= 30) return 'warning';
  return 'safe';
}

async function logAction(opts) {
  const { action, entityId, description, status = 'SUCCESS', detail = '', details = {} } = opts;
  try {
    await supabase.from('audit_logs').insert([{
      id:          `EVT_${Date.now()}`,
      action,
      entity_id:   entityId,
      description,
      status,
      severity:    status === 'FAILURE' ? 'HIGH' : 'LOW',
      detail,
      actor:       'system',
      module:      'INSURANCE',
      details,
      timestamp:   new Date().toISOString(),
    }]);
  } catch (_) { /* non-blocking */ }
}

function enrichPolicy(p) {
  const days = daysRemaining(p.valid_until);
  return {
    ...p,
    days_remaining: days,
    risk_level:     policyRisk(days),
    is_active:      p.status === 'active' && days !== null && days >= 0,
  };
}

/* ─── GET /api/insurance/expiring ──────────────────────────────────────────── */
// Must be registered BEFORE /:id to avoid param capture
router.get('/expiring', async (req, res) => {
  try {
    const days  = parseInt(req.query.days || '30', 10);
    const cutoff = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
    const today  = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('status', 'active')
      .gte('valid_until', today)
      .lte('valid_until', cutoff)
      .order('valid_until', { ascending: true });

    if (error) throw error;
    res.json((data || []).map(enrichPolicy));
  } catch (err) {
    console.error('[GET /api/insurance/expiring]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─── GET /api/insurance/vehicle/:vehicleId ────────────────────────────────── */
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('vehicle_id', req.params.vehicleId)
      .order('valid_from', { ascending: false });

    if (error) throw error;
    res.json((data || []).map(enrichPolicy));
  } catch (err) {
    console.error('[GET /api/insurance/vehicle/:vehicleId]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─── GET /api/insurance ────────────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, status, policy_type } = req.query;

    let query = supabase
      .from('insurance_policies')
      .select('*')
      .order('created_at', { ascending: false });

    if (vehicle_id)   query = query.eq('vehicle_id', vehicle_id);
    if (status)       query = query.eq('status', status);
    if (policy_type)  query = query.eq('policy_type', policy_type);

    const { data, error } = await query;
    if (error) throw error;
    res.json((data || []).map(enrichPolicy));
  } catch (err) {
    console.error('[GET /api/insurance]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─── GET /api/insurance/:id ────────────────────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Policy not found' });
    res.json(enrichPolicy(data));
  } catch (err) {
    console.error('[GET /api/insurance/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─── POST /api/insurance ───────────────────────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const {
      vehicle_id, provider, policy_number,
      policy_type = 'comprehensive',
      premium_amount,
      valid_from, valid_until,
      nominee,
      document_url,
      make_current = true,    // if true, cancel previous active policy for this vehicle
    } = req.body;

    const required = { vehicle_id, provider, policy_number, valid_from, valid_until };
    const missing  = Object.keys(required).filter(k => !required[k]);
    if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

    // Validate dates
    if (new Date(valid_until) <= new Date(valid_from)) {
      return res.status(400).json({ error: 'valid_until must be after valid_from' });
    }

    // Verify vehicle exists
    const { data: vehicle } = await supabase.from('vehicles').select('id').eq('id', vehicle_id).single();
    if (!vehicle) return res.status(404).json({ error: `Vehicle ${vehicle_id} not found` });

    // Optionally supersede existing active policies
    if (make_current) {
      await supabase
        .from('insurance_policies')
        .update({ status: 'superseded', updated_at: new Date().toISOString() })
        .eq('vehicle_id', vehicle_id)
        .eq('status', 'active');
    }

    const { data, error } = await supabase
      .from('insurance_policies')
      .insert([{
        vehicle_id,
        provider,
        policy_number,
        policy_type,
        premium_amount:  premium_amount ? parseFloat(premium_amount) : null,
        valid_from,
        valid_until,
        nominee:         nominee || null,
        document_url:    document_url || null,
        status:          'active',
      }])
      .select()
      .single();

    if (error) throw error;

    // Keep vehicles.insurance_* fields in sync (denormalised)
    await supabase.from('vehicles').update({
      insurance_provider: provider,
      policy_number,
      insurance_expiry:   valid_until,
      updated_at:         new Date().toISOString(),
    }).eq('id', vehicle_id);

    await logAction({
      action: 'POLICY_CREATED', entityId: vehicle_id,
      description: `Insurance policy ${policy_number} issued for ${vehicle_id}`,
      detail: `${provider} • ${policy_type} • expires ${valid_until}`,
      details: { policy_id: data.id, policy_number, provider, valid_until },
    });

    res.status(201).json(enrichPolicy(data));
  } catch (err) {
    console.error('[POST /api/insurance]', err.message);
    if (err.message.includes('duplicate') || err.message.includes('unique')) {
      return res.status(409).json({ error: 'A policy with this policy_number already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

/* ─── PATCH /api/insurance/:id ──────────────────────────────────────────────── */
router.patch('/:id', async (req, res) => {
  try {
    const patch = req.body;
    delete patch.id;
    delete patch.created_at;
    delete patch.vehicle_id; // immutable after creation

    if (!patch || Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data, error } = await supabase
      .from('insurance_policies')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Policy not found' });

    await logAction({
      action: 'POLICY_UPDATED', entityId: data.vehicle_id,
      description: `Policy ${data.policy_number} updated`,
      detail: Object.keys(patch).join(', '),
    });

    res.json(enrichPolicy(data));
  } catch (err) {
    console.error('[PATCH /api/insurance/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─── PATCH /api/insurance/:id/status ──────────────────────────────────────── */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, reason } = req.body;
    const VALID = ['active', 'cancelled', 'suspended', 'expired', 'superseded'];

    if (!VALID.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID.join(', ')}` });
    }

    const { data, error } = await supabase
      .from('insurance_policies')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Policy not found' });

    await logAction({
      action: `POLICY_${status.toUpperCase()}`, entityId: data.vehicle_id,
      description: `Policy ${data.policy_number} status → ${status}`,
      detail: reason || '',
      status: ['cancelled', 'suspended', 'expired'].includes(status) ? 'FAILURE' : 'SUCCESS',
    });

    res.json(enrichPolicy(data));
  } catch (err) {
    console.error('[PATCH /api/insurance/:id/status]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─── DELETE /api/insurance/:id ─────────────────────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Policy not found' });

    const { error } = await supabase
      .from('insurance_policies')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    await logAction({
      action: 'POLICY_DELETED', entityId: existing.vehicle_id,
      description: `Policy ${existing.policy_number} deleted`,
    });

    res.json({ success: true, deleted: existing });
  } catch (err) {
    console.error('[DELETE /api/insurance/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
