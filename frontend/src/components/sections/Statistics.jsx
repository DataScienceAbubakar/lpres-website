import { useEffect, useRef, useState } from 'react';
import { Users, MapPin, Syringe, Briefcase, GraduationCap, Package, Building2, Droplets, TreePine, Handshake } from 'lucide-react';
import './Statistics.css';

const HERO_STATS = [
  { icon: Users,       value: 84446,  suffix: '',  label: 'Direct Beneficiaries',     color: '#c49a3e' },
  { icon: MapPin,      value: 16,     suffix: '',  label: 'LGAs Covered',              color: '#2e5e35' },
  { icon: Syringe,     value: 238718, suffix: '',  label: 'Animals Vaccinated',        color: '#0891b2' },
  { icon: Briefcase,   value: 8951,   suffix: '',  label: 'Value Chain Actors Profiled',        color: '#7c3aed' },
  { icon: GraduationCap, value: 2363, suffix: '',  label: 'Farmers Trained',           color: '#dc2626' },
];

const GRID_STATS = [
  { icon: Package,    value: 2912,   suffix: '',   label: 'Farmers Supported',          sub: 'Productive assets & inputs',        color: '#c49a3e' },
  { icon: Users,      value: 521,    suffix: '',   label: 'Govt. Personnel Trained',    sub: 'Livestock service delivery',         color: '#2e5e35' },
  { icon: Droplets,   value: 67,     suffix: '',   label: 'Water Points',               sub: 'Constructed or rehabilitated',       color: '#0891b2' },
  { icon: Building2,  value: 24,     suffix: '',   label: 'Infrastructure Projects',    sub: 'Climate-resilient facilities',       color: '#7c3aed' },
  { icon: TreePine,   value: 16,     suffix: '',   label: 'Local Govt. Areas',          sub: 'Kwara Central, North & South',       color: '#dc2626' },
  { icon: Handshake,  value: 100,    suffix: '+',  label: 'Stakeholder Engagements',   sub: 'Producers, communities & partners',  color: '#d97706' },
];

function useCountUp(target, duration = 2200, started = false) {
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

function HeroStat({ stat, started }) {
  const count = useCountUp(stat.value, 2000, started);
  const Icon = stat.icon;
  return (
    <div className="stats__hero-item">
      <div className="stats__hero-icon" style={{ background: `${stat.color}18`, color: stat.color }}>
        <Icon size={18} />
      </div>
      <div className="stats__hero-num" style={{ color: stat.color }}>
        {count >= 1000 ? count.toLocaleString() : count}{stat.suffix}
      </div>
      <div className="stats__hero-label">{stat.label}</div>
    </div>
  );
}

function GridStat({ stat, started, delay = 0 }) {
  const count = useCountUp(stat.value, 2000, started);
  const Icon = stat.icon;
  return (
    <div className="stats__grid-card" style={{ '--sc': stat.color, animationDelay: `${delay}s` }}>
      <div className="stats__grid-top">
        <div className="stats__grid-icon" style={{ background: `${stat.color}18`, color: stat.color }}>
          <Icon size={20} />
        </div>
        <div className="stats__grid-val">
          {count >= 1000 ? count.toLocaleString() : count}{stat.suffix}
        </div>
      </div>
      <div className="stats__grid-label">{stat.label}</div>
      <div className="stats__grid-sub">{stat.sub}</div>
      <div className="stats__grid-rule" style={{ background: stat.color }} />
    </div>
  );
}

export default function Statistics() {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="stats" id="results" ref={ref}>
      {/* ── Hero ticker bar ── */}
      <div className="stats__ticker">
        <div className="container stats__ticker-inner">
          {HERO_STATS.map((s) => (
            <HeroStat key={s.label} stat={s} started={started} />
          ))}
        </div>
      </div>

      {/* ── Full infographic grid ── */}
      <div className="stats__body">
        <div className="container">
          <div className="stats__header" data-animate>
            <div className="stats__header-left">
              <span className="section-label">Programme Impact</span>
              <h2 className="stats__title">Key Results at a Glance</h2>
            </div>
            <div className="stats__header-right">
              <span className="stats__date-badge">As at May 2026</span>
              <p className="stats__header-sub">
                Measurable outcomes across all 16 LGAs of Kwara State since project commencement.
              </p>
            </div>
          </div>

          <div className="stats__grid">
            {GRID_STATS.map((s, i) => (
              <GridStat key={s.label} stat={s} started={started} delay={i * 0.07} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
