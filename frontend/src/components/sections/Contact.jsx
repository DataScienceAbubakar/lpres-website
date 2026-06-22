import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production this would POST to a backend endpoint
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <section className="contact section" id="contact">
      <div className="container">
        <div className="contact__header text-center">
          <span className="section-label dark">Get in Touch</span>
          <h2 className="section-title">Contact Us</h2>
          <p className="section-subtitle mx-auto text-center">
            Reach out to our team for research collaborations, partnership enquiries, or general information.
          </p>
        </div>

        <div className="contact__grid">
          {/* Info panel */}
          <div className="contact__info">
            <h3 className="contact__info-title">Our Offices</h3>

            <div className="contact__info-item">
              <div className="contact__info-icon"><MapPin size={20} /></div>
              <div>
                <strong>Head Office</strong>
                <p>LPRES Secretariat, Ministry of Agriculture Complex,<br />Ilorin, Kwara State, Nigeria</p>
              </div>
            </div>

            <div className="contact__info-item">
              <div className="contact__info-icon"><MapPin size={20} /></div>
              <div>
                <strong>Research Centre</strong>
                <p>Ahmadu Bello University Collaboration Office,<br />Zaria, Kaduna State, Nigeria</p>
              </div>
            </div>

            <div className="contact__info-item">
              <div className="contact__info-icon"><Phone size={20} /></div>
              <div>
                <strong>Phone</strong>
                <p>+234 (0) 803 456 7890<br />+234 (0) 817 234 5678</p>
              </div>
            </div>

            <div className="contact__info-item">
              <div className="contact__info-icon"><Mail size={20} /></div>
              <div>
                <strong>Email</strong>
                <p>info@lpres.gov.ng<br />research@lpres.gov.ng</p>
              </div>
            </div>

            <div className="contact__info-item">
              <div className="contact__info-icon"><Clock size={20} /></div>
              <div>
                <strong>Working Hours</strong>
                <p>Monday – Friday: 8:00am – 5:00pm<br />Saturday: 9:00am – 1:00pm</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="contact__form" onSubmit={handleSubmit}>
            {sent ? (
              <div className="contact__success">
                <CheckCircle size={48} color="var(--gold-primary)" />
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you within 2 business days.</p>
              </div>
            ) : (
              <>
                <div className="contact__form-row">
                  <div className="contact__field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={e => setForm(f => ({...f, name: e.target.value}))}
                      required
                    />
                  </div>
                  <div className="contact__field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={e => setForm(f => ({...f, email: e.target.value}))}
                      required
                    />
                  </div>
                </div>
                <div className="contact__field">
                  <label>Subject</label>
                  <input
                    type="text"
                    placeholder="What is your enquiry about?"
                    value={form.subject}
                    onChange={e => setForm(f => ({...f, subject: e.target.value}))}
                    required
                  />
                </div>
                <div className="contact__field">
                  <label>Message</label>
                  <textarea
                    rows={6}
                    placeholder="Please describe your enquiry in detail..."
                    value={form.message}
                    onChange={e => setForm(f => ({...f, message: e.target.value}))}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary contact__submit">
                  Send Message <Send size={16} />
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
