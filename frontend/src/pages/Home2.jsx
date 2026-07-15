import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ArrowRight, ExternalLink,
  Users, MapPin, Syringe, GraduationCap, Briefcase,
  Leaf, Shield, TrendingUp, Zap, Globe,
} from 'lucide-react';
import './Home2.css';

// ─── Data ────────────────────────────────────────────────────

const SLIDES = [
  {
    bg: '/hero-bg.jpg', pos: 'center 40%',
    tag: 'Kwara State · Livestock Productivity & Resilience',
    l1: 'Feeding Kwara.', l2: 'Nourishing Nigeria.',
    sub: 'Transforming pastoral communities across 16 local government areas through sustainable livestock development.',
    cta: 'Discover L-PRES', href: '/about',
  },
  {
    bg: '/uploads/8a690bf164b34435b37806ecd0ef55e1.jpg', pos: 'center 30%',
    tag: 'Community Empowerment · 84,446 Beneficiaries',
    l1: 'Seeds of', l2: 'Resilience.',
    sub: '84,446 direct beneficiaries empowered through hands-on training, modern tools and veterinary technology across Kwara State.',
    cta: 'See Our Impact', href: '/impact',
  },
  {
    bg: null, pos: 'center center', dataBg: true,
    tag: 'June 2025 · Direct Project Beneficiaries',
    l1: '4,142', l2: 'Lives Transformed.',
    sub: 'Training: 1,709 · Crushers, PPE & Livestock Enzymes: 2,433 · Grand Total growing month on month.',
    cta: 'View Full Report', href: '/impact',
  },
];

const STATS = [
  { icon: Users,         val: 84446,  label: 'Direct Beneficiaries', sfx: '+' },
  { icon: MapPin,        val: 16,     label: 'LGAs Covered',          sfx: '' },
  { icon: Syringe,       val: 238718, label: 'Animals Vaccinated',    sfx: '+' },
  { icon: GraduationCap, val: 2363,   label: 'Farmers Trained',       sfx: '+' },
  { icon: Briefcase,     val: 8951,   label: 'Value Chain Actors Profiled',    sfx: '+' },
];

const PILLARS = [
  { n:'01', icon:Leaf,       c:'#2e9e50', title:'Value Chain Development',  back:'Strengthening livestock value chains from production to market for cattle, sheep, goats and poultry, boosting farm-gate income across Kwara State.' },
  { n:'02', icon:Shield,     c:'#c49a3e', title:'Animal Health Services',    back:'Expanding veterinary infrastructure, vaccinating 238,718+ animals and training farmers in modern disease prevention and herd management.' },
  { n:'03', icon:TrendingUp, c:'#0891b2', title:'Pastoral Resource Mgmt',   back:'Sustainable grazing management, pasture rehabilitation, silage production and borehole water access for pastoral and agro-pastoral communities.' },
  { n:'04', icon:Zap,        c:'#7c3aed', title:'Institutional Support',    back:'Capacity building for state agencies, farmer cooperatives and LGA livestock departments through targeted training and technical assistance.' },
  { n:'05', icon:Globe,      c:'#c49a3e', title:'GDSS & Data Systems',      back:'Geographic Decision Support System delivering real-time spatial data for evidence-based governance of the livestock sector.' },
];

const TOPICS = [
  { label:'Livestock',       color:'#2e9e50' },
  { label:'Pastoralists',    color:'#1a5c26' },
  { label:'Ranching',        color:'#0891b2' },
  { label:'Feed & Fodder',   color:'#c49a3e' },
  { label:'Veterinary',      color:'#7c3aed' },
  { label:'Pasture',         color:'#2e9e50' },
  { label:'Silage',          color:'#c49a3e' },
  { label:'Weather Forecast',color:'#0891b2' },
  { label:'Grazing',         color:'#1a5c26' },
  { label:'Borehole',        color:'#dc2626' },
  { label:'Animal Health',   color:'#7c3aed' },
  { label:'Value Chain',     color:'#c49a3e' },
];

const LGAS = ['Asa','Baruten','Edu','Ekiti','Ifelodun','Ilorin East','Ilorin South','Ilorin West','Irepodun','Isin','Kaiama','Moro','Offa','Oke-Ero','Oyun','Patigi'];

// ─── Hooks ───────────────────────────────────────────────────

function useCountUp(target, started, ms = 2400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!started) return;
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / ms, 1);
      setN(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setN(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, started, ms]);
  return n;
}

function useTilt(ref, deg = 10) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const rx =  ((e.clientY - r.top)  / r.height - 0.5) * -deg;
      const ry =  ((e.clientX - r.left) / r.width  - 0.5) *  deg;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(14px)`;
      el.style.transition = 'transform 0.06s linear';
    };
    const leave = () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
    };
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); };
  }, [deg]);
}

// ─── Sub-components ──────────────────────────────────────────

function StatCard({ icon: Icon, val, label, sfx, started }) {
  const ref = useRef(null);
  useTilt(ref, 8);
  const n = useCountUp(val, started);
  return (
    <div className="h2__stat" ref={ref}>
      <div className="h2__stat-glow" />
      <div className="h2__stat-icon"><Icon size={20} /></div>
      <div className="h2__stat-num">{n.toLocaleString()}{sfx}</div>
      <div className="h2__stat-lbl">{label}</div>
    </div>
  );
}

function PillarCard({ n, icon: Icon, c, title, back }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={`h2__pc-wrap ${flipped ? 'h2__pc-wrap--flip' : ''}`} style={{ '--pc': c }} onClick={() => setFlipped(f => !f)}>
      <div className="h2__pc">
        <div className="h2__pc-face h2__pc-front">
          <div className="h2__pc-sheen" />
          <div className="h2__pc-num">{n}</div>
          <div className="h2__pc-icon"><Icon size={24} /></div>
          <h3 className="h2__pc-title">{title}</h3>
          <div className="h2__pc-hint">Click to reveal →</div>
        </div>
        <div className="h2__pc-face h2__pc-back">
          <div className="h2__pc-back-n">{n}</div>
          <p className="h2__pc-back-txt">{back}</p>
          <div className="h2__pc-hint">Click to flip back</div>
        </div>
      </div>
    </div>
  );
}

function TopicCard({ label, color, bg }) {
  const ref = useRef(null);
  useTilt(ref, 7);
  return (
    <div className="h2__topic" ref={ref} style={{ '--tc': color, backgroundImage: `url(${bg})` }}>
      <div className="h2__topic-shade" />
      <div className="h2__topic-tint" />
      <div className="h2__topic-shine" />
      <span className="h2__topic-label">{label}</span>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────

export default function Home2() {
  const [slide, setSlide] = useState(0);
  const [statsOn, setStatsOn] = useState(false);
  const statsRef  = useRef(null);
  const heroRef   = useRef(null);
  const timerRef  = useRef(null);

  const go = useCallback((i) => {
    setSlide(i);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSlide(p => (p + 1) % SLIDES.length), 6500);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(() => setSlide(p => (p + 1) % SLIDES.length), 6500);
    return () => clearTimeout(timerRef.current);
  }, [slide]);

  useEffect(() => {
    const obs = new IntersectionObserver(es => { if (es[0].isIntersecting) { setStatsOn(true); obs.disconnect(); } }, { threshold: 0.2 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  // Hero mouse parallax
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const fn = (e) => {
      const W = window.innerWidth, H = window.innerHeight;
      const x = (e.clientX / W - 0.5), y = (e.clientY / H - 0.5);
      hero.querySelectorAll('[data-d]').forEach(el => {
        const d = +el.dataset.d;
        el.style.transform = `translate(${x * d * 32}px, ${y * d * 16}px)`;
        el.style.transition = 'transform 0.12s linear';
      });
    };
    window.addEventListener('mousemove', fn, { passive: true });
    return () => window.removeEventListener('mousemove', fn);
  }, []);

  const s = SLIDES[slide];

  return (
    <div className="h2">

      {/* ══ HERO ═════════════════════════════════════════ */}
      <section className="h2__hero" ref={heroRef}>
        {SLIDES.map((sl, i) => (
          <div key={i} className={`h2__slide ${i === slide ? 'h2__slide--on' : ''}`}>
            {sl.bg
              ? <><div className="h2__slide-bg" style={{ backgroundImage:`url(${sl.bg})`, backgroundPosition:sl.pos }} /><div className="h2__slide-veil" /></>
              : <div className="h2__slide-data" />
            }
          </div>
        ))}

        {/* Floating glass badges */}
        <div className="h2__badge h2__badge--tl" data-d="0.7">
          <Users size={13} /><span>84,446 Beneficiaries</span>
        </div>
        <div className="h2__badge h2__badge--tr" data-d="0.4">
          <Syringe size={13} /><span>238,718 Vaccinated</span>
        </div>
        <div className="h2__badge h2__badge--br" data-d="1.1">
          <MapPin size={13} /><span>16 LGAs Covered</span>
        </div>

        {/* Text content */}
        <div className="h2__hero-body container" key={slide}>
          <div className="h2__hero-inner">
            <span className="h2__eyebrow">{s.tag}</span>
            <h1 className="h2__hero-h">
              <span className="h2__h-l1">{s.l1}</span>
              <span className="h2__h-l2">{s.l2}</span>
            </h1>
            <p className="h2__hero-sub">{s.sub}</p>
            <Link to={s.href} className="h2__hero-btn">
              {s.cta} <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Controls */}
        <button className="h2__arr h2__arr--l" onClick={() => go((slide - 1 + SLIDES.length) % SLIDES.length)}><ChevronLeft size={22}/></button>
        <button className="h2__arr h2__arr--r" onClick={() => go((slide + 1) % SLIDES.length)}><ChevronRight size={22}/></button>

        <div className="h2__dots">
          {SLIDES.map((_, i) => <button key={i} className={`h2__dot ${i===slide?'h2__dot--on':''}`} onClick={()=>go(i)}/>)}
        </div>

        <div className="h2__prog" key={`prog-${slide}`}><div className="h2__prog-bar"/></div>

        <div className="h2__scroll-cue">
          <div className="h2__scroll-mouse"><div className="h2__scroll-wheel"/></div>
          <span>Scroll</span>
        </div>
      </section>

      {/* ══ STATS ════════════════════════════════════════ */}
      <section className="h2__stats" ref={statsRef}>
        <div className="container h2__stats-row">
          {STATS.map(st => <StatCard key={st.label} {...st} started={statsOn}/>)}
        </div>
      </section>

      {/* ══ MISSION ══════════════════════════════════════ */}
      <section className="h2__mission">
        <div className="h2__mission-noise"/>
        <div className="container h2__mission-grid">
          <div className="h2__mission-l" data-animate>
            <span className="h2__eyebrow">Our Mission</span>
            <blockquote className="h2__mission-q">
              "Sustainable livestock systems that lift communities and feed nations."
            </blockquote>
            <Link to="/about" className="h2__text-link">Read our story <ArrowRight size={14}/></Link>
          </div>
          <div className="h2__mission-r" data-animate>
            <p className="h2__mission-p">
              The L-PRES project is a World Bank–funded initiative implemented by the Kwara State Government.
              Working across 16 LGAs, it targets smallholder farmers, pastoralists and agro-pastoralists,
              delivering training, veterinary services, infrastructure and digital tools for lasting impact.
            </p>
            <div className="h2__mission-chips">
              {['World Bank Funded','Kwara State Govt.','2020 – 2026','5 Components','16 LGAs'].map(t => (
                <span key={t} className="h2__chip">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PILLARS ══════════════════════════════════════ */}
      <section className="h2__pillars">
        <div className="container">
          <div className="h2__sec-hd" data-animate>
            <span className="h2__eyebrow">Project Components</span>
            <h2 className="h2__sec-title">Five Pillars of Transformation</h2>
            <p className="h2__sec-sub">Click any card to reveal details</p>
          </div>
          <div className="h2__pillars-row">
            {PILLARS.map(p => <PillarCard key={p.n} {...p}/>)}
          </div>
        </div>
      </section>

      {/* ══ IMPACT BARS ══════════════════════════════════ */}
      <section className="h2__impact">
        <div className="h2__impact-bg-img" style={{ backgroundImage:'url(/hero-bg.jpg)' }}/>
        <div className="h2__impact-overlay"/>
        <div className="container h2__impact-body">
          <div className="h2__sec-hd h2__sec-hd--light" data-animate>
            <span className="h2__eyebrow h2__eyebrow--dim">June 2025 · Field Data</span>
            <h2 className="h2__sec-title h2__sec-title--w">Direct Project Beneficiaries</h2>
          </div>
          <div className="h2__bars-stage">
            <div className="h2__bars-floor">
              {/* Training group */}
              <div className="h2__bar-grp">
                <div className="h2__bar-pair">
                  <div className="h2__bar3d h2__bar3d--dk" style={{'--bh':'68%'}}>
                    <div className="h2__bar3d-face h2__bar3d-top"/>
                    <div className="h2__bar3d-face h2__bar3d-side"/>
                    <span className="h2__bar3d-val">1,248</span>
                    <span className="h2__bar3d-sex">Male</span>
                  </div>
                  <div className="h2__bar3d h2__bar3d--lt" style={{'--bh':'40%'}}>
                    <div className="h2__bar3d-face h2__bar3d-top"/>
                    <div className="h2__bar3d-face h2__bar3d-side"/>
                    <span className="h2__bar3d-val">461</span>
                    <span className="h2__bar3d-sex">Female</span>
                  </div>
                </div>
                <div className="h2__bar-foot">
                  <div className="h2__bar-lbl">Training</div>
                  <div className="h2__bar-tot">1,709</div>
                </div>
              </div>

              {/* Divider */}
              <div className="h2__bars-div"/>

              {/* Crushers/PPE/Enzymes group */}
              <div className="h2__bar-grp">
                <div className="h2__bar-pair">
                  <div className="h2__bar3d h2__bar3d--dk" style={{'--bh':'88%'}}>
                    <div className="h2__bar3d-face h2__bar3d-top"/>
                    <div className="h2__bar3d-face h2__bar3d-side"/>
                    <span className="h2__bar3d-val">1,725</span>
                    <span className="h2__bar3d-sex">Male</span>
                  </div>
                  <div className="h2__bar3d h2__bar3d--lt" style={{'--bh':'52%'}}>
                    <div className="h2__bar3d-face h2__bar3d-top"/>
                    <div className="h2__bar3d-face h2__bar3d-side"/>
                    <span className="h2__bar3d-val">708</span>
                    <span className="h2__bar3d-sex">Female</span>
                  </div>
                </div>
                <div className="h2__bar-foot">
                  <div className="h2__bar-lbl">Crushers, PPE &amp; Livestock Enzymes</div>
                  <div className="h2__bar-tot">2,433</div>
                </div>
              </div>

              {/* Grand total */}
              <div className="h2__grand">
                <div className="h2__grand-label">Grand Total</div>
                <div className="h2__grand-num">4,142</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TOPICS ═══════════════════════════════════════ */}
      <section className="h2__topics">
        <div className="container">
          <div className="h2__sec-hd" data-animate>
            <span className="h2__eyebrow">Focus Areas</span>
            <h2 className="h2__sec-title">From Field to Impact</h2>
            <p className="h2__sec-sub">12 thematic areas driving L-PRES outcomes across Kwara State</p>
          </div>
          <div className="h2__topics-grid">
            {TOPICS.map((t, i) => (
              <TopicCard
                key={t.label}
                label={t.label}
                color={t.color}
                bg={i % 2 === 0 ? '/hero-bg.jpg' : '/uploads/8a690bf164b34435b37806ecd0ef55e1.jpg'}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══ COVERAGE ═════════════════════════════════════ */}
      <section className="h2__cov">
        <div className="container h2__cov-grid">
          <div className="h2__cov-l" data-animate>
            <span className="h2__eyebrow">Geographic Reach</span>
            <h2 className="h2__sec-title">16 LGAs.<br/>One Vision.</h2>
            <p className="h2__cov-p">
              L-PRES operates across all ecological zones of Kwara State, from the Guinea Savanna to the Sudan Savanna,
              ensuring pastoral communities benefit regardless of location.
            </p>
            <Link to="/programs" className="h2__hero-btn h2__hero-btn--sm">
              View Project Map <ArrowRight size={14}/>
            </Link>
          </div>
          <div className="h2__cov-r">
            <div className="h2__lga-grid">
              {LGAS.map((lga, i) => (
                <div key={lga} className="h2__lga" style={{ animationDelay:`${i*0.04}s` }}>
                  <div className="h2__lga-dot"/>
                  <span>{lga}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════ */}
      <section className="h2__cta">
        <div className="h2__cta-img" style={{ backgroundImage:'url(/hero-bg.jpg)' }}/>
        <div className="h2__cta-veil"/>
        <div className="container h2__cta-body">
          <span className="h2__eyebrow h2__eyebrow--dim">Get Involved</span>
          <h2 className="h2__cta-title">Ready to explore Kwara's livestock transformation?</h2>
          <div className="h2__cta-row">
            <Link to="/gdss" className="h2__btn-gold"><ExternalLink size={15}/> Open GDSS Portal</Link>
            <Link to="/contact" className="h2__btn-ghost"><ArrowRight size={15}/> Contact the Team</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
