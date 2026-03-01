'use strict';
/**
 * TruFleet — Vehicle Documents API
 * Base: /api/documents
 */

const express  = require('express');
const router   = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const DOC_LABELS = {
    rc:              'Registration Certificate',
    puc:             'PUC Certificate',
    fitness:         'Fitness Certificate',
    permit_national: 'National Permit',
    permit_state:    'State Permit',
    road_tax:        'Road Tax',
    other:           'Other',
};

/* ── GET /api/documents ── with optional ?vehicle_id=&status=&expiring_days= */
router.get('/', async (req, res) => {
    try {
        let q = supabase
            .from('vehicle_documents')
            .select('*')
            .order('expiry_date', { ascending: true });

        if (req.query.vehicle_id) q = q.eq('vehicle_id', req.query.vehicle_id);
        if (req.query.status)     q = q.eq('status', req.query.status);
        if (req.query.doc_type)   q = q.eq('doc_type', req.query.doc_type);

        let { data, error } = await q;
        if (error) throw error;

        // filter expiring within N days
        if (req.query.expiring_days) {
            const days   = parseInt(req.query.expiring_days) || 30;
            const cutoff = new Date(); cutoff.setDate(cutoff.getDate() + days);
            const cutStr = cutoff.toISOString().split('T')[0];
            const todStr = new Date().toISOString().split('T')[0];
            data = data.filter(d =>
                d.status === 'active' &&
                d.expiry_date &&
                d.expiry_date >= todStr &&
                d.expiry_date <= cutStr
            );
        }
        res.json(data || []);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── GET /api/documents/stats ── */
router.get('/stats', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vehicle_documents')
            .select('status, expiry_date, doc_type');
        if (error) throw error;

        const rows   = data || [];
        const todStr = new Date().toISOString().split('T')[0];
        const in30   = new Date(); in30.setDate(in30.getDate() + 30);
        const in30s  = in30.toISOString().split('T')[0];

        res.json({
            total:    rows.length,
            active:   rows.filter(r => r.status === 'active').length,
            expired:  rows.filter(r => r.status === 'expired' || (r.status === 'active' && r.expiry_date && r.expiry_date < todStr)).length,
            expiring: rows.filter(r =>
                r.status === 'active' &&
                r.expiry_date &&
                r.expiry_date >= todStr &&
                r.expiry_date <= in30s
            ).length,
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── GET /api/documents/:id ── */
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vehicle_documents')
            .select('*')
            .eq('id', req.params.id)
            .single();
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── POST /api/documents ── */
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vehicle_documents')
            .insert([req.body])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── PATCH /api/documents/:id ── */
router.patch('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vehicle_documents')
            .update({ ...req.body, updated_at: new Date() })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── DELETE /api/documents/:id ── */
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('vehicle_documents')
            .delete()
            .eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
