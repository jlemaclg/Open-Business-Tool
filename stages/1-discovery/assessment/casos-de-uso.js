// casos-de-uso.js — Pestaña "12 · Casos de Uso" del Assessment (F4)
// ─────────────────────────────────────────────────────────────────────────────
// Gestión de casos de uso simulados sobre la entidad activa: alta, listado y
// borrado, distinguiendo su naturaleza (Embedded Finance/BaaS = solo APIs, vs
// caso de uso completo = APIs + frontal). Colección aparte por entidadId
// (Storage.listCasos/saveCaso/removeCaso).
//
// Se inyecta dinámicamente: botón en #tabs + <section class="mod"> propia.
// Igual que storage-bridge.js, si el módulo no carga (file://), la pestaña
// simplemente no aparece y la herramienta original queda intacta.
// La pestaña de GAPs & Dependencias (F5) se alimentará de estos casos.
// ─────────────────────────────────────────────────────────────────────────────

import { Storage } from '../../../core/storage.js';
import { defaultCasoDeUso, Naturaleza, Etapa } from '../../../core/domain/casoDeUso.js';

const H = window.__oba;
const NAT_LABEL = {
  [Naturaleza.EMBEDDED_BAAS]: 'Embedded Finance / BaaS · solo APIs',
  [Naturaleza.CASO_COMPLETO]: 'Caso de uso completo · APIs + frontal',
};
const ETAPA_LABEL = {
  [Etapa.DISCOVERY]: 'Discovery', [Etapa.POC]: 'PoC', [Etapa.MVP]: 'MVP',
  [Etapa.PRODUCCION]: 'Producción', [Etapa.EVOLUTIVOS]: 'Evolutivos',
};

// ── Inyección de UI ──────────────────────────────────────────────────────────

const css = document.createElement('style');
css.textContent = `
  .cu-grid{display:grid;grid-template-columns:340px 1fr;gap:18px;align-items:start;}
  .cu-form label{display:block;font-size:10.5px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:var(--morado,#4F062A);margin:12px 0 4px;}
  .cu-form input[type=text]{width:100%;padding:9px 10px;border:1px solid #c9c6bb;border-radius:3px;font-size:13px;}
  .cu-nat{display:block;border:1px solid #c9c6bb;border-radius:4px;padding:10px 12px;margin-bottom:8px;cursor:pointer;font-size:12.5px;line-height:1.45;}
  .cu-nat:hover{border-color:#FF0054;}
  .cu-nat input{margin-right:8px;}
  .cu-nat b{color:#260717;}
  .cu-nat small{display:block;color:#777;margin-left:21px;}
  .cu-btn{margin-top:14px;background:#4F062A;color:#fff;border:none;padding:10px 20px;border-radius:3px;font-size:13px;cursor:pointer;letter-spacing:.4px;}
  .cu-btn:hover{background:#FF0054;}
  .cu-aviso{background:rgba(255,0,84,.07);border-left:3px solid #FF0054;padding:10px 14px;font-size:12px;margin-bottom:14px;}
  .cu-card{background:#fff;border:1px solid #e6e3d8;border-radius:5px;padding:14px 16px;margin-bottom:12px;display:flex;justify-content:space-between;gap:14px;align-items:flex-start;box-shadow:0 1px 6px rgba(0,0,0,.05);}
  .cu-card-title{font-family:Georgia,serif;font-size:16px;color:#260717;margin-bottom:5px;}
  .cu-pill{display:inline-block;font-size:10px;padding:2px 9px;border-radius:12px;letter-spacing:.4px;margin-right:6px;}
  .cu-pill-baas{background:rgba(26,127,55,.1);color:#1a7f37;border:1px solid rgba(26,127,55,.3);}
  .cu-pill-full{background:rgba(255,0,84,.1);color:#FF0054;border:1px solid rgba(255,0,84,.3);}
  .cu-pill-etapa{background:rgba(79,6,42,.08);color:#4F062A;border:1px solid rgba(79,6,42,.25);}
  .cu-meta{font-size:11px;color:#888;margin-top:6px;}
  .cu-actions{display:flex;flex-direction:column;gap:6px;align-items:flex-end;flex:0 0 auto;}
  .cu-gaps{font-size:11.5px;padding:8px 14px;border-radius:3px;border:1px solid #c9c6bb;background:#f4f3ee;color:#999;cursor:not-allowed;white-space:nowrap;}
  .cu-del{font-size:11px;color:#b33;background:none;border:none;cursor:pointer;opacity:.7;}
  .cu-del:hover{opacity:1;text-decoration:underline;}
  .cu-empty{font-size:12.5px;color:#777;font-style:italic;padding:18px 0;}
`;
document.head.appendChild(css);

const tabBtn = document.createElement('div');
tabBtn.className = 'tab';
tabBtn.dataset.t = 'tCU';
tabBtn.textContent = '12 · Casos de Uso';
tabBtn.onclick = () => { window.tab('tCU'); renderCasos(); };
document.getElementById('tabs').appendChild(tabBtn);

const sec = document.createElement('section');
sec.className = 'mod';
sec.id = 'tCU';
sec.innerHTML = `
  <div class="eyebrow">Simulación · Casos de uso sobre la entidad</div>
  <h2 class="mod-title">Los <span class="accent">casos de uso se simulan sobre el set up</span>: cada uno calculará qué le falta a la entidad y cuánta inversión implica</h2>
  <div class="mod-sub">Crea aquí los casos de uso a evaluar. La naturaleza importa: un caso de solo APIs (Embedded Finance/BaaS) suele necesitar mucho menos que un caso completo con frontal propio. El análisis de GAPs &amp; Dependencias de cada caso llegará en la siguiente versión.</div>
  <div id="cuAviso"></div>
  <div class="cu-grid">
    <div class="card cu-form">
      <h3>Nuevo caso de uso</h3>
      <label>Nombre del caso</label>
      <input type="text" id="cuNombre" placeholder="Ej: Pagos embebidos en marketplace">
      <label>Naturaleza</label>
      <label class="cu-nat"><input type="radio" name="cuNat" value="${Naturaleza.EMBEDDED_BAAS}" checked><b>Embedded Finance / BaaS</b><small>Solo APIs — un tercero integra los servicios en su canal.</small></label>
      <label class="cu-nat"><input type="radio" name="cuNat" value="${Naturaleza.CASO_COMPLETO}"><b>Caso de uso completo</b><small>APIs + frontal propio — producto de la entidad de punta a punta.</small></label>
      <button class="cu-btn" id="cuCrear">Crear caso de uso</button>
    </div>
    <div>
      <h3 style="margin-bottom:10px;">Casos de la entidad <span id="cuEntNombre" style="color:#FF0054;"></span></h3>
      <div id="cuLista"></div>
    </div>
  </div>`;
document.querySelector('main, body').appendChild(sec);

// ── Lógica ───────────────────────────────────────────────────────────────────

async function entidadActual() {
  const nombre = (H.getS().cliente.nombre || '').trim();
  if (!nombre) return null;
  const lista = await Storage.listEntidades();
  return lista.find((e) => e.nombre === nombre) || null;
}

async function renderCasos() {
  const $ = H.$, esc = H.esc;
  const ent = await entidadActual();
  $('cuEntNombre').textContent = ent ? '— ' + ent.nombre : '';
  if (!ent) {
    $('cuAviso').innerHTML = `<div class="cu-aviso">La entidad aún no está guardada. <b>Guarda el assessment</b> (botón Guardar, arriba) para poder crear casos de uso sobre ella.</div>`;
    $('cuLista').innerHTML = '<div class="cu-empty">Sin entidad activa.</div>';
    return;
  }
  $('cuAviso').innerHTML = '';
  const casos = await Storage.listCasos(ent.id);
  if (!casos.length) {
    $('cuLista').innerHTML = '<div class="cu-empty">Todavía no hay casos de uso para esta entidad. Crea el primero con el formulario.</div>';
    return;
  }
  const detalles = await Promise.all(casos.map((c) => Storage.loadCaso(c.id)));
  $('cuLista').innerHTML = detalles.map((c) => `
    <div class="cu-card">
      <div>
        <div class="cu-card-title">${esc(c.nombre)}</div>
        <span class="cu-pill ${c.naturaleza === Naturaleza.CASO_COMPLETO ? 'cu-pill-full' : 'cu-pill-baas'}">${esc(NAT_LABEL[c.naturaleza] || c.naturaleza)}</span>
        <span class="cu-pill cu-pill-etapa">Etapa: ${esc(ETAPA_LABEL[c.etapa] || c.etapa)}</span>
        <div class="cu-meta">Actualizado: ${c.actualizadoEn ? new Date(c.actualizadoEn).toLocaleString('es') : '—'}</div>
      </div>
      <div class="cu-actions">
        ${window.__obaGaps
          ? `<button class="cu-btn" style="margin-top:0;font-size:11.5px;padding:8px 14px;" data-gaps="${c.id}">Analizar GAPs &amp; Dependencias →</button>`
          : `<button class="cu-gaps" title="Disponible en la siguiente versión">Analizar GAPs &amp; Dependencias — próximamente</button>`}
        <button class="cu-del" data-id="${c.id}">eliminar</button>
      </div>
    </div>`).join('');
  $('cuLista').querySelectorAll('[data-gaps]').forEach((b) => {
    b.onclick = () => window.__obaGaps.abrir(b.dataset.gaps);
  });
  $('cuLista').querySelectorAll('.cu-del').forEach((b) => {
    b.onclick = async () => {
      if (b.dataset.armed !== '1') {           // primer clic: pedir confirmación en el botón
        b.dataset.armed = '1';
        b.textContent = '¿seguro? eliminar';
        setTimeout(() => { b.dataset.armed = ''; b.textContent = 'eliminar'; }, 3000);
        return;
      }
      await Storage.removeCaso(b.dataset.id);  // segundo clic: eliminar
      renderCasos();
    };
  });
}

document.getElementById('cuCrear').onclick = async () => {
  const $ = H.$;
  const ent = await entidadActual();
  if (!ent) { renderCasos(); return; }
  const nombre = $('cuNombre').value.trim();
  if (!nombre) { $('cuNombre').focus(); return; }
  const nat = document.querySelector('input[name=cuNat]:checked').value;
  const caso = defaultCasoDeUso(ent.id, nat);
  caso.nombre = nombre;
  await Storage.saveCaso(caso);
  $('cuNombre').value = '';
  renderCasos();
};
