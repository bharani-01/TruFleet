/**
 * TruFleet — Notification Panel Controller
 * Include AFTER trufleet-api.js in any page with the notif panel HTML.
 */
(function () {
  'use strict';

  let notifPanelOpen = false;

  window.toggleNotifPanel = function () {
    notifPanelOpen = !notifPanelOpen;
    const panel   = document.getElementById('notifPanel');
    const overlay = document.getElementById('notifOverlay');
    if (notifPanelOpen) {
      panel.style.right = '0';
      overlay.style.display = 'block';
      loadNotifications();
    } else {
      panel.style.right = '-400px';
      overlay.style.display = 'none';
    }
  };

  window.markAllRead = async function () {
    try {
      await TruFleet.markAllNotificationsRead();
      refreshBadge();
      loadNotifications();
    } catch (e) { console.warn('markAllRead failed', e); }
  };

  async function loadNotifications() {
    const container = document.getElementById('notifList');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;padding:2rem;color:#94A3B8;">Loading…</div>';

    try {
      const result = await TruFleet.getNotifications({ limit: 30 });
      const notifs = result.notifications || [];

      if (notifs.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#94A3B8;"><i class="ri-notification-off-line" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>No notifications</div>';
        return;
      }

      container.innerHTML = notifs.map(n => {
        const sev = n.severity || 'info';
        const colors = { critical: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };
        const icons  = { critical: 'ri-error-warning-fill', warning: 'ri-alert-line', info: 'ri-information-line' };
        const bg = n.status === 'UNREAD' ? '#F8FAFC' : 'white';
        const weight = n.status === 'UNREAD' ? '600' : '400';

        return `<div style="padding:12px;border-radius:10px;background:${bg};margin-bottom:6px;border:1px solid #F1F5F9;cursor:pointer;" onclick="notifClick('${n.id}','${n.entity_id || ''}')">
          <div style="display:flex;gap:10px;align-items:flex-start;">
            <i class="${icons[sev] || icons.info}" style="color:${colors[sev] || colors.info};font-size:1.2rem;margin-top:2px;"></i>
            <div style="flex:1;min-width:0;">
              <div style="font-size:0.85rem;font-weight:${weight};margin-bottom:4px;line-height:1.3;">${n.description || '—'}</div>
              <div style="font-size:0.75rem;color:#94A3B8;">${n.detail || ''}</div>
              <div style="font-size:0.7rem;color:#CBD5E1;margin-top:4px;">${TruFleet.fmtDate(n.timestamp)} ${TruFleet.fmtTime(n.timestamp)}</div>
            </div>
            ${n.status === 'UNREAD' ? '<div style="width:8px;height:8px;background:#3B82F6;border-radius:50%;flex-shrink:0;margin-top:6px;"></div>' : ''}
          </div>
        </div>`;
      }).join('');
    } catch (e) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;color:#94A3B8;">Failed to load</div>';
    }
  }

  window.notifClick = async function (notifId, entityId) {
    // Mark as read if it's a persisted notification
    if (notifId && !notifId.startsWith('ALERT_')) {
      try { await TruFleet.markNotificationRead(notifId); } catch (_) {}
    }
    // Navigate to vehicle if entity is a plate
    if (entityId && entityId !== 'SYSTEM' && entityId !== 'BULK') {
      window.location.href = 'vehicle_management.html';
    }
    refreshBadge();
    loadNotifications();
  };

  async function refreshBadge() {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    try {
      const result = await TruFleet.getNotifications({ limit: 1 });
      const count = result.unread || 0;
      if (count > 0) {
        badge.style.display = 'flex';
        badge.textContent = count > 99 ? '99+' : count;
      } else {
        badge.style.display = 'none';
      }
    } catch (_) {
      badge.style.display = 'none';
    }
  }

  // Refresh badge on load and every 30s
  refreshBadge();
  setInterval(refreshBadge, 30000);

})();
