/**
 * TruFleet — Frontend RBAC Guard
 * Include AFTER trufleet-api.js and auth-check.js on every protected page.
 *
 * Usage:  Call  TruFleetRBAC.init('module_key')  after DOMContentLoaded.
 * The script will:
 *   1. Check the logged-in user's role vs. the module's allowed roles.
 *   2. Redirect to dashboard.html with ?access=denied if unauthorised.
 *   3. Inject a role badge into the header (.header-actions / .header-right / .user-profile).
 *   4. Dim / hide nav items whose module the user cannot access.
 */

(function () {
  'use strict';

  /* ─── Role definitions ──────────────────────────────────────────────────
   *  Hierarchy (highest → lowest):
   *    super_admin → fleet_manager → dispatcher → insurance_agent → viewer
   * ─────────────────────────────────────────────────────────────────────── */
  const ROLES = {
    super_admin:      { label: 'Super Admin',      color: '#0F172A', bg: '#E2E8F0' },
    admin:            { label: 'Admin',             color: '#1D4ED8', bg: '#DBEAFE' },
    fleet_manager:    { label: 'Fleet Manager',     color: '#065F46', bg: '#D1FAE5' },
    dispatcher:       { label: 'Dispatcher',        color: '#92400E', bg: '#FEF3C7' },
    insurance_agent:  { label: 'Insurance Agent',   color: '#6B21A8', bg: '#F3E8FF' },
    owner:            { label: 'Owner',             color: '#0E7490', bg: '#CFFAFE' },
    viewer:           { label: 'Viewer',            color: '#374151', bg: '#F3F4F6' },
  };

  /* ─── Module permission map ─────────────────────────────────────────────
   *  Key = module_key used in TruFleetRBAC.init(key)
   *  Value = array of roles that may access the page
   * ─────────────────────────────────────────────────────────────────────── */
  const MODULE_ACCESS = {
    dashboard:          ['super_admin', 'admin', 'fleet_manager', 'dispatcher', 'insurance_agent', 'owner', 'viewer'],
    vehicle_management: ['super_admin', 'admin', 'fleet_manager'],
    insurance_monitor:  ['super_admin', 'admin', 'fleet_manager', 'insurance_agent'],
    dispatch:           ['super_admin', 'admin', 'dispatcher'],
    identity:           ['super_admin', 'admin', 'fleet_manager', 'insurance_agent'],
    owner:              ['super_admin', 'admin', 'fleet_manager', 'owner'],
    audits:             ['super_admin', 'admin'],
    email_recipients:   ['super_admin', 'admin'],
    home:               null,   // public, no guard
  };

  /* ─── Nav items visibility map ──────────────────────────────────────────
   *  Maps href fragment → module_key so we can grey-out inaccessible nav links
   * ─────────────────────────────────────────────────────────────────────── */
  const NAV_MODULES = {
    'vehicle_management.html': 'vehicle_management',
    'insurance_monitor.html':  'insurance_monitor',
    'dispatch.html':           'dispatch',
    'identity.html':           'identity',
    'owner.html':              'owner',
    'audits.html':             'audits',
    'email_recipients.html':   'email_recipients',
    'dashboard.html':          'dashboard',
  };

  /* ─── Helpers ────────────────────────────────────────────────────────── */
  function getUser() {
    try { return JSON.parse(localStorage.getItem('trufleet_user') || 'null'); }
    catch (_) { return null; }
  }

  function normaliseRole(raw) {
    if (!raw) return 'viewer';
    const mapped = {
      'Fleet Admin': 'admin',
      'Admin':       'admin',
      'Manager':     'fleet_manager',
      'Dispatcher':  'dispatcher',
      'Agent':       'insurance_agent',
      'Viewer':      'viewer',
    };
    // Try exact key first, then mapping, then lowercase slug
    const slug = raw.toLowerCase().replace(/\s+/g, '_');
    if (ROLES[raw])  return raw;
    if (ROLES[slug]) return slug;
    return mapped[raw] || 'viewer';
  }

  function canAccess(moduleKey, role) {
    const allowed = MODULE_ACCESS[moduleKey];
    if (!allowed) return true; // null = public
    return allowed.includes(role);
  }

  /* ─── Role badge injection ───────────────────────────────────────────── */
  function injectRoleBadge(user) {
    const role   = normaliseRole(user?.role);
    const def    = ROLES[role]  || ROLES.viewer;
    const badge  = document.createElement('span');
    badge.id     = 'rbac-role-badge';
    badge.style.cssText = [
      `background:${def.bg}`,
      `color:${def.color}`,
      `border:1px solid ${def.color}22`,
      'padding:3px 12px',
      'border-radius:20px',
      'font-size:0.75rem',
      'font-weight:600',
      'letter-spacing:0.02em',
      'white-space:nowrap',
      'display:inline-flex',
      'align-items:center',
      'gap:5px',
    ].join(';');
    badge.innerHTML = `<i class="ri-shield-user-line" style="font-size:0.85rem;"></i>${def.label}`;

    // Try common header action containers in priority order
    const targets = [
      '.header-actions',
      '.header-right',
      '.user-profile',
      'header',
    ];
    for (const sel of targets) {
      const el = document.querySelector(sel);
      if (el) {
        // Insert before last child (avatar) or append
        const first = el.firstChild;
        if (first) el.insertBefore(badge, first);
        else el.appendChild(badge);
        break;
      }
    }
  }

  /* ─── Nav items ─────────────────────────────────────────────────────── */
  function applyNavAccess(role) {
    const navItems = document.querySelectorAll('.nav-item[href]');
    navItems.forEach(link => {
      const href = link.getAttribute('href') || '';
      const file = href.split('/').pop();
      const mod  = NAV_MODULES[file];
      if (mod && !canAccess(mod, role)) {
        link.style.opacity     = '0.35';
        link.style.pointerEvents = 'none';
        link.style.cursor      = 'not-allowed';
        link.title             = `Access restricted — requires: ${(MODULE_ACCESS[mod] || []).join(', ')}`;
        // Add lock icon
        const lockI    = document.createElement('i');
        lockI.className = 'ri-lock-line';
        lockI.style.cssText = 'font-size:0.75rem;margin-left:auto;opacity:0.6;';
        link.appendChild(lockI);
      }
    });
  }

  /* ─── Access denied toast ────────────────────────────────────────────── */
  function showDeniedBanner(moduleKey) {
    const banner   = document.createElement('div');
    banner.id      = 'rbac-denied-banner';
    banner.style.cssText = [
      'position:fixed',
      'top:80px',
      'left:50%',
      'transform:translateX(-50%)',
      'z-index:9999',
      'background:#FEF2F2',
      'color:#991B1B',
      'border:1px solid #FECACA',
      'border-radius:10px',
      'padding:12px 24px',
      'font-size:0.875rem',
      'font-weight:500',
      'display:flex',
      'align-items:center',
      'gap:10px',
      'box-shadow:0 10px 30px rgba(239,68,68,.15)',
      'pointer-events:none',
    ].join(';');
    const allowed = (MODULE_ACCESS[moduleKey] || []).map(r => (ROLES[r]||{label:r}).label).join(', ');
    banner.innerHTML = `<i class="ri-lock-2-line" style="font-size:1.1rem;"></i>
      <span>You don't have permission to access this module.<br>
      <small style="opacity:.8;">Allowed roles: ${allowed}</small></span>`;
    document.body.appendChild(banner);
    setTimeout(() => {
      banner.style.transition = 'opacity .5s';
      banner.style.opacity = '0';
      setTimeout(() => {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 500);
    }, 4500);
  }

  /* ─── Public API ─────────────────────────────────────────────────────── */
  window.TruFleetRBAC = {

    /**
     * Call at DOMContentLoaded: TruFleetRBAC.init('module_key')
     * @param {string} moduleKey  — key from MODULE_ACCESS map
     */
    init(moduleKey) {
      const user = getUser();
      if (!user) {
        // auth-check.js already handles redirect; bail silently
        return;
      }

      const role = normaliseRole(user.role);

      // Store normalised role back on user object
      user._normRole = role;
      localStorage.setItem('trufleet_user', JSON.stringify(user));

      // Inject role badge
      injectRoleBadge(user);

      // Apply nav visibility
      applyNavAccess(role);

      // Check module access
      if (moduleKey && !canAccess(moduleKey, role)) {
        // Show denied state, then redirect to dashboard
        showDeniedBanner(moduleKey);
        setTimeout(() => {
          window.location.href = 'dashboard.html?access=denied&module=' + encodeURIComponent(moduleKey);
        }, 3000);
        return false;
      }

      return true;
    },

    /** Returns the current user's normalised role string */
    getRole() {
      const user = getUser();
      return user ? normaliseRole(user.role) : 'viewer';
    },

    /** Returns true if current user can access the given module */
    can(moduleKey) {
      return canAccess(moduleKey, this.getRole());
    },

    /** Returns the role label for display */
    getRoleLabel() {
      const role = this.getRole();
      return (ROLES[role] || ROLES.viewer).label;
    },

    ROLES,
    MODULE_ACCESS,
  };

})();
