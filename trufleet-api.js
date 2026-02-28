/**
 * TruFleet — Frontend API Client
 * Async wrapper around the Express/Supabase REST API.
 * Replace trufleet-data.js with this file in all HTML pages.
 *
 * All methods return Promises. Use async/await in page scripts.
 */

(function () {
  'use strict';

  /* ── Base URL ─────────────────────────────────────────────
   * When served by Express at http://localhost:3000 the relative
  * path /api works automatically.  When opened as a file:// URL
   * (e.g. double-clicked in Explorer) we fall back to localhost:3000
   * automatically.  Override by setting window.TRUFLEET_API_BASE.
   * ──────────────────────────────────────────────────────── */
  const _autoBase = (window.location.protocol === 'file:')
    ? 'http://localhost:3000'
    : '';
  const BASE = (window.TRUFLEET_API_BASE || _autoBase) + '/api';

  /* ── Internal helpers ──────────────────────────────────── */
  async function request(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(BASE + path, opts);
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json.error || `HTTP ${res.status}`);
    }
    return json;
  }

  const get    = (path)        => request('GET',    path);
  const post   = (path, body)  => request('POST',   path, body);
  const patch  = (path, body)  => request('PATCH',  path, body);
  const del    = (path)        => request('DELETE',  path);

  /* ── Computed helpers (client-side, mirrors server logic) ─ */

  function daysUntilExpiry(isoDate) {
    if (!isoDate) return 9999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((new Date(isoDate) - today) / (1000 * 60 * 60 * 24));
  }

  function insuranceHealthPct(isoDate) {
    const d = daysUntilExpiry(isoDate);
    return Math.max(0, Math.min(100, Math.round((d / 365) * 100)));
  }

  function riskClass(isoDate) {
    const d = daysUntilExpiry(isoDate);
    if (d < 0)  return 'crit';
    if (d <= 7) return 'warn';
    return 'safe';
  }

  function fmtDate(isoDate) {
    if (!isoDate) return '—';
    return new Date(isoDate).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  function fmtTime(isoDate) {
    if (!isoDate) return '—';
    return new Date(isoDate).toTimeString().slice(0, 8);
  }

  /* ── Session helpers (localStorage for current-user only) ─ */
  const SESSION_KEY = 'trufleet_user'; // must match auth-check.js

  function isLoggedIn() {
    return !!localStorage.getItem(SESSION_KEY);
  }

  function getCurrentUser() {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch { return null; }
  }

  function setCurrentUser(user) {
    // Merge with existing data only if logged in, otherwise store fresh
    const current = getCurrentUser() || {};
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...current, ...user }));
  }

  function clearCurrentUser() {
    localStorage.removeItem(SESSION_KEY);
  }

  /* ── Public API ────────────────────────────────────────── */

  /**
   * @param {Object} [opts] - Optional filters: { status, risk, search }
   * @returns {Promise<Array>}
   */
  async function getVehicles(opts = {}) {
    const params = new URLSearchParams();
    if (opts.status) params.set('status', opts.status);
    if (opts.risk)   params.set('risk',   opts.risk);
    if (opts.search) params.set('search', opts.search);
    const qs = params.toString();
    return get('/vehicles' + (qs ? '?' + qs : ''));
  }

  /**
   * @param {string} id - Vehicle plate ID
   * @returns {Promise<Object>}
   */
  async function getVehicleById(id) {
    return get('/vehicles/' + encodeURIComponent(id));
  }

  /**
   * @param {Object} vehicle - Full vehicle object (snake_case for DB fields)
   * @returns {Promise<Object>}
   */
  async function addVehicle(vehicle) {
    return post('/vehicles', vehicle);
  }

  /**
   * @param {string} id - Vehicle plate ID
   * @param {Object} patchData - Fields to update
   * @returns {Promise<Object>}
   */
  async function updateVehicle(id, patchData) {
    return request('PATCH', '/vehicles/' + encodeURIComponent(id), patchData);
  }

  /**
   * @returns {Promise<Object>} KPI summary for dashboard
   */
  async function getKPIs() {
    return get('/vehicles/kpis');
  }

  /**
   * @param {Object} [opts] - Optional filters: { limit, type, search }
   * @returns {Promise<Array>}
   */
  async function getLogs(opts = {}) {
    const params = new URLSearchParams();
    if (opts.limit)  params.set('limit',  opts.limit);
    if (opts.type)   params.set('type',   opts.type);
    if (opts.search) params.set('search', opts.search);
    const qs = params.toString();
    return get('/logs' + (qs ? '?' + qs : ''));
  }

  /**
   * @param {Object} entry - Log entry
   * @returns {Promise<Object>}
   */
  async function addLog(entry) {
    return post('/logs', entry);
  }

  /**
   * @param {Object} creds - { email, password, role }
   * @returns {Promise<Object>} { success, user }
   */
  async function login(creds) {
    const result = await post('/auth/login', creds);
    if (result.user) setCurrentUser(result.user);
    return result;
  }

  /**
   * @param {Object} data - { name, email, password, role, company }
   * @returns {Promise<Object>} { success, user }
   */
  async function register(data) {
    const result = await post('/auth/register', data);
    if (result.user) setCurrentUser(result.user);
    return result;
  }

  /* ── Delete / Bulk / History / Analytics / Notifications ── */

  /**
   * @param {string} id - Vehicle plate ID
   * @returns {Promise<Object>} { success, deleted }
   */
  async function deleteVehicle(id) {
    return del('/vehicles/' + encodeURIComponent(id));
  }

  /**
   * @param {string[]} ids - Array of vehicle plate IDs
   * @returns {Promise<Object>} { success, deleted, vehicles }
   */
  async function bulkDeleteVehicles(ids) {
    return post('/vehicles/bulk-delete', { ids });
  }

  /**
   * @param {string[]} ids - Array of vehicle plate IDs
   * @param {string} status - 'Active' or 'Blocked'
   * @returns {Promise<Object>} { success, updated, vehicles }
   */
  async function bulkUpdateStatus(ids, status) {
    return post('/vehicles/bulk-status', { ids, status });
  }

  /**
   * @param {string} id - Vehicle plate ID
   * @returns {Promise<Array>} Audit log entries for this vehicle
   */
  async function getVehicleHistory(id) {
    return get('/vehicles/' + encodeURIComponent(id) + '/history');
  }

  /**
   * @returns {Promise<Object>} Full fleet analytics overview
   */
  async function getAnalyticsOverview() {
    return get('/analytics/overview');
  }

  /**
   * @param {number} [days=30] - Number of days of activity to retrieve
   * @returns {Promise<Object>} Activity summary
   */
  async function getAnalyticsActivity(days = 30) {
    return get('/analytics/activity?days=' + days);
  }

  /**
   * @returns {Promise<Object>} 90-day expiry forecast
   */
  async function getExpiryForecast() {
    return get('/analytics/expiry-forecast');
  }

  /**
   * @param {Object} [opts] - { read, limit }
   * @returns {Promise<Object>} { total, unread, critical, notifications }
   */
  async function getNotifications(opts = {}) {
    const params = new URLSearchParams();
    if (opts.read !== undefined) params.set('read', opts.read);
    if (opts.limit) params.set('limit', opts.limit);
    const qs = params.toString();
    return get('/notifications' + (qs ? '?' + qs : ''));
  }

  /**
   * @param {string} id - Notification ID
   * @returns {Promise<Object>}
   */
  async function markNotificationRead(id) {
    return patch('/notifications/' + encodeURIComponent(id) + '/read', {});
  }

  /**
   * @returns {Promise<Object>} { success, marked }
   */
  async function markAllNotificationsRead() {
    return post('/notifications/mark-all-read', {});
  }

  /**
   * @param {Object} notification - { entity_id, description, severity, detail }
   * @returns {Promise<Object>}
   */
  async function createNotification(notification) {
    return post('/notifications', notification);
  }

  /* ── Expose globally ───────────────────────────────────── */
  window.TruFleet = {
    // Data — Vehicles
    getVehicles,
    getVehicleById,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    bulkDeleteVehicles,
    bulkUpdateStatus,
    getVehicleHistory,
    getKPIs,
    // Data — Logs
    getLogs,
    addLog,
    // Analytics
    getAnalyticsOverview,
    getAnalyticsActivity,
    getExpiryForecast,
    // Notifications
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    createNotification,
    // Auth
    login,
    register,
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    isLoggedIn,
    // Helpers
    daysUntilExpiry,
    insuranceHealthPct,
    riskClass,
    fmtDate,
    fmtTime,
  };

})();
