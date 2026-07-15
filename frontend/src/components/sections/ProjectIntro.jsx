import './ProjectIntro.css';

export default function ProjectIntro() {
  return (
    <section className="proj-intro section" id="project-intro">
      <div className="container">
        <div className="proj-intro__grid">

          {/* Left — label + large serif headline */}
          <div className="proj-intro__left">
            <span className="proj-intro__label">About the Project</span>
            <h2 className="proj-intro__headline">
              Strategic investment in{' '}
              <em className="proj-intro__accent">people, herds</em>{' '}
              and pastures.
            </h2>
            <div className="proj-intro__rule" />
          </div>

          {/* Right — body + vision/mission cards */}
          <div className="proj-intro__right">
            <p className="proj-intro__body">
              The L-PRES Project is a strategic initiative aimed at transforming the livestock
              sector through investments that improve productivity, strengthen resilience, and
              promote commercialisation across key livestock value chains, implemented across
              all sixteen LGAs of Kwara State.
            </p>

            <div className="proj-intro__cards">
              <div className="proj-intro__card">
                <h4 className="proj-intro__card-title">Our Vision</h4>
                <p className="proj-intro__card-body">
                  A productive, resilient, and commercially viable livestock sector driving
                  Kwara's economic growth and food security.
                </p>
              </div>
              <div className="proj-intro__card">
                <h4 className="proj-intro__card-title">Our Mission</h4>
                <p className="proj-intro__card-body">
                  Improving livestock productivity, resilience and commercialisation through
                  strategic investments and inclusive partnerships.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
