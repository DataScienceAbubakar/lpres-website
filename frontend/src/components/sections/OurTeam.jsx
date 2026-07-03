import './OurTeam.css';

const TEAM = [
  {
    name: 'Olusoji Oyawoye',
    role: 'State Project Coordinator',
    photo: '/team/coordinator.jpg',
    accent: '#1a5c26',
  },
  {
    name: 'Jidda Aminat Atinuke',
    role: 'Administration Officer',
    photo: '/team/admin-officer.jpg',
    accent: '#c49a3e',
  },
  {
    name: 'Kudirat Zubair-Oyewo',
    role: 'Monitoring & Evaluation Officer',
    photo: '/team/me-officer.jpg',
    accent: '#7c3aed',
  },
  {
    name: 'Owowlabi Ezekiel Adelowo',
    role: 'Procurement Officer',
    photo: '/team/procurement-officer.jpg',
    accent: '#0891b2',
  },
  {
    name: 'Salman Akeem Ayodeji',
    role: 'Project Accountant',
    photo: '/team/accountant.jpg',
    accent: '#6366f1',
  },
  {
    name: 'Engr. Isaac Yanda Usman',
    role: 'Project Engineer',
    photo: '/team/engineer.jpg',
    accent: '#dc6803',
  },
  {
    name: 'Dr. Bukola Richards',
    role: 'Animal Health Officer',
    photo: '/team/animal-health.jpg',
    accent: '#2e9e50',
  },
  {
    name: 'Folakemi Iseyemi',
    role: 'Social Safeguards Officer',
    photo: '/team/social-safeguards.jpg',
    accent: '#c026d3',
  },
  {
    name: 'Habeeb Tunde Affinni',
    role: 'Animal Husbandry Officer',
    photo: '/team/animal-husbandry.jpg',
    accent: '#16a34a',
  },
  {
    name: 'Kuburat Ayoola Omoniyi',
    role: 'Project Gender Officer',
    photo: '/team/gender-officer.jpg',
    accent: '#db2777',
  },
  {
    name: 'Nureni Rasaq',
    role: 'Project Extension Officer',
    photo: '/team/extension-officer.jpg',
    accent: '#b45309',
  },
  {
    name: 'Oluwaseyi Dara',
    role: 'Market Linkage & Value Chain Officer',
    photo: '/team/market-linkage.jpg',
    accent: '#0369a1',
  },
  {
    name: 'Rukayat Aminu',
    role: 'Project Internal Auditor',
    photo: '/team/internal-auditor.jpg',
    accent: '#dc2626',
  },
  {
    name: 'Yusuf Ganiyu Adebisi',
    role: 'Communication & ICT Officer',
    photo: '/team/ict-officer.jpg',
    accent: '#059669',
  },
];

export default function OurTeam() {
  return (
    <section className="ot" id="our-team">
      <div className="container">

        <div className="ot__header text-center">
          <span className="section-label dark">The People Behind L-PRES</span>
          <h2 className="ot__title">Our Team</h2>
          <p className="ot__sub">
            A dedicated group of professionals driving livestock transformation across Kwara State.
          </p>
        </div>

        <div className="ot__grid">
          {TEAM.map((member) => (
            <div key={member.name} className="ot__card">
              <div className="ot__photo-wrap">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="ot__photo"
                  loading="lazy"
                />
                <div className="ot__photo-fade" />
              </div>
              <div className="ot__body" style={{ '--accent': member.accent }}>
                <div className="ot__accent-line" style={{ background: member.accent }} />
                <h3 className="ot__name">{member.name}</h3>
                <span className="ot__role">{member.role}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
