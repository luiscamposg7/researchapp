const BASE  = process.env.JIRA_BASE_URL  || 'https://prestamype.atlassian.net';
const EMAIL = process.env.JIRA_EMAIL     || 'luis@prestamype.com';
const TOKEN = process.env.JIRA_TOKEN     || '';

module.exports = async function handler(req, res) {
  if (!TOKEN) return res.status(500).json({ error: 'Jira token not configured' });

  const pathRaw = req.query.path || [];
  const pathParts = Array.isArray(pathRaw) ? pathRaw : [pathRaw];
  const key = pathParts[0];

  const auth = Buffer.from(`${EMAIL}:${TOKEN}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}`, Accept: 'application/json' };

  const isTest = key === '_test';
  const apiPath = isTest ? '/rest/api/3/myself' : `/rest/api/3/issue/${key}?fields=summary,status`;

  try {
    const response = await fetch(`${BASE}${apiPath}`, { headers });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
};
