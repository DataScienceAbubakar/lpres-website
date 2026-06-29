import { ShieldCheck, Lightbulb, Users, Handshake, Leaf, Zap, BarChart2 } from 'lucide-react';
import './CoreValues.css';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Accountability',
    desc: 'We uphold transparency, responsibility, and prudent management of resources in all project activities.',
    color: '#c49a3e',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    desc: 'We promote the adoption of modern technologies, improved practices, and innovative solutions that enhance livestock productivity and resilience.',
    color: '#f59e0b',
  },
  {
    icon: Users,
    title: 'Inclusiveness',
    desc: 'We ensure that women, youth, vulnerable groups, and diverse stakeholders have opportunities to participate in and benefit from project interventions.',
    color: '#0891b2',
  },
  {
    icon: Handshake,
    title: 'Collaboration',
    desc: 'We foster strong partnerships among government institutions, communities, private sector actors, development partners, and producer organisations.',
    color: '#2e5e35',
  },
  {
    icon: Leaf,
    title: 'Sustainability',
    desc: 'We support socially inclusive, environmentally responsible, and economically viable interventions that create lasting benefits for present and future generations.',
    color: '#16a34a',
  },
  {
    icon: Zap,
    title: 'Resilience',
    desc: 'We enhance the capacity of livestock producers and value chain actors to build resilience and effectively respond to evolving economic, environmental, and social challenges.',
    color: '#7c3aed',
  },
  {
    icon: BarChart2,
    title: 'Results Orientation',
    desc: 'We focus on measurable outcomes that improve livelihoods, strengthen value chains, and contribute to the development of the livestock sector in Kwara State.',
    color: '#dc2626',
  },
];

export default function CoreValues() {
  return (
    <section className="cv section" id="values">
      <div className="container">
        <div className="cv__header text-center" data-animate>
          <span className="section-label">What We Stand For</span>
          <h2 className="section-title">Our Core Values.</h2>
          <p className="section-subtitle mx-auto text-center">
            Seven principles that guide every intervention, partnership, and decision within the L-PRES programme.
          </p>
        </div>

        <div className="cv__grid">
          {VALUES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="cv__card" style={{ '--vc': color }}>
              <div className="cv__icon" style={{ background: `${color}18`, color }}>
                <Icon size={22} />
              </div>
              <h4 className="cv__title">{title}</h4>
              <p className="cv__desc">{desc}</p>
              <div className="cv__accent-line" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
