import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { newsAPI } from '../../api/client';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, LogOut,
  Newspaper, CheckCircle, Clock, LayoutDashboard,
} from 'lucide-react';
import './Admin.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = () => {
    newsAPI.adminList()
      .then((res) => setArticles(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchArticles, []);

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

  const published = articles.filter(a => a.is_published).length;
  const drafts = articles.filter(a => !a.is_published).length;

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
          <div className="admin-sidebar__nav-item active">
            <LayoutDashboard size={18} />
            Dashboard
          </div>
          <Link to="/admin/news/new" className="admin-sidebar__nav-item">
            <Plus size={18} />
            New Article
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
        <div className="admin-main__header">
          <div>
            <h1 className="admin-main__title">Dashboard</h1>
            <p className="admin-main__sub">Manage LPRES news and events content</p>
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
      </main>
    </div>
  );
}
