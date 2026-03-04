import { useState, useEffect, useRef, useCallback } from "react";

const PRODUCTS = ["PGH", "Factoring", "Gestora", "Tandia", "Recadia", "Cambio Seguro"];
const TYPES = ["Tipo de entregable", "Research", "Otros entregables", "Pruebas de usabilidad", "Buyer Persona"];

const ESTADOS = ["Persona asignada", "Ana R.", "Sofia K.", "Luis M.", "Carlos T."];

function CustomSelect({ value, onChange, options, dark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative flex-shrink-0" style={{ width: 180 }}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between pl-3.5 pr-3 text-sm font-medium rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 ${dark ? "bg-gray-800 border border-gray-700 text-gray-200" : "text-gray-700"}`}
        style={!dark ? { height:"40px", borderRadius:"8px", border:"1px solid #D5D7DA", background:"#FFF", boxShadow:"0 1px 2px 0 rgba(10,13,18,0.05)" } : { height:"40px", borderRadius:"8px", boxShadow:"0 1px 2px 0 rgba(10,13,18,0.05)" }}
      >
        <span className="truncate">{selected.label}</span>
        <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${open ? "rotate-180" : ""} ${dark ? "text-gray-400" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          className={`absolute z-50 w-full mt-1 py-1 text-sm ${dark ? "bg-gray-800 border-gray-700 text-gray-200" : "text-gray-700 bg-white"}`}
          style={{ borderRadius:"8px", border:"1px solid #D5D7DA", boxShadow:"0 1px 2px 0 rgba(10,13,18,0.05)", top:"100%", left:0 }}
        >
          {options.map(o => (
            <li
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`px-3.5 py-2 cursor-pointer ${value === o.value
                ? (dark ? "bg-green-900/30 text-green-400" : "bg-green-50 text-green-700 font-medium")
                : (dark ? "hover:bg-gray-700" : "hover:bg-gray-50")
              }`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
const NAV = [
  { label: "Todos los entregables", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", active: true },
  { label: "Research", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", active: false },
  { label: "Otros entregables", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 13l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 10V9", active: false },
  { label: "Pruebas de usabilidad", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", active: false },
  { label: "Buyer Persona", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", active: false },
];

const stripHtml = (html) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const ALLOWED = new Set(["B","STRONG","I","EM","U","UL","OL","LI","H3","P","BR","BLOCKQUOTE"]);
const sanitizeNode = (node) => {
  if (node.nodeType !== 1) return; // text nodes: leave as-is
  // Strip all attributes (style, color, class, font, etc.)
  Array.from(node.attributes).forEach(a => node.removeAttribute(a.name));
  // Replace disallowed block tags with their text content wrapped in <p>
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
const sanitizeHtml = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  Array.from(div.childNodes).forEach(sanitizeNode);
  return div.innerHTML;
};

const getDriveId = (url = "") => {
  const m = url.match(/\/file\/d\/([^/?#]+)/);
  return m ? m[1] : null;
};

const TYPE_COLORS = { "Research": "amber", "Otros entregables": "violet", "Pruebas de usabilidad": "blue", "Buyer Persona": "green" };
const METODOLOGIAS = ["Cualitativa", "Cuantitativa", "Mixta", "Desk Research"];
const JIRA_STATUSES = ["EN CURSO", "FINALIZADO"];
const STATUSES = ["Borrador", "En revisión", "Publicado"];
const TEAM_MEMBERS = ["Ana R.", "Sofia K.", "Luis M.", "Carlos T."];

const INITIAL_DELIVERABLES = [
  {
    id: 1,
    title: "Buyer, User y Arquetipos",
    type: "Research",
    typeColor: "amber",
    date: "Nov 06, 2025",
    metodologia: "Cualitativa",
    jira: "UX-2095: TANDIA: PC10 Roadmap del Us. en Buyer y Arquetipos de un producto",
    jiraStatus: "FINALIZADO",
    team: ["Cristian G."],
    tags: ["Tandia"],
    objetivo: "Definir el Buyer Persona, User Persona y Arquetipos de Tandia.",
    usuario: "Clientes activos de Tandia de los meses de Julio a Setiembre pertenecientes a los tres planes: facturador, pyme y full. Se realizó una separación en dos grupos: Dueños de negocio (enfocados al Buyer y User en ciertos casos) y Personal del negocio (enfocado en el User).",
    hallazgos: "Para los dueños de negocio, se identificaron 3 Buyer Persona y 3 arquetipos. El riesgo es transversal a todos los negocios, sin embargo, los dueños buscan formas de mitigar ese riesgo. Una de esas formas es teniendo orden e información sobre su emprendimiento. Sin negocio, los clientes son organismos vivos, donde su necesidad de orden e información va evolucionando.",
    status: "Publicado",
    archivo: "Buyer, User y Arquetipos — Presentación.pdf",
  },
  {
    id: 2,
    title: "Motivos de abandono y valor percibido",
    type: "Research",
    typeColor: "amber",
    date: "Jul 11, 2025",
    metodologia: "Mixta",
    jira: "UX-1710: TANDIA: Valor percibido por clientes activos",
    jiraStatus: "FINALIZADO",
    team: ["Cristian G."],
    tags: ["Tandia"],
    objetivo: "Conocer los aspectos más valorados de los clientes sobre la plataforma de Tandia, los motivos por los cuales los clientes han decidido dejar de usar el producto, y tomar decisiones en torno a la continuidad y desarrollo del producto.",
    usuario: "Clientes de Tandia activos en el último año y clientes que cesaron su contrato en el último año.",
    hallazgos: "Si bien el 89% de comentarios rescatados perciben valor en la rapidez y facilidad de uso de la plataforma, la mayoría de los usuarios solo le dan uso a los módulos de Clientes, Productos y Ventas. El 45% de los motivos de abandono están relacionados con la insatisfacción con la plataforma y que los aspectos de mejora están relacionados a aspectos que van más allá de esa funcionalidad.",
    status: "Publicado",
    archivo: "Presentación — Motivos de abandono y Valor percibido.pdf",
  },
  {
    id: 3,
    title: "Gestión de roles",
    type: "Research",
    typeColor: "amber",
    date: "May 07, 2025",
    metodologia: "Cuantitativa",
    jira: "UX-1523: Gestión de roles y funcionalidad de Tandia",
    jiraStatus: "FINALIZADO",
    team: ["Cristian G."],
    tags: ["Tandia"],
    objetivo: "Validar el interés de clientes de Tandia en poder gestionar los permisos y accesos de los roles por su cuenta.",
    usuario: "Clientes de Tandia en planes PYME.",
    hallazgos: "La funcionalidad de cambiar los roles de manera autónoma es un nice-to-have: puede ser algo deseable, pero no es esencial según sus necesidades. Hay posibilidad de enfocarse en los puntos de mejora mencionados por los clientes, los cuales impactan en el uso diario de la plataforma.",
    status: "Publicado",
    archivo: "Research — Gestión de roles.pdf",
  },
  {
    id: 4,
    title: "Flujo de solicitud — Crédito hipotecario",
    type: "Pruebas de usabilidad",
    typeColor: "blue",
    date: "Feb 14, 2025",
    metodologia: "Cualitativa",
    jira: "UX-1840: Flujo solicitud crédito hipotecario",
    jiraStatus: "FINALIZADO",
    team: ["Ana R.", "Luis M."],
    tags: ["Créditos Hipotecarios"],
    objetivo: "Evaluar el flujo de solicitud de crédito hipotecario e identificar fricciones en el proceso de validación de identidad.",
    usuario: "Personas naturales entre 28 y 55 años con intención de adquirir un crédito hipotecario en los próximos 6 meses.",
    hallazgos: "Se detectaron fricciones en el paso de validación de identidad. 3 de 8 participantes no completaron el flujo sin asistencia. La pantalla de confirmación genera confusión respecto al siguiente paso.",
    status: "Publicado",
    archivo: "Prueba de usabilidad — Crédito hipotecario.pdf",
  },
  {
    id: 5,
    title: "Research — Experiencia de onboarding deudores",
    type: "Research",
    typeColor: "amber",
    date: "Dic 03, 2024",
    metodologia: "Cualitativa",
    jira: "UX-1692: Onboarding deudores Recadia",
    jiraStatus: "FINALIZADO",
    team: ["Luis M.", "Carlos T."],
    tags: ["Recadia"],
    objetivo: "Comprender la experiencia de primer contacto y proceso de registro de deudores en la plataforma Recadia.",
    usuario: "Deudores que recibieron una notificación de cobranza en los últimos 3 meses y accedieron por primera vez a la plataforma.",
    hallazgos: "El 70% de los participantes no entendió el propósito de la plataforma en el primer acceso. El lenguaje legal genera ansiedad. La falta de información sobre el proceso completo es el principal punto de abandono.",
    status: "Publicado",
    archivo: "Research — Onboarding deudores.pdf",
  },
  {
    id: 6,
    title: "Buyer Persona — Segmento PYME",
    type: "Buyer Persona",
    typeColor: "green",
    date: "Nov 21, 2024",
    metodologia: "Mixta",
    jira: "UX-1600: Buyer Persona PYME — Préstamos Hipotecarios",
    jiraStatus: "FINALIZADO",
    team: ["Sofia K.", "Carlos T.", "Ana R."],
    tags: ["Préstamos con Garantía Hipotecaria"],
    objetivo: "Definir el perfil del cliente PYME que solicita financiamiento con garantía hipotecaria.",
    usuario: "Dueños de PYME que han solicitado o evaluado un préstamo con garantía hipotecaria en el último año.",
    hallazgos: "Se identificaron 2 perfiles principales: el empresario consolidado que busca expansión y el empresario en crisis que busca liquidez. Ambos perfiles valoran la rapidez y la claridad en las condiciones del préstamo por encima de la tasa de interés.",
    status: "Publicado",
    archivo: "Buyer Persona — Segmento PYME.pdf",
  },
  {
    id: 7,
    title: "Benchmark — Plataformas tipo de cambio digital",
    type: "Otros entregables",
    typeColor: "violet",
    date: "Ago 05, 2024",
    metodologia: "Desk Research",
    jira: "UX-1450: Benchmark Cambio Seguro",
    jiraStatus: "FINALIZADO",
    team: ["Carlos T."],
    tags: ["Cambio Seguro"],
    objetivo: "Analizar las principales plataformas de tipo de cambio digital para identificar oportunidades de diferenciación.",
    usuario: "No aplica — investigación de escritorio.",
    hallazgos: "Se analizaron 6 plataformas competidoras. Las principales oportunidades de diferenciación están en la transparencia de comisiones, la velocidad de transferencia y las notificaciones en tiempo real. Ningún competidor ofrece historial de operaciones exportable.",
    status: "Publicado",
    archivo: "Benchmark — Tipo de cambio digital.pdf",
  },
  {
    id: 8,
    title: "Research — Perfil del arrendatario digital",
    type: "Research",
    typeColor: "amber",
    date: "Jun 14, 2024",
    metodologia: "Cualitativa",
    jira: "UX-1380: Perfil arrendatario Tandia API",
    jiraStatus: "EN CURSO",
    team: ["Sofia K."],
    tags: ["Tandia API"],
    objetivo: "Explorar los modelos mentales y expectativas de arrendatarios que utilizan plataformas digitales por primera vez.",
    usuario: "Arrendatarios de locales comerciales entre 25 y 45 años que han comenzado a usar herramientas digitales de gestión en el último año.",
    hallazgos: "Los arrendatarios priorizan la simplicidad sobre la funcionalidad avanzada. El principal temor es perder el control de la información de sus clientes. La integración con herramientas conocidas (WhatsApp, email) es clave para la adopción.",
    status: "En revisión",
    archivo: "Research — Perfil arrendatario digital.pdf",
  },
  {
    id: 9,
    title: "Journey Map — Inversionista primera inversión",
    type: "Otros entregables",
    typeColor: "violet",
    date: "Ene 10, 2025",
    metodologia: "Cualitativa",
    jira: "UX-1750: Journey Map Gestora de Fondos",
    jiraStatus: "FINALIZADO",
    team: ["Sofia K.", "Ana R."],
    tags: ["Gestora de Fondos"],
    objetivo: "Mapear el proceso completo del inversionista desde el primer contacto hasta la confirmación de su primera inversión.",
    usuario: "Personas naturales con capital disponible para invertir que nunca han usado una gestora de fondos digital.",
    hallazgos: "El proceso de KYC (Know Your Customer) es el principal punto de abandono. Los inversionistas necesitan confirmación constante de que su dinero está seguro. La falta de un resumen claro del producto antes de invertir genera desconfianza.",
    status: "Publicado",
    archivo: "Journey Map — Primera inversión.pdf",
  },
  { id: 10, title: "Research — Nuevas funcionalidades Factoring", type: "Research", typeColor: "amber", date: "Mar 01, 2026", metodologia: "Cualitativa", jira: "UX-2210: Factoring nuevas funcionalidades", jiraStatus: "EN CURSO", team: ["Ana R."], tags: ["Factoring"], objetivo: "Explorar las necesidades de los clientes actuales respecto a nuevas funcionalidades del módulo de factoring.", usuario: "Clientes activos del módulo Factoring con más de 6 meses de uso.", hallazgos: "Investigación en curso.", status: "Borrador", archivo: "Research — Factoring funcionalidades.pdf" },
  { id: 11, title: "Buyer Persona — Segmento millennials Cambio Seguro", type: "Buyer Persona", typeColor: "green", date: "Feb 20, 2026", metodologia: "Mixta", jira: "UX-2198: Buyer Persona Cambio Seguro millennials", jiraStatus: "EN CURSO", team: ["Sofia K.", "Carlos T."], tags: ["Cambio Seguro"], objetivo: "Definir el perfil del cliente millennial que utiliza plataformas de tipo de cambio digital.", usuario: "Personas entre 25 y 35 años que realizan operaciones de cambio de divisas al menos una vez al mes.", hallazgos: "En proceso de análisis.", status: "Borrador", archivo: "Buyer Persona — Cambio Seguro millennials.pdf" },
];

// ── RICH EDITOR ──
function RichEditor({ onChange, placeholder, dark }) {
  const ref = useRef(null);
  const [active, setActive] = useState({});

  const exec = useCallback((cmd, val) => {
    ref.current.focus();
    document.execCommand(cmd, false, val ?? null);
    ref.current.focus();
    updateActive();
  }, []);

  const updateActive = () => {
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
    });
  };

  const handleInput = () => {
    onChange(ref.current.innerHTML);
    updateActive();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    const clean = html ? sanitizeHtml(html) : text.replace(/\n/g, "<br>");
    document.execCommand("insertHTML", false, clean);
    onChange(ref.current.innerHTML);
  };

  const btn = (cmd, label, title) => (
    <button type="button" title={title}
      onMouseDown={e => { e.preventDefault(); exec(cmd); }}
      className={`w-7 h-7 flex items-center justify-center rounded text-sm font-medium transition-colors ${
        active[cmd === "insertUnorderedList" ? "ul" : cmd === "insertOrderedList" ? "ol" : cmd]
          ? "bg-green-100 text-green-700"
          : dark ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"
      }`}>
      {label}
    </button>
  );

  const divider = <div className={`w-px h-4 mx-1 ${dark ? "bg-gray-600" : "bg-gray-300"}`} />;

  return (
    <div className={`rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-400 ${dark ? "border border-gray-700 bg-gray-800" : "border border-gray-300 bg-white"}`}>
      <div className={`flex items-center gap-0.5 px-2 py-1 border-b ${dark ? "border-gray-700 bg-gray-850" : "border-gray-200 bg-gray-50"}`}>
        {btn("bold",   <strong>B</strong>, "Negrita")}
        {btn("italic", <em>I</em>,         "Cursiva")}
        {divider}
        {btn("insertUnorderedList",
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>,
          "Lista con viñetas")}
        {btn("insertOrderedList",
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10M3 8h.01M3 12h.01M3 16h.01"/></svg>,
          "Lista numerada")}
        {divider}
        <button type="button" title="Encabezado"
          onMouseDown={e => { e.preventDefault(); exec("formatBlock", "<h3>"); }}
          className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors ${dark ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>H</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyUp={updateActive}
        onMouseUp={updateActive}
        data-placeholder={placeholder}
        className={`min-h-[88px] px-3 py-2 text-sm focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:pointer-events-none ${dark ? "text-gray-200 empty:before:text-gray-500" : "text-gray-900 empty:before:text-gray-400"}`}
      />
    </div>
  );
}

// ── JIRA CONFIG (persisted) ──
function loadJiraConfig() {
  try { return JSON.parse(localStorage.getItem("jiraConfig") || "{}"); } catch { return {}; }
}
function saveJiraConfig(cfg) {
  localStorage.setItem("jiraConfig", JSON.stringify(cfg));
}

// ── SETTINGS MODAL ──
function SettingsModal({ onClose, dark }) {
  const d = dark;
  const [cfg, setCfg] = useState(loadJiraConfig);
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null | 'loading' | 'ok' | 'error'
  const [testMsg, setTestMsg] = useState("");

  const handleSave = () => {
    saveJiraConfig({
      baseUrl: (cfg.baseUrl || "").trim().replace(/\/$/, ""),
      email:   (cfg.email   || "").trim(),
      token:   (cfg.token   || "").trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    if (!cfg.baseUrl || !cfg.email || !cfg.token) {
      setTestStatus("error"); setTestMsg("Completa todos los campos primero."); return;
    }
    setTestStatus("loading"); setTestMsg("");
    try {
      const base = cfg.baseUrl.replace(/\/$/, "");
      const auth = btoa(`${cfg.email.trim()}:${cfg.token.trim()}`);
      const res = await fetch("/api/jira/_test", {
        headers: { "x-jira-base": base, "x-jira-auth": auth },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errorMessages?.[0] || data.message || data.error || data.detail || `HTTP ${res.status}`);
      setTestStatus("ok");
      setTestMsg(`Conectado como ${data.displayName} (${data.emailAddress})`);
    } catch (e) {
      setTestStatus("error"); setTestMsg(e.message);
    }
  };

  const inp = `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 ${d ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`;
  const lbl = `block text-xs font-semibold mb-1 ${d ? "text-gray-400" : "text-gray-600"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className={`w-full max-w-md rounded-2xl shadow-2xl ${d ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${d ? "border-gray-800" : "border-gray-200"}`}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3" strokeWidth={2}/></svg>
            <h2 className={`text-lg font-bold ${d ? "text-gray-100" : "text-gray-900"}`}>Configuración</h2>
          </div>
          <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-lg ${d ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className={`text-sm font-semibold mb-3 flex items-center gap-2 ${d ? "text-gray-200" : "text-gray-800"}`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 11.513H0a5.218 5.218 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.575 24V12.518a1.005 1.005 0 00-1.004-1.005zm5.723-5.756H5.736a5.215 5.215 0 005.215 5.214h2.129v2.058a5.218 5.218 0 005.215 5.214V6.758a1.001 1.001 0 00-1.001-1.001zM23.013 0H11.459a5.215 5.215 0 005.215 5.215h2.129v2.057A5.215 5.215 0 0024 12.483V1.005A1.001 1.001 0 0023.013 0z"/></svg>
              Conexión Jira
            </p>
            <div className="space-y-3">
              <div>
                <label className={lbl}>URL base de Jira</label>
                <input className={inp} placeholder="https://empresa.atlassian.net" value={cfg.baseUrl || ""} onChange={e => setCfg(c => ({ ...c, baseUrl: e.target.value }))} />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input className={inp} type="email" placeholder="tu@empresa.com" value={cfg.email || ""} onChange={e => setCfg(c => ({ ...c, email: e.target.value }))} />
              </div>
              <div>
                <label className={lbl}>API Token</label>
                <input className={inp} type="password" placeholder="••••••••••••••••" value={cfg.token || ""} onChange={e => setCfg(c => ({ ...c, token: e.target.value }))} />
                <p className={`mt-1 text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>
                  Genera tu token en{" "}
                  <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noreferrer" className={`font-semibold underline ${d ? "text-green-400" : "text-green-600"}`}>
                    id.atlassian.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test result */}
        {testStatus && (
          <div className={`mx-6 mb-4 px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
            testStatus === 'loading' ? (d ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500") :
            testStatus === 'ok'      ? (d ? "bg-green-900/40 text-green-400" : "bg-green-50 text-green-700") :
                                       (d ? "bg-red-900/40 text-red-400"   : "bg-red-50 text-red-700")
          }`}>
            {testStatus === 'loading' && <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
            {testStatus === 'ok'      && <span>✓</span>}
            {testStatus === 'error'   && <span>✗</span>}
            <span>{testStatus === 'loading' ? 'Probando conexión...' : testMsg}</span>
          </div>
        )}

        {/* Footer */}
        <div className={`flex justify-end gap-3 px-6 py-4 border-t ${d ? "border-gray-800" : "border-gray-200"}`}>
          <button onClick={handleTest} className={`px-4 py-2 text-sm font-medium rounded-lg border ${d ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
            Probar conexión
          </button>
          <button onClick={onClose} className={`px-4 py-2 text-sm font-medium rounded-lg border ${d ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white rounded-lg min-w-[120px]" style={{ backgroundColor: "#00CB75" }}>
            {saved ? "✓ Guardado" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ADD MODAL ──
function AddModal({ onClose, onSave, dark }) {
  const d = dark;
  const today = new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
  const [form, setForm] = useState({
    title: "", type: "Research", metodologia: "Cualitativa",
    jira: "", jiraUrl: "", jiraStatus: "EN CURSO",
    team: [], tags: [],
    descripcion: "",
    objetivo: "", usuario: "", hallazgos: "",
    status: "Borrador", archivo: "", archivoUrl: "",
  });
  const [jiraLoading, setJiraLoading] = useState(false);
  const [jiraError, setJiraError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleJiraUrl = async (url) => {
    set("jiraUrl", url);
    setJiraError("");
    const match = url.match(/\/browse\/([A-Z]+-\d+)/i);
    if (!match) return;
    const key = match[1].toUpperCase();
    set("jira", key);
    const cfg = loadJiraConfig();
    if (!cfg.email || !cfg.token) {
      setJiraError("Configura tus credenciales en Configuración (⚙️) del menú.");
      return;
    }
    const base = (cfg.baseUrl || url.split("/browse/")[0]).replace(/\/$/, "");
    setJiraLoading(true);
    try {
      const auth = btoa(`${cfg.email.trim()}:${cfg.token.trim()}`);
      const res = await fetch(`/api/jira/${key}`, {
        headers: { "x-jira-base": base, "x-jira-auth": auth },
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.errorMessages?.[0] || data.error || `HTTP ${res.status}`);
      set("jira", `${key}: ${data.fields.summary}`);
      const statusName = data.fields?.status?.name || "";
      const done = /done|closed|resolved|finaliz|complet/i.test(statusName);
      set("jiraStatus", statusName || (done ? "FINALIZADO" : "EN CURSO"));
      setJiraError("");
    } catch (e) {
      setJiraError(`No se pudo obtener el ticket (${e.message}).`);
    } finally {
      setJiraLoading(false);
    }
  };
  const toggleArr = (k, v) => setForm(f => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v],
  }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({
      ...form,
      id: Date.now(),
      isCustom: true,
      typeColor: TYPE_COLORS[form.type] || "amber",
      date: today,
      tags: form.tags.length ? form.tags : ["Sin producto"],
      team: form.team.length ? form.team : ["Sin asignar"],
      archivo: form.archivo.trim() || `${form.title}.pdf`,
    });
    onClose();
  };

  const inp = `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 ${d ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`;
  const lbl = `block text-xs font-semibold mb-1 ${d ? "text-gray-400" : "text-gray-600"}`;
  const sec = `rounded-xl border p-4 ${d ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${d ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${d ? "border-gray-800" : "border-gray-200"}`}>
          <h2 className={`text-lg font-bold ${d ? "text-gray-100" : "text-gray-900"}`}>Añadir entregable</h2>
          <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-lg ${d ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Título */}
          <div>
            <label className={lbl}>Título <span className="text-red-400">*</span></label>
            <input className={inp} placeholder="Nombre del entregable" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>

          {/* Tipo + Metodología */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Tipo de entregable</label>
              <select className={inp} value={form.type} onChange={e => set("type", e.target.value)}>
                {TYPES.slice(1).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Metodología</label>
              <select className={inp} value={form.metodologia} onChange={e => set("metodologia", e.target.value)}>
                {METODOLOGIAS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Jira */}
          <div className={sec}>
            <label className={lbl}>URL de Jira</label>
            <div className="relative mb-3">
              <input className={inp} type="url"
                placeholder="https://empresa.atlassian.net/browse/UX-0000"
                value={form.jiraUrl} onChange={e => handleJiraUrl(e.target.value)} />
              {jiraLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 animate-spin text-green-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                </div>
              )}
            </div>
            {jiraError && <p className="mb-2 text-xs text-amber-500">{jiraError}</p>}
            {form.jira && !jiraLoading && (
              <div className={`rounded-lg border p-3 ${d ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
                <p className={`text-sm font-semibold leading-snug ${d ? "text-gray-100" : "text-gray-800"}`}>{form.jira}</p>
                {form.jiraStatus && (
                  <span className={`inline-block mt-1.5 text-xs font-bold px-2 py-0.5 rounded border ${
                    /done|closed|resolved|finaliz|complet/i.test(form.jiraStatus)
                      ? (d ? "text-green-400 border-green-700 bg-green-900/40" : "text-green-700 border-green-200 bg-green-50")
                      : (d ? "text-blue-400 border-blue-700 bg-blue-900/40" : "text-blue-700 border-blue-200 bg-blue-50")
                  }`}>{form.jiraStatus}</span>
                )}
                <button
                  type="button"
                  onClick={() => { set("jira", ""); set("jiraStatus", ""); set("jiraUrl", ""); }}
                  className={`block mt-2 text-xs ${d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
                  Cambiar ticket
                </button>
              </div>
            )}
          </div>

          {/* Producto */}
          <div>
            <label className={lbl}>Producto</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {PRODUCTS.map(p => (
                <button key={p} type="button"
                  onClick={() => toggleArr("tags", p)}
                  className={`px-3 py-1 rounded-full text-sm border font-medium transition-colors ${form.tags.includes(p) ? "border-green-500 text-green-600 bg-green-50" : (d ? "border-gray-700 text-gray-400 hover:border-gray-500" : "border-gray-300 text-gray-500 hover:border-gray-400")}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Equipo */}
          <div>
            <label className={lbl}>Equipo asignado</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {TEAM_MEMBERS.map((name, i) => (
                <button key={name} type="button"
                  onClick={() => toggleArr("team", name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border font-medium transition-colors ${form.team.includes(name) ? "border-green-500 text-green-600 bg-green-50" : (d ? "border-gray-700 text-gray-400 hover:border-gray-500" : "border-gray-300 text-gray-500 hover:border-gray-400")}`}>
                  <Avatar name={name} index={i} dark={d} />
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Textos */}
          <div>
            <label className={lbl}>Descripción corta <span className={`font-normal ${d ? "text-gray-600" : "text-gray-400"}`}>— extracto del card</span></label>
            <textarea className={`${inp} resize-none`} rows={2} placeholder="Una o dos oraciones que resumen el entregable..." value={form.descripcion} onChange={e => set("descripcion", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Objetivo del research</label>
            <RichEditor dark={d} value={form.objetivo} onChange={v => set("objetivo", v)} placeholder="¿Qué se busca lograr con este entregable?" />
          </div>
          <div>
            <label className={lbl}>Usuario</label>
            <RichEditor dark={d} value={form.usuario} onChange={v => set("usuario", v)} placeholder="Perfil de los usuarios involucrados" />
          </div>
          <div>
            <label className={lbl}>Hallazgos y conclusiones</label>
            <RichEditor dark={d} value={form.hallazgos} onChange={v => set("hallazgos", v)} placeholder="Principales hallazgos o estado actual" />
          </div>

          {/* Estado + Archivo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Estado</label>
              <select className={inp} value={form.status} onChange={e => set("status", e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Nombre del archivo</label>
              <input className={inp} placeholder="Presentación.pdf" value={form.archivo} onChange={e => set("archivo", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={lbl}>Link de Google Drive</label>
            <input className={inp} type="url" placeholder="https://drive.google.com/file/d/.../view"
              value={form.archivoUrl} onChange={e => {
                const url = e.target.value;
                set("archivoUrl", url);
                const id = getDriveId(url);
                if (id) {
                  fetch(`/api/gdrive/${id}`)
                    .then(r => r.json())
                    .then(data => { if (data.title) set("archivo", data.title); })
                    .catch(() => {});
                }
              }} />
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-3 px-6 py-4 border-t ${d ? "border-gray-800" : "border-gray-200"}`}>
          <button onClick={onClose} className={`px-4 py-2 text-sm font-medium rounded-lg border ${d ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!form.title.trim()} className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-40" style={{ backgroundColor: "#00CB75" }}>
            Guardar entregable
          </button>
        </div>
      </div>
    </div>
  );
}

const avatarPalette = [
  { l: "bg-green-100 text-green-700", d: "bg-green-900 text-green-300" },
  { l: "bg-blue-100 text-blue-700", d: "bg-blue-900 text-blue-300" },
  { l: "bg-pink-100 text-pink-700", d: "bg-pink-900 text-pink-300" },
  { l: "bg-teal-100 text-teal-700", d: "bg-teal-900 text-teal-300" },
];

function Avatar({ name, index = 0, dark }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const p = avatarPalette[index % avatarPalette.length];
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${dark ? p.d + " border-gray-800" : p.l + " border-white"}`}>
      {initials}
    </div>
  );
}

function Badge({ label, typeColor, dark }) {
  const tm = {
    blue:   dark ? "bg-blue-900/60 text-blue-300 border border-blue-700"       : "bg-blue-50 text-blue-700 border border-blue-200",
    violet: dark ? "bg-teal-900/60 text-teal-300 border border-teal-700" : "bg-teal-50 text-teal-700 border border-teal-200",
    amber:  dark ? "bg-amber-900/60 text-amber-300 border border-amber-700"    : "bg-amber-50 text-amber-700 border border-amber-200",
    green:  dark ? "bg-teal-900/60 text-teal-300 border border-teal-700"       : "bg-teal-50 text-teal-700 border border-teal-200",
  };
  // Status badges: dot + label style with border, white/dark bg
  const statusDot = {
    "Publicado":   { dot: "bg-green-500",  text: dark ? "text-gray-200" : "text-gray-700" },
    "En revisión": { dot: "bg-orange-400", text: dark ? "text-gray-200" : "text-gray-700" },
    "Borrador":    { dot: "bg-gray-400",   text: dark ? "text-gray-200" : "text-gray-700" },
  };
  if (!typeColor && statusDot[label]) {
    const { dot, text } = statusDot[label];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium border ${dark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"} ${text}`}>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
        {label}
      </span>
    );
  }
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeColor ? tm[typeColor] : ""}`}>{label}</span>;
}

function Card({ item, onClick, dark }) {
  const d = dark;
  return (
    <div onClick={() => onClick(item)} className={`rounded-2xl border p-6 cursor-pointer group flex flex-col ${d ? "bg-gray-900 border-gray-700 hover:border-green-400 hover:shadow-lg hover:shadow-black/30" : "bg-white border-gray-200 hover:shadow-md hover:border-green-400/40"}`}>
      <div className="flex items-start justify-between mb-4">
        <Badge label={item.type} typeColor={item.typeColor} dark={d} />
        <Badge label={item.status} dark={d} />
      </div>
      <h3 className={`font-semibold text-lg leading-snug mb-3 ${d ? "text-gray-100 group-hover:text-green-600" : "text-gray-900 group-hover:text-green-700"}`}>{item.title}</h3>
      <p className={`text-base leading-relaxed mb-4 line-clamp-2 flex-1 ${d ? "text-gray-400" : "text-gray-500"}`}>{item.descripcion || stripHtml(item.objetivo)}</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {item.tags.map(tag => <span key={tag} className={`text-sm rounded-lg px-2.5 py-1 border ${d ? "text-gray-400 bg-gray-800 border-gray-700" : "text-gray-500 bg-gray-50 border-gray-200"}`}>{tag}</span>)}
      </div>
      <div className={`flex items-center justify-between pt-4 border-t ${d ? "border-gray-800" : "border-gray-100"}`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${d ? "text-gray-500" : "text-gray-400"}`}>Asignado a:</span>
          <div className="flex -space-x-2">{item.team.map((name, i) => <Avatar key={name} name={name} index={i} dark={d} />)}</div>
        </div>
        <span className={`text-sm ${d ? "text-gray-500" : "text-gray-400"}`}>{item.date}</span>
      </div>
    </div>
  );
}

// ── DETAIL PAGE ──
function DetailPage({ item, onBack, onNavigate, dark, deliverables, onDelete }) {
  const d = dark;
  const related = deliverables.filter(r => r.id !== item.id && r.tags[0] === item.tags[0]).slice(0, 3);

  const jiraDone = /done|closed|resolved|finaliz|complet/i.test(item.jiraStatus || "");
  const entryJiraColor = (item.jiraStatus === "FINALIZADO" || jiraDone)
    ? (d ? "text-green-400 border-green-700 bg-green-900/40" : "text-green-700 border-green-200 bg-green-50")
    : (d ? "text-blue-400 border-blue-700 bg-blue-900/40" : "text-blue-700 border-blue-200 bg-blue-50");

  return (
    <div className={`flex-1 overflow-y-auto ${d ? "bg-gray-950" : "bg-gray-50"}`}>
      {/* Top bar */}
      <div className={`border-b px-8 py-4 sticky top-0 z-10 flex items-center justify-between ${d ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
        <button onClick={onBack} className={`flex items-center gap-2 text-sm font-medium ${d ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-900"}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a entregables
        </button>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg" style={{backgroundColor:"#00CB75"}}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver en Confluence
          </button>

        </div>
      </div>

      <div style={{maxWidth:"1600px", margin:"0 auto", width:"100%", paddingLeft:"2rem", paddingRight:"2rem", paddingTop:"2rem", paddingBottom:"2rem"}}>
        {/* Breadcrumb */}
        <div className={`flex items-center gap-2 text-sm mb-2 ${d ? "text-gray-500" : "text-gray-400"}`}>
          <span>Inicio</span><span>/</span>
          <span>{item.tags[0]}</span><span>/</span>
          <span className={d ? "text-gray-300" : "text-gray-700"}>{item.type}</span>
        </div>

        {/* Page title */}
        <div className="flex items-center gap-3 mb-2">
          <Avatar name={item.team[0]} index={0} dark={d} />
          <span className={`text-sm ${d ? "text-gray-400" : "text-gray-500"}`}>
            {item.team[0]} · {item.date}
          </span>
        </div>
        <h1 className={`text-3xl font-bold mb-8 ${d ? "text-gray-100" : "text-gray-900"}`}>{item.tags[0]}: {item.type}</h1>

        {/* All entregables stacked */}
        <div className="flex gap-8">
          {/* LEFT — file + metadata */}
          <div className="w-72 flex-shrink-0 space-y-5">
            {(() => {
              const driveId = getDriveId(item.archivoUrl || "");
              const thumbUrl = driveId ? `https://drive.google.com/thumbnail?id=${driveId}&sz=w400` : null;
              const openUrl = item.archivoUrl || null;
              return (
                <div className={`rounded-xl border overflow-hidden ${d ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} style={{boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
                  {/* Thumbnail row */}
                  <div className="flex" style={{minHeight:90}}>
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      {/* Drive icon + name */}
                      <div className="flex items-start gap-2">
                        {/* Google Drive color icon */}
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                          <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                          <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                          <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                          <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                          <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                          <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                        </svg>
                        <p className={`text-xs font-semibold leading-snug line-clamp-2 ${d ? "text-gray-100" : "text-gray-800"}`}>{item.archivo || "Archivo"}</p>
                      </div>
                      {/* Creado por */}
                      <p className={`text-xs mt-1 ${d ? "text-gray-500" : "text-gray-400"}`}>· Creado por {item.team?.[0] || "—"}</p>
                    </div>
                    {/* Thumbnail */}
                    {thumbUrl && (
                      <div className="w-20 flex-shrink-0 overflow-hidden" style={{background:"#4285f4"}}>
                        <img src={thumbUrl} alt="" className="w-full h-full object-cover" style={{minHeight:90}}
                          onError={e => { e.target.parentElement.style.display = "none"; }} />
                      </div>
                    )}
                  </div>
                  {/* Footer */}
                  <div className={`flex items-center justify-between px-3 py-2 border-t ${d ? "border-gray-700" : "border-gray-100"}`}>
                    <svg className="w-14" viewBox="0 0 87.3 24" xmlns="http://www.w3.org/2000/svg">
                      <text y="18" fontSize="18" fontFamily="sans-serif" fill={d ? "#9ca3af" : "#5f6368"} fontWeight="500">Drive</text>
                    </svg>
                    <a href={openUrl || "#"} target={openUrl ? "_blank" : undefined} rel="noreferrer"
                      className={`text-xs font-semibold px-3 py-1 rounded-lg border ${d ? "border-gray-600 text-green-400 hover:bg-gray-700" : "border-gray-200 text-green-600 hover:bg-gray-50"}`}>
                      Abrir archivo
                    </a>
                  </div>
                </div>
              );
            })()}
            <div className="space-y-3">
              <div>
                <p className={`text-xs font-semibold mb-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Fecha</p>
                <p className={`text-sm ${d ? "text-gray-300" : "text-gray-700"}`}>{item.date}</p>
              </div>
              <div>
                <p className={`text-xs font-semibold mb-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Metodología</p>
                <p className={`text-sm ${d ? "text-gray-300" : "text-gray-700"}`}>{item.metodologia}</p>
              </div>
              <div>
                <p className={`text-xs font-semibold mb-1 ${d ? "text-gray-500" : "text-gray-400"}`}>Link de Jira</p>
                <a
                  className={`text-sm font-semibold leading-snug block mb-1.5 break-words ${d ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"} ${item.jiraUrl ? "underline" : "pointer-events-none"}`}
                  href={item.jiraUrl || "#"}
                  target={item.jiraUrl ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {item.jira || item.jiraUrl || "—"}
                </a>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${entryJiraColor}`}>{item.jiraStatus}</span>
              </div>
              {item.isCustom && (
                <div className={`mt-6 pt-4 border-t ${d ? "border-gray-700" : "border-gray-200"}`}>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar entregable
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — content */}
          <div className="flex-1 min-w-0 space-y-6">
            {item.descripcion && (
              <div>
                <h3 className={`text-base font-bold mb-2 ${d ? "text-gray-100" : "text-gray-900"}`}>Descripción corta</h3>
                <p className={`text-base leading-relaxed ${d ? "text-gray-300" : "text-gray-600"}`}>{item.descripcion}</p>
              </div>
            )}
            <div>
              <h3 className={`text-base font-bold mb-2 ${d ? "text-gray-100" : "text-gray-900"}`}>Objetivo del research</h3>
              <div className={`rich-content text-base leading-relaxed ${d ? "text-gray-300" : "text-gray-600"}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.objetivo || "") }} />
            </div>
            <div>
              <h3 className={`text-base font-bold mb-2 ${d ? "text-gray-100" : "text-gray-900"}`}>Hallazgos y conclusiones</h3>
              <div className={`rich-content text-base leading-relaxed ${d ? "text-gray-300" : "text-gray-600"}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.hallazgos || "") }} />
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${d ? "text-gray-300" : "text-gray-700"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              Contenido relacionado
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {related.map(r => (
                <Card key={r.id} item={r} onClick={onNavigate} dark={d} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── LIST PAGE ──
function ListPage({ dark, setDark, onSelect, activeFilter, deliverables, onAdd }) {
  const dk = dark;
  const [localType, setLocalType] = useState("Tipo de entregable");
  const [product, setProduct] = useState("Todos los productos");
  const [estado, setEstado] = useState("Persona asignada");
  const [search, setSearch] = useState("");
  const [draftFilter, setDraftFilter] = useState("Tipo de entregable");
  const [draftProduct, setDraftProduct] = useState("Todos los productos");
  const [draftEstado, setDraftEstado] = useState("Persona asignada");
  const [draftSearch, setDraftSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Sync when sidebar changes activeFilter
  useEffect(() => {
    if (!activeFilter) return;
    const t = activeFilter.team ? "Tipo de entregable" : (activeFilter.type || "Tipo de entregable");
    setDraftFilter(t);
    setLocalType(t);
  }, [activeFilter]);

  const applyFilters = () => {
    setLocalType(draftFilter);
    setProduct(draftProduct);
    setSearch(draftSearch);
    setEstado(draftEstado);
  };

  const activeType = localType;
  const activeTeam = activeFilter?.team || null;

  const filtered = deliverables.filter(d => {
    const typeMatch = activeType === "Tipo de entregable" || d.type === activeType;
    const teamMatch = !activeTeam || d.team.includes(activeTeam);
    const productMatch = product === "Todos los productos" || d.tags.includes(product);
    const estadoMatch = estado === "Persona asignada" || d.team.includes(estado);
    const searchMatch = !search || d.title.toLowerCase().includes(search.toLowerCase());
    return typeMatch && teamMatch && productMatch && estadoMatch && searchMatch;
  });

  const s = {
    panel:     dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
    div:       dk ? "border-gray-800" : "border-gray-100",
    p1:        dk ? "text-gray-100" : "text-gray-900",
    p2:        dk ? "text-gray-400" : "text-gray-500",
    muted:     dk ? "text-gray-600" : "text-gray-400",
    navOn:     dk ? "text-green-500" : "text-green-700",
    navOff:    dk ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-50",
    input:     dk ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400",
    sel:       dk ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-700",
    tHover:    dk ? "hover:bg-gray-800" : "hover:bg-gray-50",
    emptyBox:  dk ? "bg-gray-800" : "bg-gray-100",
  };

  return (
    <>
      {showModal && <AddModal dark={dk} onClose={() => setShowModal(false)} onSave={onAdd} />}
      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        <div className={`border-b py-5 sticky top-0 z-10 ${s.panel}`}><div style={{maxWidth:"1600px", margin:"0 auto", paddingLeft:"2rem", paddingRight:"2rem"}}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className={`text-2xl font-bold ${s.p1}`}>Todos los entregables</h1>
              <p className={`text-base ${s.p2}`}>{filtered.length} entregables encontrados</p>
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-semibold" style={{backgroundColor:"#00CB75"}}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir nuevo
            </button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-0">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Buscar entregables..." value={draftSearch}
                onChange={e => setDraftSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && applyFilters()}
                className={`w-full pl-10 pr-4 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent ${s.input}`} style={!dk ? {height:"40px", borderRadius:"8px", border:"1px solid #D5D7DA", background:"#FFF", boxShadow:"0 1px 2px 0 rgba(10,13,18,0.05)"} : {height:"40px", borderRadius:"8px", boxShadow:"0 1px 2px 0 rgba(10,13,18,0.05)"}} />
            </div>

            <CustomSelect dark={dk} value={draftFilter} onChange={v => setDraftFilter(v)} options={TYPES.map(f => ({ value: f, label: f }))} />
            <CustomSelect dark={dk} value={draftProduct} onChange={v => setDraftProduct(v)} options={[{ value: "Todos los productos", label: "Todos los productos" }, ...PRODUCTS.map(p => ({ value: p, label: p }))]} />
            <CustomSelect dark={dk} value={draftEstado} onChange={v => setDraftEstado(v)} options={ESTADOS.map(e => ({ value: e, label: e }))} />

            <button onClick={applyFilters}
              className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-semibold flex-shrink-0" style={{backgroundColor:"#00CB75"}}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filtrar
            </button>
          </div>
        </div></div>

        <div style={{maxWidth:"1600px", margin:"0 auto", width:"100%", paddingLeft:"2rem", paddingRight:"2rem", paddingTop:"1.75rem", paddingBottom:"1.75rem"}}>
          {filtered.length > 0
            ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(item => <Card key={item.id} item={item} onClick={onSelect} dark={dk} />)}
              </div>
            : <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${s.emptyBox}`}>
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className={`text-xl font-semibold mb-1 ${s.p1}`}>Sin resultados</p>
                <p className={`text-base ${s.p2}`}>Intenta con otros términos de búsqueda.</p>
              </div>
          }
        </div>
      </main>
    </>
  );
}

// ── SIDEBAR (shared) ──
function Sidebar({ dark, setDark, onNavigate, onSettings, activeFilter }) {
  const dk = dark;
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const expanded = pinned || hovered;

  const s = {
    panel:   dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
    div:     dk ? "border-gray-800" : "border-gray-100",
    p1:      dk ? "text-gray-100" : "text-gray-900",
    p2:      dk ? "text-gray-400" : "text-gray-500",
    muted:   dk ? "text-gray-600" : "text-gray-400",
    navOn:   dk ? "text-green-500" : "text-green-700",
    navOff:  dk ? "text-gray-400 hover:bg-gray-800 hover:text-gray-200" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
    tHover:  dk ? "hover:bg-gray-800" : "hover:bg-gray-50",
    pinBtn:  dk ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
    helpBox: dk ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200",
  };

  const width = expanded ? 272 : 64;

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex flex-col flex-shrink-0 border-r overflow-hidden ${s.panel}`} style={{transition:"width 200ms ease"}}
      style={{ width }}
    >
      {/* Header */}
      <div className={`flex items-center border-b flex-shrink-0 ${s.div} ${expanded ? "px-4 py-4 justify-between" : "px-3 py-4 justify-center"}`}>
        {expanded ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor:"#00CB75"}}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.003 3.003 0 00-.614 1.553l-.642.284A3.001 3.001 0 0112 21a3 3 0 01-2.116-.881l-.642-.284a3.003 3.003 0 00-.614-1.553l-.347-.347z" />
                </svg>
              </div>
              <div className="overflow-hidden">
                <p className={`text-base font-bold whitespace-nowrap ${s.p1}`}>UX Research</p>
                <p className={`text-sm whitespace-nowrap ${s.p2}`}>Entregables</p>
              </div>
            </div>
            <button
              onClick={() => setPinned(!pinned)}
              title={pinned ? "Desfijar sidebar" : "Fijar sidebar"}
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${pinned ? (dk ? "text-green-500" : "text-green-700") : s.pinBtn}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path d="M7.5 2.5V17.5M6.5 2.5H13.5C14.9001 2.5 15.6002 2.5 16.135 2.77248C16.6054 3.01217 16.9878 3.39462 17.2275 3.86502C17.5 4.3998 17.5 5.09987 17.5 6.5V13.5C17.5 14.9001 17.5 15.6002 17.2275 16.135C16.9878 16.6054 16.6054 16.9878 16.135 17.2275C15.6002 17.5 14.9001 17.5 13.5 17.5H6.5C5.09987 17.5 4.3998 17.5 3.86502 17.2275C3.39462 16.9878 3.01217 16.6054 2.77248 16.135C2.5 15.6002 2.5 14.9001 2.5 13.5V6.5C2.5 5.09987 2.5 4.3998 2.77248 3.86502C3.01217 3.39462 3.39462 3.01217 3.86502 2.77248C4.3998 2.5 5.09987 2.5 6.5 2.5Z" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        ) : (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{backgroundColor:"#00CB75"}}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.003 3.003 0 00-.614 1.553l-.642.284A3.001 3.001 0 0112 21a3 3 0 01-2.116-.881l-.642-.284a3.003 3.003 0 00-.614-1.553l-.347-.347z" />
            </svg>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-4 space-y-0.5 overflow-hidden ${expanded ? "px-3" : "px-2"}`}>
        {expanded && <p className={`px-3 pb-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${s.muted}`}>Biblioteca</p>}
        {NAV.map(item => {
          const navType = item.label === "Todos los entregables" ? "Tipo de entregable" : item.label;
          const isActive = !activeFilter?.team && (activeFilter?.type || "Tipo de entregable") === navType;
          return (
          <button key={item.label} title={!expanded ? item.label : undefined}
            onClick={() => onNavigate({ type: navType, team: null })}
            className={`w-full flex items-center rounded-lg font-medium ${expanded ? "gap-3 px-3 py-2.5 text-base" : "justify-center py-2.5"} ${isActive ? s.navOn : s.navOff}`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
            </svg>
            {expanded && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
          </button>);
        })}
      </nav>

      {/* Bottom */}
      <div className={`border-t flex-shrink-0 ${s.div} ${expanded ? "px-3 py-4 space-y-1" : "px-2 py-4 space-y-1"}`}>


        {/* Configuración */}
        <button title={!expanded ? "Configuración" : undefined}
          onClick={onSettings}
          className={`w-full flex items-center rounded-lg ${expanded ? "gap-3 px-3 py-2.5 text-base" : "justify-center py-2.5"} ${s.navOff}`}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3" strokeWidth={1.8}/></svg>
          {expanded && <span className="whitespace-nowrap">Configuración</span>}
        </button>

        {/* Modo oscuro/claro */}
        <button title={!expanded ? (dk ? "Cambiar a modo claro" : "Cambiar a modo oscuro") : undefined}
          onClick={() => setDark(!dk)}
          className={`w-full flex items-center rounded-lg ${expanded ? "gap-3 px-3 py-2.5 text-base justify-between" : "justify-center py-2.5"} ${s.navOff}`}>
          <div className={`flex items-center ${expanded ? "gap-3" : ""}`}>
            {dk
              ? <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m8.66-9H21M3 12H2m15.36-6.36l-.71.71M7.05 16.95l-.71.71M18.36 18.36l-.71-.71M6.34 6.34l-.71-.71M17 12a5 5 0 11-10 0 5 5 0 0110 0z" /></svg>
              : <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
            }
            {expanded && <span className="whitespace-nowrap">{dk ? "Modo claro" : "Modo oscuro"}</span>}
          </div>
          {expanded && (
            <div className={`w-8 h-4 rounded-full flex items-center px-0.5 flex-shrink-0 ${dk ? "justify-end" : "justify-start"}`} style={{backgroundColor: dk ? "#00CB75" : "#e5e7eb"}}> 
              <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
            </div>
          )}
        </button>

      </div>
    </aside>
  );
}

// ── ROOT ──
export default function App() {
  const [dark, setDark] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeFilter, setActiveFilter] = useState({ type: "Tipo de entregable", team: null });
  const [deliverables, setDeliverables] = useState(INITIAL_DELIVERABLES);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetch('/api/deliverables')
      .then(r => r.json())
      .then(saved => {
        if (saved.length > 0) {
          const marked = saved.map(d => ({ ...d, isCustom: true }));
          setDeliverables(prev => [...marked, ...prev]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSidebarNav = (params) => {
    setSelected(null);
    setActiveFilter(params);
  };

  const handleAdd = (item) => {
    setDeliverables(prev => [item, ...prev]);
    fetch('/api/deliverables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    }).catch(() => {});
  };

  const handleDelete = (id) => {
    setDeliverables(prev => prev.filter(d => d.id !== id));
    setSelected(null);
    fetch(`/api/deliverables/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  return (
    <div className={`min-h-screen ${dark ? "bg-gray-950" : "bg-gray-50"}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet" />
      <div className="flex h-screen overflow-hidden">
        {showSettings && <SettingsModal dark={dark} onClose={() => setShowSettings(false)} />}
        <Sidebar dark={dark} setDark={setDark} onNavigate={handleSidebarNav} onSettings={() => setShowSettings(true)} activeFilter={activeFilter} />
        {selected ? (
          <DetailPage item={selected} onBack={() => setSelected(null)} onNavigate={setSelected} dark={dark} deliverables={deliverables} onDelete={handleDelete} />
        ) : (
          <ListPage dark={dark} setDark={setDark} onSelect={setSelected} activeFilter={activeFilter} deliverables={deliverables} onAdd={handleAdd} />
        )}
      </div>
      <style>{`
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>
    </div>
  );
}
