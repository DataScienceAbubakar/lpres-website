import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { GDSS_PORTAL_URL } from '../../utils/env';
import './NavbarLight.css';

const NAV_LINKS = [
  { label: 'Home', href: '/home-light' },
  { label: 'About', href: '#hl-about' },
  { label: 'Value Chains', href: '#hl-programs' },
  { label: 'Mission', href: '#hl-mission' },
  { label: 'Team', href: '#hl-team' },
  { label: 'Media', href: '#hl-news' },
  { label: 'Contact', href: '#hl-contact' },
];

export default function NavbarLight() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const handleNavClick = (href) => {
    setOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`nl-nav ${scrolled ? 'nl-nav--scrolled' : ''}`}>
      <div className="nl-nav__inner container">

        <Link to="/home-light" className="nl-nav__brand">
          <div className="nl-nav__logo-wrap">
            <img src="/lpres-logo.png" alt="L-PRES Kwara State" className="nl-nav__logo" />
          </div>
          <div className="nl-nav__brand-text">
            <span className="nl-nav__brand-name">Kwara L-PRES</span>
            <span className="nl-nav__brand-tagline">Livestock Productivity and Resilience Support</span>
          </div>
        </Link>

        <ul className="nl-nav__links">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              {link.href.startsWith('#') ? (
                <button className="nl-nav__link" onClick={() => handleNavClick(link.href)}>
                  {link.label}
                </button>
              ) : (
                <Link to={link.href} className={`nl-nav__link ${location.pathname === link.href ? 'nl-nav__link--active' : ''}`}>
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="nl-nav__actions">
          <a href={import.meta.env.VITE_MARKETPLACE_URL || "https://lpres-marketplace.onrender.com/"} target="_blank" rel="noopener noreferrer" className="nl-btn-marketplace">Marketplace</a>
          <a href={GDSS_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="nl-btn-gdss">GDSS Portal</a>
        </div>

        <button className="nl-nav__burger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="nl-nav__mobile">
          <div className="container">
            {NAV_LINKS.map((link) =>
              link.href.startsWith('#') ? (
                <button key={link.label} className="nl-nav__mobile-link" onClick={() => handleNavClick(link.href)}>
                  {link.label}
                </button>
              ) : (
                <Link key={link.label} to={link.href} className="nl-nav__mobile-link">{link.label}</Link>
              )
            )}
            <a href={import.meta.env.VITE_MARKETPLACE_URL || "https://lpres-marketplace.onrender.com/"} target="_blank" rel="noopener noreferrer" className="nl-btn-marketplace" style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
              Marketplace Portal
            </a>
            <a href={GDSS_PORTAL_URL} target="_blank" rel="noopener noreferrer" className="nl-btn-gdss" style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
              GDSS Portal
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
