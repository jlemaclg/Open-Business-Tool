// core/viabilidad.js — Viabilidad temprana de un caso de uso (F18 · Método MBC, determinista)
// ─────────────────────────────────────────────────────────────────────────────
// Cruza las APIs que pide un caso de uso con lo que la entidad ya tiene:
//   · el inventario de APIs (assets/inventory-data.js → window.OBA_INVENTORY)
//   · opcionalmente, el set up de la entidad (grafo de dependencias del Assessment)
// y clasifica cada endpoint en uno de cuatro estados:
//
//   reutilizable   ya existe (o existe su equivalente) → se consume tal cual
//   extender       existe la API de la familia, falta la operación → nueva versión
//   nueva          no hay API, pero sí la capacidad de backend → API nueva
//   sin-capacidad  falta la capacidad de backend (o es GAP en el set up) → inversión o partner
//
// No es un agente: son reglas de la práctica (equivalencias, familias y capacidades)
// que se amplían aquí. La usan el Discovery (F18) y el Inventario (F19): una
// sola función, dos vistas, misma respuesta para el mismo caso.
// ─────────────────────────────────────────────────────────────────────────────

export const Estado = Object.freeze({
  REUTILIZABLE: 'reutilizable',
  EXTENDER: 'extender',
  NUEVA: 'nueva',
  SIN_CAPACIDAD: 'sin-capacidad',
});

export const ESTADO_INFO = Object.freeze({
  'reutilizable':  { etiqueta: 'Reutilizable',  corto: 'Se consume tal cual', peso: 1 },
  'extender':      { etiqueta: 'Extender',      corto: 'Nueva versión de una API existente', peso: 3 },
  'nueva':         { etiqueta: 'Nueva',         corto: 'API nueva sobre capacidad existente', peso: 6 },
  'sin-capacidad': { etiqueta: 'Sin capacidad', corto: 'Falta la capacidad de backend', peso: 10 },
});

// Equivalencias semánticas conocidas: la operación existe con otra forma.
const EQUIVALENCIAS = {
  'GET /payment-status/{id}':    'GET /payments/{id}/status',
  'POST /payments/batch':        'POST /payments/bulk',
  'GET /accounts/{id}/balance':  'GET /accounts/{id}/balances',
  'GET /transactions':           'GET /accounts/{id}/transactions',
};

// Familia de recurso → API del inventario que la contiene (para "extender").
const FAMILIAS = {
  'payments': 'payments-v2', 'payment-status': 'payments-v2', 'disbursements': 'payments-v2',
  'accounts': 'accounts-v1', 'transactions': 'accounts-v1',
  'credit-applications': 'credits-v1', 'credit-scoring': 'credits-v1', 'repayment-schedule': 'credits-v1', 'scoring': 'credits-v1',
  'kyc': 'onboarding-v1', 'onboarding': 'onboarding-v1',
  'customers': 'customers-v3', 'income-verification': 'customers-v3',
  'notifications': 'notifications-v1', 'webhooks': 'notifications-v1',
  'fx': 'fx-v1', 'cards': 'cards-v2',
};

// Recursos sin API de familia: capacidad de backend que necesitan.
const CAPACIDADES = {
  'savings':              ['Core Bancario'],
  'investment':           ['Plataforma de Inversión'],
  'insurance':            ['Core de Seguros'],
  'behavioral-analytics': ['Plataforma de Analítica'],
};

// Requisitos adicionales que no resuelve la API por sí sola (alerta, no cambia el estado).
const REQUIERE = {
  'GET /credit-scoring/alternative':  'Fuente de datos alternativos con consentimiento del cliente',
  'POST /credit-scoring/alternative': 'Fuente de datos alternativos con consentimiento del cliente',
  'POST /credit-scoring/batch':       'Fuente de datos alternativos con consentimiento del cliente',
  'GET /income-verification/gig':     'Acuerdo de datos con las plataformas de la economía gig',
  'POST /kyc/lite':                   'Política de KYC simplificado aprobada por Cumplimiento',
};

const norm = (ep) => String(ep || '').trim().replace(/\s+/g, ' ').replace(/\{[^}]+\}/g, '{id}');
const recurso = (ep) => (norm(ep).split(' ')[1] || '').split('/').filter(Boolean)[0] || '';

function nodoDeBackend(entidad, backend) {
  const nodos = entidad?.grafoDependencias?.nodos || [];
  const b = backend.toLowerCase();
  return nodos.find((n) => {
    const x = String(n.nombre || '').toLowerCase();
    return x && (x.includes(b) || b.includes(x));
  }) || null;
}

/**
 * Clasifica las APIs de un caso de uso.
 * @param {Array<{endpoint:string, rol?:'requerida'|'complementaria'}>|string[]} endpoints
 * @param {{inventario?:Array, entidad?:object}} ctx
 */
export function clasificarCaso(endpoints, { inventario = [], entidad = null } = {}) {
  const lista = (endpoints || []).map((e) => (typeof e === 'string' ? { endpoint: e, rol: 'requerida' } : e));

  // Índices del inventario
  const porEndpoint = new Map();
  const porId = new Map();
  const backendsStack = new Set();
  for (const api of inventario) {
    porId.set(api.id, api);
    (api.backends || []).forEach((b) => backendsStack.add(b));
    for (const [ep, backend, servicio] of api.map || []) porEndpoint.set(norm(ep), { api, backend, servicio });
  }
  // Nodos existentes del set up también cuentan como capacidad
  for (const n of entidad?.grafoDependencias?.nodos || []) {
    if (n.estado === 'existente' && n.nombre) backendsStack.add(n.nombre);
  }

  const items = lista.map(({ endpoint, rol = 'requerida' }) => {
    const ep = norm(endpoint);
    const item = { endpoint, rol, estado: null, api: null, apiNombre: null, backend: null, razon: '', alerta: REQUIERE[ep] || null };

    const directo = porEndpoint.get(ep);
    const equivalente = EQUIVALENCIAS[ep] && porEndpoint.get(norm(EQUIVALENCIAS[ep]));
    const familia = FAMILIAS[recurso(ep)] && porId.get(FAMILIAS[recurso(ep)]);

    if (directo || equivalente) {
      const hit = directo || equivalente;
      Object.assign(item, {
        estado: Estado.REUTILIZABLE, api: hit.api.id, apiNombre: `${hit.api.nombre} ${hit.api.ver}`, backend: hit.backend,
        razon: directo ? `Ya expuesta en ${hit.api.nombre} ${hit.api.ver}.` : `Existe como ${EQUIVALENCIAS[ep]} en ${hit.api.nombre} ${hit.api.ver}.`,
      });
    } else if (familia) {
      Object.assign(item, {
        estado: Estado.EXTENDER, api: familia.id, apiNombre: `${familia.nombre} ${familia.ver}`, backend: (familia.backends || []).join(' · '),
        razon: `La familia existe en ${familia.nombre} ${familia.ver}; falta esta operación (nueva versión menor, GOV-VER-01).`,
      });
    } else {
      const necesita = CAPACIDADES[recurso(ep)] || [];
      const faltan = necesita.filter((b) => !backendsStack.has(b));
      if (necesita.length && faltan.length) {
        Object.assign(item, { estado: Estado.SIN_CAPACIDAD, backend: faltan.join(' · '),
          razon: `La entidad no tiene hoy ${faltan.join(' ni ')}: requiere inversión previa o un partner que la aporte.` });
      } else {
        Object.assign(item, { estado: Estado.NUEVA, backend: necesita.join(' · ') || 'Por definir en el set up',
          razon: necesita.length ? `No hay API; la capacidad existe en ${necesita.join(' y ')}.` : 'No hay API ni familia equivalente; se diseña desde cero.' });
      }
    }

    // Cruce con el set up de la entidad: un backend marcado como GAP degrada el estado
    if (entidad && item.backend && item.estado !== Estado.SIN_CAPACIDAD) {
      for (const b of String(item.backend).split(' · ')) {
        const nodo = nodoDeBackend(entidad, b);
        if (nodo?.estado === 'gap') {
          item.estado = Estado.SIN_CAPACIDAD;
          item.razon = `${b} figura como GAP en el set up de la entidad.`;
          break;
        }
        if (nodo?.estado === 'parcial' && !item.alerta) item.alerta = `${b} está parcialmente disponible en el set up de la entidad.`;
      }
    }
    return item;
  });

  const cuenta = (estado, rol) => items.filter((i) => i.estado === estado && (!rol || i.rol === rol)).length;
  const resumen = {
    reutilizable: cuenta(Estado.REUTILIZABLE), extender: cuenta(Estado.EXTENDER),
    nueva: cuenta(Estado.NUEVA), sinCapacidad: cuenta(Estado.SIN_CAPACIDAD), total: items.length,
  };
  const req = items.filter((i) => i.rol === 'requerida');
  const aprovechables = req.filter((i) => i.estado === Estado.REUTILIZABLE || i.estado === Estado.EXTENDER).length;
  const sinCapReq = cuenta(Estado.SIN_CAPACIDAD, 'requerida');
  const capacidadesFaltantes = [...new Set(items.filter((i) => i.estado === Estado.SIN_CAPACIDAD).map((i) => i.backend))];

  let semaforo, titular;
  if (sinCapReq > 0) { semaforo = 'rojo'; titular = 'Requiere capacidad que la entidad no tiene hoy'; }
  else if (req.length && aprovechables / req.length >= 0.75 && resumen.sinCapacidad === 0) { semaforo = 'verde'; titular = 'Viable con lo que la entidad ya tiene'; }
  else { semaforo = 'ambar'; titular = 'Viable con desarrollo acotado'; }

  const partes = [];
  if (resumen.reutilizable) partes.push(`${resumen.reutilizable} ${resumen.reutilizable === 1 ? 'API se reutiliza' : 'APIs se reutilizan'}`);
  if (resumen.extender) partes.push(`${resumen.extender} ${resumen.extender === 1 ? 'se extiende' : 'se extienden'}`);
  if (resumen.nueva) partes.push(`${resumen.nueva} ${resumen.nueva === 1 ? 'es nueva' : 'son nuevas'}`);
  if (resumen.sinCapacidad) partes.push(`${resumen.sinCapacidad} ${resumen.sinCapacidad === 1 ? 'necesita' : 'necesitan'} capacidad que hoy no existe`);
  let lectura = partes.join(', ').replace(/, ([^,]*)$/, ' y $1') + '.';
  lectura = lectura.charAt(0).toUpperCase() + lectura.slice(1);
  if (capacidadesFaltantes.length) lectura += ` Antes de comprometer el caso hay que resolver: ${capacidadesFaltantes.join('; ')} (inversión o partner).`;
  else if (semaforo === 'verde') lectura += ' El caso puede llevarse a piloto sin inversión en backend.';
  else lectura += ' El desarrollo se apoya en capacidades que la entidad ya opera.';

  const condiciones = [...new Set(items.map((i) => i.alerta).filter(Boolean))];
  if (condiciones.length) lectura += ` Condiciones previas: ${condiciones.map((c) => c.charAt(0).toLowerCase() + c.slice(1)).join('; ')}.`;

  const puntos = items.reduce((a, i) => a + ESTADO_INFO[i.estado].peso, 0);
  const esfuerzo = puntos <= 8 ? 'Bajo' : puntos <= 18 ? 'Medio' : puntos <= 32 ? 'Alto' : 'Muy alto';
  const bloqueantes = (entidad?.grafoDependencias?.aristas || []).filter((a) => a.estado === 'bloqueante').length;

  return { items, resumen, semaforo, titular, lectura, esfuerzo, puntos, capacidadesFaltantes, condiciones, dependenciasBloqueantes: bloqueantes, conSetUp: !!entidad };
}

/**
 * Casos del Assessment: el delta (gapsYDependencias) guarda recursos ("payments", "accounts"…),
 * no endpoints. Se clasifican con las mismas reglas a nivel de familia:
 *   familia en el inventario → reutilizable · capacidad sin API → nueva · capacidad ausente/GAP → sin-capacidad.
 * @param {Array<{nombre:string, razon?:string}>|string[]} recursos
 */
export function clasificarRecursos(recursos, { inventario = [], entidad = null } = {}) {
  // Se reutiliza clasificarCaso con un endpoint sintético de familia para no duplicar reglas
  const lista = (recursos || []).map((r) => (typeof r === 'string' ? { nombre: r } : r));
  const res = clasificarCaso(lista.map((r) => ({ endpoint: `GET /${String(r.nombre).toLowerCase()}`, rol: 'requerida' })), { inventario, entidad });
  res.items.forEach((it, i) => {
    it.recurso = lista[i].nombre;
    it.endpoint = `${lista[i].nombre} (recurso)`;
    // A nivel de recurso, que exista la familia significa que la API ya está: se reutiliza
    if (it.estado === Estado.EXTENDER) { it.estado = Estado.REUTILIZABLE; it.razon = `Cubierto por ${it.apiNombre}.`; }
  });
  // Recalcular resumen y veredicto con los estados ajustados
  return recalcular(res.items, { entidad });
}

function recalcular(items, { entidad }) {
  const tmp = { items };
  const cuenta = (e) => items.filter((i) => i.estado === e).length;
  const resumen = { reutilizable: cuenta(Estado.REUTILIZABLE), extender: cuenta(Estado.EXTENDER), nueva: cuenta(Estado.NUEVA), sinCapacidad: cuenta(Estado.SIN_CAPACIDAD), total: items.length };
  const capacidadesFaltantes = [...new Set(items.filter((i) => i.estado === Estado.SIN_CAPACIDAD).map((i) => i.backend))];
  const semaforo = resumen.sinCapacidad ? 'rojo' : (items.length && (resumen.reutilizable + resumen.extender) / items.length >= 0.75 ? 'verde' : 'ambar');
  const titular = semaforo === 'rojo' ? 'Requiere capacidad que la entidad no tiene hoy' : semaforo === 'verde' ? 'Viable con lo que la entidad ya tiene' : 'Viable con desarrollo acotado';
  const puntos = items.reduce((a, i) => a + ESTADO_INFO[i.estado].peso, 0);
  Object.assign(tmp, {
    resumen, semaforo, titular, capacidadesFaltantes, puntos,
    esfuerzo: puntos <= 8 ? 'Bajo' : puntos <= 18 ? 'Medio' : puntos <= 32 ? 'Alto' : 'Muy alto',
    condiciones: [...new Set(items.map((i) => i.alerta).filter(Boolean))],
    dependenciasBloqueantes: (entidad?.grafoDependencias?.aristas || []).filter((a) => a.estado === 'bloqueante').length,
    conSetUp: !!entidad,
    lectura: `${resumen.reutilizable} recurso(s) cubiertos por APIs existentes, ${resumen.nueva} nuevo(s) y ${resumen.sinCapacidad} sin capacidad.`,
  });
  return tmp;
}

/**
 * Vista por API del inventario: para cada API, qué le pide el caso.
 * @returns {Map<apiId, {estado:'reutilizable'|'extender', items:[]}>} solo APIs implicadas;
 *          el resto "no aplica". Si una API tiene operaciones a extender, manda "extender".
 */
export function vistaPorApi(resultado) {
  const m = new Map();
  for (const it of resultado?.items || []) {
    if (!it.api) continue;
    const v = m.get(it.api) || { estado: Estado.REUTILIZABLE, items: [] };
    v.items.push(it);
    if (it.estado === Estado.EXTENDER) v.estado = Estado.EXTENDER;
    m.set(it.api, v);
  }
  return m;
}

/** Políticas de gobierno que aplican a un conjunto de endpoints (IDs del espacio de Políticas). */
export function politicasAplicables(endpoints) {
  const eps = (endpoints || []).map((e) => norm(typeof e === 'string' ? e : e.endpoint));
  const set = new Set(['GOV-NAM-01', 'GOV-VER-01', 'GOV-ERR-01', 'GOV-SEC-01', 'GOV-ISO-01', 'GOV-DOC-01']);
  if (eps.some((e) => e.startsWith('POST'))) set.add('GOV-IDM-01');
  if (eps.some((e) => e.startsWith('GET') && !e.includes('{id}'))) set.add('GOV-PAG-01');
  if (eps.some((e) => /payments|disbursements|credit|kyc|accounts/.test(e))) set.add('GOV-SEC-02');
  return [...set].sort();
}
