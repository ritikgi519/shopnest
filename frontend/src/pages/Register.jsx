import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          password 
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('Registration successful! Welcome to ShopNest.');
        login(data);
        setTimeout(() => {
          navigate('/');
        }, 800);
      } else {
        setErrorMessage(data.message || 'Registration failed. Please check your details.');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" id="register-auth-container">
      <form onSubmit={handleSubmit} className="auth-form" id="register-form">
        <h2>Create Account</h2>
        <p style={{ margin: '-6px 0 14px', fontSize: '0.88rem', color: '#a1a1aa', textAlign: 'center' }}>
          Join ShopNest to track orders, save wishlists, and unlock exclusive discounts
        </p>

        {errorMessage && (
          <div 
            id="register-error-alert"
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

        {successMessage && (
          <div 
            id="register-success-alert"
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
          <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#d4d4d8' }} htmlFor="register-name-input">
            Full Name
          </label>
          <input 
            id="register-name-input"
            type="text" 
            placeholder="e.g. Ritik Kumar" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            autoComplete="name"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#d4d4d8' }} htmlFor="register-email-input">
            Email Address
          </label>
          <input 
            id="register-email-input"
            type="email" 
            placeholder="e.g. ritik@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            autoComplete="email"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#d4d4d8' }} htmlFor="register-password-input">
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
            id="register-password-input"
            type={showPassword ? 'text' : 'password'} 
            placeholder="Create secure password (min 6 chars)" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            autoComplete="new-password"
            minLength={6}
          />
        </div>

        <button 
          type="submit" 
          className="btn" 
          id="register-submit-btn" 
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
        >
          {loading ? 'Creating Account...' : 'Register Account'}
        </button>

        <p style={{ marginTop: '10px' }}>
          Already have an account? <Link to="/login" id="register-to-login-link">Sign In</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
