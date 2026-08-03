import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Sun, Moon, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const NAV = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'About L-PRES', href: '/about' },
      { label: "Coordinator's Message", href: '/#coordinators-message' },
      { label: 'Core Values', href: '/#values' },
      { label: 'Our Team', href: '/about#our-team' },
      { label: 'Partners', href: '/partners' },
    ],
  },
  {
    label: 'Projects',
    href: '/programs',
    children: [
      { label: 'All Projects', href: '/programs#project-sites' },
      { label: 'Project Components', href: '/programs#components' },
      { label: 'Value Chains', href: '/programs#value-chains' },
    ],
  },
  { label: 'Impact', href: '/impact' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'News', href: '/news' },
  { label: 'Contact', href: '/contact' },
];

function DropdownMenu({ items, onClose }) {
  return (
    <div className="navbar__dropdown">
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="navbar__dropdown-item"
          onClick={onClose}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setOpenDropdown(null); }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">

        {/* Theme toggle — before brand */}
        <button
          className="navbar__theme-pill"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <div className="navbar__logo-wrap">
            <img src="/lpres-logo.png" alt="L-PRES Kwara State" className="navbar__logo" />
          </div>
          <div className="navbar__brand-text">
            <span className="navbar__brand-name">Kwara L-PRES</span>
            <span className="navbar__brand-tagline">Livestock Productivity and Resilience Support</span>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="navbar__links" ref={dropdownRef}>
          {NAV.map((link) => (
            <li key={link.label} className="navbar__item">
              {link.children ? (
                <button
                  className={`navbar__link navbar__link--drop ${isActive(link.href) ? 'navbar__link--active' : ''}`}
                  onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                  aria-expanded={openDropdown === link.label}
                >
                  {link.label} <ChevronDown size={13} className={`navbar__chevron ${openDropdown === link.label ? 'navbar__chevron--open' : ''}`} />
                </button>
              ) : (
                <Link
                  to={link.href}
                  className={`navbar__link ${isActive(link.href) ? 'navbar__link--active' : ''}`}
                >
                  {link.label}
                </Link>
              )}
              {link.children && openDropdown === link.label && (
                <DropdownMenu items={link.children} onClose={() => setOpenDropdown(null)} />
              )}
            </li>
          ))}
        </ul>

        {/* GDSS CTA + Theme toggle */}
        <div className="navbar__actions">
          <button
            className="navbar__search-btn"
            onClick={() => document.dispatchEvent(new CustomEvent('lpres:open-search'))}
            aria-label="Search"
            title="Search (Ctrl+K)"
          >
            <Search size={15} />
            <kbd className="navbar__search-kbd">⌘K</kbd>
          </button>
          <a
            href={import.meta.env.VITE_MARKETPLACE_URL || "https://lpres-marketplace.onrender.com/"}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-marketplace"
          >
            Marketplace
          </a>
          <a
            href="https://main.dgnvy1x73yeps.amplifyapp.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gdss"
          >
            GDSS Portal
          </a>
        </div>

        <button className="navbar__burger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="navbar__mobile">
          <div className="container">
            {NAV.map((link) => (
              <div key={link.label}>
                <Link
                  to={link.href}
                  className={`navbar__mobile-link ${isActive(link.href) ? 'navbar__mobile-link--active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
                {link.children && (
                  <div className="navbar__mobile-sub">
                    {link.children.map(sub => (
                      <Link
                        key={sub.href}
                        to={sub.href}
                        className="navbar__mobile-sub-link"
                        onClick={() => setOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a
              href={import.meta.env.VITE_MARKETPLACE_URL || "https://lpres-marketplace.onrender.com/"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-marketplace"
              style={{ marginTop: 20, width: '100%', justifyContent: 'center', display: 'flex' }}
              onClick={() => setOpen(false)}
            >
              Marketplace Portal
            </a>
            <a
              href="https://main.dgnvy1x73yeps.amplifyapp.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gdss"
              style={{ marginTop: 10, width: '100%', justifyContent: 'center', display: 'flex' }}
              onClick={() => setOpen(false)}
            >
              GDSS Portal
            </a>
            <button
              className="navbar__mobile-theme"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
