export default async function handler(req, res) {
  const pathParts = req.query.path || [];
  const base = (req.headers['x-jira-base'] || '').replace(/\/$/, '');
  const auth = req.headers['x-jira-auth'];

  if (!base || !auth) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const key = pathParts[0];
  const isTest = key === '_test';
  const apiPath = isTest
    ? '/rest/api/3/myself'
    : `/rest/api/3/issue/${key}?fields=summary,status`;

  try {
    const response = await fetch(`${base}${apiPath}`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; JiraClient/1.0)',
        Host: base.replace(/^https?:\/\//, ''),
      },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
