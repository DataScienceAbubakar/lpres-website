import { Link } from 'react-router-dom';
import { Building2, TrendingUp, ShieldAlert, Settings, Beef, Milk, Rabbit, Droplets, ChevronRight, ArrowRight } from 'lucide-react';
import OnTheGround from '../components/sections/OnTheGround';
import './ProgramsPage.css';

const COMPONENTS = [
  {
    num: '01', icon: Building2, color: '#c49a3e',
    title: 'Institutional and Innovation System Strengthening',
    desc: 'Strengthening the systems, institutions, knowledge, and innovations required to support sustainable livestock development in Kwara State. This includes capacity building for state and local government institutions, veterinary services, animal health networks, and research partnerships.',
    highlights: ['Capacity Building', 'Veterinary Systems', 'Technology Adoption', 'Knowledge Management'],
  },
  {
    num: '02', icon: TrendingUp, color: '#2e5e35',
    title: 'Livestock Value Chain Enhancement',
    desc: 'Supporting activities that improve livestock productivity, increase value addition, strengthen market access, and enhance commercialisation within priority livestock value chains — covering cattle (beef and dairy), sheep, and goats across all 16 LGAs.',
    highlights: ['Productivity Improvement', 'Market Linkages', 'Value Addition', 'Commercialisation'],
  },
  {
    num: '03', icon: ShieldAlert, color: '#dc2626',
    title: 'Crisis Prevention and Conflict Mitigation',
    desc: 'Promoting peaceful coexistence, strengthening conflict prevention mechanisms, and supporting sustainable management of resources used by livestock and farming communities. Includes early warning systems and community dialogue platforms.',
    highlights: ['Early Warning Systems', 'Community Dialogue', 'Resource Management', 'Peaceful Coexistence'],
  },
  {
    num: '04', icon: Settings, color: '#0891b2',
    title: 'Project Coordination and Management',
    desc: 'Ensuring effective planning, implementation, monitoring, stakeholder engagement, and accountability in the delivery of project interventions across all components, including fiduciary management and M&E systems.',
    highlights: ['M&E Systems', 'Fiduciary Management', 'Stakeholder Engagement', 'Results Reporting'],
  },
];

const CHAINS = [
  {
    icon: Beef, color: '#c49a3e',
    label: 'Cattle (Beef)',
    title: 'Beef Value Chain',
    desc: 'The beef value chain plays an important role in meeting the growing demand for quality meat products while supporting livestock producers, traders, processors, and marketers. The project supports initiatives aimed at improving productivity, animal health, feed availability, market access, and value addition within the beef sector.',
    tags: ['Breed Improvement', 'Fattening', 'Animal Health', 'Market Access', 'Value Addition'],
  },
  {
    icon: Milk, color: '#0891b2',
    label: 'Cattle (Dairy)',
    title: 'Dairy Value Chain',
    desc: 'The dairy value chain offers significant opportunities for increased milk production, value addition, and income generation. The project promotes interventions that enhance dairy production systems, improve access to services, and strengthen opportunities for commercialisation across Kwara State.',
    tags: ['Milk Collection', 'Cold Chain', 'Processing', 'Commercialisation', 'Income Generation'],
  },
  {
    icon: Rabbit, color: '#7c3aed',
    label: 'Sheep',
    title: 'Sheep Value Chain',
    desc: 'Sheep production contributes to household income, food security, and livestock-based livelihoods across many communities in Kwara State. The project supports improved production practices, animal health management, and access to market opportunities within the sheep value chain.',
    tags: ['Production Practices', 'Animal Health', 'Market Access', 'Food Security', 'Livelihoods'],
  },
  {
    icon: Droplets, color: '#16a34a',
    label: 'Goats',
    title: 'Goat Value Chain',
    desc: 'Goat production remains an important livelihood activity for many rural households, particularly women and smallholder livestock producers. The project promotes interventions that improve productivity, strengthen resilience, and expand market opportunities for goat producers across the state.',
    tags: ['Smallholder Support', 'Women & Youth', 'Resilience', 'Market Expansion', 'Productivity'],
  },
];

export default function ProgramsPage() {
  return (
    <div className="pp">

      {/* Page Hero */}
      <div className="pp__hero">
        <div className="pp__hero-bg" />
        <div className="container pp__hero-inner">
          <nav className="pp__breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <span>Programmes</span>
          </nav>
          <h1 className="pp__hero-title">Programmes &amp; Interventions</h1>
          <p className="pp__hero-sub">
            Four strategic components and four priority value chains driving livestock transformation across Kwara State
          </p>
        </div>
      </div>

      {/* Project Components */}
      <section className="pp__section pp__section--light" id="components">
        <div className="container">
          <div className="text-center pp__section-header">
            <span className="section-label dark">Strategic Framework</span>
            <h2 className="pp__section-title">Project Components</h2>
            <p className="pp__section-sub">
              The project is structured into four main components, each designed to address specific challenges
              within the livestock sector and create sustainable impact across Kwara State.
            </p>
          </div>

          <div className="pp__components">
            {COMPONENTS.map((c) => (
              <div key={c.num} className="pp__comp-card" style={{ '--cc': c.color }}>
                <div className="pp__comp-head">
                  <div className="pp__comp-num">{c.num}</div>
                  <div className="pp__comp-icon" style={{ background: `${c.color}18`, color: c.color }}>
                    <c.icon size={22} />
                  </div>
                </div>
                <h3 className="pp__comp-title">{c.title}</h3>
                <p className="pp__comp-desc">{c.desc}</p>
                <div className="pp__comp-tags">
                  {c.highlights.map(h => (
                    <span key={h} className="pp__comp-tag" style={{ color: c.color, background: `${c.color}12`, borderColor: `${c.color}30` }}>{h}</span>
                  ))}
                </div>
                <div className="pp__comp-bar" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Chains */}
      <section className="pp__section pp__section--dark" id="value-chains">
        <div className="container">
          <div className="text-center pp__section-header">
            <span className="section-label">Priority Value Chains</span>
            <h2 className="pp__section-title pp__section-title--light">Focus Areas</h2>
            <p className="pp__section-sub pp__section-sub--light">
              Kwara L-PRES focuses on livestock value chains with the greatest potential for livelihood improvement,
              food security, and economic growth in the state.
            </p>
          </div>

          <div className="pp__chains">
            {CHAINS.map((chain) => (
              <div key={chain.label} className="pp__chain-card" style={{ '--vc': chain.color }}>
                <div className="pp__chain-head">
                  <div className="pp__chain-icon" style={{ background: `${chain.color}20`, color: chain.color }}>
                    <chain.icon size={26} />
                  </div>
                  <span className="pp__chain-badge" style={{ color: chain.color, background: `${chain.color}15`, borderColor: `${chain.color}30` }}>
                    {chain.label}
                  </span>
                </div>
                <h3 className="pp__chain-title">{chain.title}</h3>
                <p className="pp__chain-desc">{chain.desc}</p>
                <div className="pp__chain-tags">
                  {chain.tags.map(t => <span key={t} className="pp__chain-tag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Sites */}
      <OnTheGround />

      {/* CTA */}
      <section className="pp__section pp__section--cta">
        <div className="container pp__cta-row">
          <div>
            <h3 className="pp__cta-title">See the Impact</h3>
            <p className="pp__cta-sub">Explore our key results and programme outcomes across Kwara State.</p>
          </div>
          <div className="pp__cta-btns">
            <Link to="/impact" className="btn btn-primary">
              View Impact <ArrowRight size={16} />
            </Link>
            <Link to="/partners" className="btn btn-outline pp__btn-outline">
              Our Partners
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
