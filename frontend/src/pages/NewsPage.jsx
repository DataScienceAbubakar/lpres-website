import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Search, Filter } from 'lucide-react';
import { newsAPI } from '../api/client';
import './NewsPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const CATEGORIES = ['All', 'News', 'Events', 'Research', 'Technology', 'Policy'];

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    newsAPI.list(0, 50)
      .then((res) => setArticles(res.data))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter((a) => {
    const matchCat = category === 'All' || a.category === category;
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.excerpt || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="news-page">
      {/* Header banner */}
      <div className="news-page__banner">
        <div className="container">
          <span className="section-label">Latest Updates</span>
          <h1 className="news-page__title">News &amp; Events</h1>
          <p className="news-page__subtitle">
            Research publications, community events, and programme updates from LPRES Kwara State.
          </p>
        </div>
      </div>

      <div className="container news-page__body">
        {/* Filters */}
        <div className="news-page__filters">
          <div className="news-page__search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="news-page__cats">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`news-page__cat-btn ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="news-page__loading">
            {[1,2,3,4,5,6].map(i => <div key={i} className="news-card-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="news-page__empty">
            <p>No articles found{search ? ` for "${search}"` : ''}.</p>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <FeaturedCard article={featured} />
            )}

            {/* Rest of articles */}
            {rest.length > 0 && (
              <div className="news-page__grid">
                {rest.map((a) => <ArticleCard key={a.id} article={a} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FeaturedCard({ article }) {
  const imgSrc = article.featured_image
    ? (article.featured_image.startsWith('http') ? article.featured_image : `${API_BASE}${article.featured_image}`)
    : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80';

  return (
    <Link to={`/news/${article.slug}`} className="news-featured">
      <div className="news-featured__img-wrap">
        <img src={imgSrc} alt={article.title} className="news-featured__img" />
      </div>
      <div className="news-featured__body">
        <div className="news-featured__tags">
          <span className="tag">{article.category}</span>
          <span className="news-featured__badge">Featured</span>
        </div>
        <h2 className="news-featured__title">{article.title}</h2>
        <p className="news-featured__excerpt">{article.excerpt}</p>
        <div className="news-featured__meta">
          {article.event_date && (
            <span><Calendar size={13} /> {new Date(article.event_date).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</span>
          )}
          <span><User size={13} /> {article.published_by}</span>
        </div>
        <span className="news-featured__read">
          Read Full Article <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}

function ArticleCard({ article }) {
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
              {new Date(article.event_date).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
            </span>
          )}
          <span className="news-card__meta-item"><User size={13} /> {article.published_by}</span>
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
