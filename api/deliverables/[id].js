import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id } = req.query;
  const deliverables = (await kv.get('deliverables')) || [];
  const updated = deliverables.filter(d => d.id !== Number(id));
  await kv.set('deliverables', updated);
  res.json({});
}
