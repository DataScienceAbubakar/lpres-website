import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectsAPI } from '../../api/client';
import {
  Plus, Trash2, Eye, EyeOff, Edit2, LogOut, X, Upload,
  LayoutDashboard, Newspaper, FolderOpen, Briefcase, MapPin, Images,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Admin.css';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const STATUS_OPTIONS = ['Active', 'Completed', 'Planned'];
const LGA_LIST = [
  'Asa','Baruten','Edu','Ekiti','Ifelodun','Ilorin East','Ilorin South','Ilorin West',
  'Irepodun','Isin','Kaiama','Moro','Offa','Oke Ero','Oyun','Pategi',
];

function mediaUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

function ProjectForm({ project, onClose, onSaved }) {
  const isEdit = !!project;
  const [form, setForm] = useState({
    name: project?.name || '',
    lga: project?.lga || LGA_LIST[0],
    cluster: project?.cluster || '',
    description: project?.description || '',
    status: project?.status || 'Active',
    is_published: project?.is_published ?? true,
    sort_order: project?.sort_order ?? 0,
    highlights: project?.highlights?.join('\n') || '',
  });

  // Cover image
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(
    project?.cover_image ? mediaUrl(project.cover_image) : null
  );
  const coverRef = useRef();

  // Gallery images
  const [keepImages, setKeepImages] = useState(project?.images || []);
  const [extraFiles, setExtraFiles] = useState([]);      // new File objects
  const [extraPreviews, setExtraPreviews] = useState([]); // blob URLs for new files
  const extraRef = useRef();

  const [saving, setSaving] = useState(false);

  // Revoke blob URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      extraPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCover = (f) => {
    setCoverFile(f);
    if (f) setCoverPreview(URL.createObjectURL(f));
  };

  const handleExtraFiles = (files) => {
    const arr = Array.from(files);
    setExtraFiles(prev => [...prev, ...arr]);
    const previews = arr.map(f => URL.createObjectURL(f));
    setExtraPreviews(prev => [...prev, ...previews]);
  };

  const removeExtraFile = (idx) => {
    URL.revokeObjectURL(extraPreviews[idx]);
    setExtraFiles(prev => prev.filter((_, i) => i !== idx));
    setExtraPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const removeKeepImage = (url) => {
    setKeepImages(prev => prev.filter(u => u !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Project name required'); return; }
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('lga', form.lga);
    fd.append('cluster', form.cluster);
    fd.append('description', form.description);
    fd.append('status', form.status);
    fd.append('is_published', form.is_published);
    fd.append('sort_order', form.sort_order);
    const highlightsList = form.highlights.split('\n').map(h => h.trim()).filter(Boolean);
    fd.append('highlights', JSON.stringify(highlightsList));
    if (coverFile) fd.append('cover_image', coverFile);
    // Gallery images
    fd.append('keep_images', JSON.stringify(keepImages));
    for (const f of extraFiles) fd.append('images', f);

    setSaving(true);
    try {
      if (isEdit) {
        await projectsAPI.update(project.id, fd);
        toast.success('Project updated');
      } else {
        await projectsAPI.create(fd);
        toast.success('Project created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="gm-modal-overlay" onClick={onClose}>
      <div className="gm-modal gm-modal--wide" onClick={e => e.stopPropagation()}>
        <div className="gm-modal__head">
          <h3 className="gm-modal__title">{isEdit ? 'Edit Project' : 'Add Project'}</h3>
          <button className="gm-modal__close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="gm-modal__body">

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="admin-field">
              <label>Project Name <span className="admin-field__req">*</span></label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ilorin Livestock Grazing Reserve" required />
            </div>
            <div className="admin-field">
              <label>LGA <span className="admin-field__req">*</span></label>
              <select value={form.lga} onChange={e => set('lga', e.target.value)}>
                {LGA_LIST.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 12 }}>
            <div className="admin-field">
              <label>Cluster / Zone</label>
              <input value={form.cluster} onChange={e => set('cluster', e.target.value)} placeholder="e.g. Kwara Central" />
            </div>
            <div className="admin-field">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>Order</label>
              <input type="number" value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} min={0} />
            </div>
          </div>

          <div className="admin-field">
            <label>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Project description…" />
          </div>

          <div className="admin-field">
            <label>Key Highlights (one per line)</label>
            <textarea
              value={form.highlights}
              onChange={e => set('highlights', e.target.value)}
              rows={4}
              placeholder={"Over 500 farmers trained\n12 water points constructed\n…"}
            />
          </div>

          {/* ── Cover Image ── */}
          <div className="admin-field">
            <label>Cover Image</label>
            <input ref={coverRef} type="file" accept="image/*"
              onChange={e => handleCover(e.target.files[0])}
              style={{ display: 'none' }}
            />
            {coverPreview ? (
              <div>
                <img src={coverPreview} alt="cover" className="admin-upload-preview" />
                <button type="button" className="admin-upload-remove"
                  onClick={() => { setCoverFile(null); setCoverPreview(null); coverRef.current.value = ''; }}>
                  <X size={12} /> Remove
                </button>
              </div>
            ) : (
              <div className="admin-upload-zone" onClick={() => coverRef.current.click()}>
                <Upload size={20} />
                <span>Click to choose cover image</span>
                <span className="admin-upload-hint">JPEG, PNG — max 15 MB</span>
              </div>
            )}
          </div>

          {/* ── Gallery Photos ── */}
          <div className="admin-field">
            <label><Images size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Gallery Photos</label>

            {/* Existing images grid */}
            {keepImages.length > 0 && (
              <div className="pm-gallery-grid">
                {keepImages.map(url => (
                  <div key={url} className="pm-gallery-thumb">
                    <img src={mediaUrl(url)} alt="" onError={e => { e.currentTarget.style.opacity = '0.3'; }} />
                    <button type="button" className="pm-gallery-remove" onClick={() => removeKeepImage(url)}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New file previews */}
            {extraPreviews.length > 0 && (
              <div className="pm-gallery-grid pm-gallery-grid--new">
                {extraPreviews.map((url, i) => (
                  <div key={i} className="pm-gallery-thumb pm-gallery-thumb--new">
                    <img src={url} alt="" />
                    <button type="button" className="pm-gallery-remove" onClick={() => removeExtraFile(i)}>
                      <X size={10} />
                    </button>
                    <span className="pm-gallery-new-badge">New</span>
                  </div>
                ))}
              </div>
            )}

            {/* Add photos zone */}
            <input
              ref={extraRef}
              type="file"
              accept="image/*"
              multiple
              onChange={e => { handleExtraFiles(e.target.files); extraRef.current.value = ''; }}
              style={{ display: 'none' }}
            />
            <div className="admin-upload-zone admin-upload-zone--sm" onClick={() => extraRef.current.click()}>
              <Upload size={16} />
              <span>Add photos</span>
              <span className="admin-upload-hint">Select multiple · JPEG, PNG</span>
            </div>
          </div>

          <label className="admin-toggle" style={{ marginBottom: 20 }}>
            <input type="checkbox" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} />
            <span className="admin-toggle__slider" />
            <span className="admin-toggle__label">Published (visible on site)</span>
          </label>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsManager() {
  const { admin, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchProjects = () => {
    setLoading(true);
    projectsAPI.adminList()
      .then(res => setProjects(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchProjects, []);

  const handleToggle = async (id) => {
    await projectsAPI.togglePublish(id);
    fetchProjects();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project permanently?')) return;
    await projectsAPI.delete(id);
    toast.success('Project deleted');
    fetchProjects();
  };

  const active    = projects.filter(p => p.status === 'Active').length;
  const completed = projects.filter(p => p.status === 'Completed').length;
  const published = projects.filter(p => p.is_published).length;

  return (
    <div className="admin-layout">
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
          <Link to="/admin/gallery" className="admin-sidebar__nav-item"><FolderOpen size={18} /> Gallery</Link>
          <Link to="/admin/projects" className="admin-sidebar__nav-item active"><Briefcase size={18} /> Projects</Link>
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

      <main className="admin-main">
        <div className="admin-main__header">
          <div>
            <h1 className="admin-main__title">Projects</h1>
            <p className="admin-main__sub">Add and manage project sites shown on the website</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal('new')}>
            <Plus size={16} /> Add Project
          </button>
        </div>

        <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="admin-stat-card">
            <div className="admin-stat-card__icon"><Briefcase size={22} /></div>
            <div className="admin-stat-card__num">{projects.length}</div>
            <div className="admin-stat-card__label">Total Projects</div>
          </div>
          <div className="admin-stat-card admin-stat-card--green">
            <div className="admin-stat-card__icon"><MapPin size={22} /></div>
            <div className="admin-stat-card__num">{active}</div>
            <div className="admin-stat-card__label">Active</div>
          </div>
          <div className="admin-stat-card admin-stat-card--amber">
            <div className="admin-stat-card__icon"><MapPin size={22} /></div>
            <div className="admin-stat-card__num">{completed}</div>
            <div className="admin-stat-card__label">Completed</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-card__icon"><Eye size={22} /></div>
            <div className="admin-stat-card__num">{published}</div>
            <div className="admin-stat-card__label">Published</div>
          </div>
        </div>

        <div className="admin-table-wrap">
          <div className="admin-table-header"><h2>All Projects</h2></div>
          {loading ? (
            <div className="admin-loading">Loading…</div>
          ) : projects.length === 0 ? (
            <div className="admin-empty">
              <Briefcase size={40} />
              <p>No projects yet. Add your first project site!</p>
              <button className="btn btn-primary" onClick={() => setModal('new')} style={{ marginTop: 12 }}>
                <Plus size={16} /> Add Project
              </button>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Name</th>
                  <th>LGA</th>
                  <th>Cluster</th>
                  <th>Photos</th>
                  <th>Status</th>
                  <th>Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id}>
                    <td>
                      {p.cover_image ? (
                        <img src={mediaUrl(p.cover_image)} alt="" className="gm-thumb"
                          onError={e => { e.currentTarget.style.display='none'; }} />
                      ) : (
                        <div className="gm-thumb-placeholder"><Briefcase size={14} /></div>
                      )}
                    </td>
                    <td className="admin-table__title">{p.name}</td>
                    <td>{p.lga}</td>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>{p.cluster || '—'}</td>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>
                      {(p.images?.length || 0) + (p.cover_image ? 1 : 0)} photo{(p.images?.length || 0) + (p.cover_image ? 1 : 0) !== 1 ? 's' : ''}
                    </td>
                    <td>
                      <span className={`gm-status-badge gm-status-badge--${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-table__status ${p.is_published ? 'published' : 'draft'}`}>
                        {p.is_published ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button className="admin-action-btn" title="Edit" onClick={() => setModal(p)}>
                          <Edit2 size={15} />
                        </button>
                        <button
                          className={`admin-action-btn ${p.is_published ? 'admin-action-btn--warn' : 'admin-action-btn--green'}`}
                          title={p.is_published ? 'Hide' : 'Publish'}
                          onClick={() => handleToggle(p.id)}
                        >
                          {p.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button className="admin-action-btn admin-action-btn--danger"
                          title="Delete" onClick={() => handleDelete(p.id)}>
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

      {modal && (
        <ProjectForm
          project={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchProjects}
        />
      )}
    </div>
  );
}
