/**
 * TruFleet — /api/analytics
 * Fleet analytics & aggregated statistics.
 */

'use strict';

const express  = require('express');
const supabase = require('../supabase');

const router = express.Router();

/* ── GET /api/analytics/overview ── */
// Returns full fleet overview with breakdowns
router.get('/overview', async (req, res) => {
  try {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*');

    if (error) throw error;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const total   = vehicles.length;
    const active  = vehicles.filter(v => v.status === 'Active').length;
    const blocked = vehicles.filter(v => v.status === 'Blocked').length;

    // Insurance analytics
    const expSoon   = vehicles.filter(v => {
      const d = daysUntil(v.insurance_expiry);
      return d >= 0 && d <= 30;
    }).length;
    const expired   = vehicles.filter(v => daysUntil(v.insurance_expiry) < 0).length;
    const compliant = vehicles.filter(v => daysUntil(v.insurance_expiry) > 30).length;

    // Provider breakdown
    const providerMap = {};
    vehicles.forEach(v => {
      const p = v.insurance_provider || 'Unknown';
      providerMap[p] = (providerMap[p] || 0) + 1;
    });
    const providerBreakdown = Object.entries(providerMap)
      .map(([provider, count]) => ({ provider, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);

    // Make breakdown
    const makeMap = {};
    vehicles.forEach(v => {
      const m = v.make || 'Unknown';
      makeMap[m] = (makeMap[m] || 0) + 1;
    });
    const makeBreakdown = Object.entries(makeMap)
      .map(([make, count]) => ({ make, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);

    // Type breakdown
    const typeMap = {};
    vehicles.forEach(v => {
      const t = v.type || 'Unknown';
      typeMap[t] = (typeMap[t] || 0) + 1;
    });
    const typeBreakdown = Object.entries(typeMap)
      .map(([type, count]) => ({ type, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);

    // Year distribution
    const yearMap = {};
    vehicles.forEach(v => {
      const y = v.year || 'Unknown';
      yearMap[y] = (yearMap[y] || 0) + 1;
    });
    const yearDistribution = Object.entries(yearMap)
      .map(([year, count]) => ({ year: parseInt(year) || year, count }))
      .sort((a, b) => (b.year || 0) - (a.year || 0));

    // Risk distribution
    const riskMap = { critical: 0, warning: 0, safe: 0 };
    vehicles.forEach(v => {
      const d = daysUntil(v.insurance_expiry);
      if (d < 0) riskMap.critical++;
      else if (d <= 7) riskMap.warning++;
      else riskMap.safe++;
    });

    // Average fleet age
    const currentYear = new Date().getFullYear();
    const avgAge = total > 0
      ? Math.round((vehicles.reduce((sum, v) => sum + (currentYear - (v.year || currentYear)), 0) / total) * 10) / 10
      : 0;

    res.json({
      fleet: { total, active, blocked, utilization_pct: total > 0 ? Math.round((active / total) * 100) : 0 },
      insurance: {
        compliant,
        expiring_soon: expSoon,
        expired,
        compliance_pct: total > 0 ? Math.round((compliant / total) * 100) : 0,
      },
      risk: riskMap,
      providers: providerBreakdown,
      makes: makeBreakdown,
      types: typeBreakdown,
      years: yearDistribution,
      avg_fleet_age: avgAge,
    });
  } catch (err) {
    console.error('[GET /api/analytics/overview]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/analytics/activity ── */
// Returns recent activity summary  (log counts grouped by date, type)
router.get('/activity', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .gte('timestamp', since.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;

    // Group by date
    const dailyMap = {};
    const typeMap = { AUTH: 0, ADMIN: 0, SYSTEM: 0 };
    (logs || []).forEach(log => {
      const day = (log.timestamp || '').slice(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + 1;
      const t = (log.type || 'SYSTEM').toUpperCase();
      typeMap[t] = (typeMap[t] || 0) + 1;
    });

    const daily = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      total_events: (logs || []).length,
      by_type: typeMap,
      daily,
    });
  } catch (err) {
    console.error('[GET /api/analytics/activity]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/analytics/expiry-forecast ── */
// Returns upcoming expirations grouped by week for the next 90 days
router.get('/expiry-forecast', async (req, res) => {
  try {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('id, make, type, owner, insurance_expiry, insurance_provider')
      .order('insurance_expiry', { ascending: true });

    if (error) throw error;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const limit = new Date(now);
    limit.setDate(limit.getDate() + 90);

    const upcoming = (vehicles || []).filter(v => {
      if (!v.insurance_expiry) return false;
      const d = new Date(v.insurance_expiry);
      return d >= now && d <= limit;
    });

    // Group by week
    const weeks = {};
    upcoming.forEach(v => {
      const d = new Date(v.insurance_expiry);
      const weekStart = new Date(d);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weeks[key]) weeks[key] = [];
      weeks[key].push(v);
    });

    const forecast = Object.entries(weeks)
      .map(([week_start, vehicles]) => ({ week_start, count: vehicles.length, vehicles }))
      .sort((a, b) => a.week_start.localeCompare(b.week_start));

    res.json({ total_upcoming: upcoming.length, forecast });
  } catch (err) {
    console.error('[GET /api/analytics/expiry-forecast]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── Helper ── */
function daysUntil(isoDate) {
  if (!isoDate) return 9999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(isoDate) - today) / (1000 * 60 * 60 * 24));
}

module.exports = router;
