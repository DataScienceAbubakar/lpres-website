import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import './Admin.css';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/admin/dashboard');
    } catch {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__brand">
          <span className="admin-login__icon">🌿</span>
          <div>
            <div className="admin-login__brand-name">LPRES Admin</div>
            <div className="admin-login__brand-sub">Content Management System</div>
          </div>
        </div>

        <h1 className="admin-login__title">Sign in to your account</h1>
        <p className="admin-login__sub">Manage news articles and events for the LPRES website.</p>

        {error && (
          <div className="admin-login__error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login__form">
          <div className="admin-field">
            <label>Username</label>
            <div className="admin-field__input-wrap">
              <User size={16} className="admin-field__icon" />
              <input
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm(f => ({...f, username: e.target.value}))}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="admin-field">
            <label>Password</label>
            <div className="admin-field__input-wrap">
              <Lock size={16} className="admin-field__icon" />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(f => ({...f, password: e.target.value}))}
                required
              />
              <button type="button" className="admin-field__toggle" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary admin-login__submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="admin-login__hint">
          Default credentials: <strong>admin</strong> / <strong>lpres@admin2024</strong>
        </p>
      </div>
    </div>
  );
}
