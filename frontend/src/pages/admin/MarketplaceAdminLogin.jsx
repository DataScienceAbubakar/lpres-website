import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';
import { DEFAULT_API_URL } from '../../utils/env';
import './MarketplaceAdmin.css';

const API_BASE = DEFAULT_API_URL;

export default function MarketplaceAdminLogin() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/marketplace/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || data.message || 'Invalid marketplace admin credentials');
            }

            if (data.token) {
                localStorage.setItem('lpres_m_admin_token', data.token);
                localStorage.setItem('lpres_m_admin_user', JSON.stringify(data.admin || { username }));
                navigate('/marketplace-admin');
            } else {
                throw new Error('Authentication failed');
            }
        } catch (err) {
            setError(err.message || 'Error signing into Marketplace Admin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mp-admin-login-page">
            <div className="mp-admin-login-card">
                <div className="mp-admin-login-brand">
                    <div className="mp-admin-brand-icon">
                        <ShieldCheck size={28} color="#10b981" />
                    </div>
                    <div>
                        <h2 className="mp-admin-brand-title">Kwara L-PRES Marketplace</h2>
                        <p className="mp-admin-brand-sub">Official Intermediary Admin Portal</p>
                    </div>
                </div>

                <h1 className="mp-admin-login-heading">Marketplace Administrator Sign In</h1>
                <p className="mp-admin-login-desc">
                    Log in with your dedicated Marketplace Admin password to access trade request analytics, escrow status, and seller verifications.
                </p>

                {error && (
                    <div className="mp-admin-login-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mp-admin-login-form">
                    <div className="mp-admin-input-group">
                        <label>Admin Username</label>
                        <div className="mp-admin-input-wrap">
                            <User size={18} className="mp-admin-input-icon" />
                            <input
                                type="text"
                                placeholder="Enter marketplace admin username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="mp-admin-input-group">
                        <label>Marketplace Password</label>
                        <div className="mp-admin-input-wrap">
                            <Lock size={18} className="mp-admin-input-icon" />
                            <input
                                type={showPwd ? 'text' : 'password'}
                                placeholder="Enter marketplace admin password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="mp-admin-toggle-pwd"
                                onClick={() => setShowPwd(!showPwd)}
                                tabIndex={-1}
                            >
                                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="mp-admin-submit-btn" disabled={loading}>
                        {loading ? 'Authenticating Admin...' : 'Sign In to Marketplace Admin'}
                    </button>
                </form>

                <div className="mp-admin-login-footer">
                    <p>
                        Default Marketplace Admin: <strong>marketplace_admin</strong> / <strong>MarketplaceAdmin2026!</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
