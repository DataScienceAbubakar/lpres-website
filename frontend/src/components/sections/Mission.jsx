import { Eye, Compass } from 'lucide-react';
import './Mission.css';

export default function Mission() {
  return (
    <section className="mission section" id="mission">
      <div className="container">
        <div className="mission__header text-center">
          <span className="section-label dark">Our Direction</span>
          <h2 className="section-title">Mission &amp; Vision</h2>
        </div>

        <div className="mission__grid">
          <div className="mission__card mission__card--vision">
            <div className="mission__card-icon">
              <Eye size={32} />
            </div>
            <h3 className="mission__card-title">Our Vision</h3>
            <p className="mission__card-text">
              A Kwara State where a commercially viable, climate-resilient, and equitably
              organised livestock sector drives prosperity for farmers, herders, and their
              families, underpinned by world-class infrastructure, evidence-based policy,
              and harmonious coexistence of all value chain actors.
            </p>
          </div>

          <div className="mission__card mission__card--mission">
            <div className="mission__card-icon">
              <Compass size={32} />
            </div>
            <h3 className="mission__card-title">Our Mission</h3>
            <p className="mission__card-text">
              To sustainably improve livestock productivity and build resilience among
              smallholder farmers and pastoralists in Kwara State through targeted
              investments in animal health, value chain development, geospatial technology,
              and multi-stakeholder conflict resolution.
            </p>
          </div>
        </div>

        <div className="mission__objectives">
          <h3 className="mission__obj-title">Strategic Objectives</h3>
          <div className="mission__obj-grid">
            {[
              'Increase livestock productivity through improved breeds, feeds, and animal health services',
              'Develop and strengthen cattle, poultry, and dairy value chains across all 16 LGAs',
              'Reduce farmer-herder conflicts through early warning systems and mediation platforms',
              'Establish a state-of-the-art Geospatial Decision Support System (GDSS) for livestock management',
              'Improve market access and commercialisation pathways for smallholder livestock producers',
              'Build institutional capacity in livestock extension, policy, and data management',
            ].map((obj, i) => (
              <div key={i} className="mission__obj-item">
                <span className="mission__obj-num">0{i + 1}</span>
                <p>{obj}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
