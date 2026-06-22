import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { newsAPI } from '../api/client';
import Template1 from '../components/news/Template1';
import Template2 from '../components/news/Template2';
import Template3 from '../components/news/Template3';

function Skeleton() {
  return (
    <div style={{ padding: 'calc(var(--navbar-height) + 80px) 24px 80px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ height: 24, background: '#e5e7eb', borderRadius: 8, width: '30%', marginBottom: 32, animation: 'skeleton 1.5s infinite' }} />
      <div style={{ height: 420, background: '#e5e7eb', borderRadius: 16, marginBottom: 32, animation: 'skeleton 1.5s infinite' }} />
      <div style={{ height: 18, background: '#e5e7eb', borderRadius: 6, marginBottom: 12, animation: 'skeleton 1.5s infinite' }} />
      <div style={{ height: 18, background: '#e5e7eb', borderRadius: 6, width: '80%', animation: 'skeleton 1.5s infinite' }} />
    </div>
  );
}

export default function NewsArticle() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug || slug === '#') {
      setLoading(false);
      return;
    }
    newsAPI.get(slug)
      .then((res) => setArticle(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Skeleton />;
  if (notFound || !article) return <Navigate to="/news" replace />;

  switch (article.template) {
    case 2: return <Template2 article={article} />;
    case 3: return <Template3 article={article} />;
    default: return <Template1 article={article} />;
  }
}
