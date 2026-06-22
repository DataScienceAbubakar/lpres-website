import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home',         href: '/' },
  { label: 'About',        href: '#about' },
  { label: 'Value Chains', href: '#programs' },
  { label: 'Projects',     href: '#mission' },
  { label: 'GDSS',         href: '/gdss' },
  { label: 'Media',        href: '#news' },
  { label: 'Contact',      href: '#contact' },
];

export default function Navbar() {
  const [open, setOpen]         = useState(false);
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
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">

        {/* Brand — official L-PRES logo */}
        <Link to="/" className="navbar__brand">
          <div className="navbar__logo-wrap">
            <img
              src="/lpres-logo.png"
              alt="L-PRES Kwara State"
              className="navbar__logo"
            />
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="navbar__links">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              {link.href.startsWith('#') ? (
                <button className="navbar__link" onClick={() => handleNavClick(link.href)}>
                  {link.label}
                </button>
              ) : (
                <Link
                  to={link.href}
                  className={`navbar__link ${location.pathname === link.href ? 'navbar__link--active' : ''}`}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* GDSS Portal CTA */}
        <div className="navbar__actions">
          <Link to="/gdss" className="btn-gdss">
            GDSS Portal
          </Link>
        </div>

        <button className="navbar__burger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="navbar__mobile">
          <div className="container">
            {NAV_LINKS.map((link) =>
              link.href.startsWith('#') ? (
                <button key={link.label} className="navbar__mobile-link" onClick={() => handleNavClick(link.href)}>
                  {link.label}
                </button>
              ) : (
                <Link key={link.label} to={link.href} className="navbar__mobile-link">
                  {link.label}
                </Link>
              )
            )}
            <Link to="/gdss" className="btn-gdss" style={{ marginTop: 16, width: '100%', justifyContent: 'center', display: 'flex' }}>
              GDSS Portal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
