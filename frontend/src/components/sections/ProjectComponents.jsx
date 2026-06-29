import { Building2, TrendingUp, ShieldAlert, Settings } from 'lucide-react';
import './ProjectComponents.css';

const COMPONENTS = [
  {
    num: '01',
    icon: Building2,
    title: 'Institutional and Innovation System Strengthening',
    desc: 'Strengthening the systems, institutions, knowledge, and innovations required to support sustainable livestock development in Kwara State.',
    color: '#c49a3e',
  },
  {
    num: '02',
    icon: TrendingUp,
    title: 'Livestock Value Chain Enhancement',
    desc: 'Supporting activities that improve livestock productivity, increase value addition, strengthen market access, and enhance commercialisation within priority livestock value chains.',
    color: '#2e5e35',
  },
  {
    num: '03',
    icon: ShieldAlert,
    title: 'Crisis Prevention and Conflict Mitigation',
    desc: 'Promoting peaceful coexistence, strengthening conflict prevention mechanisms, and supporting sustainable management of resources used by livestock and farming communities.',
    color: '#dc2626',
  },
  {
    num: '04',
    icon: Settings,
    title: 'Project Coordination and Management',
    desc: 'Ensuring effective planning, implementation, monitoring, stakeholder engagement, and accountability in the delivery of project interventions.',
    color: '#0891b2',
  },
];

export default function ProjectComponents() {
  return (
    <section className="pc section" id="components">
      <div className="container">
        <div className="pc__header text-center">
          <span className="section-label dark">Strategic Framework</span>
          <h2 className="section-title">Project Components</h2>
          <p className="section-subtitle mx-auto text-center">
            The project is structured into four main components, each designed to address specific
            challenges within the livestock sector and ensure sustainable, long-term impact across Kwara State.
          </p>
        </div>

        <div className="pc__grid">
          {COMPONENTS.map((comp) => (
            <div key={comp.num} className="pc__card" style={{ '--cc': comp.color }}>
              <div className="pc__card-top">
                <span className="pc__num">{comp.num}</span>
                <div className="pc__icon" style={{ background: `${comp.color}18`, color: comp.color }}>
                  <comp.icon size={22} />
                </div>
              </div>
              <h3 className="pc__title">{comp.title}</h3>
              <p className="pc__desc">{comp.desc}</p>
              <div className="pc__bar" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
