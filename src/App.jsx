import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "./supabase";

const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

const toSlug = (title) => title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const PRODUCTS = ["Cambio Seguro", "Factoring", "Gestora", "PGH", "Recadia", "Tandia"];
const TYPES = ["Tipo de entregable", "Research", "Pruebas de usabilidad", "Buyer Persona", "User Persona"];
const PERSONA_TYPES = ["Buyer Persona", "User Persona"];

const EMPTY_BUYER = () => ({ nombre: "", cargo: "", edad: "", ubicacion: "", nivelTec: "", herramientas: "", rubro: "", personal: "", tiempoApertura: "", metas: "", adquisicion: "", comunicaciones: "" });
const EMPTY_USER  = () => ({ nombre: "", cargo: "", edad: "", ubicacion: "", nivelTec: "", herramientas: "", rubro: "", tiempoNegocio: "", objetivos: "", dolores: "" });

const ESTADOS = ["Persona asignada", "Ana R.", "Sofia K.", "Luis M.", "Carlos T."];

function CustomSelect({ value, onChange, options, dark, fullWidth }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative" style={fullWidth ? {} : { width: 180, flexShrink: 0 }}>
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
  { label: "Todos los research", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", active: true },
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
  const m = url.match(/\/d\/([^/?#]+)/);
  if (m) return m[1];
  const m2 = url.match(/[?&]id=([^&#]+)/);
  return m2 ? m2[1] : null;
};

const TYPE_COLORS = { "Research": "amber", "Otros entregables": "violet", "Pruebas de usabilidad": "blue", "Buyer Persona": "green", "User Persona": "violet" };
const secBtn = (d) => `rounded-lg border ${d ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`;
const primBtn = "rounded-lg text-white font-semibold";
const METODOLOGIAS = ["Cualitativa", "Cuantitativa", "Mixta", "Desk Research"];
const JIRA_STATUSES = ["EN CURSO", "FINALIZADO"];

const PRODUCT_COLORS = {
  "PGH": "#00CB75",
  "Factoring": "#3DD68C",
  "Gestora": "#009A58",
  "Tandia": "#2F6DEA",
  "Recadia": "#2D8E5F",
  "Cambio Seguro": "#7C3AED",
};


function getProductCoverUrl(fileName) {
  const { data } = supabase.storage.from('product-covers').getPublicUrl(fileName);
  return data?.publicUrl || null;
}
async function loadProductCovers() {
  const { data } = await supabase.from("config").select("value").eq("key", "product_covers").single();
  return (data?.value) || {};
}
async function loadAllProductCoverUrls() {
  const [map, { data: files }] = await Promise.all([
    loadProductCovers(),
    supabase.storage.from('product-covers').list('', { limit: 200 }),
  ]);
  const existing = new Set((files || []).filter(f => !f.name.startsWith('.')).map(f => f.name));
  return Object.fromEntries(
    PRODUCTS.map(p => {
      const fileName = map[toSlug(p)] || toSlug(p);
      const url = existing.has(fileName) ? getProductCoverUrl(fileName) : null;
      return [p, url];
    })
  );
}
async function saveProductCoverRef(product, fileName) {
  const current = await loadProductCovers();
  const updated = { ...current, [toSlug(product)]: fileName };
  await supabase.from("config").upsert({ key: "product_covers", value: updated });
  return updated;
}
async function uploadProductCover(product, file) {
  const fileName = toSlug(product);
  const { error } = await supabase.storage.from('product-covers').upload(fileName, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  await saveProductCoverRef(product, fileName);
  return getProductCoverUrl(fileName);
}
const STATUSES = ["Borrador", "Publicado"];
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
  const [headingOpen, setHeadingOpen] = useState(false);

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
        <div className="relative">
          <button type="button"
            onMouseDown={e => { e.preventDefault(); setHeadingOpen(o => !o); }}
            className={`h-7 px-2 flex items-center gap-1 rounded text-xs font-bold transition-colors ${dark ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>
            H
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          {headingOpen && (
            <>
              <div className="fixed inset-0 z-10" onMouseDown={() => setHeadingOpen(false)} />
              <div className={`absolute left-0 top-full mt-1 z-20 rounded-lg shadow-lg border overflow-hidden min-w-[110px] ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <button type="button"
                  onMouseDown={e => { e.preventDefault(); exec("formatBlock", "<h3>"); setHeadingOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm font-bold transition-colors ${dark ? "text-gray-100 hover:bg-gray-700" : "text-gray-800 hover:bg-gray-50"}`}>
                  Título
                </button>
                <button type="button"
                  onMouseDown={e => { e.preventDefault(); exec("formatBlock", "<h4>"); setHeadingOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm font-semibold transition-colors ${dark ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-50"}`}>
                  Subtítulo
                </button>
              </div>
            </>
          )}
        </div>
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
async function loadJiraConfig() {
  try {
    const { data } = await import("./supabase").then(m => m.supabase.from("config").select("value").eq("key", "jira").single());
    return data?.value || {};
  } catch { return {}; }
}
async function saveJiraConfig(cfg) {
  const { supabase } = await import("./supabase");
  await supabase.from("config").upsert({ key: "jira", value: cfg });
}

// ── SETTINGS MODAL ──
function SettingsModal({ onClose, dark }) {
  const d = dark;
  const { isSuperAdmin } = useApp();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [pendingRoles, setPendingRoles] = useState({});
  const [rolesSaving, setRolesSaving] = useState({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      supabase.rpc("get_users_with_roles").then(({ data }) => {
        const list = (data || []).sort((a, b) => {
          if (a.user_id === user?.id) return -1;
          if (b.user_id === user?.id) return 1;
          return 0;
        });
        setUsers(list);
        setUsersLoading(false);
      });
    });
  }, []);

  const handleRoleChange = async (userId) => {
    const newRole = pendingRoles[userId];
    if (!newRole) return;
    setRolesSaving(s => ({ ...s, [userId]: true }));
    await supabase.from("user_roles").upsert({ user_id: userId, role: newRole });
    setUsers(u => u.map(x => x.user_id === userId ? { ...x, role: newRole } : x));
    setPendingRoles(p => { const n = { ...p }; delete n[userId]; return n; });
    setRolesSaving(s => ({ ...s, [userId]: false }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className={`w-full max-w-xl rounded-2xl shadow-2xl ${d ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${d ? "border-gray-800" : "border-gray-200"}`}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <h2 className={`text-lg font-bold ${d ? "text-gray-100" : "text-gray-900"}`}>Roles de usuario</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium ${d ? "text-gray-600" : "text-gray-400"}`}>v1.0.1</span>
            <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-lg ${d ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-gray-300 border-t-green-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {users.map(u => {
                const isSelf = u.role === "super_admin";
                const currentRole = pendingRoles[u.user_id] ?? u.role;
                const changed = pendingRoles[u.user_id] !== undefined && pendingRoles[u.user_id] !== u.role;
                return (
                  <div key={u.user_id} className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl border ${d ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: "#00B369" }}>
                        {(u.full_name || u.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold truncate ${d ? "text-gray-100" : "text-gray-900"}`}>{u.full_name || "—"}</p>
                          {isSelf && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d ? "bg-green-900/50 text-green-400" : "bg-green-50 text-green-700"}`}>Tú</span>}
                        </div>
                        <p className={`text-xs truncate ${d ? "text-gray-400" : "text-gray-500"}`}>{u.email}</p>
                        {u.last_sign_in_at && (
                          <p className={`text-xs ${d ? "text-gray-600" : "text-gray-400"}`}>
                            Último acceso: {new Date(u.last_sign_in_at).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelf ? (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-lg ${d ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>Super Admin</span>
                    ) : (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          value={currentRole}
                          onChange={e => setPendingRoles(p => ({ ...p, [u.user_id]: e.target.value }))}
                          className={`text-xs font-semibold px-2 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-400 ${d ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-700"}`}
                        >
                          <option value="visitor">Visitante</option>
                          <option value="editor">Editor</option>
                        </select>
                        <button
                          onClick={() => handleRoleChange(u.user_id)}
                          disabled={!changed || rolesSaving[u.user_id]}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${changed
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : (d ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed")}`}
                        >
                          {rolesSaving[u.user_id] ? "..." : "Cambiar"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={`flex justify-end px-6 py-4 border-t ${d ? "border-gray-800" : "border-gray-200"}`}>
          <button onClick={onClose} className={`px-4 py-2 text-sm font-semibold ${secBtn(d)}`}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ── ADD PAGE ──
function AddPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark: d, handleAdd, showToast, editors } = useApp();
  const prefill = location.state || {};
  const onClose = () => navigate(-1);
  const onSave = (item) => {
    handleAdd(item);
    showToast({ title: item.status === "Publicado" ? "Research publicado exitosamente" : "Borrador guardado", subtitle: "Puedes seguir editando desde esta misma pantalla." });
    navigate(`/editar-research/${toSlug(item.title)}`, { state: { item } });
  };
  const today = new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
  const [form, setForm] = useState(() => {
    const type = prefill.type || "";
    const tags = prefill.product ? [prefill.product] : [];
    const personas = PERSONA_TYPES.includes(type)
      ? [type === "Buyer Persona" ? EMPTY_BUYER() : EMPTY_USER()]
      : [];
    return {
      title: "", type, metodologia: "",
      jira: "", jiraUrl: "", jiraStatus: "EN CURSO",
      team: [], tags,
      descripcion: "",
      objetivo: "", usuario: "", hallazgos: "",
      status: "Borrador", archivo: "", archivoUrl: "", reunionUrl: "",
      date: new Date().toISOString().slice(0, 10),
      personas,
    };
  });
  const [personaTab, setPersonaTab] = useState(0);
  const [jiraLoading, setJiraLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [jiraError, setJiraError] = useState("");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setType = (t) => {
    if (PERSONA_TYPES.includes(t)) {
      setForm(f => ({ ...f, type: t, personas: [t === "Buyer Persona" ? EMPTY_BUYER() : EMPTY_USER()] }));
      setPersonaTab(0);
    } else {
      setForm(f => ({ ...f, type: t, personas: [] }));
    }
  };
  const setPersonaField = (idx, field, val) => setForm(f => {
    const personas = f.personas.map((p, i) => i === idx ? { ...p, [field]: val } : p);
    return { ...f, personas };
  });
  const addPersona = () => {
    const empty = form.type === "Buyer Persona" ? EMPTY_BUYER() : EMPTY_USER();
    setForm(f => ({ ...f, personas: [...f.personas, empty] }));
    setPersonaTab(form.personas.length);
  };
  const removePersona = (idx) => {
    setForm(f => ({ ...f, personas: f.personas.filter((_, i) => i !== idx) }));
    setPersonaTab(t => Math.max(0, t - (idx <= t ? 1 : 0)));
  };

  const handleJiraUrl = async (url) => {
    set("jiraUrl", url);
    setJiraError("");
    const match = url.match(/\/browse\/([A-Z]+-\d+)/i);
    if (!match) return;
    const key = match[1].toUpperCase();
    set("jira", key);
    const cfg = await loadJiraConfig();
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
      set("jiraStatus", data.fields.status?.name?.toUpperCase() || "EN CURSO");
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

  const handleSave = (status) => {
    if (saving) return;
    if (!form.title.trim() || !form.type || !form.tags.length) return;
    setSaving(true);
    onSave({
      ...form,
      status,
      id: Date.now(),
      isCustom: true,
      typeColor: TYPE_COLORS[form.type] || "amber",
      date: form.date ? new Date(form.date + "T12:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "") : today,
      tags: form.tags.length ? form.tags : ["Sin producto"],
      team: form.team.length ? form.team : [],
      archivo: form.archivo.trim() || `${form.title}.pdf`,
    });
  };

  const inp = `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 ${d ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`;
  const lbl = `block text-xs font-semibold mb-1 ${d ? "text-gray-400" : "text-gray-600"}`;
  const sec = `rounded-xl border p-4 ${d ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`;

  const SectionTitle = ({ children }) => (
    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${d ? "text-gray-500" : "text-gray-400"}`}>{children}</p>
  );

  const DateInput = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const parsed = value ? new Date(value + "T12:00:00") : new Date();
    const [cursor, setCursor] = useState({ y: parsed.getFullYear(), m: parsed.getMonth() });
    const today = new Date();
    const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
    const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

    useEffect(() => {
      const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    const cells = () => {
      const first = new Date(cursor.y, cursor.m, 1).getDay();
      const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
      const prevDays = new Date(cursor.y, cursor.m, 0).getDate();
      const grid = [];
      for (let i = first - 1; i >= 0; i--) grid.push({ day: prevDays - i, cur: false });
      for (let i = 1; i <= days; i++) grid.push({ day: i, cur: true });
      while (grid.length < 42) grid.push({ day: grid.length - days - first + 1, cur: false });
      return grid;
    };

    const isSelected = (day, cur) => {
      if (!value || !cur) return false;
      const s = new Date(value + "T12:00:00");
      return s.getFullYear() === cursor.y && s.getMonth() === cursor.m && s.getDate() === day;
    };

    const isToday = (day, cur) => cur && today.getFullYear() === cursor.y && today.getMonth() === cursor.m && today.getDate() === day;

    const select = (day, cur) => {
      let y = cursor.y, m = cursor.m;
      if (!cur) { if (day > 15) { m--; if (m < 0) { m = 11; y--; } } else { m++; if (m > 11) { m = 0; y++; } } }
      const d2 = String(day).padStart(2, "0"), m2 = String(m + 1).padStart(2, "0");
      onChange(`${y}-${m2}-${d2}`);
      setCursor({ y, m });
      setOpen(false);
    };

    const prev = () => setCursor(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 });
    const next = () => setCursor(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 });

    const display = value
      ? new Date(value + "T12:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "")
      : "Seleccionar fecha";

    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors ${d ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-750" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
        >
          <svg className={`w-4 h-4 flex-shrink-0 ${d ? "text-gray-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span className={value ? "" : (d ? "text-gray-500" : "text-gray-400")}>{display}</span>
        </button>

        {open && (
          <div className={`absolute z-50 mt-1 w-72 rounded-2xl border shadow-xl p-4 ${d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
            {/* Navigation */}
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={prev} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${d ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              </button>
              <span className={`text-sm font-semibold ${d ? "text-gray-100" : "text-gray-900"}`}>{MONTHS[cursor.m]} {cursor.y}</span>
              <button type="button" onClick={next} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${d ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(day => (
                <div key={day} className={`text-center text-xs font-medium py-1 ${d ? "text-gray-500" : "text-gray-400"}`}>{day}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells().map((cell, i) => {
                const sel = isSelected(cell.day, cell.cur);
                const tod = isToday(cell.day, cell.cur);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => select(cell.day, cell.cur)}
                    className={`h-9 w-full flex items-center justify-center rounded-lg text-sm transition-colors
                      ${sel ? "text-white font-semibold" : ""}
                      ${!sel && cell.cur ? (d ? "text-gray-200 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100") : ""}
                      ${!cell.cur ? (d ? "text-gray-600 hover:bg-gray-800" : "text-gray-300 hover:bg-gray-50") : ""}
                      ${tod && !sel ? (d ? "font-semibold text-green-400" : "font-semibold text-green-600") : ""}
                    `}
                    style={sel ? { backgroundColor: "#00B369" } : {}}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className={`mt-3 pt-3 border-t flex justify-between items-center ${d ? "border-gray-700" : "border-gray-100"}`}>
              <button
                type="button"
                onClick={() => { const n = new Date(); onChange(`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`); setCursor({ y: n.getFullYear(), m: n.getMonth() }); setOpen(false); }}
                className={`text-xs font-medium ${d ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
              >
                Hoy
              </button>
              <button type="button" onClick={() => setOpen(false)} className={`text-xs font-medium ${d ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex-1 overflow-y-auto ${d ? "bg-gray-950" : "bg-gray-50"}`}>

        {/* Modal de confirmación */}
        {showLeaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-sm rounded-2xl border p-6 shadow-xl ${d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
              <h3 className={`text-base font-semibold mb-1 ${d ? "text-gray-100" : "text-gray-900"}`}>¿Descartar cambios?</h3>
              <p className={`text-sm mb-5 ${d ? "text-gray-400" : "text-gray-500"}`}>Si vuelves ahora, perderás toda la información que has añadido.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowLeaveModal(false)} className={`px-4 py-2 text-sm font-semibold ${secBtn(d)}`}>
                  Cancelar
                </button>
                <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700">
                  Sí, descartar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className={`border-b px-8 py-4 sticky top-0 z-10 ${d ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
          <button
            onClick={() => {
              const hasData = form.title.trim() || form.descripcion.trim() || form.objetivo.trim() || form.hallazgos.trim() || form.jiraUrl || form.archivoUrl;
              hasData ? setShowLeaveModal(true) : onClose();
            }}
            className={`flex items-center gap-2 text-sm font-semibold ${d ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-900"}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Volver
          </button>
        </div>

      <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "2rem 2rem 4rem" }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold mb-1 ${d ? "text-gray-100" : "text-gray-900"}`}>Añadir research</h1>
          {form.title.trim() && (
            <div className="flex items-center gap-6">
              <p className={`text-base font-medium pr-2 ${d ? "text-gray-400" : "text-gray-500"}`}>{window.location.origin}/research/{toSlug(form.title)}</p>
              <button type="button" title="Copiar enlace" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/research/${toSlug(form.title)}`)} style={{ width: 38, height: 38 }} className={`flex items-center justify-center rounded-lg border flex-shrink-0 ${d ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Columna principal */}
          <div className="col-span-3 space-y-4">

            {/* Título + Descripción */}
            <div className="space-y-3">
              <div>
                <label className={lbl}>Título <span className="text-green-500">*</span></label>
                <input
                  className={`w-full px-3 py-2 text-xl font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 ${d ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
                  placeholder="Título del research..."
                  value={form.title}
                  onChange={e => set("title", e.target.value)}
                />
              </div>
              <div>
                <label className={lbl}>Descripción corta</label>
                <textarea
                  className={inp + " resize-none"}
                  placeholder="Lo que verán en la card al buscar este research..."
                  rows={2}
                  value={form.descripcion}
                  onChange={e => set("descripcion", e.target.value)}
                />
              </div>
            </div>

            {/* Contenido */}
            <div className={`rounded-2xl border p-5 space-y-4 ${d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
              <SectionTitle>Contenido</SectionTitle>
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
            </div>

            {/* Referencias */}
            <div className={`rounded-2xl border p-5 space-y-4 ${d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
              <SectionTitle>Referencias</SectionTitle>
              <div>
                <label className={lbl}>Link de Google Drive</label>
                <input className={inp} type="url" placeholder="https://drive.google.com/..."
                  value={form.archivoUrl} onChange={e => {
                    const url = e.target.value;
                    set("archivoUrl", url);
                    const id = getDriveId(url);
                    if (id) fetch(`/api/gdrive/${id}`).then(r => r.json()).then(data => { if (data.title) set("archivo", data.title); }).catch(() => {});
                  }} />
              </div>
              <div>
                <label className={lbl}>Link de la reunión</label>
                <input className={inp} type="url" placeholder="https://drive.google.com/file/d/... (MP4)"
                  value={form.reunionUrl || ""} onChange={e => set("reunionUrl", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Link de Jira</label>
                <div className="relative">
                  <input className={inp} type="url" placeholder="https://empresa.atlassian.net/browse/UX-0000"
                    value={form.jiraUrl} onChange={e => handleJiraUrl(e.target.value)} />
                  {jiraLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><svg className="w-4 h-4 animate-spin text-green-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>}
                </div>
                {jiraError && <p className="mt-1 text-xs text-amber-500">{jiraError}</p>}
                {form.jira && !jiraLoading && (
                  <div className={`mt-2 rounded-lg border p-3 ${d ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                    <p className={`text-xs font-semibold leading-snug ${d ? "text-gray-100" : "text-gray-800"}`}>{form.jira}</p>
                    {form.jiraStatus && (
                      <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded border ${/done|closed|resolved|finaliz|complet/i.test(form.jiraStatus) ? (d ? "text-green-400 border-green-700 bg-green-900/40" : "text-green-700 border-green-200 bg-green-50") : (d ? "text-blue-400 border-blue-700 bg-blue-900/40" : "text-blue-700 border-blue-200 bg-blue-50")}`}>{form.jiraStatus}</span>
                    )}
                    <button type="button" onClick={() => { set("jira", ""); set("jiraStatus", ""); set("jiraUrl", ""); }} className={`block mt-1.5 text-xs ${d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>Cambiar ticket</button>
                  </div>
                )}
              </div>
            </div>

            {/* Personas */}
            {PERSONA_TYPES.includes(form.type) && form.personas.length > 0 && (
              <div className={`rounded-2xl border p-5 ${d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle>Personas</SectionTitle>
                  {form.personas.length < 3 && (
                    <button type="button" onClick={addPersona} className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 ${secBtn(d)}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                      Añadir
                    </button>
                  )}
                </div>
                <div className={`flex border-b mb-4 ${d ? "border-gray-700" : "border-gray-200"}`}>
                  {form.personas.map((p, i) => (
                    <div key={i} className="flex items-center">
                      <button type="button" onClick={() => setPersonaTab(i)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${personaTab === i ? "border-green-500 text-green-600" : d ? "border-transparent text-gray-400 hover:text-gray-200" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                        {p.nombre || `Persona ${i + 1}`}
                      </button>
                      {form.personas.length > 1 && (
                        <button type="button" onClick={() => removePersona(i)} className={`-ml-1 mb-px w-4 h-4 flex items-center justify-center text-xs ${d ? "text-gray-600 hover:text-gray-300" : "text-gray-300 hover:text-gray-600"}`}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
                {(() => {
                  const p = form.personas[personaTab];
                  const fi = (field, placeholder) => <input className={inp} placeholder={placeholder} value={p[field] || ""} onChange={e => setPersonaField(personaTab, field, e.target.value)} />;
                  const group = (title, children) => (
                    <div className={`rounded-xl border p-4 ${d ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${d ? "text-gray-500" : "text-gray-400"}`}>{title}</p>
                      <div className="space-y-3">{children}</div>
                    </div>
                  );
                  return (
                    <div className="space-y-4">
                      <div><label className={lbl}>Nombre</label>{fi("nombre", "Nombre de la persona")}</div>
                      {group("Información personal", <>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={lbl}>Cargo</label>{fi("cargo","Cargo o rol")}</div>
                          <div><label className={lbl}>Edad</label>{fi("edad","Ej: 35 años")}</div>
                        </div>
                        <div><label className={lbl}>Ubicación</label>{fi("ubicacion","Ciudad / País")}</div>
                        <div><label className={lbl}>Nivel tecnológico</label>{fi("nivelTec","Básico / Medio / Avanzado")}</div>
                        <div><label className={lbl}>Herramientas usadas</label>{fi("herramientas","Excel, Slack, etc.")}</div>
                      </>)}
                      {group("Sobre el negocio", form.type === "Buyer Persona" ? <>
                        <div><label className={lbl}>Rubro</label>{fi("rubro","Sector o industria")}</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={lbl}>Personal</label>{fi("personal","Ej: 10-50 empleados")}</div>
                          <div><label className={lbl}>Tiempo de apertura</label>{fi("tiempoApertura","Ej: 5 años")}</div>
                        </div>
                        <div><label className={lbl}>Metas a futuro</label><RichEditor dark={d} value={p.metas || ""} onChange={v => setPersonaField(personaTab, "metas", v)} placeholder="Metas y objetivos a futuro..." /></div>
                      </> : <>
                        <div><label className={lbl}>Rubro</label>{fi("rubro","Sector o industria")}</div>
                        <div><label className={lbl}>Tiempo en el negocio</label>{fi("tiempoNegocio","Ej: 3 años")}</div>
                      </>)}
                      {form.type === "Buyer Persona" && <>
                        {group("Adquisición del producto", <RichEditor dark={d} value={p.adquisicion || ""} onChange={v => setPersonaField(personaTab, "adquisicion", v)} placeholder="Razones de adquisición..." />)}
                        {group("Comunicaciones", <RichEditor dark={d} value={p.comunicaciones || ""} onChange={v => setPersonaField(personaTab, "comunicaciones", v)} placeholder="Canales de comunicación..." />)}
                      </>}
                      {form.type === "User Persona" && <>
                        {group("Objetivos y metas", <RichEditor dark={d} value={p.objetivos || ""} onChange={v => setPersonaField(personaTab, "objetivos", v)} placeholder="Objetivos y metas del usuario..." />)}
                        {group("Frustraciones y dolores", <RichEditor dark={d} value={p.dolores || ""} onChange={v => setPersonaField(personaTab, "dolores", v)} placeholder="Frustraciones y dolores..." />)}
                      </>}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Estado + Acciones */}
            <div className={`rounded-2xl border p-5 space-y-4 ${d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <SectionTitle>Estado</SectionTitle>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${form.status === "Publicado" ? (d ? "bg-green-900/40 text-green-400 border-green-700" : "bg-green-50 text-green-700 border-green-200") : (d ? "bg-gray-800 text-gray-400 border-gray-600" : "bg-gray-100 text-gray-500 border-gray-300")}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${form.status === "Publicado" ? "bg-green-500" : "bg-gray-400"}`} />
                  {form.status}
                </span>
              </div>
              <div>
                <label className={lbl}>Fecha de publicación</label>
                <DateInput value={form.date} onChange={v => set("date", v)} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => handleSave("Borrador")} disabled={!form.title.trim() || saving} className={`flex-1 px-3 py-2 text-sm font-semibold disabled:opacity-40 transition-opacity ${secBtn(d)}`}>
                  Guardar
                </button>
                <button onClick={() => handleSave("Publicado")} disabled={!form.title.trim() || saving} className={`flex-1 px-3 py-2 text-sm disabled:opacity-40 transition-opacity ${primBtn}`} style={{ backgroundColor: "#00B369" }}>
                  Publicar
                </button>
              </div>
            </div>

            {/* Clasificación */}
            <div className={`rounded-2xl border p-5 space-y-4 ${d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
              <SectionTitle>Clasificación</SectionTitle>
              <div>
                <label className={lbl}>Tipo de entregable <span className="text-green-500">*</span></label>
                <select className={inp} value={form.type} onChange={e => setType(e.target.value)} style={!form.type ? { color: d ? "#6b7280" : "#9ca3af" } : {}}>
                  <option value="" disabled>Seleccione</option>
                  {TYPES.slice(1).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Metodología</label>
                <select className={inp} value={form.metodologia} onChange={e => set("metodologia", e.target.value)}>
                  <option value="">Sin especificar</option>
                  {METODOLOGIAS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Producto <span className="text-green-500">*</span></label>
                <select className={inp} value={form.tags[0] || ""} onChange={e => set("tags", e.target.value ? [e.target.value] : [])} style={!form.tags[0] ? { color: d ? "#6b7280" : "#9ca3af" } : {}}>
                  <option value="" disabled>Seleccione</option>
                  {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Persona asignada</label>
                <select className={inp} value={form.team[0] || ""} onChange={e => set("team", e.target.value ? [e.target.value] : [])} style={!form.team[0] ? { color: d ? "#6b7280" : "#9ca3af" } : {}}>
                  <option value="">Sin asignar</option>
                  {editors.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>

          </div>
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
  if (!name) return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${dark ? "bg-gray-700 text-gray-400 border-gray-800" : "bg-gray-100 text-gray-400 border-white"}`}>
      ?
    </div>
  );
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
  const statusPill = {
    "Publicado": dark ? "bg-green-900/40 text-green-400 border-green-700" : "bg-green-50 text-green-600 border-green-300",
    "Borrador":  dark ? "bg-gray-800 text-gray-400 border-gray-600"       : "bg-gray-100 text-gray-500 border-gray-300",
  };
  if (!typeColor && statusPill[label]) {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusPill[label]}`}>
        {label}
      </span>
    );
  }
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeColor ? tm[typeColor] : ""}`}>{label}</span>;
}

function CardSkeleton({ dark: d }) {
  const b = d ? "bg-gray-800" : "bg-gray-200";
  return (
    <div className={`rounded-xl border p-5 animate-pulse ${d ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
      <div className="flex gap-3 mb-4">
        <div className={`h-6 w-24 rounded-full ${b}`} />
        <div className={`h-6 w-16 rounded-full ${b}`} />
      </div>
      <div className={`h-5 w-3/4 rounded-lg mb-3 ${b}`} />
      <div className={`h-3 w-full rounded mb-2 ${b}`} />
      <div className={`h-3 w-5/6 rounded mb-4 ${b}`} />
      <div className={`h-3 w-1/3 rounded ${b}`} />
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-24">
      <svg className="w-8 h-8 animate-spin" style={{ color: "#00B369" }} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );
}

function ProductCard({ product: p, deliverables, coverUrl, dark: d, onClick }) {
  const pc = PRODUCT_COLORS[p] || "#00B369";
  const all = deliverables.filter(i => i.tags.includes(p));
  const research = all.filter(i => i.type === "Research").length;
  const usabilidad = all.filter(i => i.type === "Pruebas de usabilidad").length;
  return (
    <button onClick={onClick}
      className={`text-left rounded-xl border overflow-hidden transition-all group ${d ? "bg-gray-900 border-gray-800 hover:border-green-600" : "bg-white border-gray-200 hover:border-green-400 hover:shadow-md"}`}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div className="h-20 w-full flex-shrink-0" style={{ backgroundColor: pc, backgroundImage: coverUrl ? `url(${coverUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className={`font-semibold text-base ${d ? "text-gray-100" : "text-gray-900"}`}>{p}</span>
          </div>
          <svg className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${d ? "text-gray-700" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>
        <div className={`text-xs space-y-1.5 ${d ? "text-gray-500" : "text-gray-400"}`}>
          <div className="flex justify-between"><span>Research</span><span className={`font-semibold ${d ? "text-gray-300" : "text-gray-600"}`}>{research}</span></div>
          <div className="flex justify-between"><span>Pruebas de usabilidad</span><span className={`font-semibold ${d ? "text-gray-300" : "text-gray-600"}`}>{usabilidad}</span></div>
          <div className={`flex justify-between pt-1.5 border-t ${d ? "border-gray-800" : "border-gray-100"}`}>
            <span>Total</span><span className="font-bold" style={{ color: "#00B369" }}>{all.length}</span>
          </div>
        </div>
      </div>
    </button>
  );
}


function ProductCardSkeleton({ dark: d }) {
  const b = d ? "bg-gray-800" : "bg-gray-200";
  return (
    <div className={`rounded-xl border overflow-hidden animate-pulse ${d ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
      <div className={`h-20 ${b}`} />
      <div className="p-5 space-y-3">
        <div className={`h-4 w-1/2 rounded-lg ${b}`} />
        <div className={`h-3 w-full rounded ${b}`} />
        <div className={`h-3 w-3/4 rounded ${b}`} />
        <div className={`h-3 w-2/3 rounded ${b}`} />
      </div>
    </div>
  );
}

function Card({ item, dark }) {
  const navigate = useNavigate();
  const d = dark;
  const { editors } = useApp();
  const productTag = item.tags && item.tags.find(t => PRODUCTS.includes(t));
  const pc = productTag ? (PRODUCT_COLORS[productTag] || "#00B369") : null;

  return (
    <div onClick={() => navigate(`/research/${toSlug(item.title)}`)} className={`rounded-2xl border p-6 cursor-pointer group flex flex-col ${d ? "bg-gray-900 border-gray-700 hover:border-green-400 hover:shadow-lg hover:shadow-black/30" : "bg-white border-gray-200 hover:shadow-md hover:border-green-400/40"}`}>
      <div className="flex items-start justify-between mb-4">
        <Badge label={item.type} typeColor={item.typeColor} dark={d} />
        {productTag && pc && (
          <span className={`text-sm rounded-lg px-2.5 py-1 border flex items-center gap-1.5 ${d ? "text-gray-300 bg-gray-800 border-gray-700" : "text-gray-600 bg-gray-50 border-gray-200"}`}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: pc }} />
            {productTag}
          </span>
        )}
      </div>
      <h3 className={`font-semibold text-lg leading-snug mb-3 ${d ? "text-gray-100 group-hover:text-green-600" : "text-gray-900 group-hover:text-green-700"}`}>{item.title}</h3>
      <p className={`text-base leading-relaxed mb-4 line-clamp-2 flex-1 ${d ? "text-gray-400" : "text-gray-500"}`}>{item.descripcion || stripHtml(item.objetivo)}</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {item.tags.filter(tag => !PRODUCTS.includes(tag)).map(tag => <span key={tag} className={`text-sm rounded-lg px-2.5 py-1 border ${d ? "text-gray-400 bg-gray-800 border-gray-700" : "text-gray-500 bg-gray-50 border-gray-200"}`}>{tag}</span>)}
      </div>
      <div className={`flex items-center justify-between pt-4 border-t ${d ? "border-gray-800" : "border-gray-100"}`}>
        {(() => { const validTeam = (item.team || []).filter(n => editors.includes(n)); return validTeam.length ? (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">{validTeam.map((name, i) => <Avatar key={name} name={name} index={i} dark={d} />)}</div>
            <span className={`text-sm ${d ? "text-gray-400" : "text-gray-500"}`}>{validTeam[0]}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Avatar name={null} dark={d} />
            <span className={`text-sm ${d ? "text-gray-500" : "text-gray-400"}`}>Sin asignar</span>
          </div>
        ); })()}
        <span className={`text-sm ${d ? "text-gray-500" : "text-gray-400"}`}>{item.date}</span>
      </div>
    </div>
  );
}

// ── PERSONA DETAIL TABS ──
function PersonaDetailTabs({ personas, type, dark: d }) {
  const [tab, setTab] = useState(0);
  const p = personas[tab] || {};
  const isBuyer = type === "Buyer Persona";

  const nivelPct = { "básico": 33, "intermedio": 66, "avanzado": 100 }[( p.nivelTec || "").toLowerCase()] || null;

  const bannerColor = isBuyer ? "#2563EB" : "#00B369";

  const FieldCard = ({ label, value, description }) =>
    value ? (
      <div className={`py-2 border-b ${d ? "border-gray-700" : "border-gray-100"}`}>
        <p className={`text-xs mb-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>{label}</p>
        <p className={`text-sm font-semibold leading-snug ${d ? "text-gray-100" : "text-gray-900"}`}>{value}</p>
        {description && <p className={`text-xs mt-1 leading-snug ${d ? "text-gray-400" : "text-gray-500"}`}>{description}</p>}
      </div>
    ) : null;

  const NivelCard = () =>
    p.nivelTec ? (
      <div className={`py-2 border-b ${d ? "border-gray-700" : "border-gray-100"}`}>
        <p className={`text-xs mb-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Nivel tecnológico</p>
        <p className={`text-sm font-semibold mb-1.5 ${d ? "text-gray-100" : "text-gray-900"}`}>{p.nivelTec}</p>
        {nivelPct && (
          <div className={`h-1.5 rounded-full overflow-hidden ${d ? "bg-gray-700" : "bg-gray-100"}`}>
            <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${nivelPct}%` }} />
          </div>
        )}
        {p.herramientas && <p className={`text-xs mt-1.5 ${d ? "text-gray-400" : "text-gray-500"}`}>Utiliza <strong>{p.herramientas}</strong></p>}
      </div>
    ) : null;

  const SectionHeader = ({ children }) => (
    <div className={`rounded-lg px-4 py-2.5 mb-3 ${d ? "bg-gray-800" : "bg-gray-100"}`}>
      <p className={`text-sm font-bold ${d ? "text-gray-100" : "text-gray-800"}`}>{children}</p>
    </div>
  );

  const ContentCard = ({ title, description }) =>
    title ? (
      <div className={`rounded-lg p-4 border ${d ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <p className={`text-sm font-bold leading-snug ${d ? "text-gray-100" : "text-gray-900"}`}>{title}</p>
        {description && <p className={`text-sm mt-1.5 leading-snug ${d ? "text-gray-400" : "text-gray-600"}`}>{description}</p>}
      </div>
    ) : null;

  const SideSection = ({ title, children }) => (
    <div className={`rounded-xl border overflow-hidden ${d ? "border-gray-700" : "border-gray-200"}`}>
      <div className="px-3 py-2" style={{ backgroundColor: bannerColor }}>
        <p className="text-white font-bold text-sm">{title}</p>
      </div>
      <div className={`px-3 ${d ? "bg-gray-800" : "bg-white"}`}>{children}</div>
    </div>
  );

  return (
    <div className={`rounded-2xl border p-5 ${d ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
      {/* Persona tabs */}
      {personas.length > 1 && (
        <div className={`flex border-b mb-4 ${d ? "border-gray-700" : "border-gray-200"}`}>
          {personas.map((persona, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === i ? "border-green-500 text-green-600" : d ? "border-transparent text-gray-400 hover:text-gray-200" : "border-transparent text-gray-500 hover:text-gray-800"
              }`}>
              {persona.nombre || `Persona ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Header banner */}
      <div className="rounded-xl overflow-hidden mb-5" style={{ backgroundColor: bannerColor }}>
        <div className="px-6 py-5 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-end justify-center overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.25)" }}>
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
          <div>
            <p className="text-white/80 text-sm font-semibold mb-0.5">{type}</p>
            <h2 className="text-white text-2xl font-bold leading-tight">{p.nombre || "Sin nombre"}</h2>
            {p.cargo && <p className="text-white/70 text-sm mt-0.5">{p.cargo}</p>}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-5">
        {/* LEFT sidebar */}
        <div className="w-64 flex-shrink-0 space-y-5">
          <SideSection title="Información personal">
            <FieldCard label="Cargo" value={p.cargo} />
            <FieldCard label="Edad" value={p.edad} />
            <FieldCard label="Ubicación" value={p.ubicacion} />
            <NivelCard />
          </SideSection>
          <SideSection title="Sobre el negocio">
            <FieldCard label="Rubro" value={p.rubro} />
            {isBuyer ? (
              <>
                <FieldCard label="Cantidad de personal" value={p.personal} />
                <FieldCard label="Tiempo de apertura" value={p.tiempoApertura} />
                {p.metas && (
                  <div className={`py-2 border-b ${d ? "border-gray-700" : "border-gray-100"}`}>
                    <p className={`text-xs mb-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>Metas a futuro</p>
                    <div className={`rich-content text-sm leading-snug ${d ? "text-gray-100" : "text-gray-900"}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.metas) }} />
                  </div>
                )}
              </>
            ) : (
              <FieldCard label="Tiempo en el negocio" value={p.tiempoNegocio} />
            )}
          </SideSection>
        </div>

        {/* RIGHT content */}
        <div className="flex-1 min-w-0 space-y-5">
          {isBuyer ? (
            <>
              {/* Adquisición del producto */}
              {p.adquisicion && (
                <div>
                  <SectionHeader>Adquisición del producto</SectionHeader>
                  <div className={`rich-content text-sm leading-relaxed ${d ? "text-gray-300" : "text-gray-600"}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.adquisicion) }} />
                </div>
              )}
              {/* Comunicaciones */}
              {p.comunicaciones && (
                <div>
                  <SectionHeader>Comunicaciones</SectionHeader>
                  <div className={`rich-content text-sm leading-relaxed ${d ? "text-gray-300" : "text-gray-600"}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.comunicaciones) }} />
                </div>
              )}
            </>
          ) : (
            <>
              {p.objetivos && (
                <div>
                  <SectionHeader>Objetivos y metas</SectionHeader>
                  <div className={`rich-content text-sm leading-relaxed ${d ? "text-gray-300" : "text-gray-600"}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.objetivos) }} />
                </div>
              )}
              {p.dolores && (
                <div>
                  <SectionHeader>Frustraciones y dolores</SectionHeader>
                  <div className={`rich-content text-sm leading-relaxed ${d ? "text-gray-300" : "text-gray-600"}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.dolores) }} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── TOAST ──
function Toast({ toast }) {
  const { dark: d } = useApp();
  if (!toast) return null;
  return (
    <div className="fixed top-5 right-5 z-[100]">
      <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-xl border max-w-sm ${
        d
          ? toast.type === "success" ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-gray-900 border-gray-700 text-gray-100"
          : toast.type === "success" ? "bg-white border-gray-200 text-gray-800" : "bg-white border-gray-200 text-gray-800"
      }`} style={{ boxShadow: d ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.12)" }}>
        {toast.type === "success" ? (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${d ? "bg-green-900/60" : "bg-green-100"}`}>
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${d ? "bg-red-900/60" : "bg-red-100"}`}>
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
        )}
        <div>
          <p className="text-sm font-semibold">{toast.msg.title}</p>
          {toast.msg.subtitle && <p className={`text-xs mt-0.5 ${d ? "text-gray-400" : "text-gray-500"}`}>{toast.msg.subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

// ── CONFIRM MODAL ──
function ConfirmModal({ title, message, confirmLabel = "Confirmar", danger = false, onConfirm, onCancel }) {
  const { dark: d } = useApp();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className={`rounded-2xl shadow-2xl border w-full max-w-sm ${d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="px-6 pt-6 pb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${danger ? (d ? "bg-red-900/50" : "bg-red-100") : (d ? "bg-amber-900/50" : "bg-amber-100")}`}>
            <svg className={`w-5 h-5 ${danger ? "text-red-500" : "text-amber-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className={`text-base font-bold mb-1 ${d ? "text-gray-100" : "text-gray-900"}`}>{title}</h3>
          <p className={`text-sm ${d ? "text-gray-400" : "text-gray-500"}`}>{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} className={`flex-1 px-4 py-2 text-sm font-semibold ${secBtn(d)}`}>
            Cancelar
          </button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white ${danger ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── VIEWS MODAL ──
function ViewsModal({ researchId, dark: d, onClose }) {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("research_views").select("user_name,user_email,viewed_at")
      .eq("research_id", String(researchId))
      .order("viewed_at", { ascending: false })
      .then(({ data }) => { setViews(data || []); setLoading(false); });
  }, [researchId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className={`w-full max-w-md rounded-2xl shadow-2xl ${d ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${d ? "border-gray-800" : "border-gray-200"}`}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            <h2 className={`text-lg font-bold ${d ? "text-gray-100" : "text-gray-900"}`}>Vistas</h2>
          </div>
          <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-lg ${d ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-green-500 animate-spin" /></div>
          ) : views.length === 0 ? (
            <p className={`text-sm text-center py-8 ${d ? "text-gray-500" : "text-gray-400"}`}>Nadie ha visto este research aún.</p>
          ) : (
            <div className="space-y-2">
              {views.map((v, i) => (
                <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${d ? "bg-gray-800" : "bg-gray-50"}`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "#00B369" }}>
                    {(v.user_name || v.user_email || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate ${d ? "text-gray-100" : "text-gray-900"}`}>{v.user_name || "—"}</p>
                    <p className={`text-xs truncate ${d ? "text-gray-400" : "text-gray-500"}`}>{v.user_email}</p>
                  </div>
                  <p className={`text-xs flex-shrink-0 ${d ? "text-gray-600" : "text-gray-400"}`}>
                    {new Date(v.viewed_at).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={`flex justify-end px-6 py-4 border-t ${d ? "border-gray-800" : "border-gray-200"}`}>
          <button onClick={onClose} className={`px-4 py-2 text-sm font-semibold ${secBtn(d)}`}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ── DETAIL PAGE ──
function DetailPage() {
  const navigate = useNavigate();
  const { id: slug } = useParams();
  const { dark: d, deliverables, handleDelete, isEditor, editors } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showViews, setShowViews] = useState(false);
  const item = deliverables.find(x => toSlug(x.title) === slug);

  // Registrar vista — debe ir antes del early return (Rules of Hooks)
  useEffect(() => {
    if (!item) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("research_views").upsert({
        research_id: String(item.id),
        user_id: user.id,
        user_name: user.user_metadata?.full_name || null,
        user_email: user.email,
        viewed_at: new Date().toISOString(),
      }, { onConflict: "research_id,user_id" });
    });
  }, [item?.id]);

  if (!item) return <div className={`flex-1 flex items-center justify-center ${d ? "bg-gray-950 text-gray-400" : "bg-gray-50 text-gray-500"}`}>Research no encontrado.</div>;
  const related = deliverables.filter(r => r.id !== item.id && r.tags[0] === item.tags[0]).slice(0, 3);

  const jiraDone = /done|closed|resolved|finaliz|complet/i.test(item.jiraStatus || "");
  const entryJiraColor = (item.jiraStatus === "FINALIZADO" || jiraDone)
    ? (d ? "text-green-400 border-green-700 bg-green-900/40" : "text-green-700 border-green-200 bg-green-50")
    : (d ? "text-blue-400 border-blue-700 bg-blue-900/40" : "text-blue-700 border-blue-200 bg-blue-50");

  return (
    <div className={`flex-1 overflow-y-auto ${d ? "bg-gray-950" : "bg-gray-50"}`}>
      {confirmDelete && (
        <ConfirmModal
          title="¿Eliminar research?"
          message={`"${item.title}" se eliminará permanentemente y no podrá recuperarse.`}
          confirmLabel="Sí, eliminar"
          danger
          onConfirm={() => { handleDelete(item.id); navigate("/research"); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
      {/* Top bar */}
      <div className={`border-b px-8 py-4 sticky top-0 z-10 flex items-center justify-between ${d ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
        <button onClick={() => navigate("/research")} className={`flex items-center gap-2 text-sm font-semibold ${d ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-900"}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a todos los research
        </button>
        <div className="flex gap-2">
          {isEditor && (
            <button onClick={() => setShowViews(true)} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold ${secBtn(d)}`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              Ver vistas
            </button>
          )}
          {item.isCustom && isEditor && (
            <button
              onClick={() => navigate(`/editar-research/${toSlug(item.title)}`)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold ${secBtn(d)}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
              Editar
            </button>
          )}
        </div>
      </div>
      {showViews && <ViewsModal researchId={item.id} dark={d} onClose={() => setShowViews(false)} />}

      <div style={{maxWidth:"1600px", margin:"0 auto", width:"100%", paddingLeft:"2rem", paddingRight:"2rem", paddingTop:"2rem", paddingBottom:"2rem"}}>
        {/* Breadcrumb */}
        <div className={`flex items-center gap-2 text-sm mb-2 ${d ? "text-gray-500" : "text-gray-400"}`}>
          <button onClick={() => navigate("/")} className={`hover:underline ${d ? "hover:text-gray-300" : "hover:text-gray-700"}`}>Inicio</button><span>/</span>
          <button onClick={() => navigate(`/producto/${encodeURIComponent(item.tags[0])}`)} className={`hover:underline ${d ? "hover:text-gray-300" : "hover:text-gray-700"}`}>{item.tags[0]}</button><span>/</span>
          <span className={d ? "text-gray-300" : "text-gray-700"}>{item.type}</span>
        </div>

        {/* Page title */}
        <div className="flex items-center gap-3 mb-2">
          {(() => { const assigned = (item.team || []).find(n => editors.includes(n)) || null; return (<>
            <Avatar name={assigned} index={0} dark={d} />
            <span className={`text-sm ${d ? "text-gray-400" : "text-gray-500"}`}>
              {assigned || "Sin asignar"} · {item.date}
            </span>
          </>); })()}
        </div>
        <h1 className={`text-3xl font-bold mb-3 ${d ? "text-gray-100" : "text-gray-900"}`}>{item.title}</h1>
        <div className="mb-8"><Badge label={item.status} dark={d} /></div>

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
                        <p className={`text-xs font-semibold leading-snug ${d ? "text-gray-100" : "text-gray-800"}`}>{item.archivo || "Archivo"}</p>
                      </div>
                      {/* Creado por */}
                      <p className={`text-xs mt-1 ${d ? "text-gray-500" : "text-gray-400"}`}>· Creado por {(item.team || []).find(n => editors.includes(n)) || "Sin asignar"}</p>
                    </div>
                    {/* Thumbnail */}
                    {thumbUrl && (
                      <div className="flex-shrink-0 overflow-hidden" style={{background:"#4285f4", width:"45%"}}>
                        <img src={thumbUrl} alt="" className="w-full h-full object-cover" style={{minHeight:140}}
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
              {item.reunionUrl && (
                <div>
                  <p className={`text-xs font-semibold mb-1 ${d ? "text-gray-500" : "text-gray-400"}`}>Link de la reunión</p>
                  <a href={item.reunionUrl} target="_blank" rel="noreferrer"
                    className={`text-sm font-semibold leading-snug inline-flex items-center gap-1.5 ${d ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"}`}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    Ver grabación
                  </a>
                </div>
              )}
              <div>
                <p className={`text-xs font-semibold mb-1 ${d ? "text-gray-500" : "text-gray-400"}`}>Link de Jira</p>
                <a
                  className={`text-sm font-semibold leading-snug block mb-1.5 break-words ${d ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"} ${!item.jiraUrl && "pointer-events-none"}`}
                  href={item.jiraUrl || "#"}
                  target={item.jiraUrl ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {item.jira || item.jiraUrl || "—"}
                </a>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${entryJiraColor}`}>{item.jiraStatus}</span>
              </div>
              {item.isCustom && isEditor && (
                <div className={`mt-6 pt-4 border-t ${d ? "border-gray-700" : "border-gray-200"}`}>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar research
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
            {item.objetivo && (
              <div>
                <h3 className={`text-base font-bold mb-2 ${d ? "text-gray-100" : "text-gray-900"}`}>Objetivo del research</h3>
                <div className={`rich-content text-base leading-relaxed ${d ? "text-gray-300" : "text-gray-600"}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.objetivo) }} />
              </div>
            )}
            {item.usuario && (
              <div>
                <h3 className={`text-base font-bold mb-2 ${d ? "text-gray-100" : "text-gray-900"}`}>Usuario</h3>
                <div className={`rich-content text-base leading-relaxed ${d ? "text-gray-300" : "text-gray-600"}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.usuario) }} />
              </div>
            )}
            {item.hallazgos && (
              <div>
                <h3 className={`text-base font-bold mb-2 ${d ? "text-gray-100" : "text-gray-900"}`}>Hallazgos y conclusiones</h3>
                <div className={`rich-content text-base leading-relaxed ${d ? "text-gray-300" : "text-gray-600"}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.hallazgos) }} />
              </div>
            )}
            {PERSONA_TYPES.includes(item.type) && item.personas && item.personas.length > 0 && (
              <PersonaDetailTabs personas={item.personas} type={item.type} dark={d} />
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${d ? "text-gray-300" : "text-gray-700"}`}>
              Contenido relacionado
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {related.map(r => (
                <Card key={r.id} item={r} dark={d} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PRODUCT PAGE ──
function CoverPickerModal({ dark: d, onSelect, onUpload, onClose }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.storage.from('product-covers').list('', { limit: 100 }).then(({ data }) => {
      setFiles((data || []).filter(f => !f.name.startsWith('.')));
      setLoading(false);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className={`w-[560px] max-h-[80vh] rounded-2xl flex flex-col shadow-2xl ${d ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${d ? "border-gray-800" : "border-gray-200"}`}>
          <h2 className={`font-semibold text-base ${d ? "text-gray-100" : "text-gray-900"}`}>Elegir portada</h2>
          <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-lg ${d ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Upload button */}
        <div className={`px-6 py-3 border-b ${d ? "border-gray-800" : "border-gray-200"}`}>
          <button
            onClick={onUpload}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 ${secBtn(d)}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Subir nueva imagen
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className={`text-sm text-center py-8 ${d ? "text-gray-500" : "text-gray-400"}`}>Cargando...</p>
          ) : files.length === 0 ? (
            <p className={`text-sm text-center py-8 ${d ? "text-gray-500" : "text-gray-400"}`}>No hay imágenes subidas aún.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {files.map(f => {
                const { data } = supabase.storage.from('product-covers').getPublicUrl(f.name);
                const url = data?.publicUrl;
                return (
                  <button
                    key={f.name}
                    onClick={() => onSelect(f.name)}
                    className={`rounded-xl overflow-hidden border-2 transition-all hover:border-green-500 aspect-video ${d ? "border-gray-700" : "border-gray-200"}`}
                  >
                    <img src={url} alt={f.name} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const product = decodeURIComponent(slug);
  const { dark: d, deliverables, isEditor } = useApp();
  const [coverUrl, setCoverUrl] = useState(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [allCovers, setAllCovers] = useState({});
  const coverInputRef = useRef(null);

  useEffect(() => {
    loadAllProductCoverUrls().then(urls => {
      setCoverUrl(urls[product] || null);
      setAllCovers(urls);
    });
  }, [product]);

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setShowCoverPicker(false);
    setCoverUploading(true);
    try {
      const url = await uploadProductCover(product, file);
      setCoverUrl(url);
    } catch (err) {
      console.error("Error uploading cover:", err?.message || err);
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSelectExisting = async (fileName) => {
    setShowCoverPicker(false);
    setCoverUploading(true);
    try {
      await saveProductCoverRef(product, fileName);
      setCoverUrl(getProductCoverUrl(fileName));
    } catch (err) {
      console.error("Error setting cover:", err?.message || err);
    } finally {
      setCoverUploading(false);
    }
  };

  const color = PRODUCT_COLORS[product] || "#00B369";
  const productDeliverables = deliverables.filter(item => item.tags.includes(product));

  const byType = {
    "Research": productDeliverables.filter(i => i.type === "Research"),
    "Pruebas de usabilidad": productDeliverables.filter(i => i.type === "Pruebas de usabilidad"),
  };

  const personaByType = {
    "Buyer Persona": productDeliverables.filter(i => i.type === "Buyer Persona"),
    "User Persona":  productDeliverables.filter(i => i.type === "User Persona"),
  };

  return (
    <div className={`flex-1 overflow-y-auto ${d ? "bg-gray-950" : "bg-gray-50"}`}>
      {showCoverPicker && (
        <CoverPickerModal
          dark={d}
          onClose={() => setShowCoverPicker(false)}
          onUpload={() => { setShowCoverPicker(false); coverInputRef.current.click(); }}
          onSelect={handleSelectExisting}
        />
      )}
      {/* Banner */}
      <div
        className="relative flex-shrink-0 group/cover"
        style={{ height: 200, backgroundColor: color, backgroundImage: coverUrl ? `url(${coverUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {isEditor && (
          <>
            <button
              onClick={() => !coverUploading && setShowCoverPicker(true)}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-black/40 text-white opacity-0 group-hover/cover:opacity-100 transition-opacity hover:bg-black/60 disabled:cursor-not-allowed"
              disabled={coverUploading}
            >
              {coverUploading ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              )}
              {coverUploading ? "Subiendo..." : "Cambiar portada"}
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          </>
        )}
      </div>

      <div style={{ maxWidth: "1600px", margin: "0 auto", paddingLeft: "2rem", paddingRight: "2rem", paddingTop: "2rem", paddingBottom: "4rem" }}>
        {/* Back + title */}
        <button onClick={() => navigate("/")} className={`flex items-center gap-2 text-sm font-medium mb-4 ${d ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-900"}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Volver
        </button>
        <h1 className={`text-3xl font-bold mb-1 ${d ? "text-gray-100" : "text-gray-900"}`}>{product}</h1>
        <p className={`text-sm mb-10 ${d ? "text-gray-500" : "text-gray-400"}`}>{productDeliverables.length} entregable{productDeliverables.length !== 1 ? "s" : ""}</p>

        {/* Persona sections */}
        {PERSONA_TYPES.map(type => {
          const items = personaByType[type];
          return (
            <div key={type} className={`mb-10 pb-10 border-b ${d ? "border-gray-800" : "border-gray-100"}`}>
              <div className="flex items-center justify-between mb-5">
                <h2 className={`text-xl font-bold ${d ? "text-gray-100" : "text-gray-900"}`}>{type}</h2>
                {isEditor && (
                  <button
                    onClick={() => navigate("/añadir-research", { state: { type, product } })}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold ${secBtn(d)}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Añadir
                  </button>
                )}
              </div>

              {items.length > 0 ? (
                <div className="space-y-6">
                  {items.map(inv => (
                    <div key={inv.id} className={`rounded-2xl border overflow-hidden ${d ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"}`}>
                      {/* Investigation title bar */}
                      <div className={`px-5 py-3 border-b flex items-center justify-between ${d ? "border-gray-700 bg-gray-800/50" : "border-gray-100 bg-gray-50"}`}>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${d ? "text-gray-100" : "text-gray-900"}`}>{inv.title}</p>
                          <p className={`text-xs mt-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}>{inv.date} · {inv.personas?.length || 0} persona{(inv.personas?.length || 0) !== 1 ? "s" : ""}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/research/${toSlug(inv.title)}`)}
                          className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold ml-3 ${d ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"}`}
                        >
                          Ver research completo
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                      {/* Personas — compact 3-col */}
                      {inv.personas && inv.personas.length > 0 && (
                        <div className="p-5 grid grid-cols-3 gap-4">
                          {inv.personas.map((p, i) => {
                            const nivelPct = { "básico": 33, "intermedio": 66, "avanzado": 100 }[(p.nivelTec || "").toLowerCase()] || null;
                            return (
                              <div key={i} className={`rounded-xl border overflow-hidden ${d ? "border-gray-700" : "border-gray-200"}`}>
                                <div className="px-4 py-3 flex items-center gap-2.5" style={{ backgroundColor: type === "Buyer Persona" ? "#2563EB" : "#00B369" }}>
                                  <div className="w-8 h-8 rounded-full flex items-end justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.25)" }}>
                                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-white/70 text-xs">{type}</p>
                                    <p className="text-white text-sm font-bold truncate">{p.nombre || `Persona ${i + 1}`}</p>
                                  </div>
                                </div>
                                <div className={`p-3 space-y-2 ${d ? "bg-gray-800" : "bg-white"}`}>
                                  {type === "Buyer Persona" ? (<>
                                    {(p.cargo || p.edad) && <div className="grid grid-cols-2 gap-2">
                                      {p.cargo && <div><p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>Cargo</p><p className={`text-xs font-semibold ${d ? "text-gray-200" : "text-gray-800"}`}>{p.cargo}</p></div>}
                                      {p.edad && <div><p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>Edad</p><p className={`text-xs font-semibold ${d ? "text-gray-200" : "text-gray-800"}`}>{p.edad}</p></div>}
                                    </div>}
                                    {(p.ubicacion || p.nivelTec) && <div className="grid grid-cols-2 gap-2">
                                      {p.ubicacion && <div><p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>Ubicación</p><p className={`text-xs font-semibold ${d ? "text-gray-200" : "text-gray-800"}`}>{p.ubicacion}</p></div>}
                                      {p.nivelTec && <div><p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>Nivel tec.</p><p className={`text-xs font-semibold mb-1 ${d ? "text-gray-200" : "text-gray-800"}`}>{p.nivelTec}</p>{(() => { const pct = { "básico": 33, "intermedio": 66, "avanzado": 100 }[(p.nivelTec || "").toLowerCase()] || null; return pct ? <div className={`h-1 rounded-full overflow-hidden ${d ? "bg-gray-700" : "bg-gray-100"}`}><div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} /></div> : null; })()}</div>}
                                    </div>}
                                    {(p.rubro || p.personal) && <div className="grid grid-cols-2 gap-2">
                                      {p.rubro && <div><p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>Rubro</p><p className={`text-xs font-semibold ${d ? "text-gray-200" : "text-gray-800"}`}>{p.rubro}</p></div>}
                                      {p.personal && <div><p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>Personal</p><p className={`text-xs font-semibold ${d ? "text-gray-200" : "text-gray-800"}`}>{p.personal}</p></div>}
                                    </div>}
                                  </>) : (<>
                                    {(p.cargo || p.edad) && <div className="grid grid-cols-2 gap-2">
                                      {p.cargo && <div><p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>Cargo</p><p className={`text-xs font-semibold ${d ? "text-gray-200" : "text-gray-800"}`}>{p.cargo}</p></div>}
                                      {p.edad && <div><p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>Edad</p><p className={`text-xs font-semibold ${d ? "text-gray-200" : "text-gray-800"}`}>{p.edad}</p></div>}
                                    </div>}
                                    {(p.ubicacion || p.nivelTec) && <div className="grid grid-cols-2 gap-2">
                                      {p.ubicacion && <div><p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>Ubicación</p><p className={`text-xs font-semibold ${d ? "text-gray-200" : "text-gray-800"}`}>{p.ubicacion}</p></div>}
                                      {p.nivelTec && <div><p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>Nivel tec.</p><p className={`text-xs font-semibold mb-1 ${d ? "text-gray-200" : "text-gray-800"}`}>{p.nivelTec}</p>{(() => { const pct = { "básico": 33, "intermedio": 66, "avanzado": 100 }[(p.nivelTec || "").toLowerCase()] || null; return pct ? <div className={`h-1 rounded-full overflow-hidden ${d ? "bg-gray-700" : "bg-gray-100"}`}><div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} /></div> : null; })()}</div>}
                                    </div>}
                                    {(p.rubro || p.tiempoNegocio) && <div className="grid grid-cols-2 gap-2">
                                      {p.rubro && <div><p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>Rubro</p><p className={`text-xs font-semibold ${d ? "text-gray-200" : "text-gray-800"}`}>{p.rubro}</p></div>}
                                      {p.tiempoNegocio && <div><p className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>Tiempo negocio</p><p className={`text-xs font-semibold ${d ? "text-gray-200" : "text-gray-800"}`}>{p.tiempoNegocio}</p></div>}
                                    </div>}
                                  </>)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`rounded-xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center ${d ? "border-gray-700" : "border-gray-200"}`}>
                  <svg className={`w-8 h-8 mb-3 ${d ? "text-gray-600" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  <p className={`text-sm font-medium mb-1 ${d ? "text-gray-400" : "text-gray-600"}`}>No hay research de {type} para {product}</p>
                  <p className={`text-xs mb-4 ${d ? "text-gray-600" : "text-gray-400"}`}>Añade la primera para este producto</p>
                  {isEditor && (
                    <button
                      onClick={() => navigate("/añadir-research", { state: { type, product } })}
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold ${secBtn(d)}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      Añadir {type}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Research */}
        <div className="mb-10">
          <h2 className={`text-xl font-bold mb-5 ${d ? "text-gray-100" : "text-gray-900"}`}>Research</h2>
          <div className="grid grid-cols-2 gap-5">
            {Object.entries(byType).map(([type, items]) => (
              <div key={type} className={`rounded-xl border p-5 ${d ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"}`}>
                <h3 className={`font-semibold text-base mb-1 ${d ? "text-gray-100" : "text-gray-900"}`}>{type}</h3>
                <p className={`text-sm mb-3 ${d ? "text-gray-500" : "text-gray-400"}`}>{items.length} entregable{items.length !== 1 ? "s" : ""}</p>
                {items.length > 0 ? (
                  <ul className="space-y-1.5">
                    {items.slice(0, 4).map(item => (
                      <li key={item.id}>
                        <button onClick={() => navigate(`/research/${toSlug(item.title)}`)} className={`text-sm text-left hover:underline line-clamp-1 ${d ? "text-green-400" : "text-green-700"}`}>{item.title}</button>
                      </li>
                    ))}
                    {items.length > 4 && <li className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>+{items.length - 4} más</li>}
                  </ul>
                ) : (
                  <p className={`text-sm ${d ? "text-gray-600" : "text-gray-300"}`}>Sin entregables aún</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Otros productos */}
        <div className={`pt-8 border-t ${d ? "border-gray-800" : "border-gray-200"}`}>
          <h2 className={`text-xl font-bold mb-4 ${d ? "text-gray-100" : "text-gray-900"}`}>Otros productos</h2>
          <div className="grid grid-cols-3 gap-4">
            {PRODUCTS.filter(p => p !== product).map(p => (
              <ProductCard key={p} product={p} deliverables={deliverables} coverUrl={allCovers[p]} dark={d}
                onClick={() => navigate(`/producto/${encodeURIComponent(p)}`)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HOME PAGE ──
function HomePage() {
  const navigate = useNavigate();
  const { dark: d, deliverables, loadingDeliverables, setActiveFilter } = useApp();
  const [search, setSearch] = useState("");
  const [jiraBaseUrl, setJiraBaseUrl] = useState("");
  const [productCovers, setProductCovers] = useState({});

  useEffect(() => {
    loadJiraConfig().then(cfg => { if (cfg.baseUrl) setJiraBaseUrl(cfg.baseUrl.replace(/\/$/, "")); });
  }, []);

  useEffect(() => {
    loadAllProductCoverUrls().then(setProductCovers);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      const term = search.trim();
      const matchedProduct = PRODUCTS.find(p => p.toLowerCase() === term.toLowerCase());
      if (matchedProduct) {
        setActiveFilter({ type: "Tipo de entregable", team: null, search: "", product: matchedProduct });
      } else {
        setActiveFilter({ type: "Tipo de entregable", team: null, search: term, product: null });
      }
      navigate("/research");
    }
  };

  const recent = [...deliverables].slice(0, 4);

  return (
    <div className={`flex-1 overflow-y-auto ${d ? "bg-gray-950" : "bg-gray-50"}`}>

      {/* Hero — centered */}
      <div className="relative overflow-hidden" style={{
        background: d
          ? "linear-gradient(160deg,#0a1628 0%,#0d1f12 50%,#0a1628 100%)"
          : "linear-gradient(160deg,#e8f5ee 0%,#f0fdf4 40%,#dff2ea 100%)",
        borderBottom: `1px solid ${d ? "#1a2535" : "#b6e8cc"}`
      }}>
        <div className="absolute -top-16 -right-16 w-72 h-72 opacity-10" style={{ background: "radial-gradient(circle,#00B369,transparent)", borderRadius: "2.5rem", transform: "rotate(15deg)" }} />
        <div className="absolute -bottom-12 -left-12 w-60 h-60 opacity-15" style={{ borderRadius: "2rem", transform: "rotate(20deg)", border: "solid 1px #00B369" }} />

        <div className="relative" style={{ maxWidth: 800, margin: "0 auto", padding: "5rem 2rem 4rem", textAlign: "center" }}>
          <div className="inline-flex items-center text-sm font-semibold mb-4" style={{ color: "#00B369" }}>
            Research Portal
          </div>
          <h1 className={`text-5xl font-bold mb-4 leading-tight ${d ? "text-gray-100" : "text-gray-900"}`}>
            Repositorio de <span style={{ color: "#00B369" }}>Strategic Research</span>
          </h1>
          <p className={`text-lg mb-8 ${d ? "text-gray-400" : "text-gray-500"}`}>
            Centraliza y encuentra todos los entregables de research del equipo.
          </p>
          <div className="relative max-w-lg mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Busca un research o producto y presiona enter"
              className={`w-full pl-12 pr-4 py-4 text-sm rounded-2xl border focus:outline-none focus:ring-2 focus:ring-green-400 ${d ? "bg-gray-800/80 border-gray-700 text-gray-200 placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`}
              style={{ boxShadow: d ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.08)" }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 2rem 4rem" }}>

        {/* Crear solicitud banner */}
        <div className={`rounded-2xl p-6 mb-10 flex items-center justify-between gap-6 ${d ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"}`}
          style={{ boxShadow: d ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#00B369,#00a560)" }}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <div>
              <p className={`font-bold text-base ${d ? "text-gray-100" : "text-gray-900"}`}>¿Necesitas un research?</p>
              <p className={`text-sm ${d ? "text-gray-400" : "text-gray-500"}`}>Crea una solicitud directamente en Jira y el equipo la tendrá en el radar.</p>
            </div>
          </div>
          {jiraBaseUrl && (
            <a href={`${jiraBaseUrl}/secure/CreateIssue!default.jspa`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#00B369,#00a560)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Crear solicitud
            </a>
          )}
        </div>

        {/* Por producto */}
        <div className="mb-10">
          <h2 className={`text-lg font-bold mb-4 ${d ? "text-gray-100" : "text-gray-900"}`}>Productos</h2>
          <div className="grid grid-cols-3 gap-4">
            {loadingDeliverables
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} dark={d} />)
              : PRODUCTS.map(p => (
                  <ProductCard key={p} product={p} deliverables={deliverables} coverUrl={productCovers[p]} dark={d}
                    onClick={() => navigate(`/producto/${encodeURIComponent(p)}`)} />
                ))
            }
          </div>
        </div>

        {/* Recientes */}
        <div>
          <h2 className={`text-lg font-bold mb-4 ${d ? "text-gray-100" : "text-gray-900"}`}>Recientes</h2>
          <div className="grid grid-cols-2 gap-3">
            {loadingDeliverables
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`rounded-xl border p-4 animate-pulse ${d ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
                    <div className={`h-4 w-3/4 rounded mb-2 ${d ? "bg-gray-800" : "bg-gray-200"}`} />
                    <div className="flex gap-2">
                      <div className={`h-3 w-16 rounded-full ${d ? "bg-gray-800" : "bg-gray-200"}`} />
                      <div className={`h-3 w-20 rounded-full ${d ? "bg-gray-800" : "bg-gray-200"}`} />
                    </div>
                  </div>
                ))
              : recent.map(item => {
              const tc = { amber: d ? "bg-amber-900/40 text-amber-300 border-amber-700" : "bg-amber-50 text-amber-700 border-amber-200", blue: d ? "bg-blue-900/40 text-blue-300 border-blue-700" : "bg-blue-50 text-blue-700 border-blue-200" };
              const color = tc[item.typeColor] || tc.amber;
              const productTag = item.tags && item.tags.find(t => PRODUCTS.includes(t));
              const pc = productTag ? (PRODUCT_COLORS[productTag] || "#00B369") : null;
              return (
                <button key={item.id} onClick={() => navigate(`/research/${toSlug(item.title)}`)}
                  className={`text-left rounded-xl border p-4 flex flex-col transition-all group ${d ? "bg-gray-900 border-gray-800 hover:border-green-700" : "bg-white border-gray-200 hover:border-green-400 hover:shadow-sm"}`}>
                  <div className="min-w-0 w-full">
                    <p className={`font-semibold text-sm leading-snug mb-1.5 truncate ${d ? "text-gray-100" : "text-gray-900"}`}>{item.title}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${color}`}>{item.type}</span>
                      {productTag && pc && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${d ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: pc }} />
                          {productTag}
                        </span>
                      )}
                      <span className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>{item.date}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LIST PAGE ──

const PAGE_SIZE = 9;

function ListPage() {
  const navigate = useNavigate();
  const { dark, deliverables, loadingDeliverables, activeFilter, isEditor, editors } = useApp();
  const dk = dark;
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Tipo de entregable");
  const [filterProduct, setFilterProduct] = useState("Todos los productos");
  const [filterEstado, setFilterEstado] = useState("Persona asignada");

  // Sync from sidebar activeFilter
  useEffect(() => {
    if (!activeFilter) return;
    if (activeFilter.type) setFilterType(activeFilter.type);
    if (activeFilter.product) setFilterProduct(activeFilter.product);
    if (activeFilter.search) setSearch(activeFilter.search);
  }, [activeFilter]);

  const activeTeam = activeFilter?.team || null;

  const filtered = deliverables.filter(d => {
    const typeMatch = filterType === "Tipo de entregable" || d.type === filterType;
    const teamMatch = !activeTeam || d.team.includes(activeTeam);
    const productMatch = filterProduct === "Todos los productos" || d.tags.includes(filterProduct);
    const estadoMatch = filterEstado === "Persona asignada" || d.team.includes(filterEstado);
    const searchMatch = !search || d.title.toLowerCase().includes(search.toLowerCase());
    return typeMatch && teamMatch && productMatch && estadoMatch && searchMatch;
  });

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  // Reset on filter change
  useEffect(() => { setVisible(PAGE_SIZE); }, [search, filterType, filterProduct, filterEstado, activeFilter]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setVisible(v => v + PAGE_SIZE);
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore]);

  const s = {
    panel:    dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
    p1:       dk ? "text-gray-100" : "text-gray-900",
    p2:       dk ? "text-gray-400" : "text-gray-500",
    emptyBox: dk ? "bg-gray-800" : "bg-gray-100",
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className={`border-b py-5 sticky top-0 z-10 ${s.panel}`}>
        <div style={{maxWidth:"1600px", margin:"0 auto", paddingLeft:"2rem", paddingRight:"2rem"}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-2xl font-bold ${s.p1}`}>Todos los research</h1>
              <p className={`text-base ${s.p2}`}>{filtered.length} research encontrados</p>
            </div>
            {isEditor && (
              <button onClick={() => navigate("/añadir-research")} className={`flex items-center gap-2 px-4 py-2.5 text-sm ${primBtn}`} style={{backgroundColor:"#00B369"}}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir nueva
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-2/5">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Buscar research..." value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent ${dk ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`}
                style={{height:"40px"}} />
            </div>
            <div className="flex items-center gap-3 w-3/5">
              <div className="flex-1"><CustomSelect dark={dk} value={filterType} onChange={v => setFilterType(v)} options={TYPES.map(f => ({ value: f, label: f }))} fullWidth /></div>
              <div className="flex-1"><CustomSelect dark={dk} value={filterProduct} onChange={v => setFilterProduct(v)} options={[{ value: "Todos los productos", label: "Todos los productos" }, ...PRODUCTS.map(p => ({ value: p, label: p }))]} fullWidth /></div>
              <div className="flex-1"><CustomSelect dark={dk} value={filterEstado} onChange={v => setFilterEstado(v)} options={[{ value: "Persona asignada", label: "Persona asignada" }, ...editors.map(e => ({ value: e, label: e }))]} fullWidth /></div>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:"1600px", margin:"0 auto", width:"100%", paddingLeft:"2rem", paddingRight:"2rem", paddingTop:"1.75rem", paddingBottom:"1.75rem"}}>
        {loadingDeliverables ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <CardSkeleton key={i} dark={dk} />)}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {shown.map(item => <Card key={item.id} item={item} dark={dk} />)}
            </div>
            <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-4">
              {hasMore && <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-green-500 animate-spin" />}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${s.emptyBox}`}>
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className={`text-xl font-semibold mb-1 ${s.p1}`}>Sin resultados</p>
            <p className={`text-base ${s.p2}`}>No hay research que coincida.</p>
          </div>
        )}
      </div>
    </main>
  );
}

// ── SIDEBAR (shared) ──
function Sidebar({ onSettings, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark: dk, setDark, isSuperAdmin, roleLoaded } = useApp();
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
      className={`flex flex-col flex-shrink-0 border-r overflow-hidden ${s.panel}`}
      style={{ width, transition: "width 200ms ease" }}
    >
      {/* Header */}
      <div className={`flex items-center border-b flex-shrink-0 ${s.div} ${expanded ? "px-4 py-4 justify-between" : "px-3 py-4 justify-center"}`}>
        {expanded ? (
          <>
            <div className="flex items-center gap-6">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor:"#00B369"}}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path d="M11.9995 12.0001H12.0095M15.535 15.5357C10.8488 20.222 5.46685 22.438 3.51423 20.4854C1.56161 18.5328 3.77769 13.1509 8.46398 8.46461C13.1503 3.77832 18.5322 1.56224 20.4848 3.51486C22.4374 5.46748 20.2213 10.8494 15.535 15.5357ZM15.535 8.46443C20.2213 13.1507 22.4374 18.5326 20.4848 20.4852C18.5321 22.4379 13.1502 20.2218 8.46394 15.5355C3.77765 10.8492 1.56157 5.4673 3.51419 3.51468C5.46681 1.56206 10.8487 3.77814 15.535 8.46443ZM12.4995 12.0001C12.4995 12.2763 12.2757 12.5001 11.9995 12.5001C11.7234 12.5001 11.4995 12.2763 11.4995 12.0001C11.4995 11.724 11.7234 11.5001 11.9995 11.5001C12.2757 11.5001 12.4995 11.724 12.4995 12.0001Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>                </svg>
              </div>
              <div className="overflow-hidden">
                <p className={`text-base font-bold whitespace-nowrap ${s.p1}`}>Hola, Bienvenido</p>
                <p className={`text-sm whitespace-nowrap truncate max-w-[130px] ${s.p2}`}>{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario"}</p>
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
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{backgroundColor:"#00B369"}}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path d="M11.9995 12.0001H12.0095M15.535 15.5357C10.8488 20.222 5.46685 22.438 3.51423 20.4854C1.56161 18.5328 3.77769 13.1509 8.46398 8.46461C13.1503 3.77832 18.5322 1.56224 20.4848 3.51486C22.4374 5.46748 20.2213 10.8494 15.535 15.5357ZM15.535 8.46443C20.2213 13.1507 22.4374 18.5326 20.4848 20.4852C18.5321 22.4379 13.1502 20.2218 8.46394 15.5355C3.77765 10.8492 1.56157 5.4673 3.51419 3.51468C5.46681 1.56206 10.8487 3.77814 15.535 8.46443ZM12.4995 12.0001C12.4995 12.2763 12.2757 12.5001 11.9995 12.5001C11.7234 12.5001 11.4995 12.2763 11.4995 12.0001C11.4995 11.724 11.7234 11.5001 11.9995 11.5001C12.2757 11.5001 12.4995 11.724 12.4995 12.0001Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>            </svg>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden ${expanded ? "px-3" : "px-2"}`}>
        {/* Inicio */}
        <button title={!expanded ? "Inicio" : undefined} onClick={() => navigate("/")}
          className={`w-full flex items-center rounded-lg font-medium ${expanded ? "gap-3 px-3 py-2.5 text-base" : "justify-center py-2.5"} ${location.pathname === "/" ? s.navOn : s.navOff}`}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          {expanded && <span className="whitespace-nowrap">Inicio</span>}
        </button>

        {NAV.map(item => {
          const isActive = location.pathname.startsWith("/research");
          return (
          <button key={item.label} title={!expanded ? item.label : undefined}
            onClick={() => navigate("/research")}
            className={`w-full flex items-center rounded-lg font-medium ${expanded ? "gap-3 px-3 py-2.5 text-base" : "justify-center py-2.5"} ${isActive ? s.navOn : s.navOff}`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
            </svg>
            {expanded && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
          </button>);
        })}

        {/* Productos */}
        <div className={expanded ? "pt-3" : "pt-3"}>
          {expanded && <p className={`px-3 pb-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${s.muted}`}>Productos</p>}
          {PRODUCTS.map(product => {
            const isActive = location.pathname === `/producto/${encodeURIComponent(product)}`;
            const pc = PRODUCT_COLORS[product] || "#00B369";
            return (
              <button key={product} title={!expanded ? product : undefined}
                onClick={() => navigate(`/producto/${encodeURIComponent(product)}`)}
                className={`w-full flex items-center rounded-lg font-medium ${expanded ? "gap-3 px-3 py-2.5 text-base" : "justify-center py-2.5"} ${isActive ? s.navOn : s.navOff}`}>
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pc }} />
                </div>
                {expanded && <span className="whitespace-nowrap overflow-hidden">{product}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className={`border-t flex-shrink-0 ${s.div} ${expanded ? "px-3 py-4 space-y-1" : "px-2 py-4 space-y-1"}`}>


        {/* Configuración — solo super admin */}
        {roleLoaded && isSuperAdmin && (
          <button title={!expanded ? "Configuración" : undefined}
            onClick={() => onSettings()}
            className={`w-full flex items-center rounded-lg ${expanded ? "gap-3 px-3 py-2.5 text-base" : "justify-center py-2.5"} ${s.navOff}`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3" strokeWidth={1.8}/></svg>
            {expanded && <span className="whitespace-nowrap">Configuración</span>}
          </button>
        )}

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
            <div className={`w-8 h-4 rounded-full flex items-center px-0.5 flex-shrink-0 ${dk ? "justify-end" : "justify-start"}`} style={{backgroundColor: dk ? "#00B369" : "#e5e7eb"}}>
              <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
            </div>
          )}
        </button>

        {/* Cerrar sesión */}
        <button title={!expanded ? "Cerrar sesión" : undefined}
          onClick={() => supabase.auth.signOut()}
          className={`w-full flex items-center rounded-lg ${expanded ? "gap-3 px-3 py-2.5 text-base" : "justify-center py-2.5"} ${s.navOff}`}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          {expanded && <span className="whitespace-nowrap">Cerrar sesión</span>}
        </button>

      </div>
    </aside>
  );
}

// ── ROOT ──
// ── EDIT PAGE ──
function EditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const { dark: d, deliverables, handleUpdate, showToast, editors } = useApp();
  const item = deliverables.find(x => toSlug(x.title) === slug) || location.state?.item;

  if (!item) return <div className={`flex-1 flex items-center justify-center ${d ? "bg-gray-950 text-gray-400" : "bg-gray-50 text-gray-500"}`}>Research no encontrado.</div>;

  const today = new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
  const [form, setForm] = useState({ ...item });
  const [personaTab, setPersonaTab] = useState(0);
  const [jiraLoading, setJiraLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [jiraError, setJiraError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setType = (t) => {
    if (PERSONA_TYPES.includes(t)) {
      setForm(f => ({ ...f, type: t, personas: f.personas?.length ? f.personas : [t === "Buyer Persona" ? EMPTY_BUYER() : EMPTY_USER()] }));
      setPersonaTab(0);
    } else {
      setForm(f => ({ ...f, type: t, personas: [] }));
    }
  };
  const setPersonaField = (idx, field, val) => setForm(f => ({ ...f, personas: f.personas.map((p, i) => i === idx ? { ...p, [field]: val } : p) }));
  const addPersona = () => { const empty = form.type === "Buyer Persona" ? EMPTY_BUYER() : EMPTY_USER(); setForm(f => ({ ...f, personas: [...f.personas, empty] })); setPersonaTab(form.personas.length); };
  const removePersona = (idx) => { setForm(f => ({ ...f, personas: f.personas.filter((_, i) => i !== idx) })); setPersonaTab(t => Math.max(0, t - (idx <= t ? 1 : 0))); };
  const toggleArr = (k, v) => setForm(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }));

  const handleJiraUrl = async (url) => {
    set("jiraUrl", url); setJiraError("");
    const match = url.match(/\/browse\/([A-Z]+-\d+)/i);
    if (!match) return;
    const key = match[1].toUpperCase(); set("jira", key);
    const cfg = await loadJiraConfig();
    if (!cfg.email || !cfg.token) { setJiraError("Configura tus credenciales en Configuración del menú."); return; }
    const base = (cfg.baseUrl || url.split("/browse/")[0]).replace(/\/$/, "");
    setJiraLoading(true);
    try {
      const auth = btoa(`${cfg.email.trim()}:${cfg.token.trim()}`);
      const res = await fetch(`/api/jira/${key}`, { headers: { "x-jira-base": base, "x-jira-auth": auth } });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.errorMessages?.[0] || data.error || `HTTP ${res.status}`);
      set("jira", `${key}: ${data.fields.summary}`);
      set("jiraStatus", data.fields.status?.name?.toUpperCase() || "EN CURSO");
      setJiraError("");
    } catch (e) { setJiraError(`No se pudo obtener el ticket (${e.message}).`); }
    finally { setJiraLoading(false); }
  };

  const handleSave = (status) => {
    if (saving || !form.title.trim()) return;
    setSaving(true);
    const updated = { ...form, status, typeColor: TYPE_COLORS[form.type] || item.typeColor };
    handleUpdate(updated);
    showToast({ title: status === "Publicado" ? "Research publicado" : "Borrador guardado", subtitle: "Los cambios se han guardado correctamente." });
    navigate(`/research/${toSlug(form.title)}`);
  };

  const inp = `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 ${d ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`;
  const lbl = `block text-xs font-semibold mb-1 ${d ? "text-gray-400" : "text-gray-600"}`;

  const SectionTitle = ({ children }) => (
    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${d ? "text-gray-500" : "text-gray-400"}`}>{children}</p>
  );

  const DateInput = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const parsed = value ? new Date(value + "T12:00:00") : new Date();
    const [cursor, setCursor] = useState({ y: parsed.getFullYear(), m: parsed.getMonth() });
    const todayD = new Date();
    const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
    const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    useEffect(() => {
      const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);
    const cells = () => {
      const first = new Date(cursor.y, cursor.m, 1).getDay();
      const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
      const prevDays = new Date(cursor.y, cursor.m, 0).getDate();
      const grid = [];
      for (let i = first - 1; i >= 0; i--) grid.push({ day: prevDays - i, cur: false });
      for (let i = 1; i <= days; i++) grid.push({ day: i, cur: true });
      while (grid.length < 42) grid.push({ day: grid.length - days - first + 1, cur: false });
      return grid;
    };
    const isSelected = (day, cur) => { if (!value || !cur) return false; const s = new Date(value + "T12:00:00"); return s.getFullYear() === cursor.y && s.getMonth() === cursor.m && s.getDate() === day; };
    const isToday = (day, cur) => cur && todayD.getFullYear() === cursor.y && todayD.getMonth() === cursor.m && todayD.getDate() === day;
    const select = (day, cur) => {
      let y = cursor.y, m = cursor.m;
      if (!cur) { if (day > 15) { m--; if (m < 0) { m = 11; y--; } } else { m++; if (m > 11) { m = 0; y++; } } }
      onChange(`${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`);
      setCursor({ y, m }); setOpen(false);
    };
    const prev = () => setCursor(c => c.m === 0 ? { y: c.y-1, m: 11 } : { y: c.y, m: c.m-1 });
    const next = () => setCursor(c => c.m === 11 ? { y: c.y+1, m: 0 } : { y: c.y, m: c.m+1 });
    const display = value ? new Date(value + "T12:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "") : "Seleccionar fecha";
    return (
      <div className="relative" ref={ref}>
        <button type="button" onClick={() => setOpen(o => !o)} className={`w-full flex items-center gap-2 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 ${d ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-750" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
          <svg className={`w-4 h-4 flex-shrink-0 ${d ? "text-gray-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span className={value ? "" : (d ? "text-gray-500" : "text-gray-400")}>{display}</span>
        </button>
        {open && (
          <div className={`absolute z-50 mt-1 w-72 rounded-2xl border shadow-xl p-4 ${d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={prev} className={`w-8 h-8 flex items-center justify-center rounded-lg ${d ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>
              <span className={`text-sm font-semibold ${d ? "text-gray-100" : "text-gray-900"}`}>{MONTHS[cursor.m]} {cursor.y}</span>
              <button type="button" onClick={next} className={`w-8 h-8 flex items-center justify-center rounded-lg ${d ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></button>
            </div>
            <div className="grid grid-cols-7 mb-1">{DAYS.map(day => <div key={day} className={`text-center text-xs font-medium py-1 ${d ? "text-gray-500" : "text-gray-400"}`}>{day}</div>)}</div>
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells().map((cell, i) => { const sel = isSelected(cell.day, cell.cur); const tod = isToday(cell.day, cell.cur); return (
                <button key={i} type="button" onClick={() => select(cell.day, cell.cur)} className={`h-9 w-full flex items-center justify-center rounded-lg text-sm transition-colors ${sel ? "text-white font-semibold" : ""} ${!sel && cell.cur ? (d ? "text-gray-200 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100") : ""} ${!cell.cur ? (d ? "text-gray-600 hover:bg-gray-800" : "text-gray-300 hover:bg-gray-50") : ""} ${tod && !sel ? (d ? "font-semibold text-green-400" : "font-semibold text-green-600") : ""}`} style={sel ? { backgroundColor: "#00B369" } : {}}>{cell.day}</button>
              ); })}
            </div>
            <div className={`mt-3 pt-3 border-t flex justify-between ${d ? "border-gray-700" : "border-gray-100"}`}>
              <button type="button" onClick={() => { const n = new Date(); onChange(`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`); setCursor({ y: n.getFullYear(), m: n.getMonth() }); setOpen(false); }} className={`text-xs font-medium ${d ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>Hoy</button>
              <button type="button" onClick={() => setOpen(false)} className={`text-xs font-medium ${d ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Convert stored date string to YYYY-MM-DD for DateInput
  const toIsoDate = (str) => {
    if (!str) return new Date().toISOString().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const d = new Date(str); return isNaN(d) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
  };

  return (
    <div className={`flex-1 overflow-y-auto ${d ? "bg-gray-950" : "bg-gray-50"}`}>

      {/* Top bar */}
      <div className={`border-b px-8 py-4 sticky top-0 z-10 ${d ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
        <button onClick={() => navigate("/research")} className={`flex items-center gap-2 text-sm font-semibold ${d ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-900"}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Volver a todos los research
        </button>
      </div>

      <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "2rem 2rem 4rem" }}>

        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold mb-1 ${d ? "text-gray-100" : "text-gray-900"}`}>Editar research</h1>
          <div className="flex items-center gap-1.5">
            <p className={`text-base font-medium pr-2 ${d ? "text-gray-400" : "text-gray-500"}`}>{window.location.origin}/research/{toSlug(item.title)}</p>
            <button type="button" title="Copiar enlace" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/research/${toSlug(item.title)}`)} style={{ width: 38, height: 38 }} className={`flex items-center justify-center rounded-lg border flex-shrink-0 ${d ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Columna principal */}
          <div className="col-span-3 space-y-4">

            {/* Título + Descripción */}
            <div className="space-y-3">
              <div>
                <label className={lbl}>Título <span className="text-green-500">*</span></label>
                <input className={`w-full px-3 py-2 text-xl font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 ${d ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Título del research..." />
              </div>
              <div>
                <label className={lbl}>Descripción corta</label>
                <textarea className={inp + " resize-none"} rows={2} placeholder="Lo que verán en la card al buscar este research..." value={form.descripcion || ""} onChange={e => set("descripcion", e.target.value)} />
              </div>
            </div>

            {/* Contenido */}
            <div className={`rounded-2xl border p-5 space-y-4 ${d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
              <SectionTitle>Contenido</SectionTitle>
              <div><label className={lbl}>Objetivo del research</label><RichEditor dark={d} value={form.objetivo} onChange={v => set("objetivo", v)} placeholder="¿Qué se busca lograr con este entregable?" /></div>
              <div><label className={lbl}>Usuario</label><RichEditor dark={d} value={form.usuario} onChange={v => set("usuario", v)} placeholder="Perfil de los usuarios involucrados" /></div>
              <div><label className={lbl}>Hallazgos y conclusiones</label><RichEditor dark={d} value={form.hallazgos} onChange={v => set("hallazgos", v)} placeholder="Principales hallazgos o estado actual" /></div>
            </div>

            {/* Referencias */}
            <div className={`rounded-2xl border p-5 space-y-4 ${d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
              <SectionTitle>Referencias</SectionTitle>
              <div>
                <label className={lbl}>Link de Google Drive</label>
                <input className={inp} type="url" placeholder="https://drive.google.com/..." value={form.archivoUrl || ""} onChange={e => { const url = e.target.value; set("archivoUrl", url); const id2 = getDriveId(url); if (id2) fetch(`/api/gdrive/${id2}`).then(r => r.json()).then(data => { if (data.title) set("archivo", data.title); }).catch(() => {}); }} />
              </div>
              <div>
                <label className={lbl}>Link de la reunión</label>
                <input className={inp} type="url" placeholder="https://drive.google.com/file/d/... (MP4)" value={form.reunionUrl || ""} onChange={e => set("reunionUrl", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Link de Jira</label>
                <div className="relative">
                  <input className={inp} type="url" placeholder="https://empresa.atlassian.net/browse/UX-0000" value={form.jiraUrl || ""} onChange={e => handleJiraUrl(e.target.value)} />
                  {jiraLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><svg className="w-4 h-4 animate-spin text-green-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>}
                </div>
                {jiraError && <p className="mt-1 text-xs text-amber-500">{jiraError}</p>}
                {form.jira && !jiraLoading && (
                  <div className={`mt-2 rounded-lg border p-3 ${d ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                    <p className={`text-xs font-semibold leading-snug ${d ? "text-gray-100" : "text-gray-800"}`}>{form.jira}</p>
                    {form.jiraStatus && <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded border ${/done|closed|resolved|finaliz|complet/i.test(form.jiraStatus) ? (d ? "text-green-400 border-green-700 bg-green-900/40" : "text-green-700 border-green-200 bg-green-50") : (d ? "text-blue-400 border-blue-700 bg-blue-900/40" : "text-blue-700 border-blue-200 bg-blue-50")}`}>{form.jiraStatus}</span>}
                    <button type="button" onClick={() => { set("jira", ""); set("jiraStatus", ""); set("jiraUrl", ""); }} className={`block mt-1.5 text-xs ${d ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>Cambiar ticket</button>
                  </div>
                )}
              </div>
            </div>

            {/* Personas */}
            {PERSONA_TYPES.includes(form.type) && form.personas && form.personas.length > 0 && (
              <div className={`rounded-2xl border p-5 ${d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle>Personas</SectionTitle>
                  {form.personas.length < 3 && <button type="button" onClick={addPersona} className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 ${secBtn(d)}`}><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Añadir</button>}
                </div>
                <div className={`flex border-b mb-4 ${d ? "border-gray-700" : "border-gray-200"}`}>
                  {form.personas.map((p, i) => <div key={i} className="flex items-center"><button type="button" onClick={() => setPersonaTab(i)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${personaTab === i ? "border-green-500 text-green-600" : d ? "border-transparent text-gray-400 hover:text-gray-200" : "border-transparent text-gray-500 hover:text-gray-800"}`}>{p.nombre || `Persona ${i+1}`}</button>{form.personas.length > 1 && <button type="button" onClick={() => removePersona(i)} className={`-ml-1 mb-px w-4 h-4 flex items-center justify-center text-xs ${d ? "text-gray-600 hover:text-gray-300" : "text-gray-300 hover:text-gray-600"}`}>✕</button>}</div>)}
                </div>
                {(() => {
                  const p = form.personas[personaTab];
                  const fi = (field, placeholder) => <input className={inp} placeholder={placeholder} value={p[field] || ""} onChange={e => setPersonaField(personaTab, field, e.target.value)} />;
                  const group = (title, children) => <div className={`rounded-xl border p-4 ${d ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}><p className={`text-xs font-bold uppercase tracking-wider mb-3 ${d ? "text-gray-500" : "text-gray-400"}`}>{title}</p><div className="space-y-3">{children}</div></div>;
                  return (
                    <div className="space-y-4">
                      <div><label className={lbl}>Nombre</label>{fi("nombre","Nombre de la persona")}</div>
                      {group("Información personal", <><div className="grid grid-cols-2 gap-3"><div><label className={lbl}>Cargo</label>{fi("cargo","Cargo o rol")}</div><div><label className={lbl}>Edad</label>{fi("edad","Ej: 35 años")}</div></div><div><label className={lbl}>Ubicación</label>{fi("ubicacion","Ciudad / País")}</div><div><label className={lbl}>Nivel tecnológico</label>{fi("nivelTec","Básico / Medio / Avanzado")}</div><div><label className={lbl}>Herramientas usadas</label>{fi("herramientas","Excel, Slack, etc.")}</div></>)}
                      {group("Sobre el negocio", form.type === "Buyer Persona" ? <><div><label className={lbl}>Rubro</label>{fi("rubro","Sector o industria")}</div><div className="grid grid-cols-2 gap-3"><div><label className={lbl}>Personal</label>{fi("personal","Ej: 10-50 empleados")}</div><div><label className={lbl}>Tiempo de apertura</label>{fi("tiempoApertura","Ej: 5 años")}</div></div><div><label className={lbl}>Metas a futuro</label><RichEditor dark={d} value={p.metas||""} onChange={v => setPersonaField(personaTab,"metas",v)} placeholder="Metas y objetivos a futuro..." /></div></> : <><div><label className={lbl}>Rubro</label>{fi("rubro","Sector o industria")}</div><div><label className={lbl}>Tiempo en el negocio</label>{fi("tiempoNegocio","Ej: 3 años")}</div></>)}
                      {form.type === "Buyer Persona" && <>{group("Adquisición del producto", <RichEditor dark={d} value={p.adquisicion||""} onChange={v => setPersonaField(personaTab,"adquisicion",v)} placeholder="Razones de adquisición..." />)}{group("Comunicaciones", <RichEditor dark={d} value={p.comunicaciones||""} onChange={v => setPersonaField(personaTab,"comunicaciones",v)} placeholder="Canales de comunicación..." />)}</>}
                      {form.type === "User Persona" && <>{group("Objetivos y metas", <RichEditor dark={d} value={p.objetivos||""} onChange={v => setPersonaField(personaTab,"objetivos",v)} placeholder="Objetivos y metas del usuario..." />)}{group("Frustraciones y dolores", <RichEditor dark={d} value={p.dolores||""} onChange={v => setPersonaField(personaTab,"dolores",v)} placeholder="Frustraciones y dolores..." />)}</>}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Publicación */}
            <div className={`rounded-2xl border p-5 space-y-4 ${d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <SectionTitle>Publicación</SectionTitle>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${form.status === "Publicado" ? (d ? "bg-green-900/40 text-green-400 border-green-700" : "bg-green-50 text-green-700 border-green-200") : (d ? "bg-gray-800 text-gray-400 border-gray-600" : "bg-gray-100 text-gray-500 border-gray-300")}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${form.status === "Publicado" ? "bg-green-500" : "bg-gray-400"}`} />
                  {form.status}
                </span>
              </div>
              <div>
                <label className={lbl}>Fecha de publicación</label>
                <DateInput value={toIsoDate(form.date)} onChange={v => set("date", v)} />
              </div>
              <div className="flex gap-2 pt-1">
                {form.status !== "Publicado" && (
                  <button onClick={() => handleSave(form.status)} disabled={!form.title.trim() || saving} className={`flex-1 px-3 py-2 text-sm font-semibold disabled:opacity-40 ${secBtn(d)}`}>Guardar</button>
                )}
                <button
                  onClick={() => handleSave(form.status === "Publicado" ? "Publicado" : "Publicado")}
                  disabled={!form.title.trim() || saving}
                  className={`flex-1 px-3 py-2 text-sm disabled:opacity-40 ${primBtn}`}
                  style={{ backgroundColor: "#00B369" }}
                >
                  {form.status === "Publicado" ? "Guardar cambios" : "Publicar"}
                </button>
              </div>
            </div>

            {/* Clasificación */}
            <div className={`rounded-2xl border p-5 space-y-4 ${d ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
              <SectionTitle>Clasificación</SectionTitle>
              <div>
                <label className={lbl}>Tipo de entregable <span className="text-green-500">*</span></label>
                <select className={inp} value={form.type} onChange={e => setType(e.target.value)}>
                  <option value="" disabled>Seleccione</option>
                  {TYPES.slice(1).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Metodología</label>
                <select className={inp} value={form.metodologia || ""} onChange={e => set("metodologia", e.target.value)}>
                  <option value="">Sin especificar</option>
                  {METODOLOGIAS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Producto <span className="text-green-500">*</span></label>
                <select className={inp} value={form.tags[0] || ""} onChange={e => set("tags", e.target.value ? [e.target.value] : [])} style={!form.tags[0] ? { color: d ? "#6b7280" : "#9ca3af" } : {}}>
                  <option value="" disabled>Seleccione</option>
                  {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Persona asignada</label>
                <select className={inp} value={form.team[0] || ""} onChange={e => set("team", e.target.value ? [e.target.value] : [])} style={!form.team[0] ? { color: d ? "#6b7280" : "#9ca3af" } : {}}>
                  <option value="">Sin asignar</option>
                  {editors.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function EditorOnly({ children }) {
  const { isEditor } = useApp();
  const navigate = useNavigate();
  useEffect(() => { if (!isEditor) navigate("/research", { replace: true }); }, [isEditor]);
  return isEditor ? children : null;
}

function Layout({ toast, user }) {
  const { dark } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  return (
    <div className={`min-h-screen ${dark ? "bg-gray-950" : "bg-gray-50"}`} style={{ fontFamily: "'Inter', sans-serif" }}>
      <Toast toast={toast} />
      <div className="flex h-screen overflow-hidden">
        {showSettings && <SettingsModal dark={dark} onClose={() => setShowSettings(false)} />}
        <Sidebar onSettings={() => setShowSettings(true)} user={user} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/research" element={<ListPage />} />
          <Route path="/research/:id" element={<DetailPage />} />
          <Route path="/producto/:slug" element={<ProductPage />} />
          <Route path="/añadir-research" element={<EditorOnly><AddPage /></EditorOnly>} />
          <Route path="/editar-research/:slug" element={<EditorOnly><EditPage /></EditorOnly>} />
        </Routes>
      </div>
      <style>{`
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>
    </div>
  );
}

function LoginPage({ dark: d }) {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${d ? "bg-gray-950" : "bg-gray-50"}`}>
      <div className={`w-full max-w-sm rounded-2xl border p-10 flex flex-col items-center gap-6 ${d ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#00B369" }}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M11.9995 12.0001H12.0095M15.535 15.5357C10.8488 20.222 5.46685 22.438 3.51423 20.4854C1.56161 18.5328 3.77769 13.1509 8.46398 8.46461C13.1503 3.77832 18.5322 1.56224 20.4848 3.51486C22.4374 5.46748 20.2213 10.8494 15.535 15.5357ZM15.535 8.46443C20.2213 13.1507 22.4374 18.5326 20.4848 20.4852C18.5321 22.4379 13.1502 20.2218 8.46394 15.5355C3.77765 10.8492 1.56157 5.4673 3.51419 3.51468C5.46681 1.56206 10.8487 3.77814 15.535 8.46443ZM12.4995 12.0001C12.4995 12.2763 12.2757 12.5001 11.9995 12.5001C11.7234 12.5001 11.4995 12.2763 11.4995 12.0001C11.4995 11.724 11.7234 11.5001 11.9995 11.5001C12.2757 11.5001 12.4995 11.724 12.4995 12.0001Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className={`text-xl font-bold ${d ? "text-gray-100" : "text-gray-900"}`}>UX Research Portal</h1>
          <p className={`text-sm ${d ? "text-gray-500" : "text-gray-400"}`}>Inicia sesión para continuar</p>
        </div>
        <button onClick={handleGoogle} disabled={loading}
          className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border font-medium text-sm transition-all ${d ? "bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"} disabled:opacity-50`}>
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {loading ? "Redirigiendo..." : "Continuar con Google"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [session, setSession] = useState(undefined);
  const [role, setRole] = useState(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [editors, setEditors] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [loadingDeliverables, setLoadingDeliverables] = useState(true);
  const [activeFilter, setActiveFilter] = useState({ type: "Tipo de entregable", team: null });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setRole(null); setRoleLoaded(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", session.user.id).single()
      .then(({ data }) => { setRole(data?.role || "visitor"); setRoleLoaded(true); });
    supabase.rpc("get_users_with_roles").then(({ data }) => {
      const editorList = (data || []).filter(u => u.role === "editor" || u.role === "super_admin");
      setEditors(editorList.map(u => u.full_name || u.email || u.user_id));
    });
  }, [session]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!session) return;
    fetch("/api/deliverables")
      .then(r => r.json())
      .then(saved => { setDeliverables(saved); setLoadingDeliverables(false); })
      .catch(() => setLoadingDeliverables(false));
  }, [session]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAdd = (item) => {
    setDeliverables(prev => prev.some(d => d.id === item.id) ? prev : [item, ...prev]);
    fetch("/api/deliverables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    }).catch(() => {});
  };

  const handleDelete = (id) => {
    setDeliverables(prev => prev.filter(d => d.id !== id));
    fetch(`/api/deliverables/${id}`, { method: "DELETE" }).catch(() => {});
  };

  const handleUpdate = (item) => {
    setDeliverables(prev => prev.map(d => d.id === item.id ? item : d));
    fetch(`/api/deliverables/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    }).catch(() => {});
  };

  const isSuperAdmin = role === "super_admin";
  const isEditor = role === "editor" || isSuperAdmin;

  if (session === undefined) return null;
  if (!session) return <LoginPage dark={dark} />;

  return (
    <AppCtx.Provider value={{ dark, setDark, deliverables, loadingDeliverables, activeFilter, setActiveFilter, handleAdd, handleUpdate, handleDelete, showToast, isEditor, isSuperAdmin, roleLoaded, editors }}>
      <Layout toast={toast} user={session?.user} />
    </AppCtx.Provider>
  );
}
