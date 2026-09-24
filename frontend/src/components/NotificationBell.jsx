import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const TYPE_META = {
  task_assigned: { emoji: '📋', label: 'Task Assigned', color: 'var(--brand-primary)' },
  status_in_progress: { emoji: '🔄', label: 'In Progress', color: '#f59e0b' },
  status_completed: { emoji: '✅', label: 'Completed', color: '#22c55e' },
  status_cannot_do: { emoji: '🚫', label: 'Blocked', color: '#ef4444' },
};

export default function NotificationBell({ notifications, unreadCount, markAllRead, markOneRead, clearNotification }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleOpen = () => {
    setOpen((o) => !o);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        ref={btnRef}
        id="notification-bell-btn"
        className="icon-btn notif-bell-btn"
        title="Notifications"
        onClick={handleOpen}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div ref={panelRef} className="notif-panel" role="dialog" aria-label="Notifications panel">
          {/* Panel Header */}
          <div className="notif-panel-header">
            <span className="notif-panel-title">
              <Bell size={15} style={{ marginRight: 6 }} />
              Notifications
              {unreadCount > 0 && <span className="notif-panel-badge">{unreadCount} new</span>}
            </span>
            {notifications.length > 0 && (
              <button
                className="notif-mark-all-btn"
                onClick={markAllRead}
                title="Mark all as read"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <span style={{ fontSize: '2rem' }}>🔔</span>
                <p>No notifications yet</p>
                <span>You'll be notified when tasks are assigned to you.</span>
              </div>
            ) : (
              notifications.map((n) => {
                const meta = TYPE_META[n.type] || { emoji: '📌', label: 'Update', color: 'var(--brand-primary)' };
                return (
                  <div
                    key={n.id}
                    className={`notif-item ${n.read ? 'read' : 'unread'}`}
                    onClick={() => markOneRead(n.id)}
                  >
                    <div className="notif-item-emoji">{meta.emoji}</div>
                    <div className="notif-item-body">
                      <div className="notif-item-title">{n.title}</div>
                      <div className="notif-item-desc">{n.message}</div>
                      <div className="notif-item-time">{timeAgo(n.createdAt)}</div>
                    </div>
                    <button
                      className="notif-dismiss-btn"
                      onClick={(e) => { e.stopPropagation(); clearNotification(n.id); }}
                      title="Dismiss"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
