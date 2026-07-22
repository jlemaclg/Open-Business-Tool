// storage-bridge.js — Puente del Assessment al dominio de la plataforma (F3)
// ─────────────────────────────────────────────────────────────────────────────
// Reencamina guardar/cargar/listar del Assessment a través del adaptador
// Storage (core/storage.js), convirtiendo cada "cliente" guardado en una
// Entidad del dominio (la forma de S se conserva íntegra en entidad.assessment).
//
// Diseño de resiliencia: este archivo es un módulo ES. Si no puede cargar
// (p. ej. abriendo el HTML por file:// sin servidor), el Assessment sigue
// funcionando con su localStorage original — nada se rompe.
//
// La migración es aditiva: los clientes del almacén antiguo (LSKEY) se copian
// a Entidades la primera vez; el almacén antiguo NO se borra (rollback seguro).
// ─────────────────────────────────────────────────────────────────────────────

import { Storage } from '../../../core/storage.js';
import { defaultEntidad } from '../../../core/domain/entidad.js';

const H = window.__oba;              // ganchos del script clásico: getS/setS/esc/$
const legacyStore = window.store;    // lector del almacén antiguo (se mantiene)

async function entidadPorNombre(nombre) {
  const lista = await Storage.listEntidades();
  const item = lista.find((e) => e.nombre === nombre);
  return item ? await Storage.loadEntidad(item.id) : null;
}

/** Migración única y aditiva: clientes del LSKEY antiguo → Entidades. */
async function migrarLegado() {
  const antiguo = legacyStore();
  const nombres = new Set((await Storage.listEntidades()).map((e) => e.nombre));
  for (const [nombre, s] of Object.entries(antiguo)) {
    if (nombres.has(nombre)) continue;
    const ent = defaultEntidad();
    ent.nombre = nombre;
    ent.assessment = s;              // la forma de S viaja intacta
    await Storage.saveEntidad(ent);
  }
}

// ── Sustitución de las tres funciones de persistencia (misma firma y UX) ──

window.guardar = async function guardar() {
  const S = H.getS();
  const nombre = (S.cliente.nombre || 'sin_nombre').trim();
  try {
    let ent = await entidadPorNombre(nombre);
    if (!ent) { ent = defaultEntidad(); ent.nombre = nombre; }
    ent.assessment = S;
    await Storage.saveEntidad(ent);
    H.$('savemsg').textContent = '✓ guardado';
    await window.refreshClientes();
  } catch (e) {
    H.$('savemsg').textContent = '⚠ no se pudo guardar — usa Exportar';
  }
};

window.refreshClientes = async function refreshClientes() {
  const S = H.getS();
  const lista = await Storage.listEntidades();
  H.$('selCliente').innerHTML = '<option value="">— guardados —</option>' +
    lista.map((e) => `<option${e.nombre === S.cliente.nombre ? ' selected' : ''}>${H.esc(e.nombre)}</option>`).join('');
};

window.cargarCliente = async function cargarCliente(nombre) {
  if (!nombre) return;
  const ent = await entidadPorNombre(nombre);
  if (ent && ent.assessment) {
    H.setS(window.normalize(Object.assign(window.defaultState(), ent.assessment)));
    window.renderAll();
    H.$('savemsg').textContent = '✓ cargado';
  }
};

// Arranque: migrar lo antiguo y repoblar el selector desde el dominio.
await migrarLegado();
await window.refreshClientes();
