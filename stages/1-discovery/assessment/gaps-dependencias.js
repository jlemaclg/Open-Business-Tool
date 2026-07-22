// gaps-dependencias.js — Pestaña "13 · GAPs & Dependencias" del Assessment (F5)
// ─────────────────────────────────────────────────────────────────────────────
// La variable que faltaba en el assessment: el grafo de dependencias de la
// entidad (nodos = capacidad/servicio/core/canal/equipo; aristas = dependencia
// técnica/organizativa/equipo con estado) y el análisis del DELTA por caso de
// uso: necesidades = f(caso, entidad) vía Agents.gapsYDependencias (hoy mock,
// mañana Azure — misma llamada).
//
// Mismo patrón de inyección que casos-de-uso.js: si los módulos no cargan
// (file://), la pestaña no aparece y la herramienta original queda intacta.
// ─────────────────────────────────────────────────────────────────────────────

import { Storage } from '../../../core/storage.js';
import { Agents } from '../../../core/agents.js';
import { TipoNodo, EstadoNodo, TipoDependencia, EstadoDependencia, nuevoId } from '../../../core/domain/entidad.js';

const H = window.__oba;
const TIPO_LABEL = { capacidad: 'Capacidad', servicio: 'Servicio', core: 'Core', canal: 'Canal', equipo: 'Equipo' };
const COLS = ['canal', 'capacidad', 'servicio', 'core', 'equipo'];   // columnas del grafo

// ── CSS ──────────────────────────────────────────────────────────────────────
const css = document.createElement('style');
css.textContent = `
  .gd-grid{display:grid;grid-template-columns:1fr 380px;gap:18px;align-items:start;}
  .gd-svgwrap{background:#fff;border:1px solid #e6e3d8;border-radius:5px;padding:10px;overflow:auto;}
  .gd-legend{font-size:10.5px;color:#777;margin-top:6px;display:flex;gap:16px;flex-wrap:wrap;}
  .gd-legend span{display:inline-flex;align-items:center;gap:5px;}
  .gd-sw{display:inline-block;width:14px;height:0;border-top:2px solid #999;}
  .gd-form label{display:block;font-size:10px;font-weight:bold;letter-spacing:1.1px;text-transform:uppercase;color:#4F062A;margin:9px 0 3px;}
  .gd-form input[type=text],.gd-form select{width:100%;padding:7px 9px;border:1px solid #c9c6bb;border-radius:3px;font-size:12.5px;background:#fff;}
  .gd-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .gd-btn{margin-top:10px;background:#4F062A;color:#fff;border:none;padding:9px 16px;border-radius:3px;font-size:12.5px;cursor:pointer;}
  .gd-btn:hover{background:#FF0054;}
  .gd-btn-sec{margin-top:10px;background:#fff;color:#4F062A;border:1px solid #4F062A;padding:8px 14px;border-radius:3px;font-size:12px;cursor:pointer;}
  .gd-btn-sec:hover{border-color:#FF0054;color:#FF0054;}
  .gd-mock{background:rgba(255,0,84,.08);border:1px solid rgba(255,0,84,.3);color:#FF0054;font-size:10.5px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;padding:4px 10px;border-radius:2px;display:inline-block;margin-bottom:10px;}
  .gd-delta h4{font-family:Georgia,serif;font-size:15px;color:#260717;margin:16px 0 6px;}
  table.gd-t{width:100%;border-collapse:collapse;font-size:11.5px;background:#fff;}
  .gd-t th{text-align:left;color:#4F062A;border-bottom:2px solid #4F062A;padding:5px 8px;font-size:10px;letter-spacing:.6px;text-transform:uppercase;}
  .gd-t td{padding:6px 8px;border-bottom:1px solid #efede6;}
  .gd-ok{color:#1a7f37;font-weight:bold;} .gd-warn{color:#b58900;font-weight:bold;} .gd-block{color:#c62828;font-weight:bold;}
  .gd-inv{margin-top:14px;background:#260717;color:#fff;padding:14px 18px;border-radius:5px;display:flex;gap:28px;align-items:center;}
  .gd-inv b{font-family:Georgia,serif;font-size:20px;color:#FF0054;display:block;}
  .gd-inv small{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.6);}
  .gd-empty{font-size:12.5px;color:#777;font-style:italic;padding:14px 0;}
  .gd-analizar{display:flex;gap:10px;align-items:flex-end;margin-bottom:6px;}
  .gd-analizar select{flex:1;}
  .gd-spin{font-size:12px;color:#FF0054;font-style:italic;}
  .gd-dellink{font-size:10.5px;color:#b33;cursor:pointer;background:none;border:none;opacity:.7;}
  .gd-dellink:hover{opacity:1;text-decoration:underline;}
`;
document.head.appendChild(css);

// ── Inyección de pestaña y sección ───────────────────────────────────────────
const tabBtn = document.createElement('div');
tabBtn.className = 'tab'; tabBtn.dataset.t = 'tGD'; tabBtn.textContent = '13 · GAPs & Dependencias';
tabBtn.onclick = () => { window.tab('tGD'); render(); };
document.getElementById('tabs').appendChild(tabBtn);

const sec = document.createElement('section');
sec.className = 'mod'; sec.id = 'tGD';
sec.innerHTML = `
  <div class="eyebrow">Set up · Dependencias entre tecnologías y equipos</div>
  <h2 class="mod-title">El <span class="accent">grafo de dependencias</span> revela qué necesita cada caso de uso y dónde están los bloqueos</h2>
  <div class="mod-sub">Modela aquí las piezas de la entidad (canales, capacidades, servicios, cores, equipos) y sus dependencias. Después, analiza un caso de uso: el agente calcula el delta — qué APIs, tecnología y equipo faltan, y cuánta inversión hay que justificar.</div>
  <div id="gdAviso"></div>
  <div class="gd-grid">
    <div>
      <div class="card">
        <h3>Grafo de la entidad <span class="hint" id="gdCount"></span></h3>
        <div class="gd-svgwrap"><svg id="gdSvg" width="640" height="360"></svg></div>
        <div class="gd-legend">
          <span><span class="gd-sw" style="border-color:#999;"></span> técnica</span>
          <span><span class="gd-sw" style="border-top-style:dotted;border-color:#4F062A;"></span> organizativa</span>
          <span><span class="gd-sw" style="border-top-style:dashed;border-color:#b58900;"></span> equipo</span>
          <span><span class="gd-sw" style="border-color:#c62828;border-top-width:3px;"></span> bloqueante</span>
          <span style="color:#FF0054;">nodo rosa = GAP (no existe aún)</span>
        </div>
        <button class="gd-btn-sec" id="gdSeed">Cargar ejemplo de referencia</button>
      </div>
      <div class="card gd-delta" id="gdDeltaCard" style="margin-top:16px;">
        <h3>Análisis del caso de uso — el delta contra el set up</h3>
        <div class="gd-analizar">
          <div style="flex:1;"><label style="font-size:10px;font-weight:bold;letter-spacing:1.1px;text-transform:uppercase;color:#4F062A;">Caso de uso</label>
          <select id="gdCaso"></select></div>
          <button class="gd-btn" id="gdAnalizar">Analizar con el agente</button>
        </div>
        <div id="gdResultado"><div class="gd-empty">Selecciona un caso de uso y pulsa Analizar. El resultado distingue naturaleza: un caso de solo APIs (BaaS) suele arrojar un delta mucho menor que un caso completo con frontal.</div></div>
      </div>
      <div class="card gd-delta" style="margin-top:16px;">
        <h3>Roadmap de casos de uso de la entidad <span class="hint">— la inversión que se justifica ante C-Level</span></h3>
        <div id="gdRoadmap"><div class="gd-empty">Aún no hay casos incorporados al roadmap. Analiza un caso y pulsa "Actualizar roadmap de la entidad".</div></div>
      </div>
    </div>
    <div>
      <div class="card gd-form">
        <h3>Añadir nodo</h3>
        <div class="gd-row">
          <div><label>Tipo</label><select id="gdNTipo">${COLS.map(t=>`<option value="${t}">${TIPO_LABEL[t]}</option>`).join('')}</select></div>
          <div><label>Estado</label><select id="gdNEstado"><option value="existente">Existente</option><option value="parcial">Parcial</option><option value="gap">GAP (no existe)</option></select></div>
        </div>
        <label>Nombre</label><input type="text" id="gdNNombre" placeholder="Ej: core-pagos, Equipo de Riesgo…">
        <button class="gd-btn" id="gdAddNodo">Añadir nodo</button>
        <h3 style="margin-top:18px;">Añadir dependencia</h3>
        <div class="gd-row">
          <div><label>Origen (quien necesita)</label><select id="gdAOrigen"></select></div>
          <div><label>Destino (lo necesitado)</label><select id="gdADestino"></select></div>
        </div>
        <div class="gd-row">
          <div><label>Tipo</label><select id="gdATipo"><option value="tecnica">Técnica</option><option value="organizativa">Organizativa</option><option value="equipo">Equipo</option></select></div>
          <div><label>Estado</label><select id="gdAEstado"><option value="satisfecha">Satisfecha</option><option value="riesgo">En riesgo</option><option value="bloqueante">Bloqueante</option></select></div>
        </div>
        <button class="gd-btn" id="gdAddArista">Añadir dependencia</button>
        <div id="gdListas" style="margin-top:14px;"></div>
      </div>
    </div>
  </div>`;
document.querySelector('main, body').appendChild(sec);

// ── Estado / helpers ─────────────────────────────────────────────────────────
let ENT = null;   // entidad cargada (completa)

async function entidadActual() {
  const nombre = (H.getS().cliente.nombre || '').trim();
  if (!nombre) return null;
  const lista = await Storage.listEntidades();
  const item = lista.find((e) => e.nombre === nombre);
  return item ? await Storage.loadEntidad(item.id) : null;
}
const g = () => ENT.grafoDependencias;
const nodoNombre = (id) => (g().nodos.find((n) => n.id === id) || { nombre: id }).nombre;

// ── Render del grafo (SVG por columnas de tipo) ──────────────────────────────
function renderGrafo() {
  const svg = H.$('gdSvg');
  const nodos = g().nodos, aristas = g().aristas;
  H.$('gdCount').textContent = `— ${nodos.length} nodos · ${aristas.length} dependencias`;
  if (!nodos.length) { svg.innerHTML = `<text x="20" y="40" font-size="12" fill="#999" font-style="italic">Sin nodos aún — añade piezas o carga el ejemplo de referencia.</text>`; return; }
  const W = 640, colW = W / COLS.length;
  const porCol = {}; COLS.forEach((t) => porCol[t] = nodos.filter((n) => n.tipo === t));
  const maxRows = Math.max(1, ...COLS.map((t) => porCol[t].length));
  const Hh = Math.max(360, 70 + maxRows * 64);
  svg.setAttribute('height', Hh);
  const pos = {};
  COLS.forEach((t, ci) => porCol[t].forEach((n, ri) => { pos[n.id] = { x: colW * ci + colW / 2, y: 70 + ri * 64 }; }));
  const DASH = { tecnica: '', organizativa: '2 3', equipo: '7 4' };
  let out = COLS.map((t, ci) => `<text x="${colW * ci + colW / 2}" y="24" text-anchor="middle" font-size="9.5" fill="#999" letter-spacing="2" style="text-transform:uppercase">${TIPO_LABEL[t].toUpperCase()}S</text>`).join('');
  out += aristas.filter((a) => pos[a.origen] && pos[a.destino]).map((a) => {
    const p1 = pos[a.origen], p2 = pos[a.destino];
    const blq = a.estado === 'bloqueante', rsg = a.estado === 'riesgo';
    const color = blq ? '#c62828' : rsg ? '#b58900' : (a.tipo === 'organizativa' ? '#4F062A' : '#999');
    const mx = (p1.x + p2.x) / 2;
    return `<path d="M ${p1.x} ${p1.y} C ${mx} ${p1.y}, ${mx} ${p2.y}, ${p2.x} ${p2.y}" fill="none" stroke="${color}" stroke-width="${blq ? 2.6 : 1.6}" stroke-dasharray="${DASH[a.tipo] || ''}" opacity=".85"><title>${H.esc(nodoNombre(a.origen))} → ${H.esc(nodoNombre(a.destino))} (${a.tipo} · ${a.estado})</title></path>`;
  }).join('');
  out += nodos.map((n) => {
    const p = pos[n.id]; if (!p) return '';
    const gap = n.estado === 'gap', par = n.estado === 'parcial';
    const fill = gap ? '#fff' : '#4F062A';
    const stroke = gap ? '#FF0054' : par ? '#b58900' : '#4F062A';
    const txt = gap ? '#FF0054' : '#fff';
    const w = Math.max(86, n.nombre.length * 6.6 + 18);
    return `<g><rect x="${p.x - w / 2}" y="${p.y - 15}" width="${w}" height="30" rx="15" fill="${fill}" stroke="${stroke}" stroke-width="2" ${gap ? 'stroke-dasharray="5 3"' : ''}/>
      <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="10.5" fill="${txt}">${H.esc(n.nombre)}</text></g>`;
  }).join('');
  svg.innerHTML = out;
}

function renderListas() {
  const opts = g().nodos.map((n) => `<option value="${n.id}">${H.esc(n.nombre)}</option>`).join('');
  H.$('gdAOrigen').innerHTML = opts; H.$('gdADestino').innerHTML = opts;
  H.$('gdListas').innerHTML = g().aristas.length ? `<table class="gd-t"><thead><tr><th>Dependencia</th><th>Estado</th><th></th></tr></thead><tbody>` +
    g().aristas.map((a) => `<tr><td>${H.esc(nodoNombre(a.origen))} → ${H.esc(nodoNombre(a.destino))} <span style="color:#999;">(${a.tipo})</span></td>
      <td class="${a.estado === 'bloqueante' ? 'gd-block' : a.estado === 'riesgo' ? 'gd-warn' : 'gd-ok'}">${a.estado}</td>
      <td><button class="gd-dellink" data-id="${a.id}">quitar</button></td></tr>`).join('') + '</tbody></table>' : '';
  H.$('gdListas').querySelectorAll('.gd-dellink').forEach((b) => b.onclick = async () => {
    ENT.grafoDependencias.aristas = g().aristas.filter((a) => a.id !== b.dataset.id);
    await Storage.saveEntidad(ENT); render();
  });
}

async function renderCasosSelect(preselect) {
  const casos = ENT ? await Storage.listCasos(ENT.id) : [];
  H.$('gdCaso').innerHTML = casos.length
    ? casos.map((c) => `<option value="${c.id}"${c.id === preselect ? ' selected' : ''}>${H.esc(c.nombre)}</option>`).join('')
    : '<option value="">— crea un caso en la pestaña 12 —</option>';
}

async function render(preselectCaso) {
  ENT = await entidadActual();
  if (!ENT) {
    H.$('gdAviso').innerHTML = `<div class="cu-aviso">La entidad aún no está guardada. <b>Guarda el assessment</b> para modelar su grafo y analizar casos de uso.</div>`;
    return;
  }
  H.$('gdAviso').innerHTML = '';
  renderGrafo(); renderListas(); await renderCasosSelect(preselectCaso); await renderRoadmap();
}

// ── Roadmap agregado de la entidad (write-back del bucle) ────────────────────
const fmtK = (n) => 'USD ' + ((n || 0) / 1000).toFixed(0) + ' K';

async function recomputarInversion() {
  // La inversión agregada de la entidad = suma de la inversión incremental de
  // cada caso de uso presente en el roadmap (una vez por caso).
  const ids = [...new Set((ENT.roadmap || []).map((r) => r.casoDeUsoId))];
  let capex = 0, opex = 0;
  for (const id of ids) {
    const c = await Storage.loadCaso(id);
    if (c) { capex += c.inversionIncremental?.capex || 0; opex += c.inversionIncremental?.opex || 0; }
  }
  ENT.inversion = { ...ENT.inversion, capexAgregado: capex, opexAgregado: opex };
}

async function renderRoadmap() {
  const esc = H.esc;
  const rm = ENT.roadmap || [];
  if (!rm.length) {
    H.$('gdRoadmap').innerHTML = '<div class="gd-empty">Aún no hay casos incorporados al roadmap. Analiza un caso y pulsa "Actualizar roadmap de la entidad".</div>';
    return;
  }
  H.$('gdRoadmap').innerHTML = `
    <table class="gd-t"><thead><tr><th>Caso de uso</th><th>Iniciativa</th><th>Slot</th><th>Devengo</th><th></th></tr></thead><tbody>
      ${rm.map((r) => `<tr><td>${esc(r.casoNombre)}</td><td>${esc(r.nombre)}</td><td>${esc(r.slot)}</td><td>${esc(r.devengo || '—')}</td>
        <td><button class="gd-dellink" data-rmcaso="${r.casoDeUsoId}">quitar caso</button></td></tr>`).join('')}
    </tbody></table>
    <div class="gd-inv">
      <div><small>CAPEX agregado</small><b>${fmtK(ENT.inversion?.capexAgregado)}</b></div>
      <div><small>OPEX anual agregado</small><b>${fmtK(ENT.inversion?.opexAgregado)}</b></div>
      <div><small>Casos en roadmap</small><b>${[...new Set(rm.map((r) => r.casoDeUsoId))].length}</b></div>
      <div style="flex:1;font-size:11.5px;color:rgba(255,255,255,.75);">Cada caso arrastra sus iniciativas y su inversión; al refinarse en el API Lab, este roadmap se recalcula.</div>
    </div>`;
  H.$('gdRoadmap').querySelectorAll('[data-rmcaso]').forEach((b) => b.onclick = async () => {
    ENT.roadmap = (ENT.roadmap || []).filter((r) => r.casoDeUsoId !== b.dataset.rmcaso);
    await recomputarInversion();
    await Storage.saveEntidad(ENT);
    renderRoadmap();
  });
}

// ── Editor: nodos y aristas ──────────────────────────────────────────────────
H.$('gdAddNodo').onclick = async () => {
  if (!ENT) return;
  const nombre = H.$('gdNNombre').value.trim(); if (!nombre) { H.$('gdNNombre').focus(); return; }
  g().nodos.push({ id: nuevoId('nodo'), tipo: H.$('gdNTipo').value, nombre, estado: H.$('gdNEstado').value, nota: '' });
  // los nodos existentes de tipo servicio/core/canal alimentan el stack (lo que el agente lee como capacidades)
  const t = H.$('gdNTipo').value, e = H.$('gdNEstado').value;
  if (e !== 'gap') {
    if (t === 'canal' && !ENT.stack.canales.includes(nombre)) ENT.stack.canales.push(nombre);
    if ((t === 'servicio' || t === 'core') && !ENT.stack.servicios.includes(nombre)) ENT.stack.servicios.push(nombre);
  }
  await Storage.saveEntidad(ENT); H.$('gdNNombre').value = ''; render();
};

H.$('gdAddArista').onclick = async () => {
  if (!ENT || !g().nodos.length) return;
  const origen = H.$('gdAOrigen').value, destino = H.$('gdADestino').value;
  if (!origen || !destino || origen === destino) return;
  g().aristas.push({ id: nuevoId('dep'), origen, destino, tipo: H.$('gdATipo').value, estado: H.$('gdAEstado').value, descripcion: '' });
  await Storage.saveEntidad(ENT); render();
};

H.$('gdSeed').onclick = async () => {
  if (!ENT) return;
  const mk = (tipo, nombre, estado = 'existente') => { const n = { id: nuevoId('nodo'), tipo, nombre, estado, nota: '' }; g().nodos.push(n); return n; };
  const nCanal = mk('canal', 'canal-embedded-habilitado');
  const nApp   = mk('canal', 'app-banca-digital');
  const nCap   = mk('capacidad', 'pagos-inmediatos');
  const nTok   = mk('servicio', 'tokenización', 'gap');
  const nCore  = mk('core', 'core-pagos');
  const nRiesgo= mk('equipo', 'Equipo de Riesgo');
  const nTribu = mk('equipo', 'Tribu Pagos');
  const mkA = (o, d, tipo, estado = 'satisfecha') => g().aristas.push({ id: nuevoId('dep'), origen: o.id, destino: d.id, tipo, estado, descripcion: '' });
  mkA(nCap, nCore, 'tecnica'); mkA(nCanal, nCap, 'tecnica'); mkA(nApp, nCap, 'tecnica');
  mkA(nCap, nTok, 'tecnica', 'bloqueante'); mkA(nCap, nRiesgo, 'organizativa', 'riesgo'); mkA(nCap, nTribu, 'equipo');
  ENT.stack.canales = [...new Set([...ENT.stack.canales, 'canal-embedded-habilitado', 'app-banca-digital'])];
  ENT.stack.servicios = [...new Set([...ENT.stack.servicios, 'core-pagos'])];
  await Storage.saveEntidad(ENT); render();
};

// ── Análisis del delta con el agente ─────────────────────────────────────────
H.$('gdAnalizar').onclick = async () => {
  if (!ENT) return;
  const casoId = H.$('gdCaso').value; if (!casoId) return;
  const caso = await Storage.loadCaso(casoId);
  H.$('gdResultado').innerHTML = '<div class="gd-spin">El agente está analizando el caso contra el set up de la entidad…</div>';
  const d = await Agents.gapsYDependencias(caso, ENT);
  // persistir el delta en el caso (queda disponible para roadmap/business case)
  caso.necesidades = { apisNecesarias: d.apisNecesarias, necesidadesTecnologicas: d.necesidadesTecnologicas, necesidadesEquipo: d.necesidadesEquipo, gaps: d.gaps, dependencias: d.dependencias };
  caso.inversionIncremental = { ...caso.inversionIncremental, ...d.inversionIncremental };
  await Storage.saveCaso(caso);
  const esc = H.esc, fmt = (n) => 'USD ' + (n / 1000).toFixed(0) + ' K';
  const estadoCls = (e) => e === 'bloqueante' ? 'gd-block' : e === 'riesgo' ? 'gd-warn' : 'gd-ok';
  H.$('gdResultado').innerHTML = `
    ${d._mock ? '<span class="gd-mock">Datos simulados — agente mock</span>' : ''}
    <h4>APIs necesarias</h4>
    <table class="gd-t"><thead><tr><th>API</th><th>Estado</th><th>Razón</th></tr></thead><tbody>
      ${d.apisNecesarias.map((a) => `<tr><td>${esc(a.nombre)}</td><td class="${a.estado === 'existente' ? 'gd-ok' : 'gd-warn'}">${a.estado}</td><td>${esc(a.razon)}</td></tr>`).join('')}
    </tbody></table>
    <h4>Necesidades tecnológicas</h4>
    ${d.necesidadesTecnologicas.length ? `<table class="gd-t"><thead><tr><th>Pieza</th><th>Capa</th><th>Esfuerzo estimado</th></tr></thead><tbody>
      ${d.necesidadesTecnologicas.map((t) => `<tr><td>${esc(t.item)}</td><td>${esc(t.capa)}</td><td>${esc(t.inversionEstim)}</td></tr>`).join('')}</tbody></table>`
      : '<div class="gd-empty">Ninguna — la entidad ya cuenta con la base tecnológica para este caso.</div>'}
    <h4>Necesidades de equipo</h4>
    <table class="gd-t"><thead><tr><th>Rol</th><th>Duración</th><th>Motivo</th></tr></thead><tbody>
      ${d.necesidadesEquipo.map((q) => `<tr><td>${esc(q.rol)}</td><td>${esc(q.duracion)}</td><td>${esc(q.motivo)}</td></tr>`).join('')}
    </tbody></table>
    <h4>Dependencias detectadas</h4>
    <table class="gd-t"><thead><tr><th>Dependencia</th><th>Tipo</th><th>Estado</th></tr></thead><tbody>
      ${d.dependencias.map((a) => `<tr><td>${esc(a.origen)} → ${esc(a.destino)}</td><td>${esc(a.tipo)}</td><td class="${estadoCls(a.estado)}">${a.estado}</td></tr>`).join('')}
    </tbody></table>
    <button class="gd-btn-sec" id="gdIncorporar">Incorporar dependencias al grafo</button>
    <button class="gd-btn" id="gdRoadmapBtn" style="margin-left:8px;">Actualizar roadmap de la entidad →</button>
    <div class="gd-inv">
      <div><small>CAPEX incremental</small><b>${fmt(d.inversionIncremental.capex)}</b></div>
      <div><small>OPEX anual</small><b>${fmt(d.inversionIncremental.opex)}</b></div>
      <div><small>Confianza</small><b style="font-size:15px;">${esc(d.inversionIncremental.confianza)}</b></div>
      <div style="flex:1;font-size:11.5px;color:rgba(255,255,255,.75);">Este delta queda guardado en el caso de uso y alimentará el roadmap y el business case de la entidad.</div>
    </div>`;
  H.$('gdRoadmapBtn').onclick = async () => {
    const btn = H.$('gdRoadmapBtn');
    btn.disabled = true; btn.textContent = 'El agente está generando las iniciativas…';
    const rm = await Agents.actualizarRoadmap(caso, ENT);
    // sustituir (no duplicar) las entradas previas de este caso
    ENT.roadmap = (ENT.roadmap || []).filter((r) => r.casoDeUsoId !== caso.id);
    for (const ini of rm.iniciativas) {
      ENT.roadmap.push({ id: nuevoId('rm'), casoDeUsoId: caso.id, casoNombre: caso.nombre, nombre: ini.nombre, slot: ini.slot, devengo: rm.inversion?.devengo || null });
    }
    await recomputarInversion();
    await Storage.saveEntidad(ENT);
    btn.disabled = false; btn.textContent = 'Roadmap actualizado ✓';
    await renderRoadmap();
  };

  H.$('gdIncorporar').onclick = async () => {
    const porNombre = {}; g().nodos.forEach((n) => porNombre[n.nombre] = n);
    for (const a of d.dependencias) {
      const asegurar = (nombre, tipoDef) => porNombre[nombre] || (porNombre[nombre] = (() => { const n = { id: nuevoId('nodo'), tipo: tipoDef, nombre, estado: 'existente', nota: 'del análisis' }; g().nodos.push(n); return n; })());
      const o = asegurar(a.origen, 'capacidad');
      const t = asegurar(a.destino, /equipo|riesgo|tribu/i.test(a.destino) ? 'equipo' : 'servicio');
      const dup = g().aristas.some((x) => x.origen === o.id && x.destino === t.id);
      if (!dup) g().aristas.push({ id: nuevoId('dep'), origen: o.id, destino: t.id, tipo: a.tipo, estado: a.estado, descripcion: a.descripcion || 'del análisis del caso' });
    }
    await Storage.saveEntidad(ENT); render(H.$('gdCaso').value);
  };
};

// ── API para otros módulos (activa el botón de la pestaña 12) ────────────────
window.__obaGaps = {
  abrir(casoId) { window.tab('tGD'); render(casoId); },
};
