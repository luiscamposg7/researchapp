module.exports = function handler(req, res) {
  res.json({
    JIRA_BASE_URL: process.env.JIRA_BASE_URL ? 'SET' : 'MISSING',
    JIRA_EMAIL: process.env.JIRA_EMAIL ? 'SET' : 'MISSING',
    JIRA_TOKEN: process.env.JIRA_TOKEN ? 'SET' : 'MISSING',
  });
};
