// inventory-cruce.js — Inventario cruzado con un caso de uso (F19 · Método MBC)
// ─────────────────────────────────────────────────────────────────────────────
// Marca cada API del inventario respecto a un caso: reutilizable, a extender o
// no aplica, y lista las APIs nuevas que ningún activo cubre. Usa la MISMA
// función que el paso 5 del Discovery (core/viabilidad.js), así el mismo caso
// da la misma respuesta en los dos módulos.
//
// Entradas:
//   ?estudio=<id>                         estudio guardado en el Discovery (con paquete de requerimientos)
//   ?caso=<id>                            caso de uso del Assessment (recursos del delta de GAPs)
//   ?dcaso=<nombre>&req=a;b&comp=c;d      directo desde el paso 5 del Discovery, sin guardar
//   o el selector "Cruzar con un caso" de la propia página.
// Módulo aditivo: sin él, el inventario funciona igual que antes.
// ─────────────────────────────────────────────────────────────────────────────

import { clasificarCaso, clasificarRecursos, vistaPorApi, ESTADO_INFO, Estado } from '../../core/viabilidad.js';
import { Storage } from '../../core/storage.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const APIS = window.OBA_INVENTORY || [];

const css = document.createElement('style');
css.textContent = `
  .ic{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);margin-bottom:18px;overflow:hidden;font-family:var(--sans);}
  .ic-h{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 20px;flex-wrap:wrap;}
  .ic-t{font-size:14px;font-weight:800;color:var(--mbc-navy);}
  .ic-s{font-size:12px;color:var(--text-dim);margin-top:3px;max-width:640px;line-height:1.5;}
  .ic-sel{display:flex;gap:8px;align-items:center;}
  .ic-sel select{padding:8px 10px;border:1px solid var(--line);border-radius:var(--radius-sm);font-family:var(--sans);font-size:12.5px;min-width:320px;background:#fff;color:var(--text);}
  .ic-btn{font-family:var(--sans);font-size:12px;font-weight:700;border-radius:var(--radius-sm);padding:9px 14px;cursor:pointer;border:1.5px solid transparent;text-decoration:none;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}
  .ic-btn.pri{background:var(--mbc-navy);color:#fff;} .ic-btn.pri:hover{background:var(--mbc-navy-deep);}
  .ic-btn.sec{background:#fff;color:var(--mbc-navy);border-color:var(--line);} .ic-btn.sec:hover{border-color:var(--mbc-electric);background:var(--mbc-electric-soft);}
  .ic.on{border-color:rgba(20,122,255,.4);}
  .ic.on .ic-h{background:var(--mbc-electric-soft);border-bottom:1px solid rgba(20,122,255,.25);}
  .ic-kick{font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--mbc-electric);margin-bottom:3px;}
  .ic-b{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;align-items:center;padding:16px 20px;}
  .ic-sem{display:inline-flex;align-items:center;gap:7px;font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;border-radius:var(--pill);padding:3px 10px;margin-bottom:6px;}
  .ic-sem::before{content:"";width:8px;height:8px;border-radius:50%;background:currentColor;}
  .ic-sem.verde{background:var(--ok-soft);color:var(--ok);} .ic-sem.ambar{background:var(--warn-soft);color:var(--warn-text);} .ic-sem.rojo{background:var(--bad-soft);color:var(--bad);}
  .ic-tit{font-size:15px;font-weight:800;color:var(--mbc-navy);margin-bottom:4px;}
  .ic-lec{font-size:12.5px;color:var(--text);line-height:1.55;}
  .ic-cnt{display:grid;grid-template-columns:repeat(4,auto);gap:8px;}
  .ic-c{background:var(--bg);border-radius:10px;padding:8px 12px;text-align:center;min-width:80px;}
  .ic-c b{display:block;font-size:20px;font-weight:800;color:var(--mbc-navy);line-height:1;} .ic-c span{font-size:10px;font-weight:700;color:var(--text-dim);}
  .ic-msg{padding:12px 20px;font-size:12.5px;color:var(--text-dim);border-top:1px solid var(--line);}
  .ic-tag{display:inline-block;font-size:10px;font-weight:800;border-radius:var(--pill);padding:3px 9px;white-space:nowrap;}
  .ic-tag.reutilizable{background:var(--ok-soft);color:var(--ok);} .ic-tag.extender{background:var(--mbc-electric-soft);color:var(--mbc-navy);}
  .ic-tag.nueva{background:var(--warn-soft);color:var(--warn-text);} .ic-tag.sin-capacidad{background:var(--bad-soft);color:var(--bad);}
  .ic-tag.na{background:var(--bg);color:var(--text-faint);}
  .ic-ops{display:block;font-size:10.5px;color:var(--text-faint);margin-top:3px;}
  table.inv tr.ic-na td{opacity:.45;} table.inv tr.ic-na:hover td{opacity:.8;}
  table.inv tr.ic-hit td:first-child{box-shadow:inset 3px 0 0 var(--mbc-electric);}
  .ic-det{background:var(--mbc-electric-soft);border:1px solid rgba(20,122,255,.25);border-radius:10px;padding:12px 14px;margin-bottom:16px;}
  .ic-det .dsec-title{margin-bottom:6px;}
  .ic-det li{list-style:none;display:flex;gap:10px;align-items:flex-start;font-size:12px;padding:5px 0;border-top:1px solid rgba(20,122,255,.15);}
  .ic-det li:first-child{border-top:none;}
  .ic-det code{font-family:var(--mono);font-size:11px;color:var(--mbc-navy);white-space:nowrap;}
  .ic-det .r{color:var(--text-dim);font-size:11.5px;}
  .ic-new{margin-top:20px;}
  .ic-new-h{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:10px;}
  .ic-new-h h3{font-size:16px;font-weight:800;color:var(--mbc-navy);}
  .ic-new-h p{font-size:12px;color:var(--text-dim);margin-top:3px;}
  .ic-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
  .ic-card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:14px 16px;display:flex;flex-direction:column;gap:8px;}
  .ic-card code{font-family:var(--mono);font-size:12px;color:var(--mbc-navy);font-weight:600;}
  .ic-card .r{font-size:12px;color:var(--text-dim);line-height:1.5;}
  .ic-card .al{font-size:11.5px;color:var(--warn-text);}
  .ic-card .acts{margin-top:auto;padding-top:6px;}
  .ic-empty{background:var(--panel);border:1px dashed var(--line);border-radius:var(--radius);padding:14px 16px;font-size:12.5px;color:var(--text-dim);}
`;
document.head.appendChild(css);

// ── Estado del cruce ──
let fuente = null;   // { tipo:'estudio'|'caso'|'discovery', id, nombre, entidad }
let res = null;      // resultado de clasificación
let porApi = new Map();

const ORIGEN = { estudio: 'Estudio de Discovery', caso: 'Caso del Assessment', discovery: 'Discovery (sin guardar)' };

function enlaceDesigner(item) {
  const api = encodeURIComponent(item.recurso || item.endpoint);
  if (fuente.tipo === 'estudio') return `api-designer.html?estudio=${encodeURIComponent(fuente.id)}&api=${api}`;
  if (fuente.tipo === 'caso') return `api-designer.html?caso=${encodeURIComponent(fuente.id)}&api=${api}`;
  return `api-designer.html?usecase=${encodeURIComponent(fuente.nombre)}&api=${api}`;
}

// ── Ganchos que usa renderInv()/abrirDetalle() del inventario ──
const RANK = { extender: 0, reutilizable: 1 };
window.invCruce = null;
function activarGanchos() {
  window.invCruce = {
    orden: (a, b) => (porApi.has(a.id) ? RANK[porApi.get(a.id).estado] : 9) - (porApi.has(b.id) ? RANK[porApi.get(b.id).estado] : 9),
    clase: (a) => (porApi.has(a.id) ? 'ic-hit' : 'ic-na'),
    celda: (a) => {
      const v = porApi.get(a.id);
      if (!v) return '<td><span class="ic-tag na">No aplica</span></td>';
      const n = (e) => v.items.filter((i) => i.estado === e).length;
      const pl = (k, uno, varios) => `${k} ${k === 1 ? uno : varios}`;
      const partes = [n('reutilizable') && pl(n('reutilizable'), 'ya existe', 'ya existen'), n('extender') && pl(n('extender'), 'a añadir', 'a añadir')].filter(Boolean);
      const ops = fuente.tipo === 'caso' ? '' : `<span class="ic-ops">${pl(v.items.length, 'operación', 'operaciones')}: ${partes.join(' · ')}</span>`;
      return `<td><span class="ic-tag ${v.estado}">${v.estado === 'extender' ? 'A extender' : 'Reutilizable'}</span>${ops}</td>`;
    },
    detalle: (a) => {
      const v = porApi.get(a.id);
      $('dCruce').innerHTML = !v
        ? `<div class="ic-det"><div class="dsec-title">Para «${esc(fuente.nombre)}»</div><div class="r" style="font-size:12px;color:var(--text-dim)">El caso no necesita esta API.</div></div>`
        : `<div class="ic-det"><div class="dsec-title">Qué pide «${esc(fuente.nombre)}» a esta API</div><ul>${v.items.map((i) => `
            <li><span class="ic-tag ${i.estado}">${ESTADO_INFO[i.estado].etiqueta}</span><div><code>${esc(i.endpoint)}</code><div class="r">${esc(i.razon)}${i.alerta ? ` · Condición: ${esc(i.alerta)}` : ''}</div></div></li>`).join('')}</ul></div>`;
      if (v && fuente.tipo === 'estudio') $('dExtender').href = `api-designer.html?from=${a.id}&estudio=${encodeURIComponent(fuente.id)}`;
    },
  };
  $('thCruce').style.display = '';
}
function desactivarGanchos() {
  window.invCruce = null; porApi = new Map();
  $('thCruce').style.display = 'none';
  if ($('dCruce')) $('dCruce').innerHTML = '';
}

// ── Panel superior ──
const panel = document.createElement('div');
panel.className = 'ic'; panel.id = 'icPanel';
document.querySelector('.toolbar').before(panel);
const nuevas = document.createElement('div');
nuevas.className = 'ic-new'; nuevas.id = 'icNuevas';
document.querySelector('.detail').before(nuevas);

async function opciones() {
  const est = await Storage.listEstudios().catch(() => []);
  const detEst = await Promise.all(est.map((e) => Storage.loadEstudio(e.id)));
  const ents = await Storage.listEntidades().catch(() => []);
  const casos = [];
  for (const e of ents) for (const c of await Storage.listCasos(e.id).catch(() => [])) casos.push({ ...c, entidad: e.nombre });
  const oE = detEst.filter(Boolean).map((e) => `<option value="estudio:${esc(e.id)}">${esc(e.nombre)}${e.paquete ? ' · con paquete de requerimientos' : ''}</option>`).join('');
  const oC = casos.map((c) => `<option value="caso:${esc(c.id)}">${esc(c.nombre || 'Caso sin nombre')} · ${esc(c.entidad || 'entidad')}</option>`).join('');
  return (oE ? `<optgroup label="Estudios del Discovery">${oE}</optgroup>` : '') + (oC ? `<optgroup label="Casos de uso del Assessment">${oC}</optgroup>` : '')
    || '<option value="">No hay estudios ni casos guardados todavía</option>';
}

async function pintarPanel() {
  const opts = await opciones();
  const selector = `<div class="ic-sel"><select id="icSel"><option value="">${fuente ? 'Cambiar de caso…' : 'Elige un estudio o un caso…'}</option>${opts}</select><button class="ic-btn ${fuente ? 'sec' : 'pri'}" id="icGo">Cruzar</button>${fuente ? '<button class="ic-btn sec" id="icOff">Quitar cruce</button>' : ''}</div>`;
  if (!fuente) {
    panel.className = 'ic';
    panel.innerHTML = `<div class="ic-h"><div><div class="ic-t">Cruzar el inventario con un caso de uso</div><div class="ic-s">Marca qué APIs se reutilizan, cuáles hay que extender y qué falta, con las mismas reglas que la viabilidad del Discovery.</div></div>${selector}</div>`;
  } else if (!res) {
    panel.className = 'ic on';
    panel.innerHTML = `<div class="ic-h"><div><div class="ic-kick">${ORIGEN[fuente.tipo]}</div><div class="ic-t">${esc(fuente.nombre)}</div></div>${selector}</div><div class="ic-msg">${esc(fuente.aviso || 'Este caso no tiene APIs que cruzar todavía.')}</div>`;
  } else {
    const c = res.resumen;
    panel.className = 'ic on';
    panel.innerHTML = `
      <div class="ic-h"><div><div class="ic-kick">${ORIGEN[fuente.tipo]} · cruce con el inventario</div><div class="ic-t">${esc(fuente.nombre)}</div></div>${selector}</div>
      <div class="ic-b">
        <div><span class="ic-sem ${res.semaforo}">${res.semaforo === 'verde' ? 'Viable' : res.semaforo === 'ambar' ? 'Viable con desarrollo' : 'Requiere capacidad nueva'}</span>
          <div class="ic-tit">${esc(res.titular)}</div>
          <div class="ic-lec">${porApi.size} de ${APIS.length} APIs del inventario participan en el caso${fuente.entidad ? ` · set up de <b>${esc(fuente.entidad.nombre || 'la entidad')}</b>` : ''}. <span class="chip-metodo" style="margin-left:4px">Método MBC · misma regla que el Discovery</span></div></div>
        <div class="ic-cnt">
          <div class="ic-c"><b>${c.reutilizable}</b><span>Reutilizables</span></div>
          <div class="ic-c"><b>${c.extender}</b><span>A extender</span></div>
          <div class="ic-c"><b>${c.nueva}</b><span>Nuevas</span></div>
          <div class="ic-c"><b>${c.sinCapacidad}</b><span>Sin capacidad</span></div>
        </div>
      </div>`;
  }
  $('icGo').onclick = () => { const v = $('icSel').value; if (!v) return; const [tipo, id] = v.split(':'); aplicar({ tipo, id }, true); };
  if ($('icOff')) $('icOff').onclick = () => { fuente = null; res = null; history.replaceState(null, '', location.pathname); desactivarGanchos(); nuevas.innerHTML = ''; window.renderInv(); pintarPanel(); };
}

function pintarNuevas() {
  const faltan = res.items.filter((i) => i.estado === Estado.NUEVA || i.estado === Estado.SIN_CAPACIDAD);
  const titulo = `<div class="ic-new-h"><div><h3>APIs nuevas que ningún activo cubre</h3><p>Lo que el caso pide y no está en el inventario: se diseña desde cero o requiere capacidad nueva.</p></div></div>`;
  if (!faltan.length) { nuevas.innerHTML = titulo + '<div class="ic-empty">Todo lo que pide el caso está cubierto por APIs existentes o por extensiones de ellas.</div>'; return; }
  nuevas.innerHTML = titulo + `<div class="ic-grid">${faltan.map((i) => `
    <div class="ic-card">
      <div><span class="ic-tag ${i.estado}">${ESTADO_INFO[i.estado].etiqueta}</span></div>
      <code>${esc(i.endpoint)}</code>
      <div class="r">${esc(i.razon)}</div>
      ${i.alerta ? `<div class="al">Condición: ${esc(i.alerta)}</div>` : ''}
      <div class="acts">${i.estado === Estado.NUEVA
        ? `<a class="ic-btn pri" href="${enlaceDesigner(i)}">Diseñar nueva →</a>`
        : `<a class="ic-btn sec" href="../1-discovery/assessment/index.html">Revisar en el set up de la entidad →</a>`}</div>
    </div>`).join('')}</div>`;
}

async function entidadMasReciente() {
  const l = await Storage.listEntidades().catch(() => []);
  if (!l.length) return null;
  l.sort((a, b) => String(b.actualizadoEn || '').localeCompare(String(a.actualizadoEn || '')));
  return Storage.loadEntidad(l[0].id);
}

async function aplicar(src, actualizarUrl) {
  fuente = null; res = null; desactivarGanchos(); nuevas.innerHTML = '';
  let endpoints = null, recursos = null, entidad = null, nombre = '', aviso = '';
  if (src.tipo === 'estudio') {
    const e = await Storage.loadEstudio(src.id);
    if (!e) { aviso = 'No se encuentra el estudio.'; }
    else {
      nombre = e.nombre;
      const apis = e.paquete?.viabilidad?.apis;
      if (apis?.length) endpoints = apis.map((a) => ({ endpoint: a.endpoint, rol: a.rol }));
      else aviso = 'Este estudio no tiene paquete de requerimientos: genéralo en el paso 5 del Discovery y guárdalo como estudio.';
    }
    entidad = await entidadMasReciente();
  } else if (src.tipo === 'caso') {
    const c = await Storage.loadCaso(src.id);
    if (!c) { aviso = 'No se encuentra el caso.'; }
    else {
      nombre = c.nombre || 'Caso sin nombre';
      entidad = c.entidadId ? await Storage.loadEntidad(c.entidadId) : null;
      const r = c.necesidades?.apisNecesarias || [];
      if (r.length) recursos = r;
      else aviso = 'El caso aún no tiene análisis de GAPs: calcúlalo en la pestaña 13 del Assessment.';
    }
  } else if (src.tipo === 'discovery') {
    nombre = src.nombre;
    endpoints = [...src.req.map((e) => ({ endpoint: e, rol: 'requerida' })), ...src.comp.map((e) => ({ endpoint: e, rol: 'complementaria' }))];
    entidad = await entidadMasReciente();
  }
  fuente = { ...src, nombre: nombre || 'Caso', entidad, aviso };
  if (actualizarUrl && src.tipo !== 'discovery') history.replaceState(null, '', `${location.pathname}?${src.tipo}=${encodeURIComponent(src.id)}`);
  if (endpoints) res = clasificarCaso(endpoints, { inventario: APIS, entidad });
  else if (recursos) res = clasificarRecursos(recursos, { inventario: APIS, entidad });
  if (res) { porApi = vistaPorApi(res); activarGanchos(); pintarNuevas(); }
  window.renderInv();
  if ($('detail').classList.contains('open')) $('detail').classList.remove('open');
  await pintarPanel();
}

// ── Arranque ──
const q = new URLSearchParams(location.search);
const split = (s) => (s || '').split(';').map((x) => x.trim()).filter(Boolean);
if (q.get('estudio')) aplicar({ tipo: 'estudio', id: q.get('estudio') });
else if (q.get('caso')) aplicar({ tipo: 'caso', id: q.get('caso') });
else if (q.get('dcaso')) aplicar({ tipo: 'discovery', nombre: q.get('dcaso'), req: split(q.get('req')), comp: split(q.get('comp')) });
else pintarPanel();
