// core/storage.local.js
// ─────────────────────────────────────────────────────────────────────────────
// Implementación localStorage del adaptador Storage (Fase 0 · MVP).
// Estructura de claves:
//   ofp:entidades              → { [entidadId]: Entidad }
//   ofp:casos                  → { [casoId]: CasoDeUso }
// (Índices derivados en caliente; simple y suficiente para el MVP.)
// ─────────────────────────────────────────────────────────────────────────────

import { normalizeEntidad } from './domain/entidad.js';
import { normalizeCasoDeUso } from './domain/casoDeUso.js';

const K_ENT = 'ofp:entidades';
const K_CASOS = 'ofp:casos';

function ahora() {
  // Date disponible en el navegador (no en scripts de workflow, pero esto corre en Pages).
  return new Date().toISOString();
}
function leer(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); }
  catch { return {}; }
}
function escribir(key, obj) {
  localStorage.setItem(key, JSON.stringify(obj));
}

export const LocalStorageBackend = {
  // ── Entidades ──
  async listEntidades() {
    const all = leer(K_ENT);
    return Object.values(all).map((e) => ({ id: e.id, nombre: e.nombre, actualizadoEn: e.actualizadoEn }));
  },
  async loadEntidad(id) {
    const all = leer(K_ENT);
    return all[id] ? normalizeEntidad(all[id]) : null;
  },
  async saveEntidad(entidad) {
    const all = leer(K_ENT);
    entidad.actualizadoEn = ahora();
    all[entidad.id] = entidad;
    escribir(K_ENT, all);
    return entidad;
  },
  async removeEntidad(id) {
    const all = leer(K_ENT); delete all[id]; escribir(K_ENT, all);
    // borra también sus casos
    const casos = leer(K_CASOS);
    for (const cid of Object.keys(casos)) if (casos[cid].entidadId === id) delete casos[cid];
    escribir(K_CASOS, casos);
  },

  // ── Casos de Uso ──
  async listCasos(entidadId) {
    const all = leer(K_CASOS);
    return Object.values(all)
      .filter((c) => c.entidadId === entidadId)
      .map((c) => ({ id: c.id, nombre: c.nombre, naturaleza: c.naturaleza, etapa: c.etapa }));
  },
  async loadCaso(id) {
    const all = leer(K_CASOS);
    return all[id] ? normalizeCasoDeUso(all[id]) : null;
  },
  async saveCaso(caso) {
    const all = leer(K_CASOS);
    caso.actualizadoEn = ahora();
    all[caso.id] = caso;
    escribir(K_CASOS, all);
    return caso;
  },
  async removeCaso(id) {
    const all = leer(K_CASOS); delete all[id]; escribir(K_CASOS, all);
  },

  // ── Portabilidad ──
  async exportProyecto(entidadId) {
    const ent = (leer(K_ENT))[entidadId] || null;
    const casos = Object.values(leer(K_CASOS)).filter((c) => c.entidadId === entidadId);
    return JSON.stringify({ version: 1, entidad: ent, casos }, null, 2);
  },
  async importProyecto(json) {
    const { entidad, casos = [] } = JSON.parse(json);
    if (entidad) await this.saveEntidad(normalizeEntidad(entidad));
    for (const c of casos) await this.saveCaso(normalizeCasoDeUso(c));
  },
};
