/**
 * Netlify Function: /api/admin/*
 * Handles admin authentication (login + me) without a persistent backend.
 * Credentials can be overridden via Netlify environment variables:
 *   ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET
 */
const crypto = require('crypto');

const SECRET   = process.env.JWT_SECRET       || 'lpres-kwara-admin-2024-secret';
const ADM_USER = process.env.ADMIN_USERNAME   || 'admin';
const ADM_PASS = process.env.ADMIN_PASSWORD   || 'lpres@admin2024';

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// ── Minimal JWT (no external deps) ──────────────────────────────
function b64u(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function fromb64u(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function signToken(payload) {
  const hdr  = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64u(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  }));
  const sig = crypto.createHmac('sha256', SECRET)
    .update(`${hdr}.${body}`).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${hdr}.${body}.${sig}`;
}

function verifyToken(token) {
  if (!token) throw new Error('missing token');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('malformed token');
  const [hdr, body, sig] = parts;
  const expected = crypto.createHmac('sha256', SECRET)
    .update(`${hdr}.${body}`).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  if (sig !== expected) throw new Error('invalid signature');
  const payload = JSON.parse(fromb64u(body));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error('token expired');
  return payload;
}

// ── Handler ──────────────────────────────────────────────────────
exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  const path = event.path.replace(/^\/api\/admin\/?/, '').replace(/\/$/, '');

  // POST /api/admin/login
  if (event.httpMethod === 'POST' && path === 'login') {
    try {
      let username, password;

      const ct = (event.headers['content-type'] || '').toLowerCase();
      if (ct.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(event.body || '');
        username = params.get('username') || '';
        password = params.get('password') || '';
      } else {
        const parsed = JSON.parse(event.body || '{}');
        username = parsed.username || '';
        password = parsed.password || '';
      }

      if (username !== ADM_USER || password !== ADM_PASS) {
        return {
          statusCode: 401,
          headers: HEADERS,
          body: JSON.stringify({ detail: 'Incorrect username or password' }),
        };
      }

      const token = signToken({ sub: username, id: 1, role: 'admin' });
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({ access_token: token, token_type: 'bearer' }),
      };
    } catch (err) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ detail: err.message }),
      };
    }
  }

  // GET /api/admin/me
  if (event.httpMethod === 'GET' && path === 'me') {
    try {
      const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
      const token = authHeader.replace(/^[Bb]earer\s+/, '');
      const payload = verifyToken(token);
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({ id: 1, username: payload.sub, email: 'admin@lpreskwara.ng' }),
      };
    } catch {
      return {
        statusCode: 401,
        headers: HEADERS,
        body: JSON.stringify({ detail: 'Unauthorized' }),
      };
    }
  }

  return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ detail: 'Not found' }) };
};
