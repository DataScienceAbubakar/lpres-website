/**
 * Template 2 — Classic Article
 * Full-width hero image, centred content, sidebar with article info
 */
import { Calendar, User, Tag, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Templates.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Template2({ article }) {
  const imgSrc = article.featured_image
    ? (article.featured_image.startsWith('http') ? article.featured_image : `${API_BASE}${article.featured_image}`)
    : null;

  return (
    <div className="template t2">
      {/* Full-width hero */}
      {imgSrc && (
        <div className="t2__hero">
          <img src={imgSrc} alt={article.title} className="t2__hero-img" />
          <div className="t2__hero-overlay">
            <div className="container">
              <span className="tag" style={{ background: 'rgba(34,197,94,0.9)', color: '#fff', border: 'none' }}>
                {article.category}
              </span>
              <h1 className="t2__hero-title">{article.title}</h1>
              <div className="t2__hero-meta">
                {article.event_date && (
                  <span><Calendar size={14} /> {new Date(article.event_date).toLocaleDateString('en-NG', { dateStyle: 'long' })}</span>
                )}
                <span><User size={14} /> {article.published_by}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <Link to="/news" className="t2__back">
          <ChevronLeft size={18} /> Back to News
        </Link>

        {!imgSrc && (
          <div className="t2__header-text">
            <span className="tag tag-gold">{article.category}</span>
            <h1 className="t2__title-no-img">{article.title}</h1>
            <div className="t2__meta">
              {article.event_date && (
                <span><Calendar size={14} /> {new Date(article.event_date).toLocaleDateString('en-NG', { dateStyle: 'long' })}</span>
              )}
              <span><User size={14} /> {article.published_by}</span>
            </div>
          </div>
        )}

        <div className="t2__body">
          <div className="t2__content">
            {article.excerpt && <p className="t2__excerpt">{article.excerpt}</p>}
            <div className="prose" dangerouslySetInnerHTML={{ __html: article.body }} />
          </div>

          <aside className="t2__aside">
            <div className="t2__aside-card">
              <h4 className="t2__aside-title">Article Details</h4>
              <div className="t2__aside-item">
                <User size={15} />
                <div>
                  <span className="t1__info-label">Published by</span>
                  <span className="t1__info-value">{article.published_by}</span>
                </div>
              </div>
              {article.event_date && (
                <div className="t2__aside-item">
                  <Calendar size={15} />
                  <div>
                    <span className="t1__info-label">Date</span>
                    <span className="t1__info-value">
                      {new Date(article.event_date).toLocaleDateString('en-NG', { dateStyle: 'long' })}
                    </span>
                  </div>
                </div>
              )}
              <div className="t2__aside-item">
                <Tag size={15} />
                <div>
                  <span className="t1__info-label">Category</span>
                  <span className="t1__info-value">{article.category}</span>
                </div>
              </div>
            </div>

            {article.images?.length > 0 && (
              <div className="t2__aside-card" style={{ marginTop: '20px' }}>
                <h4 className="t2__aside-title">Gallery</h4>
                {article.images.map((img, i) => {
                  const src = img.startsWith('http') ? img : `${API_BASE}${img}`;
                  return <img key={i} src={src} alt={`Gallery ${i + 1}`} className="t2__gallery-img" />;
                })}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
