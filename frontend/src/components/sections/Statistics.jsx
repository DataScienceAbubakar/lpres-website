import { useEffect, useRef, useState } from 'react';
import './Statistics.css';

const STATS = [
  { value: 12400, suffix: '+', label: 'DIRECT BENEFICIARIES' },
  { value: 16,    suffix: '',  label: 'LGAs COVERED' },
  { value: 85000, suffix: '+', label: 'ANIMALS VACCINATED' },
  { value: 1240,  suffix: '',  label: 'VC ACTORS PROFILED' },
  { value: 3800,  suffix: '+', label: 'FARMERS TRAINED' },
];

function useCountUp(target, duration = 2000, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, started]);
  return count;
}

function StatItem({ stat, started, isLast }) {
  const count = useCountUp(stat.value, 2000, started);
  const fmt = (n) => n >= 1000 ? n.toLocaleString() : n.toString();

  return (
    <div className={`stat-item ${!isLast ? 'stat-item--divider' : ''}`}>
      <div className="stat-item__num">
        {fmt(count)}{stat.suffix}
      </div>
      <div className="stat-item__label">{stat.label}</div>
    </div>
  );
}

export default function Statistics() {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="statistics" ref={ref}>
      <div className="statistics__bar container-wide">
        {STATS.map((stat, i) => (
          <StatItem
            key={stat.label}
            stat={stat}
            started={started}
            isLast={i === STATS.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
