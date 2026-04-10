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
  const pathParts = req.query.path || [];
  const key = pathParts[0];
  const isTest = key === '_test';
  const apiPath = isTest ? '/rest/api/2/myself' : `/rest/api/2/issue/${key}?fields=summary,status`;

  try {
    const response = await fetch(`${base}${apiPath}`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    });
    const data = await response.json();
    console.log('[jira]', response.status, JSON.stringify(data).slice(0, 500));
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
};
