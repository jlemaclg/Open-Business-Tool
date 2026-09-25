// designer-entrada.js — Entrada dual del API Designer (F-Designer-entrada)
// ─────────────────────────────────────────────────────────────────────────────
// El Designer abre con una decisión clara: crear la API desde cero (describes
// el caso tú mismo) o partir de un estudio guardado en Discovery (continúa la
// conversación con el contexto ya refinado). Con ?estudio=<id> se carga solo.
// Módulo aditivo sobre los campos existentes (fTeam/fUseCase/fDesc).
// ─────────────────────────────────────────────────────────────────────────────

import { Storage } from '../../core/storage.js';

const css = document.createElement('style');
css.textContent = `
  .de-chooser{max-width:820px;margin:0 auto 18px;background:#fff;border:1px solid var(--mbc-ceramic);border-radius:6px;overflow:hidden;font-family:var(--sans);box-shadow:0 2px 10px rgba(0,0,0,.06);}
  .de-head{background:rgba(0,52,120,.05);border-bottom:1px solid #eee;padding:10px 18px;font-size:10.5px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:var(--mbc-navy);}
  .de-grid{display:grid;grid-template-columns:1fr 1fr;}
  .de-opt{padding:16px 18px;cursor:pointer;border-left:3px solid transparent;}
  .de-opt+.de-opt{border-top:none;border-left:1px solid #eee;}
  .de-opt:hover{background:rgba(20,122,255,.04);}
  .de-opt.sel{border-left-color:var(--mbc-electric);background:rgba(20,122,255,.05);}
  .de-opt b{display:block;font-family:var(--sans);font-size:15px;color:var(--mbc-navy-deep);font-weight:normal;margin-bottom:4px;}
  .de-opt small{font-size:11.5px;color:#666;line-height:1.5;display:block;}
  .de-load{padding:12px 18px;border-top:1px solid #eee;display:none;gap:10px;align-items:center;}
  .de-load.on{display:flex;}
  .de-load select{flex:1;padding:8px 10px;border:1px solid var(--line);border-radius:3px;font-size:12.5px;}
  .de-load button{background:var(--mbc-electric);color:#fff;border:none;padding:9px 16px;border-radius:3px;font-size:12px;cursor:pointer;}
  .de-load button:hover{background:var(--mbc-navy);}
  .de-ok{padding:10px 18px;border-top:1px solid #eee;font-size:12px;color:#1a7f37;display:none;}
  .de-ok.on{display:block;}
  .de-ok b{color:var(--mbc-navy-deep);}
`;
document.head.appendChild(css);

function init() {
  const fUseCase = document.getElementById('fUseCase');
  const fDesc = document.getElementById('fDesc');
  const sec1 = document.getElementById('sec1');
  if (!fUseCase || !fDesc || !sec1) return;

  const box = document.createElement('div');
  box.className = 'de-chooser';
  box.innerHTML = `
    <div class="de-head">¿Cómo quieres empezar?</div>
    <div class="de-grid">
      <div class="de-opt sel" id="deCero"><b>Crear una API desde cero</b><small>Describe tú mismo el caso de uso al agente — sin contexto previo.</small></div>
      <div class="de-opt" id="deEstudio"><b>Partir de un estudio de Discovery</b><small>Carga un estudio guardado y refinado en Discovery, y continúa la conversación desde ahí.</small></div>
    </div>
    <div class="de-load" id="deLoad">
      <select id="deSelect"><option value="">Cargando estudios…</option></select>
      <button id="deCargar">Cargar estudio</button>
    </div>
    <div class="de-ok" id="deOk"></div>`;
  const target = sec1.querySelector('.wrap-sm') || sec1;
  target.insertBefore(box, target.firstChild);

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  async function poblar() {
    const items = await Storage.listEstudios();
    $('deSelect').innerHTML = items.length
      ? items.map((e) => `<option value="${e.id}">${esc(e.nombre)}</option>`).join('')
      : '<option value="">— no hay estudios guardados en Discovery —</option>';
  }

  async function cargar(id) {
    const e = await Storage.loadEstudio(id);
    if (!e) return;
    fUseCase.value = e.nombre;
    fDesc.value = (e.descripcion || '') + (e.segmento ? `\n\nSegmento objetivo (del discovery): ${e.segmento}` : '');
    // F18 · paquete de requerimientos de negocio: APIs clasificadas y requisitos no funcionales/regulatorios
    const p = e.paquete;
    if (p?.viabilidad?.apis?.length) {
      const apis = p.viabilidad.apis.map((a) => `- ${a.endpoint} [${a.estado}]${a.apiBase ? ` · base: ${a.apiBase}` : ''}`).join('\n');
      const extra = (p.requerimientos || []).filter((g) => g.id === 'nfr' || g.id === 'reg')
        .map((g) => `${g.titulo}:\n` + g.items.map((i) => `- ${i.texto}`).join('\n')).join('\n\n');
      fDesc.value += `\n\nAPIs del caso (viabilidad del Discovery):\n${apis}` + (extra ? `\n\n${extra}` : '')
        + (p.politicasAplicables?.length ? `\n\nPolíticas de gobierno aplicables: ${p.politicasAplicables.join(', ')}` : '');
    }
    // F19 · desde el inventario cruzado: API concreta a diseñar primero (?api=)
    const apiObj = new URLSearchParams(location.search).get('api');
    if (apiObj) fDesc.value += `\n\nAPI a diseñar primero (desde el inventario cruzado): ${apiObj}`;
    const nReq = p ? (p.requerimientos || []).reduce((a, g) => a + g.items.length, 0) : 0;
    $('deOk').innerHTML = `Estudio <b>${esc(e.nombre)}</b> cargado — el agente parte del contexto refinado en Discovery.`
      + (p ? ` Incluye el paquete de requerimientos: <b>${nReq} requisitos</b>, <b>${p.viabilidad.apis.length} APIs</b> clasificadas (${esc(p.viabilidad.titular.toLowerCase())}).` : '')
      + (apiObj ? ` API a diseñar primero: <b>${esc(apiObj)}</b>.` : '')
      + ' Ajusta lo que necesites y analiza.';
    $('deOk').classList.add('on');
    $('deEstudio').classList.add('sel'); $('deCero').classList.remove('sel');
    $('deLoad').classList.add('on');
    $('deSelect').value = id;
  }

  $('deCero').onclick = () => {
    $('deCero').classList.add('sel'); $('deEstudio').classList.remove('sel');
    $('deLoad').classList.remove('on'); $('deOk').classList.remove('on');
  };
  $('deEstudio').onclick = async () => {
    $('deEstudio').classList.add('sel'); $('deCero').classList.remove('sel');
    $('deLoad').classList.add('on');
    await poblar();
  };
  $('deCargar').onclick = () => { if ($('deSelect').value) cargar($('deSelect').value); };

  // Entrada directa desde Discovery: ?estudio=<id>
  const est = new URLSearchParams(location.search).get('estudio');
  if (est) { poblar().then(() => cargar(est)); }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
