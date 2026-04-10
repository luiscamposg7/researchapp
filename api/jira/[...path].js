module.exports = async function handler(req, res) {
  const base = (process.env.JIRA_BASE_URL || '').replace(/\/$/, '');
  const email = process.env.JIRA_EMAIL || '';
  const token = process.env.JIRA_TOKEN || '';

  if (!base || !email || !token) {
    return res.status(500).json({ error: 'Jira credentials not configured in environment variables' });
  }

  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const pathParts = req.query.path || [];
  const key = pathParts[0];
  const isTest = key === '_test';
  const apiPath = isTest
    ? '/rest/api/3/myself'
    : `/rest/api/3/issue/${key}?fields=summary,status`;

  try {
    const url = `${base}${apiPath}`;
    console.log('[jira] fetching', url, 'email:', email);
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; JiraClient/1.0)',
      },
    });
    const data = await response.json();
    console.log('[jira] status', response.status, 'data', JSON.stringify(data).slice(0, 200));
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
};
