/**
 * TruFleet — /api/fleet-vehicles
 * Full CRUD for the fleet_vehicles registration table.
 * Table:  fleet_vehicles  (create via Supabase dashboard SQL below)
 *
 * SQL to run in Supabase SQL editor:
 * ─────────────────────────────────────────────────────────────────
 * CREATE TABLE IF NOT EXISTS fleet_vehicles (
 *   id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
 *   vehicle_number TEXT        NOT NULL UNIQUE,
 *   vin            TEXT        NOT NULL UNIQUE,
 *   owner_name     TEXT        NOT NULL,
 *   contact        TEXT        NOT NULL,
 *   vehicle_type   TEXT        NOT NULL,
 *   vehicle_usage  TEXT        NOT NULL DEFAULT 'commercial',
 *   make           TEXT,
 *   model          TEXT,
 *   year           INTEGER,
 *   color          TEXT,
 *   fuel_type      TEXT,
 *   engine_cc      TEXT,
 *   status         TEXT        NOT NULL DEFAULT 'active',
 *   notes          TEXT,
 *   created_at     TIMESTAMPTZ DEFAULT NOW()
 * );
 * ─────────────────────────────────────────────────────────────────
 */

'use strict';

const express  = require('express');
const supabase = require('../supabase');

const router = express.Router();
const TABLE  = 'fleet_vehicles';

/* ── GET /api/fleet-vehicles  — list all, with optional search ── */
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    const { search, usage, type, status } = req.query;

    const { data, error } = await query;
    if (error) throw error;

    let results = data;

    if (usage)  results = results.filter(v => v.vehicle_usage === usage);
    if (type)   results = results.filter(v => v.vehicle_type  === type);
    if (status) results = results.filter(v => v.status        === status);

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(v =>
        (v.vehicle_number || '').toLowerCase().includes(q) ||
        (v.vin            || '').toLowerCase().includes(q) ||
        (v.owner_name     || '').toLowerCase().includes(q) ||
        (v.contact        || '').toLowerCase().includes(q) ||
        (v.make           || '').toLowerCase().includes(q) ||
        (v.model          || '').toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: results, count: results.length });
  } catch (err) {
    console.error('[GET /api/fleet-vehicles]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/fleet-vehicles/:id ── */
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[GET /api/fleet-vehicles/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/fleet-vehicles — create new vehicle ── */
router.post('/', async (req, res) => {
  try {
    const {
      vehicle_number, vin, owner_name, contact,
      vehicle_type, vehicle_usage, make, model,
      year, color, fuel_type, engine_cc, status, notes
    } = req.body;

    // Required fields
    if (!vehicle_number || !vin || !owner_name || !contact || !vehicle_type || !vehicle_usage) {
      return res.status(400).json({
        error: 'Required: vehicle_number, vin, owner_name, contact, vehicle_type, vehicle_usage'
      });
    }

    const payload = {
      vehicle_number: vehicle_number.trim().toUpperCase(),
      vin:            vin.trim().toUpperCase(),
      owner_name:     owner_name.trim(),
      contact:        contact.trim(),
      vehicle_type:   vehicle_type.trim(),
      vehicle_usage:  vehicle_usage.trim(),
      make:           (make  || '').trim() || null,
      model:          (model || '').trim() || null,
      year:           year  ? parseInt(year,  10) : null,
      color:          (color|| '').trim() || null,
      fuel_type:      (fuel_type  || '').trim() || null,
      engine_cc:      (engine_cc  || '').trim() || null,
      status:         status || 'active',
      notes:          (notes || '').trim() || null,
    };

    const { data, error } = await supabase.from(TABLE).insert([payload]).select().single();
    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('[POST /api/fleet-vehicles]', err.message);
    // Duplicate key
    if (err.message.includes('unique') || err.message.includes('duplicate')) {
      return res.status(409).json({ error: 'Vehicle number or VIN already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

/* ── PATCH /api/fleet-vehicles/:id — update ── */
router.patch('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.vehicle_number) updates.vehicle_number = updates.vehicle_number.toUpperCase();
    if (updates.vin)            updates.vin            = updates.vin.toUpperCase();
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('[PATCH /api/fleet-vehicles/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── DELETE /api/fleet-vehicles/:id ── */
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Vehicle deleted.' });
  } catch (err) {
    console.error('[DELETE /api/fleet-vehicles/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
