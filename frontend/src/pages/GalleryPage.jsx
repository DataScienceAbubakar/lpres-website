import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X, ChevronLeft, ChevronRight as ChevRight, Play, Image, Video } from 'lucide-react';
import { galleryAPI } from '../api/client';
import './GalleryPage.css';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const STATIC_CATEGORIES = ['Training', 'Outreach', 'Demonstration', 'Field Work', 'Infrastructure', 'Events', 'Others'];

function mediaUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

function CategoryBadge({ category }) {
  const colors = {
    Training:      '#2e5e35',
    Outreach:      '#0891b2',
    Demonstration: '#7c3aed',
    'Field Work':  '#c49a3e',
    Infrastructure:'#d97706',
    Events:        '#dc2626',
    Others:        '#6b7280',
  };
  const bg = colors[category] || '#6b7280';
  return (
    <span className="gp__badge" style={{ background: `${bg}22`, color: bg, borderColor: `${bg}44` }}>
      {category}
    </span>
  );
}

function MediaCard({ item, onClick }) {
  const isVideo = item.media_type === 'video';
  const thumb = isVideo ? (item.thumbnail_url ? mediaUrl(item.thumbnail_url) : null) : mediaUrl(item.file_url);

  return (
    <div className="gp__card" onClick={() => onClick(item)} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(item)}>
      <div className="gp__card-media">
        {thumb ? (
          <img src={thumb} alt={item.title} className="gp__card-img" loading="lazy" />
        ) : (
          <div className="gp__card-placeholder">
            {isVideo ? <Video size={32} /> : <Image size={32} />}
          </div>
        )}
        {isVideo && (
          <div className="gp__card-play"><Play size={22} fill="white" /></div>
        )}
        <div className="gp__card-hover">
          <span className="gp__card-view">View {isVideo ? 'Video' : 'Photo'}</span>
        </div>
      </div>
      <div className="gp__card-body">
        <CategoryBadge category={item.category} />
        <h3 className="gp__card-title">{item.title}</h3>
        {item.description && (
          <p className="gp__card-desc">{item.description}</p>
        )}
      </div>
    </div>
  );
}

function Lightbox({ items, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const item = items[idx];
  const total = items.length;

  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  if (!item) return null;

  return (
    <div className="gp__lightbox" onClick={onClose}>
      <div className="gp__lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="gp__lb-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="gp__lb-media">
          {item.media_type === 'video' ? (
            <video
              key={item.id}
              src={mediaUrl(item.file_url)}
              className="gp__lb-video"
              controls
              autoPlay
            />
          ) : (
            <img src={mediaUrl(item.file_url)} alt={item.title} className="gp__lb-img" />
          )}
        </div>

        <div className="gp__lb-caption">
          <CategoryBadge category={item.category} />
          <h3 className="gp__lb-title">{item.title}</h3>
          {item.description && <p className="gp__lb-desc">{item.description}</p>}
          <span className="gp__lb-count">{idx + 1} / {total}</span>
        </div>

        {total > 1 && (
          <>
            <button className="gp__lb-nav gp__lb-nav--prev" onClick={prev} aria-label="Previous">
              <ChevronLeft size={24} />
            </button>
            <button className="gp__lb-nav gp__lb-nav--next" onClick={next} aria-label="Next">
              <ChevRight size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [items, setItems]               = useState([]);
  const [categories, setCategories]     = useState([]);
  const [activeCategory, setActiveCat]  = useState('All');
  const [activeType, setActiveType]     = useState('all');
  const [loading, setLoading]           = useState(true);
  const [lightbox, setLightbox]         = useState(null);
  const [page, setPage]                 = useState(0);
  const [hasMore, setHasMore]           = useState(true);
  const LIMIT = 24;

  useEffect(() => {
    galleryAPI.categories()
      .then(res => setCategories(res.data))
      .catch(() => {});
  }, []);

  const fetchItems = useCallback((reset = false) => {
    const skip = reset ? 0 : page * LIMIT;
    setLoading(true);
    galleryAPI.list({
      category:   activeCategory === 'All' ? undefined : activeCategory,
      media_type: activeType === 'all' ? undefined : activeType,
      skip,
      limit: LIMIT,
    })
      .then(res => {
        const newItems = res.data;
        setItems(prev => reset ? newItems : [...prev, ...newItems]);
        setHasMore(newItems.length === LIMIT);
        if (reset) setPage(1); else setPage(p => p + 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, activeType, page]);

  useEffect(() => {
    setPage(0);
    setItems([]);
    setHasMore(true);
    setLoading(true);
    galleryAPI.list({
      category:   activeCategory === 'All' ? undefined : activeCategory,
      media_type: activeType === 'all' ? undefined : activeType,
      skip: 0,
      limit: LIMIT,
    })
      .then(res => {
        setItems(res.data);
        setHasMore(res.data.length === LIMIT);
        setPage(1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, activeType]);

  const openLightbox = useCallback((item) => {
    const idx = items.findIndex(i => i.id === item.id);
    setLightbox(idx >= 0 ? idx : 0);
  }, [items]);

  const allCats = ['All', ...STATIC_CATEGORIES, ...categories
    .map(c => c.category)
    .filter(c => !STATIC_CATEGORIES.includes(c))
  ];
  const uniqueCats = [...new Set(allCats)];

  const catCountMap = Object.fromEntries(categories.map(c => [c.category, c.count]));

  return (
    <div className="gp">
      {/* Page hero */}
      <div className="gp__hero">
        <div className="gp__hero-bg" />
        <div className="container gp__hero-inner">
          <nav className="gp__breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <span>Gallery</span>
          </nav>
          <h1 className="gp__hero-title">Project Gallery</h1>
          <p className="gp__hero-sub">
            Photos and videos from L-PRES activities across all 16 LGAs of Kwara State
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="gp__filter-bar">
        <div className="container gp__filter-inner">
          {/* Category tabs */}
          <div className="gp__cats">
            {uniqueCats.map(cat => (
              <button
                key={cat}
                className={`gp__cat-btn${activeCategory === cat ? ' gp__cat-btn--active' : ''}`}
                onClick={() => setActiveCat(cat)}
              >
                {cat}
                {cat !== 'All' && catCountMap[cat] ? (
                  <span className="gp__cat-count">{catCountMap[cat]}</span>
                ) : null}
              </button>
            ))}
          </div>

          {/* Type toggle */}
          <div className="gp__type-toggle">
            {[['all', 'All'], ['photo', 'Photos'], ['video', 'Videos']].map(([val, label]) => (
              <button
                key={val}
                className={`gp__type-btn${activeType === val ? ' gp__type-btn--active' : ''}`}
                onClick={() => setActiveType(val)}
              >
                {val === 'photo' && <Image size={13} />}
                {val === 'video' && <Video size={13} />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container gp__body">
        {loading && items.length === 0 ? (
          <div className="gp__loading">
            <div className="gp__spinner" />
            <p>Loading gallery…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="gp__empty">
            <Image size={48} />
            <h3>No items yet</h3>
            <p>Gallery content will appear here once uploaded by the admin.</p>
          </div>
        ) : (
          <>
            <div className="gp__grid">
              {items.map(item => (
                <MediaCard key={item.id} item={item} onClick={openLightbox} />
              ))}
            </div>

            {hasMore && (
              <div className="gp__load-more">
                <button
                  className="btn btn-outline"
                  onClick={() => fetchItems(false)}
                  disabled={loading}
                >
                  {loading ? 'Loading…' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox
          items={items}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
