import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { isMarketplaceMode, MAIN_WEBSITE_URL, GDSS_PORTAL_URL } from '../../utils/env';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  const isMarketplace = isMarketplaceMode();

  return (
    <footer className="footer">
      <div className="footer__main container">
        {/* Brand column */}
        <div className="footer__brand-col">
          <div className="footer__logo-wrap">
            <img src="/lpres-logo.png" alt="L-PRES Kwara State" className="footer__logo" />
          </div>
          <p className="footer__tagline">
            {isMarketplace
              ? 'Kwara State Livestock Marketplace Portal, connecting livestock farmers, marketers, and buyers directly across all 16 LGAs.'
              : 'Kwara State Livestock Productivity and Resilience Support (L-PRES) Project, transforming livestock value chains and livelihoods across all 16 LGAs.'}
          </p>
          <div className="footer__contact-mini">
            <a href="mailto:contact@lpreskwara.gov.ng"><Mail size={14} /> contact@lpreskwara.gov.ng</a>
            <a href="tel:+2348035068906"><Phone size={14} /> +2348035068906</a>
            <span><MapPin size={14} /> No. 11, Achimugu Road, G.R.A, Ilorin, Kwara State</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="footer__link-col">
          <h4>{isMarketplace ? 'Marketplace Portal' : 'Quick Links'}</h4>
          <ul>
            <li><Link to="/">Marketplace Catalog</Link></li>
            <li><Link to="/about">About L-PRES</Link></li>
            {isMarketplace ? (
              <>
                <li><a href={MAIN_WEBSITE_URL} target="_blank" rel="noopener noreferrer">Main L-PRES Website</a></li>
                <li><a href={GDSS_PORTAL_URL} target="_blank" rel="noopener noreferrer">GDSS Portal</a></li>
              </>
            ) : (
              <>
                <li><Link to="/programs">Programmes</Link></li>
                <li><Link to="/impact">Impact</Link></li>
                <li><Link to="/partners">Partners</Link></li>
                <li><Link to="/news">News &amp; Events</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Value chains */}
        <div className="footer__link-col">
          <h4>Priority Value Chains</h4>
          <ul>
            <li><Link to={isMarketplace ? "/" : "/programs#value-chains"}>Cattle (Beef)</Link></li>
            <li><Link to={isMarketplace ? "/" : "/programs#value-chains"}>Cattle (Dairy)</Link></li>
            <li><Link to={isMarketplace ? "/" : "/programs#value-chains"}>Sheep</Link></li>
            <li><Link to={isMarketplace ? "/" : "/programs#value-chains"}>Goats</Link></li>
            <li><a href={GDSS_PORTAL_URL} target="_blank" rel="noopener noreferrer">GDSS Portal</a></li>
          </ul>
        </div>

        {/* Partners */}
        <div className="footer__link-col">
          <h4>Partners</h4>
          <ul>
            <li><span>Kwara State Government</span></li>
            <li><span>World Bank Group</span></li>
            <li><span>Federal Ministry of Livestock Development</span></li>
            <li><Link to="/admin/login" style={{ opacity: 0.5 }}>Admin Portal</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>&copy; {year} Kwara State L-PRES Project. All rights reserved.</p>
          <p className="footer__bottom-right">
            {isMarketplace ? 'Kwara State Livestock Marketplace Portal' : 'Livestock Productivity and Resilience Support Project'}
          </p>
        </div>
      </div>
    </footer>
  );
}
