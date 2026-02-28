/**
 * TruFleet — /api/dispatch
 * Authorization engine for vehicle dispatch requests.
 *
 * POST /api/dispatch/authorize  — check if vehicle can dispatch
 * GET  /api/dispatch/logs       — recent dispatch decisions
 * GET  /api/dispatch/stats      — today's stats
 */

'use strict';

const express  = require('express');
const supabase = require('../supabase');

const router = express.Router();

/* ── Helpers ── */
function daysUntilExpiry(isoDate) {
  if (!isoDate) return -9999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(isoDate) - today) / (1000 * 60 * 60 * 24));
}

function genCode(prefix, seq) {
  return `${prefix}-${new Date().getFullYear()}-${String(seq).padStart(6, '0')}`;
}

/* ── POST /api/dispatch/authorize ─────────────────── */
router.post('/authorize', async (req, res) => {
  const { reg_number, secret_key } = req.body;
  if (!reg_number) return res.status(400).json({ error: 'reg_number is required' });

  const timestamp = new Date().toISOString();

  try {
    /* 1. Look up vehicle in vehicles table */
    const { data: vehicles, error: vErr } = await supabase
      .from('vehicles')
      .select('*')
      .ilike('id', reg_number.trim())
      .limit(1);

    /* 2. Also look in fleet_vehicles as fallback */
    let vehicle = vehicles && vehicles[0];
    if (!vehicle) {
      const { data: fvData } = await supabase
        .from('fleet_vehicles')
        .select('*')
        .or(`vehicle_number.ilike.${reg_number.trim()},vin.ilike.${reg_number.trim()}`)
        .limit(1);
      if (fvData && fvData[0]) {
        const fv = fvData[0];
        // Normalize fleet_vehicle shape to vehicles shape
        vehicle = {
          id:               fv.vehicle_number,
          owner:            fv.owner_name,
          vehicle_type:     fv.vehicle_type,
          vehicle_usage:    fv.vehicle_usage,
          status:           fv.status,
          insurance_expiry: fv.insurance_expiry || null,
          make:             fv.make,
          model:            fv.model,
        };
      }
    }

    if (!vehicle) {
      const logResult = { result: 'DENIED', reason: 'Vehicle not found in registry', code: null };
      await writeDispatchLog(reg_number, 'DENIED', logResult.reason, timestamp, null);
      return res.json({ result: 'DENIED', reason: 'Vehicle not found in registry', checks: { found: false } });
    }

    /* 3. Personal vehicle hard-block */
    if (vehicle.vehicle_usage === 'personal') {
      const logResult = { result: 'DENIED', reason: 'Personal vehicles cannot be dispatched' };
      await writeDispatchLog(reg_number, 'DENIED', logResult.reason, timestamp, vehicle);
      return res.json({ result: 'DENIED', reason: 'Personal vehicles are not eligible for dispatch authorization', vehicle: safeVehicle(vehicle), checks: { found: true, personal: true } });
    }

    /* 4. Blocked status */
    if ((vehicle.status || '').toLowerCase() === 'blocked') {
      const reason = 'Vehicle is administratively blocked';
      await writeDispatchLog(reg_number, 'DENIED', reason, timestamp, vehicle);
      return res.json({ result: 'DENIED', reason, vehicle: safeVehicle(vehicle), checks: { found: true, personal: false, not_blocked: false } });
    }

    /* 5. Insurance check */
    const days = daysUntilExpiry(vehicle.insurance_expiry);
    if (days < 0) {
      const reason = `Insurance expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
      await writeDispatchLog(reg_number, 'DENIED', reason, timestamp, vehicle);
      return res.json({
        result: 'DENIED', reason, vehicle: safeVehicle(vehicle),
        checks: { found: true, personal: false, not_blocked: true, insurance_valid: false, days_remaining: days }
      });
    }

    /* 6. AUTHORIZED */
    // Get sequence number from today's logs
    const today = new Date().toISOString().slice(0, 10);
    const { count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'DISPATCH_AUTHORIZED')
      .gte('created_at', today + 'T00:00:00Z');

    const code = genCode('AUTH', (count || 0) + 1);
    await writeDispatchLog(reg_number, 'AUTHORIZED', 'All checks passed', timestamp, vehicle, code);
    return res.json({
      result: 'AUTHORIZED',
      code,
      timestamp,
      vehicle: safeVehicle(vehicle),
      checks: {
        found: true, personal: false, not_blocked: true,
        insurance_valid: true, days_remaining: days
      }
    });

  } catch (err) {
    console.error('[POST /api/dispatch/authorize]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/dispatch/logs ─────────────────────────── */
router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .in('action', ['DISPATCH_AUTHORIZED', 'DISPATCH_DENIED'])
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('[GET /api/dispatch/logs]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/dispatch/stats ────────────────────────── */
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [{ count: auth }, { count: denied }] = await Promise.all([
      supabase.from('audit_logs').select('*', { count: 'exact', head: true })
        .eq('action', 'DISPATCH_AUTHORIZED').gte('created_at', today + 'T00:00:00Z'),
      supabase.from('audit_logs').select('*', { count: 'exact', head: true })
        .eq('action', 'DISPATCH_DENIED').gte('created_at', today + 'T00:00:00Z'),
    ]);
    res.json({ authorized: auth || 0, denied: denied || 0, total: (auth || 0) + (denied || 0) });
  } catch (err) {
    console.error('[GET /api/dispatch/stats]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── Helpers ── */
function safeVehicle(v) {
  return {
    id:           v.id,
    owner:        v.owner || v.owner_name || '—',
    vehicle_type: v.vehicle_type || '—',
    make:         v.make || '—',
    model:        v.model || '—',
    status:       v.status || '—',
    insurance_expiry: v.insurance_expiry || null,
  };
}

async function writeDispatchLog(regNum, result, reason, timestamp, vehicle, code) {
  try {
    await supabase.from('audit_logs').insert([{
      action:      result === 'AUTHORIZED' ? 'DISPATCH_AUTHORIZED' : 'DISPATCH_DENIED',
      entity_id:   regNum,
      description: result === 'AUTHORIZED' ? 'Dispatch authorized' : `Dispatch denied — ${reason}`,
      status:      result === 'AUTHORIZED' ? 'AUTHORIZED' : 'DENIED',
      severity:    result === 'AUTHORIZED' ? 'low' : 'high',
      detail:      reason,
      actor:       'Dispatch System',
      module:      'Dispatch',
      details:     JSON.stringify({ code: code || null, vehicle: vehicle ? safeVehicle(vehicle) : null }),
      created_at:  timestamp,
    }]);
  } catch (e) {
    console.warn('[Dispatch] Could not write audit log:', e.message);
  }
}

module.exports = router;
