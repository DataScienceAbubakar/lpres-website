import { MessageCircle, TrendingUp, Layers, GitBranch, Target, Star, MapPin, Users, BookOpen, Mail, Zap } from 'lucide-react';
import './QuickLinks.css';

const LINKS = [
  { label: "Coordinator's Message", href: '#coordinators-message', icon: MessageCircle, color: '#c49a3e' },
  { label: 'Programme Impact',      href: '#results',              icon: TrendingUp,    color: '#2e9e50' },
  { label: 'Project Components',    href: '#components',           icon: Layers,        color: '#0891b2' },
  { label: 'Value Chains',          href: '#value-chains',         icon: GitBranch,     color: '#7c3aed' },
  { label: 'PDO',                   href: '#about',                icon: Target,        color: '#dc2626' },
  { label: 'Core Values',           href: '#values',               icon: Star,          color: '#059669' },
  { label: 'Project Highlights',      href: '#project-sites',        icon: MapPin,        color: '#f59e0b' },
  { label: 'Our Partners',          href: '#partners',             icon: Users,         color: '#6366f1' },
  { label: 'Publications',          href: '#publications',         icon: BookOpen,      color: '#ec4899' },
  { label: 'Contact Us',            href: '#contact',              icon: Mail,          color: '#16a34a' },
];

export default function QuickLinks() {
  return (
    <div className="ql">
      <div className="ql__inner container">

        {/* Label */}
        <div className="ql__label">
          <Zap size={12} />
          <span>Quick Access</span>
        </div>

        <div className="ql__sep" />

        {/* Pills */}
        <nav className="ql__pills" aria-label="Page section links">
          {LINKS.map(({ label, href, icon: Icon, color }) => (
            <a key={href} href={href} className="ql__pill">
              <span className="ql__pill-dot" style={{ background: color }} />
              <Icon size={11} style={{ color, flexShrink: 0 }} />
              <span className="ql__pill-text">{label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Wave arc — creates the concave-dip transition to the next section */}
      <div className="ql__wave" aria-hidden="true" />
    </div>
  );
}
