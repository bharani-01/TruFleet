/**
 * TruFleet Theme System
 * Loads saved theme on page startup, provides TruFleetTheme API
 * Include as the FIRST script on every protected page.
 */
(function () {
    /* ── Apply saved theme immediately (before paint) ── */
    const saved = localStorage.getItem('trufleet_theme') || 'light';
    if (saved === 'dark') document.documentElement.classList.add('dark');

    /* ── Dark-mode CSS overrides (CSS variables + targeted selectors) ── */
    const style = document.createElement('style');
    style.id = 'trufleet-theme-css';
    style.textContent = `
        /* ===== DARK THEME ===== */
        html.dark {
            --bg-body:    #0F172A !important;
            --bg-surface: #1E293B !important;
            --bg-sidebar: #020817 !important;
            --text-primary:   #F1F5F9 !important;
            --text-secondary: #94A3B8 !important;
            --text-tertiary:  #64748B !important;
            --border-light:   #334155 !important;
            --shadow-card:    0 1px 3px rgba(0,0,0,0.3) !important;
        }

        /* Body & Layout */
        html.dark body            { background-color: var(--bg-body) !important; color: var(--text-primary) !important; }
        html.dark .main-content   { background: var(--bg-body) !important; }
        html.dark .sidebar        { background: var(--bg-sidebar) !important; border-right: 1px solid #1E293B; }

        /* Headers */
        html.dark .top-bar,
        html.dark .settings-header,
        html.dark .fleet-header,
        html.dark .header-bg      { background: var(--bg-body) !important; border-color: #334155 !important; }

        /* Cards / Surfaces */
        html.dark .card,
        html.dark .detail-card,
        html.dark .hud-card,
        html.dark .kpi-card,
        html.dark .chart-card,
        html.dark .id-card,
        html.dark .policy-row,
        html.dark .log-entry,
        html.dark .vehicle-row,
        html.dark .renewal-modal  {
            background: var(--bg-surface) !important;
            border-color: #334155 !important;
            color: var(--text-primary) !important;
        }

        /* Tables */
        html.dark .fleet-table thead th { background: #1E293B !important; color: var(--text-secondary) !important; border-color: #334155 !important; }
        html.dark .fleet-table tbody td { border-color: #1E293B !important; color: var(--text-primary) !important; }
        html.dark .fleet-table tbody tr:hover { background: #1E293B !important; }

        /* Settings panels */
        html.dark .settings-nav   { background: #0F172A !important; border-color: #334155 !important; }
        html.dark .settings-link  { color: var(--text-secondary) !important; }
        html.dark .settings-link:hover,
        html.dark .settings-link.active { background: #1E293B !important; color: #F1F5F9 !important; }

        /* Form inputs */
        html.dark .input-field,
        html.dark select,
        html.dark textarea        {
            background: #1E293B !important;
            color: var(--text-primary) !important;
            border-color: #334155 !important;
        }
        html.dark .input-field:focus { border-color: #3B82F6 !important; }

        /* Misc surfaces */
        html.dark .filter-strip   { background: var(--bg-body) !important; border-color: #334155 !important; }
        html.dark .tab            { color: var(--text-secondary) !important; }
        html.dark .tab.active     { background: #1E293B !important; color: #F1F5F9 !important; }
        html.dark .search-input   { background: #1E293B !important; border-color: #334155 !important; }
        html.dark .search-input input { background: transparent !important; color: var(--text-primary) !important; }
        html.dark .vehicle-drawer { background: #1E293B !important; border-color: #334155 !important; }
        html.dark .drawer-section { border-color: #334155 !important; }
        html.dark .modal-card,
        html.dark .add-modal .modal-content { background: var(--bg-surface) !important; color: var(--text-primary) !important; }
        html.dark .modal-field label { color: var(--text-secondary) !important; }
        html.dark .api-box        { background: #1E293B !important; border-color: #334155 !important; }
        html.dark .ledger-container { background: var(--bg-body) !important; }
        html.dark .section-header p,
        html.dark .hud-sub        { color: var(--text-tertiary) !important; }

        /* Notification panel */
        html.dark #notifPanel     { background: #1E293B !important; }

        /* Account wrapper */
        html.dark .account-wrapper { background: transparent !important; }

        /* Buttons (keep primary buttons visible) */
        html.dark .btn-save,
        html.dark .btn-primary:not([style*="background"]) { background: #3B82F6 !important; color: white !important; }
    `;
    document.head.appendChild(style);

    /* ── Public API ── */
    window.TruFleetTheme = {
        /**
         * Toggle between dark and light mode.
         * Returns true if now dark.
         */
        toggle: function () {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('trufleet_theme', isDark ? 'dark' : 'light');
            return isDark;
        },

        /** Returns true if current theme is dark */
        isDark: function () {
            return document.documentElement.classList.contains('dark');
        },

        /** Explicitly set theme */
        set: function (theme) {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            localStorage.setItem('trufleet_theme', theme);
        }
    };
})();
