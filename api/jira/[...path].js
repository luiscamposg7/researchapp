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

  const basicAuth = Buffer.from(`${email}:${token}`).toString('base64');
  const makeHeaders = (authValue) => ({ Authorization: authValue, Accept: 'application/json', 'Content-Type': 'application/json' });
  const headers = makeHeaders(`Basic ${basicAuth}`);
  const pathParts = req.query.path || [];
  const key = pathParts[0];

  if (key === '_test') {
    try {
      const r = await fetch(`${base}/rest/api/2/myself`, { headers });
      const d = await r.json();
      return res.status(r.status).json(d);
    } catch (err) {
      return res.status(502).json({ error: err.message });
    }
  }

  try {
    // Try direct issue fetch first
    const r1 = await fetch(`${base}/rest/api/2/issue/${key}?fields=summary,status`, { headers });
    if (r1.ok) {
      const d = await r1.json();
      return res.status(200).json(d);
    }

    // Fallback: JQL search with Bearer token
    const r2 = await fetch(`${base}/rest/api/2/search?jql=issue="${key}"&fields=summary,status&maxResults=1`, { headers: makeHeaders(`Bearer ${token}`) });
    const d2 = await r2.json();
    console.log('[jira search]', r2.status, JSON.stringify(d2).slice(0, 300));
    if (r2.ok && d2.issues?.length > 0) {
      return res.status(200).json(d2.issues[0]);
    }

    const d1 = await r1.json();
    return res.status(r1.status).json(d1);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
};
