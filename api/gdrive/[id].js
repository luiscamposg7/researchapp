export default async function handler(req, res) {
  const { id } = req.query;
  try {
    const response = await fetch(`https://drive.google.com/file/d/${id}/view`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const html = await response.text();
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const raw = match ? match[1] : '';
    const title = raw.replace(/\s*[-–]\s*Google Drive\s*$/i, '').trim();
    res.json({ title: title || null });
  } catch {
    res.json({ title: null });
  }
}
