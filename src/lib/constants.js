// ── CONSTANTS ──

export const PRODUCTS = ["Cambio Seguro", "Factoring", "Gestora", "PGH", "Recadia", "Tandia"];
export const TYPES = ["Tipo de entregable", "Research", "Prueba de usabilidad", "Buyer y User Persona"];
export const PERSONA_TYPES = ["Buyer y User Persona"];
export const NIVEL_TEC = [
  { label: "Básico",      pct: 20 },
  { label: "Elemental",   pct: 40 },
  { label: "Intermedio",  pct: 60 },
  { label: "Avanzado",    pct: 80 },
  { label: "Experto",     pct: 100 },
];
export const nivelPctMap = Object.fromEntries(NIVEL_TEC.map(n => [n.label.toLowerCase(), n.pct]));

export const EMPTY_PERSONA = () => ({ images: [] });
export const EMPTY_BUYER = EMPTY_PERSONA;
export const EMPTY_USER  = EMPTY_PERSONA;

export const ESTADOS = ["Persona asignada", "Ana R.", "Sofia K.", "Luis M.", "Carlos T."];
export const STATUSES = ["Borrador", "Publicado"];
export const TEAM_MEMBERS = ["Ana R.", "Sofia K.", "Luis M.", "Carlos T."];

export const PRODUCT_COLORS = {
  "PGH": "#00D97A",
  "Factoring": "#00975B",
  "Gestora": "#5EBDB3",
  "Tandia": "#1D4ED8",
  "Recadia": "#2D8E5F",
  "Cambio Seguro": "#7C3AED",
};

export const NAV = [
  { label: "Todos los research", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", active: true },
];

export const TYPE_COLORS = {
  "Research": "warning",
  "Otros entregables": "indigo",
  "Prueba de usabilidad": "blue",
  "Buyer y User Persona": "success",
};

export const OLD_TO_NEW_COLOR = { amber: "warning", violet: "indigo", green: "success" };

export const METODOLOGIAS = ["Cualitativa", "Cuantitativa", "Mixta", "Desk Research"];
export const JIRA_STATUSES = ["EN CURSO", "FINALIZADO"];
