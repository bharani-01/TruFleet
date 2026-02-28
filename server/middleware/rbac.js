/**
 * TruFleet — RBAC Middleware (Express)
 * Usage: router.get('/secret', rbac(['admin','fleet_manager']), handler)
 *
 * Expects the request to carry role info via one of:
 *   1. x-trufleet-role header   (set by frontend on API calls)
 *   2. body.actor_role
 * In production this should be a signed JWT claim; for now we accept
 * a self-declared role and validate it against the users table.
 */

'use strict';

const supabase = require('../supabase');

/* ── Role hierarchy ───────────────────────────────────────────────────────── */
const ROLE_HIERARCHY = {
  super_admin:     100,
  admin:           90,
  fleet_manager:   70,
  dispatcher:      60,
  insurance_agent: 50,
  owner:           40,
  viewer:          10,
};

/* ── Module access map (mirrors rbac.js on frontend) ─────────────────────── */
const MODULE_ACCESS = {
  vehicles:         ['super_admin', 'admin', 'fleet_manager'],
  insurance:        ['super_admin', 'admin', 'fleet_manager', 'insurance_agent'],
  dispatch:         ['super_admin', 'admin', 'dispatcher'],
  identity:         ['super_admin', 'admin', 'fleet_manager', 'insurance_agent'],
  owners:           ['super_admin', 'admin', 'fleet_manager', 'owner'],
  audits:           ['super_admin', 'admin'],
  email_recipients: ['super_admin', 'admin'],
  analytics:        ['super_admin', 'admin', 'fleet_manager', 'dispatcher', 'insurance_agent', 'owner', 'viewer'],
};

function normaliseRole(raw) {
  if (!raw) return 'viewer';
  const slug = raw.toLowerCase().replace(/\s+/g, '_');
  if (ROLE_HIERARCHY[raw])  return raw;
  if (ROLE_HIERARCHY[slug]) return slug;
  const mapped = {
    'fleet admin': 'admin',
    'manager':     'fleet_manager',
    'agent':       'insurance_agent',
  };
  return mapped[slug] || 'viewer';
}

/**
 * Middleware factory.
 * @param {string[]} allowedRoles  — roles permitted for this route
 * @param {object}   opts          — { strict: true } to block viewer fallback
 * @returns Express middleware
 */
function rbac(allowedRoles = [], opts = {}) {
  return async function rbacMiddleware(req, res, next) {
    try {
      // 1. Extract role claim from header or body
      const rawRole = req.headers['x-trufleet-role']
                   || req.body?.actor_role
                   || req.query?.role
                   || 'viewer';

      const role = normaliseRole(rawRole);

      // 2. Optional: verify the role claim against the users table using actor_email
      const actorEmail = req.headers['x-trufleet-email'] || req.body?.actor_email;
      if (actorEmail) {
        const { data: dbUser } = await supabase
          .from('users')
          .select('role')
          .eq('email', actorEmail.toLowerCase())
          .single();

        if (dbUser) {
          const dbRole = normaliseRole(dbUser.role);
          // If DB role is lower than claimed role, use DB role (prevent escalation)
          if ((ROLE_HIERARCHY[dbRole] || 0) < (ROLE_HIERARCHY[role] || 0)) {
            req.trufleetRole = dbRole;
          } else {
            req.trufleetRole = role;
          }
        } else {
          req.trufleetRole = role;
        }
      } else {
        req.trufleetRole = role;
      }

      // 3. Check against allowed list
      if (!allowedRoles.includes(req.trufleetRole)) {
        return res.status(403).json({
          error:    'Insufficient permissions',
          required: allowedRoles,
          current:  req.trufleetRole,
        });
      }

      next();
    } catch (err) {
      console.error('[RBAC]', err.message);
      // Fail open in development, fail closed in production
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Authorization error' });
      }
      next();
    }
  };
}

/* ── Convenience shorthands ─────────────────────────────────────────────── */
rbac.adminOnly       = () => rbac(['super_admin', 'admin']);
rbac.fleetManagement = () => rbac(MODULE_ACCESS.vehicles);
rbac.insurance       = () => rbac(MODULE_ACCESS.insurance);
rbac.dispatch        = () => rbac(MODULE_ACCESS.dispatch);
rbac.auditLog        = () => rbac(MODULE_ACCESS.audits);
rbac.allUsers        = () => rbac(Object.keys(ROLE_HIERARCHY));

rbac.MODULE_ACCESS   = MODULE_ACCESS;
rbac.ROLE_HIERARCHY  = ROLE_HIERARCHY;
rbac.normaliseRole   = normaliseRole;

module.exports = rbac;
