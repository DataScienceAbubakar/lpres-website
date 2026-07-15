import { Beef, Bird, Droplets, AlertTriangle, Map, BookOpen } from 'lucide-react';
import './Programs.css';

const PROGRAMS = [
  {
    icon: Beef,
    title: 'Cattle Value Chain',
    desc: 'Supporting beef and dairy production through improved breeds (Bunaji, Friesian crosses), veterinary services, and access to premium markets for Kwara cattle farmers.',
    tags: ['Beef', 'Dairy', 'Breed Improvement'],
    color: '#c49a3e',
  },
  {
    icon: Bird,
    title: 'Poultry Development',
    desc: 'Building a competitive poultry sub-sector through improved feeds, biosecurity training, commercial flock management, and structured buyer linkages.',
    tags: ['Layers', 'Broilers', 'Feeds'],
    color: '#f59e0b',
  },
  {
    icon: Droplets,
    title: 'Dairy & Aquaculture',
    desc: 'Establishing milk collection centres, processing facilities, and a cold chain network, while developing aquaculture as a complementary protein value chain.',
    tags: ['Milk Processing', 'Cold Chain', 'Aqua'],
    color: '#22d3ee',
  },
  {
    icon: AlertTriangle,
    title: 'Conflict Early Warning',
    desc: 'A real-time monitoring and response system that tracks farmer-herder tension hotspots, enabling swift mediation before conflicts escalate.',
    tags: ['Early Warning', 'CIMS', 'Mediation'],
    color: '#f87171',
  },
  {
    icon: Map,
    title: 'Geospatial Decision Support',
    desc: 'The LPRES GDSS platform: satellite imagery, GIS mapping, and spatial analytics that guide livestock corridor management and resource allocation.',
    tags: ['GDSS', 'GIS', 'Remote Sensing'],
    color: '#4ade80',
  },
  {
    icon: BookOpen,
    title: 'Extension & Capacity Building',
    desc: 'Training 3,800+ farmers and extension officers in best practices for animal husbandry, rangeland management, and agribusiness development.',
    tags: ['Training', 'Extension', 'Agribusiness'],
    color: '#a78bfa',
  },
];

export default function Programs() {
  return (
    <section className="programs section" id="programs">
      <div className="container">
        <div className="programs__header text-center">
          <span className="section-label dark">Value Chains &amp; Programmes</span>
          <h2 className="section-title">What We Do</h2>
          <p className="section-subtitle mx-auto text-center">
            Six integrated programme areas driving livestock productivity and resilience across Kwara State.
          </p>
        </div>

        <div className="programs__grid">
          {PROGRAMS.map((prog) => (
            <div key={prog.title} className="program-card card">
              <div className="program-card__icon" style={{ '--prog-color': prog.color }}>
                <prog.icon size={26} />
              </div>
              <h3 className="program-card__title">{prog.title}</h3>
              <p className="program-card__desc">{prog.desc}</p>
              <div className="program-card__tags">
                {prog.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
