// discovery-viabilidad.js — Paso 5 del Discovery: viabilidad, requerimientos y paquete de negocio (F18)
// ─────────────────────────────────────────────────────────────────────────────
// Módulo aditivo. Escucha `discovery:resultados` (lo emite buildResults() en
// index.html) y, bajo los resultados de mercado, añade:
//   A · Viabilidad temprana       Método MBC — core/viabilidad.js contra el inventario y el set up
//   B · Requerimientos del producto  Híbrido — Agents.requerimientosProducto propone, el consultor edita
//   C · Paquete de requerimientos de negocio  Método MBC — Markdown / JSON / estudio → API Designer
// Marca además los pasos con los chips de D15 y enlaza el caso con su demo si existe.
// Si el módulo no carga (file:// sin servidor), el Discovery sigue funcionando como antes.
// ─────────────────────────────────────────────────────────────────────────────

import { clasificarCaso, politicasAplicables, ESTADO_INFO } from '../../../core/viabilidad.js';
import { Agents } from '../../../core/agents.js';
import { Storage } from '../../../core/storage.js';

// Casos del catálogo con demo en la biblioteca (slug de demos/catalog.js)
const DEMO_POR_CASO = {
  'Recaudación digital automatizada': 'uy-mandato-debito-precargado-push',
  'Personal finance management en apps': 'brujula-bienestar-financiero',
};

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const slug = (s) => String(s || 'caso').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const svg = (d, w = 14) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  down: '<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>',
  save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3"/><path d="M8 21v-7h8v7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  play: '<rect x="3" y="5" width="18" height="13" rx="2"/><path d="m10 9 4 2.5-4 2.5z" fill="currentColor" stroke="none"/>',
  warn: '<path d="M12 4 2.5 20h19L12 4z"/><path d="M12 10v4M12 17.5v.5"/>',
};

// ── Estilos (tokens de assets/mbc-tokens.css) ──
const css = document.createElement('style');
css.textContent = `
  .dv{margin-top:36px;font-family:var(--sans);}
  .dv-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:16px;}
  .dv-kicker{font-size:10.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--mbc-electric);margin-bottom:6px;}
  .dv-h{font-size:22px;font-weight:800;color:var(--mbc-navy);}
  .dv-lead{font-size:13px;color:var(--text-dim);margin-top:6px;max-width:760px;line-height:1.55;}
  .dv-card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);margin-bottom:16px;overflow:hidden;}
  .dv-card-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;border-bottom:1px solid var(--line);}
  .dv-card-t{font-size:15px;font-weight:800;color:var(--mbc-navy);display:flex;align-items:center;gap:10px;}
  .dv-card-t .n{width:22px;height:22px;border-radius:50%;background:var(--mbc-navy);color:#fff;font-size:10.5px;display:inline-flex;align-items:center;justify-content:center;}
  .dv-card-b{padding:18px 20px;}
  .dv-verdict{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:center;margin-bottom:18px;}
  .dv-sem{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;border-radius:var(--pill);padding:4px 11px;margin-bottom:8px;}
  .dv-sem::before{content:"";width:9px;height:9px;border-radius:50%;background:currentColor;}
  .dv-sem.verde{background:var(--ok-soft);color:var(--ok);} .dv-sem.ambar{background:var(--warn-soft);color:var(--warn-text);} .dv-sem.rojo{background:var(--bad-soft);color:var(--bad);}
  .dv-tit{font-size:17px;font-weight:800;color:var(--mbc-navy);margin-bottom:6px;}
  .dv-lec{font-size:13px;line-height:1.6;color:var(--text);}
  .dv-count{display:grid;grid-template-columns:repeat(5,auto);gap:8px;}
  .dv-c{background:var(--bg);border-radius:10px;padding:10px 12px;min-width:84px;text-align:center;}
  .dv-c b{display:block;font-size:22px;font-weight:800;color:var(--mbc-navy);line-height:1;}
  .dv-c span{font-size:10px;font-weight:700;color:var(--text-dim);letter-spacing:.02em;}
  .dv-c.esf b{font-size:14px;padding:4px 0;}
  table.dv-t{width:100%;border-collapse:collapse;font-size:12.5px;}
  .dv-t th{text-align:left;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--text-faint);padding:8px 10px;border-bottom:1px solid var(--line);}
  .dv-t td{padding:10px;border-bottom:1px solid var(--line);vertical-align:top;color:var(--text);line-height:1.45;}
  .dv-t tr:last-child td{border-bottom:none;}
  .dv-t code{font-family:var(--mono);font-size:11.5px;color:var(--mbc-navy);background:var(--bg);padding:2px 6px;border-radius:5px;white-space:nowrap;}
  .dv-rol{font-size:10.5px;font-weight:700;color:var(--text-faint);}
  .dv-tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.03em;border-radius:var(--pill);padding:3px 9px;white-space:nowrap;}
  .dv-tag.reutilizable{background:var(--ok-soft);color:var(--ok);} .dv-tag.extender{background:var(--mbc-electric-soft);color:var(--mbc-navy);}
  .dv-tag.nueva{background:var(--warn-soft);color:var(--warn-text);} .dv-tag.sin-capacidad{background:var(--bad-soft);color:var(--bad);}
  .dv-base{font-size:12px;font-weight:600;color:var(--mbc-navy);} .dv-base small{display:block;font-weight:500;color:var(--text-faint);font-size:11px;}
  .dv-alert{display:flex;gap:6px;align-items:flex-start;margin-top:5px;font-size:11.5px;color:var(--warn-text);}
  .dv-alert svg{flex:0 0 auto;margin-top:1px;}
  .dv-foot{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;padding:12px 20px;border-top:1px solid var(--line);background:var(--bg);font-size:11.5px;color:var(--text-dim);}
  .dv-foot a{color:var(--mbc-navy);font-weight:700;text-decoration:underline;text-decoration-color:rgba(20,122,255,.5);text-underline-offset:2px;}
  .dv-banner{display:flex;gap:10px;align-items:center;background:var(--mbc-electric-soft);border:1px solid rgba(20,122,255,.25);border-radius:10px;padding:10px 14px;font-size:12px;color:var(--mbc-navy);margin-bottom:16px;}
  .dv-grupos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}
  .dv-g h4{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--text-faint);margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;}
  .dv-g h4 span{font-weight:700;letter-spacing:0;text-transform:none;color:var(--text-faint);}
  .dv-li{display:flex;gap:8px;align-items:flex-start;padding:7px 8px;border-radius:8px;border:1px solid transparent;}
  .dv-li:hover{border-color:var(--line);background:var(--bg);}
  .dv-li .tx{flex:1;font-size:12.5px;line-height:1.5;color:var(--text);outline:none;border-radius:4px;padding:1px 3px;}
  .dv-li .tx:focus{background:var(--panel);box-shadow:0 0 0 2px rgba(20,122,255,.35);}
  .dv-li .ag{flex:0 0 auto;font-size:9px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--mbc-electric);border:1px solid rgba(20,122,255,.35);border-radius:var(--pill);padding:1px 6px;margin-top:2px;}
  .dv-li button{flex:0 0 auto;background:none;border:none;color:var(--text-faint);cursor:pointer;padding:2px;opacity:0;}
  .dv-li:hover button{opacity:1;} .dv-li button:hover{color:var(--bad);}
  .dv-add{margin-top:6px;background:none;border:1px dashed var(--line);border-radius:8px;color:var(--mbc-navy);font-family:var(--sans);font-size:11.5px;font-weight:700;padding:6px 10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
  .dv-add:hover{border-color:var(--mbc-electric);background:var(--mbc-electric-soft);}
  .dv-inc{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:18px;}
  .dv-inc div{background:var(--bg);border-radius:10px;padding:10px 12px;font-size:11.5px;color:var(--text-dim);line-height:1.4;}
  .dv-inc b{display:block;font-size:13px;color:var(--mbc-navy);font-weight:800;margin-bottom:2px;}
  .dv-acts{display:flex;gap:10px;flex-wrap:wrap;align-items:center;}
  .dv-btn{display:inline-flex;align-items:center;gap:7px;font-family:var(--sans);font-size:12.5px;font-weight:700;padding:10px 16px;border-radius:var(--radius-sm);cursor:pointer;border:1.5px solid transparent;text-decoration:none;}
  .dv-btn.pri{background:var(--mbc-navy);color:#fff;} .dv-btn.pri:hover{background:var(--mbc-navy-deep);}
  .dv-btn.sec{background:var(--panel);color:var(--mbc-navy);border-color:var(--line);} .dv-btn.sec:hover{border-color:var(--mbc-electric);background:var(--mbc-electric-soft);}
  .dv-msg{font-size:12px;font-weight:700;color:var(--ok);}
  .dv-demo{display:flex;justify-content:space-between;align-items:center;gap:14px;border:1px solid rgba(20,122,255,.3);background:var(--mbc-electric-soft);border-radius:var(--radius);padding:14px 18px;margin-bottom:16px;}
  .dv-demo b{display:block;font-size:13.5px;color:var(--mbc-navy);font-weight:800;margin-bottom:2px;} .dv-demo span{font-size:12px;color:var(--text-dim);}
  .dv-load{font-size:12.5px;color:var(--text-dim);padding:6px 0;display:flex;gap:10px;align-items:center;}
  .dv-load::before{content:"";width:14px;height:14px;border-radius:50%;border:2px solid var(--line);border-top-color:var(--mbc-electric);animation:dvspin .8s linear infinite;}
  @keyframes dvspin{to{transform:rotate(360deg)}}
  .dv-chiprow{display:flex;gap:6px;flex-wrap:wrap;margin:-6px 0 18px;}
  .catalog-item .dv-demo-badge{margin-left:8px;font-size:9px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--mbc-navy);background:var(--mbc-electric-soft);border:1px solid rgba(20,122,255,.35);border-radius:var(--pill);padding:1px 6px;vertical-align:1px;}
  @media (max-width:900px){.dv-verdict{grid-template-columns:1fr}.dv-count{grid-template-columns:repeat(3,auto)}.dv-grupos,.dv-inc{grid-template-columns:1fr}.dv-t .col-base{display:none}}
`;
document.head.appendChild(css);

// ── Chips de la convención agente / determinista (D15) en los pasos existentes ──
function chipRow(html, beforeEl) {
  if (!beforeEl || beforeEl.previousElementSibling?.classList?.contains('dv-chiprow') || beforeEl.nextElementSibling?.classList?.contains('dv-chiprow')) return;
  const d = document.createElement('div'); d.className = 'dv-chiprow'; d.innerHTML = html;
  beforeEl.after(d);
}
function marcarPasos() {
  const titulos = document.querySelectorAll('.section-title');
  chipRow('<span class="chip-metodo">Método MBC · repositorio de casos trabajados</span>', titulos[0]);
  chipRow('<span class="chip-agente">Agente · audiencias sintéticas (marketDiscovery)</span><span class="chip-metodo">Método MBC · variables de decisión por segmento</span>', titulos[1]);
  const lbl = $('sl5'); if (lbl) lbl.textContent = 'Viabilidad';
}

// ── Demo relacionada (lee demos/catalog.js; solo demos no borrador) ──
let catalogoDemos = null;
function cargarCatalogoDemos() {
  return new Promise((res) => {
    if (catalogoDemos) return res(catalogoDemos);
    const s = document.createElement('script');
    s.src = '../../../demos/catalog.js';
    s.onload = () => { catalogoDemos = (window.DEMO_CATALOG || []).filter((d) => d.estado !== 'borrador'); res(catalogoDemos); };
    s.onerror = () => { catalogoDemos = []; res(catalogoDemos); };
    document.head.appendChild(s);
  });
}
function demoDe(caso) {
  const sl = DEMO_POR_CASO[caso];
  return sl && (catalogoDemos || []).find((d) => d.slug === sl);
}
async function marcarCatalogo() {
  await cargarCatalogoDemos();
  document.querySelectorAll('.catalog-item').forEach((el) => {
    const nombre = el.textContent.trim();
    if (demoDe(nombre) && !el.querySelector('.dv-demo-badge')) el.insertAdjacentHTML('beforeend', '<span class="dv-demo-badge" title="Caso con demo en la biblioteca">Demo</span>');
  });
}

// ── Set up de la entidad más reciente (Assessment), si existe ──
async function entidadActiva() {
  try {
    const l = await Storage.listEntidades();
    if (!l.length) return null;
    l.sort((a, b) => String(b.actualizadoEn || '').localeCompare(String(a.actualizadoEn || '')));
    return await Storage.loadEntidad(l[0].id);
  } catch { return null; }
}

// ── Estado del paso 5 ──
let ctx = null;      // detalle del evento
let via = null;      // resultado de clasificarCaso
let reqs = null;     // grupos de requerimientos (editables)
let ent = null;      // entidad usada en el cruce

function mercado() {
  const t = (id) => ($(id)?.textContent || '').trim();
  return {
    tam: { usuarios: t('tam-users'), valor: t('tam-eur') },
    sam: { usuarios: t('sam-users'), valor: t('sam-eur'), pctDelTam: $('sam-pct')?.value },
    som: { usuarios: t('som-users'), valor: t('som-eur'), pctDelSam: $('som-pct')?.value },
  };
}

function leerRequerimientos() {
  // El DOM manda: recoge lo editado por el consultor
  document.querySelectorAll('.dv-g').forEach((g) => {
    const grupo = reqs.find((x) => x.id === g.dataset.g);
    if (!grupo) return;
    grupo.items = [...g.querySelectorAll('.dv-li')].map((li) => {
      const prev = grupo.items.find((i) => i.id === li.dataset.id) || {};
      const texto = li.querySelector('.tx').textContent.trim();
      return { id: li.dataset.id, texto, origen: prev.texto === texto ? prev.origen : (prev.origen === 'agente' ? 'agente-editado' : (prev.origen || 'consultor')) };
    }).filter((i) => i.texto);
  });
  return reqs;
}

function paquete() {
  const r = leerRequerimientos();
  const seg = ctx.segmentos[0];
  return {
    tipo: 'paquete-requerimientos-negocio',
    version: '1.0',
    generado: new Date().toISOString(),
    herramienta: 'Open Business Accelerator · Discovery',
    caso: { nombre: ctx.caso, categoria: ctx.categoria, descripcion: ctx.descripcion || '' },
    audiencia: { segmentoPrioritario: seg, segmentos: ctx.segmentos },
    mercado: mercado(),
    requerimientos: r,
    viabilidad: {
      semaforo: via.semaforo, titular: via.titular, lectura: via.lectura, esfuerzo: via.esfuerzo,
      resumen: via.resumen, condiciones: via.condiciones, capacidadesFaltantes: via.capacidadesFaltantes,
      cruzadoCon: { inventarioApis: (window.OBA_INVENTORY || []).length, setUpEntidad: ent?.nombre || null },
      apis: via.items.map(({ endpoint, rol, estado, apiNombre, backend, razon, alerta }) => ({ endpoint, rol, estado, apiBase: apiNombre, backend, razon, condicion: alerta })),
    },
    politicasAplicables: politicasAplicables(via.items),
    demoRelacionada: demoDe(ctx.caso)?.slug || null,
    _simulado: true,
  };
}

function aMarkdown(p) {
  const L = [];
  const fecha = new Date(p.generado).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  L.push(`# Requerimientos de negocio · ${p.caso.nombre}`, '');
  L.push(`> Paquete generado en el Discovery de Open Business Accelerator (MBC) el ${fecha}. Datos de mercado y audiencias **simulados** con fines de demostración.`, '');
  L.push('## 1. Caso de uso', '', `- **Nombre:** ${p.caso.nombre}`, `- **Categoría:** ${p.caso.categoria}`);
  if (p.caso.descripcion) L.push(`- **Descripción:** ${p.caso.descripcion}`);
  L.push('', '## 2. Audiencia', '', '| # | Segmento | Propensión | Usuarios estimados | Variables de decisión |', '|---|---|---|---|---|');
  p.audiencia.segmentos.forEach((s, i) => L.push(`| ${i + 1} | ${s.nombre} | ${s.propension} % | ${Number(s.usuarios).toLocaleString('es-ES')} | ${s.variables.join(', ')} |`));
  L.push('', '## 3. Mercado', '', `- **TAM:** ${p.mercado.tam.usuarios} · ${p.mercado.tam.valor}`, `- **SAM (${p.mercado.sam.pctDelTam} % del TAM):** ${p.mercado.sam.usuarios} · ${p.mercado.sam.valor}`, `- **SOM (${p.mercado.som.pctDelSam} % del SAM):** ${p.mercado.som.usuarios} · ${p.mercado.som.valor}`);
  L.push('', '## 4. Requerimientos del producto', '');
  p.requerimientos.forEach((g) => {
    L.push(`### ${g.titulo}`, '');
    g.items.forEach((it, i) => L.push(`${i + 1}. ${it.texto}`));
    L.push('');
  });
  const v = p.viabilidad;
  L.push('## 5. Viabilidad temprana', '', `**${v.titular}** (semáforo ${v.semaforo}, esfuerzo ${v.esfuerzo.toLowerCase()}).`, '', v.lectura, '');
  L.push(`Cruzado con el inventario de APIs de la entidad (${v.cruzadoCon.inventarioApis} APIs)${v.cruzadoCon.setUpEntidad ? ` y con el set up de ${v.cruzadoCon.setUpEntidad}` : ''}.`, '');
  L.push('| API | Rol | Estado | Se apoya en | Motivo |', '|---|---|---|---|---|');
  v.apis.forEach((a) => L.push(`| \`${a.endpoint}\` | ${a.rol} | ${ESTADO_INFO[a.estado].etiqueta} | ${a.apiBase || a.backend || '—'} | ${a.razon}${a.condicion ? ` Condición: ${a.condicion}` : ''} |`));
  L.push('', '## 6. Políticas de gobierno aplicables', '', p.politicasAplicables.map((x) => `\`${x}\``).join(' · '), '');
  L.push('## 7. Siguientes pasos', '', '1. Validar este paquete con negocio y cumplimiento.', '2. Trasladarlo al equipo técnico: el API Designer lo carga como punto de partida (estudio guardado).', '3. Resolver las condiciones previas y, si las hay, las capacidades faltantes antes de comprometer fechas.');
  if (p.demoRelacionada) L.push('', `Caso probado relacionado: demo \`${p.demoRelacionada}\` en la biblioteca de demos.`);
  return L.join('\n') + '\n';
}

function descargar(nombre, contenido, tipo) {
  const blob = new Blob([contenido], { type: tipo + ';charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

// Inventario cruzado con este caso (F19): mismo caso, misma clasificación, vista por API
function enlaceInventario() {
  const q = new URLSearchParams({ dcaso: ctx.caso, req: ctx.apis.req.join(';'), comp: ctx.apis.comp.join(';') });
  return `../../2-api-design/api-inventory.html?${q.toString()}`;
}

// ── Render ──
function renderViabilidad() {
  const filas = via.items.map((i) => `
    <tr>
      <td><code>${esc(i.endpoint)}</code><div class="dv-rol">${i.rol === 'requerida' ? 'Requerida' : 'Complementaria'}</div></td>
      <td><span class="dv-tag ${i.estado}" title="${esc(ESTADO_INFO[i.estado].corto)}">${ESTADO_INFO[i.estado].etiqueta}</span></td>
      <td class="col-base"><div class="dv-base">${esc(i.apiNombre || '—')}<small>${esc(i.backend || '')}</small></div></td>
      <td>${esc(i.razon)}${i.alerta ? `<div class="dv-alert">${svg(I.warn, 12)}<span>${esc(i.alerta)}</span></div>` : ''}</td>
    </tr>`).join('');
  const c = via.resumen;
  return `
    <div class="dv-card" id="dvVia">
      <div class="dv-card-h"><div class="dv-card-t"><span class="n">A</span>Viabilidad temprana</div><span class="chip-metodo">Método MBC · cruce con el inventario${ent ? ' y el set up' : ''}</span></div>
      <div class="dv-card-b">
        <div class="dv-verdict">
          <div>
            <span class="dv-sem ${via.semaforo}">${via.semaforo === 'verde' ? 'Viable' : via.semaforo === 'ambar' ? 'Viable con desarrollo' : 'Requiere capacidad nueva'}</span>
            <div class="dv-tit">${esc(via.titular)}</div>
            <div class="dv-lec">${esc(via.lectura)}</div>
          </div>
          <div class="dv-count">
            <div class="dv-c"><b>${c.reutilizable}</b><span>Reutilizables</span></div>
            <div class="dv-c"><b>${c.extender}</b><span>A extender</span></div>
            <div class="dv-c"><b>${c.nueva}</b><span>Nuevas</span></div>
            <div class="dv-c"><b>${c.sinCapacidad}</b><span>Sin capacidad</span></div>
            <div class="dv-c esf"><b>${via.esfuerzo}</b><span>Esfuerzo</span></div>
          </div>
        </div>
        <table class="dv-t"><thead><tr><th>API que pide el caso</th><th>Estado</th><th class="col-base">Se apoya en</th><th>Motivo</th></tr></thead><tbody>${filas}</tbody></table>
      </div>
      <div class="dv-foot">
        <span>Cruzado con el inventario de APIs de la entidad (${(window.OBA_INVENTORY || []).length} APIs)${ent ? ` y con el set up de <b>${esc(ent.nombre || 'la entidad')}</b>${via.dependenciasBloqueantes ? ` · ${via.dependenciasBloqueantes} dependencia(s) bloqueante(s) en su grafo` : ''}` : ' · sin set up de entidad cargado: complétalo en el Assessment para afinar el cruce'}.</span>
        <a href="${enlaceInventario()}">Ver el caso cruzado en el inventario</a>
      </div>
    </div>`;
}

function renderRequerimientos(r) {
  const grupos = r.grupos.map((g) => `
    <div class="dv-g" data-g="${g.id}">
      <h4>${esc(g.titulo)} <span>${g.items.length}</span></h4>
      <div class="dv-list">${g.items.map(liHTML).join('')}</div>
      <button class="dv-add" data-add="${g.id}">${svg(I.plus, 12)}Añadir requisito</button>
    </div>`).join('');
  return `
    <div class="dv-card" id="dvReq">
      <div class="dv-card-h"><div class="dv-card-t"><span class="n">B</span>Requerimientos del producto</div><span class="chip-hibrido">Híbrido · el agente propone, el consultor decide</span></div>
      <div class="dv-card-b">
        <div class="dv-banner">${svg('<path d="M12 3a4 4 0 0 0-4 4v1a4 4 0 0 0-2 7.5A3.5 3.5 0 0 0 9.5 21H12V3z"/><path d="M12 3a4 4 0 0 1 4 4v1a4 4 0 0 1 2 7.5 3.5 3.5 0 0 1-3.5 5.5H12"/>', 16)}<span>Borrador preparado por el agente sobre la plantilla MBC de <b>${esc(ctx.categoria.toLowerCase())}</b> y la audiencia prioritaria. Haz clic en cualquier requisito para editarlo${r._mock ? ' · datos simulados' : ''}.</span></div>
        <div class="dv-grupos">${grupos}</div>
      </div>
    </div>`;
}
const liHTML = (it) => `<div class="dv-li" data-id="${esc(it.id)}"><div class="tx" contenteditable="true" spellcheck="true">${esc(it.texto)}</div>${it.origen === 'agente' ? '<span class="ag" title="Propuesto por el agente a partir del caso y la audiencia">Agente</span>' : ''}<button title="Quitar">${svg(I.x, 12)}</button></div>`;

function renderPaquete() {
  const d = demoDe(ctx.caso);
  const nReq = reqs.reduce((a, g) => a + g.items.length, 0);
  return `
    ${d ? `<div class="dv-demo"><div><b>Caso probado: hay una demo de este caso en la biblioteca</b><span>${esc(d.titulo)}${d.acceso === 'protegida' ? ' · acceso con contraseña' : ''}</span></div><a class="dv-btn sec" href="../../../demos/${esc(d.ruta)}" target="_blank" rel="noopener">${svg(I.play)}Abrir demo</a></div>` : ''}
    <div class="dv-card" id="dvPaq">
      <div class="dv-card-h"><div class="dv-card-t"><span class="n">C</span>Paquete de requerimientos de negocio</div><span class="chip-metodo">Método MBC · traspaso al equipo técnico</span></div>
      <div class="dv-card-b">
        <div class="dv-inc">
          <div><b>Caso y audiencia</b>${esc(ctx.caso)} · ${esc(ctx.segmentos[0]?.nombre || '')} como segmento prioritario</div>
          <div><b>Mercado</b>TAM, SAM y SOM con sus supuestos</div>
          <div><b id="dvNReq">${nReq} requisitos</b>Funcionales, datos, no funcionales y regulatorios</div>
          <div><b>Viabilidad y gobierno</b>${via.items.length} APIs clasificadas · ${politicasAplicables(via.items).length} políticas GOV aplicables</div>
        </div>
        <div class="dv-acts">
          <button class="dv-btn pri" id="dvGuardar">${svg(I.save)}Guardar como estudio y continuar en el API Designer</button>
          <button class="dv-btn sec" id="dvMd">${svg(I.down)}Descargar Markdown</button>
          <button class="dv-btn sec" id="dvJson">${svg(I.down)}Descargar JSON</button>
          <span class="dv-msg" id="dvMsg"></span>
        </div>
      </div>
    </div>`;
}

function enlazarRequerimientos() {
  const cont = $('dvReq');
  cont.addEventListener('click', (e) => {
    const del = e.target.closest('.dv-li button');
    if (del) { del.closest('.dv-li').remove(); actualizarConteos(); return; }
    const add = e.target.closest('[data-add]');
    if (add) {
      const list = add.previousElementSibling;
      const id = 'rqc' + Date.now().toString(36);
      list.insertAdjacentHTML('beforeend', liHTML({ id, texto: '', origen: 'consultor' }));
      const g = reqs.find((x) => x.id === add.dataset.add); g.items.push({ id, texto: '', origen: 'consultor' });
      list.lastElementChild.querySelector('.tx').focus();
      actualizarConteos();
    }
  });
  cont.addEventListener('input', () => actualizarConteos());
}
function actualizarConteos() {
  document.querySelectorAll('.dv-g').forEach((g) => { g.querySelector('h4 span').textContent = g.querySelectorAll('.dv-li').length; });
  const n = document.querySelectorAll('.dv-li').length;
  if ($('dvNReq')) $('dvNReq').textContent = `${n} requisitos`;
}

function enlazarPaquete() {
  const base = `requerimientos-${slug(ctx.caso)}`;
  $('dvMd').onclick = () => { descargar(base + '.md', aMarkdown(paquete()), 'text/markdown'); flash('Markdown descargado'); };
  $('dvJson').onclick = () => { descargar(base + '.json', JSON.stringify(paquete(), null, 2), 'application/json'); flash('JSON descargado'); };
  $('dvGuardar').onclick = async () => {
    const p = paquete();
    const seg = p.audiencia.segmentoPrioritario;
    const func = (p.requerimientos.find((g) => g.id === 'func')?.items || []).map((i) => `- ${i.texto}`).join('\n');
    const descripcion = [
      p.caso.descripcion || `Caso de uso "${p.caso.nombre}" (${p.caso.categoria}) priorizado en el Discovery.`,
      `Viabilidad: ${p.viabilidad.titular}. ${p.viabilidad.lectura}`,
      `Requisitos funcionales:\n${func}`,
    ].join('\n\n');
    try {
      const est = await Storage.saveEstudio({ nombre: p.caso.nombre, segmento: seg ? `${seg.nombre} · propensión ${seg.propension}\u00a0%` : '', descripcion, paquete: p });
      flash('Estudio guardado · abriendo el API Designer…');
      setTimeout(() => { location.href = `../../2-api-design/api-designer.html?estudio=${encodeURIComponent(est.id)}`; }, 700);
    } catch (e) { flash('No se pudo guardar: descarga el paquete y cárgalo después', true); }
  };
}
function flash(t, err) { const m = $('dvMsg'); if (!m) return; m.textContent = t; m.style.color = err ? 'var(--bad)' : ''; setTimeout(() => { if (m.textContent === t) m.textContent = ''; }, 3500); }

async function onResultados(ev) {
  ctx = ev.detail;
  ctx.descripcion = ctx.descripcion || document.getElementById('custom-desc')?.value?.trim() || '';
  const screen = $('results-screen');
  if (!screen) return;

  // Resultados existentes: chips de agente sobre propensión y mercado; el bloque antiguo de APIs lo sustituye la viabilidad
  screen.querySelectorAll('.results-card h3').forEach((h) => {
    if (!h.querySelector('.chip-agente')) h.insertAdjacentHTML('beforeend', ' <span class="chip-agente" style="margin-left:8px;vertical-align:2px">Agente · datos simulados</span>');
  });
  const viejo = screen.querySelector('.api-reco-block'); if (viejo) viejo.style.display = 'none';
  // El acceso directo antiguo al Designer pasa a secundario: la vía principal es guardar el paquete
  const cta = $('cta-design'); if (cta) { cta.className = 'btn-outline'; cta.textContent = 'Ir al API Designer sin guardar'; }

  let sec = $('dvSec');
  if (!sec) {
    sec = document.createElement('section');
    sec.className = 'dv'; sec.id = 'dvSec';
    const row = [...screen.querySelectorAll('.btn-row')].pop();
    screen.insertBefore(sec, row || null);
    new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting && typeof window.setStep === 'function') window.setStep(5); }), { threshold: 0.15 }).observe(sec);
  }
  sec.innerHTML = `
    <div class="dv-head"><div>
      <div class="dv-kicker">Paso 5 · Viabilidad y requerimientos</div>
      <div class="dv-h">¿Es viable con lo que la entidad ya tiene?</div>
      <div class="dv-lead">Antes de comprometer el caso: qué APIs se reutilizan, cuáles se extienden y qué falta; los requerimientos del producto para esta audiencia; y el paquete que pasa al equipo técnico.</div>
    </div></div>
    <div id="dvViaHost"><div class="dv-load">Cruzando el caso con el inventario y el set up de la entidad…</div></div>
    <div id="dvReqHost"><div class="dv-load">El agente está preparando el borrador de requerimientos…</div></div>
    <div id="dvPaqHost"></div>`;

  const endpoints = [...ctx.apis.req.map((e) => ({ endpoint: e, rol: 'requerida' })), ...ctx.apis.comp.map((e) => ({ endpoint: e, rol: 'complementaria' }))];
  ent = await entidadActiva();
  via = clasificarCaso(endpoints, { inventario: window.OBA_INVENTORY || [], entidad: ent });
  $('dvViaHost').innerHTML = renderViabilidad();

  const seg = ctx.segmentos[0];
  const r = await Agents.requerimientosProducto({ nombre: ctx.caso, categoria: ctx.categoria }, { segmentoPrioritario: seg, segmentos: ctx.segmentos });
  reqs = r.grupos.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i })) }));
  $('dvReqHost').innerHTML = renderRequerimientos(r);
  enlazarRequerimientos();

  await cargarCatalogoDemos();
  $('dvPaqHost').innerHTML = renderPaquete();
  enlazarPaquete();
}

// ── Arranque ──
function cargarInventario() {
  if (window.OBA_INVENTORY) return Promise.resolve();
  return new Promise((res) => { const s = document.createElement('script'); s.src = '../../../assets/inventory-data.js'; s.onload = res; s.onerror = res; document.head.appendChild(s); });
}
document.addEventListener('discovery:resultados', async (ev) => { await cargarInventario(); onResultados(ev); });
marcarPasos();
marcarCatalogo();
