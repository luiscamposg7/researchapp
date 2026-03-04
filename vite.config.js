import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'db.json')

function localDb() {
  return {
    name: 'local-db',
    configureServer(server) {
      const read = () => {
        try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
        catch { return { deliverables: [] }; }
      };
      const write = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

      if (!fs.existsSync(DB_PATH)) write({ deliverables: [] });

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
          try {
            const { default: https } = await import('https');
            const fileId = gdMatch[1];
            const title = await new Promise((resolve, reject) => {
              https.get(
                `https://drive.google.com/file/d/${fileId}/view`,
                { headers: { 'User-Agent': 'Mozilla/5.0' } },
                (r) => {
                  let html = '';
                  r.on('data', c => html += c);
                  r.on('end', () => {
                    const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                    const raw = m ? m[1] : '';
                    const name = raw.replace(/\s*[-–]\s*Google Drive\s*$/i, '').trim();
                    resolve(name || null);
                  });
                }
              ).on('error', reject);
            });
            return res.end(JSON.stringify({ title }));
          } catch (e) {
            return res.end(JSON.stringify({ title: null }));
          }
        }

        if (!req.url.startsWith('/api/deliverables')) return next();
        res.setHeader('Content-Type', 'application/json');

        if (req.url === '/api/deliverables') {
          if (req.method === 'GET') {
            return res.end(JSON.stringify(read().deliverables));
          }
          if (req.method === 'POST') {
            const item = JSON.parse(await getBody(req));
            const db = read();
            db.deliverables.unshift(item);
            write(db);
            return res.end(JSON.stringify(item));
          }
        }
        const delMatch = req.url.match(/^\/api\/deliverables\/(.+)$/);
        if (delMatch && req.method === 'DELETE') {
          const id = Number(delMatch[1]);
          const db = read();
          db.deliverables = db.deliverables.filter(d => d.id !== id);
          write(db);
          return res.end('{}');
        }
        res.writeHead(404);
        res.end('{}');
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localDb()],
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
