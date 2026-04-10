module.exports = async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url" });

  try {
    let thumbUrl = null;
    const isSlidesOrDeck = /figma\.com\/(slides|deck)\//.test(url);
    const figmaToken = process.env.FIGMA_TOKEN;

    if (isSlidesOrDeck && figmaToken) {
      const m = url.match(/figma\.com\/(?:slides|deck)\/([^/?#]+)/);
      const fileKey = m?.[1];
      if (fileKey) {
        const apiRes = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
          headers: { 'X-FIGMA-TOKEN': figmaToken, 'Accept': 'application/json' }
        });
        if (apiRes.ok) {
          const data = await apiRes.json();
          thumbUrl = data.thumbnailUrl || null;
        }
      }
    } else {
      const oembedRes = await fetch(`https://www.figma.com/api/oembed?url=${encodeURIComponent(url)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
      });
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        thumbUrl = data.thumbnail_url || null;
      }
    }

    if (!thumbUrl) return res.status(404).json({ error: "No thumbnail available" });

    const imgRes = await fetch(thumbUrl, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/*' } });
    if (!imgRes.ok) return res.status(imgRes.status).json({ error: "Failed to fetch thumbnail" });

    res.setHeader('Content-Type', imgRes.headers.get('content-type') || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.end(Buffer.from(await imgRes.arrayBuffer()));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
