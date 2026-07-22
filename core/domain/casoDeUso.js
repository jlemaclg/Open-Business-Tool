// core/domain/casoDeUso.js
// ─────────────────────────────────────────────────────────────────────────────
// CASO DE USO = un escenario que se simula CONTRA una entidad (colección aparte,
// referida por entidadId). Una entidad puede tener N casos de uso.
//
// Distinción clave en discovery (afecta complejidad, pantallas e inversión):
//   • EMBEDDED_BAAS      → solo APIs (canal embedded / Banking-as-a-Service)
//   • CASO_COMPLETO      → APIs + frontal propio + mayor complejidad
//
// El valor del caso de uso es el "delta": necesidades = f(casoDeUso, entidad)
//   = lo que el caso pide  −  lo que la entidad ya tiene (grafo de dependencias)
// Ese delta lo calcula un agente (ver core/agents.js → gapsYDependencias).
// ─────────────────────────────────────────────────────────────────────────────

import { nuevoId } from './entidad.js';

/** Naturaleza del caso de uso (eje de discovery). */
export const Naturaleza = Object.freeze({
  EMBEDDED_BAAS: 'embedded-finance-baas', // solo APIs
  CASO_COMPLETO: 'caso-de-uso-completo',  // APIs + frontal + complejidad
});

/** Etapa del embudo de implementación. */
export const Etapa = Object.freeze({
  DISCOVERY: 'discovery',
  POC: 'poc',
  MVP: 'mvp',
  PRODUCCION: 'produccion',
  EVOLUTIVOS: 'evolutivos',
});

/** Estado de un artefacto de API a lo largo del recorrido. */
export const EstadoAPI = Object.freeze({
  DISEÑADA: 'diseñada',
  REFINADA: 'refinada', // tras feedback del API Lab
  FINAL: 'final',
});

/** Caso de uso por defecto, ligado a una entidad. */
export function defaultCasoDeUso(entidadId, naturaleza = Naturaleza.EMBEDDED_BAAS) {
  return {
    id: nuevoId('cu'),
    entidadId,
    nombre: '',
    naturaleza,
    etapa: Etapa.DISCOVERY,
    actualizadoEn: null,

    // Discovery de mercado (agente marketDiscovery)
    discovery: {
      hipotesisProducto: '',
      tam: null, sam: null, som: null,
      propension: null,
    },

    // Ecosistema del caso: APIs siempre; pantallas solo en CASO_COMPLETO
    ecosistema: {
      apis: [],       // [{ nombre, artefactoOAS, estado }]
      pantallas: [],  // [{ nombre, tipo, complejidad }]  (vacío en EMBEDDED_BAAS)
    },

    // ⭐ El delta calculado por el agente gapsYDependencias
    necesidades: {
      apisNecesarias: [],          // [{ nombre, estado: 'nueva'|'existente', razon }]
      necesidadesTecnologicas: [], // [{ item, capa, existe, inversionEstim }]
      necesidadesEquipo: [],       // [{ rol, duracion, motivo }]
      gaps: [],                    // [string | { id, descripcion }]
      dependencias: [],            // aristas propuestas para el grafo de la entidad
    },

    // Resultados del API Lab (agente refinarAPI cierra el bucle)
    labResults: [], // [{ sandbox, comerciosReales, metricas, refinamientos: [] }]

    monetizacion: { lineasActivadas: [], pricing: null },

    // Lo que este caso justifica ante C-Level (se agrega al roadmap de la entidad)
    inversionIncremental: { capex: 0, opex: 0, confianza: 'media', devengo: null },
  };
}

/** Sanea/normaliza un caso de uso cargado. */
export function normalizeCasoDeUso(raw) {
  const base = defaultCasoDeUso(raw?.entidadId || null, raw?.naturaleza);
  if (!raw || typeof raw !== 'object') return base;
  return {
    ...base,
    ...raw,
    discovery: { ...base.discovery, ...(raw.discovery || {}) },
    ecosistema: {
      apis: Array.isArray(raw.ecosistema?.apis) ? raw.ecosistema.apis : [],
      pantallas: Array.isArray(raw.ecosistema?.pantallas) ? raw.ecosistema.pantallas : [],
    },
    necesidades: { ...base.necesidades, ...(raw.necesidades || {}) },
    inversionIncremental: { ...base.inversionIncremental, ...(raw.inversionIncremental || {}) },
  };
}

/** ¿Este caso lleva frontal propio? (dirige la UI y el cálculo del delta). */
export function llevaFrontal(casoDeUso) {
  return casoDeUso?.naturaleza === Naturaleza.CASO_COMPLETO;
}
