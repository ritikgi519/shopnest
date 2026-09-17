import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (emailToUse, passwordToUse) => {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const targetEmail = (emailToUse || email).trim();
    const targetPassword = passwordToUse || password;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(`Welcome back, ${data.name || 'User'}!`);
        login(data);
        setTimeout(() => {
          navigate('/');
        }, 600);
      } else {
        setErrorMessage(data.message || 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login request failed:', error);
      setErrorMessage('Network connection error. Please verify your server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLoginSubmit();
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    handleLoginSubmit(demoEmail, demoPassword);
  };

  return (
    <div className="auth-container" id="login-auth-container">
      <form onSubmit={handleSubmit} className="auth-form" id="login-form">
        <h2>Sign In to ShopNest</h2>
        <p style={{ margin: '-6px 0 14px', fontSize: '0.88rem', color: '#a1a1aa', textAlign: 'center' }}>
          Access your orders, saved wishlist items, and member perks
        </p>

        {/* In-page Error Notice */}
        {errorMessage && (
          <div 
            id="login-error-alert"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              lineHeight: '1.4'
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        {/* In-page Success Notice */}
        {successMessage && (
          <div 
            id="login-success-alert"
            style={{
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              color: '#86efac',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              lineHeight: '1.4'
            }}
          >
            ✓ {successMessage}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#d4d4d8' }} htmlFor="login-email-input">
            Email Address
          </label>
          <input 
            id="login-email-input"
            type="email" 
            placeholder="e.g. user@shopnest.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            autoComplete="email"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#d4d4d8' }} htmlFor="login-password-input">
              Password
            </label>
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f97316',
                fontSize: '0.78rem',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input 
            id="login-password-input"
            type={showPassword ? 'text' : 'password'} 
            placeholder="Enter password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            autoComplete="current-password"
          />
        </div>

        <button 
          type="submit" 
          className="btn" 
          id="login-submit-btn" 
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        {/* 1-CLICK QUICK DEMO LOGINS */}
        <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.78rem', color: '#71717a', textAlign: 'center', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
            Instant Demo Sign-In
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              id="quick-login-customer-btn"
              onClick={() => handleQuickDemo('user@shopnest.com', 'password123')}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#e4e4e7',
                padding: '9px 10px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              title="Sign in as Customer: user@shopnest.com"
            >
              <span>👤</span> Customer Demo
            </button>
            <button
              type="button"
              id="quick-login-admin-btn"
              onClick={() => handleQuickDemo('admin@shopnest.com', 'password123')}
              disabled={loading}
              style={{
                background: 'rgba(249, 115, 22, 0.08)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                color: '#f97316',
                padding: '9px 10px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              title="Sign in as Administrator: admin@shopnest.com"
            >
              <span>⚙️</span> Admin Demo
            </button>
          </div>
        </div>

        <p style={{ marginTop: '10px' }}>
          Don't have an account? <Link to="/register" id="login-to-register-link">Register New Account</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
