/**
 * TruFleet — Identity Verification API
 * Enforces vehicle authorization by traversing the full identity chain:
 *   Vehicle Registry → Ownership Record → Owner KYC → Insurance Validity → Platform Eligibility
 *
 * Endpoints
 *   GET  /api/identity/:vehicleId        — full identity card (vehicle + owner + insurance)
 *   POST /api/identity/verify            — authorization check (full chain, logged)
 *   GET  /api/identity/stats             — platform-wide identity health stats
 */

'use strict';

const express  = require('express');
const router   = express.Router();
const supabase = require('../supabase');

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function days(dateStr) {
  if (!dateStr) return null;
  return Math.floor((new Date(dateStr) - new Date()) / 86400000);
}

async function logVerification(vehicleId, result, checks, actor = 'api') {
  try {
    await supabase.from('audit_logs').insert([{
      id:          `EVT_${Date.now()}`,
      action:      result === 'AUTHORIZED' ? 'IDENTITY_AUTHORIZED' : 'IDENTITY_DENIED',
      entity_id:   vehicleId,
      description: `Identity check for ${vehicleId}: ${result}`,
      status:      result === 'AUTHORIZED' ? 'SUCCESS' : 'FAILURE',
      severity:    result === 'AUTHORIZED' ? 'LOW' : 'HIGH',
      detail:      checks.find(c => c.status === 'FAIL')?.reason || 'All checks passed',
      actor,
      module:      'IDENTITY',
      details:     { result, checks },
      timestamp:   new Date().toISOString(),
    }]);
  } catch (_) { /* non-blocking */ }
}

/* ─── GET /api/identity/stats ────────────────────────────────────────────────*/
// Must be defined BEFORE /:vehicleId
router.get('/stats', async (_req, res) => {
  try {
    // Pull from audit_logs for verification counts
    const today = new Date().toISOString().split('T')[0];

    const [verifLogs, vehicles, policies, owners] = await Promise.all([
      supabase.from('audit_logs')
        .select('action, status')
        .in('action', ['IDENTITY_AUTHORIZED', 'IDENTITY_DENIED'])
        .gte('timestamp', today),
      supabase.from('vehicles').select('status, insurance_expiry'),
      supabase.from('insurance_policies').select('status, valid_until').eq('status', 'active'),
      supabase.from('owners').select('active, kyc_status'),
    ]);

    const logs        = verifLogs.data || [];
    const vData       = vehicles.data  || [];
    const pData       = policies.data  || [];
    const oData       = owners.data    || [];

    const authorizedToday = logs.filter(l => l.action === 'IDENTITY_AUTHORIZED').length;
    const deniedToday     = logs.filter(l => l.action === 'IDENTITY_DENIED').length;

    const expiredInsurance    = pData.filter(p => days(p.valid_until) < 0).length;
    const expiringInsurance   = pData.filter(p => { const d = days(p.valid_until); return d >= 0 && d <= 30; }).length;
    const verifiedOwners      = oData.filter(o => o.kyc_status === 'verified' && o.active).length;
    const pendingKyc          = oData.filter(o => o.kyc_status === 'pending').length;
    const blockedVehicles     = vData.filter(v => v.status === 'Blocked').length;

    const totalVerifications  = authorizedToday + deniedToday;
    const authRate = totalVerifications > 0
      ? Math.round((authorizedToday / totalVerifications) * 100) : 0;

    res.json({
      authorizedToday, deniedToday, authRate,
      expiredInsurance, expiringInsurance,
      verifiedOwners, pendingKyc,
      blockedVehicles,
      totalVehicles:   vData.length,
      totalOwners:     oData.filter(o => o.active).length,
      activePolicies:  pData.length,
    });
  } catch (err) {
    console.error('[GET /api/identity/stats]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─── POST /api/identity/verify ─────────────────────────────────────────────── */
/**
 * Full authorization chain. Returns:
 * {
 *   result:  'AUTHORIZED' | 'DENIED',
 *   reason?:  string,                — only present on DENIED
 *   vehicle:  {...},
 *   owner:    {...} | null,
 *   policy:   {...} | null,
 *   checks: [
 *     { step: 'VEHICLE_REGISTRY',   status: 'PASS'|'FAIL'|'SKIP', reason?: string },
 *     { step: 'VEHICLE_STATUS',     ... },
 *     { step: 'OWNERSHIP_RECORD',   ... },
 *     { step: 'OWNER_ACTIVE',       ... },
 *     { step: 'OWNER_KYC',          ... },
 *     { step: 'INSURANCE_POLICY',   ... },
 *     { step: 'INSURANCE_VALIDITY', ... },
 *   ]
 * }
 */
router.post('/verify', async (req, res) => {
  const { vehicle_id, actor = 'api' } = req.body;
  if (!vehicle_id) return res.status(400).json({ error: 'vehicle_id is required' });

  const checks  = [];
  let vehicle   = null;
  let owner     = null;
  let policy    = null;
  let denied    = false;
  let denialReason = '';

  const pass = (step, note) => checks.push({ step, status: 'PASS', note: note || null });
  const fail = (step, reason) => {
    checks.push({ step, status: 'FAIL', reason });
    if (!denied) { denied = true; denialReason = reason; }
  };
  const skip = (step, reason) => checks.push({ step, status: 'SKIP', reason });

  try {
    /* ── 1. Vehicle Registry ───────────────────────────────────────────────── */
    const { data: v } = await supabase
      .from('vehicles')
      .select('*')
      .ilike('id', vehicle_id.trim())
      .single();

    if (!v) {
      fail('VEHICLE_REGISTRY', `Vehicle "${vehicle_id}" not found in registry`);
      skip('VEHICLE_STATUS',     'Skipped — vehicle not found');
      skip('OWNERSHIP_RECORD',   'Skipped — vehicle not found');
      skip('OWNER_ACTIVE',       'Skipped — vehicle not found');
      skip('OWNER_KYC',          'Skipped — vehicle not found');
      skip('INSURANCE_POLICY',   'Skipped — vehicle not found');
      skip('INSURANCE_VALIDITY', 'Skipped — vehicle not found');
      await logVerification(vehicle_id, 'DENIED', checks, actor);
      return res.json({ result: 'DENIED', reason: denialReason, vehicle: null, owner: null, policy: null, checks });
    }

    vehicle = v;
    pass('VEHICLE_REGISTRY', `Found: ${v.make} ${v.type}`);

    /* ── 2. Vehicle Status ─────────────────────────────────────────────────── */
    if (v.status === 'Blocked') {
      fail('VEHICLE_STATUS', `Vehicle is administratively blocked`);
    } else {
      pass('VEHICLE_STATUS', `Status: ${v.status}`);
    }

    /* ── 3. Ownership Record ───────────────────────────────────────────────── */
    const { data: owns } = await supabase
      .from('vehicle_ownership')
      .select('*, owner:owner_id(*)')
      .eq('vehicle_id', v.id)
      .eq('is_current', true)
      .single();

    if (!owns) {
      fail('OWNERSHIP_RECORD', 'No registered owner on file for this vehicle');
      skip('OWNER_ACTIVE', 'Skipped — no ownership record');
      skip('OWNER_KYC',    'Skipped — no ownership record');
    } else {
      pass('OWNERSHIP_RECORD', `Owner: ${owns.owner?.name || 'Unknown'} (${owns.ownership_type})`);
      owner = owns.owner;

      /* ── 4. Owner Active ─────────────────────────────────────────────────── */
      if (!owns.owner?.active) {
        fail('OWNER_ACTIVE', `Owner "${owns.owner?.name}" account is deactivated`);
      } else {
        pass('OWNER_ACTIVE', `${owns.owner.name} — active`);
      }

      /* ── 5. Owner KYC ────────────────────────────────────────────────────── */
      const kyc = owns.owner?.kyc_status;
      if (kyc === 'verified') {
        pass('OWNER_KYC', 'KYC verified');
      } else if (kyc === 'pending') {
        // KYC pending is a warning — we allow but note it
        checks.push({ step: 'OWNER_KYC', status: 'WARN', reason: 'KYC verification pending — interaction flagged' });
      } else if (kyc === 'rejected') {
        fail('OWNER_KYC', `Owner KYC rejected — platform interaction not permitted`);
      } else {
        skip('OWNER_KYC', 'Owner KYC status unknown');
      }
    }

    /* ── 6. Insurance Policy ───────────────────────────────────────────────── */
    // Prefer the insurance_policies table (source of truth); fall back to vehicle record
    const { data: policies } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('vehicle_id', v.id)
      .eq('status', 'active')
      .order('valid_until', { ascending: false })
      .limit(1);

    const activePolicies = policies || [];

    if (activePolicies.length === 0) {
      // Fall back to denormalised fields on vehicles table
      if (v.insurance_provider && v.policy_number && v.insurance_expiry) {
        policy = {
          provider:       v.insurance_provider,
          policy_number:  v.policy_number,
          valid_until:    v.insurance_expiry,
          source:         'vehicle_record',
        };
        pass('INSURANCE_POLICY', `Policy ${v.policy_number} from vehicle record`);
      } else {
        fail('INSURANCE_POLICY', 'No active insurance policy found');
        skip('INSURANCE_VALIDITY', 'Skipped — no policy');
        const result = denied ? 'DENIED' : 'AUTHORIZED';
        await logVerification(v.id, result, checks, actor);
        return res.json({ result, reason: denied ? denialReason : undefined, vehicle, owner, policy, checks });
      }
    } else {
      policy = activePolicies[0];
      pass('INSURANCE_POLICY', `${policy.provider} — ${policy.policy_number}`);
    }

    /* ── 7. Insurance Validity ───────────────────────────────────────────────*/
    const daysLeft = days(policy.valid_until);
    if (daysLeft === null) {
      fail('INSURANCE_VALIDITY', 'Insurance expiry date is missing');
    } else if (daysLeft < 0) {
      fail('INSURANCE_VALIDITY', `Insurance expired ${Math.abs(daysLeft)} day(s) ago (${policy.valid_until})`);
    } else if (daysLeft <= 7) {
      checks.push({
        step: 'INSURANCE_VALIDITY',
        status: 'WARN',
        reason: `Insurance expires in ${daysLeft} day(s) — renewal required soon`,
        days_remaining: daysLeft,
      });
      if (!policy.days_remaining) policy.days_remaining = daysLeft;
    } else {
      pass('INSURANCE_VALIDITY', `Valid for ${daysLeft} more day(s) — expires ${policy.valid_until}`);
      policy.days_remaining = daysLeft;
    }

    /* ── Final verdict ───────────────────────────────────────────────────────*/
    const result = denied ? 'DENIED' : 'AUTHORIZED';

    await logVerification(v.id, result, checks, actor);

    return res.json({
      result,
      reason:  denied ? denialReason : undefined,
      vehicle: {
        id:    v.id, make: v.make, type: v.type,
        vin:   v.vin, year: v.year, status: v.status,
      },
      owner:  owner ? {
        id:             owner.id,
        name:           owner.name,
        email:          owner.email,
        kyc_status:     owner.kyc_status,
        license_type:   owner.license_type,
      } : null,
      policy: policy ? {
        provider:      policy.provider,
        policy_number: policy.policy_number,
        valid_until:   policy.valid_until,
        days_remaining: policy.days_remaining,
        policy_type:   policy.policy_type || null,
        source:        policy.source || 'insurance_policies',
      } : null,
      checks,
    });

  } catch (err) {
    console.error('[POST /api/identity/verify]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─── GET /api/identity/:vehicleId ────────────────────────────────────────────*/
// Returns the full identity card: vehicle + current owner + latest insurance policy
router.get('/:vehicleId', async (req, res) => {
  try {
    const vid = req.params.vehicleId.trim().toUpperCase();

    // Fetch vehicle
    const { data: vehicle, error: ve } = await supabase
      .from('vehicles')
      .select('*')
      .ilike('id', vid)
      .single();

    if (ve || !vehicle) return res.status(404).json({ error: `Vehicle "${vid}" not found` });

    // Fetch current ownership
    const { data: ownership } = await supabase
      .from('vehicle_ownership')
      .select('*, owner:owner_id(*)')
      .eq('vehicle_id', vehicle.id)
      .eq('is_current', true)
      .single();

    // Fetch all policies (most recent first)
    const { data: policies } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .order('valid_from', { ascending: false });

    // Fetch ownership history
    const { data: ownershipHistory } = await supabase
      .from('vehicle_ownership')
      .select('*, owner:owner_id(id, name, email, kyc_status)')
      .eq('vehicle_id', vehicle.id)
      .order('from_date', { ascending: false });

    const currentPolicy = (policies || []).find(p => p.status === 'active') || null;
    const daysLeft = currentPolicy ? days(currentPolicy.valid_until) : null;

    res.json({
      vehicle: {
        ...vehicle,
        insurance_health_pct: daysLeft === null ? 0
          : Math.min(100, Math.max(0, Math.round((daysLeft / 365) * 100))),
        days_until_expiry: daysLeft,
      },
      current_owner: ownership ? {
        ...ownership.owner,
        ownership_type: ownership.ownership_type,
        from_date:      ownership.from_date,
      } : null,
      current_policy: currentPolicy ? {
        ...currentPolicy,
        days_remaining: daysLeft,
        risk_level: daysLeft === null ? 'unknown'
          : daysLeft < 0 ? 'expired'
          : daysLeft <= 7 ? 'critical'
          : daysLeft <= 30 ? 'warning' : 'safe',
      } : null,
      policy_history:    (policies || []).filter(p => p.status !== 'active'),
      ownership_history: ownershipHistory || [],
    });
  } catch (err) {
    console.error('[GET /api/identity/:vehicleId]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
