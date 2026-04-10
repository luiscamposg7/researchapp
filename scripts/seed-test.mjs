const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PRODUCTS = ["PGH", "Factoring", "Gestora", "Cambio Seguro", "Tandia", "Recadia"];
const TEAMS    = [["Cristian Gaitan"], ["Cristian Gaitan", "Luis Campos Garcia"], ["Luis Campos Garcia"]];
const METODS   = ["Cualitativa", "Cuantitativa", "Mixta", "Desk Research"];

function slug(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

function date(offsetDays = 0) {
  const d = new Date(Date.now() - offsetDays * 86400000);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).replace(".","");
}

function rich(paragraphs) {
  return paragraphs.map(p => `<p>${p}</p>`).join("");
}

function uid() { return Date.now() + Math.floor(Math.random() * 10000); }

const records = [];

// ── RESEARCH ──────────────────────────────────────────────────────────────────
const researchData = {
  "PGH": {
    title: "PGH: Experiencia de onboarding digital",
    descripcion: "Investigación sobre la experiencia de usuarios nuevos durante el proceso de registro y primer uso de PGH.",
    objetivo: rich(["Identificar los principales puntos de fricción en el onboarding de nuevos usuarios de PGH.", "Proponer mejoras que reduzcan el tiempo de activación en al menos un 30%."]),
    usuario: "Nuevos usuarios de PGH que se registraron en los últimos 3 meses y completaron al menos una operación.",
    contenido: rich(["Se realizaron 8 entrevistas semiestructuradas con usuarios que completaron el proceso de onboarding.", "Se identificaron 3 etapas críticas: registro inicial, verificación de identidad y primera operación.", "El 62% de los usuarios manifestó dificultades en la verificación de identidad."]),
    hallazgos: rich(["La verificación de identidad es el mayor punto de abandono (38% de los usuarios).", "Los usuarios prefieren tutoriales en video sobre texto.", "El tiempo promedio de onboarding es de 12 minutos, el objetivo es reducirlo a 7 minutos."]),
    jira: "UX-2410: Onboarding PGH — rediseño de flujo", jiraUrl: "https://prestamype.atlassian.net/browse/UX-2410", jiraStatus: "EN CURSO",
    archivoUrl: "https://www.figma.com/slides/rf9g8KlJzFyHu3GpsPhYV9", reunionUrl: "https://drive.google.com/file/d/1abc/view",
    metodologia: "Cualitativa", typeColor: "warning",
  },
  "Factoring": {
    title: "Factoring: Percepción de riesgo en usuarios MYPE",
    descripcion: "Research cuantitativo sobre la percepción de riesgo que tienen las MYPE al usar financiamiento por factoring.",
    objetivo: rich(["Medir el nivel de confianza de las MYPE en el proceso de factoring.", "Identificar las principales barreras de adopción del producto."]),
    usuario: "Empresas MYPE con facturación anual entre S/100k y S/500k que nunca han usado factoring.",
    contenido: rich(["Se aplicó una encuesta online a 120 empresas MYPE de Lima y provincias.", "El 74% desconoce qué es el factoring como instrumento financiero.", "Solo el 18% estaría dispuesto a ceder una factura sin una explicación detallada del proceso."]),
    hallazgos: rich(["La falta de información es la barrera principal (74% de encuestados).", "Las MYPE valoran la rapidez y transparencia sobre la tasa de descuento.", "El canal preferido para recibir información es WhatsApp (61%)."]),
    jira: "UX-2380: Research percepción riesgo MYPE", jiraUrl: "https://prestamype.atlassian.net/browse/UX-2380", jiraStatus: "FINALIZADO",
    archivoUrl: "https://docs.google.com/presentation/d/1xyz/edit", reunionUrl: "",
    metodologia: "Cuantitativa", typeColor: "warning",
  },
  "Gestora": {
    title: "Gestora: Flujo de solicitud de crédito",
    descripcion: "Análisis del flujo actual de solicitud de crédito en Gestora para detectar cuellos de botella y oportunidades de mejora.",
    objetivo: rich(["Mapear el flujo completo de solicitud de crédito desde el punto de vista del usuario.", "Identificar pasos que generan mayor abandono o confusión."]),
    usuario: "Clientes de Gestora que iniciaron una solicitud de crédito en el último trimestre.",
    contenido: rich(["Se realizó un análisis heurístico del flujo actual con 5 evaluadores.", "Se condujeron 6 pruebas de usabilidad moderadas con usuarios reales.", "Los pasos 3 (carga de documentos) y 5 (firma digital) presentan el mayor abandono."]),
    hallazgos: rich(["El paso de carga de documentos tiene una tasa de abandono del 41%.", "Los usuarios no entienden la diferencia entre 'firma digital' y 'firma electrónica'.", "El proceso completo toma en promedio 23 minutos."]),
    jira: "UX-2521: Gestora — mejora flujo solicitud", jiraUrl: "https://prestamype.atlassian.net/browse/UX-2521", jiraStatus: "EN CURSO",
    archivoUrl: "", reunionUrl: "https://drive.google.com/file/d/1def/view",
    metodologia: "Mixta", typeColor: "warning",
  },
  "Cambio Seguro": {
    title: "Cambio Seguro: Motivaciones y barreras de uso recurrente",
    descripcion: "Research cualitativo para entender por qué usuarios dejan de usar Cambio Seguro tras su primera operación.",
    objetivo: rich(["Identificar los principales motivadores de uso recurrente de Cambio Seguro.", "Entender las razones de abandono tras la primera operación."]),
    usuario: "Usuarios que realizaron entre 1 y 3 operaciones en los últimos 6 meses y luego dejaron de usar el producto.",
    contenido: rich(["Se realizaron 10 entrevistas en profundidad con usuarios que abandonaron el producto.", "La confianza en la seguridad y la tasa de cambio son los factores más valorados.", "La aplicación es percibida como 'difícil de encontrar' en la App Store."]),
    hallazgos: rich(["El 55% de usuarios abandona por encontrar 'mejor tasa' en la competencia.", "La verificación de identidad es percibida como engorrosa para una segunda operación.", "Los usuarios que refieren a amigos tienen 3x más retención."]),
    jira: "", jiraUrl: "", jiraStatus: "",
    archivoUrl: "https://www.figma.com/slides/abc123", reunionUrl: "",
    metodologia: "Cualitativa", typeColor: "warning",
  },
  "Tandia": {
    title: "Tandia: Evaluación de la funcionalidad de reportes",
    descripcion: "Evaluación de usabilidad de la nueva funcionalidad de reportes financieros de Tandia.",
    objetivo: rich(["Evaluar la usabilidad de los nuevos reportes financieros en Tandia.", "Medir el nivel de satisfacción con la funcionalidad implementada."]),
    usuario: "Dueños de negocio y administradores activos de Tandia que usan la plataforma al menos 3 veces por semana.",
    contenido: rich(["Se realizaron 7 sesiones de prueba de usabilidad moderadas con usuarios de Tandia.", "Se aplicó el System Usability Scale (SUS) obteniendo un puntaje promedio de 71.", "Los filtros de fecha son el elemento más usado pero también el más confuso."]),
    hallazgos: rich(["Puntaje SUS de 71 (considerado 'bueno' pero mejorable).", "El 85% de usuarios no encontró el botón de exportar en el primer intento.", "Los usuarios desean filtrar reportes por categoría de producto."]),
    jira: "UX-2592: Evaluación reportes Tandia", jiraUrl: "https://prestamype.atlassian.net/browse/UX-2592", jiraStatus: "EN CURSO",
    archivoUrl: "", reunionUrl: "https://drive.google.com/file/d/1ghi/view",
    metodologia: "Mixta", typeColor: "warning",
  },
  "Recadia": {
    title: "Recadia: Desk Research — mercado de cobranzas digitales",
    descripcion: "Investigación secundaria sobre el mercado de cobranzas digitales en Latinoamérica y oportunidades para Recadia.",
    objetivo: rich(["Mapear el panorama competitivo de cobranzas digitales en LATAM.", "Identificar tendencias y oportunidades de diferenciación para Recadia."]),
    usuario: "No aplica (investigación documental de fuentes secundarias).",
    contenido: rich(["Se analizaron 15 competidores directos e indirectos en Perú, México, Colombia y Chile.", "Las principales tendencias son: automatización de recordatorios, integración con ERPs y cobranza predictiva.", "Recadia tiene una oportunidad clara en el segmento SMB con deuda de menos de S/50k."]),
    hallazgos: rich(["El mercado de cobranzas digitales en LATAM crece 28% anual.", "Solo 3 competidores tienen integración nativa con SUNAT.", "La gamificación de la cobranza es tendencia emergente en México."]),
    jira: "", jiraUrl: "", jiraStatus: "",
    archivoUrl: "https://docs.google.com/presentation/d/1recadia/edit", reunionUrl: "",
    metodologia: "Desk Research", typeColor: "warning",
  },
};

for (const [product, d] of Object.entries(researchData)) {
  records.push({
    id: uid(), date: date(Math.floor(Math.random()*60)), type: "Research",
    title: d.title, tags: [product], team: TEAMS[Math.floor(Math.random()*TEAMS.length)],
    status: "Publicado", isCustom: true,
    archivo: `${d.title}.pdf`, archivoUrl: d.archivoUrl, reunionUrl: d.reunionUrl,
    jira: d.jira, jiraUrl: d.jiraUrl, jiraStatus: d.jiraStatus,
    descripcion: d.descripcion, objetivo: d.objetivo, usuario: d.usuario,
    contenido: d.contenido, hallazgos: d.hallazgos,
    metodologia: d.metodologia, typeColor: d.typeColor,
    imagenes: [], personas: [],
  });
}

// ── PRUEBA DE USABILIDAD ──────────────────────────────────────────────────────
const pruebaData = {
  "PGH": {
    title: "PGH: Prueba de usabilidad — nueva pantalla de inicio",
    descripcion: "Prueba moderada para evaluar la comprensión y navegación de la nueva pantalla de inicio de PGH.",
    objetivo: rich(["Evaluar si los usuarios entienden las acciones disponibles en la nueva pantalla de inicio.", "Medir el tiempo de tarea para las 3 acciones principales."]),
    usuario: "Usuarios activos de PGH con más de 1 mes de antigüedad en la plataforma.",
    contenido: rich(["Se realizaron 6 sesiones de prueba con protocolo Think Aloud.", "Tarea 1 (enviar dinero): completada exitosamente por 5/6 usuarios.", "Tarea 2 (ver historial): completada por 4/6 usuarios, 2 buscaron en el lugar incorrecto.", "Tarea 3 (configurar cuenta): todos fallaron en el primer intento."]),
    hallazgos: rich(["El ícono de 'configuración' no es reconocible para el 83% de usuarios.", "El tiempo promedio para 'enviar dinero' es de 45 segundos (objetivo: 30s).", "3 de 6 usuarios confundieron 'historial' con 'movimientos'."]),
    jira: "UX-2445: PGH — rediseño pantalla inicio", jiraUrl: "https://prestamype.atlassian.net/browse/UX-2445", jiraStatus: "FINALIZADO",
    archivoUrl: "https://www.figma.com/slides/pgh-prueba", reunionUrl: "https://drive.google.com/file/d/1pgh/view",
    metodologia: "Cualitativa",
  },
  "Factoring": {
    title: "Factoring: Test de usabilidad — flujo de cesión de factura",
    descripcion: "Evaluación del nuevo flujo simplificado de cesión de factura en la plataforma Factoring.",
    objetivo: rich(["Comparar el nuevo flujo de cesión con el flujo anterior en términos de tiempo y errores.", "Identificar puntos de confusión en el nuevo diseño."]),
    usuario: "Clientes activos de Factoring que hayan cedido al menos 3 facturas en los últimos 2 meses.",
    contenido: rich(["Test comparativo A/B entre flujo actual y prototipo nuevo con 5 usuarios cada uno.", "El nuevo flujo reduce el número de pasos de 8 a 5.", "Los usuarios del nuevo flujo completaron la tarea en promedio 40% más rápido."]),
    hallazgos: rich(["El nuevo flujo reduce el tiempo de cesión de 8 min a 4.8 min promedio.", "La confirmación de monto genera ansiedad — los usuarios quieren ver la tasa antes.", "El 80% prefiere el nuevo diseño sobre el actual."]),
    jira: "UX-2398: Factoring — nuevo flujo cesión", jiraUrl: "https://prestamype.atlassian.net/browse/UX-2398", jiraStatus: "FINALIZADO",
    archivoUrl: "", reunionUrl: "https://drive.google.com/file/d/1factoring/view",
    metodologia: "Mixta",
  },
  "Gestora": {
    title: "Gestora: Prueba de usabilidad — módulo de pagos",
    descripcion: "Evaluación del módulo de pagos de Gestora con usuarios actuales para detectar fricciones.",
    objetivo: rich(["Identificar los principales errores de interacción en el módulo de pagos.", "Evaluar la claridad del lenguaje y etiquetas del módulo."]),
    usuario: "Administradores de créditos de Gestora con acceso al módulo de pagos.",
    contenido: rich(["5 sesiones no moderadas con grabación de pantalla y eye-tracking.", "El campo 'referencia de pago' genera el mayor número de errores (60% de usuarios).", "Los usuarios no distinguen entre 'pago parcial' y 'pago a cuenta'."]),
    hallazgos: rich(["'Referencia de pago' necesita tooltip o ejemplo visible.", "El color rojo en montos pendientes genera alarma innecesaria.", "Los usuarios desean poder programar pagos recurrentes desde el módulo."]),
    jira: "UX-2530: Gestora módulo pagos — mejoras UX", jiraUrl: "https://prestamype.atlassian.net/browse/UX-2530", jiraStatus: "EN CURSO",
    archivoUrl: "https://www.figma.com/slides/gestora-pagos", reunionUrl: "",
    metodologia: "Cualitativa",
  },
  "Cambio Seguro": {
    title: "Cambio Seguro: Test de primera impresión — nuevo landing",
    descripcion: "Prueba de primera impresión y comprensión del nuevo landing page de Cambio Seguro.",
    objetivo: rich(["Evaluar si el nuevo landing comunica claramente la propuesta de valor de Cambio Seguro.", "Medir la intención de registro tras ver el landing."]),
    usuario: "Personas entre 25-45 años que realizan cambio de divisas al menos una vez al mes, que no conocen Cambio Seguro.",
    contenido: rich(["Test de 5 segundos con 20 participantes para evaluar primera impresión.", "8 pruebas de comprensión del mensaje principal.", "Solo el 35% identificó correctamente el beneficio principal en 5 segundos."]),
    hallazgos: rich(["El título actual no comunica el diferencial de 'tasa interbancaria'.", "Las imágenes de personas hacen el landing más confiable para el 78% de usuarios.", "El CTA 'Comenzar ahora' genera más clics que 'Registrarse gratis' en pruebas A/B."]),
    jira: "", jiraUrl: "", jiraStatus: "",
    archivoUrl: "https://docs.google.com/presentation/d/1cs-landing/edit", reunionUrl: "https://drive.google.com/file/d/1cs/view",
    metodologia: "Cuantitativa",
  },
  "Tandia": {
    title: "Tandia: Prueba de usabilidad — app móvil v3.0",
    descripcion: "Evaluación de usabilidad de la nueva versión 3.0 de la app móvil de Tandia antes del lanzamiento.",
    objetivo: rich(["Detectar errores críticos de usabilidad antes del lanzamiento de Tandia v3.0.", "Validar que el nuevo sistema de navegación es intuitivo para usuarios actuales."]),
    usuario: "Usuarios activos de Tandia que usan la app móvil al menos 5 veces por semana.",
    contenido: rich(["8 sesiones de prueba moderadas con protocolo Think Aloud.", "SUS score promedio: 78 (mejor que la versión anterior: 71).", "Se encontraron 2 errores críticos, 4 mayores y 6 menores."]),
    hallazgos: rich(["Error crítico: botón 'Nueva factura' no visible en iPhone SE (pantalla pequeña).", "Error crítico: El flujo de aprobación de cotización tiene un paso redundante.", "Los usuarios valoran positivamente la nueva navegación inferior (+15 puntos SUS)."]),
    jira: "UX-2560: Tandia v3.0 — prueba pre-lanzamiento", jiraUrl: "https://prestamype.atlassian.net/browse/UX-2560", jiraStatus: "FINALIZADO",
    archivoUrl: "https://www.figma.com/slides/tandia-v3", reunionUrl: "https://drive.google.com/file/d/1tandia-v3/view",
    metodologia: "Cualitativa",
  },
  "Recadia": {
    title: "Recadia: Prueba de usabilidad — panel de cobranza",
    descripcion: "Test de usabilidad del panel principal de cobranza de Recadia con usuarios nuevos y experimentados.",
    objetivo: rich(["Comparar la experiencia de usuarios nuevos vs. experimentados en el panel de cobranza.", "Identificar elementos de la interfaz que generan confusión en nuevos usuarios."]),
    usuario: "Grupo A: gestores de cobranza con menos de 1 mes usando Recadia. Grupo B: gestores con más de 6 meses.",
    contenido: rich(["6 pruebas con usuarios nuevos (Grupo A) y 4 con usuarios experimentados (Grupo B).", "Los usuarios nuevos tardan en promedio 3x más en completar las tareas.", "El filtro de 'estado de deuda' es la funcionalidad más usada pero la más difícil de encontrar."]),
    hallazgos: rich(["El panel necesita un modo 'onboarding' para nuevos usuarios.", "Los usuarios experimentados crean atajos mentales que no están en la interfaz.", "El color naranja para 'deuda en riesgo' es confundido con 'en proceso' por el 50% de nuevos usuarios."]),
    jira: "UX-2545: Recadia — mejoras panel cobranza", jiraUrl: "https://prestamype.atlassian.net/browse/UX-2545", jiraStatus: "EN CURSO",
    archivoUrl: "", reunionUrl: "https://drive.google.com/file/d/1recadia-prueba/view",
    metodologia: "Mixta",
  },
};

for (const [product, d] of Object.entries(pruebaData)) {
  records.push({
    id: uid(), date: date(Math.floor(Math.random()*90)), type: "Prueba de usabilidad",
    title: d.title, tags: [product], team: TEAMS[Math.floor(Math.random()*TEAMS.length)],
    status: "Publicado", isCustom: true,
    archivo: `${d.title}.pdf`, archivoUrl: d.archivoUrl, reunionUrl: d.reunionUrl,
    jira: d.jira, jiraUrl: d.jiraUrl, jiraStatus: d.jiraStatus,
    descripcion: d.descripcion, objetivo: d.objetivo, usuario: d.usuario,
    contenido: d.contenido, hallazgos: d.hallazgos,
    metodologia: d.metodologia, typeColor: "blue",
    imagenes: [], personas: [],
  });
}

// ── BUYER Y USER PERSONA ──────────────────────────────────────────────────────
const personaData = {
  "PGH": {
    title: "PGH: Buyer, User Persona y Arquetipos",
    descripcion: "Definición de los perfiles de usuario de PGH a partir de entrevistas con clientes activos y análisis de datos de uso.",
    objetivo: rich(["Definir los Buyer Persona, User Persona y Arquetipos de PGH.", "Establecer una base de conocimiento de usuarios para guiar el diseño de producto."]),
    usuario: "Clientes activos de PGH con al menos 3 meses de antigüedad y más de 5 operaciones realizadas.",
    contenido: rich([
      "<strong>Buyer Persona</strong>",
      "1. <strong>Marco, el emprendedor digital.</strong> Freelancer que necesita cobrar y pagar en diferentes monedas de forma rápida.",
      "2. <strong>Patricia, la administradora MYPE.</strong> Encargada de pagos a proveedores en una empresa de 15 personas.",
      "<br><strong>User Persona</strong>",
      "1. <strong>Diego, el usuario frecuente.</strong> Realiza más de 10 operaciones mensuales, prioriza la velocidad.",
      "2. <strong>Sofía, la usuaria eventual.</strong> Usa PGH 1-2 veces al mes para pagos específicos.",
      "<br><strong>Arquetipos</strong>",
      "1. <strong>El pragmático.</strong> Solo usa las funciones esenciales, rechaza el onboarding.",
      "2. <strong>El explorador.</strong> Prueba todas las funcionalidades disponibles.",
    ]),
    hallazgos: "",
    jira: "UX-2412: PGH — definición de personas", jiraUrl: "https://prestamype.atlassian.net/browse/UX-2412", jiraStatus: "FINALIZADO",
    archivoUrl: "https://www.figma.com/slides/pgh-personas", reunionUrl: "https://drive.google.com/file/d/1pgh-personas/view",
    metodologia: "Cualitativa",
  },
  "Factoring": {
    title: "Factoring: User Persona — gestores financieros MYPE",
    descripcion: "Perfiles de usuario de los gestores financieros de MYPE que utilizan Factoring como herramienta de liquidez.",
    objetivo: rich(["Crear perfiles detallados de los gestores financieros de MYPE que usan Factoring.", "Identificar sus motivaciones, frustraciones y contexto de uso."]),
    usuario: "Gerentes financieros y contadores de MYPE con experiencia en factoring bancario y no bancario.",
    contenido: rich([
      "<strong>Buyer Persona</strong>",
      "1. <strong>Roberto, el gerente financiero cauteloso.</strong> Busca previsibilidad y control del flujo de caja.",
      "2. <strong>Carmen, la contadora eficiente.</strong> Prioriza la simplicidad del proceso sobre la tasa.",
      "<br><strong>User Persona</strong>",
      "1. <strong>Álvaro, el gestor ágil.</strong> Cede facturas frecuentemente y necesita respuestas en menos de 2 horas.",
      "<br><strong>Arquetipos</strong>",
      "1. <strong>El conservador.</strong> Prefiere hablar con un asesor antes de ceder la primera factura.",
      "2. <strong>El digital-first.</strong> Gestiona todo desde el celular, no llama por teléfono.",
    ]),
    hallazgos: "",
    jira: "UX-2395: Factoring — perfiles usuario", jiraUrl: "https://prestamype.atlassian.net/browse/UX-2395", jiraStatus: "FINALIZADO",
    archivoUrl: "https://docs.google.com/presentation/d/1factoring-personas/edit", reunionUrl: "",
    metodologia: "Cualitativa",
  },
  "Gestora": {
    title: "Gestora: Buyer y User Persona — solicitantes de crédito",
    descripcion: "Definición de perfiles de quienes solicitan y gestionan créditos a través de Gestora.",
    objetivo: rich(["Comprender el perfil demográfico y conductual de los solicitantes de crédito en Gestora.", "Identificar los momentos clave del journey del solicitante."]),
    usuario: "Personas naturales y jurídicas que solicitaron crédito a través de Gestora en los últimos 6 meses.",
    contenido: rich([
      "<strong>Buyer Persona</strong>",
      "1. <strong>Elena, la emprendedora de primera vez.</strong> Busca su primer crédito formal para capital de trabajo.",
      "2. <strong>José Luis, el empresario recurrente.</strong> Ya tiene historial crediticio y busca mejores condiciones.",
      "<br><strong>User Persona</strong>",
      "1. <strong>Mariana, la gestora administrativa.</strong> Encargada de seguimiento del crédito en la empresa.",
      "<br><strong>Arquetipos</strong>",
      "1. <strong>El desconfiado informado.</strong> Investiga extensamente antes de aplicar.",
      "2. <strong>El urgente.</strong> Necesita el crédito en menos de 72 horas.",
    ]),
    hallazgos: "",
    jira: "UX-2525: Gestora — buyer user personas", jiraUrl: "https://prestamype.atlassian.net/browse/UX-2525", jiraStatus: "FINALIZADO",
    archivoUrl: "https://www.figma.com/slides/gestora-personas", reunionUrl: "https://drive.google.com/file/d/1gestora-personas/view",
    metodologia: "Cualitativa",
  },
  "Cambio Seguro": {
    title: "Cambio Seguro: Perfiles de usuario — cambiadores frecuentes vs. esporádicos",
    descripcion: "Investigación para definir los perfiles de usuarios frecuentes y esporádicos de Cambio Seguro y sus diferencias clave.",
    objetivo: rich(["Distinguir los perfiles de usuarios frecuentes y esporádicos de Cambio Seguro.", "Identificar qué hace que un usuario esporádico se convierta en frecuente."]),
    usuario: "Usuarios activos de Cambio Seguro: grupo A (más de 5 operaciones/mes) y grupo B (1-2 operaciones/mes).",
    contenido: rich([
      "<strong>Buyer Persona</strong>",
      "1. <strong>Andrea, la viajera frecuente.</strong> Viaja al extranjero cada 2 meses y necesita soles y dólares.",
      "2. <strong>Carlos, el importador pequeño.</strong> Paga proveedores en dólares mensualmente.",
      "<br><strong>User Persona</strong>",
      "1. <strong>Valeria, la usuaria recurrente.</strong> Cambia dólares cada semana, tiene alertas de tipo de cambio.",
      "2. <strong>Manuel, el usuario esporádico.</strong> Usa Cambio Seguro cuando viaja o recibe pagos en dólares.",
      "<br><strong>Arquetipos</strong>",
      "1. <strong>El rate-hunter.</strong> Compara tasas en múltiples plataformas antes de operar.",
      "2. <strong>El fiel por conveniencia.</strong> Usa siempre Cambio Seguro porque ya confía en la plataforma.",
    ]),
    hallazgos: "",
    jira: "", jiraUrl: "", jiraStatus: "",
    archivoUrl: "https://www.figma.com/slides/cs-personas", reunionUrl: "",
    metodologia: "Mixta",
  },
  "Tandia": {
    title: "Tandia: Buyer, User y Arquetipos — actualización 2025",
    descripcion: "Actualización de los perfiles de usuario de Tandia con datos de clientes del segundo semestre del 2025.",
    objetivo: rich(["Actualizar los perfiles de usuario de Tandia con datos recientes.", "Identificar si han surgido nuevos segmentos de usuario desde el último estudio."]),
    usuario: "Dueños de negocio y personal que usan Tandia activamente, segmentados por tamaño de empresa (micro, pequeña, mediana).",
    contenido: rich([
      "<strong>Buyer Persona</strong>",
      "1. <strong>Ciro, el buscador de orden (actualizado).</strong> Ahora tiene un negocio más grande y busca integración con su banco.",
      "2. <strong>Vanessa, la facturadora pragmática (actualizado).</strong> Ahora es responsable de 2 locales.",
      "3. <strong>Nuevo: Ricardo, el franquiciado.</strong> Dueño de múltiples locales que necesita consolidar información.",
      "<br><strong>User Persona</strong>",
      "1. <strong>Catalina, la vendedora (actualizado).</strong> Ahora usa Tandia en su celular personal.",
      "2. <strong>José, el administrador (actualizado).</strong> Genera reportes diariamente para el dueño.",
      "<br><strong>Arquetipos (sin cambios)</strong>",
      "Estacionario, Dinámico y Administrador mantienen sus características principales.",
    ]),
    hallazgos: "",
    jira: "UX-2580: Tandia — actualización personas 2025", jiraUrl: "https://prestamype.atlassian.net/browse/UX-2580", jiraStatus: "EN CURSO",
    archivoUrl: "https://www.figma.com/slides/tandia-personas-2025", reunionUrl: "https://drive.google.com/file/d/1tandia-personas/view",
    metodologia: "Cualitativa",
  },
  "Recadia": {
    title: "Recadia: Perfiles de gestores de cobranza",
    descripcion: "Definición de los perfiles de gestores de cobranza que utilizan Recadia como herramienta principal de trabajo.",
    objetivo: rich(["Definir los perfiles de los gestores de cobranza de Recadia.", "Entender sus flujos de trabajo actuales y expectativas del producto."]),
    usuario: "Gestores de cobranza de empresas que usan Recadia, con experiencia entre 6 meses y 5 años en cobranza.",
    contenido: rich([
      "<strong>Buyer Persona</strong>",
      "1. <strong>Miguel, el jefe de cobranzas.</strong> Responsable de un equipo de 5-10 gestores, busca visibilidad y control.",
      "2. <strong>Lucía, la gerente financiera.</strong> Toma decisiones basada en datos de recuperación.",
      "<br><strong>User Persona</strong>",
      "1. <strong>Pedro, el gestor de campo.</strong> Visita deudores en persona, necesita la app en el celular.",
      "2. <strong>Ana, la gestora digital.</strong> Gestiona 200+ cuentas desde su computadora.",
      "<br><strong>Arquetipos</strong>",
      "1. <strong>El negociador.</strong> Prefiere el contacto humano para cerrar acuerdos de pago.",
      "2. <strong>El automatizador.</strong> Configura recordatorios automáticos y mide su efectividad.",
      "3. <strong>El escalador.</strong> Deriva rápidamente a procesos legales cuando el deudor no responde.",
    ]),
    hallazgos: "",
    jira: "UX-2548: Recadia — perfiles gestores", jiraUrl: "https://prestamype.atlassian.net/browse/UX-2548", jiraStatus: "FINALIZADO",
    archivoUrl: "https://docs.google.com/presentation/d/1recadia-personas/edit", reunionUrl: "https://drive.google.com/file/d/1recadia-personas/view",
    metodologia: "Cualitativa",
  },
};

for (const [product, d] of Object.entries(personaData)) {
  records.push({
    id: uid(), date: date(Math.floor(Math.random()*120)), type: "Buyer y User Persona",
    title: d.title, tags: [product], team: TEAMS[Math.floor(Math.random()*TEAMS.length)],
    status: "Publicado", isCustom: true,
    archivo: `${d.title}.pdf`, archivoUrl: d.archivoUrl, reunionUrl: d.reunionUrl,
    jira: d.jira, jiraUrl: d.jiraUrl, jiraStatus: d.jiraStatus,
    descripcion: d.descripcion, objetivo: d.objetivo, usuario: d.usuario,
    contenido: d.contenido, hallazgos: d.hallazgos,
    metodologia: d.metodologia, typeColor: "success",
    imagenes: [], personas: [{ images: [] }, { images: [] }],
  });
}

// ── INSERT ────────────────────────────────────────────────────────────────────
console.log(`Insertando ${records.length} registros...`);
let ok = 0, fail = 0;
for (const r of records) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/deliverables`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({ id: r.id, data: r }),
  });
  if (res.ok) {
    ok++;
    console.log(`  ✓ [${r.type}] ${r.tags[0]} — ${r.title}`);
  } else {
    fail++;
    const err = await res.text();
    console.error(`  ✗ ${r.title}: ${err}`);
  }
}
console.log(`\nDone: ${ok} insertados, ${fail} fallidos.`);
