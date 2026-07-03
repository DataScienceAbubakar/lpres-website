/**
 * Netlify Function: /api/news/*
 * Full CRUD with Netlify Blobs for persistent storage.
 * Public reads are open; admin writes require the JWT from admin.js.
 */
const crypto = require('crypto');

// Top-level import so esbuild bundles it correctly.
// Falls back to null on local dev if the package isn't installed.
let _getStore = null;
try { _getStore = require('@netlify/blobs').getStore; } catch (_) {}

const SECRET = process.env.JWT_SECRET || 'lpres-kwara-admin-2024-secret';

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

// ── JWT verify (mirrors admin.js) ────────────────────────────────
function fromb64u(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}
function verifyToken(token) {
  if (!token) throw new Error('missing token');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('malformed');
  const [hdr, body, sig] = parts;
  const expected = crypto.createHmac('sha256', SECRET)
    .update(`${hdr}.${body}`).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  if (sig !== expected) throw new Error('bad signature');
  const payload = JSON.parse(fromb64u(body));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error('expired');
  return payload;
}

function requireAuth(event) {
  const header = event.headers['authorization'] || event.headers['Authorization'] || '';
  verifyToken(header.replace(/^[Bb]earer\s+/, ''));
}

// ── Slug helper ──────────────────────────────────────────────────
function slugify(str) {
  return (str || '').toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ── Seed articles (shown before any articles are added) ──────────
const SEED = [
  {
    id: 1000,
    title: 'L-PRES Kicks Off Statewide Animal Health Campaign Across 16 LGAs',
    body: '<p>The Kwara State Livestock Productivity and Resilience Support Project (L-PRES) has launched a comprehensive animal health campaign targeting livestock farmers across all 16 Local Government Areas of Kwara State.</p><p>The campaign targets over 250,000 animals for vaccination against Foot and Mouth Disease, Contagious Bovine Pleuropneumonia (CBPP), and Peste des Petits Ruminants (PPR).</p>',
    featured_image: 'https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=800&q=80',
    images: [],
    event_date: '2026-03-15',
    published_by: 'L-PRES Communications',
    template: 1,
    is_published: true,
    slug: 'lpres-statewide-animal-health-campaign',
    excerpt: 'L-PRES launches a comprehensive animal health campaign targeting over 250,000 animals across all 16 LGAs of Kwara State.',
    category: 'News',
    created_at: '2026-03-15T10:00:00',
    updated_at: null,
  },
  {
    id: 1001,
    title: '400 Dairy Farmers Trained on Modern Milk Collection and Cold Chain Practices',
    body: '<p>A five-day intensive training programme on milk collection, hygiene, and cold chain management was completed by 400 dairy farmers in Offa LGA under the L-PRES Dairy Value Chain component.</p>',
    featured_image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80',
    images: [],
    event_date: '2026-04-20',
    published_by: 'L-PRES Communications',
    template: 1,
    is_published: true,
    slug: 'dairy-farmers-cold-chain-training',
    excerpt: '400 dairy farmers in Offa LGA complete five-day training on milk collection and cold chain management.',
    category: 'Training',
    created_at: '2026-04-20T09:00:00',
    updated_at: null,
  },
  {
    id: 1002,
    title: 'L-PRES Completes Construction of 12 Water Points Across Northern Kwara',
    body: '<p>Twelve water points have been successfully constructed across Baruten, Kaiama, and Edu Local Government Areas as part of the L-PRES pastoral infrastructure support programme.</p>',
    featured_image: 'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800&q=80',
    images: [],
    event_date: '2026-05-10',
    published_by: 'L-PRES Field Operations',
    template: 1,
    is_published: true,
    slug: 'water-points-construction-northern-kwara',
    excerpt: 'L-PRES completes 12 solar-powered water points across Baruten, Kaiama, and Edu LGAs.',
    category: 'Field Work',
    created_at: '2026-05-10T11:00:00',
    updated_at: null,
  },
];

// ── Blob store (Netlify Blobs) ────────────────────────────────────
async function loadArticles() {
  if (!_getStore) return [...SEED];
  try {
    const store = _getStore('news-articles');
    const raw = await store.get('articles');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Blob load error:', e.message);
  }
  return [...SEED];
}

async function saveArticles(articles) {
  if (!_getStore) return false;
  try {
    const store = _getStore('news-articles');
    await store.set('articles', JSON.stringify(articles));
    return true;
  } catch (e) {
    console.error('Blob save error:', e.message);
    return false;
  }
}

// ── Main handler ─────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  const method = event.httpMethod;
  // Normalise path: strip /api/news/ prefix and trailing slash
  const path = event.path.replace(/^\/api\/news\/?/, '').replace(/\/$/, '');
  const qs = event.queryStringParameters || {};

  try {
    // ── Public GET /api/news/ — list published ─────────────────
    if (method === 'GET' && path === '') {
      const articles = await loadArticles();
      const skip  = parseInt(qs.skip  || 0, 10);
      const limit = parseInt(qs.limit || 50, 10);
      const published = articles
        .filter(a => a.is_published)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(skip, skip + limit);
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(published) };
    }

    // ── Public GET /api/news/:slug ─────────────────────────────
    if (method === 'GET' && path && !path.startsWith('admin')) {
      const articles = await loadArticles();
      const article = articles.find(a => a.slug === path);
      if (!article || !article.is_published) {
        return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ detail: 'Not found' }) };
      }
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(article) };
    }

    // ── Admin routes — all require auth ───────────────────────
    if (path.startsWith('admin')) {
      try { requireAuth(event); } catch {
        return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ detail: 'Unauthorized' }) };
      }
    }

    // ── GET /api/news/admin/all ────────────────────────────────
    if (method === 'GET' && path === 'admin/all') {
      const articles = await loadArticles();
      const skip = parseInt(qs.skip || 0, 10);
      return {
        statusCode: 200, headers: HEADERS,
        body: JSON.stringify(articles.slice(skip, skip + 50)),
      };
    }

    // ── POST /api/news/admin/create ────────────────────────────
    if (method === 'POST' && path === 'admin/create') {
      const data = JSON.parse(event.body || '{}');
      const articles = await loadArticles();
      const id = Date.now();
      const baseSlug = slugify(data.title);
      // ensure slug uniqueness
      let slug = baseSlug;
      let n = 2;
      while (articles.find(a => a.slug === slug)) { slug = `${baseSlug}-${n++}`; }

      const article = {
        id,
        title:        data.title        || '',
        body:         data.body         || '',
        excerpt:      data.excerpt      || stripHtml(data.body).slice(0, 240) || '',
        featured_image: data.featured_image || null,
        images:       Array.isArray(data.images) ? data.images : [],
        event_date:   data.event_date   || null,
        published_by: data.published_by || '',
        template:     Number(data.template) || 1,
        is_published: data.is_published === true || data.is_published === 'true',
        slug,
        category:     data.category     || 'News',
        created_at:   new Date().toISOString(),
        updated_at:   null,
      };

      articles.unshift(article);
      await saveArticles(articles);
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(article) };
    }

    // ── PUT /api/news/admin/:id ────────────────────────────────
    const putMatch = path.match(/^admin\/(\d+)$/);
    if (method === 'PUT' && putMatch) {
      const id = Number(putMatch[1]);
      const articles = await loadArticles();
      const idx = articles.findIndex(a => a.id === id);
      if (idx === -1) {
        return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ detail: 'Not found' }) };
      }
      const data = JSON.parse(event.body || '{}');
      articles[idx] = {
        ...articles[idx],
        title:        data.title        ?? articles[idx].title,
        body:         data.body         ?? articles[idx].body,
        excerpt:      data.excerpt      ?? articles[idx].excerpt,
        featured_image: data.featured_image !== undefined ? data.featured_image : articles[idx].featured_image,
        images:       Array.isArray(data.images) ? data.images : articles[idx].images,
        event_date:   data.event_date   ?? articles[idx].event_date,
        published_by: data.published_by ?? articles[idx].published_by,
        template:     Number(data.template) || articles[idx].template,
        is_published: data.is_published === true || data.is_published === 'true',
        category:     data.category     ?? articles[idx].category,
        updated_at:   new Date().toISOString(),
      };
      await saveArticles(articles);
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(articles[idx]) };
    }

    // ── PATCH /api/news/admin/:id/publish ─────────────────────
    const patchMatch = path.match(/^admin\/(\d+)\/publish$/);
    if (method === 'PATCH' && patchMatch) {
      const id = Number(patchMatch[1]);
      const articles = await loadArticles();
      const idx = articles.findIndex(a => a.id === id);
      if (idx === -1) {
        return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ detail: 'Not found' }) };
      }
      articles[idx].is_published = !articles[idx].is_published;
      articles[idx].updated_at = new Date().toISOString();
      await saveArticles(articles);
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(articles[idx]) };
    }

    // ── DELETE /api/news/admin/:id ────────────────────────────
    const delMatch = path.match(/^admin\/(\d+)$/);
    if (method === 'DELETE' && delMatch) {
      const id = Number(delMatch[1]);
      let articles = await loadArticles();
      const before = articles.length;
      articles = articles.filter(a => a.id !== id);
      if (articles.length === before) {
        return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ detail: 'Not found' }) };
      }
      await saveArticles(articles);
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ message: 'Deleted' }) };
    }

    return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ detail: 'Not found' }) };

  } catch (err) {
    console.error('news function error:', err);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ detail: err.message }) };
  }
};

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
