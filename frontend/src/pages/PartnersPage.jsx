import { Link } from 'react-router-dom';
import { ChevronRight, ExternalLink, ArrowRight } from 'lucide-react';
import './PartnersPage.css';

const PARTNERS = [
  {
    abbr: 'KSG',
    name: 'Kwara State Government',
    role: 'Lead Implementing Partner',
    color: '#2e5e35',
    desc: 'The Kwara State Government provides leadership and counterpart support for the implementation of the project within the state and remains committed to advancing livestock sector development as a driver of economic growth and food security.',
    contributions: [
      'State-level leadership and political will',
      'Counterpart funding and resource mobilisation',
      'Policy and regulatory environment',
      'Coordination of state MDAs',
      'Land and infrastructure facilitation',
    ],
  },
  {
    abbr: 'WB',
    name: 'World Bank',
    role: 'Lead Financier',
    color: '#1a56a0',
    desc: 'The World Bank provides financial and technical support for the implementation of the Livestock Productivity and Resilience Support (L-PRES) Project in participating states across Nigeria, including Kwara State.',
    contributions: [
      'Project financing and credit facility',
      'Technical advisory and oversight',
      'Results framework and M&E support',
      'Safeguards compliance',
      'Knowledge and learning partnership',
    ],
  },
  {
    abbr: 'FMLD',
    name: 'Federal Ministry of Livestock Development',
    role: 'National Oversight',
    color: '#c49a3e',
    desc: 'The Federal Ministry of Livestock Development provides policy direction and oversight for the implementation of the project at the national level through the National Coordination Office, ensuring alignment with national livestock sector priorities.',
    contributions: [
      'National policy direction and coordination',
      'National Coordination Office (NCO)',
      'Inter-state learning and harmonisation',
      'Federal-level advocacy',
      'Policy and regulatory framework',
    ],
  },
  {
    abbr: 'IPs',
    name: 'Implementing Partners',
    role: 'Implementation Partners',
    color: '#7c3aed',
    desc: 'The project works closely with relevant ministries, departments, agencies, livestock producers, pastoralist communities, private sector actors, traditional institutions, research organisations, and development stakeholders to ensure effective implementation and sustainable outcomes.',
    contributions: [
      'Ministry of Agriculture and Rural Development',
      'State Animal Health Services',
      'Livestock producer associations',
      'Pastoralist community organisations',
      'Private sector value chain actors',
    ],
  },
];

const PARTNERSHIP_MODEL = [
  { step: '01', title: 'Federal Oversight', desc: 'Federal Ministry of Livestock Development (FMLD) provides national policy direction and coordination through the National Coordination Office.' },
  { step: '02', title: 'World Bank Financing', desc: 'World Bank provides concessional financing and technical advisory support, with disbursements tied to verified results and compliance with safeguards.' },
  { step: '03', title: 'State Leadership', desc: 'Kwara State Government provides counterpart resources, coordinates state MDAs, and exercises overall project leadership at the state level.' },
  { step: '04', title: 'Community Delivery', desc: 'Implementing partners, producer organisations, and private sector actors deliver interventions directly to beneficiaries at the community level.' },
];

export default function PartnersPage() {
  return (
    <div className="pp2">

      {/* Page Hero */}
      <div className="pp2__hero">
        <div className="pp2__hero-bg" />
        <div className="container pp2__hero-inner">
          <nav className="pp2__breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <span>Partners</span>
          </nav>
          <h1 className="pp2__hero-title">Our Partners</h1>
          <p className="pp2__hero-sub">
            Implemented through a collaborative partnership of government institutions,
            development partners, and key stakeholders
          </p>
        </div>
      </div>

      {/* Intro */}
      <section className="pp2__section pp2__section--light">
        <div className="container">
          <div className="pp2__intro">
            <div className="pp2__intro-text">
              <span className="section-label dark">Partnership Model</span>
              <h2 className="pp2__section-title">Working Together for Impact</h2>
              <p>
                The Kwara State Livestock Productivity and Resilience Support (L-PRES) Project is
                implemented through a collaborative partnership involving development partners,
                government institutions, and key stakeholders working together to strengthen
                livestock productivity, commercialisation, and resilience across the state.
              </p>
              <p>
                This multi-level partnership ensures that project interventions are well-resourced,
                technically sound, politically supported, and community-driven — combining the
                strengths of each partner to maximise development impact.
              </p>
            </div>
            <div className="pp2__model-steps">
              {PARTNERSHIP_MODEL.map(m => (
                <div key={m.step} className="pp2__model-step">
                  <div className="pp2__model-num">{m.step}</div>
                  <div className="pp2__model-body">
                    <h4>{m.title}</h4>
                    <p>{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners cards */}
      <section className="pp2__section pp2__section--dark" id="partners-list">
        <div className="container">
          <div className="text-center pp2__section-header">
            <span className="section-label">Key Partners</span>
            <h2 className="pp2__section-title pp2__section-title--light">Our Partnership</h2>
            <p className="pp2__section-sub--light">
              Four key partnership categories working in coordination to deliver the L-PRES mandate.
            </p>
          </div>

          <div className="pp2__partners-grid">
            {PARTNERS.map((p) => (
              <div key={p.abbr} className="pp2__partner-card" style={{ '--pc': p.color }}>
                <div className="pp2__partner-head">
                  <div className="pp2__partner-abbr" style={{ color: p.color, background: `${p.color}18` }}>
                    {p.abbr}
                  </div>
                  <span className="pp2__partner-role">{p.role}</span>
                </div>
                <h3 className="pp2__partner-name">{p.name}</h3>
                <p className="pp2__partner-desc">{p.desc}</p>
                <div className="pp2__partner-contrib">
                  <h4>Key Contributions</h4>
                  <ul>
                    {p.contributions.map(c => (
                      <li key={c}><span className="pp2__contrib-dot" style={{ background: p.color }} />{c}</li>
                    ))}
                  </ul>
                </div>
                <div className="pp2__partner-bar" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pp2__section pp2__section--cta">
        <div className="container pp2__cta-row">
          <div>
            <h3 className="pp2__cta-title">Want to Partner with L-PRES?</h3>
            <p className="pp2__cta-sub">Whether you are an investor, researcher, or development organisation — get in touch.</p>
          </div>
          <div className="pp2__cta-btns">
            <Link to="/contact" className="btn btn-primary">
              Get in Touch <ArrowRight size={16} />
            </Link>
            <Link to="/about" className="btn btn-outline pp2__btn-outline">
              About the Project
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
