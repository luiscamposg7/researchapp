const { supabase } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  const { data } = await supabase.from('config').select('value').eq('key', 'jira').maybeSingle();
  const cfg = data?.value || {};
  const base  = (cfg.baseUrl || '').replace(/\/$/, '');
  const email = cfg.email || '';
  const token = cfg.token || '';

  if (!base || !email || !token) {
    return res.status(500).json({ error: 'Jira credentials not configured' });
  }

  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}`, Accept: 'application/json' };
  const pathRaw = req.query.path || [];
  const pathParts = Array.isArray(pathRaw) ? pathRaw : [pathRaw];
  const key = pathParts[0];
  console.log('[jira] query:', JSON.stringify(req.query), 'key:', key);

  if (key === '_test') {
    const [rMe, rProj] = await Promise.all([
      fetch(`${base}/rest/api/3/myself`, { headers }),
      fetch(`${base}/rest/api/3/project/search?maxResults=10`, { headers }),
    ]);
    const me = await rMe.json();
    const proj = await rProj.json();
    return res.json({ me, projects: proj.values?.map(p => p.key) || proj });
  }

  try {
    // Direct fetch
    const r1 = await fetch(`${base}/rest/api/2/issue/${key}?fields=summary,status`, { headers });
    const d1 = await r1.json();
    console.log('[jira direct]', r1.status, JSON.stringify(d1).slice(0, 300));
    if (r1.ok) return res.status(200).json(d1);

    // JQL search fallback (v3)
    const r2 = await fetch(`${base}/rest/api/3/search/jql`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ jql: `key = ${key}`, fields: ['summary', 'status'], maxResults: 1 }),
    });
    const d2 = await r2.json();
    console.log('[jira jql]', r2.status, r2.url, JSON.stringify(d2).slice(0, 300));
    if (r2.ok && d2.issues?.length > 0) return res.status(200).json(d2.issues[0]);

    return res.status(r1.status).json(d1);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
};
