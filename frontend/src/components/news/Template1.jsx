/**
 * Template 1 — Magazine Style
 * Large featured image left | Title + body right, author below
 */
import { useState } from 'react';
import { Calendar, User, Tag, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Lightbox from './Lightbox';
import './Templates.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Template1({ article }) {
  const [lbIndex, setLbIndex] = useState(null);
  const imgSrc = article.featured_image
    ? (article.featured_image.startsWith('http') ? article.featured_image : `${API_BASE}${article.featured_image}`)
    : null;

  return (
    <div className="template t1">
      <div className="container">
        <Link to="/news" className="t1__back">
          <ChevronLeft size={18} /> Back to News
        </Link>

        <div className="t1__layout">
          {/* Left: Feature image */}
          <aside className="t1__sidebar">
            {imgSrc ? (
              <img src={imgSrc} alt={article.title} className="t1__feat-img" />
            ) : (
              <div className="t1__feat-placeholder">No image available</div>
            )}

            {/* Additional images gallery */}
            {article.images?.length > 0 && (
              <div className="t1__gallery">
                <h4 className="t1__gallery-title">Gallery</h4>
                <div className="t1__gallery-grid">
                  {article.images.map((img, i) => {
                    const src = img.startsWith('http') ? img : `${API_BASE}${img}`;
                    return <img key={i} src={src} alt={`Gallery ${i + 1}`} className="t1__gallery-img" onClick={() => setLbIndex(i)} />;
                  })}
                </div>
              </div>
            )}

            {/* Sidebar info */}
            <div className="t1__info-card">
              <div className="t1__info-item">
                <User size={15} />
                <div>
                  <span className="t1__info-label">Published by</span>
                  <span className="t1__info-value">{article.published_by}</span>
                </div>
              </div>
              {article.event_date && (
                <div className="t1__info-item">
                  <Calendar size={15} />
                  <div>
                    <span className="t1__info-label">Event Date</span>
                    <span className="t1__info-value">
                      {new Date(article.event_date).toLocaleDateString('en-NG', { dateStyle: 'long' })}
                    </span>
                  </div>
                </div>
              )}
              <div className="t1__info-item">
                <Tag size={15} />
                <div>
                  <span className="t1__info-label">Category</span>
                  <span className="t1__info-value">{article.category}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right: Article content */}
          <article className="t1__main">
            <span className="tag tag-gold">{article.category}</span>
            <h1 className="t1__title">{article.title}</h1>
            {article.excerpt && <p className="t1__excerpt">{article.excerpt}</p>}
            <hr className="divider" style={{ margin: '28px 0' }} />
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />
          </article>
        </div>
      </div>

      {lbIndex !== null && (
        <Lightbox
          images={article.images.map(img => img.startsWith('http') ? img : `${API_BASE}${img}`)}
          startIndex={lbIndex}
          onClose={() => setLbIndex(null)}
        />
      )}
    </div>
  );
}
