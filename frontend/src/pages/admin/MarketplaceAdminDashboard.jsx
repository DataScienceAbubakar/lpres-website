import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    DollarSign,
    Package,
    Users,
    CheckCircle2,
    Clock,
    Truck,
    AlertCircle,
    XCircle,
    ShieldCheck,
    LogOut,
    Search,
    RefreshCw,
    Eye,
    Edit,
    Mail,
    Phone,
    MapPin,
    Check,
    X,
    FileText
} from 'lucide-react';
import { DEFAULT_API_URL } from '../../utils/env';
import './MarketplaceAdmin.css';

const API_BASE = DEFAULT_API_URL;

export default function MarketplaceAdminDashboard() {
    const navigate = useNavigate();
    const [token, setToken] = useState(() => localStorage.getItem('lpres_m_admin_token') || '');
    const [adminUser, setAdminUser] = useState(() => {
        try {
            const saved = localStorage.getItem('lpres_m_admin_user');
            return saved ? JSON.parse(saved) : { username: 'marketplace_admin' };
        } catch {
            return { username: 'marketplace_admin' };
        }
    });

    // Active Navigation Tab
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'users' | 'products'

    // Data states
    const [analytics, setAnalytics] = useState({
        total_requests: 0,
        total_amount: 0.0,
        total_users: 0,
        total_products: 0,
        active_products: 0,
        status_counts: { pending_review: 0, approved: 0, shipped: 0, completed: 0, cancelled: 0 }
    });
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

    // Modal State for Request Detail / Action
    const [activeRequestModal, setActiveRequestModal] = useState(null);
    const [modalAdminNotes, setModalAdminNotes] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [actionSuccessMsg, setActionSuccessMsg] = useState('');

    // Check auth
    useEffect(() => {
        if (!token) {
            navigate('/marketplace-admin/login', { replace: true });
        }
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('lpres_m_admin_token');
        localStorage.removeItem('lpres_m_admin_user');
        navigate('/marketplace-admin/login', { replace: true });
    };

    // Fetch Analytics & Requests Data
    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const authHeader = { 'Authorization': `Bearer ${token}` };

            // Analytics
            const resAnalytics = await fetch(`${API_BASE}/api/marketplace/admin/analytics`, { headers: authHeader });
            if (resAnalytics.status === 401) {
                handleLogout();
                return;
            }
            const dataAnalytics = await resAnalytics.json();
            if (dataAnalytics.success && dataAnalytics.data) {
                setAnalytics(dataAnalytics.data);
            }

            // Requests
            const resRequests = await fetch(`${API_BASE}/api/marketplace/admin/requests`, { headers: authHeader });
            const dataRequests = await resRequests.json();
            if (dataRequests.success && dataRequests.data) {
                setRequests(dataRequests.data);
            }

            // Users
            const resUsers = await fetch(`${API_BASE}/api/marketplace/admin/users`, { headers: authHeader });
            const dataUsers = await resUsers.json();
            if (dataUsers.success && dataUsers.data) {
                setUsers(dataUsers.data);
            }

            // Products
            const resProducts = await fetch(`${API_BASE}/api/marketplace/products`);
            const dataProducts = await resProducts.json();
            if (dataProducts.success && dataProducts.data?.products) {
                setProducts(dataProducts.data.products);
            }

        } catch (err) {
            console.error('Failed to load Marketplace Admin data:', err);
            setError('Unable to load latest data from backend server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    // Update Request Status (Approve, Ship, Complete, Cancel)
    const handleUpdateStatus = async (requestId, newStatus, customNotes = '') => {
        setUpdatingStatus(true);
        setActionSuccessMsg('');
        try {
            const res = await fetch(`${API_BASE}/api/marketplace/admin/requests/${requestId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    admin_notes: customNotes || modalAdminNotes
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Failed to update request status');

            setActionSuccessMsg(`Status updated to "${newStatus.replace('_', ' ')}"! Auto email dispatched.`);

            // Update local state
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus, adminNotes: customNotes || modalAdminNotes } : r));

            setTimeout(() => {
                setActionSuccessMsg('');
                setActiveRequestModal(null);
            }, 1500);

            // Refresh Analytics
            fetchDashboardData();

        } catch (err) {
            alert(err.message || 'Error updating status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Toggle Seller Verification Status
    const handleVerifyUser = async (userId, newStatus) => {
        try {
            const res = await fetch(`${API_BASE}/api/marketplace/admin/users/${userId}/verify?status=${newStatus}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to update verification status');

            setUsers(prev => prev.map(u => u.id === userId ? {
                ...u,
                verificationStatus: newStatus,
                isVerified: newStatus === 'verified'
            } : u));

        } catch (err) {
            alert(err.message || 'Error verifying user');
        }
    };

    // Formatting helpers
    const formatCurrency = (amount) => {
        return `₦${Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusBadge = (st) => {
        const status = (st || 'pending_review').toLowerCase();
        switch (status) {
            case 'approved':
            case 'under_facilitation':
            case 'inspection_passed':
                return <span className="mp-badge mp-badge-approved"><CheckCircle2 size={13} /> Approved</span>;
            case 'shipped':
            case 'logistics_dispatched':
                return <span className="mp-badge mp-badge-shipped"><Truck size={13} /> Shipped</span>;
            case 'completed':
                return <span className="mp-badge mp-badge-completed"><CheckCircle2 size={13} /> Completed</span>;
            case 'cancelled':
                return <span className="mp-badge mp-badge-cancelled"><XCircle size={13} /> Cancelled</span>;
            default:
                return <span className="mp-badge mp-badge-pending"><Clock size={13} /> Pending Review</span>;
        }
    };

    // Filtered requests
    const filteredRequests = requests.filter(r => {
        const matchesSearch = (r.requestCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.buyerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.buyerEmail || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatusFilter === 'All' ||
            (selectedStatusFilter === 'approved' && ['approved', 'under_facilitation', 'inspection_passed'].includes(r.status)) ||
            (selectedStatusFilter === 'shipped' && ['shipped', 'logistics_dispatched'].includes(r.status)) ||
            r.status === selectedStatusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="mp-admin-dashboard">
            {/* Top Header */}
            <header className="mp-admin-header">
                <div className="mp-admin-header-brand">
                    <ShieldCheck size={26} color="#10b981" />
                    <div>
                        <h1>L-PRES Marketplace Admin</h1>
                        <p>State Project Coordinating Office — Enterprise Trade Control Panel</p>
                    </div>
                </div>

                <div className="mp-admin-header-actions">
                    <button onClick={fetchDashboardData} className="mp-admin-icon-btn" title="Refresh Dashboard Data">
                        <RefreshCw size={18} />
                    </button>
                    <div className="mp-admin-user-tag">
                        <ShieldCheck size={16} color="#10b981" />
                        <span>{adminUser.username}</span>
                    </div>
                    <button onClick={handleLogout} className="mp-admin-logout-btn">
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <div className="mp-admin-container">
                {/* Analytics Overview Cards */}
                <section className="mp-analytics-grid">
                    <div className="mp-stat-card mp-stat-primary">
                        <div className="mp-stat-icon">
                            <TrendingUp size={24} />
                        </div>
                        <div className="mp-stat-info">
                            <span className="mp-stat-label">Total Trade Requests</span>
                            <h2 className="mp-stat-value">{analytics.total_requests || 0}</h2>
                            <span className="mp-stat-sub">Lifetime buyer orders</span>
                        </div>
                    </div>

                    <div className="mp-stat-card mp-stat-emerald">
                        <div className="mp-stat-icon">
                            <DollarSign size={24} />
                        </div>
                        <div className="mp-stat-info">
                            <span className="mp-stat-label">Total Trade Volume</span>
                            <h2 className="mp-stat-value">{formatCurrency(analytics.total_amount)}</h2>
                            <span className="mp-stat-sub">Gross request value</span>
                        </div>
                    </div>

                    <div className="mp-stat-card mp-stat-yellow">
                        <div className="mp-stat-icon">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="mp-stat-info">
                            <span className="mp-stat-label">Approved Requests</span>
                            <h2 className="mp-stat-value">{analytics.status_counts?.approved || 0}</h2>
                            <span className="mp-stat-sub">Under active facilitation</span>
                        </div>
                    </div>

                    <div className="mp-stat-card mp-stat-blue">
                        <div className="mp-stat-icon">
                            <Truck size={24} />
                        </div>
                        <div className="mp-stat-info">
                            <span className="mp-stat-label">Shipped / Dispatched</span>
                            <h2 className="mp-stat-value">{analytics.status_counts?.shipped || 0}</h2>
                            <span className="mp-stat-sub">Logistics transit count</span>
                        </div>
                    </div>

                    <div className="mp-stat-card mp-stat-purple">
                        <div className="mp-stat-icon">
                            <Users size={24} />
                        </div>
                        <div className="mp-stat-info">
                            <span className="mp-stat-label">Registered Marketers</span>
                            <h2 className="mp-stat-value">{analytics.total_users || 0}</h2>
                            <span className="mp-stat-sub">{analytics.active_products || 0} active listings</span>
                        </div>
                    </div>
                </section>

                {/* Navigation Tabs */}
                <div className="mp-admin-tabs-bar">
                    <button
                        className={`mp-admin-tab ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        <FileText size={18} />
                        <span>Trade Facilitation Requests ({requests.length})</span>
                    </button>

                    <button
                        className={`mp-admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={18} />
                        <span>Marketers & Verification ({users.length})</span>
                    </button>

                    <button
                        className={`mp-admin-tab ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <Package size={18} />
                        <span>Catalog Products ({products.length})</span>
                    </button>
                </div>

                {/* TAB 1: TRADE REQUESTS */}
                {activeTab === 'requests' && (
                    <section className="mp-admin-section">
                        <div className="mp-section-header">
                            <div className="mp-search-bar">
                                <Search size={16} className="mp-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search request code, item, buyer name, or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="mp-filter-group">
                                <label>Filter Status:</label>
                                <select
                                    value={selectedStatusFilter}
                                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="pending_review">Pending Review</option>
                                    <option value="approved">Approved / Under Facilitation</option>
                                    <option value="shipped">Shipped / Dispatched</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="mp-admin-loading">
                                <RefreshCw size={24} className="mp-spin" />
                                <p>Loading marketplace requests...</p>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="mp-admin-empty">
                                <FileText size={40} />
                                <h3>No trade requests found</h3>
                                <p>Try clearing your search term or status filter.</p>
                            </div>
                        ) : (
                            <div className="mp-table-wrapper">
                                <table className="mp-data-table">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Product / Category</th>
                                            <th>Requested Qty & Total</th>
                                            <th>Buyer Details</th>
                                            <th>1% Inspection</th>
                                            <th>Status</th>
                                            <th>Actions & Auto-Emails</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRequests.map((req) => {
                                            const estAmt = req.estimatedTotal?.amount || 0;
                                            const estCurr = req.estimatedTotal?.currency || 'NGN';

                                            return (
                                                <tr key={req.id}>
                                                    <td>
                                                        <strong className="mp-code">{req.requestCode}</strong>
                                                        <div className="mp-time">{new Date(req.createdAt).toLocaleDateString()}</div>
                                                    </td>
                                                    <td>
                                                        <div className="mp-prod-name">{req.productName}</div>
                                                        <span className="mp-prod-cat">{req.productCategory || 'Livestock'}</span>
                                                    </td>
                                                    <td>
                                                        <div>Qty: <strong>{req.requestedQty}</strong></div>
                                                        <div className="mp-total-amt">₦{Number(estAmt).toLocaleString()}</div>
                                                    </td>
                                                    <td>
                                                        <div className="mp-buyer-name">{req.buyerName}</div>
                                                        <div className="mp-buyer-contact"><Mail size={12} /> {req.buyerEmail}</div>
                                                        <div className="mp-buyer-contact"><Phone size={12} /> {req.buyerPhone} ({req.buyerLga})</div>
                                                    </td>
                                                    <td>
                                                        {req.includeInspection ? (
                                                            <span className="mp-inspection-tag yes">
                                                                <ShieldCheck size={12} /> Yes (₦{Number(req.inspectionFee?.amount || 0).toLocaleString()})
                                                            </span>
                                                        ) : (
                                                            <span className="mp-inspection-tag no">No</span>
                                                        )}
                                                    </td>
                                                    <td>{getStatusBadge(req.status)}</td>
                                                    <td>
                                                        <div className="mp-action-btns-row">
                                                            {/* Action 1: Approve Request */}
                                                            {(req.status === 'pending_review' || !req.status) && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(req.id, 'approved', 'Request verified and approved by Kwara L-PRES State Project Office.')}
                                                                    className="mp-btn-action mp-btn-approve"
                                                                    title="Approve Request & Auto-Email Buyer"
                                                                >
                                                                    <CheckCircle2 size={13} /> Approve
                                                                </button>
                                                            )}

                                                            {/* Action 2: Mark Shipped */}
                                                            {['approved', 'under_facilitation', 'inspection_passed', 'pending_review'].includes(req.status) && (
                                                                <button
                                                                    onClick={() => {
                                                                        const notes = prompt('Enter dispatch/haulage details (or tracking note):', req.adminNotes || 'Stock dispatched via Kwara L-PRES logistics relay.');
                                                                        if (notes !== null) {
                                                                            handleUpdateStatus(req.id, 'shipped', notes);
                                                                        }
                                                                    }}
                                                                    className="mp-btn-action mp-btn-ship"
                                                                    title="Mark Shipped & Auto-Email Buyer"
                                                                >
                                                                    <Truck size={13} /> Mark Shipped
                                                                </button>
                                                            )}

                                                            {/* View / Edit Modal */}
                                                            <button
                                                                onClick={() => {
                                                                    setActiveRequestModal(req);
                                                                    setModalAdminNotes(req.adminNotes || '');
                                                                }}
                                                                className="mp-btn-action mp-btn-view"
                                                                title="View Request Details & Audit"
                                                            >
                                                                <Eye size={13} /> Details
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* TAB 2: USERS & VERIFICATION */}
                {activeTab === 'users' && (
                    <section className="mp-admin-section">
                        <div className="mp-table-wrapper">
                            <table className="mp-data-table">
                                <thead>
                                    <tr>
                                        <th>Marketer Name</th>
                                        <th>Email & Phone</th>
                                        <th>LGA</th>
                                        <th>Verification Status</th>
                                        <th>Farm / Coop Details</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>
                                                <strong>{u.name}</strong>
                                                {u.isVerified && <ShieldCheck size={14} color="#10b981" title="Verified Badge Active" />}
                                            </td>
                                            <td>
                                                <div>{u.email}</div>
                                                <div className="mp-time">{u.phone}</div>
                                            </td>
                                            <td>{u.lga || 'Ilorin East'}</td>
                                            <td>
                                                {u.isVerified ? (
                                                    <span className="mp-badge mp-badge-approved">Verified Marketer</span>
                                                ) : u.verificationStatus === 'pending' ? (
                                                    <span className="mp-badge mp-badge-pending">Pending Review</span>
                                                ) : (
                                                    <span className="mp-badge mp-badge-cancelled">Unverified</span>
                                                )}
                                            </td>
                                            <td>
                                                {u.verificationDetails ? (
                                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                        <div>Farm: {u.verificationDetails.farm_name || u.verificationDetails.farmName || 'N/A'}</div>
                                                        <div>NIN/Reg: {u.verificationDetails.nin_reg || u.verificationDetails.nin || 'N/A'}</div>
                                                    </div>
                                                ) : 'No verification application submitted'}
                                            </td>
                                            <td>
                                                <div className="mp-action-btns-row">
                                                    {!u.isVerified && (
                                                        <button
                                                            onClick={() => handleVerifyUser(u.id, 'verified')}
                                                            className="mp-btn-action mp-btn-approve"
                                                        >
                                                            <Check size={13} /> Grant Verification Badge
                                                        </button>
                                                    )}
                                                    {u.isVerified && (
                                                        <button
                                                            onClick={() => handleVerifyUser(u.id, 'unverified')}
                                                            className="mp-btn-action mp-btn-cancel"
                                                        >
                                                            <X size={13} /> Revoke Verification
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* TAB 3: PRODUCTS */}
                {activeTab === 'products' && (
                    <section className="mp-admin-section">
                        <div className="mp-table-wrapper">
                            <table className="mp-data-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Producer / Seller</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p._id || p.id}>
                                            <td>
                                                <strong>{p.name}</strong>
                                            </td>
                                            <td>{p.category}</td>
                                            <td>₦{Number(p.price?.amount || 0).toLocaleString()} {p.price?.unit}</td>
                                            <td>{p.quantity?.available} {p.quantity?.unit}</td>
                                            <td>{p.seller?.name || 'Kwara Farmer'}</td>
                                            <td>
                                                <span className={`mp-badge ${p.status === 'active' ? 'mp-badge-approved' : 'mp-badge-cancelled'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>

            {/* DETAIL & ACTION MODAL FOR TRADE REQUEST */}
            {activeRequestModal && (
                <div className="mp-modal-overlay">
                    <div className="mp-modal-card">
                        <div className="mp-modal-header">
                            <h2>Trade Request Facilitation [{activeRequestModal.requestCode}]</h2>
                            <button onClick={() => setActiveRequestModal(null)} className="mp-modal-close">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mp-modal-body">
                            {actionSuccessMsg && (
                                <div className="mp-admin-alert-success">
                                    <CheckCircle2 size={18} />
                                    <span>{actionSuccessMsg}</span>
                                </div>
                            )}

                            <div className="mp-modal-grid">
                                <div>
                                    <h4 className="mp-modal-sub">Product Details</h4>
                                    <p><strong>Item:</strong> {activeRequestModal.productName}</p>
                                    <p><strong>Category:</strong> {activeRequestModal.productCategory}</p>
                                    <p><strong>Requested Qty:</strong> {activeRequestModal.requestedQty}</p>
                                    <p><strong>Estimated Total:</strong> ₦{Number(activeRequestModal.estimatedTotal?.amount || 0).toLocaleString()}</p>
                                </div>

                                <div>
                                    <h4 className="mp-modal-sub">Buyer Information</h4>
                                    <p><strong>Name:</strong> {activeRequestModal.buyerName}</p>
                                    <p><strong>Email:</strong> {activeRequestModal.buyerEmail}</p>
                                    <p><strong>Phone:</strong> {activeRequestModal.buyerPhone}</p>
                                    <p><strong>LGA & Location:</strong> {activeRequestModal.buyerLga} — {activeRequestModal.deliveryLocation || 'Standard delivery point'}</p>
                                </div>
                            </div>

                            <div className="mp-modal-admin-notes-section">
                                <label>Administrator Facilitation Notes (Included in auto-emails to buyer):</label>
                                <textarea
                                    rows={3}
                                    value={modalAdminNotes}
                                    onChange={(e) => setModalAdminNotes(e.target.value)}
                                    placeholder="Enter logistics update, inspection result, or haulage tracking notes..."
                                />
                            </div>
                        </div>

                        <div className="mp-modal-footer">
                            <div className="mp-modal-status-actions">
                                <span className="mp-modal-label">Trigger Status Update:</span>
                                <button
                                    disabled={updatingStatus}
                                    onClick={() => handleUpdateStatus(activeRequestModal.id, 'approved')}
                                    className="mp-btn-action mp-btn-approve"
                                >
                                    <CheckCircle2 size={14} /> Approve Request (Sends Auto-Email)
                                </button>
                                <button
                                    disabled={updatingStatus}
                                    onClick={() => handleUpdateStatus(activeRequestModal.id, 'shipped')}
                                    className="mp-btn-action mp-btn-ship"
                                >
                                    <Truck size={14} /> Mark Shipped (Sends Auto-Email)
                                </button>
                                <button
                                    disabled={updatingStatus}
                                    onClick={() => handleUpdateStatus(activeRequestModal.id, 'completed')}
                                    className="mp-btn-action mp-btn-complete"
                                >
                                    <CheckCircle2 size={14} /> Complete Trade
                                </button>
                                <button
                                    disabled={updatingStatus}
                                    onClick={() => handleUpdateStatus(activeRequestModal.id, 'cancelled')}
                                    className="mp-btn-action mp-btn-cancel"
                                >
                                    <XCircle size={14} /> Cancel Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
