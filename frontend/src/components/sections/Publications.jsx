import { FileText, Download, ArrowRight, BookOpen, TrendingUp, ClipboardList } from 'lucide-react';
import './Publications.css';

const PUBS = [
  {
    icon: BookOpen,
    type: 'Technical Framework',
    title: 'L-PRES Livestock Value Chain Development Framework',
    date: 'March 2024',
    desc: 'Comprehensive technical framework guiding value chain development for cattle, poultry, dairy, and small ruminants across Kwara State.',
    badge: 'Framework',
    color: '#c49a3e',
  },
  {
    icon: TrendingUp,
    type: 'Impact Assessment',
    title: 'Mid-Term Impact Assessment Report — Year 2',
    date: 'December 2023',
    desc: 'Detailed assessment of beneficiary outcomes, livestock productivity gains, and income improvements across all 16 LGAs in Year 2.',
    badge: 'Assessment',
    color: '#2e5e35',
  },
  {
    icon: ClipboardList,
    type: 'Annual Report',
    title: 'L-PRES Kwara State Annual Programme Report 2023',
    date: 'January 2024',
    desc: 'Full programme report detailing implementation progress, financial summaries, and results across all project components for FY2023.',
    badge: 'Annual Report',
    color: '#1a56a0',
  },
  {
    icon: FileText,
    type: 'Policy Brief',
    title: 'Pastoralist–Farmer Conflict Prevention: Evidence from the Field',
    date: 'June 2023',
    desc: 'Evidence-based policy brief on L-PRES conflict prevention initiatives and the measurable reduction in farmer-herder disputes in target zones.',
    badge: 'Policy Brief',
    color: '#7c3aed',
  },
];

export default function Publications() {
  return (
    <section className="pubs section" id="publications">
      <div className="container">
        <div className="pubs__header text-center">
          <span className="section-label">Knowledge Hub</span>
          <h2 className="section-title">Publications &amp; Reports.</h2>
          <p className="section-subtitle mx-auto">
            Access our latest technical frameworks, impact assessments, and annual programme reports
            detailing our progress across Kwara State.
          </p>
        </div>

        <div className="pubs__grid">
          {PUBS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="pubs__card" style={{ '--pc': p.color }}>
                <div className="pubs__card-top">
                  <div className="pubs__icon-wrap">
                    <Icon size={20} />
                  </div>
                  <span className="pubs__badge">{p.badge}</span>
                </div>
                <div className="pubs__type">{p.type}</div>
                <h3 className="pubs__title">{p.title}</h3>
                <p className="pubs__desc">{p.desc}</p>
                <div className="pubs__footer">
                  <span className="pubs__date">{p.date}</span>
                  <button className="pubs__dl-btn" type="button">
                    <Download size={13} /> Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pubs__cta-row">
          <a href="#publications" className="btn btn-outline pubs__view-all">
            View All Publications <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
