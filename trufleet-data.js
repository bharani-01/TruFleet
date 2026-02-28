/**
 * TruFleet — Shared Data Layer
 * localStorage-backed data model. Single source of truth for all pages.
 * Swap this module for real API calls when backend is ready.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
   * Default seed data — loaded only on first visit
   * ───────────────────────────────────────────── */
  const SEED_VEHICLES = [
    {
      id: 'TN-45-AB-1234',
      make: 'Volvo FH16',
      type: 'Heavy Commercial',
      vin: 'MAT-894723-XJ9',
      engineNo: 'ENG-84738292',
      year: 2023,
      owner: 'John Doe',
      ownerInitials: 'JD',
      ownerColor: '#3B82F6',
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=100',
      insuranceProvider: 'TATA AIG',
      policyNumber: 'POL-TATA-112233',
      insuranceExpiry: '2026-11-12',
    },
    {
      id: 'KA-05-CD-5678',
      make: 'Tata Prima',
      type: 'Heavy Commercial',
      vin: 'TAT-112233-PL0',
      engineNo: 'ENG-11223344',
      year: 2021,
      owner: 'Rahul Lal',
      ownerInitials: 'RL',
      ownerColor: '#F59E0B',
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=100',
      insuranceProvider: 'HDFC ERGO',
      policyNumber: 'POL-HDFC-772233',
      insuranceExpiry: '2026-03-04',
    },
    {
      id: 'MH-12-EF-9012',
      make: 'Ashok Leyland',
      type: 'Light Truck',
      vin: 'ASH-998877-QQ2',
      engineNo: 'ENG-99887766',
      year: 2020,
      owner: 'Sarah Mehta',
      ownerInitials: 'SM',
      ownerColor: '#EF4444',
      status: 'Blocked',
      photo: 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&q=80&w=100',
      insuranceProvider: 'ICICI Lombard',
      policyNumber: 'POL-ICICI-998811',
      insuranceExpiry: '2026-02-10',
    },
    {
      id: 'AP-12-XX-9988',
      make: 'Eicher Pro 6031',
      type: 'Medium Commercial',
      vin: 'EIC-445566-RF3',
      engineNo: 'ENG-44556677',
      year: 2022,
      owner: 'Priya Sharma',
      ownerInitials: 'PS',
      ownerColor: '#10B981',
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=100',
      insuranceProvider: 'Allianz',
      policyNumber: 'POL-ALLI-445566',
      insuranceExpiry: '2026-09-15',
    },
    {
      id: 'DL-01-ZZ-3344',
      make: 'BharatBenz 2523',
      type: 'Heavy Commercial',
      vin: 'BHB-334455-KK9',
      engineNo: 'ENG-33445566',
      year: 2023,
      owner: 'Arjun Verma',
      ownerInitials: 'AV',
      ownerColor: '#8B5CF6',
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=100',
      insuranceProvider: 'HDFC ERGO',
      policyNumber: 'POL-HDFC-334455',
      insuranceExpiry: '2027-01-20',
    },
    {
      id: 'RJ-14-MN-7722',
      make: 'Mahindra Blazo',
      type: 'Medium Commercial',
      vin: 'MAH-772233-TT1',
      engineNo: 'ENG-77223311',
      year: 2021,
      owner: 'Meena Gupta',
      ownerInitials: 'MG',
      ownerColor: '#F97316',
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=100',
      insuranceProvider: 'TATA AIG',
      policyNumber: 'POL-TATA-772233',
      insuranceExpiry: '2026-03-01',
    },
    {
      id: 'GJ-05-PQ-5511',
      make: 'Volvo FE',
      type: 'Light Truck',
      vin: 'VOL-551122-GG5',
      engineNo: 'ENG-55112233',
      year: 2022,
      owner: 'Ravi Joshi',
      ownerInitials: 'RJ',
      ownerColor: '#0EA5E9',
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&q=80&w=100',
      insuranceProvider: 'ICICI Lombard',
      policyNumber: 'POL-ICICI-551122',
      insuranceExpiry: '2026-08-30',
    },
    {
      id: 'TN-33-GH-4321',
      make: 'Tata LPT 3118',
      type: 'Heavy Commercial',
      vin: 'TAT-432100-WX7',
      engineNo: 'ENG-43210099',
      year: 2020,
      owner: 'David Cruz',
      ownerInitials: 'DC',
      ownerColor: '#64748B',
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=100',
      insuranceProvider: 'HDFC ERGO',
      policyNumber: 'POL-HDFC-432100',
      insuranceExpiry: '2026-03-05',
    },
    {
      id: 'MH-04-TS-9900',
      make: 'Scania R450',
      type: 'Heavy Commercial',
      vin: 'SCA-990011-BB3',
      engineNo: 'ENG-99001122',
      year: 2024,
      owner: 'Fatima Khan',
      ownerInitials: 'FK',
      ownerColor: '#EC4899',
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=100',
      insuranceProvider: 'Allianz',
      policyNumber: 'POL-ALLI-990011',
      insuranceExpiry: '2027-06-14',
    },
    {
      id: 'KL-07-BB-1100',
      make: 'Ashok Leyland U-Truck',
      type: 'Light Truck',
      vin: 'ASH-110099-ZZ6',
      engineNo: 'ENG-11009988',
      year: 2019,
      owner: 'Thomas Roy',
      ownerInitials: 'TR',
      ownerColor: '#14B8A6',
      status: 'Blocked',
      photo: 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&q=80&w=100',
      insuranceProvider: 'ICICI Lombard',
      policyNumber: 'POL-ICICI-110099',
      insuranceExpiry: '2026-01-15',
    },
  ];

  const SEED_LOGS = [
    {
      id: 'TXN_8849202',
      type: 'AUTH',
      timestamp: '2026-02-28T14:32:05.842Z',
      entityId: 'TN-45-AB-1234',
      description: 'Dispatch Authorization Request',
      status: 'AUTHORIZED',
      detail: 'Key Verified',
      json: { transaction_id: 'TXN_8849202', auth_token: 'sha256:a7f...9c2', latency_ms: 42, checks: { insurance: true, registration: true } },
    },
    {
      id: 'TXN_8849201',
      type: 'AUTH',
      timestamp: '2026-02-28T14:31:42.110Z',
      entityId: 'KA-05-CD-5678',
      description: 'Dispatch Authorization Request',
      status: 'DENIED',
      detail: 'Insurance Expired',
      json: { transaction_id: 'TXN_8849201', error_code: 'INS_EXP_001', policy_expiry: '2026-02-25', block_action: true },
    },
    {
      id: 'CRON_INS_SYNC',
      type: 'SYSTEM',
      timestamp: '2026-02-28T14:28:10.005Z',
      entityId: 'SYSTEM',
      description: 'Automated Insurance Sync',
      status: 'COMPLETE',
      detail: 'Updated 14 records',
      json: { job_id: 'CRON_INS_SYNC', provider: 'HDFC_API', records_processed: 1250, records_updated: 14 },
    },
    {
      id: 'EVT_ADMIN_4492',
      type: 'ADMIN',
      timestamp: '2026-02-28T14:15:33.912Z',
      entityId: 'ADMIN_CO',
      description: 'Manual Vehicle Block',
      status: 'SUCCESS',
      detail: 'User Override',
      json: { target_id: 'MH-12-EF-9012', reason: 'Pending investigation', admin_id: 'U_4492' },
    },
  ];

  const SEED_USER = {
    name: 'Chief Officer',
    initials: 'CO',
    role: 'Fleet Admin',
    email: 'admin@trufleet.com',
  };

  /* ─────────────────────────────────────────────
   * Storage keys
   * ───────────────────────────────────────────── */
  const KEY_VEHICLES = 'trufleet_vehicles';
  const KEY_LOGS = 'trufleet_logs';
  const KEY_USER = 'trufleet_user';

  /* ─────────────────────────────────────────────
   * Init — seed if first visit
   * ───────────────────────────────────────────── */
  function init() {
    if (!localStorage.getItem(KEY_VEHICLES)) {
      localStorage.setItem(KEY_VEHICLES, JSON.stringify(SEED_VEHICLES));
    }
    if (!localStorage.getItem(KEY_LOGS)) {
      localStorage.setItem(KEY_LOGS, JSON.stringify(SEED_LOGS));
    }
    if (!localStorage.getItem(KEY_USER)) {
      localStorage.setItem(KEY_USER, JSON.stringify(SEED_USER));
    }
  }

  /* ─────────────────────────────────────────────
   * Public API
   * ───────────────────────────────────────────── */

  /** @returns {Array} all vehicles */
  function getVehicles() {
    return JSON.parse(localStorage.getItem(KEY_VEHICLES)) || [];
  }

  /** @param {Object} vehicle - full vehicle object */
  function addVehicle(vehicle) {
    const vehicles = getVehicles();
    vehicles.unshift(vehicle);
    localStorage.setItem(KEY_VEHICLES, JSON.stringify(vehicles));
    addLog({
      id: 'EVT_ADD_' + vehicle.id,
      type: 'ADMIN',
      timestamp: new Date().toISOString(),
      entityId: vehicle.id,
      description: 'Vehicle Added to Fleet',
      status: 'SUCCESS',
      detail: vehicle.make + ' registered by admin',
      json: { plate: vehicle.id, make: vehicle.make, owner: vehicle.owner, policy: vehicle.policyNumber },
    });
  }

  /** @param {string} id - vehicle plate ID @param {Object} patch - fields to update */
  function updateVehicle(id, patch) {
    const vehicles = getVehicles();
    const idx = vehicles.findIndex(v => v.id === id);
    if (idx === -1) return false;
    vehicles[idx] = Object.assign({}, vehicles[idx], patch);
    localStorage.setItem(KEY_VEHICLES, JSON.stringify(vehicles));
    return vehicles[idx];
  }

  /** @returns {Array} all audit logs newest-first */
  function getLogs() {
    return JSON.parse(localStorage.getItem(KEY_LOGS)) || [];
  }

  /** @param {Object} entry - log entry */
  function addLog(entry) {
    const logs = getLogs();
    logs.unshift(entry);
    // cap at 200 entries
    if (logs.length > 200) logs.pop();
    localStorage.setItem(KEY_LOGS, JSON.stringify(logs));
  }

  /** Get / set current user */
  function getCurrentUser() {
    return JSON.parse(localStorage.getItem(KEY_USER)) || SEED_USER;
  }

  function setCurrentUser(user) {
    localStorage.setItem(KEY_USER, JSON.stringify(Object.assign(getCurrentUser(), user)));
  }

  /** Factory reset — restores seed data (useful for demos) */
  function reset() {
    localStorage.setItem(KEY_VEHICLES, JSON.stringify(SEED_VEHICLES));
    localStorage.setItem(KEY_LOGS, JSON.stringify(SEED_LOGS));
    localStorage.setItem(KEY_USER, JSON.stringify(SEED_USER));
  }

  /* ─────────────────────────────────────────────
   * Computed helpers used across pages
   * ───────────────────────────────────────────── */

  /** Days until insurance expiry (negative = expired) */
  function daysUntilExpiry(isoDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(isoDate);
    return Math.round((expiry - today) / (1000 * 60 * 60 * 24));
  }

  /** Insurance health 0–100 expressed as % of a 1-year policy */
  function insuranceHealthPct(isoDate) {
    const days = daysUntilExpiry(isoDate);
    return Math.max(0, Math.min(100, Math.round((days / 365) * 100)));
  }

  /** Risk class: 'safe' | 'warn' | 'crit' */
  function riskClass(isoDate) {
    const d = daysUntilExpiry(isoDate);
    if (d < 0) return 'crit';
    if (d <= 7) return 'warn';
    return 'safe';
  }

  /** Format ISO date string as human-readable "Mon D, YYYY" */
  function fmtDate(isoDate) {
    if (!isoDate) return '—';
    return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /** Format ISO timestamp as "HH:MM:SS" */
  function fmtTime(isoDate) {
    return new Date(isoDate).toTimeString().slice(0, 8);
  }

  /* ─────────────────────────────────────────────
   * Expose globally
   * ───────────────────────────────────────────── */
  window.TruFleet = {
    init,
    getVehicles,
    addVehicle,
    updateVehicle,
    getLogs,
    addLog,
    getCurrentUser,
    setCurrentUser,
    reset,
    // Helpers
    daysUntilExpiry,
    insuranceHealthPct,
    riskClass,
    fmtDate,
    fmtTime,
  };

  // Auto-init
  init();
})();
