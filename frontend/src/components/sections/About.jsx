import { Shield, Target, Globe, Award } from 'lucide-react';
import './About.css';

const VALUES = [
  { icon: Shield, title: 'Resilience',    desc: 'Strengthening livestock systems to withstand climate shocks, disease outbreaks, and market volatility.' },
  { icon: Target, title: 'Productivity',  desc: 'Evidence-based interventions that boost output per animal and per hectare of grazing land.' },
  { icon: Globe,  title: 'Sustainability', desc: 'Balancing productive use of rangeland with ecological preservation for future generations.' },
  { icon: Award,  title: 'Inclusion',     desc: 'Prioritising women, youth, and pastoralist communities in all programme activities.' },
];

export default function About() {
  return (
    <section className="about section" id="about">
      <div className="container">
        <div className="about__grid">
          <div className="about__content">
            <span className="section-label dark">About L-PRES</span>
            <h2 className="section-title">
              Transforming Livestock Value Chains Across Kwara State
            </h2>
            <p className="about__lead">
              The Livestock Productivity and Resilience Support (L-PRES) Project is a flagship
              initiative of the Kwara State Government, co-funded by the International Fund for
              Agricultural Development (IFAD) and the World Bank.
            </p>
            <p className="about__body">
              L-PRES operates across all 16 Local Government Areas of Kwara State, supporting
              over 12,400 direct beneficiaries — smallholder cattle herders, poultry farmers,
              dairy producers, and the communities that depend on livestock-linked livelihoods.
            </p>
            <p className="about__body">
              Through targeted investment in animal health, feeds and nutrition, market access,
              geospatial decision support, and farmer-herder conflict resolution, L-PRES is
              building the foundation for a productive, resilient, and commercially oriented
              livestock sector in Kwara State.
            </p>
            <div className="about__stats-row">
              <div className="about__mini-stat">
                <span className="about__mini-num">2020</span>
                <span className="about__mini-label">Year Started</span>
              </div>
              <div className="about__mini-stat">
                <span className="about__mini-num">IFAD</span>
                <span className="about__mini-label">Lead Funder</span>
              </div>
              <div className="about__mini-stat">
                <span className="about__mini-num">16</span>
                <span className="about__mini-label">LGAs Active</span>
              </div>
            </div>
          </div>

          <div className="about__visual">
            <div className="about__img-wrap">
              <img
                src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=700&q=80"
                alt="L-PRES field activities"
                className="about__img"
              />
              <div className="about__img-badge">
                <span className="about__img-badge-num">5+</span>
                <span className="about__img-badge-label">Years of Impact</span>
              </div>
            </div>
          </div>
        </div>

        <div className="about__values">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="about__value-card card">
              <div className="about__value-icon">
                <Icon size={22} />
              </div>
              <h4 className="about__value-title">{title}</h4>
              <p className="about__value-desc">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
