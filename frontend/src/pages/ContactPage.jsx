import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, ChevronRight, MessageSquare, Globe, Users } from 'lucide-react';
import './ContactPage.css';

const INFO_ITEMS = [
  {
    icon: MapPin,
    color: '#2e5e35',
    label: 'Head Office',
    text: 'L-PRES Secretariat, Ministry of Agriculture Complex, Ilorin, Kwara State, Nigeria',
  },
  {
    icon: Phone,
    color: '#c49a3e',
    label: 'Phone',
    text: '+234 (0) 800 LPRES KWA',
  },
  {
    icon: Mail,
    color: '#0891b2',
    label: 'Email',
    text: 'contact@lpreskwara.gov.ng',
  },
  {
    icon: Clock,
    color: '#7c3aed',
    label: 'Working Hours',
    text: 'Monday – Friday: 8:00am – 5:00pm\nSaturday: 9:00am – 1:00pm',
  },
];

const QUICK_LINKS = [
  { icon: Users,         label: 'Farmer Enquiries',     desc: 'Beneficiary registration & support' },
  { icon: Globe,         label: 'Partnership Requests',  desc: 'Collaboration & investment opportunities' },
  { icon: MessageSquare, label: 'Media & Press',         desc: 'Press releases, interviews & coverage' },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <div className="cp">

      {/* Page Hero */}
      <div className="cp__hero">
        <div className="cp__hero-bg" />
        <div className="container cp__hero-inner">
          <nav className="cp__breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <span>Contact</span>
          </nav>
          <h1 className="cp__hero-title">Get in Touch</h1>
          <p className="cp__hero-sub">
            Whether you're a farmer, investor, researcher, or development partner — we'd love to hear from you.
          </p>
        </div>
      </div>

      {/* Quick-contact chips */}
      <div className="cp__chips-bar">
        <div className="container cp__chips-inner">
          {QUICK_LINKS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="cp__chip">
              <div className="cp__chip-icon"><Icon size={18} /></div>
              <div>
                <div className="cp__chip-label">{label}</div>
                <div className="cp__chip-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <section className="cp__body">
        <div className="container cp__grid">

          {/* Left — Contact info */}
          <aside className="cp__info">
            <h2 className="cp__info-heading">Contact Details</h2>
            <p className="cp__info-intro">
              Reach out to us directly through any of the channels below.
              Our team typically responds within two business days.
            </p>

            <div className="cp__info-items">
              {INFO_ITEMS.map(({ icon: Icon, color, label, text }) => (
                <div key={label} className="cp__info-item">
                  <div className="cp__info-icon" style={{ background: `${color}18`, color }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <strong className="cp__info-label">{label}</strong>
                    <p className="cp__info-text">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="cp__map-placeholder">
              <MapPin size={28} className="cp__map-pin" />
              <span>Ministry of Agriculture Complex, Ilorin</span>
            </div>
          </aside>

          {/* Right — Form */}
          <div className="cp__form-wrap">
            <div className="cp__form-header">
              <span className="section-label dark">Send a Message</span>
              <h2 className="cp__form-title">Partner With Us</h2>
              <p className="cp__form-sub">Fill in the form below and we will get back to you promptly.</p>
            </div>

            <form className="cp__form" onSubmit={handleSubmit}>
              {sent ? (
                <div className="cp__success">
                  <CheckCircle size={52} color="var(--gold-primary)" />
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. We'll get back to you within 2 business days.</p>
                </div>
              ) : (
                <>
                  <div className="cp__form-row">
                    <div className="cp__field">
                      <label>Full Name</label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="cp__field">
                      <label>Email Address</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="cp__field">
                    <label>Subject</label>
                    <input
                      type="text"
                      placeholder="What is your enquiry about?"
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="cp__field">
                    <label>Message</label>
                    <textarea
                      rows={7}
                      placeholder="Please describe your enquiry in detail..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary cp__submit">
                    Send Message <Send size={16} />
                  </button>
                </>
              )}
            </form>
          </div>

        </div>
      </section>

    </div>
  );
}
