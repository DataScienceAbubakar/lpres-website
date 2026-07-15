import { useState, useEffect } from 'react';
import { MapPin, ChevronLeft, ChevronRight, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './OnTheGround.css';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

function mediaUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

const STATUS_STYLES = {
  Active:    { bg: 'rgba(22,163,74,0.12)',  color: '#16a34a', border: 'rgba(22,163,74,0.3)'  },
  Completed: { bg: 'rgba(217,119,6,0.12)',  color: '#d97706', border: 'rgba(217,119,6,0.3)'  },
  Planned:   { bg: 'rgba(37,99,235,0.12)',  color: '#2563eb', border: 'rgba(37,99,235,0.3)'  },
};

/* Build a slide array from an API project */
function buildSlides(project) {
  const slides = [];
  if (project.cover_image) {
    slides.push({ src: mediaUrl(project.cover_image), label: project.lga || '' });
  }
  for (const img of (project.images || [])) {
    slides.push({ src: mediaUrl(img), label: '' });
  }
  if (slides.length === 0) {
    slides.push({ src: null, bg: 'linear-gradient(145deg,#0d2612 0%,#2e5e35 60%,#3d7a45 100%)', label: project.lga || '' });
  }
  return slides;
}

/* ── Static fallback shown when API returns nothing ────────── */
const FALLBACK = [
  {
    name: 'Automatic Weather Stations',
    location: 'Three Senatorial Districts, Kwara State',
    category: 'Climate Services',
    tag: 'Weather Monitoring',
    tagColor: '#2563eb',
    desc: 'Kwara L-PRES is combining climate science with modern livestock production through the establishment of three Automatic Weather Stations across Kwara State, one in each senatorial district. The stations generate real-time weather data that is shared with farmers through mobile devices, enabling livestock farmers and herders to make informed decisions, plan grazing activities more effectively, prepare for extreme weather events, and reduce potential losses.',
    slides: [
      { bg: 'linear-gradient(145deg,#0a1f3d 0%,#1e40af 60%,#3b82f6 100%)', label: 'Weather Station' },
    ],
  },
  {
    name: 'Pasture Development',
    location: 'Across Kwara State',
    category: 'Pastoral Services',
    tag: 'Pasture & Grazing',
    tagColor: '#16a34a',
    desc: 'Kwara L-PRES is expanding access to improved grazing resources through the establishment of cultivated pasture plots. These pastures provide nutritious forage for livestock, promote sustainable grazing practices, reduce pressure on natural vegetation, and support healthier, more productive animals.',
    slides: [
      { bg: 'linear-gradient(145deg,#052e16 0%,#166534 60%,#22c55e 100%)', label: 'Pasture Plot' },
    ],
  },
  {
    name: 'Feedlots',
    location: 'Kwara State',
    category: 'Infrastructure',
    tag: 'Livestock Finishing',
    tagColor: '#d97706',
    desc: 'The project has established modern feedlots to support intensive livestock finishing and improved productivity. Equipped with reliable water supply systems and drinking troughs, these facilities provide a controlled environment where animals receive adequate nutrition and care, resulting in better weight gain, improved animal health, and higher market value.',
    slides: [
      { bg: 'linear-gradient(145deg,#1a1005 0%,#92400e 60%,#d97706 100%)', label: 'Feedlot Facility' },
    ],
  },
  {
    name: 'Veterinary Diagnostic Centre',
    location: 'Ilorin, Kwara State',
    category: 'Animal Health',
    tag: 'Disease Surveillance',
    tagColor: '#7c3aed',
    desc: 'Kwara L-PRES rehabilitated and equipped the State Veterinary Diagnostic Centre with modern facilities to strengthen animal healthcare services across the state. The upgraded facility enhances disease surveillance, improves diagnostic capacity, supports vaccine storage through a functional cold chain system, and contributes to more effective prevention and control of livestock diseases.',
    slides: [
      { bg: 'linear-gradient(145deg,#2d1a5e 0%,#5b21b6 60%,#7c3aed 100%)', label: 'Diagnostic Centre' },
    ],
  },
  {
    name: 'Water Troughs',
    location: 'Strategic Locations, Kwara State',
    category: 'Water Infrastructure',
    tag: 'Water Access',
    tagColor: '#0891b2',
    desc: 'To improve access to clean water for livestock, Kwara L-PRES has constructed water troughs at strategic locations across the state. These facilities provide reliable drinking points for animals, reduce the distance travelled in search of water, support healthier livestock, and contribute to more efficient and sustainable livestock production.',
    slides: [
      { bg: 'linear-gradient(145deg,#062a2e 0%,#0e7490 60%,#22d3ee 100%)', label: 'Water Trough' },
    ],
  },
];

export default function OnTheGround() {
  const [apiProjects, setApiProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/projects/?limit=20`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setApiProjects(data); })
      .catch(() => {});
  }, []);

  const isApi = apiProjects.length > 0;
  const displayProjects = isApi ? apiProjects : FALLBACK;
  const project = displayProjects[activeProject] || displayProjects[0];

  const slides = isApi ? buildSlides(project) : (project?.slides || []);
  const slide = slides[Math.min(activeSlide, slides.length - 1)];
  const statusStyle = STATUS_STYLES[project?.status] || STATUS_STYLES.Active;
  const siteNum = String(activeProject + 1).padStart(2, '0');

  const prevSlide = () => setActiveSlide(s => (s - 1 + slides.length) % slides.length);
  const nextSlide = () => setActiveSlide(s => (s + 1) % slides.length);
  const goToProject = (idx) => { setActiveProject(idx); setActiveSlide(0); };

  if (!project) return null;

  return (
    <section className="otg section" id="project-sites">
      <div className="container">

        <div className="otg__header text-center" data-animate>
          <span className="section-label dark">On The Ground</span>
          <h2 className="section-title">Project Highlights</h2>
          <p className="section-subtitle mx-auto text-center">
            Key infrastructure investments and field operations driving transformation across Kwara State.
          </p>
        </div>

        <div className="otg__card" data-animate data-delay="2">

          {/* ── Left: image carousel ── */}
          <div className="otg__carousel">
            <div
              className="otg__slide"
              style={slide?.src ? undefined : { background: slide?.bg || 'linear-gradient(145deg,#0d2612 0%,#2e5e35 100%)' }}
            >
              {/* Real photo */}
              {slide?.src && (
                <>
                  <img src={slide.src} alt={slide.label || project.name} className="otg__slide-img" />
                  <div className="otg__slide-overlay" />
                </>
              )}

              <div className="otg__slide-pattern" />
              <div className="otg__slide-num">{siteNum}</div>

              {slide?.label && (
                <div className="otg__slide-label">{slide.label}</div>
              )}

              {slides.length > 1 && (
                <>
                  <button className="otg__arrow otg__arrow--prev" onClick={prevSlide} aria-label="Previous image">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="otg__arrow otg__arrow--next" onClick={nextSlide} aria-label="Next image">
                    <ChevronRight size={16} />
                  </button>
                  <div className="otg__img-dots">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        className={`otg__img-dot ${i === activeSlide ? 'otg__img-dot--active' : ''}`}
                        onClick={() => setActiveSlide(i)}
                        aria-label={`Photo ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Right: content ── */}
          <div className="otg__content">
            <div className="otg__content-top">

              {/* Tags / status badges */}
              <div className="otg__tags">
                {isApi ? (
                  <>
                    {project.cluster && (
                      <span className="otg__tag-cat">{project.cluster}</span>
                    )}
                    <span
                      className="otg__tag-status"
                      style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
                    >
                      {project.status}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="otg__tag-cat">{project.category}</span>
                    <span
                      className="otg__tag-type"
                      style={{ background: `${project.tagColor}1a`, color: project.tagColor, border: `1px solid ${project.tagColor}40` }}
                    >
                      {project.tag}
                    </span>
                  </>
                )}
              </div>

              <h3 className="otg__name">{project.name}</h3>

              {isApi ? (
                <>
                  {project.description && (
                    <p className="otg__desc">{project.description}</p>
                  )}

                  {project.highlights?.length > 0 && (
                    <ul className="otg__highlights">
                      {project.highlights.slice(0, 3).map((h, i) => (
                        <li key={i}>
                          <CheckCircle2 size={13} className="otg__highlight-icon" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="otg__loc">
                    <MapPin size={13} />
                    {project.lga}{project.cluster ? `, ${project.cluster}` : ''}
                  </div>
                </>
              ) : (
                <>
                  <p className="otg__desc">{project.desc}</p>
                  <div className="otg__loc">
                    <MapPin size={13} />
                    {project.location}
                  </div>
                </>
              )}
            </div>

            <div className="otg__footer">
              <Link to="/programs#project-sites" className="otg__read-more">
                Read More <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>

        {/* ── Project pagination dots ── */}
        <div className="otg__pagination">
          {displayProjects.map((s, i) => (
            <button
              key={i}
              className={`otg__page-dot ${i === activeProject ? 'otg__page-dot--active' : ''}`}
              onClick={() => goToProject(i)}
              aria-label={s.name}
              title={s.name}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
