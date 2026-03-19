import https from 'https';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'apikey': KEY,
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const INITIAL_DELIVERABLES = [
  { id: 1, title: "Buyer, User y Arquetipos", type: "Research", typeColor: "amber", date: "Nov 06, 2025", metodologia: "Cualitativa", jira: "UX-2095: TANDIA: PC10 Roadmap del Us. en Buyer y Arquetipos de un producto", jiraStatus: "FINALIZADO", team: ["Cristian G."], tags: ["Tandia"], objetivo: "Definir el Buyer Persona, User Persona y Arquetipos de Tandia.", usuario: "Clientes activos de Tandia de los meses de Julio a Setiembre pertenecientes a los tres planes: facturador, pyme y full.", hallazgos: "Para los dueños de negocio, se identificaron 3 Buyer Persona y 3 arquetipos.", status: "Publicado", archivo: "Buyer, User y Arquetipos — Presentación.pdf" },
  { id: 2, title: "Motivos de abandono y valor percibido", type: "Research", typeColor: "amber", date: "Jul 11, 2025", metodologia: "Mixta", jira: "UX-1710: TANDIA: Valor percibido por clientes activos", jiraStatus: "FINALIZADO", team: ["Cristian G."], tags: ["Tandia"], objetivo: "Conocer los aspectos más valorados de los clientes sobre la plataforma de Tandia.", usuario: "Clientes de Tandia activos en el último año y clientes que cesaron su contrato.", hallazgos: "El 89% de comentarios rescatados perciben valor en la rapidez y facilidad de uso.", status: "Publicado", archivo: "Presentación — Motivos de abandono y Valor percibido.pdf" },
  { id: 3, title: "Gestión de roles", type: "Research", typeColor: "amber", date: "May 07, 2025", metodologia: "Cuantitativa", jira: "UX-1523: Gestión de roles y funcionalidad de Tandia", jiraStatus: "FINALIZADO", team: ["Cristian G."], tags: ["Tandia"], objetivo: "Validar el interés de clientes de Tandia en poder gestionar los permisos y accesos de los roles por su cuenta.", usuario: "Clientes de Tandia en planes PYME.", hallazgos: "La funcionalidad de cambiar los roles de manera autónoma es un nice-to-have.", status: "Publicado", archivo: "Research — Gestión de roles.pdf" },
  { id: 4, title: "Flujo de solicitud — Crédito hipotecario", type: "Pruebas de usabilidad", typeColor: "blue", date: "Feb 14, 2025", metodologia: "Cualitativa", jira: "UX-1840: Flujo solicitud crédito hipotecario", jiraStatus: "FINALIZADO", team: ["Ana R.", "Luis M."], tags: ["Créditos Hipotecarios"], objetivo: "Evaluar el flujo de solicitud de crédito hipotecario e identificar fricciones en el proceso de validación de identidad.", usuario: "Personas naturales entre 28 y 55 años con intención de adquirir un crédito hipotecario en los próximos 6 meses.", hallazgos: "Se detectaron fricciones en el paso de validación de identidad. 3 de 8 participantes no completaron el flujo sin asistencia.", status: "Publicado", archivo: "Prueba de usabilidad — Crédito hipotecario.pdf" },
  { id: 5, title: "Research — Experiencia de onboarding deudores", type: "Research", typeColor: "amber", date: "Dic 03, 2024", metodologia: "Cualitativa", jira: "UX-1692: Onboarding deudores Recadia", jiraStatus: "FINALIZADO", team: ["Luis M.", "Carlos T."], tags: ["Recadia"], objetivo: "Comprender la experiencia de primer contacto y proceso de registro de deudores en la plataforma Recadia.", usuario: "Deudores que recibieron una notificación de cobranza en los últimos 3 meses.", hallazgos: "El 70% de los participantes no entendió el propósito de la plataforma en el primer acceso.", status: "Publicado", archivo: "Research — Onboarding deudores.pdf" },
  { id: 6, title: "Buyer Persona — Segmento PYME", type: "Buyer Persona", typeColor: "green", date: "Nov 21, 2024", metodologia: "Mixta", jira: "UX-1600: Buyer Persona PYME — Préstamos Hipotecarios", jiraStatus: "FINALIZADO", team: ["Sofia K.", "Carlos T.", "Ana R."], tags: ["Préstamos con Garantía Hipotecaria"], objetivo: "Definir el perfil del cliente PYME que solicita financiamiento con garantía hipotecaria.", usuario: "Dueños de PYME que han solicitado o evaluado un préstamo con garantía hipotecaria en el último año.", hallazgos: "Se identificaron 2 perfiles principales: el empresario consolidado que busca expansión y el empresario en crisis que busca liquidez.", status: "Publicado", archivo: "Buyer Persona — Segmento PYME.pdf" },
  { id: 7, title: "Benchmark — Plataformas tipo de cambio digital", type: "Otros entregables", typeColor: "violet", date: "Ago 05, 2024", metodologia: "Desk Research", jira: "UX-1450: Benchmark Cambio Seguro", jiraStatus: "FINALIZADO", team: ["Carlos T."], tags: ["Cambio Seguro"], objetivo: "Analizar las principales plataformas de tipo de cambio digital para identificar oportunidades de diferenciación.", usuario: "No aplica — investigación de escritorio.", hallazgos: "Se analizaron 6 plataformas competidoras. Las principales oportunidades de diferenciación están en la transparencia de comisiones.", status: "Publicado", archivo: "Benchmark — Tipo de cambio digital.pdf" },
  { id: 8, title: "Research — Perfil del arrendatario digital", type: "Research", typeColor: "amber", date: "Jun 14, 2024", metodologia: "Cualitativa", jira: "UX-1380: Perfil arrendatario Tandia API", jiraStatus: "EN CURSO", team: ["Sofia K."], tags: ["Tandia API"], objetivo: "Explorar los modelos mentales y expectativas de arrendatarios que utilizan plataformas digitales por primera vez.", usuario: "Arrendatarios de locales comerciales entre 25 y 45 años.", hallazgos: "Los arrendatarios priorizan la simplicidad sobre la funcionalidad avanzada.", status: "En revisión", archivo: "Research — Perfil arrendatario digital.pdf" },
  { id: 9, title: "Journey Map — Inversionista primera inversión", type: "Otros entregables", typeColor: "violet", date: "Ene 10, 2025", metodologia: "Cualitativa", jira: "UX-1750: Journey Map Gestora de Fondos", jiraStatus: "FINALIZADO", team: ["Sofia K.", "Ana R."], tags: ["Gestora de Fondos"], objetivo: "Mapear el proceso completo del inversionista desde el primer contacto hasta la confirmación de su primera inversión.", usuario: "Personas naturales con capital disponible para invertir que nunca han usado una gestora de fondos digital.", hallazgos: "El proceso de KYC es el principal punto de abandono.", status: "Publicado", archivo: "Journey Map — Primera inversión.pdf" },
  { id: 10, title: "Research — Nuevas funcionalidades Factoring", type: "Research", typeColor: "amber", date: "Mar 01, 2026", metodologia: "Cualitativa", jira: "UX-2210: Factoring nuevas funcionalidades", jiraStatus: "EN CURSO", team: ["Ana R."], tags: ["Factoring"], objetivo: "Explorar las necesidades de los clientes actuales respecto a nuevas funcionalidades del módulo de factoring.", usuario: "Clientes activos del módulo Factoring con más de 6 meses de uso.", hallazgos: "Investigación en curso.", status: "Borrador", archivo: "Research — Factoring funcionalidades.pdf" },
  { id: 11, title: "Buyer Persona — Segmento millennials Cambio Seguro", type: "Buyer Persona", typeColor: "green", date: "Feb 20, 2026", metodologia: "Mixta", jira: "UX-2198: Buyer Persona Cambio Seguro millennials", jiraStatus: "EN CURSO", team: ["Sofia K.", "Carlos T."], tags: ["Cambio Seguro"], objetivo: "Definir el perfil del cliente millennial que utiliza plataformas de tipo de cambio digital.", usuario: "Personas entre 25 y 35 años que realizan operaciones de cambio de divisas al menos una vez al mes.", hallazgos: "En proceso de análisis.", status: "Borrador", archivo: "Buyer Persona — Cambio Seguro millennials.pdf" },
];

async function seed() {
  console.log('Verificando tabla...');
  const existing = await request('GET', '/rest/v1/deliverables?select=id');
  if (existing.status !== 200) {
    console.error('Error al conectar:', existing.status, JSON.stringify(existing.body));
    process.exit(1);
  }

  const existingIds = new Set((existing.body || []).map(r => r.id));
  const toInsert = INITIAL_DELIVERABLES
    .filter(d => !existingIds.has(d.id))
    .map(d => ({ id: d.id, data: d }));

  if (toInsert.length === 0) {
    console.log('No hay datos nuevos (todos los IDs ya existen).');
    return;
  }

  const result = await request('POST', '/rest/v1/deliverables', toInsert);
  if (result.status >= 300) {
    console.error('Error al insertar:', result.status, JSON.stringify(result.body));
    process.exit(1);
  }

  console.log(`✓ ${toInsert.length} entregables insertados correctamente.`);
}

seed();
