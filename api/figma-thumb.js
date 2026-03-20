module.exports = async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url" });

  try {
    const oembedUrl = `https://www.figma.com/api/oembed?url=${encodeURIComponent(url)}`;
    const r = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    if (!r.ok) return res.status(r.status).json({ error: "Figma oEmbed failed" });
    const data = await r.json();
    return res.json({ thumbnail_url: data.thumbnail_url || null, title: data.title || null });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
