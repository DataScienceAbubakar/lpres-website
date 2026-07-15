import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, Syringe, Briefcase, GraduationCap, Package, Building2, Droplets, TreePine, Handshake, ArrowRight } from 'lucide-react';
import './ProgrammeImpact.css';

const STATS = [
  { icon: Package,     value: 2912,   suffix: '',  label: 'Farmers Supported',       sub: 'With productive assets & inputs',         color: '#c49a3e' },
  { icon: Users,       value: 521,    suffix: '',  label: 'Govt. Personnel Trained',  sub: 'Livestock service delivery',               color: '#2e5e35' },
  { icon: Droplets,    value: 67,     suffix: '',  label: 'Water Points',             sub: 'Constructed or rehabilitated',             color: '#0891b2' },
  { icon: Building2,   value: 24,     suffix: '',  label: 'Infrastructure Projects',  sub: 'Climate-resilient facilities',             color: '#7c3aed' },
  { icon: Briefcase,   value: 8951,   suffix: '',  label: 'Value Chain Actors Profiled',       sub: 'Across priority livestock chains',         color: '#dc2626' },
  { icon: Handshake,   value: 100,    suffix: '+', label: 'Stakeholder Engagements',  sub: 'Producers, communities & partners',        color: '#d97706' },
];

function useCountUp(target, duration = 2200, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setCount(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, started]);
  return count;
}

function StatCard({ stat, started }) {
  const count = useCountUp(stat.value, 2000, started);
  const Icon = stat.icon;
  return (
    <div className="pi__card" style={{ '--sc': stat.color }}>
      <div className="pi__card-top">
        <div className="pi__icon" style={{ background: `${stat.color}18`, color: stat.color }}>
          <Icon size={19} />
        </div>
        <div className="pi__val">{count >= 1000 ? count.toLocaleString() : count}{stat.suffix}</div>
      </div>
      <div className="pi__label">{stat.label}</div>
      <div className="pi__sub">{stat.sub}</div>
      <div className="pi__rule" />
    </div>
  );
}

export default function ProgrammeImpact() {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="pi section" id="results" ref={ref}>
      <div className="container">
        <div className="pi__header">
          <div className="pi__header-left">
            <span className="section-label">Programme Impact</span>
            <h2 className="pi__title">Key Results at a Glance</h2>
          </div>
          <div className="pi__header-right">
            <span className="pi__date-badge">
              <span className="pi__dot" />
              As at May 2026
            </span>
            <p className="pi__header-sub">
              Measurable outcomes across all 16 LGAs of Kwara State since project commencement.
            </p>
            <Link to="/impact" className="pi__more-link">
              View full impact report <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="pi__grid">
          {STATS.map((s) => (
            <StatCard key={s.label} stat={s} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}
