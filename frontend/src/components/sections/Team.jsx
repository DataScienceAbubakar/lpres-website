import { ExternalLink, Mail } from 'lucide-react';
import './Team.css';

const TEAM = [
  {
    name: 'Prof. Abdulrahman Kawu',
    role: 'Project Coordinator',
    dept: 'L-PRES Project Management Unit',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    bio: 'Over 25 years in livestock development and agricultural policy across West Africa.',
  },
  {
    name: 'Dr. Amina Suleiman',
    role: 'Head of Animal Health',
    dept: 'Veterinary Services & Disease Control',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80',
    bio: 'DVM, PhD. Specialist in transboundary animal disease surveillance and control.',
  },
  {
    name: 'Engr. Musa Aliyu',
    role: 'GDSS Lead',
    dept: 'Geospatial & Technology',
    img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80',
    bio: 'Architect of the L-PRES Geospatial Decision Support System and spatial data infrastructure.',
  },
  {
    name: 'Dr. Grace Adekunle',
    role: 'Value Chain Specialist',
    dept: 'Market Development & Commercialisation',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80',
    bio: 'Expert in livestock market systems, contract farming, and agribusiness development in Nigeria.',
  },
  {
    name: 'Alhaji Bello Kawu',
    role: 'Conflict Resolution Officer',
    dept: 'Farmer-Herder Relations',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
    bio: 'Traditional ruler liaison and conflict mediator serving Kwara\'s pastoral communities for 15 years.',
  },
  {
    name: 'Mrs. Funke Adeyemi',
    role: 'Gender & Social Inclusion',
    dept: 'Women in Livestock Programme',
    img: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=300&q=80',
    bio: 'Ensuring women and youth benefit equitably from L-PRES investments across all 16 LGAs.',
  },
];

export default function Team() {
  return (
    <section className="team section" id="team">
      <div className="container">
        <div className="team__header text-center">
          <span className="section-label dark">The People</span>
          <h2 className="section-title">Meet Our Expert Team</h2>
          <p className="section-subtitle mx-auto text-center">
            A multidisciplinary team of livestock specialists, technologists, and community practitioners.
          </p>
        </div>

        <div className="team__grid">
          {TEAM.map((member) => (
            <div key={member.name} className="team-card card">
              <div className="team-card__img-wrap">
                <img src={member.img} alt={member.name} className="team-card__img" />
              </div>
              <div className="team-card__body">
                <h4 className="team-card__name">{member.name}</h4>
                <span className="team-card__role">{member.role}</span>
                <span className="team-card__dept">{member.dept}</span>
                <p className="team-card__bio">{member.bio}</p>
                <div className="team-card__links">
                  <button className="team-card__link-btn" aria-label="Profile">
                    <ExternalLink size={16} />
                  </button>
                  <button className="team-card__link-btn" aria-label="Email">
                    <Mail size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
