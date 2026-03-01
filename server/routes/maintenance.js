'use strict';
/**
 * TruFleet — Maintenance Tracking API
 * Base: /api/maintenance
 */

const express  = require('express');
const router   = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/* ── GET /api/maintenance ── */
router.get('/', async (req, res) => {
    try {
        let q = supabase
            .from('maintenance_records')
            .select('*')
            .order('service_date', { ascending: false });

        if (req.query.vehicle_id) q = q.eq('vehicle_id', req.query.vehicle_id);
        if (req.query.status)     q = q.eq('status', req.query.status);
        if (req.query.type)       q = q.eq('maintenance_type', req.query.type);

        const { data, error } = await q;
        if (error) throw error;
        res.json(data || []);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── GET /api/maintenance/stats ── */
router.get('/stats', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('maintenance_records')
            .select('status, cost, service_date, next_service_date');
        if (error) throw error;

        const rows     = data || [];
        const todayStr = new Date().toISOString().split('T')[0];
        const in7      = new Date(); in7.setDate(in7.getDate() + 7);
        const in7str   = in7.toISOString().split('T')[0];
        const thisYear = new Date().getFullYear();

        const totalCost = rows
            .filter(r => r.status === 'completed' && new Date(r.service_date).getFullYear() === thisYear)
            .reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0);

        res.json({
            scheduled:   rows.filter(r => r.status === 'scheduled').length,
            in_progress: rows.filter(r => r.status === 'in_progress').length,
            completed:   rows.filter(r => r.status === 'completed').length,
            overdue:     rows.filter(r => r.status === 'scheduled' && r.service_date < todayStr).length,
            due_soon:    rows.filter(r =>
                r.status === 'scheduled' &&
                r.service_date >= todayStr &&
                r.service_date <= in7str
            ).length,
            total_cost_ytd: totalCost,
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── GET /api/maintenance/:id ── */
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('maintenance_records')
            .select('*')
            .eq('id', req.params.id)
            .single();
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── POST /api/maintenance ── */
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('maintenance_records')
            .insert([req.body])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── PATCH /api/maintenance/:id ── */
router.patch('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('maintenance_records')
            .update({ ...req.body, updated_at: new Date() })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── PATCH /api/maintenance/:id/status ── */
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    const allowed = ['scheduled', 'in_progress', 'completed', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    try {
        const { data, error } = await supabase
            .from('maintenance_records')
            .update({ status, updated_at: new Date() })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── DELETE /api/maintenance/:id ── */
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('maintenance_records')
            .delete()
            .eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── GET /api/maintenance/vehicle/:vid ── all records for one vehicle ── */
router.get('/vehicle/:vid', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('maintenance_records')
            .select('*')
            .eq('vehicle_id', req.params.vid)
            .order('service_date', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
