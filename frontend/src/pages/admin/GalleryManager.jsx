import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { galleryAPI } from '../../api/client';
import {
  Plus, Trash2, Eye, EyeOff, LogOut, LayoutDashboard,
  Image, Video, X, Upload, Newspaper, FolderOpen, Briefcase,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Admin.css';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const CATEGORIES = ['Training', 'Outreach', 'Demonstration', 'Field Work', 'Infrastructure', 'Events', 'Others'];

function mediaUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

function UploadModal({ onClose, onUploaded }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Training', media_type: 'photo',
    is_published: true, sort_order: 0,
  });
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const thumbRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (f) => {
    setFile(f);
    if (f && f.type.startsWith('image/')) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file'); return; }
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('file', file);
    if (thumbnail) fd.append('thumbnail', thumbnail);
    setSaving(true);
    try {
      await galleryAPI.upload(fd);
      toast.success('Item uploaded successfully');
      onUploaded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="gm-modal-overlay" onClick={onClose}>
      <div className="gm-modal" onClick={e => e.stopPropagation()}>
        <div className="gm-modal__head">
          <h3 className="gm-modal__title">Upload Gallery Item</h3>
          <button className="gm-modal__close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="gm-modal__body">
          {/* Type selector */}
          <div className="admin-field">
            <label>Media Type</label>
            <div className="gm-type-row">
              {['photo', 'video'].map(t => (
                <button
                  key={t}
                  type="button"
                  className={`gm-type-opt${form.media_type === t ? ' active' : ''}`}
                  onClick={() => set('media_type', t)}
                >
                  {t === 'photo' ? <Image size={16} /> : <Video size={16} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-field">
            <label>Title <span className="admin-field__req">*</span></label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Vaccination drive in Baruten" required />
          </div>

          <div className="admin-field">
            <label>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Brief description…" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="admin-field">
              <label>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} min={0} />
            </div>
          </div>

          {/* File upload */}
          <div className="admin-field">
            <label>{form.media_type === 'video' ? 'Video File' : 'Image File'} <span className="admin-field__req">*</span></label>
            <input ref={fileRef} type="file"
              accept={form.media_type === 'video' ? 'video/*' : 'image/*'}
              onChange={e => handleFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
            {preview ? (
              <div>
                <img src={preview} alt="preview" className="admin-upload-preview" />
                <button type="button" className="admin-upload-remove" onClick={() => { setFile(null); setPreview(null); fileRef.current.value = ''; }}>
                  <X size={12} /> Remove
                </button>
              </div>
            ) : file ? (
              <div className="gm-file-chosen">
                {form.media_type === 'video' ? <Video size={18} /> : <Image size={18} />}
                <span>{file.name}</span>
                <button type="button" onClick={() => { setFile(null); fileRef.current.value = ''; }}><X size={12} /></button>
              </div>
            ) : (
              <div className="admin-upload-zone" onClick={() => fileRef.current.click()}>
                <Upload size={20} />
                <span>Click to choose {form.media_type === 'video' ? 'video' : 'image'}</span>
                <span className="admin-upload-hint">{form.media_type === 'video' ? 'MP4, WebM, max 300 MB' : 'JPEG, PNG, WebP, max 15 MB'}</span>
              </div>
            )}
          </div>

          {/* Thumbnail for video */}
          {form.media_type === 'video' && (
            <div className="admin-field">
              <label>Thumbnail Image (optional)</label>
              <input ref={thumbRef} type="file" accept="image/*"
                onChange={e => setThumbnail(e.target.files[0])}
                style={{ display: 'none' }}
              />
              {thumbnail ? (
                <div className="gm-file-chosen">
                  <Image size={16} />
                  <span>{thumbnail.name}</span>
                  <button type="button" onClick={() => { setThumbnail(null); thumbRef.current.value = ''; }}><X size={12} /></button>
                </div>
              ) : (
                <div className="admin-upload-zone admin-upload-zone--sm" onClick={() => thumbRef.current.click()}>
                  <Upload size={16} /> Choose thumbnail image
                </div>
              )}
            </div>
          )}

          <label className="admin-toggle" style={{ marginBottom: 20 }}>
            <input type="checkbox" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} />
            <span className="admin-toggle__slider" />
            <span className="admin-toggle__label">Publish immediately</span>
          </label>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Uploading…' : 'Upload Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GalleryManager() {
  const { admin, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const fetchItems = () => {
    setLoading(true);
    galleryAPI.adminList()
      .then(res => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchItems, []);

  const handleToggle = async (id) => {
    await galleryAPI.togglePublish(id);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this gallery item permanently?')) return;
    await galleryAPI.delete(id);
    toast.success('Item deleted');
    fetchItems();
  };

  const filtered = filterType === 'all' ? items : items.filter(i => i.media_type === filterType);
  const photos = items.filter(i => i.media_type === 'photo').length;
  const videos = items.filter(i => i.media_type === 'video').length;
  const published = items.filter(i => i.is_published).length;

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
          <Link to="/admin/dashboard" className="admin-sidebar__nav-item"><LayoutDashboard size={18} /> Dashboard</Link>
          <Link to="/admin/gallery" className="admin-sidebar__nav-item active"><FolderOpen size={18} /> Gallery</Link>
          <Link to="/admin/projects" className="admin-sidebar__nav-item"><Briefcase size={18} /> Projects</Link>
          <Link to="/admin/news/new" className="admin-sidebar__nav-item"><Newspaper size={18} /> New Article</Link>
        </nav>
        <div className="admin-sidebar__user">
          <div className="admin-sidebar__avatar">{admin?.username?.[0]?.toUpperCase()}</div>
          <div>
            <div className="admin-sidebar__uname">{admin?.username}</div>
            <div className="admin-sidebar__uemail">{admin?.email}</div>
          </div>
          <button className="admin-sidebar__logout" onClick={() => { logout(); }} title="Sign out"><LogOut size={16} /></button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-main__header">
          <div>
            <h1 className="admin-main__title">Gallery</h1>
            <p className="admin-main__sub">Manage photos and videos for the public gallery</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
            <Plus size={16} /> Upload Item
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="admin-stat-card">
            <div className="admin-stat-card__icon"><FolderOpen size={22} /></div>
            <div className="admin-stat-card__num">{items.length}</div>
            <div className="admin-stat-card__label">Total Items</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-card__icon"><Image size={22} /></div>
            <div className="admin-stat-card__num">{photos}</div>
            <div className="admin-stat-card__label">Photos</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-card__icon"><Video size={22} /></div>
            <div className="admin-stat-card__num">{videos}</div>
            <div className="admin-stat-card__label">Videos</div>
          </div>
          <div className="admin-stat-card admin-stat-card--green">
            <div className="admin-stat-card__icon"><Eye size={22} /></div>
            <div className="admin-stat-card__num">{published}</div>
            <div className="admin-stat-card__label">Published</div>
          </div>
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[['all', 'All'], ['photo', 'Photos'], ['video', 'Videos']].map(([v, l]) => (
            <button key={v} className={`gp__cat-btn${filterType === v ? ' gp__cat-btn--active' : ''}`}
              onClick={() => setFilterType(v)}>{l}</button>
          ))}
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <h2>All Gallery Items ({filtered.length})</h2>
          </div>
          {loading ? (
            <div className="admin-loading">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">
              <FolderOpen size={40} />
              <p>No items yet. Upload your first photo or video!</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="gm-thumb-cell">
                        {(item.thumbnail_url || item.media_type === 'photo') && (
                          <img
                            src={mediaUrl(item.thumbnail_url || item.file_url)}
                            alt=""
                            className="gm-thumb"
                            onError={e => { e.currentTarget.style.display='none'; }}
                          />
                        )}
                        {item.media_type === 'video' && !item.thumbnail_url && (
                          <div className="gm-thumb-placeholder"><Video size={16} /></div>
                        )}
                      </div>
                    </td>
                    <td className="admin-table__title">{item.title}</td>
                    <td>
                      <span className={`gm-type-badge gm-type-badge--${item.media_type}`}>
                        {item.media_type === 'photo' ? <Image size={11} /> : <Video size={11} />}
                        {item.media_type}
                      </span>
                    </td>
                    <td><span className="tag">{item.category}</span></td>
                    <td style={{ textAlign: 'center' }}>{item.sort_order}</td>
                    <td>
                      <span className={`admin-table__status ${item.is_published ? 'published' : 'draft'}`}>
                        {item.is_published ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          className={`admin-action-btn ${item.is_published ? 'admin-action-btn--warn' : 'admin-action-btn--green'}`}
                          title={item.is_published ? 'Hide' : 'Publish'}
                          onClick={() => handleToggle(item.id)}
                        >
                          {item.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <a href={mediaUrl(item.file_url)} target="_blank" rel="noreferrer"
                          className="admin-action-btn" title="View file">
                          <Eye size={15} />
                        </a>
                        <button className="admin-action-btn admin-action-btn--danger"
                          title="Delete" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUploaded={fetchItems} />
      )}
    </div>
  );
}
