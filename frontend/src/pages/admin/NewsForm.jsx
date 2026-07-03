import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { newsAPI } from '../../api/client';
import { Save, ArrowLeft, Upload, X, Image, LayoutTemplate, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import './Admin.css';

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const CATEGORIES = ['News', 'Events', 'Research', 'Technology', 'Policy', 'Announcement'];
const TEMPLATES = [
  {
    id: 1,
    name: 'Magazine Style',
    desc: 'Large feature image on left sidebar, article content on right.',
    preview: '[ Image ] [ Title + Body ]',
  },
  {
    id: 2,
    name: 'Classic Article',
    desc: 'Full-width header image, centred reading column, info sidebar.',
    preview: '[ Full-Width Hero Image ]\n[ Body ] [ Sidebar ]',
  },
  {
    id: 3,
    name: 'Event Timeline',
    desc: 'Prominent date display, photo gallery grid, timeline-style body.',
    preview: '[ Date Block ] [ Title ]\n[ Gallery Grid ]\n[ Body ]',
  },
];

export default function NewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const featuredRef = useRef();
  const galleryRef = useRef();

  const [form, setForm] = useState({
    title: '',
    body: '',
    event_date: '',
    published_by: '',
    template: 1,
    is_published: false,
    excerpt: '',
    category: 'News',
  });
  const [featuredFile, setFeaturedFile] = useState(null);
  const [featuredPreview, setFeaturedPreview] = useState('');
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingFeatured, setExistingFeatured] = useState('');
  const [existingGallery, setExistingGallery] = useState([]);
  const [saving, setSaving] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!isEdit) return;
    newsAPI.adminList()
      .then((res) => {
        const article = res.data.find(a => a.id === Number(id));
        if (!article) return navigate('/admin/dashboard');
        setForm({
          title: article.title,
          body: article.body,
          event_date: article.event_date || '',
          published_by: article.published_by,
          template: article.template,
          is_published: article.is_published,
          excerpt: article.excerpt || '',
          category: article.category,
        });
        if (article.featured_image) setExistingFeatured(article.featured_image);
        if (article.images?.length) setExistingGallery(article.images);
      });
  }, [id, isEdit]);

  const handleFeatured = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeaturedFile(file);
    setFeaturedPreview(URL.createObjectURL(file));
  };

  const handleGallery = (e) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeGallery = (i) => {
    setGalleryFiles(prev => prev.filter((_, idx) => idx !== i));
    setGalleryPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Convert any File objects to base64 data URLs before sending JSON
      let featured_image = existingFeatured || null;
      if (featuredFile) featured_image = await fileToDataURL(featuredFile);

      let images = [...existingGallery];
      if (galleryFiles.length > 0) {
        const newImgs = await Promise.all(galleryFiles.map(fileToDataURL));
        images = [...images, ...newImgs];
      }

      const payload = { ...form, featured_image, images };

      if (isEdit) {
        await newsAPI.update(id, payload);
        toast.success('Article updated successfully!');
      } else {
        await newsAPI.create(payload);
        toast.success('Article created successfully!');
      }
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* Simple top bar for the form */}
      <div className="admin-form-topbar">
        <Link to="/admin/dashboard" className="admin-form-back">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <h1 className="admin-form-title">{isEdit ? 'Edit Article' : 'New Article'}</h1>
        <div className="admin-form-topbar-actions">
          <button
            type="button"
            className="btn btn-dark"
            onClick={() => setForm(f => ({...f, is_published: false}))}
          >
            Save Draft
          </button>
          <button
            type="button"
            className="btn btn-primary"
            form="news-form"
            onClick={() => {
              setForm(f => ({...f, is_published: true}));
              document.getElementById('news-form').requestSubmit();
            }}
          >
            <Eye size={15} />
            {isEdit ? 'Update & Publish' : 'Publish'}
          </button>
        </div>
      </div>

      <form id="news-form" onSubmit={handleSubmit} className="admin-form-layout">
        {/* Left: Main fields */}
        <div className="admin-form-main">
          <div className="admin-form-card">
            <div className="admin-field">
              <label>Article Title <span className="admin-field__req">*</span></label>
              <input
                type="text"
                placeholder="Enter a compelling article title..."
                value={form.title}
                onChange={e => setForm(f => ({...f, title: e.target.value}))}
                required
                className="admin-field__large"
              />
            </div>

            <div className="admin-field">
              <label>Excerpt / Summary</label>
              <textarea
                rows={3}
                placeholder="Brief summary shown in article cards (auto-generated from body if empty)"
                value={form.excerpt}
                onChange={e => setForm(f => ({...f, excerpt: e.target.value}))}
              />
            </div>

            <div className="admin-field">
              <label>Article Body <span className="admin-field__req">*</span></label>
              <div className="admin-rich-hint">
                You can use basic HTML tags: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;blockquote&gt;
              </div>
              <textarea
                rows={18}
                placeholder="<p>Write your article content here. HTML is supported for formatting.</p>"
                value={form.body}
                onChange={e => setForm(f => ({...f, body: e.target.value}))}
                required
                className="admin-field__mono"
              />
            </div>
          </div>

          {/* Template picker */}
          <div className="admin-form-card">
            <h3 className="admin-card-title">
              <LayoutTemplate size={18} /> Article Template
            </h3>
            <div className="template-picker">
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  className={`template-option ${form.template === t.id ? 'active' : ''}`}
                  onClick={() => setForm(f => ({...f, template: t.id}))}
                >
                  <div className="template-option__id">T{t.id}</div>
                  <div className="template-option__info">
                    <div className="template-option__name">{t.name}</div>
                    <div className="template-option__desc">{t.desc}</div>
                    <pre className="template-option__preview">{t.preview}</pre>
                  </div>
                  <div className={`template-option__check ${form.template === t.id ? 'active' : ''}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sidebar fields */}
        <aside className="admin-form-sidebar">
          {/* Publish settings */}
          <div className="admin-form-card">
            <h3 className="admin-card-title">Publish Settings</h3>

            <div className="admin-field">
              <label>Published By <span className="admin-field__req">*</span></label>
              <input
                type="text"
                placeholder="Author name"
                value={form.published_by}
                onChange={e => setForm(f => ({...f, published_by: e.target.value}))}
                required
              />
            </div>

            <div className="admin-field">
              <label>Event / Publication Date</label>
              <input
                type="date"
                value={form.event_date}
                onChange={e => setForm(f => ({...f, event_date: e.target.value}))}
              />
            </div>

            <div className="admin-field">
              <label>Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({...f, category: e.target.value}))}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="admin-field admin-field--toggle">
              <label>Status</label>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={e => setForm(f => ({...f, is_published: e.target.checked}))}
                />
                <span className="admin-toggle__slider" />
                <span className="admin-toggle__label">
                  {form.is_published ? 'Published' : 'Draft'}
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : (isEdit ? 'Update Article' : 'Save Article')}
            </button>
          </div>

          {/* Featured image */}
          <div className="admin-form-card">
            <h3 className="admin-card-title"><Image size={16} /> Featured Image</h3>
            <div
              className="admin-upload-zone"
              onClick={() => featuredRef.current?.click()}
            >
              {featuredPreview || existingFeatured ? (
                <img
                  src={featuredPreview || (existingFeatured.startsWith('http') || existingFeatured.startsWith('data:') ? existingFeatured : `${API_BASE}${existingFeatured}`)}
                  alt="Featured"
                  className="admin-upload-preview"
                />
              ) : (
                <>
                  <Upload size={28} />
                  <span>Click to upload featured image</span>
                  <span className="admin-upload-hint">JPG, PNG, WebP · Max 10 MB</span>
                </>
              )}
            </div>
            <input type="file" accept="image/*" ref={featuredRef} onChange={handleFeatured} style={{ display: 'none' }} />
            {(featuredPreview || existingFeatured) && (
              <button
                type="button"
                className="admin-upload-remove"
                onClick={() => { setFeaturedFile(null); setFeaturedPreview(''); setExistingFeatured(''); }}
              >
                <X size={14} /> Remove image
              </button>
            )}
          </div>

          {/* Gallery images */}
          <div className="admin-form-card">
            <h3 className="admin-card-title"><Image size={16} /> Gallery Images</h3>

            {(existingGallery.length > 0 || galleryPreviews.length > 0) && (
              <div className="admin-gallery-grid">
                {existingGallery.map((img, i) => {
                  const src = (img.startsWith('http') || img.startsWith('data:')) ? img : `${API_BASE}${img}`;
                  return <img key={`existing-${i}`} src={src} alt="" className="admin-gallery-thumb" />;
                })}
                {galleryPreviews.map((src, i) => (
                  <div key={`new-${i}`} className="admin-gallery-thumb-wrap">
                    <img src={src} alt="" className="admin-gallery-thumb" />
                    <button type="button" className="admin-gallery-remove" onClick={() => removeGallery(i)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              className="admin-upload-zone admin-upload-zone--sm"
              onClick={() => galleryRef.current?.click()}
            >
              <Upload size={20} />
              <span>Add gallery images</span>
            </div>
            <input type="file" accept="image/*" multiple ref={galleryRef} onChange={handleGallery} style={{ display: 'none' }} />
          </div>
        </aside>
      </form>
    </div>
  );
}
