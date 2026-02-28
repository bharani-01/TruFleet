/**
 * TruFleet — /api/logs
 * Audit log operations via Supabase.
 */

'use strict';

const express  = require('express');
const supabase = require('../supabase');

const router = express.Router();
const TABLE  = 'audit_logs';

/* ── GET /api/logs ── */
// Optional: ?limit=50&type=AUTH|ADMIN|SYSTEM&search=<string>
router.get('/', async (req, res) => {
  try {
    const { limit = 100, type, search } = req.query;

    let query = supabase
      .from(TABLE)
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit));

    if (type) {
      query = query.eq('type', type.toUpperCase());
    }

    const { data, error } = await query;
    if (error) throw error;

    let results = data;

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(log =>
        (log.entity_id   || '').toLowerCase().includes(q) ||
        (log.description || '').toLowerCase().includes(q) ||
        (log.detail      || '').toLowerCase().includes(q) ||
        (log.id          || '').toLowerCase().includes(q)
      );
    }

    res.json(results);
  } catch (err) {
    console.error('[GET /api/logs]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/logs ── */
router.post('/', async (req, res) => {
  try {
    const { id, type, entity_id, description, status, detail, json_data } = req.body;

    if (!entity_id || !description) {
      return res.status(400).json({ error: 'entity_id and description are required' });
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert([{
        id:          id || `EVT_${Date.now()}`,
        type:        (type || 'SYSTEM').toUpperCase(),
        entity_id,
        description,
        status:      (status || 'SUCCESS').toUpperCase(),
        detail:      detail || null,
        json_data:   json_data || null,
        timestamp:   new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('[POST /api/logs]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
