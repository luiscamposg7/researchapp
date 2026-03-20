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

    if (!data.thumbnail_url) return res.json({ thumbnail_url: null, title: data.title || null });

    // Proxy the image so browser doesn't hit Figma CDN auth restrictions
    const img = await fetch(data.thumbnail_url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!img.ok) return res.json({ thumbnail_url: null, title: data.title || null });

    const contentType = img.headers.get('content-type') || 'image/png';
    const buffer = await img.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(Buffer.from(buffer));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
