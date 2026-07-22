// core/domain/entidad.js
// ─────────────────────────────────────────────────────────────────────────────
// ENTIDAD = la radiografía única y viva de una entidad (el Assessment).
// Es la columna vertebral: una por entidad, independiente del caso de uso.
// Los casos de uso se simulan CONTRA esta radiografía (ver casoDeUso.js).
//
// Las dependencias se modelan como un GRAFO:
//   nodos  = capacidades / servicios / equipos / cores / canales
//   aristas = dependencias (técnicas, organizativas, de equipo) entre nodos
// Esto permite visualizar bloqueos y calcular el "delta" que pide un caso de uso.
// ─────────────────────────────────────────────────────────────────────────────

/** Tipos de nodo del grafo de dependencias. */
export const TipoNodo = Object.freeze({
  CAPACIDAD: 'capacidad', // capacidad de negocio/producto
  SERVICIO: 'servicio',   // servicio técnico/backend
  CORE: 'core',           // core bancario / sistema central
  CANAL: 'canal',         // canal (app, web, embedded, ...)
  EQUIPO: 'equipo',       // equipo/organización
});

/** Estado de un nodo respecto a la entidad. */
export const EstadoNodo = Object.freeze({
  EXISTENTE: 'existente', // la entidad ya lo tiene
  GAP: 'gap',             // falta: hay que construirlo/adquirirlo
  PARCIAL: 'parcial',     // existe pero incompleto
});

/** Tipo de dependencia (arista). */
export const TipoDependencia = Object.freeze({
  TECNICA: 'tecnica',           // A necesita técnicamente a B (core/servicio)
  ORGANIZATIVA: 'organizativa', // A requiere decisión/validación de B
  EQUIPO: 'equipo',             // A necesita capacidad/tiempo del equipo B
});

/** Estado de una dependencia. */
export const EstadoDependencia = Object.freeze({
  SATISFECHA: 'satisfecha',
  BLOQUEANTE: 'bloqueante',
  RIESGO: 'riesgo',
});

/** Genera un id estable en el navegador (crypto disponible en GitHub Pages). */
export function nuevoId(prefijo = 'ent') {
  const rnd = (globalThis.crypto?.randomUUID?.() || String(Math.random()).slice(2));
  return `${prefijo}_${rnd}`;
}

/** Radiografía por defecto (esqueleto vacío pero completo en forma). */
export function defaultEntidad() {
  return {
    id: nuevoId('ent'),
    nombre: '',
    sector: '',
    pais: '',
    actualizadoEn: null,          // ISO date; lo fija storage al guardar

    asIs: { resumen: '', madurezOpenFinance: '' },
    stack: { cores: [], canales: [], servicios: [] },

    // ── Grafo de dependencias (⭐ la variable nueva del Assessment) ──
    grafoDependencias: {
      nodos: [],   // [{ id, tipo, nombre, estado, nota }]
      aristas: [], // [{ id, origen, destino, tipo, estado, descripcion }]
    },

    bau: { resumen: '', costeAnual: null },
    celulas: [],                  // [{ nombre, roles: [], capacidad }]
    capacidadEquipo: {},

    lineasMonetizacionDisponibles: [], // [{ id, nombre, descripcion }]

    // Agregados que ESCRIBEN los casos de uso de vuelta (ver casoDeUso.js):
    roadmap: [],                  // [{ iniciativaId, casoDeUsoId, slot, ... }]
    inversion: { capexAgregado: 0, opexAgregado: 0, devengado: 0 },
  };
}

/** Sanea/normaliza una radiografía cargada (tolerante a versiones antiguas). */
export function normalizeEntidad(raw) {
  const base = defaultEntidad();
  if (!raw || typeof raw !== 'object') return base;
  const g = raw.grafoDependencias || {};
  return {
    ...base,
    ...raw,
    id: raw.id || base.id,
    stack: { ...base.stack, ...(raw.stack || {}) },
    grafoDependencias: {
      nodos: Array.isArray(g.nodos) ? g.nodos : [],
      aristas: Array.isArray(g.aristas) ? g.aristas : [],
    },
    inversion: { ...base.inversion, ...(raw.inversion || {}) },
  };
}

// ── Helpers del grafo ────────────────────────────────────────────────────────

export function agregarNodo(entidad, { tipo, nombre, estado = EstadoNodo.EXISTENTE, nota = '' }) {
  const nodo = { id: nuevoId('nodo'), tipo, nombre, estado, nota };
  entidad.grafoDependencias.nodos.push(nodo);
  return nodo;
}

export function agregarDependencia(entidad, { origen, destino, tipo, estado = EstadoDependencia.SATISFECHA, descripcion = '' }) {
  const arista = { id: nuevoId('dep'), origen, destino, tipo, estado, descripcion };
  entidad.grafoDependencias.aristas.push(arista);
  return arista;
}

/** Devuelve las dependencias bloqueantes (para pintar alertas de bloqueo). */
export function dependenciasBloqueantes(entidad) {
  return (entidad.grafoDependencias?.aristas || [])
    .filter((a) => a.estado === EstadoDependencia.BLOQUEANTE);
}

/** Devuelve los nodos que son GAP (lo que a la entidad le falta). */
export function nodosGap(entidad) {
  return (entidad.grafoDependencias?.nodos || [])
    .filter((n) => n.estado === EstadoNodo.GAP);
}
