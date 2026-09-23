import React from 'react';
import { LogOut } from 'lucide-react';

export default function Navbar({ user, onLogout, viewMode, setViewMode }) {
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
            // fallback if logo missing
            e.target.style.display = 'none';
          }}
        />
        <div className="brand-titles">
          <div className="brand-name">
            Village Coders
          </div>
          <span className="brand-tagline">Web & Software Developers</span>
        </div>
      </div>

      <div className="header-actions">
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
