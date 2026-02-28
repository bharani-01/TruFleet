/**
 * TruFleet — Owners API
 * Manages vehicle owner identities, KYC status and ownership assignments
 *
 * Endpoints
 *   GET    /api/owners                  — list all owners (search, filter)
 *   GET    /api/owners/:id              — owner detail + owned vehicles
 *   POST   /api/owners                  — create owner
 *   PATCH  /api/owners/:id             — update owner fields
 *   PATCH  /api/owners/:id/kyc         — update KYC status only
 *   DELETE /api/owners/:id             — soft-deactivate owner
 *
 *   POST   /api/owners/ownership/assign — assign vehicle → owner
 *   PATCH  /api/owners/ownership/:id/transfer — transfer ownership to new owner
 *   GET    /api/owners/ownership/vehicle/:vehicleId — ownership history for a vehicle
 */

'use strict';

const express = require('express');
const router  = express.Router();
const supabase = require('../supabase');

/* ─── helpers ─────────────────────────────────────────────────────────────── */

async function logAction(opts) {
  const { action, entityId, description, status = 'SUCCESS', detail = '', actor = 'system', module = 'IDENTITY', details = {} } = opts;
  try {
    await supabase.from('audit_logs').insert([{
      id:          `EVT_${Date.now()}`,
      action,
      entity_id:   entityId,
      description,
      status,
      severity:    status === 'FAILURE' ? 'HIGH' : 'LOW',
      detail,
      actor,
      module,
      details,
      timestamp:   new Date().toISOString(),
    }]);
  } catch (_) { /* non-blocking */ }
}

/* ─── GET /api/owners ──────────────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { search, kyc_status, active } = req.query;

    let query = supabase
      .from('owners')
      .select('*, vehicle_ownership(vehicle_id, ownership_type, is_current)')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,license_number.ilike.%${search}%`);
    }
    if (kyc_status) query = query.eq('kyc_status', kyc_status);
    if (active !== undefined) query = query.eq('active', active === 'true');

    const { data, error } = await query;
    if (error) throw error;

    // Attach current vehicle count per owner
    const enriched = (data || []).map(o => ({
      ...o,
      current_vehicle_count: (o.vehicle_ownership || []).filter(v => v.is_current).length,
    }));

    res.json(enriched);
  } catch (err) {
    console.error('[GET /api/owners]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─── GET /api/owners/:id ──────────────────────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const { data: owner, error } = await supabase
      .from('owners')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !owner) return res.status(404).json({ error: 'Owner not found' });

    // Fetch ownership records with vehicle details
    const { data: ownerships } = await supabase
      .from('vehicle_ownership')
      .select('*, vehicles:vehicle_id(id, make, type, status, insurance_expiry)')
      .eq('owner_id', req.params.id)
      .order('from_date', { ascending: false });

    res.json({ ...owner, ownerships: ownerships || [] });
  } catch (err) {
    console.error('[GET /api/owners/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─── POST /api/owners ─────────────────────────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const {
      name, email, phone, company,
      license_number, license_type = 'individual',
      address, kyc_status = 'pending',
    } = req.body;

    if (!name) return res.status(400).json({ error: 'name is required' });

    const { data, error } = await supabase
      .from('owners')
      .insert([{
        name, email: email || null, phone: phone || null,
        company: company || null,
        license_number: license_number || null,
        license_type,
        address: address || null,
        kyc_status,
        active: true,
      }])
      .select()
      .single();

    if (error) throw error;

    await logAction({
      action: 'OWNER_CREATED', entityId: data.id,
      description: `New owner registered: ${name}`,
      detail: email || phone || '',
    });

    res.status(201).json(data);
  } catch (err) {
    console.error('[POST /api/owners]', err.message);
    if (err.message.includes('duplicate') || err.message.includes('unique')) {
      return res.status(409).json({ error: 'An owner with this email already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

/* ─── PATCH /api/owners/:id ────────────────────────────────────────────────── */
router.patch('/:id', async (req, res) => {
  try {
    const patch  = req.body;
    // Remove protected fields
    delete patch.id;
    delete patch.created_at;

    if (!patch || Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data, error } = await supabase
      .from('owners')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Owner not found' });

    await logAction({
      action: 'OWNER_UPDATED', entityId: data.id,
      description: `Owner profile updated: ${data.name}`,
      detail: Object.keys(patch).join(', '),
    });

    res.json(data);
  } catch (err) {
    console.error('[PATCH /api/owners/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─── PATCH /api/owners/:id/kyc ────────────────────────────────────────────── */
router.patch('/:id/kyc', async (req, res) => {
  try {
    const { kyc_status, kyc_note } = req.body;
    const VALID = ['pending', 'verified', 'rejected'];

    if (!VALID.includes(kyc_status)) {
      return res.status(400).json({ error: `kyc_status must be one of: ${VALID.join(', ')}` });
    }

    const { data, error } = await supabase
      .from('owners')
      .update({ kyc_status, kyc_note: kyc_note || null, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Owner not found' });

    await logAction({
      action: `KYC_${kyc_status.toUpperCase()}`, entityId: data.id,
      description: `KYC status set to ${kyc_status} for ${data.name}`,
      detail: kyc_note || '',
      status: kyc_status === 'rejected' ? 'FAILURE' : 'SUCCESS',
    });

    res.json(data);
  } catch (err) {
    console.error('[PATCH /api/owners/:id/kyc]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─── DELETE /api/owners/:id ───────────────────────────────────────────────── */
// Soft-delete: sets active = false, does NOT remove the record
router.delete('/:id', async (req, res) => {
  try {
    // Check for active vehicle ownerships
    const { data: active_owns } = await supabase
      .from('vehicle_ownership')
      .select('vehicle_id')
      .eq('owner_id', req.params.id)
      .eq('is_current', true);

    if (active_owns && active_owns.length > 0) {
      return res.status(409).json({
        error: `Owner has ${active_owns.length} active vehicle(s). Transfer ownership before deactivating.`,
        vehicles: active_owns.map(o => o.vehicle_id),
      });
    }

    const { data, error } = await supabase
      .from('owners')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Owner not found' });

    await logAction({
      action: 'OWNER_DEACTIVATED', entityId: data.id,
      description: `Owner deactivated: ${data.name}`,
    });

    res.json({ success: true, owner: data });
  } catch (err) {
    console.error('[DELETE /api/owners/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  OWNERSHIP MANAGEMENT                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

/* ─── POST /api/owners/ownership/assign ────────────────────────────────────── */
router.post('/ownership/assign', async (req, res) => {
  try {
    const {
      vehicle_id, owner_id,
      ownership_type = 'registered',
      from_date,
      transfer_reason,
    } = req.body;

    if (!vehicle_id || !owner_id) {
      return res.status(400).json({ error: 'vehicle_id and owner_id are required' });
    }

    // Verify vehicle exists
    const { data: vehicle } = await supabase.from('vehicles').select('id, make').eq('id', vehicle_id).single();
    if (!vehicle) return res.status(404).json({ error: `Vehicle ${vehicle_id} not found` });

    // Verify owner exists and is active
    const { data: owner } = await supabase.from('owners').select('id, name, active').eq('id', owner_id).single();
    if (!owner) return res.status(404).json({ error: 'Owner not found' });
    if (!owner.active) return res.status(400).json({ error: 'Owner is deactivated — cannot assign vehicle' });

    // Close existing current ownership if any
    await supabase
      .from('vehicle_ownership')
      .update({ is_current: false, to_date: new Date().toISOString().split('T')[0] })
      .eq('vehicle_id', vehicle_id)
      .eq('is_current', true);

    // Create new ownership record
    const { data, error } = await supabase
      .from('vehicle_ownership')
      .insert([{
        vehicle_id,
        owner_id,
        ownership_type,
        from_date: from_date || new Date().toISOString().split('T')[0],
        is_current: true,
        transfer_reason: transfer_reason || null,
      }])
      .select()
      .single();

    if (error) throw error;

    // Keep vehicles.owner in sync (denormalised display name)
    await supabase.from('vehicles')
      .update({ owner: owner.name, updated_at: new Date().toISOString() })
      .eq('id', vehicle_id);

    await logAction({
      action: 'OWNERSHIP_ASSIGNED', entityId: vehicle_id,
      description: `${vehicle_id} assigned to ${owner.name} (${ownership_type})`,
      detail: transfer_reason || '',
      details: { owner_id, ownership_type },
    });

    res.status(201).json(data);
  } catch (err) {
    console.error('[POST /api/owners/ownership/assign]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─── PATCH /api/owners/ownership/:id/transfer ─────────────────────────────── */
router.patch('/ownership/:id/transfer', async (req, res) => {
  try {
    const { new_owner_id, ownership_type = 'registered', transfer_reason } = req.body;

    if (!new_owner_id) return res.status(400).json({ error: 'new_owner_id is required' });

    // Fetch existing ownership record
    const { data: existing } = await supabase
      .from('vehicle_ownership')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Ownership record not found' });

    // Verify new owner
    const { data: newOwner } = await supabase.from('owners').select('id, name, active').eq('id', new_owner_id).single();
    if (!newOwner) return res.status(404).json({ error: 'New owner not found' });
    if (!newOwner.active) return res.status(400).json({ error: 'New owner is deactivated' });

    const today = new Date().toISOString().split('T')[0];

    // Close current ownership
    await supabase.from('vehicle_ownership')
      .update({ is_current: false, to_date: today })
      .eq('id', req.params.id);

    // Create new ownership
    const { data: newRecord, error } = await supabase
      .from('vehicle_ownership')
      .insert([{
        vehicle_id: existing.vehicle_id,
        owner_id:   new_owner_id,
        ownership_type,
        from_date:  today,
        is_current: true,
        transfer_reason: transfer_reason || `Transferred from previous owner`,
      }])
      .select()
      .single();

    if (error) throw error;

    // Sync denormalised owner name on vehicles table
    await supabase.from('vehicles')
      .update({ owner: newOwner.name, updated_at: new Date().toISOString() })
      .eq('id', existing.vehicle_id);

    await logAction({
      action: 'OWNERSHIP_TRANSFERRED', entityId: existing.vehicle_id,
      description: `Ownership of ${existing.vehicle_id} transferred to ${newOwner.name}`,
      detail: transfer_reason || '',
      details: { from_owner: existing.owner_id, to_owner: new_owner_id },
    });

    res.json(newRecord);
  } catch (err) {
    console.error('[PATCH /api/owners/ownership/:id/transfer]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─── GET /api/owners/ownership/vehicle/:vehicleId ─────────────────────────── */
router.get('/ownership/vehicle/:vehicleId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicle_ownership')
      .select('*, owner:owner_id(id, name, email, phone, kyc_status, license_type, active)')
      .eq('vehicle_id', req.params.vehicleId)
      .order('from_date', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('[GET /api/owners/ownership/vehicle/:vehicleId]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
