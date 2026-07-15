import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Eye, Compass, Beef, Bird, Droplets,
  AlertTriangle, Map, BookOpen, ChevronRight, Phone, MapPin, Mail,
} from 'lucide-react';
import NavbarLight from '../components/layout/NavbarLight';
import Footer from '../components/layout/Footer';
import './HomeLight.css';

/* ── Inline SVG brand icons (lucide-react v1 removed these) ── */
const FB = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const TW = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const IG = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
const LI = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7H10v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>;
const YT = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>;

/* ── Animated counter hook ── */
function useCountUp(target, duration = 2000, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let cur = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration, started]);
  return count;
}

/* ── Data ── */
const STATS = [
  { value: 12400, suffix: '+', label: 'Direct Beneficiaries' },
  { value: 16,    suffix: '',  label: 'LGAs Covered' },
  { value: 85000, suffix: '+', label: 'Animals Vaccinated' },
  { value: 1240,  suffix: '',  label: 'Value Chain Actors Profiled' },
  { value: 3800,  suffix: '+', label: 'Farmers Trained' },
];

const PROGRAMS = [
  { icon: Beef,          title: 'Cattle Value Chain',          desc: 'Supporting beef and dairy production through improved breeds, veterinary services, and premium market access for Kwara cattle farmers.', tags: ['Beef', 'Dairy', 'Breeds'],              color: '#b45309', bg: '#fef3c7' },
  { icon: Bird,          title: 'Poultry Development',         desc: 'Building a competitive poultry sub-sector through improved feeds, biosecurity training, and structured commercial buyer linkages.',          tags: ['Layers', 'Broilers', 'Feeds'],           color: '#0891b2', bg: '#e0f2fe' },
  { icon: Droplets,      title: 'Dairy & Aquaculture',         desc: 'Establishing milk collection centres, cold chain networks, and aquaculture as a complementary protein value chain across Kwara.',          tags: ['Milk', 'Cold Chain', 'Aqua'],            color: '#0d9488', bg: '#f0fdfa' },
  { icon: AlertTriangle, title: 'Conflict Early Warning',      desc: 'A real-time monitoring system tracking farmer-herder tension hotspots and enabling swift mediation before conflicts escalate.',            tags: ['Early Warning', 'CIMS', 'Mediation'],    color: '#dc2626', bg: '#fef2f2' },
  { icon: Map,           title: 'Geospatial Decision Support', desc: 'The LPRES GDSS: GIS mapping, satellite imagery, and spatial analytics guiding livestock corridor and resource management.',              tags: ['GDSS', 'GIS', 'Remote Sensing'],         color: '#2e5e35', bg: '#f0fdf4' },
  { icon: BookOpen,      title: 'Extension & Capacity',        desc: 'Training 3,800+ farmers and extension officers in animal husbandry, rangeland management, and agribusiness development.',                  tags: ['Training', 'Extension', 'Agribusiness'], color: '#7c3aed', bg: '#f5f3ff' },
];

const OBJECTIVES = [
  'Increase livestock productivity through improved breeds, feeds, and animal health services',
  'Develop and strengthen cattle, poultry, and dairy value chains across all 16 LGAs',
  'Reduce farmer-herder conflicts through early warning systems and mediation platforms',
  'Establish a Geospatial Decision Support System for livestock management',
  'Improve market access and commercialisation pathways for smallholder producers',
  'Build institutional capacity in livestock extension, policy, and data management',
];

const TEAM = [
  { name: 'Prof. Abdulrahman Kawu', role: 'Project Coordinator',       img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',  bio: '25+ years in livestock development and agricultural policy across West Africa.' },
  { name: 'Dr. Amina Suleiman',     role: 'Head of Animal Health',     img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80', bio: 'DVM, PhD. Specialist in transboundary animal disease surveillance and control.' },
  { name: 'Engr. Musa Aliyu',       role: 'GDSS Lead',                 img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80', bio: 'Architect of the L-PRES Geospatial Decision Support System and data infrastructure.' },
  { name: 'Dr. Grace Adekunle',     role: 'Value Chain Specialist',    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80', bio: 'Expert in livestock market systems, contract farming, and agribusiness in Nigeria.' },
  { name: 'Alhaji Bello Kawu',      role: 'Conflict Resolution',       img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80', bio: 'Traditional ruler liaison and conflict mediator for Kwara\'s pastoral communities.' },
  { name: 'Mrs. Funke Adeyemi',     role: 'Gender & Social Inclusion', img: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=300&q=80', bio: 'Ensuring women and youth benefit equitably from L-PRES investments across all LGAs.' },
];

/* ══════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════ */
function HeroLight() {
  const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="hl-hero">
      {/* decorative blob */}
      <div className="hl-hero__blob" aria-hidden="true" />

      <div className="hl-hero__inner container">
        {/* Left */}
        <div className="hl-hero__left">
          <span className="hl-hero__badge">
            <span className="hl-hero__badge-dot" />
            Kwara State · L-PRES Project
          </span>

          <h1 className="hl-hero__title">
            Livestock{' '}
            <em className="hl-hero__em">in motion.</em>
            <br />
            Communities{' '}
            <em className="hl-hero__em">in bloom.</em>
          </h1>

          <p className="hl-hero__sub">
            A statewide programme transforming livestock productivity,
            resilience, and commercialisation, built with the farmers,
            herders, and communities of Kwara.
          </p>

          <div className="hl-hero__ctas">
            <button className="hl-btn-primary" onClick={() => scrollTo('#hl-about')}>
              Explore the project <ArrowRight size={16} />
            </button>
            <button className="hl-btn-ghost" onClick={() => scrollTo('#hl-programs')}>
              Our value chains
            </button>
          </div>

          <div className="hl-hero__social">
            {[
              ['https://facebook.com/lpreskwara',  'Facebook',  <FB />],
              ['https://twitter.com/lpreskwara',   'Twitter',   <TW />],
              ['https://instagram.com/lpreskwara', 'Instagram', <IG />],
              ['https://linkedin.com/company/lpreskwara', 'LinkedIn', <LI />],
              ['https://youtube.com/@lpreskwara',  'YouTube',   <YT />],
            ].map(([href, label, icon]) => (
              <a key={label} href={href} className="hl-hero__social-icon" aria-label={label}
                target="_blank" rel="noopener noreferrer">{icon}</a>
            ))}
            <span className="hl-hero__social-sep" />
            <span className="hl-hero__social-label">Follow us</span>
          </div>
        </div>

        {/* Right */}
        <div className="hl-hero__right">
          <div className="hl-hero__img-card">
            <img src="/hero-bg.jpg" alt="Kwara livestock landscape" className="hl-hero__img" />
            <div className="hl-hero__img-tint" />

            <div className="hl-hero__chip hl-hero__chip--top">
              <span className="hl-hero__chip-num">12,400+</span>
              <span className="hl-hero__chip-lbl">Direct Beneficiaries</span>
            </div>

            <div className="hl-hero__chip hl-hero__chip--side">
              <span className="hl-hero__chip-num">16</span>
              <span className="hl-hero__chip-lbl">LGAs Active</span>
            </div>
          </div>

          <div className="hl-hero__mini-stats">
            {[
              ['85,000+', 'Animals Vaccinated'],
              ['3,800+',  'Farmers Trained'],
              ['2020',    'Year Started'],
            ].map(([val, lbl]) => (
              <div key={lbl} className="hl-hero__mini-stat">
                <span className="hl-hero__mini-num">{val}</span>
                <span className="hl-hero__mini-lbl">{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   STATS BAND
══════════════════════════════════════════════════════════ */
function StatItem({ stat, started }) {
  const fmt = (n) => n >= 1000 ? n.toLocaleString() : String(n);
  const count = useCountUp(stat.value, 2000, started);
  return (
    <div className="hl-stat">
      <div className="hl-stat__num">{fmt(count)}{stat.suffix}</div>
      <div className="hl-stat__lbl">{stat.label}</div>
    </div>
  );
}

function StatsLight() {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section className="hl-stats" ref={ref}>
      <div className="hl-stats__bar container-wide">
        {STATS.map((s, i) => (
          <StatItem key={s.label} stat={s} started={started} />
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   ABOUT (Project Intro light)
══════════════════════════════════════════════════════════ */
function AboutLight() {
  return (
    <section className="hl-about section" id="hl-about">
      <div className="container">
        <div className="hl-about__grid">

          <div className="hl-about__left">
            <span className="hl-label">About the Project</span>
            <h2 className="hl-about__title">
              Strategic investment in{' '}
              <em className="hl-about__em">people, herds</em>{' '}
              and pastures.
            </h2>
            <div className="hl-rule" />
            <p className="hl-about__body">
              The L-PRES Project is a flagship initiative of the Kwara State Government,
              co-funded by IFAD and the World Bank, implementing strategic interventions
              that improve productivity, strengthen value chains, and promote
              commercialisation across all sixteen Local Government Areas.
            </p>
            <p className="hl-about__body">
              Through targeted investment in animal health, feeds and nutrition, market
              access, and geospatial decision support, L-PRES is building the foundation
              for a productive, resilient, and commercially oriented livestock sector.
            </p>
            <div className="hl-about__pills">
              {['IFAD Funded', 'World Bank', '16 LGAs', '2020–2026'].map(p => (
                <span key={p} className="hl-about__pill">{p}</span>
              ))}
            </div>
          </div>

          <div className="hl-about__right">
            <div className="hl-about__cards">
              <div className="hl-about__card hl-about__card--vision">
                <Eye size={22} className="hl-about__card-icon" />
                <h4>Our Vision</h4>
                <p>A productive, resilient, and commercially viable livestock sector driving Kwara's economic growth and food security.</p>
              </div>
              <div className="hl-about__card hl-about__card--mission">
                <Compass size={22} className="hl-about__card-icon" />
                <h4>Our Mission</h4>
                <p>Improving livestock productivity, resilience and commercialisation through strategic investments and inclusive partnerships.</p>
              </div>
            </div>
            <div className="hl-about__img-wrap">
              <img src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=700&q=80"
                alt="L-PRES field" className="hl-about__img" />
              <div className="hl-about__img-badge">
                <span className="hl-about__img-badge-num">5+</span>
                <span className="hl-about__img-badge-lbl">Years of Impact</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   COORDINATOR MESSAGE
══════════════════════════════════════════════════════════ */
function SPCLight() {
  return (
    <section className="hl-spc section" id="hl-spc">
      <div className="container">
        <div className="hl-spc__grid">

          <div className="hl-spc__photo-col">
            <div className="hl-spc__card">
              <img src="/spc-photo.jpg" alt="Olusoji Oyawoye" className="hl-spc__img" />
              <div className="hl-spc__overlay">
                <p className="hl-spc__name">Olusoji Oyawoye</p>
                <p className="hl-spc__role">State Project Coordinator</p>
              </div>
            </div>
          </div>

          <div className="hl-spc__content">
            <span className="hl-label">A Message from the SPC</span>
            <blockquote className="hl-spc__quote">
              "Livestock remains an important source of livelihood, food security, and
              economic opportunity for thousands of households across Kwara State."
            </blockquote>
            <p className="hl-spc__body">
              Recognizing the sector's immense potential, the Kwara State L-PRES Project
              is implementing strategic interventions aimed at <em>improving productivity</em>,
              strengthening value chains, enhancing resilience, and promoting <em>sustainable
              growth</em> within the sector.
            </p>
            <p className="hl-spc__body">
              We invite you to explore our programmes, achievements, and ongoing initiatives,
              and to join us in advancing a more <em>productive, resilient, and prosperous
              livestock sector</em> in Kwara State.
            </p>
            <div className="hl-spc__sig">
              <div className="hl-spc__sig-line" />
              <div>
                <div className="hl-spc__sig-name">Olusoji Oyawoye</div>
                <div className="hl-spc__sig-role">State Project Coordinator, L-PRES Kwara</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   PROGRAMS
══════════════════════════════════════════════════════════ */
function ProgramsLight() {
  return (
    <section className="hl-programs section" id="hl-programs">
      <div className="container">
        <div className="hl-programs__header">
          <span className="hl-label">Value Chains &amp; Programmes</span>
          <h2 className="hl-section-title">What We Do</h2>
          <p className="hl-section-sub">
            Six integrated programme areas driving livestock productivity and resilience across Kwara State.
          </p>
        </div>

        <div className="hl-programs__grid">
          {PROGRAMS.map((prog) => (
            <div key={prog.title} className="hl-prog-card"
              style={{ '--pc': prog.color, '--pb': prog.bg }}>
              <div className="hl-prog-card__bar" />
              <div className="hl-prog-card__icon">
                <prog.icon size={22} />
              </div>
              <h3 className="hl-prog-card__title">{prog.title}</h3>
              <p className="hl-prog-card__desc">{prog.desc}</p>
              <div className="hl-prog-card__tags">
                {prog.tags.map(t => <span key={t} className="hl-tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   MISSION
══════════════════════════════════════════════════════════ */
function MissionLight() {
  return (
    <section className="hl-mission section" id="hl-mission">
      <div className="container">
        <div className="hl-mission__header">
          <span className="hl-label">Our Direction</span>
          <h2 className="hl-section-title">Mission &amp; Vision</h2>
        </div>

        <div className="hl-mission__cards">
          <div className="hl-mission__card hl-mission__card--vision">
            <div className="hl-mission__card-icon"><Eye size={28} /></div>
            <h3>Our Vision</h3>
            <p>A Kwara State where a commercially viable, climate-resilient, and equitably organised livestock sector drives prosperity for farmers, herders, and their families, underpinned by world-class infrastructure and evidence-based policy.</p>
          </div>
          <div className="hl-mission__card hl-mission__card--mission">
            <div className="hl-mission__card-icon"><Compass size={28} /></div>
            <h3>Our Mission</h3>
            <p>To sustainably improve livestock productivity and build resilience among smallholder farmers and pastoralists in Kwara State through targeted investments in animal health, value chain development, and geospatial technology.</p>
          </div>
        </div>

        <div className="hl-objectives">
          <h3 className="hl-objectives__title">Strategic Objectives</h3>
          <div className="hl-objectives__grid">
            {OBJECTIVES.map((obj, i) => (
              <div key={i} className="hl-obj-item">
                <span className="hl-obj-item__num">0{i + 1}</span>
                <ChevronRight size={14} className="hl-obj-item__arrow" />
                <p>{obj}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   TEAM
══════════════════════════════════════════════════════════ */
function TeamLight() {
  return (
    <section className="hl-team section" id="hl-team">
      <div className="container">
        <div className="hl-team__header">
          <span className="hl-label">The People</span>
          <h2 className="hl-section-title">Meet Our Expert Team</h2>
          <p className="hl-section-sub">
            A multidisciplinary team of livestock specialists, technologists, and community practitioners.
          </p>
        </div>

        <div className="hl-team__grid">
          {TEAM.map((m) => (
            <div key={m.name} className="hl-team-card">
              <div className="hl-team-card__img-wrap">
                <img src={m.img} alt={m.name} className="hl-team-card__img" />
              </div>
              <h4 className="hl-team-card__name">{m.name}</h4>
              <span className="hl-team-card__role">{m.role}</span>
              <p className="hl-team-card__bio">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   CONTACT
══════════════════════════════════════════════════════════ */
function ContactLight() {
  return (
    <section className="hl-contact section" id="hl-contact">
      <div className="container">
        <div className="hl-contact__grid">

          <div className="hl-contact__info">
            <span className="hl-label">Get in Touch</span>
            <h2 className="hl-section-title">Contact Us</h2>
            <p className="hl-contact__sub">
              Reach out to the L-PRES Project Management Unit for enquiries,
              partnerships, or media requests.
            </p>
            <div className="hl-contact__items">
              {[
                [MapPin, 'L-PRES PMU, Ministry of Agriculture, Kwara State, Ilorin, Nigeria'],
                [Phone,  '+234 (0) 800 L-PRES-01'],
                [Mail,   'info@lpreskwara.ng'],
              ].map(([Icon, text]) => (
                <div key={text} className="hl-contact__item">
                  <div className="hl-contact__item-icon"><Icon size={18} /></div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <form className="hl-contact__form" onSubmit={(e) => e.preventDefault()}>
            <div className="hl-form-row">
              <div className="hl-form-group">
                <label className="hl-form-label">Full Name</label>
                <input className="hl-form-input" type="text" placeholder="Your full name" />
              </div>
              <div className="hl-form-group">
                <label className="hl-form-label">Email Address</label>
                <input className="hl-form-input" type="email" placeholder="you@example.com" />
              </div>
            </div>
            <div className="hl-form-group">
              <label className="hl-form-label">Subject</label>
              <input className="hl-form-input" type="text" placeholder="What is this about?" />
            </div>
            <div className="hl-form-group">
              <label className="hl-form-label">Message</label>
              <textarea className="hl-form-input hl-form-textarea" rows={5}
                placeholder="Tell us how we can help…" />
            </div>
            <button type="submit" className="hl-btn-primary hl-form-submit">
              Send Message <ArrowRight size={16} />
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE ROOT
══════════════════════════════════════════════════════════ */
export default function HomeLight() {
  return (
    <div className="hl-page">
      <NavbarLight />
      <main>
        <HeroLight />
        <StatsLight />
        <AboutLight />
        <SPCLight />
        <ProgramsLight />
        <MissionLight />
        <TeamLight />
        <ContactLight />
      </main>
      <Footer />
    </div>
  );
}
