'use strict';
/**
 * TruFleet — Driver Management API
 * Base: /api/drivers
 */

const express  = require('express');
const router   = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const today = () => new Date().toISOString().split('T')[0];

/* ── GET /api/drivers ── */
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('drivers')
            .select(`
                *,
                driver_assignments (
                    vehicle_id, is_current,
                    assigned_from, assigned_until, notes
                )
            `)
            .order('name');
        if (error) throw error;
        // attach current vehicle
        const result = (data || []).map(d => ({
            ...d,
            current_vehicle: (d.driver_assignments || []).find(a => a.is_current)?.vehicle_id || null,
        }));
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── GET /api/drivers/stats ── */
router.get('/stats', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('drivers')
            .select('status, license_expiry');
        if (error) throw error;
        const now   = new Date();
        const in30  = new Date(now); in30.setDate(now.getDate() + 30);
        const rows  = data || [];
        res.json({
            total:      rows.length,
            active:     rows.filter(d => d.status === 'active').length,
            inactive:   rows.filter(d => ['inactive', 'suspended', 'on_leave'].includes(d.status)).length,
            expiring:   rows.filter(d => {
                const e = new Date(d.license_expiry);
                return e >= now && e <= in30;
            }).length,
            expired:    rows.filter(d => new Date(d.license_expiry) < now).length,
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── GET /api/drivers/:id ── */
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('drivers')
            .select(`
                *,
                driver_assignments (
                    id, vehicle_id, is_current,
                    assigned_from, assigned_until, notes, created_at
                )
            `)
            .eq('id', req.params.id)
            .single();
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── POST /api/drivers ── */
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('drivers')
            .insert([req.body])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── PATCH /api/drivers/:id ── */
router.patch('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('drivers')
            .update({ ...req.body, updated_at: new Date() })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── DELETE /api/drivers/:id ── */
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('drivers')
            .delete()
            .eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── POST /api/drivers/:id/assign  ── assign driver to vehicle ── */
router.post('/:id/assign', async (req, res) => {
    const driver_id  = req.params.id;
    const { vehicle_id, notes } = req.body;
    if (!vehicle_id) return res.status(400).json({ error: 'vehicle_id required' });
    try {
        const t = today();
        // end any existing current assignment for this vehicle
        await supabase
            .from('driver_assignments')
            .update({ is_current: false, assigned_until: t })
            .eq('vehicle_id', vehicle_id)
            .eq('is_current', true);
        // end any existing current assignment for this driver
        await supabase
            .from('driver_assignments')
            .update({ is_current: false, assigned_until: t })
            .eq('driver_id', driver_id)
            .eq('is_current', true);
        // create new
        const { data, error } = await supabase
            .from('driver_assignments')
            .insert([{ driver_id, vehicle_id, notes: notes || null, is_current: true, assigned_from: t }])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── PATCH /api/drivers/:id/unassign ── */
router.patch('/:id/unassign', async (req, res) => {
    try {
        const { error } = await supabase
            .from('driver_assignments')
            .update({ is_current: false, assigned_until: today() })
            .eq('driver_id', req.params.id)
            .eq('is_current', true);
        if (error) throw error;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
