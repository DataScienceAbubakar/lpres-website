import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Tag } from 'lucide-react';
import { newsAPI } from '../../api/client';
import './NewsSection.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const FALLBACK = [
  {
    id: 1, slug: '#', title: 'L-PRES GDSS Platform Goes Live Across All 16 LGAs',
    excerpt: 'The Geospatial Decision Support System now provides real-time livestock corridor mapping and grazing land analytics for all 16 Local Government Areas in Kwara State.',
    featured_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
    event_date: '2024-11-15', published_by: 'L-PRES Comms Unit', category: 'Technology',
  },
  {
    id: 2, slug: '#', title: 'Annual Farmer-Herder Dialogue Forum 2024',
    excerpt: 'Over 400 cattle farmers, pastoralists, and community leaders gathered at Ilorin for the third annual peace dialogue, producing a landmark communiqué on grazing routes.',
    featured_image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
    event_date: '2024-10-22', published_by: 'Dr. Amina Suleiman', category: 'Events',
  },
  {
    id: 3, slug: '#', title: '85,000 Animals Vaccinated in Q3 Disease Control Drive',
    excerpt: 'L-PRES veterinary teams completed a landmark foot-and-mouth and PPR vaccination campaign covering 85,000 cattle, sheep, and goats across Kwara State.',
    featured_image: '/hero-bg.jpg',
    event_date: '2024-09-30', published_by: 'Dr. Amina Suleiman', category: 'Animal Health',
  },
];

function NewsCard({ article }) {
  const imgSrc = article.featured_image
    ? (article.featured_image.startsWith('http') ? article.featured_image : `${API_BASE}${article.featured_image}`)
    : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80';

  return (
    <article className="news-card card">
      <Link to={`/news/${article.slug}`} className="news-card__img-link">
        <img src={imgSrc} alt={article.title} className="news-card__img" />
        <span className="news-card__cat">{article.category}</span>
      </Link>
      <div className="news-card__body">
        <div className="news-card__meta">
          {article.event_date && (
            <span className="news-card__meta-item">
              <Calendar size={13} />
              {new Date(article.event_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          <span className="news-card__meta-item">
            <User size={13} />
            {article.published_by}
          </span>
        </div>
        <Link to={`/news/${article.slug}`}>
          <h3 className="news-card__title">{article.title}</h3>
        </Link>
        <p className="news-card__excerpt">{article.excerpt}</p>
        <Link to={`/news/${article.slug}`} className="news-card__read-more">
          Read more <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

export default function NewsSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsAPI.list(0, 3)
      .then((res) => setArticles(res.data.length ? res.data : FALLBACK))
      .catch(() => setArticles(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="news-section section" id="news">
      <div className="container">
        <div className="news-section__header">
          <div>
            <span className="section-label dark">Latest Updates</span>
            <h2 className="section-title">News &amp; Events</h2>
            <p className="section-subtitle">
              Stay informed about LPRES activities, research publications, and community events.
            </p>
          </div>
          <Link to="/news" className="btn btn-primary news-section__all-btn">
            View All News <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="news-section__loading">
            {[1,2,3].map(i => <div key={i} className="news-card-skeleton" />)}
          </div>
        ) : (
          <div className="news-section__grid">
            {articles.slice(0,3).map((a) => <NewsCard key={a.id} article={a} />)}
          </div>
        )}
      </div>
    </section>
  );
}
