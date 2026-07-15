import './Partners.css';

const PARTNERS = [
  {
    abbr: 'KSG',
    name: 'Kwara State Government',
    role: 'Lead Implementing Partner',
    desc: 'The Kwara State Government provides leadership and counterpart support for the implementation of the project within the state and remains committed to advancing livestock sector development as a driver of economic growth and food security.',
    color: '#2e5e35',
  },
  {
    abbr: 'WB',
    name: 'World Bank',
    role: 'Lead Financier',
    desc: 'The World Bank provides financial and technical support for the implementation of the Livestock Productivity and Resilience Support (L-PRES) Project in participating states across Nigeria.',
    color: '#1a56a0',
  },
  {
    abbr: 'FMLD',
    name: 'Federal Ministry of Livestock Development',
    role: 'National Oversight',
    desc: 'The Federal Ministry of Livestock Development provides policy direction and oversight for the implementation of the project at the national level through the National Coordination Office.',
    color: '#c49a3e',
  },
  {
    abbr: 'IFAD',
    name: 'Other Development Partners',
    role: 'Implementation Partners',
    desc: 'The project works closely with relevant ministries, departments, agencies, livestock producers, pastoralist communities, private sector actors, traditional institutions, research organisations, and development stakeholders.',
    color: '#7c3aed',
  },
];

export default function Partners() {
  return (
    <section className="pt section" id="partners">
      <div className="container">
        <div className="pt__header text-center">
          <span className="section-label">Working Together</span>
          <h2 className="section-title">Our Partners</h2>
          <p className="section-subtitle mx-auto text-center">
            Implemented through a collaborative partnership involving development partners,
            government institutions, and key stakeholders.
          </p>
        </div>

        <div className="pt__grid">
          {PARTNERS.map((p) => (
            <div key={p.abbr} className="pt__card" style={{ '--pc': p.color }}>
              <div className="pt__card-top">
                <div className="pt__abbr">{p.abbr}</div>
                <span className="pt__role">{p.role}</span>
              </div>
              <h3 className="pt__name">{p.name}</h3>
              <p className="pt__desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
