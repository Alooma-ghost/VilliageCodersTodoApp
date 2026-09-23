import React, { useState } from 'react';
import { authAPI, setAuthToken, setStoredUser } from '../api';
import { ShieldCheck, UserCheck, Lock, Mail, User, Briefcase, ArrowRight } from 'lucide-react';

export default function AuthPage({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('Member'); // 'Boss' or 'Member'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await authAPI.register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          title: title.trim() || (role === 'Boss' ? 'Technical Lead' : 'Developer'),
        });
      } else {
        data = await authAPI.login({
          email: email.trim(),
          password,
        });
      }

      setAuthToken(data.token);
      setStoredUser(data.user);
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Brand Header with Uploaded Logo */}
        <div className="auth-header-brand">
          <img
            src="/logo.png"
            alt="Village Coders Logo"
            className="auth-logo-large"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h1 className="auth-title">Village Coders</h1>
          <p className="auth-subtitle">Team Task &amp; Workflow Coordination</p>
          <span style={{display:'inline-flex',alignItems:'center',gap:'5px',fontSize:'0.68rem',fontWeight:600,color:'var(--brand-primary-light)',background:'rgba(8,145,178,0.1)',border:'1px solid rgba(8,145,178,0.2)',borderRadius:'999px',padding:'3px 10px',letterSpacing:'0.05em',textTransform:'uppercase'}}>🔒 Secure Workspace</span>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="auth-tabs-toggle">
          <button
            type="button"
            className={`auth-tab-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
          >
            Create Account
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <>
              {/* Role Selection: Team Lead vs Team Member */}
              <div className="form-group">
                <label className="form-label">Select Your Role</label>
                <div className="role-picker-group">
                  <div
                    className={`role-pick-card lead ${role === 'Boss' ? 'selected' : ''}`}
                    onClick={() => setRole('Boss')}
                  >
                    <div className="role-icon">
                      <ShieldCheck size={22} />
                    </div>
                    <span className="role-title">Team Lead</span>
                    <span className="role-desc">Assigns, oversees, & resolves roadblocks</span>
                  </div>

                  <div
                    className={`role-pick-card ${role === 'Member' ? 'selected' : ''}`}
                    onClick={() => setRole('Member')}
                  >
                    <div className="role-icon">
                      <UserCheck size={22} />
                    </div>
                    <span className="role-title">Team Member</span>
                    <span className="role-desc">Executes tasks & reports roadblocks</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Alex O'Connor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isRegister}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={role === 'Boss' ? 'Technical Lead' : 'Frontend Engineer'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@villagecoders.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn-assign-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '6px' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isRegister ? 'Register & Enter App' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
