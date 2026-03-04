const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    const deliverables = (await kv.get('deliverables')) || [];
    return res.json(deliverables);
  }

  if (req.method === 'POST') {
    const item = req.body;
    const deliverables = (await kv.get('deliverables')) || [];
    deliverables.unshift(item);
    await kv.set('deliverables', deliverables);
    return res.json(item);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
