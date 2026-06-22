/**
 * Template 3 — Timeline / Event Style
 * Prominent date display, image gallery grid, timeline body
 */
import { Calendar, User, Tag, ChevronLeft, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Templates.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Template3({ article }) {
  const imgSrc = article.featured_image
    ? (article.featured_image.startsWith('http') ? article.featured_image : `${API_BASE}${article.featured_image}`)
    : null;

  const allImages = [
    ...(imgSrc ? [imgSrc] : []),
    ...(article.images || []).map((img) => img.startsWith('http') ? img : `${API_BASE}${img}`),
  ];

  const eventDate = article.event_date ? new Date(article.event_date) : null;

  return (
    <div className="template t3">
      <div className="container">
        <Link to="/news" className="t3__back">
          <ChevronLeft size={18} /> Back to News
        </Link>

        {/* Event date hero */}
        <div className="t3__event-header">
          {eventDate && (
            <div className="t3__date-block">
              <span className="t3__date-day">
                {eventDate.toLocaleDateString('en-NG', { day: '2-digit' })}
              </span>
              <span className="t3__date-mon">
                {eventDate.toLocaleDateString('en-NG', { month: 'short' })}
              </span>
              <span className="t3__date-yr">
                {eventDate.toLocaleDateString('en-NG', { year: 'numeric' })}
              </span>
            </div>
          )}
          <div className="t3__event-info">
            <span className="tag tag-gold">{article.category}</span>
            <h1 className="t3__title">{article.title}</h1>
            <div className="t3__meta">
              <span><User size={14} /> {article.published_by}</span>
              {eventDate && (
                <span><Calendar size={14} />
                  {eventDate.toLocaleDateString('en-NG', { dateStyle: 'full' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Full gallery grid */}
        {allImages.length > 0 && (
          <div className="t3__gallery">
            <div className="t3__gallery-header">
              <Image size={18} />
              <span>Event Gallery ({allImages.length} photo{allImages.length > 1 ? 's' : ''})</span>
            </div>
            <div className={`t3__gallery-grid t3__gallery-grid--${Math.min(allImages.length, 4)}`}>
              {allImages.map((src, i) => (
                <img key={i} src={src} alt={`Photo ${i + 1}`} className="t3__gallery-img" />
              ))}
            </div>
          </div>
        )}

        {/* Article body in timeline frame */}
        <div className="t3__article">
          {article.excerpt && <blockquote className="t3__excerpt">{article.excerpt}</blockquote>}
          <div className="prose" dangerouslySetInnerHTML={{ __html: article.body }} />
        </div>
      </div>
    </div>
  );
}
