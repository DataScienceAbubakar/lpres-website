import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Newspaper, Folder, Hash, ArrowRight, Clock } from 'lucide-react';
import './SearchModal.css';

const STATIC_INDEX = [
  { title: 'Home', url: '/', desc: 'Overview of the Kwara L-PRES Project', type: 'page', icon: 'page' },
  { title: 'About L-PRES', url: '/about', desc: 'Project background, objectives, and coordinator\'s message', type: 'page', icon: 'page' },
  { title: 'Programme Components', url: '/programs', desc: 'Animal health, value chains, water infrastructure, capacity building', type: 'page', icon: 'page' },
  { title: 'Impact & Results', url: '/impact', desc: '84,446 beneficiaries, 238,718 animals vaccinated, 16 LGAs covered', type: 'page', icon: 'page' },
  { title: 'Partners', url: '/partners', desc: 'World Bank, Kwara State Government, Federal Ministry of Agriculture', type: 'page', icon: 'page' },
  { title: 'Media Gallery', url: '/gallery', desc: 'Photos and videos from field activities and programme events', type: 'page', icon: 'page' },
  { title: 'News & Updates', url: '/news', desc: 'Latest news, events, announcements and field reports', type: 'page', icon: 'page' },
  { title: 'Contact Us', url: '/contact', desc: 'Office address, phone number, email and contact form', type: 'page', icon: 'page' },
  { title: 'GDSS Portal', url: '/gdss', desc: 'Geo-referenced Decision Support System for L-PRES', type: 'page', icon: 'page' },
  { title: "Coordinator's Message", url: '/#coordinators-message', desc: 'Message from the State Project Coordinator', type: 'section', icon: 'section' },
  { title: 'Core Values', url: '/#values', desc: 'Seven principles guiding L-PRES: accountability, innovation, inclusiveness...', type: 'section', icon: 'section' },
  { title: 'Programme Statistics', url: '/#results', desc: 'Key results and impact figures at a glance', type: 'section', icon: 'section' },
  { title: 'Project Highlights', url: '/#projects', desc: 'Field project sites across Kwara State LGAs', type: 'section', icon: 'section' },
  { title: 'Latest News Section', url: '/#news', desc: 'Three most recent published news articles on homepage', type: 'section', icon: 'section' },
  { title: 'Animal Health Campaigns', url: '/programs#components', desc: 'Vaccination and veterinary services: 238,718 animals vaccinated', type: 'topic', icon: 'section' },
  { title: 'Value Chain Development', url: '/programs#value-chains', desc: 'Cattle, sheep, goat and dairy value chains', type: 'topic', icon: 'section' },
  { title: 'Water Infrastructure', url: '/impact', desc: '67 water points constructed or rehabilitated statewide', type: 'topic', icon: 'section' },
  { title: 'Farmer Training', url: '/impact', desc: '2,363 farmers trained: agronomy, business, animal health', type: 'topic', icon: 'section' },
  { title: 'Kwara North Cluster', url: '/programs#project-sites', desc: 'Baruten, Edu, Kaiama, Pategi, Ekiti LGAs', type: 'topic', icon: 'section' },
  { title: 'Kwara South Cluster', url: '/programs#project-sites', desc: 'Offa, Oyun, Ifelodun, Irepodun, Isin, Oke-Ero LGAs', type: 'topic', icon: 'section' },
  { title: 'Kwara Central Cluster', url: '/programs#project-sites', desc: 'Ilorin East, Ilorin South, Ilorin West, Asa, Moro LGAs', type: 'topic', icon: 'section' },
];

const SUGGESTED = [
  { title: 'Programme Components', url: '/programs', icon: 'page' },
  { title: 'Impact & Results', url: '/impact', icon: 'page' },
  { title: 'Media Gallery', url: '/gallery', icon: 'page' },
  { title: 'Latest News', url: '/news', icon: 'page' },
];

function scoreMatch(item, q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${item.title} ${item.desc}`.toLowerCase();
  const titleLower = item.title.toLowerCase();
  let score = 0;
  for (const w of words) {
    if (titleLower.startsWith(w)) score += 4;
    else if (titleLower.includes(w)) score += 3;
    else if (haystack.includes(w)) score += 1;
    else return 0;
  }
  return score;
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [newsCache, setNewsCache] = useState([]);
  const [projectsCache, setProjectsCache] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Open via custom event (from Navbar) or Ctrl+K
  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen(true); }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('lpres:open-search', onOpen);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('lpres:open-search', onOpen);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Fetch news + projects once when modal opens
  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 50);
    if (newsCache.length === 0) {
      fetch('/api/news').then(r => r.json()).then(d => {
        const articles = Array.isArray(d) ? d : (d.articles ?? []);
        setNewsCache(articles.filter(a => a.is_published).map(a => ({
          title: a.title,
          url: `/news/${a.slug ?? a.id}`,
          desc: a.excerpt || a.body?.replace(/<[^>]+>/g, '').slice(0, 100),
          type: 'news',
          icon: 'news',
        })));
      }).catch(() => {});
    }
    if (projectsCache.length === 0) {
      fetch('/api/projects').then(r => r.json()).then(d => {
        const projects = Array.isArray(d) ? d : (d.projects ?? []);
        setProjectsCache(projects.map(p => ({
          title: p.name,
          url: `/#projects`,
          desc: `${p.lga ?? ''} · ${p.status ?? ''}: ${p.description?.slice(0, 80) ?? ''}`,
          type: 'project',
          icon: 'project',
        })));
      }).catch(() => {});
    }
  }, [open]);

  // Search
  useEffect(() => {
    if (!query.trim()) { setResults([]); setActiveIdx(0); return; }
    const all = [...STATIC_INDEX, ...newsCache, ...projectsCache];
    const scored = all
      .map(item => ({ item, score: scoreMatch(item, query) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(x => x.item);
    setResults(scored);
    setActiveIdx(0);
  }, [query, newsCache, projectsCache]);

  const go = useCallback((url) => {
    setOpen(false);
    setQuery('');
    if (url.startsWith('/#') || url === '/') {
      if (window.location.pathname !== '/') navigate('/');
      setTimeout(() => {
        const id = url.split('#')[1];
        if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      navigate(url);
    }
  }, [navigate]);

  const onKeyDown = (e) => {
    const max = (query ? results : SUGGESTED).length;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => (i + 1) % max); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => (i - 1 + max) % max); }
    if (e.key === 'Enter') {
      const list = query ? results : SUGGESTED;
      if (list[activeIdx]) go(list[activeIdx].url);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  if (!open) return null;

  const ItemIcon = ({ type }) => {
    if (type === 'news') return <Newspaper size={14} />;
    if (type === 'project') return <Folder size={14} />;
    if (type === 'section' || type === 'topic') return <Hash size={14} />;
    return <FileText size={14} />;
  };

  const grouped = query
    ? results
    : null;

  return (
    <div className="srch__overlay" onClick={() => { setOpen(false); setQuery(''); }}>
      <div className="srch__panel" onClick={e => e.stopPropagation()}>
        {/* Input row */}
        <div className="srch__input-row">
          <Search size={16} className="srch__input-icon" />
          <input
            ref={inputRef}
            className="srch__input"
            placeholder="Search pages, news, projects…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button className="srch__clear" onClick={() => { setQuery(''); inputRef.current?.focus(); }}>
              <X size={14} />
            </button>
          )}
          <kbd className="srch__esc">Esc</kbd>
        </div>

        <div className="srch__body" ref={listRef}>
          {/* No query — show suggested */}
          {!query && (
            <>
              <div className="srch__group-label"><Clock size={11} /> Quick links</div>
              {SUGGESTED.map((item, i) => (
                <button
                  key={item.url + item.title}
                  data-idx={i}
                  className={`srch__item ${activeIdx === i ? 'srch__item--active' : ''}`}
                  onClick={() => go(item.url)}
                  onMouseEnter={() => setActiveIdx(i)}
                >
                  <span className="srch__item-icon srch__item-icon--page"><ItemIcon type="page" /></span>
                  <span className="srch__item-text">
                    <span className="srch__item-title">{item.title}</span>
                  </span>
                  <ArrowRight size={12} className="srch__item-arrow" />
                </button>
              ))}
              <div className="srch__hint">
                Type to search all pages, news articles, and projects
              </div>
            </>
          )}

          {/* Query — show results */}
          {query && grouped?.length > 0 && grouped.map((item, i) => (
            <button
              key={item.url + item.title + i}
              data-idx={i}
              className={`srch__item ${activeIdx === i ? 'srch__item--active' : ''}`}
              onClick={() => go(item.url)}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <span className={`srch__item-icon srch__item-icon--${item.icon}`}>
                <ItemIcon type={item.type} />
              </span>
              <span className="srch__item-text">
                <span className="srch__item-title">{item.title}</span>
                {item.desc && <span className="srch__item-desc">{item.desc}</span>}
              </span>
              <span className={`srch__type-badge srch__type-badge--${item.type}`}>
                {item.type}
              </span>
            </button>
          ))}

          {query && grouped?.length === 0 && (
            <div className="srch__empty">
              <Search size={28} />
              <p>No results for <strong>"{query}"</strong></p>
              <span>Try searching for pages, news topics, or project locations</span>
            </div>
          )}
        </div>

        <div className="srch__footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>Esc</kbd> close</span>
          <span className="srch__footer-brand">Kwara L-PRES</span>
        </div>
      </div>
    </div>
  );
}
