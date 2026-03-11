export const stripHtml = (html) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const ALLOWED = new Set(["B","STRONG","I","EM","U","UL","OL","LI","H3","P","BR","BLOCKQUOTE"]);
export const sanitizeNode = (node) => {
  if (node.nodeType !== 1) return;
  Array.from(node.attributes).forEach(a => node.removeAttribute(a.name));
  if (!ALLOWED.has(node.tagName)) {
    const isBlock = ["DIV","SECTION","ARTICLE","HEADER","FOOTER","SPAN","FONT","TABLE","TR","TD","TH","TBODY"].includes(node.tagName);
    const frag = document.createDocumentFragment();
    Array.from(node.childNodes).forEach(c => frag.appendChild(c.cloneNode(true)));
    if (isBlock) {
      const p = document.createElement("p");
      p.appendChild(frag);
      node.replaceWith(p);
      Array.from(p.childNodes).forEach(sanitizeNode);
      return;
    }
    node.replaceWith(frag);
    return;
  }
  Array.from(node.childNodes).forEach(sanitizeNode);
};
export const sanitizeHtml = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  Array.from(div.childNodes).forEach(sanitizeNode);
  return div.innerHTML;
};

export const getDriveId = (url = "") => {
  const m = url.match(/\/file\/d\/([^/?#]+)/);
  return m ? m[1] : null;
};

export function loadSolicitudUrl() {
  return localStorage.getItem("solicitudUrl") || "";
}
export function saveSolicitudUrl(url) {
  localStorage.setItem("solicitudUrl", url);
}

export function loadProductContent(product) {
  try { return JSON.parse(localStorage.getItem(`product_${product}`) || "{}"); } catch { return {}; }
}
export function saveProductContent(product, data) {
  localStorage.setItem(`product_${product}`, JSON.stringify(data));
}

export function loadJiraConfig() {
  try { return JSON.parse(localStorage.getItem("jiraConfig") || "{}"); } catch { return {}; }
}
export function saveJiraConfig(cfg) {
  localStorage.setItem("jiraConfig", JSON.stringify(cfg));
}
