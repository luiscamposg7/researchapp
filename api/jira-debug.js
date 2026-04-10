const { supabase } = require('./lib/supabase');

module.exports = async function handler(req, res) {
  const { data, error: sbError } = await supabase.from('config').select('value').eq('key', 'jira').maybeSingle();
  const cfg = data?.value || {};
  const email = cfg.email || '(vacío)';
  const token = cfg.token || '';
  const base  = cfg.baseUrl || '(vacío)';

  // Test credentials against Jira
  let jiraStatus = 'no probado';
  if (email !== '(vacío)' && token) {
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    try {
      const r = await fetch(`${base}/rest/api/3/myself`, {
        headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' }
      });
      const d = await r.json();
      jiraStatus = r.ok ? `OK — ${d.displayName}` : `Error ${r.status}: ${JSON.stringify(d)}`;
    } catch (e) {
      jiraStatus = `Excepción: ${e.message}`;
    }
  }

  let issueStatus = 'no probado';
  if (email !== '(vacío)' && token) {
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    try {
      const r = await fetch(`${base}/rest/api/3/issue/UX-2592?fields=summary,status`, {
        headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' }
      });
      const d = await r.json();
      issueStatus = `HTTP ${r.status}: ${JSON.stringify(d).slice(0, 300)}`;
    } catch (e) {
      issueStatus = `Excepción: ${e.message}`;
    }
  }

  res.setHeader('Content-Type', 'text/html');
  res.send(`<pre style="font-family:monospace;padding:20px">
Supabase error: ${sbError?.message || 'ninguno'}
Email:    ${email}
Token:    ${token ? token.slice(0,10) + '...' + token.slice(-8) : '(vacío)'}
Base URL: ${base}
Jira /myself: ${jiraStatus}
Jira UX-2592: ${issueStatus}
</pre>`);
};
