import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, MapPin, Syringe, Briefcase, GraduationCap, Package,
  Building2, Droplets, TreePine, Handshake, ChevronRight, ArrowRight
} from 'lucide-react';
import './ResultsPage.css';

const ALL_STATS = [
  {
    icon: MapPin,     value: 16,      suffix: '',  pct: 100,
    label: 'Local Government Areas',
    detail: 'All 16 LGAs covered across Kwara Central, Kwara North, and Kwara South Senatorial Districts.',
    color: '#2e5e35',
    category: 'Coverage',
  },
  {
    icon: Users,      value: 84446,   suffix: '',  pct: 92,
    label: 'Direct Beneficiaries',
    detail: 'Individuals reached directly through project interventions including training, assets, and services.',
    color: '#c49a3e',
    category: 'Beneficiaries',
  },
  {
    icon: Briefcase,  value: 8951,    suffix: '',  pct: 74,
    label: 'Value Chain Actors Profiled',
    detail: 'Livestock producers, processors, traders, and other value chain actors registered across priority chains.',
    color: '#7c3aed',
    category: 'Beneficiaries',
  },
  {
    icon: GraduationCap, value: 2363, suffix: '',  pct: 68,
    label: 'Farmers Trained',
    detail: 'Livestock farmers trained on improved production practices, animal health, and climate-smart techniques.',
    color: '#0891b2',
    category: 'Capacity Building',
  },
  {
    icon: Package,    value: 2912,    suffix: '',  pct: 72,
    label: 'Farmers Supported',
    detail: 'Livestock farmers supported with productive assets, inputs, and technical assistance to boost production.',
    color: '#d97706',
    category: 'Capacity Building',
  },
  {
    icon: Users,      value: 521,     suffix: '',  pct: 62,
    label: 'Govt. Personnel Trained',
    detail: 'State and local government personnel trained to strengthen livestock sector service delivery capacity.',
    color: '#16a34a',
    category: 'Capacity Building',
  },
  {
    icon: Syringe,    value: 238718,  suffix: '',  pct: 88,
    label: 'Animals Vaccinated',
    detail: 'Livestock animals vaccinated against priority diseases including FMD, PPR, CBPP, and Newcastle disease.',
    color: '#dc2626',
    category: 'Animal Health',
  },
  {
    icon: Droplets,   value: 67,      suffix: '',  pct: 85,
    label: 'Water Points',
    detail: 'Water points constructed or rehabilitated to support livestock production and reduce resource conflicts.',
    color: '#0891b2',
    category: 'Infrastructure',
  },
  {
    icon: Building2,  value: 24,      suffix: '',  pct: 78,
    label: 'Infrastructure Projects',
    detail: 'Climate-resilient livestock infrastructure projects completed across the state.',
    color: '#7c3aed',
    category: 'Infrastructure',
  },
  {
    icon: Handshake,  value: 100,     suffix: '+', pct: 95,
    label: 'Stakeholder Engagements',
    detail: 'Engagements conducted with livestock producers, value chain actors, communities, and development partners.',
    color: '#c49a3e',
    category: 'Partnerships',
  },
];

const CATEGORIES = ['All', 'Coverage', 'Beneficiaries', 'Capacity Building', 'Animal Health', 'Infrastructure', 'Partnerships'];

function useCountUp(target, duration = 2000, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setCount(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, started]);
  return count;
}

function StatCard({ stat, started }) {
  const count = useCountUp(stat.value, 2200, started);
  const Icon = stat.icon;
  return (
    <div className="rp__stat-card" style={{ '--rc': stat.color }}>
      <div className="rp__stat-head">
        <div className="rp__stat-icon" style={{ background: `${stat.color}18`, color: stat.color }}>
          <Icon size={20} />
        </div>
        <span className="rp__stat-cat" style={{ color: stat.color }}>{stat.category}</span>
      </div>
      <div className="rp__stat-val">
        {count >= 1000 ? count.toLocaleString() : count}{stat.suffix}
      </div>
      <div className="rp__stat-label">{stat.label}</div>
      <p className="rp__stat-detail">{stat.detail}</p>
      <div className="rp__stat-bar-wrap">
        <div
          className="rp__stat-bar-fill"
          style={{ width: started ? `${stat.pct}%` : '0%', background: stat.color, transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </div>
      <div className="rp__stat-pct">{stat.pct}% of target</div>
    </div>
  );
}

export default function ResultsPage() {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const filtered = activeCategory === 'All'
    ? ALL_STATS
    : ALL_STATS.filter(s => s.category === activeCategory);

  return (
    <div className="rp">

      {/* Page Hero */}
      <div className="rp__hero">
        <div className="rp__hero-bg" />
        <div className="container rp__hero-inner">
          <nav className="rp__breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <span>Impact</span>
          </nav>
          <h1 className="rp__hero-title">Programme Impact</h1>
          <p className="rp__hero-sub">
            Measurable outcomes delivered across all 16 LGAs of Kwara State — as at May 2026
          </p>
          <div className="rp__hero-badge">
            <span className="rp__live-dot" />
            Data current as at May 2026
          </div>
        </div>
      </div>

      {/* Summary banner */}
      <div className="rp__summary-bar">
        <div className="container rp__summary-inner">
          {[
            { val: '84,446', label: 'Beneficiaries' },
            { val: '16', label: 'LGAs' },
            { val: '238,718', label: 'Vaccinated' },
            { val: '10+', label: 'Key Indicators' },
          ].map(item => (
            <div key={item.label} className="rp__summary-item">
              <span className="rp__summary-val">{item.val}</span>
              <span className="rp__summary-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Narrative section */}
      <section className="rp__narrative">
        <div className="container">
          <div className="rp__narrative-grid">
            <div className="rp__narrative-text">
              <span className="section-label dark">Programme Context</span>
              <h2 className="rp__narrative-title">Delivering Impact Across Kwara State</h2>
              <p>
                The Kwara State L-PRES Project has made significant strides in transforming the
                livestock sector since commencement. With interventions spanning all three senatorial
                districts and all 16 Local Government Areas, the project has reached tens of thousands
                of beneficiaries including livestock producers, pastoralists, traders, and processors.
              </p>
              <p>
                Key achievements include the vaccination of over 238,000 animals, the training of more
                than 2,300 livestock farmers, the construction or rehabilitation of 67 water points,
                and the completion of 24 climate-resilient infrastructure facilities — all contributing
                to improved productivity, reduced conflicts, and stronger value chains.
              </p>
              <Link to="/programs" className="btn btn-primary rp__narrative-btn">
                View Programmes <ArrowRight size={16} />
              </Link>
            </div>
            <div className="rp__narrative-visual">
              <div className="rp__donut-wrap">
                <svg viewBox="0 0 200 200" className="rp__donut">
                  {[
                    { pct: 30, color: '#c49a3e', label: 'Beneficiaries' },
                    { pct: 25, color: '#2e5e35', label: 'Animal Health' },
                    { pct: 20, color: '#0891b2', label: 'Training' },
                    { pct: 15, color: '#7c3aed', label: 'Infrastructure' },
                    { pct: 10, color: '#dc2626', label: 'Partnerships' },
                  ].reduce((acc, seg, i, arr) => {
                    const circumference = 2 * Math.PI * 75;
                    const offset = acc.offset;
                    const dashLen = (seg.pct / 100) * circumference;
                    const el = (
                      <circle
                        key={seg.label}
                        cx="100" cy="100" r="75"
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="28"
                        strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                        strokeDashoffset={-(offset)}
                        transform="rotate(-90 100 100)"
                        style={{ transition: 'stroke-dasharray 1s ease' }}
                      />
                    );
                    acc.elements.push(el);
                    acc.offset += dashLen;
                    return acc;
                  }, { elements: [], offset: 0 }).elements}
                  <text x="100" y="95" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="800" fontFamily="Playfair Display">10</text>
                  <text x="100" y="114" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">Key Results</text>
                </svg>
                <div className="rp__donut-legend">
                  {[
                    { color: '#c49a3e', label: 'Beneficiaries' },
                    { color: '#2e5e35', label: 'Animal Health' },
                    { color: '#0891b2', label: 'Training' },
                    { color: '#7c3aed', label: 'Infrastructure' },
                    { color: '#dc2626', label: 'Partnerships' },
                  ].map(l => (
                    <div key={l.label} className="rp__legend-item">
                      <span className="rp__legend-dot" style={{ background: l.color }} />
                      <span>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="rp__body" ref={ref}>
        <div className="container">
          <div className="rp__filters">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`rp__filter-btn ${activeCategory === cat ? 'rp__filter-btn--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="rp__grid">
            {filtered.map((stat) => (
              <StatCard key={stat.label} stat={stat} started={started} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
