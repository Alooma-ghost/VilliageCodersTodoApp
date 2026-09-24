import React, { useState, useEffect } from 'react';
import { getStoredUser, setStoredUser, removeAuthToken, authAPI } from './api';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [viewMode, setViewMode] = useState('full'); // 'full' or 'mobile'
  const [initialChecking, setInitialChecking] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const stored = getStoredUser();
        if (stored) {
          const res = await authAPI.getMe().catch(() => null);
          if (res && res.user) {
            setCurrentUser(res.user);
            setStoredUser(res.user);
          } else {
            // Account was deleted/wiped or session expired
            removeAuthToken();
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        removeAuthToken();
        setCurrentUser(null);
      } finally {
        setInitialChecking(false);
      }
    };

    verifyUser();
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setCurrentUser(null);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  if (initialChecking) {
    return (
      <div className="empty-state-box" style={{ minHeight: '100vh', justifyContent: 'center' }}>
        <img
          src="/logo.png"
          alt="Village Coders"
          style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'contain' }}
        />
        <div style={{ color: 'var(--brand-primary-light, #22d3ee)', fontWeight: 600 }}>
          Launching Village Coders App...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="app-atmosphere" />
      {currentUser ? (
        <Dashboard
          user={currentUser}
          onLogout={handleLogout}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      ) : (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      )}
    </>
  );
}
