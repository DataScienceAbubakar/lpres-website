import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { newsAPI, adminMarketplaceAPI } from '../../api/client';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, LogOut,
  Newspaper, CheckCircle, Clock, LayoutDashboard, FolderOpen, Briefcase,
  ShieldCheck, Check, X, Award, UserCheck, ShieldAlert, FileText, Phone, Mail, MapPin, Building
} from 'lucide-react';
import './Admin.css';

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'verifications' | 'requests'

  // Articles state
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verifications state
  const [verifications, setVerifications] = useState([]);
  const [verificationsLoading, setVerificationsLoading] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(null);

  // Enterprise Trade Requests state
  const [tradeRequests, setTradeRequests] = useState([]);
  const [tradeRequestsLoading, setTradeRequestsLoading] = useState(false);
  const [requestActionProcessing, setRequestActionProcessing] = useState(null);
  const [requestStatusFilter, setRequestStatusFilter] = useState('');

  const fetchArticles = () => {
    newsAPI.adminList()
      .then((res) => setArticles(res.data))
      .catch((err) => console.error('Error fetching articles:', err))
      .finally(() => setLoading(false));
  };

  const fetchVerifications = () => {
    setVerificationsLoading(true);
    adminMarketplaceAPI.getVerifications()
      .then((res) => {
        if (res.data?.data) {
          setVerifications(res.data.data);
        }
      })
      .catch((err) => console.error('Error fetching verifications:', err))
      .finally(() => setVerificationsLoading(false));
  };

  const fetchTradeRequests = (filter = '') => {
    setTradeRequestsLoading(true);
    adminMarketplaceAPI.getRequests(filter)
      .then((res) => {
        if (res.data?.data) {
          setTradeRequests(res.data.data);
        }
      })
      .catch((err) => console.error('Error fetching trade requests:', err))
      .finally(() => setTradeRequestsLoading(false));
  };

  useEffect(() => {
    fetchArticles();
    fetchVerifications();
    fetchTradeRequests();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleToggle = async (id) => {
    await newsAPI.togglePublish(id);
    fetchArticles();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article permanently?')) return;
    await newsAPI.delete(id);
    fetchArticles();
  };

  const handleVerificationAction = async (userId, action) => {
    const confirmMsg = action === 'approve'
      ? 'Grant official L-PRES Verified Marketer status to this seller?'
      : 'Reject this seller verification request?';
    if (!window.confirm(confirmMsg)) return;

    setActionProcessing(userId);
    try {
      await adminMarketplaceAPI.actionVerification(userId, action);
      fetchVerifications();
    } catch (err) {
      alert('Error updating verification status: ' + (err.response?.data?.detail || err.message));
    } finally {
      setActionProcessing(null);
    }
  };

  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    const notes = window.prompt(`Update status to "${newStatus.replace('_', ' ')}"? Optional admin notes:`);
    if (notes === null) return;

    setRequestActionProcessing(requestId);
    try {
      await adminMarketplaceAPI.updateRequestStatus(requestId, newStatus, notes);
      fetchTradeRequests(requestStatusFilter);
    } catch (err) {
      alert('Error updating request status: ' + (err.response?.data?.detail || err.message));
    } finally {
      setRequestActionProcessing(null);
    }
  };

  const published = articles.filter(a => a.is_published).length;
  const drafts = articles.filter(a => !a.is_published).length;

  const pendingVerifications = verifications.filter(v => v.verification_status === 'pending');
  const verifiedMarketers = verifications.filter(v => v.verification_status === 'verified');

  const pendingTradeRequests = tradeRequests.filter(r => r.status === 'pending_review');
  const inspectionTradeRequests = tradeRequests.filter(r => r.include_inspection);
  const logisticsTradeRequests = tradeRequests.filter(r => r.request_supply_chain);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span>🌿</span>
          <div>
            <div className="admin-sidebar__brand-name">LPRES CMS</div>
            <div className="admin-sidebar__brand-sub">Admin Portal</div>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <div
            className={`admin-sidebar__nav-item ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
            style={{ cursor: 'pointer' }}
          >
            <LayoutDashboard size={18} /> News & Articles
          </div>

          <div
            className={`admin-sidebar__nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Award size={18} /> Enterprise Trade Requests
            </span>
            {pendingTradeRequests.length > 0 && (
              <span style={{
                background: '#059669',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 999
              }}>
                {pendingTradeRequests.length}
              </span>
            )}
          </div>

          <div
            className={`admin-sidebar__nav-item ${activeTab === 'verifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('verifications')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} /> Marketer Verifications
            </span>
            {pendingVerifications.length > 0 && (
              <span style={{
                background: '#d97706',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 999
              }}>
                {pendingVerifications.length}
              </span>
            )}
          </div>

          <Link to="/admin/gallery" className="admin-sidebar__nav-item">
            <FolderOpen size={18} /> Gallery
          </Link>
          <Link to="/admin/projects" className="admin-sidebar__nav-item">
            <Briefcase size={18} /> Projects
          </Link>
          <Link to="/admin/news/new" className="admin-sidebar__nav-item">
            <Plus size={18} /> New Article
          </Link>
        </nav>

        <div className="admin-sidebar__user">
          <div className="admin-sidebar__avatar">{admin?.username?.[0]?.toUpperCase()}</div>
          <div>
            <div className="admin-sidebar__uname">{admin?.username}</div>
            <div className="admin-sidebar__uemail">{admin?.email}</div>
          </div>
          <button className="admin-sidebar__logout" onClick={handleLogout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {activeTab === 'articles' ? (
          <>
            <div className="admin-main__header">
              <div>
                <h1 className="admin-main__title">News & Articles Dashboard</h1>
                <p className="admin-main__sub">Manage LPRES news, press releases, and events content</p>
              </div>
              <Link to="/admin/news/new" className="btn btn-primary">
                <Plus size={16} /> New Article
              </Link>
            </div>

            {/* Stats */}
            <div className="admin-stats">
              <div className="admin-stat-card">
                <div className="admin-stat-card__icon"><Newspaper size={22} /></div>
                <div className="admin-stat-card__num">{articles.length}</div>
                <div className="admin-stat-card__label">Total Articles</div>
              </div>
              <div className="admin-stat-card admin-stat-card--green">
                <div className="admin-stat-card__icon"><CheckCircle size={22} /></div>
                <div className="admin-stat-card__num">{published}</div>
                <div className="admin-stat-card__label">Published</div>
              </div>
              <div className="admin-stat-card admin-stat-card--amber">
                <div className="admin-stat-card__icon"><Clock size={22} /></div>
                <div className="admin-stat-card__num">{drafts}</div>
                <div className="admin-stat-card__label">Drafts</div>
              </div>
            </div>

            {/* Articles table */}
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <h2>All Articles</h2>
              </div>

              {loading ? (
                <div className="admin-loading">Loading articles...</div>
              ) : articles.length === 0 ? (
                <div className="admin-empty">
                  <Newspaper size={40} />
                  <p>No articles yet. Create your first one!</p>
                  <Link to="/admin/news/new" className="btn btn-primary" style={{ marginTop: 12 }}>
                    <Plus size={16} /> Create Article
                  </Link>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Template</th>
                      <th>Date</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((a) => (
                      <tr key={a.id}>
                        <td className="admin-table__title">{a.title}</td>
                        <td><span className="tag">{a.category}</span></td>
                        <td>
                          <span className="admin-table__template">T{a.template}</span>
                        </td>
                        <td className="admin-table__date">
                          {a.event_date ? new Date(a.event_date).toLocaleDateString('en-NG') : '—'}
                        </td>
                        <td>{a.published_by}</td>
                        <td>
                          <span className={`admin-table__status ${a.is_published ? 'published' : 'draft'}`}>
                            {a.is_published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-table__actions">
                            <Link to={`/admin/news/${a.id}/edit`} className="admin-action-btn" title="Edit">
                              <Edit2 size={15} />
                            </Link>
                            <button
                              className={`admin-action-btn ${a.is_published ? 'admin-action-btn--warn' : 'admin-action-btn--green'}`}
                              title={a.is_published ? 'Unpublish' : 'Publish'}
                              onClick={() => handleToggle(a.id)}
                            >
                              {a.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                            <button
                              className="admin-action-btn admin-action-btn--danger"
                              title="Delete"
                              onClick={() => handleDelete(a.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                            {a.is_published && (
                              <a
                                href={`/news/${a.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="admin-action-btn"
                                title="View on site"
                              >
                                <Eye size={15} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : activeTab === 'requests' ? (
          /* Enterprise Trade Requests View */
          <>
            <div className="admin-main__header">
              <div>
                <h1 className="admin-main__title">Enterprise Trade Facilitation Requests</h1>
                <p className="admin-main__sub">Manage L-PRES facilitated buyer-seller trade requests, official inspections (1%), and supply chain logistics</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <select
                  value={requestStatusFilter}
                  onChange={(e) => {
                    setRequestStatusFilter(e.target.value);
                    fetchTradeRequests(e.target.value);
                  }}
                  className="mp-select"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  <option value="">All Statuses</option>
                  <option value="pending_review">Pending Intermediary Review</option>
                  <option value="inspection_scheduled">Inspection Scheduled</option>
                  <option value="logistics_assigned">Logistics Assigned</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button onClick={() => fetchTradeRequests(requestStatusFilter)} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Refresh
                </button>
              </div>
            </div>

            {/* Trade Requests Stats */}
            <div className="admin-stats">
              <div className="admin-stat-card admin-stat-card--green">
                <div className="admin-stat-card__icon"><Award size={22} /></div>
                <div className="admin-stat-card__num">{tradeRequests.length}</div>
                <div className="admin-stat-card__label">Total Trade Requests</div>
              </div>
              <div className="admin-stat-card admin-stat-card--amber">
                <div className="admin-stat-card__icon"><Clock size={22} /></div>
                <div className="admin-stat-card__num">{pendingTradeRequests.length}</div>
                <div className="admin-stat-card__label">Pending Review</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-card__icon"><ShieldCheck size={22} /></div>
                <div className="admin-stat-card__num">{inspectionTradeRequests.length}</div>
                <div className="admin-stat-card__label">1% Inspection Requested</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-card__icon"><Briefcase size={22} /></div>
                <div className="admin-stat-card__num">{logisticsTradeRequests.length}</div>
                <div className="admin-stat-card__label">Logistics Facilitation</div>
              </div>
            </div>

            {/* Trade Requests Table */}
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <h2>L-PRES Intermediary Trade Facilitation Orders</h2>
              </div>

              {tradeRequestsLoading ? (
                <div className="admin-loading">Loading trade requests...</div>
              ) : tradeRequests.length === 0 ? (
                <div className="admin-empty">
                  <Award size={40} />
                  <p>No enterprise trade requests submitted yet.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Req Code / Product</th>
                      <th>Buyer Details</th>
                      <th>Order & Est. Total</th>
                      <th>Facilitation Options</th>
                      <th>Seller Info</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeRequests.map((r) => {
                      const isPending = r.status === 'pending_review';
                      const isCompleted = r.status === 'completed';
                      const isCancelled = r.status === 'cancelled';

                      return (
                        <tr key={r.id}>
                          <td className="admin-table__title">
                            <div style={{ fontWeight: 800, color: '#047857', fontFamily: 'monospace' }}>{r.request_code}</div>
                            <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{r.product_name}</div>
                            <span className="tag" style={{ marginTop: 4 }}>{r.product_category || 'Livestock'}</span>
                          </td>

                          <td>
                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{r.buyer_name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                              <span><Phone size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{r.buyer_phone}</span>
                              <span><Mail size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{r.buyer_email}</span>
                              <span><MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{r.buyer_lga}</span>
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669' }}>
                              ₦{(r.estimated_total?.amount || 0).toLocaleString()} NGN
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 2 }}>
                              Qty: <strong>{r.requested_qty}</strong>
                            </div>
                          </td>

                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {r.include_inspection ? (
                                <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <ShieldCheck size={12} /> Inspection (1% Fee: ₦{(r.inspection_fee || 0).toLocaleString()})
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No Inspection</span>
                              )}

                              {r.request_supply_chain ? (
                                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <Briefcase size={12} /> Logistics Facilitation
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Standard Delivery</span>
                              )}
                            </div>
                          </td>

                          <td>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.seller_name}</div>
                          </td>

                          <td>
                            <span className={`admin-table__status ${isCompleted ? 'published' : isPending ? 'draft' : ''}`} style={{
                              background: isPending ? '#fef3c7' : isCompleted ? '#dcfce7' : isCancelled ? '#fee2e2' : '#e0f2fe',
                              color: isPending ? '#b45309' : isCompleted ? '#15803d' : isCancelled ? '#b91c1c' : '#0369a1',
                              borderColor: isPending ? '#fde68a' : isCompleted ? '#86efac' : isCancelled ? '#fca5a5' : '#7dd3fc',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              {r.status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>

                          <td>
                            <div className="admin-table__actions" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                              {isPending && (
                                <button
                                  className="admin-action-btn admin-action-btn--green"
                                  disabled={requestActionProcessing === r.id}
                                  onClick={() => handleUpdateRequestStatus(r.id, 'inspection_scheduled')}
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#059669', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Schedule Inspection
                                </button>
                              )}

                              {r.status === 'inspection_scheduled' && (
                                <button
                                  className="admin-action-btn"
                                  disabled={requestActionProcessing === r.id}
                                  onClick={() => handleUpdateRequestStatus(r.id, 'logistics_assigned')}
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Assign Logistics
                                </button>
                              )}

                              {(r.status === 'logistics_assigned' || isPending) && (
                                <button
                                  className="admin-action-btn"
                                  disabled={requestActionProcessing === r.id}
                                  onClick={() => handleUpdateRequestStatus(r.id, 'completed')}
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Mark Completed
                                </button>
                              )}

                              {!isCancelled && !isCompleted && (
                                <button
                                  className="admin-action-btn admin-action-btn--danger"
                                  disabled={requestActionProcessing === r.id}
                                  onClick={() => handleUpdateRequestStatus(r.id, 'cancelled')}
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Cancel Request
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          /* Marketplace Verification Requests View */
          <>
            <div className="admin-main__header">
              <div>
                <h1 className="admin-main__title">Marketplace Verification Requests</h1>
                <p className="admin-main__sub">Review and grant official L-PRES Marketer Verification Badges to Kwara livestock and agro sellers</p>
              </div>
              <button onClick={fetchVerifications} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Refresh List
              </button>
            </div>

            {/* Verification Stats */}
            <div className="admin-stats">
              <div className="admin-stat-card admin-stat-card--amber">
                <div className="admin-stat-card__icon"><Clock size={22} /></div>
                <div className="admin-stat-card__num">{pendingVerifications.length}</div>
                <div className="admin-stat-card__label">Pending Applications</div>
              </div>
              <div className="admin-stat-card admin-stat-card--green">
                <div className="admin-stat-card__icon"><ShieldCheck size={22} /></div>
                <div className="admin-stat-card__num">{verifiedMarketers.length}</div>
                <div className="admin-stat-card__label">Verified Marketers</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-card__icon"><UserCheck size={22} /></div>
                <div className="admin-stat-card__num">{verifications.length}</div>
                <div className="admin-stat-card__label">Total Applications</div>
              </div>
            </div>

            {/* Verification Requests Table */}
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <h2>All Marketer Verification Applications</h2>
              </div>

              {verificationsLoading ? (
                <div className="admin-loading">Loading verification requests...</div>
              ) : verifications.length === 0 ? (
                <div className="admin-empty">
                  <ShieldCheck size={40} />
                  <p>No marketer verification applications submitted yet.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Marketer Name & Contact</th>
                      <th>LGA & Location</th>
                      <th>Farm / Enterprise</th>
                      <th>Cooperative & Reg / NIN</th>
                      <th>Status</th>
                      <th>Submitted Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((v) => {
                      const details = v.verification_details || {};
                      const isPending = v.verification_status === 'pending';
                      const isVerified = v.verification_status === 'verified';
                      const isRejected = v.verification_status === 'rejected';

                      return (
                        <tr key={v.id}>
                          <td className="admin-table__title">
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{v.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                              <span><Mail size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{v.email}</span>
                              <span><Phone size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{v.phone || 'N/A'}</span>
                            </div>
                          </td>

                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, color: '#059669' }}>
                              <MapPin size={14} /> {v.lga || 'N/A'} LGA
                            </span>
                          </td>

                          <td>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>
                              {details.farm_name ? <><Building size={14} style={{ verticalAlign: 'middle', marginRight: 4, color: '#059669' }} />{details.farm_name}</> : '—'}
                            </div>
                            {details.notes && (
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, fontStyle: 'italic', maxWidth: 220 }}>
                                "{details.notes}"
                              </div>
                            )}
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                              {details.coop_name || 'Individual Seller'}
                            </div>
                            {details.nin_reg && (
                              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: 2 }}>
                                NIN/Reg: {details.nin_reg}
                              </div>
                            )}
                          </td>

                          <td>
                            {isVerified ? (
                              <span className="admin-table__status published" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <ShieldCheck size={14} /> Verified Marketer
                              </span>
                            ) : isPending ? (
                              <span className="admin-table__status draft" style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fde68a', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={14} /> Pending Review
                              </span>
                            ) : (
                              <span className="admin-table__status draft" style={{ background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <X size={14} /> Rejected
                              </span>
                            )}
                          </td>

                          <td className="admin-table__date">
                            {v.created_at ? new Date(v.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </td>

                          <td>
                            <div className="admin-table__actions">
                              {!isVerified && (
                                <button
                                  className="admin-action-btn admin-action-btn--green"
                                  title="Approve & Verify Marketer"
                                  disabled={actionProcessing === v.id}
                                  onClick={() => handleVerificationAction(v.id, 'approve')}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.35rem 0.65rem', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                                >
                                  <Check size={14} /> Approve Badge
                                </button>
                              )}

                              {!isRejected && (
                                <button
                                  className="admin-action-btn admin-action-btn--danger"
                                  title="Reject Verification Request"
                                  disabled={actionProcessing === v.id}
                                  onClick={() => handleVerificationAction(v.id, 'reject')}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.35rem 0.65rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                                >
                                  <X size={14} /> Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
