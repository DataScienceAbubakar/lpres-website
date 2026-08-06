import { Link } from 'react-router-dom';
import { Map, ArrowRight, Navigation, GitBranch } from 'lucide-react';
import { GDSS_PORTAL_URL } from '../../utils/env';
import './GDSSPreview.css';

const STATS = [
  { value: '160', label: 'Total Corridors', sub: 'Mapped across 16 LGAs' },
  { value: '92', label: 'GPS Verified', sub: 'GPS-confirmed corridors' },
  { value: '68', label: 'Participatory', sub: 'Community-mapped routes' },
  { value: '16', label: 'LGAs Covered', sub: 'Full state coverage' },
];

export default function GDSSPreview() {
  return (
    <section className="gdss section" id="gdss">
      <div className="container">
        <div className="gdss__grid">

          {/* Left: text */}
          <div className="gdss__left">
            <span className="section-label">Geographic Data Support System</span>
            <h2 className="gdss__title">GDSS Overview</h2>
            <p className="gdss__body">
              Real-time geospatial intelligence on livestock grazing corridors, GPS survey coverage,
              and ward-level mapping across Kwara State, powering evidence-based decision making for
              the entire L-PRES programme.
            </p>

            <div className="gdss__coverage">
              <div className="gdss__coverage-label">
                <Navigation size={13} /> GPS vs Participatory Coverage
              </div>
              <p className="gdss__coverage-sub">Out of 160 total corridors mapped across 16 LGAs</p>
              <div className="gdss__bar-wrap">
                <div className="gdss__bar-track">
                  <div className="gdss__bar-fill gdss__bar-fill--gps" style={{ width: '57.5%' }}>
                    <span>GPS (92)</span>
                  </div>
                  <div className="gdss__bar-fill gdss__bar-fill--part" style={{ width: '42.5%' }}>
                    <span>Participatory (68)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="gdss__routes">
              <GitBranch size={14} />
              <span><strong>GPS Corridors by Route</strong>: 92 GPS-verified corridors across 68 named routes</span>
            </div>

            <a
              href={GDSS_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary gdss__cta"
            >
              Open GDSS Portal <ArrowRight size={16} />
            </a>
          </div>

          {/* Right: stat grid */}
          <div className="gdss__right">
            <div className="gdss__map-card">
              <div className="gdss__map-header">
                <Map size={18} />
                <span>Kwara State · Livestock Corridor Map</span>
                <span className="gdss__live-badge">
                  <span className="gdss__live-dot" /> Live Data
                </span>
              </div>
              <div className="gdss__map-placeholder">
                <div className="gdss__map-grid-lines">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={`h${i}`} className="gdss__grid-line gdss__grid-line--h" style={{ top: `${i * 16}%` }} />
                  ))}
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={`v${i}`} className="gdss__grid-line gdss__grid-line--v" style={{ left: `${i * 14}%` }} />
                  ))}
                </div>
                {/* Scatter dots representing corridors */}
                {[
                  [22, 18], [45, 32], [68, 22], [35, 48], [72, 55], [28, 65],
                  [55, 70], [80, 38], [15, 42], [60, 78], [42, 25], [18, 58],
                  [85, 68], [50, 45], [30, 80], [75, 28],
                ].map(([x, y], i) => (
                  <div key={i} className="gdss__dot" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.18}s` }} />
                ))}
                <div className="gdss__map-label">Kwara State</div>
              </div>
              <div className="gdss__stats-row">
                {STATS.map(s => (
                  <div key={s.label} className="gdss__stat">
                    <span className="gdss__stat-val">{s.value}</span>
                    <span className="gdss__stat-lbl">{s.label}</span>
                    <span className="gdss__stat-sub">{s.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
