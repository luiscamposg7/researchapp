const { supabase } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  const { data, error: sbError } = await supabase.from('config').select('value').eq('key', 'jira').maybeSingle();
  const cfg = data?.value || {};
  const base  = (cfg.baseUrl || '').replace(/\/$/, '');
  const email = cfg.email || '';
  const token = cfg.token || '';

  if (!base || !email || !token) {
    return res.status(500).json({ error: 'Jira credentials not configured', sbError: sbError?.message, hasData: !!data });
  }

  const pathRaw = req.query.path || [];
  const pathParts = Array.isArray(pathRaw) ? pathRaw : [pathRaw];
  const key = pathParts[0];

  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}`, Accept: 'application/json' };

  const isTest = key === '_test';
  const apiPath = isTest ? '/rest/api/3/myself' : `/rest/api/3/issue/${key}?fields=summary,status`;

  try {
    const response = await fetch(`${base}${apiPath}`, { headers });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ ...data, _debug: { email, tokenEnd: token.slice(-8), key } });
    }
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
};
