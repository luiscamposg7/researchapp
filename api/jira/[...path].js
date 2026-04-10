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
  const pathParts = req.query.path || [];
  const key = pathParts[0];

  if (key === '_test') {
    const r = await fetch(`${base}/rest/api/2/myself`, { headers });
    const d = await r.json();
    return res.status(r.status).json(d);
  }

  try {
    // Direct fetch
    const r1 = await fetch(`${base}/rest/api/2/issue/${key}?fields=summary,status`, { headers });
    const d1 = await r1.json();
    console.log('[jira direct]', r1.status, JSON.stringify(d1).slice(0, 300));
    if (r1.ok) return res.status(200).json(d1);

    // JQL search fallback
    const jql = encodeURIComponent(`key = "${key}"`);
    const r2 = await fetch(`${base}/rest/api/2/search?jql=${jql}&fields=summary,status&maxResults=1`, { headers });
    const d2 = await r2.json();
    console.log('[jira jql]', r2.status, JSON.stringify(d2).slice(0, 300));
    if (r2.ok && d2.issues?.length > 0) return res.status(200).json(d2.issues[0]);

    return res.status(r1.status).json(d1);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
};
