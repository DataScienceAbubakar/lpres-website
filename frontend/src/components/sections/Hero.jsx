import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Hero.css';

const LGA_DOTS = [
  { top: '22%', left: '18%' }, { top: '35%', left: '42%' }, { top: '18%', left: '65%' },
  { top: '48%', left: '28%' }, { top: '55%', left: '58%' }, { top: '30%', left: '80%' },
  { top: '62%', left: '72%' }, { top: '70%', left: '38%' }, { top: '40%', left: '12%' },
  { top: '75%', left: '55%' }, { top: '25%', left: '52%' }, { top: '58%', left: '18%' },
  { top: '68%', left: '85%' }, { top: '45%', left: '70%' }, { top: '80%', left: '28%' },
  { top: '15%', left: '35%' },
];

export default function Hero() {
  const scrollToAbout = () =>
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="hero">
      {/* Background */}
      <div className="hero__bg">
        <img
          src="/hero-bg.jpg"
          alt="Kwara livestock landscape"
          className="hero__bg-img"
        />
        <div className="hero__overlay" />
      </div>

      <div className="hero__content container">
        {/* Left: text side */}
        <div className="hero__left">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            Kwara State · L-PRES Project
          </div>

          <h1 className="hero__title">
            Livestock{' '}
            <em className="hero__title-accent">in motion.</em>
            <br />
            Communities{' '}
            <em className="hero__title-accent">in bloom.</em>
          </h1>

          <p className="hero__subtitle">
            A statewide programme transforming livestock productivity,
            resilience, and commercialisation — built with the farmers,
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
              <span className="hero__coverage-label">Field Coverage</span>
              <span className="hero__coverage-live">
                <span className="hero__live-dot" /> Live · 16 LGAs
              </span>
            </div>

            {/* LGA dots map */}
            <div className="hero__map">
              {/* Infographic video — transparent overlay */}
              <video
                className="hero__map-video"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/map-infographic.mp4" type="video/mp4" />
              </video>

              {LGA_DOTS.map((pos, i) => (
                <span
                  key={i}
                  className="hero__map-dot"
                  style={{ top: pos.top, left: pos.left, animationDelay: `${i * 0.15}s` }}
                />
              ))}
              {/* Subtle grid lines */}
              <svg className="hero__map-grid" viewBox="0 0 300 200" preserveAspectRatio="none">
                {[1,2,3,4].map(i => (
                  <line key={`h${i}`} x1="0" y1={i*40} x2="300" y2={i*40}
                    stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                ))}
                {[1,2,3,4,5,6].map(i => (
                  <line key={`v${i}`} x1={i*50} y1="0" x2={i*50} y2="200"
                    stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                ))}
              </svg>
            </div>

            {/* Commodity chips */}
            <div className="hero__commodities">
              <div className="hero__commodity">
                <span className="hero__comm-dot hero__comm-dot--green" />
                <div>
                  <div className="hero__comm-label">Cattle</div>
                  <div className="hero__comm-value">Beef · Dairy</div>
                </div>
              </div>
              <div className="hero__commodity">
                <span className="hero__comm-dot hero__comm-dot--amber" />
                <div>
                  <div className="hero__comm-label">Poultry</div>
                  <div className="hero__comm-value">Feed</div>
                </div>
              </div>
              <div className="hero__commodity">
                <span className="hero__comm-dot hero__comm-dot--teal" />
                <div>
                  <div className="hero__comm-label">Dairy</div>
                  <div className="hero__comm-value">Aqua</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
