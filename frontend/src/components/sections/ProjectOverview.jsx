import { Eye, Compass, Target } from 'lucide-react';
import './ProjectOverview.css';

export default function ProjectOverview() {
  return (
    <section className="pov section" id="about">
      <div className="container">

        {/* Two-column: title+PDO statement left, Kwara context right */}
        <div className="pov__grid">
          <div className="pov__left">
            <span className="section-label dark">About the Project</span>
            <h2 className="pov__title">
              Project Development{' '}
              <em className="pov__em">Objective</em>{' '}
              (PDO)
            </h2>
            <p className="pov__pdo-statement">
              The Project Development Objective is to improve livestock productivity, resilience
              and commercialization of selected value chains and strengthen the country's capacity
              to respond to an eligible crisis or emergency.
            </p>
            <div className="pov__rule" />
          </div>

          <div className="pov__right">
            <div className="pov__pdo">
              <div className="pov__pdo-label">
                <Target size={15} />
                Kwara State Implementation
              </div>
              <p className="pov__pdo-text">
                In Kwara State, this objective is pursued through strategic investments that
                strengthen livestock value chains, improve access to infrastructure and services,
                promote innovation and technology adoption, support private sector participation,
                enhance conflict mitigation mechanisms, and build the capacity of livestock
                producers and institutions.
              </p>
            </div>
          </div>
        </div>

        {/* Vision + Mission cards */}
        <div className="pov__cards">
          <div className="pov__card pov__card--vision">
            <div className="pov__card-icon"><Eye size={26} /></div>
            <h3 className="pov__card-title">Our Vision</h3>
            <p className="pov__card-body">
              A productive, resilient, and commercially viable livestock sector driving
              Kwara's economic growth and food security.
            </p>
          </div>
          <div className="pov__card pov__card--mission">
            <div className="pov__card-icon"><Compass size={26} /></div>
            <h3 className="pov__card-title">Our Mission</h3>
            <p className="pov__card-body">
              Improving livestock productivity, resilience, and commercialisation through
              strategic investments and inclusive partnerships.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
