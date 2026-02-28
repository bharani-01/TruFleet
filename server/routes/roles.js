/**
 * TruFleet — Roles API
 * Manage user roles and permissions
 *
 * Endpoints
 *   GET  /api/roles                  — list all defined roles + descriptions
 *   GET  /api/roles/users            — list all users with their roles
 *   GET  /api/roles/matrix           — full module-role permission matrix
 *   POST /api/roles/assign           — assign role to a user
 *   GET  /api/roles/check            — check if a user can access a module
 */

'use strict';

const express  = require('express');
const router   = express.Router();
const supabase = require('../supabase');
const rbac     = require('../middleware/rbac');

/* ── Role metadata ───────────────────────────────────────────────────────── */
const ROLE_DEFINITIONS = [
  {
    role:        'super_admin',
    label:       'Super Admin',
    description: 'Unrestricted access to all modules, settings, and user management.',
    color:       '#0F172A',
    bg:          '#E2E8F0',
    level:       100,
    modules:     ['All'],
  },
  {
    role:        'admin',
    label:       'Admin',
    description: 'Full access to all operational modules. Can manage email recipients and view audit logs.',
    color:       '#1D4ED8',
    bg:          '#DBEAFE',
    level:       90,
    modules:     ['Dashboard', 'Fleet Management', 'Insurance', 'Dispatch', 'Identity', 'Owner Portal', 'Audit Log', 'Email Config'],
  },
  {
    role:        'fleet_manager',
    label:       'Fleet Manager',
    description: 'Manages the vehicle registry, owner profiles, and identity verification.',
    color:       '#065F46',
    bg:          '#D1FAE5',
    level:       70,
    modules:     ['Dashboard', 'Fleet Management', 'Insurance Monitor', 'Identity', 'Owner Portal'],
  },
  {
    role:        'dispatcher',
    label:       'Dispatcher',
    description: 'Operates the dispatch control system to authorise or deny vehicle movements.',
    color:       '#92400E',
    bg:          '#FEF3C7',
    level:       60,
    modules:     ['Dashboard', 'Dispatch Control'],
  },
  {
    role:        'insurance_agent',
    label:       'Insurance Agent',
    description: 'Manages insurance policies, views insurance monitor and identity records.',
    color:       '#6B21A8',
    bg:          '#F3E8FF',
    level:       50,
    modules:     ['Dashboard', 'Insurance Monitor', 'Identity'],
  },
  {
    role:        'owner',
    label:       'Owner',
    description: 'Access to own fleet\'s Owner Portal and dashboard summary.',
    color:       '#0E7490',
    bg:          '#CFFAFE',
    level:       40,
    modules:     ['Dashboard', 'Owner Portal'],
  },
  {
    role:        'viewer',
    label:       'Viewer',
    description: 'Read-only access to the dashboard only.',
    color:       '#374151',
    bg:          '#F3F4F6',
    level:       10,
    modules:     ['Dashboard'],
  },
];

/* ── GET /api/roles ───────────────────────────────────────────────────────── */
router.get('/', (_req, res) => {
  res.json(ROLE_DEFINITIONS);
});

/* ── GET /api/roles/matrix ────────────────────────────────────────────────── */
router.get('/matrix', (_req, res) => {
  res.json({
    modules: [
      { module: 'dashboard',          label: 'Dashboard',           roles: ['super_admin','admin','fleet_manager','dispatcher','insurance_agent','owner','viewer'] },
      { module: 'vehicle_management', label: 'Fleet Management',    roles: ['super_admin','admin','fleet_manager'] },
      { module: 'insurance_monitor',  label: 'Insurance Monitor',   roles: ['super_admin','admin','fleet_manager','insurance_agent'] },
      { module: 'dispatch',           label: 'Dispatch Control',    roles: ['super_admin','admin','dispatcher'] },
      { module: 'identity',           label: 'Identity Management', roles: ['super_admin','admin','fleet_manager','insurance_agent'] },
      { module: 'owner',              label: 'Owner Portal',        roles: ['super_admin','admin','fleet_manager','owner'] },
      { module: 'audits',             label: 'Audit Log',           roles: ['super_admin','admin'] },
      { module: 'email_recipients',   label: 'Email Config',        roles: ['super_admin','admin'] },
    ],
    roles: ROLE_DEFINITIONS.map(r => ({ role: r.role, label: r.label, level: r.level, color: r.color, bg: r.bg })),
  });
});

/* ── GET /api/roles/users ─────────────────────────────────────────────────── */
router.get('/users', rbac.adminOnly(), async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, initials, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const enriched = (data || []).map(u => {
      const roleDef = ROLE_DEFINITIONS.find(r => r.role === rbac.normaliseRole(u.role)) || ROLE_DEFINITIONS.at(-1);
      return { ...u, role_label: roleDef.label, role_color: roleDef.color, role_bg: roleDef.bg };
    });

    res.json(enriched);
  } catch (err) {
    console.error('[GET /api/roles/users]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/roles/assign ───────────────────────────────────────────────── */
router.post('/assign', rbac.adminOnly(), async (req, res) => {
  try {
    const { user_id, role, actor_email } = req.body;
    if (!user_id || !role) return res.status(400).json({ error: 'user_id and role are required' });

    const validRoles = ROLE_DEFINITIONS.map(r => r.role);
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', user_id)
      .select('id, name, email, role')
      .single();

    if (error) throw error;
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    // Audit log
    await supabase.from('audit_logs').insert([{
      id:          `EVT_${Date.now()}`,
      action:      'ROLE_ASSIGNED',
      entity_id:   user_id,
      description: `Role "${role}" assigned to ${updatedUser.email}`,
      status:      'SUCCESS',
      severity:    'MEDIUM',
      detail:      `Assigned by: ${actor_email || 'admin'}`,
      actor:       actor_email || 'admin',
      module:      'RBAC',
      details:     { new_role: role, user_email: updatedUser.email },
      timestamp:   new Date().toISOString(),
    }]);

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('[POST /api/roles/assign]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/roles/check?email=x&module=y ───────────────────────────────── */
router.get('/check', async (req, res) => {
  try {
    const { email, module: mod } = req.query;
    if (!email || !mod) return res.status(400).json({ error: 'email and module are required' });

    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('email', email.toLowerCase())
      .single();

    if (!user) return res.status(404).json({ error: 'User not found' });

    const normRole   = rbac.normaliseRole(user.role);
    const allowed    = rbac.MODULE_ACCESS[mod] || [];
    const canAccess  = allowed.includes(normRole);

    res.json({
      email:    user.email,
      role:     normRole,
      module:   mod,
      allowed:  canAccess,
      required: allowed,
    });
  } catch (err) {
    console.error('[GET /api/roles/check]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
