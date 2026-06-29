import { useEffect, useRef, useState } from 'react';
import { Users, MapPin, Syringe, Briefcase, GraduationCap } from 'lucide-react';
import './StatsTicker.css';

const TICKER_STATS = [
  { icon: Users,         value: 84446,  suffix: '',  label: 'Direct Beneficiaries', color: '#c49a3e' },
  { icon: MapPin,        value: 16,     suffix: '',  label: 'LGAs Covered',          color: '#2e5e35' },
  { icon: Syringe,       value: 238718, suffix: '',  label: 'Animals Vaccinated',    color: '#0891b2' },
  { icon: Briefcase,     value: 8951,   suffix: '',  label: 'VC Actors Profiled',    color: '#7c3aed' },
  { icon: GraduationCap, value: 2363,   suffix: '',  label: 'Farmers Trained',       color: '#dc2626' },
];

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

function TickerItem({ stat, started }) {
  const count = useCountUp(stat.value, 2000, started);
  const Icon = stat.icon;
  return (
    <div className="ticker__item">
      <div className="ticker__icon" style={{ background: `${stat.color}18`, color: stat.color }}>
        <Icon size={16} />
      </div>
      <div className="ticker__num" style={{ color: stat.color }}>
        {count >= 1000 ? count.toLocaleString() : count}{stat.suffix}
      </div>
      <div className="ticker__label">{stat.label}</div>
    </div>
  );
}

export default function StatsTicker() {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="ticker" ref={ref}>
      <div className="container ticker__inner">
        {TICKER_STATS.map((s) => (
          <TickerItem key={s.label} stat={s} started={started} />
        ))}
      </div>
    </div>
  );
}
