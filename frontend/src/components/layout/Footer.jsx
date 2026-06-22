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
            Livestock Productivity and Resilience Support Project — transforming
            livestock value chains and farmer-herder relations across Kwara State.
          </p>
          <div className="footer__contact-mini">
            <a href="mailto:info@lpres.kwarastate.gov.ng"><Mail size={14} /> info@lpres.kwarastate.gov.ng</a>
            <a href="tel:+2348034567890"><Phone size={14} /> +234 803 456 7890</a>
            <span><MapPin size={14} /> Ilorin, Kwara State, Nigeria</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="footer__link-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#about">About L-PRES</a></li>
            <li><a href="#mission">Mission &amp; Vision</a></li>
            <li><a href="#programs">Value Chains</a></li>
            <li><a href="#team">Our Team</a></li>
            <li><Link to="/news">News &amp; Events</Link></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>

        {/* Value chains */}
        <div className="footer__link-col">
          <h4>Value Chains</h4>
          <ul>
            <li><a href="#programs">Cattle (Beef &amp; Dairy)</a></li>
            <li><a href="#programs">Poultry Development</a></li>
            <li><a href="#programs">Dairy &amp; Aquaculture</a></li>
            <li><a href="#programs">Conflict Early Warning</a></li>
            <li><a href="#programs">GDSS Platform</a></li>
            <li><Link to="/admin/login">Admin Portal</Link></li>
          </ul>
        </div>

        {/* Partners */}
        <div className="footer__link-col">
          <h4>Partners</h4>
          <ul>
            <li><span>Kwara State Government</span></li>
            <li><span>IFAD Nigeria</span></li>
            <li><span>World Bank Group</span></li>
            <li><span>Federal Ministry of Agriculture</span></li>
            <li><span>Ahmadu Bello University</span></li>
            <li><span>National Livestock Transformation Plan</span></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>&copy; {year} L-PRES Kwara State. All rights reserved.</p>
          <p className="footer__bottom-right">
            Livestock Productivity and Resilience Support Project
          </p>
        </div>
      </div>
    </footer>
  );
}
