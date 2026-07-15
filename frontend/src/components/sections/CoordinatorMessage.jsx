import { Link } from 'react-router-dom';
import { MapPin, Leaf, Users, ArrowRight } from 'lucide-react';
import './CoordinatorMessage.css';

const HIGHLIGHTS = [
  {
    icon: MapPin,
    label: 'State-wide Coverage',
    text: 'All 16 LGAs across Kwara Central, North & South: cattle, sheep and goats.',
    color: '#c49a3e',
  },
  {
    icon: Leaf,
    label: 'Climate-Smart Focus',
    text: 'Innovation, climate-resilient practices, and sustainable feed resource development.',
    color: '#2e5e35',
  },
  {
    icon: Users,
    label: 'Inclusive Partnerships',
    text: 'Co-delivered with producers, communities, government, and development partners.',
    color: '#0891b2',
  },
];

export default function CoordinatorMessage() {
  return (
    <section className="spc section" id="coordinators-message">
      <div className="container">
        <div className="spc__grid">

          {/* Photo card */}
          <div className="spc__photo-col" data-animate>
            <div className="spc__card">
              {/* Decorative ring + corner accents over the background */}
              <div className="spc__card-ring" />
              <div className="spc__card-corner" />

              {/* Live badge */}
              <div className="spc__badge">
                <span className="spc__badge-dot" />
                <span className="spc__badge-text">Kwara L-PRES</span>
              </div>

              <img
                src="/spc-photo.png"
                alt="Olusoji Oyawoye – State Project Coordinator"
                className="spc__photo"
              />
              <div className="spc__overlay">
                <p className="spc__name">Olusoji Oyawoye</p>
                <p className="spc__role">State Project Coordinator</p>
                <p className="spc__org">Kwara State L-PRES Project</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="spc__content" data-animate data-delay="2">
            <span className="section-label dark">From the Coordinator</span>

            {/* Pull quote */}
            <div className="spc__pull">
              <div className="spc__pull-mark">&ldquo;</div>
              <blockquote className="spc__quote">
                Welcome to the official website of the Kwara State Livestock Productivity and Resilience Support (L-PRES) Project.
              </blockquote>
            </div>

            <p className="spc__body">
              We are committed to building a more productive, resilient, and prosperous
              livestock sector for Kwara State, through innovation, inclusive partnerships,
              and strategic investment in people, herds and pastures.
            </p>

            {/* Highlight chips */}
            <div className="spc__highlights">
              {HIGHLIGHTS.map(({ icon: Icon, label, text, color }) => (
                <div key={label} className="spc__hl" style={{ '--hc': color }}>
                  <div className="spc__hl-icon" style={{ background: `${color}18`, color }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="spc__hl-label">{label}</div>
                    <div className="spc__hl-text">{text}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sign-off + CTA */}
            <div className="spc__footer">
              <div className="spc__sign">
                <span className="spc__sign-name">Olusoji Oyawoye</span>
                <span className="spc__sign-role">State Project Coordinator, Kwara L-PRES</span>
              </div>
              <Link to="/about#coordinators-message" className="spc__read-more">
                Read Full Message <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
