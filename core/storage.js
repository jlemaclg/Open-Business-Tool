// core/storage.js
// ─────────────────────────────────────────────────────────────────────────────
// Adaptador de PERSISTENCIA. La herramienta solo conoce esta interfaz, agnóstica
// de dónde viven los datos. Fase 0 = localStorage; Fase 2 = Supabase; futuro = Azure.
// Para cambiar de backend se cambia UNA línea (el import de abajo), nada más.
//
// Modelo: Entidades (radiografía única) + Casos de Uso (colección aparte por entidadId).
// ─────────────────────────────────────────────────────────────────────────────

import { LocalStorageBackend } from './storage.local.js';

/** Backend activo. Cambiar aquí a SupabaseBackend / AzureBackend cuando toque. */
const backend = LocalStorageBackend;

export const Storage = {
  // ── Entidades ──────────────────────────────────────────────
  /** @returns {Promise<Array<{id,nombre,actualizadoEn}>>} */
  listEntidades: () => backend.listEntidades(),
  /** @returns {Promise<object|null>} */
  loadEntidad: (id) => backend.loadEntidad(id),
  /** @returns {Promise<object>} entidad guardada (con actualizadoEn fijado) */
  saveEntidad: (entidad) => backend.saveEntidad(entidad),
  removeEntidad: (id) => backend.removeEntidad(id),

  // ── Casos de Uso (por entidad) ─────────────────────────────
  /** @returns {Promise<Array<{id,nombre,naturaleza,etapa}>>} */
  listCasos: (entidadId) => backend.listCasos(entidadId),
  loadCaso: (id) => backend.loadCaso(id),
  saveCaso: (caso) => backend.saveCaso(caso),
  removeCaso: (id) => backend.removeCaso(id),

  // ── Estudios de Discovery (se refinan allí y se cargan en el Designer) ──
  listEstudios: () => backend.listEstudios(),
  loadEstudio: (id) => backend.loadEstudio(id),
  saveEstudio: (estudio) => backend.saveEstudio(estudio),
  removeEstudio: (id) => backend.removeEstudio(id),

  // ── Portabilidad manual (se mantiene en todas las fases) ───
  exportProyecto: (entidadId) => backend.exportProyecto(entidadId),
  importProyecto: (json) => backend.importProyecto(json),
};
