// designer-context.js — Contexto de entrada del API Designer (F8)
// ─────────────────────────────────────────────────────────────────────────────
// El Designer deja de arrancar "en blanco": lee de dónde viene el usuario y
// precarga el contexto correspondiente, mostrando un banner persistente:
//
//   ?caso=<casoId>[&api=<nombre>]  → diseñando para un caso de uso del Assessment.
//     El botón "Guardar diseño en el caso" escribe la API en caso.ecosistema.apis
//     con estado "diseñada" (el Lab la pasará a "refinada" — F9).
//   ?from=<apiId>                  → extendiendo una API existente del inventario
//     (mapeos backend y bloques reutilizables a la vista).
//   ?usecase=<texto>               → contexto libre desde Market Discovery.
//
// Módulo aditivo: si no hay parámetros o no puede cargar, el Designer funciona
// exactamente igual que siempre.
// ─────────────────────────────────────────────────────────────────────────────

import { Storage } from '../../core/storage.js';
import { Naturaleza, EstadoAPI } from '../../core/domain/casoDeUso.js';

const params = new URLSearchParams(location.search);
const casoId = params.get('caso');
const fromId = params.get('from');
const apiObjetivo = params.get('api');
const usecase = params.get('usecase');

if (casoId || fromId || usecase) {
  const css = document.createElement('style');
  css.textContent = `
    .dc-banner{background:#260717;border-bottom:2px solid #FF0054;color:#fff;padding:12px 40px;
      display:flex;align-items:center;gap:18px;font-family:Arial,sans-serif;font-size:12.5px;position:relative;z-index:2500;}
    .dc-tag{flex:0 0 auto;background:rgba(255,0,84,.15);border:1px solid rgba(255,0,84,.45);color:#FF0054;
      font-size:9.5px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;padding:4px 10px;border-radius:2px;}
    .dc-txt{flex:1;line-height:1.55;color:rgba(255,255,255,.85);}
    .dc-txt b{color:#fff;} .dc-txt .dc-pill{display:inline-block;font-size:10px;border:1px solid rgba(255,255,255,.3);
      border-radius:10px;padding:1px 8px;margin-left:6px;color:rgba(255,255,255,.75);}
    .dc-txt a{color:#FF0054;font-weight:bold;text-decoration:none;}
    .dc-btn{flex:0 0 auto;background:#FF0054;color:#fff;border:none;padding:9px 16px;border-radius:3px;
      font-size:12px;cursor:pointer;letter-spacing:.4px;}
    .dc-btn:disabled{background:#666;cursor:default;}
    .dc-btn:hover:not(:disabled){background:#fff;color:#260717;}`;
  document.head.appendChild(css);

  const banner = document.createElement('div');
  banner.className = 'dc-banner';
  document.body.insertBefore(banner, document.body.firstChild);
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  if (fromId) {
    // ── Extensión de una API existente del inventario ──
    const api = (window.OBA_INVENTORY || []).find((a) => a.id === fromId);
    banner.innerHTML = api ? `
      <span class="dc-tag">Extendiendo API existente</span>
      <div class="dc-txt"><b>${esc(api.nombre)} ${esc(api.ver)}</b> · ${esc(api.dominio)} · ${esc(api.tipo)}
        <span class="dc-pill">${api.endpoints} endpoints</span>
        <span class="dc-pill">backend: ${api.backends.map(esc).join(' · ')}</span><br>
        Mapeos y bloques reutilizables del <a href="api-inventory.html">inventario</a> como punto de partida —
        el conocimiento ya generado se aprovecha, no se rediseña.</div>`
      : `<span class="dc-tag">Extendiendo API</span><div class="dc-txt">API <b>${esc(fromId)}</b> no encontrada en el inventario — se parte de diseño nuevo.</div>`;
  } else if (casoId) {
    // ── Diseño para un caso de uso del Assessment ──
    banner.innerHTML = `<span class="dc-tag">Caso de uso</span><div class="dc-txt">Cargando contexto del caso…</div>`;
    Storage.loadCaso(casoId).then((caso) => {
      if (!caso) { banner.innerHTML = `<span class="dc-tag">Caso de uso</span><div class="dc-txt">Caso no encontrado — diseño sin contexto.</div>`; return; }
      const natTxt = caso.naturaleza === Naturaleza.CASO_COMPLETO ? 'Caso completo · APIs + frontal' : 'Embedded Finance / BaaS · solo APIs';
      const apis = (caso.necesidades?.apisNecesarias || []);
      banner.innerHTML = `
        <span class="dc-tag">Diseñando para el caso</span>
        <div class="dc-txt"><b>${esc(caso.nombre)}</b> <span class="dc-pill">${natTxt}</span>
          ${apiObjetivo ? `· API objetivo: <b>${esc(apiObjetivo)}</b>` : ''}<br>
          ${apis.length ? 'APIs del delta: ' + apis.map((a) => `${esc(a.nombre)} (${a.estado})`).join(' · ') : 'Sin análisis de GAPs previo — el delta se puede calcular en la pestaña 13 del Assessment.'}</div>
        <button class="dc-btn" id="dcGuardar">Guardar diseño en el caso</button>`;
      document.getElementById('dcGuardar').onclick = async () => {
        const btn = document.getElementById('dcGuardar');
        btn.disabled = true; btn.textContent = 'Guardando…';
        const nombre = apiObjetivo || 'api-' + (caso.nombre || 'caso').toLowerCase().replace(/[^\w]+/g, '-');
        caso.ecosistema.apis = (caso.ecosistema.apis || []).filter((a) => a.nombre !== nombre);
        caso.ecosistema.apis.push({ nombre, artefactoOAS: 'openapi.yaml (generado en la demo)', estado: EstadoAPI.DISEÑADA });
        await Storage.saveCaso(caso);
        btn.textContent = 'Guardado en el caso ✓ (estado: diseñada)';
      };
    }).catch(() => {
      banner.innerHTML = `<span class="dc-tag">Caso de uso</span><div class="dc-txt">No se pudo cargar el caso (¿abriste por file:// sin servidor?). El Designer funciona igualmente.</div>`;
    });
  } else if (usecase) {
    // ── Contexto libre desde Market Discovery ──
    banner.innerHTML = `<span class="dc-tag">Desde Discovery</span>
      <div class="dc-txt">Caso de uso explorado en Market Discovery: <b>${esc(usecase)}</b> — descríbelo al agente para arrancar el diseño.</div>`;
  }
}
