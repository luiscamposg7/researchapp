module.exports = async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url" });

  try {
    // First get the thumbnail_url from oEmbed
    const oembedUrl = `https://www.figma.com/api/oembed?url=${encodeURIComponent(url)}`;
    const oembedRes = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    if (!oembedRes.ok) return res.status(oembedRes.status).json({ error: "Figma oEmbed failed" });
    const data = await oembedRes.json();

    const thumbUrl = data.thumbnail_url;
    if (!thumbUrl) return res.status(404).json({ error: "No thumbnail available" });

    // Proxy the image
    const imgRes = await fetch(thumbUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/*' }
    });
    if (!imgRes.ok) return res.status(imgRes.status).json({ error: "Failed to fetch thumbnail" });

    const contentType = imgRes.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const buffer = await imgRes.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
