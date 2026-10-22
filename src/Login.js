import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);

    signInWithEmailAndPassword(auth, email.trim(), password)
      .then(() => {
        setLoading(false);
        navigate('/');
      })
      .catch((error) => {
        setLoading(false);
        setError(error.message.replace('Firebase: ', ''));
      });
  };

  return (
    <div className="login-screen-wrap">
      <div className="login-app-card animate-fade-in">
        {/* Brand Splash Header */}
        <div className="login-brand-header">
          <div className="login-app-logo">EJ</div>
          <h1 className="login-app-title">Elite Jobs</h1>
          <p className="login-app-subtitle">Secure Admin & Management Portal</p>
        </div>

        {error && (
          <div className="login-error-alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-input-group">
            <label className="login-field-label">Email Address</label>
            <div className="input-field-wrap">
              <FaEnvelope className="field-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@elitejobs.com"
                className="login-text-input"
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="login-input-group">
            <label className="login-field-label">Password</label>
            <div className="input-field-wrap">
              <FaLock className="field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="login-text-input"
                disabled={loading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="pwd-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <div className="btn-spinner"></div>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <FaArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="login-card-footer">
          <FaShieldAlt className="shield-icon" />
          <span>Protected by Enterprise Security</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

