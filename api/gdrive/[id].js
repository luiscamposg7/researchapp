module.exports = async function handler(req, res) {
  const { id } = req.query;
  try {
    const response = await fetch(`https://drive.google.com/file/d/${id}/view`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const html = await response.text();
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const raw = match ? match[1] : '';
    const title = raw.replace(/\s*[-\u2013]\s*Google Drive\s*$/i, '').trim();
    return res.json({ title: title || null });
  } catch {
    return res.json({ title: null });
  }
};
