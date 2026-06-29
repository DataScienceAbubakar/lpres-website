import './OurTeam.css';

const TEAM = [
  {
    name: 'Dr. Abdullahi Musa',
    role: 'State Project Coordinator',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Leads the overall coordination and strategic direction of Kwara L-PRES, ensuring alignment with national livestock development goals and World Bank project requirements.',
    accent: '#2e9e50',
  },
  {
    name: 'Dr. Fatima Bello',
    role: 'Deputy Coordinator / Technical Lead',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Provides technical oversight across all project components, driving livestock value chain improvements and coordinating interventions with implementing partners.',
    accent: '#c49a3e',
  },
  {
    name: 'Engr. Samuel Adeyemi',
    role: 'Infrastructure & Facilities Manager',
    photo: 'https://randomuser.me/api/portraits/men/17.jpg',
    bio: 'Manages the planning and delivery of key livestock infrastructure investments including abattoirs, grazing centres, and market facilities across Kwara State.',
    accent: '#0891b2',
  },
  {
    name: 'Mrs. Aisha Lawal',
    role: 'M&E and Results Measurement Officer',
    photo: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: "Designs and manages the project's monitoring and evaluation framework, ensuring data-driven decision-making and timely results reporting to stakeholders.",
    accent: '#7c3aed',
  },
  {
    name: 'Mr. Idris Abubakar',
    role: 'Value Chain Development Specialist',
    photo: 'https://randomuser.me/api/portraits/men/54.jpg',
    bio: 'Leads interventions that strengthen priority value chains — cattle, sheep, and goats — improving market linkages, productivity, and income for livestock producers.',
    accent: '#dc2626',
  },
  {
    name: 'Dr. Grace Okafor',
    role: 'Animal Health & Production Specialist',
    photo: 'https://randomuser.me/api/portraits/women/29.jpg',
    bio: 'Coordinates veterinary services, disease surveillance, and animal health interventions, working closely with state veterinary departments and community extension agents.',
    accent: '#16a34a',
  },
  {
    name: 'Mr. Emmanuel Osei',
    role: 'Financial Management Specialist',
    photo: 'https://randomuser.me/api/portraits/men/75.jpg',
    bio: 'Oversees fiduciary management, financial reporting, and compliance with World Bank financial management requirements across all project components.',
    accent: '#6366f1',
  },
  {
    name: 'Mrs. Zainab Aliyu',
    role: 'Communication & Outreach Officer',
    photo: 'https://randomuser.me/api/portraits/women/12.jpg',
    bio: 'Manages stakeholder communication, community engagement, media relations, and public outreach to promote awareness and transparency around project activities.',
    accent: '#c026d3',
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
              {/* Coloured accent bar at top */}
              <div className="ot__accent-bar" style={{ background: member.accent }} />

              {/* Photo */}
              <div className="ot__photo-wrap">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="ot__photo"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="ot__photo-ring" style={{ borderColor: member.accent }} />
              </div>

              {/* Content */}
              <div className="ot__body">
                <h3 className="ot__name">{member.name}</h3>
                <span className="ot__role" style={{ color: member.accent }}>{member.role}</span>
                <p className="ot__bio">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
