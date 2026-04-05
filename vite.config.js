import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'
import crypto from 'crypto'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const opts = body
      ? { ...options, headers: { ...options.headers, 'Content-Length': Buffer.byteLength(body) } }
      : options;
    const req = https.request(opts, (r) => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => {
        try { resolve({ status: r.statusCode, body: data ? JSON.parse(data) : null }); }
        catch { resolve({ status: r.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function sbRequest(method, path, body) {
  const url = new URL(SUPABASE_URL + path);
  const payload = body ? JSON.stringify(body) : null;
  return httpsRequest({
    hostname: url.hostname,
    path: url.pathname + url.search,
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
  }, payload);
}

function localDb() {
  return {
    name: 'local-db',
    configureServer(server) {
      const getBody = (req) => new Promise(resolve => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => resolve(body));
      });

      server.middlewares.use(async (req, res, next) => {
        // Google Drive title fetch
        const gdMatch = req.url.match(/^\/api\/gdrive\/([^/?]+)$/);
        if (gdMatch) {
          res.setHeader('Content-Type', 'application/json');
          const fileId = gdMatch[1];
          const tryUrls = [
            `https://drive.google.com/file/d/${fileId}/view`,
            `https://docs.google.com/presentation/d/${fileId}/edit`,
            `https://docs.google.com/document/d/${fileId}/edit`,
            `https://docs.google.com/spreadsheets/d/${fileId}/edit`,
          ];
          const fetchTitle = (url) => new Promise((resolve) => {
            https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (r) => {
              let html = '';
              r.on('data', c => html += c);
              r.on('end', () => {
                const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                const raw = m ? m[1] : '';
                const name = raw.replace(/\s*[-–]\s*Google (Drive|Docs|Slides|Sheets)\s*$/i, '').trim();
                resolve(name || null);
              });
            }).on('error', () => resolve(null));
          });
          for (const url of tryUrls) {
            const title = await fetchTitle(url);
            if (title) return res.end(JSON.stringify({ title }));
          }
          return res.end(JSON.stringify({ title: null }));
        }

        // Google Drive thumbnail proxy
        if (req.url.startsWith('/api/drive-thumb/')) {
          const fileId = req.url.replace('/api/drive-thumb/', '').split('?')[0];
          if (!fileId) { res.writeHead(400); return res.end(''); }
          const fetchImg = (url, redirects = 0) => new Promise((resolve, reject) => {
            if (redirects > 5) return reject(new Error('Too many redirects'));
            const parsed = new URL(url);
            https.get({
              hostname: parsed.hostname,
              path: parsed.pathname + parsed.search,
              headers: { 'User-Agent': 'Mozilla/5.0' },
            }, (imgResp) => {
              if (imgResp.statusCode >= 300 && imgResp.statusCode < 400 && imgResp.headers.location) {
                imgResp.resume();
                return fetchImg(imgResp.headers.location, redirects + 1).then(resolve).catch(reject);
              }
              res.writeHead(imgResp.statusCode, {
                'Content-Type': imgResp.headers['content-type'] || 'image/jpeg',
                'Cache-Control': 'public, max-age=3600',
              });
              imgResp.pipe(res);
              imgResp.on('end', resolve);
            }).on('error', reject);
          });
          await fetchImg(`https://drive.google.com/thumbnail?id=${fileId}&sz=w800`);
          return;
        }

        // Figma oEmbed metadata
        if (req.url.startsWith('/api/figma-thumb')) {
          res.setHeader('Content-Type', 'application/json');
          const qs = new URL(req.url, 'http://localhost').searchParams;
          const figmaUrl = qs.get('url');
          if (!figmaUrl) { res.writeHead(400); return res.end(JSON.stringify({ error: 'Missing url' })); }
          const oembedPath = '/api/oembed?url=' + encodeURIComponent(figmaUrl);
          const r = await new Promise((resolve, reject) => {
            https.get({ hostname: 'www.figma.com', path: oembedPath, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }, (resp) => {
              let d = ''; resp.on('data', c => d += c); resp.on('end', () => resolve({ status: resp.statusCode, body: d }));
            }).on('error', reject);
          });
          if (r.status >= 300) { res.writeHead(r.status); return res.end(JSON.stringify({ error: 'Figma oEmbed failed' })); }
          try { const data = JSON.parse(r.body); return res.end(JSON.stringify({ title: data.title || null, thumbnail_url: data.thumbnail_url || null })); }
          catch { res.writeHead(500); return res.end(JSON.stringify({ error: 'Parse error' })); }
        }

        // Figma image proxy
        if (req.url.startsWith('/api/figma-img')) {
          const qs = new URL(req.url, 'http://localhost').searchParams;
          const figmaUrl = qs.get('url');
          if (!figmaUrl) { res.writeHead(400); res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ error: 'Missing url' })); }
          const oembedPath = '/api/oembed?url=' + encodeURIComponent(figmaUrl);
          const oembedResp = await new Promise((resolve, reject) => {
            https.get({ hostname: 'www.figma.com', path: oembedPath, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }, (resp) => {
              let d = ''; resp.on('data', c => d += c); resp.on('end', () => resolve({ status: resp.statusCode, body: d }));
            }).on('error', reject);
          });
          if (oembedResp.status >= 300) { res.writeHead(oembedResp.status); return res.end(''); }
          let thumbUrl; try { thumbUrl = JSON.parse(oembedResp.body).thumbnail_url; } catch { res.writeHead(500); return res.end(''); }
          if (!thumbUrl) { res.writeHead(404); return res.end(''); }
          const parsed = new URL(thumbUrl);
          await new Promise((resolve, reject) => {
            https.get({ hostname: parsed.hostname, path: parsed.pathname + parsed.search, headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/*' } }, (imgResp) => {
              res.writeHead(imgResp.statusCode, {
                'Content-Type': imgResp.headers['content-type'] || 'image/png',
                'Cache-Control': 'public, max-age=3600',
              });
              imgResp.pipe(res);
              imgResp.on('end', resolve);
            }).on('error', reject);
          });
          return;
        }

        // Cloudinary list
        if (req.url === '/api/cloudinary/list' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
          const apiKey    = process.env.CLOUDINARY_API_KEY;
          const apiSecret = process.env.CLOUDINARY_API_SECRET;
          const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
          const { status, body: data } = await httpsRequest({
            hostname: 'api.cloudinary.com',
            path: `/v1_1/${cloudName}/resources/image?max_results=200`,
            method: 'GET',
            headers: { Authorization: `Basic ${basicAuth}` },
          });
          if (status >= 300) { res.writeHead(status); return res.end(JSON.stringify({ error: data?.error?.message || 'Error' })); }
          const resources = (data.resources || []).map(img => ({
            public_id: img.public_id,
            url: img.secure_url,
            width: img.width,
            height: img.height,
            created_at: img.created_at,
          }));
          return res.end(JSON.stringify({ resources }));
        }

        // Cloudinary delete
        if (req.url === '/api/cloudinary/delete' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          const { public_id } = JSON.parse(await getBody(req));
          if (!public_id) { res.writeHead(400); return res.end(JSON.stringify({ error: 'Missing public_id' })); }
          const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
          const apiKey    = process.env.CLOUDINARY_API_KEY;
          const apiSecret = process.env.CLOUDINARY_API_SECRET;
          const timestamp = Math.round(Date.now() / 1000);
          const signature = crypto.createHash('sha1')
            .update(`public_id=${public_id}&timestamp=${timestamp}${apiSecret}`)
            .digest('hex');
          const formBody = `public_id=${encodeURIComponent(public_id)}&timestamp=${timestamp}&api_key=${apiKey}&signature=${signature}`;
          const { body: result } = await httpsRequest({
            hostname: 'api.cloudinary.com',
            path: `/v1_1/${cloudName}/image/destroy`,
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }, formBody);
          if (result.result !== 'ok') { res.writeHead(400); return res.end(JSON.stringify({ error: result.result })); }
          return res.end(JSON.stringify({ ok: true }));
        }

        // Config read/write (service role key needed for RLS)
        if (req.url.startsWith('/api/config') && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          const qs = new URL(req.url, 'http://localhost').searchParams;
          const key = qs.get('key');
          const r = await sbRequest('GET', `/rest/v1/config?select=value&key=eq.${encodeURIComponent(key)}`);
          if (r.status >= 300) { res.writeHead(500); return res.end(JSON.stringify({ error: r.body })); }
          const row = Array.isArray(r.body) ? r.body[0] : null;
          return res.end(JSON.stringify({ value: row?.value || null }));
        }

        if (req.url === '/api/config' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          const { key, value } = JSON.parse(await getBody(req));
          const payload = JSON.stringify({ key, value });
          const url = new URL(SUPABASE_URL + '/rest/v1/config');
          const r = await httpsRequest({
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates,return=minimal',
            },
          }, payload);
          if (r.status >= 300) { res.writeHead(500); return res.end(JSON.stringify({ error: r.body })); }
          return res.end('{}');
        }

        if (!req.url.startsWith('/api/deliverables')) return next();
        res.setHeader('Content-Type', 'application/json');

        if (req.url === '/api/deliverables') {
          if (req.method === 'GET') {
            const r = await sbRequest('GET', '/rest/v1/deliverables?select=data&order=id.desc');
            if (r.status >= 300) { res.writeHead(500); return res.end(JSON.stringify({ error: r.body })); }
            return res.end(JSON.stringify((r.body || []).map(row => row.data)));
          }
          if (req.method === 'POST') {
            const item = JSON.parse(await getBody(req));
            const r = await sbRequest('POST', '/rest/v1/deliverables', { id: item.id, data: item });
            if (r.status >= 300) { res.writeHead(500); return res.end(JSON.stringify({ error: r.body })); }
            return res.end(JSON.stringify(item));
          }
        }

        const delMatch = req.url.match(/^\/api\/deliverables\/(.+)$/);
        if (delMatch) {
          const id = Number(delMatch[1]);
          if (req.method === 'DELETE') {
            const r = await sbRequest('DELETE', `/rest/v1/deliverables?id=eq.${id}`);
            if (r.status >= 300) { res.writeHead(500); return res.end(JSON.stringify({ error: r.body })); }
            return res.end('{}');
          }
          if (req.method === 'PUT') {
            const item = JSON.parse(await getBody(req));
            const r = await sbRequest('PATCH', `/rest/v1/deliverables?id=eq.${id}`, { data: item });
            if (r.status >= 300) { res.writeHead(500); return res.end(JSON.stringify({ error: r.body })); }
            return res.end('{}');
          }
        }

        res.writeHead(404);
        res.end('{}');
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localDb()],
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src'),
    },
  },
  server: {
    proxy: {
      '/api/jira': {
        target: 'https://placeholder.atlassian.net',
        changeOrigin: true,
        secure: true,
        router: (req) => req.headers['x-jira-base'],
        rewrite: (path) => {
          if (path === '/api/jira/_test') return '/rest/api/3/myself';
          return path.replace(/^\/api\/jira\/([^/?]+).*/, '/rest/api/3/issue/$1?fields=summary,status');
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const auth = req.headers['x-jira-auth'];
            const base = req.headers['x-jira-base'] || '';
            const host = base.replace(/^https?:\/\//, '').replace(/\/$/, '');
            if (auth) proxyReq.setHeader('Authorization', `Basic ${auth}`);
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (compatible; JiraClient/1.0)');
            if (host) proxyReq.setHeader('Host', host);
            proxyReq.removeHeader('x-jira-base');
            proxyReq.removeHeader('x-jira-auth');
            console.log('[Jira proxy] →', base + proxyReq.path);
          });
          proxy.on('error', (err, _req, res) => {
            console.error('[Jira proxy] error:', err.message);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          });
        },
      },
    },
  },
})
