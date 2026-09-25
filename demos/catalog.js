// demos/catalog.js — Registro de la biblioteca de demos (Open Business · MBC)
// ─────────────────────────────────────────────────────────────────────────────
// Fuente única del índice demos/index.html. Una entrada por demo; sin build.
// Añade la entrada al crear la demo (scripts/new_demo.py lo hace por ti) y
// actualiza `estado`, `version` y `fecha` al publicarla.
//
//   slug       carpeta de la demo bajo demos/  (kebab-case, sin acentos)
//   tipo       recorrido-guiado | walkthrough-portal | prototipo-producto
//   dominio    Open Finance | Embedded Finance | BaaS | Pagos | Datos
//   geografia  código ISO-3166 alpha-2 (PE, CL, ES, MX, CO, BR, UY, EC…) o 'LATAM' / 'GLOBAL'
//   marco      marco regulatorio o contexto (texto libre, ficticio si hace falta)
//   audiencia  Regulador | Banco | Fintech | Comercio | C-Level | Equipo técnico
//   estado     borrador | revision | publicada   (borrador = no se abre desde la biblioteca)
//   acceso     'abierta' (por defecto) | 'protegida' — protegida = HTML cifrado con tools/proteger-demo.py (D13)
//   ruta       relativa a demos/  (normalmente '<slug>/index.html')
// ─────────────────────────────────────────────────────────────────────────────
window.DEMO_CATALOG = [
  {
    slug: 'uy-mandato-debito-precargado-push',
    titulo: 'Del mandato precargado al débito validado: la afiliación orquestada por el operador del esquema',
    resumen: 'Activación de mandatos de débito iniciados por la empresa en dos variantes, solicitud precargada (el banco la recupera por consulta) y push bancario, con directorio de empresas, registro central del mandato, eventos entre participantes, validación del débito antes del riel y revocación. Pantalla protagonista; backend y diagrama de secuencia a demanda.',
    tipo: 'recorrido-guiado',
    dominio: 'Pagos',
    temas: ['Débito directo', 'Mandato', 'Registro central', 'Eventos', 'ISO 20022', 'Base para Open Finance'],
    geografia: 'UY',
    marco: 'Transferencias de débito sobre riel de pagos inmediato · MVP 2026',
    audiencia: ['Banco', 'C-Level', 'Equipo técnico'],
    estado: 'revision',
    acceso: 'protegida',
    version: '0.2.0',
    fecha: '2026-09',
    pasos: 14,
    ruta: 'uy-mandato-debito-precargado-push/index.html'
  },
  {
    slug: 'sfa-pe-consentimiento-grant-management',
    titulo: 'Del onboarding de una fintech a la revocación de un consentimiento, paso a paso',
    resumen: 'Recorrido con dos participantes ficticios (ERD y EPD): a la izquierda lo que ven participante y usuario; a la derecha las operaciones del backend conforme al Perfil de Seguridad FAPI 2.0 (SSA + DCR, PAR + RAR, Grant Management, revocación con eventos).',
    tipo: 'recorrido-guiado',
    dominio: 'Open Finance',
    temas: ['Consentimiento', 'Grant Management', 'FAPI 2.0', 'DCR', 'CloudEvents'],
    geografia: 'PE',
    marco: 'Sistema de Finanzas Abiertas del Perú · SBS',
    audiencia: ['Regulador', 'Banco', 'Fintech', 'Equipo técnico'],
    estado: 'borrador',   // pendiente de importar el fichero a demos/<slug>/ (F17.1)
    version: '1.1.0',
    fecha: '2026-09',
    pasos: 12,
    ruta: 'sfa-pe-consentimiento-grant-management/index.html'
  },
  {
    slug: 'sfa-pe-portal-grant-management-operador',
    titulo: 'Lo que el operador puede hacer, sin llamar a nadie, desde un solo portal',
    resumen: 'Walkthrough del portal de Grant Management del titular y de las empresas (apoderados): panorama de consentimientos, detalle, ampliación de nivel, cronología, vencimientos, actividad y firma. Cada pantalla enlaza el requisito normativo que satisface.',
    tipo: 'walkthrough-portal',
    dominio: 'Open Finance',
    temas: ['Grant Management', 'Portal del titular', 'Consentimiento', 'Empresas y apoderados'],
    geografia: 'PE',
    marco: 'Sistema de Finanzas Abiertas del Perú · SBS',
    audiencia: ['Regulador', 'Banco', 'C-Level'],
    estado: 'borrador',   // pendiente de importar el fichero a demos/<slug>/ (F17.1)
    version: '1.1.0',
    fecha: '2026-09',
    pasos: 11,
    ruta: 'sfa-pe-portal-grant-management-operador/index.html'
  },
  {
    slug: 'brujula-bienestar-financiero',
    titulo: 'Brújula — Decide qué hacer después con tu dinero',
    resumen: 'Prototipo de producto de bienestar financiero construido sobre Open Finance: reúne cuentas, deudas, ahorro, inversión, pensión y seguros; ordena prioridades y compara decisiones antes de tomarlas. Marca de producto propia; datos ficticios.',
    tipo: 'prototipo-producto',
    dominio: 'Open Finance',
    temas: ['Bienestar financiero', 'Agregación', 'PFM', 'Producto completo con frontal'],
    geografia: 'ES',
    marco: 'Caso de uso de producto · agregación multi-entidad',
    audiencia: ['Banco', 'Fintech', 'C-Level'],
    estado: 'borrador',   // pendiente de importar el build a demos/<slug>/ (F17.1)
    version: '2.0.0',
    fecha: '2026-09',
    pasos: null,
    ruta: 'brujula-bienestar-financiero/index.html'
  }
];
