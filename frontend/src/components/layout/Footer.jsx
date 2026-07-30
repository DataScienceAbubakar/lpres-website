import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__main container">
        {/* Brand column */}
        <div className="footer__brand-col">
          <div className="footer__logo-wrap">
            <img src="/lpres-logo.png" alt="L-PRES Kwara State" className="footer__logo" />
          </div>
          <p className="footer__tagline">
            Kwara State Livestock Productivity and Resilience Support (L-PRES) Project,
            transforming livestock value chains and livelihoods across all 16 LGAs.
          </p>
          <div className="footer__contact-mini">
            <a href="mailto:contact@lpreskwara.gov.ng"><Mail size={14} /> contact@lpreskwara.gov.ng</a>
            <a href="tel:+2348035068906"><Phone size={14} /> +2348035068906</a>
            <span><MapPin size={14} /> No. 11, Achimugu Road, G.R.A, Ilorin, Kwara State</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="footer__link-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About L-PRES</Link></li>
            <li><Link to="/programs">Programmes</Link></li>
            <li><Link to="/impact">Impact</Link></li>
            <li><Link to="/partners">Partners</Link></li>
            <li><Link to="/news">News &amp; Events</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        {/* Value chains */}
        <div className="footer__link-col">
          <h4>Priority Value Chains</h4>
          <ul>
            <li><Link to="/programs#value-chains">Cattle (Beef)</Link></li>
            <li><Link to="/programs#value-chains">Cattle (Dairy)</Link></li>
            <li><Link to="/programs#value-chains">Sheep</Link></li>
            <li><Link to="/programs#value-chains">Goats</Link></li>
            <li><Link to="/programs#components">Project Components</Link></li>
            <li><a href="https://main.dgnvy1x73yeps.amplifyapp.com/" target="_blank" rel="noopener noreferrer">GDSS Portal</a></li>
          </ul>
        </div>

        {/* Partners */}
        <div className="footer__link-col">
          <h4>Partners</h4>
          <ul>
            <li><span>Kwara State Government</span></li>
            <li><span>World Bank Group</span></li>
            <li><span>Federal Ministry of Livestock Development</span></li>
            <li><span>Implementing Partners</span></li>
            <li><Link to="/admin/login" style={{ opacity: 0.5 }}>Admin Portal</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>&copy; {year} Kwara State L-PRES Project. All rights reserved.</p>
          <p className="footer__bottom-right">
            Livestock Productivity and Resilience Support Project
          </p>
        </div>
      </div>
    </footer>
  );
}
