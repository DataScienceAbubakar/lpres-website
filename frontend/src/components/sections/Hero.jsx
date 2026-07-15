import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Maximize2, Minimize2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import './Hero.css';

/* ─── Inline SVG icons ───────────────────────────────────────── */
const SocialIcons = {
  Facebook: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  Twitter: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  LinkedIn: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  YouTube: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
    </svg>
  ),
};

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

/* ─── Photo carousel slides ──────────────────────────────────── */
const PHOTOS = [
  {
    src: '/hero-bg.jpg',
    title: 'Kwara State Livestock Landscape',
    desc: 'Expansive grazing lands across Kwara State where L-PRES interventions are transforming livestock productivity.',
  },
  {
    src: '/spc-photo.png',
    title: 'State Project Coordination',
    desc: 'L-PRES leadership coordinating strategic implementation across all 16 Local Government Areas of Kwara State.',
  },
  {
    src: null,
    color: 'linear-gradient(135deg, #0f2e12 0%, #2e5e35 100%)',
    title: 'Animal Health Campaigns',
    desc: 'Over 238,000 animals vaccinated through coordinated field campaigns involving veterinary teams and extension agents.',
  },
  {
    src: null,
    color: 'linear-gradient(135deg, #2a1a04 0%, #c49a3e 60%, #8a6a1f 100%)',
    title: 'Value Chain Development',
    desc: 'Strengthening cattle, sheep, and goat value chains through market linkages, processing support, and producer groups.',
  },
  {
    src: null,
    color: 'linear-gradient(135deg, #061420 0%, #0891b2 65%, #06b6d4 100%)',
    title: 'Water Infrastructure',
    desc: '67 water points constructed or rehabilitated to reduce resource conflicts and support livestock production statewide.',
  },
];

/* ─── Map feature type → marker colour ──────────────────────── */
const FEATURE_COLORS = {
  'FULANI SETTLEMENT':        '#f59e0b',
  'STREAM':                   '#3b82f6',
  'GRAZING AREA':             '#22c55e',
  'SCHOOL':                   '#a855f7',
  'PRIMARY HEALTH CARE CENTRE': '#ef4444',
  'POND':                     '#06b6d4',
  'BIG FARM LAND':            '#84cc16',
  'SPECIALIST HOSPITAL':      '#dc2626',
  'HEALTH CENTER':            '#ec4899',
  'WATER POINT':              '#22d3ee',
  'CATTLE MARKET':            '#d97706',
  'LIVESTOCK MARKET':         '#f97316',
  'CROSSING POINT':           '#eab308',
};

/* ─── Documentary panel (YouTube embed) ─────────────────────── */
function VideoPanel() {
  return (
    <iframe
      className="hero__gallery-video"
      src="https://www.youtube.com/embed/J3_FDGXfuGY?autoplay=1&mute=1&loop=1&playlist=J3_FDGXfuGY&rel=0&modestbranding=1&controls=1"
      title="L-PRES Documentary"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}

/* ─── Photo carousel panel ───────────────────────────────────── */
function PhotoPanel() {
  const [idx, setIdx] = useState(0);
  const total = PHOTOS.length;
  const prev = () => setIdx(i => (i - 1 + total) % total);
  const next = () => setIdx(i => (i + 1) % total);
  const photo = PHOTOS[idx];

  return (
    <div className="hero__photo-carousel">
      <div className="hero__photo-slide">
        {photo.src ? (
          <img src={photo.src} alt={photo.title} className="hero__photo-img" />
        ) : (
          <div className="hero__photo-placeholder" style={{ background: photo.color }} />
        )}
        <div className="hero__photo-caption">
          <h4 className="hero__photo-title">{photo.title}</h4>
          <p className="hero__photo-desc">{photo.desc}</p>
          <div className="hero__carousel-dots">
            {PHOTOS.map((_, i) => (
              <button
                key={i}
                className={`hero__carousel-dot${i === idx ? ' hero__carousel-dot--active' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <button className="hero__carousel-btn hero__carousel-prev" onClick={prev} aria-label="Previous">
        <ChevronLeft size={15} />
      </button>
      <button className="hero__carousel-btn hero__carousel-next" onClick={next} aria-label="Next">
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

/* ─── Leaflet map panel ──────────────────────────────────────── */
function MapPanel() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [8.5, 4.7],
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    fetch('/field-survey.json')
      .then(r => r.json())
      .then(geojson => {
        if (!mapRef.current) return;
        L.geoJSON(geojson, {
          pointToLayer: (feature, latlng) => {
            const color = FEATURE_COLORS[feature.properties.Features] || '#c49a3e';
            return L.circleMarker(latlng, {
              radius: 6,
              fillColor: color,
              color: '#fff',
              weight: 1.5,
              opacity: 1,
              fillOpacity: 0.85,
            });
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties;
            layer.bindPopup(
              `<div style="font-size:11px;line-height:1.6;min-width:150px">
                <b style="color:#1a3d1f;font-size:12px">${p['Location Name']}</b><br>
                <span style="color:#666;font-style:italic">${p.Features}</span><br>
                <span style="color:#888">Cluster: ${p.Cluster}</span>
              </div>`,
              { maxWidth: 220 }
            );
          },
        }).addTo(mapRef.current);
      })
      .catch(() => {});

    const onFullscreen = () => setTimeout(() => mapRef.current?.invalidateSize(), 200);
    document.addEventListener('fullscreenchange', onFullscreen);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreen);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="hero__leaflet-map" />;
}

/* ─── Hero section ───────────────────────────────────────────── */
export default function Hero() {
  const [activeGallery, setActiveGallery] = useState('video');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const galleryRef = useRef(null);

  const scrollToAbout = () =>
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const handleFullscreen = useCallback(() => {
    const el = galleryRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  return (
    <section className="hero">
      {/* Background */}
      <div className="hero__bg">
        <img src="/hero-bg.jpg" alt="Kwara livestock landscape" className="hero__bg-img" />
        <div className="hero__overlay" />
      </div>

      {/* Glassmorphic social float — left edge */}
      <div className="hero__social-float">
        <a href="https://facebook.com/lpreskwara"         className="hero__social-icon" aria-label="Facebook"  target="_blank" rel="noopener noreferrer"><SocialIcons.Facebook /></a>
        <a href="https://twitter.com/lpreskwara"          className="hero__social-icon" aria-label="Twitter"   target="_blank" rel="noopener noreferrer"><SocialIcons.Twitter /></a>
        <a href="https://instagram.com/lpreskwara"        className="hero__social-icon" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><SocialIcons.Instagram /></a>
        <a href="https://linkedin.com/company/lpreskwara" className="hero__social-icon" aria-label="LinkedIn"  target="_blank" rel="noopener noreferrer"><SocialIcons.LinkedIn /></a>
        <a href="https://youtube.com/@lpreskwara"         className="hero__social-icon" aria-label="YouTube"   target="_blank" rel="noopener noreferrer"><SocialIcons.YouTube /></a>
        <div className="hero__social-divider" />
        <span className="hero__social-label">Follow</span>
      </div>

      <div className="hero__content container">
        {/* Left: text side */}
        <div className="hero__left">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            Livestock Productivity &amp; Resilience Support Project
          </div>

          <h1 className="hero__title">
            <span className="hero__title-line hero__title-line--1">
              Livestock <em className="hero__title-accent">in motion.</em>
            </span>
            <br />
            <span className="hero__title-line hero__title-line--2">
              Communities <em className="hero__title-accent hero__title-accent--green">in bloom.</em>
            </span>
            <br />
            <span className="hero__title-line hero__title-line--3 hero__title-brand">
              Kwara State L-PRES
            </span>
          </h1>

          <p className="hero__subtitle">
            A statewide programme transforming livestock productivity,
            resilience, and commercialisation, built with the farmers,
            herders, and communities of Kwara.
          </p>

          <div className="hero__ctas">
            <button className="btn btn-primary hero__cta-main" onClick={scrollToAbout}>
              Explore the project
            </button>
            <Link to="/news" className="hero__cta-ghost">
              <span className="hero__play-btn"><Play size={14} /></span>
              Watch our story
            </Link>
          </div>
        </div>

        {/* Right: Field Coverage card */}
        <div className="hero__right">
          <div className="hero__coverage-card">
            <div className="hero__coverage-header">
              <span className="hero__coverage-label">Kwara L-PRES TV</span>
              <span className="hero__coverage-live">
                <span className="hero__live-dot" /> Live · 16 LGAs
              </span>
            </div>

            {/* Gallery viewer — swaps video / photo carousel / map */}
            <div className="hero__map" ref={galleryRef}>
              {activeGallery === 'video' && <VideoPanel />}
              {activeGallery === 'photo' && <PhotoPanel />}
              {activeGallery === 'map'   && <MapPanel />}

              {/* View Full Gallery — bottom-left */}
              <Link
                to="/gallery"
                className="hero__gallery-link-btn"
                title="View full gallery"
              >
                <ExternalLink size={12} />
                <span>Full Gallery</span>
              </Link>

              {/* Fullscreen toggle — bottom-right corner */}
              <button
                className="hero__fullscreen-btn"
                onClick={handleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Expand view'}
                title={isFullscreen ? 'Exit fullscreen' : 'Expand view'}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>

            {/* Gallery tab buttons (replace commodity chips) */}
            <div className="hero__gallery-tabs">
              {[
                { id: 'video', label: 'Documentary',   Icon: VideoIcon },
                { id: 'photo', label: 'Photo Gallery', Icon: CameraIcon },
                { id: 'map',   label: 'Map Gallery',   Icon: MapPinIcon },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className={`hero__gallery-tab${activeGallery === id ? ' hero__gallery-tab--active' : ''}`}
                  onClick={() => setActiveGallery(id)}
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
