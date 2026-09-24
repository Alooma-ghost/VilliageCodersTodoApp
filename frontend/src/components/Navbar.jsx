import React from 'react';
import { LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar({ user, onLogout, viewMode, setViewMode, notifications, unreadCount, markAllRead, markOneRead, clearNotification }) {
  const isBoss = user?.role === 'Boss';
  const initial = user?.name ? user.name.charAt(0) : '?';

  return (
    <header className="app-header">
      <div className="brand-section">
        <img
          src="/logo.png"
          alt="Village Coders Logo"
          className="brand-logo-img"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="brand-titles">
          <div className="brand-name">
            Village Coders
          </div>
          <span className="brand-tagline">Web &amp; Software Developers</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Notification Bell */}
        {user && (
          <NotificationBell
            notifications={notifications || []}
            unreadCount={unreadCount || 0}
            markAllRead={markAllRead}
            markOneRead={markOneRead}
            clearNotification={clearNotification}
          />
        )}

        {/* User Profile Pill */}
        {user && (
          <div className="user-badge" title={`${user.name} (${user.email})`}>
            <div className={`user-avatar-circle ${isBoss ? 'lead' : 'member'}`}>
              {initial}
            </div>
            <span className="user-info-name">{user.name.split(' ')[0]}</span>
          </div>
        )}

        {/* Logout */}
        <button className="icon-btn" onClick={onLogout} title="Sign Out">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
