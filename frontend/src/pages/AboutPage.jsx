import { Link } from 'react-router-dom';
import { Target, Eye, Compass, Leaf, ChevronRight } from 'lucide-react';
import OurTeam from '../components/sections/OurTeam';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="ap">

      {/* Page Hero */}
      <div className="ap__hero">
        <div className="ap__hero-bg" />
        <div className="container ap__hero-inner">
          <nav className="ap__breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <span>About</span>
          </nav>
          <h1 className="ap__hero-title">About Kwara L-PRES</h1>
          <p className="ap__hero-sub">
            A strategic initiative transforming livestock production across Kwara State
          </p>
        </div>
      </div>

      {/* About L-PRES */}
      <section className="ap__section ap__section--light">
        <div className="container">
          <div className="ap__two-col">
            <div className="ap__text-block">
              <span className="section-label dark">About the Project</span>
              <h2 className="ap__section-title">Kwara State L-PRES</h2>
              <p>
                The Kwara State Livestock Productivity and Resilience Support (L-PRES) Project is a
                strategic initiative aimed at transforming the livestock sector through investments
                that improve productivity, strengthen resilience, and promote commercialisation
                across key livestock value chains.
              </p>
              <p>
                The project is implemented across the sixteen (16) Local Government Areas of Kwara
                State, covering Kwara Central, Kwara North, and Kwara South Senatorial Districts.
                Its priority value chains are cattle (beef and dairy), sheep, and goats.
              </p>
              <p>
                Kwara State L-PRES supports interventions that address some of the most critical
                challenges affecting livestock production, including low productivity, inadequate
                access to infrastructure and services, resource-based conflicts, limited market
                opportunities, and the growing impact of climate change on livestock-dependent
                livelihoods.
              </p>
            </div>
            <div className="ap__text-block">
              <p>
                Through investments in livestock infrastructure, animal health services, capacity
                building, innovation, value chain development, and conflict mitigation, the project
                seeks to create an enabling environment for sustainable livestock production and
                agribusiness growth.
              </p>
              <p>
                The project works closely with livestock producers, pastoralist communities, farmer
                groups, private sector actors, traditional institutions, development partners, and
                relevant government agencies to promote inclusive participation and ensure that
                interventions respond to the needs of stakeholders across the livestock sector.
              </p>
              <p>
                By strengthening livestock production systems and supporting value chain development,
                Kwara State L-PRES contributes to improved livelihoods, enhanced food security, job
                creation, economic growth, and sustainable development across the state.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PDO */}
      <section className="ap__section ap__section--dark">
        <div className="container">
          <div className="ap__pdo-wrap">
            <div className="ap__pdo-icon"><Target size={28} /></div>
            <div className="ap__pdo-body">
              <span className="ap__pdo-label">Project Development Objective</span>
              <h2 className="ap__pdo-title">Our Development Goal</h2>
              <blockquote className="ap__pdo-quote">
                "The Project Development Objective is to improve livestock productivity, resilience
                and commercialisation of selected value chains and strengthen the country's capacity
                to respond to an eligible crisis or emergency."
              </blockquote>
              <p className="ap__pdo-sub">
                In Kwara State, this objective is pursued through strategic investments that
                strengthen livestock value chains, improve access to infrastructure and services,
                promote innovation and technology adoption, support private sector participation,
                enhance conflict mitigation mechanisms, and build the capacity of livestock
                producers and institutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Message */}
      <section className="ap__section ap__section--accent">
        <div className="container">
          <div className="ap__strategic">
            <span className="section-label dark">Strategic Message</span>
            <h2 className="ap__section-title ap__section-title--center">
              Sustainable Feed. Sustainable Growth.
            </h2>
            <div className="ap__strategic-body">
              <Leaf size={40} className="ap__leaf-icon" />
              <p>
                Kwara L-PRES recognizes that sustainable livestock development begins with
                sustainable feed resources. By making pasture and fodder development a cornerstone
                of its intervention strategy, the project aims to increase livestock productivity,
                reduce conflicts, enhance climate resilience, create rural employment, and transform
                livestock production into a more profitable and sustainable enterprise.
              </p>
              <p>
                In simple terms, when livestock producers have reliable access to feed, animal
                productivity increases, incomes improve, and conflicts over grazing resources
                decline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision + Mission */}
      <section className="ap__section ap__section--light">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 48 }}>
            <span className="section-label dark">Direction</span>
            <h2 className="ap__section-title ap__section-title--center">Vision &amp; Mission</h2>
          </div>
          <div className="ap__vm-grid">
            <div className="ap__vm-card ap__vm-card--vision">
              <div className="ap__vm-icon"><Eye size={28} /></div>
              <h3>Our Vision</h3>
              <p>
                A productive, resilient, and commercially viable livestock sector driving
                Kwara State's economic growth and food security.
              </p>
            </div>
            <div className="ap__vm-card ap__vm-card--mission">
              <div className="ap__vm-icon"><Compass size={28} /></div>
              <h3>Our Mission</h3>
              <p>
                Improving livestock productivity, resilience, and commercialisation through
                strategic investments, inclusive partnerships, and evidence-based interventions
                across Kwara State.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <OurTeam />

      {/* CTA row */}
      <section className="ap__section ap__section--cta">
        <div className="container ap__cta-row">
          <div>
            <h3 className="ap__cta-title">Explore Our Programmes</h3>
            <p className="ap__cta-sub">See how L-PRES is delivering results across Kwara State.</p>
          </div>
          <div className="ap__cta-btns">
            <Link to="/programs" className="btn btn-primary">View Programmes</Link>
            <Link to="/impact" className="btn btn-outline ap__btn-outline">See Impact</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
