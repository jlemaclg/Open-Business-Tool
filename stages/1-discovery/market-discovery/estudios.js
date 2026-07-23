// estudios.js — Estudios de Discovery guardados (F-Designer-entrada)
// ─────────────────────────────────────────────────────────────────────────────
// El estudio de discovery se guarda aquí, se edita/refina cuantas veces haga
// falta, y cuando está maduro se carga en el API Designer para continuar la
// conversación con el agente (api-designer.html?estudio=<id>).
// Módulo aditivo: si no carga (file://), la demo de discovery queda intacta.
// ─────────────────────────────────────────────────────────────────────────────

import { Storage } from '../../../core/storage.js';

const css = document.createElement('style');
css.textContent = `
  .es-wrap{max-width:1200px;margin:22px auto 30px;padding:0 40px;font-family:Arial,sans-serif;}
  .es-card{background:#fff;border-radius:6px;box-shadow:0 2px 12px rgba(0,0,0,.08);overflow:hidden;}
  .es-head{background:#260717;color:#fff;padding:13px 20px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;}
  .es-title{font-family:Georgia,serif;font-size:15.5px;} .es-title span{color:#FF0054;}
  .es-toggle{font-size:11px;color:rgba(255,255,255,.6);letter-spacing:1px;text-transform:uppercase;}
  .es-body{padding:18px 20px;display:none;}
  .es-card.open .es-body{display:grid;grid-template-columns:360px 1fr;gap:20px;align-items:start;}
  .es-fg{margin-bottom:10px;}
  .es-fg label{display:block;font-size:10px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#4F062A;margin-bottom:4px;}
  .es-fg input,.es-fg textarea{width:100%;padding:8px 10px;border:1px solid #c9c6bb;border-radius:3px;font-size:12.5px;font-family:Arial,sans-serif;}
  .es-fg textarea{min-height:110px;resize:vertical;}
  .es-btn{background:#4F062A;color:#fff;border:none;padding:9px 16px;border-radius:3px;font-size:12px;cursor:pointer;margin-right:6px;}
  .es-btn:hover{background:#FF0054;}
  .es-btn-sec{background:#fff;color:#4F062A;border:1px solid #4F062A;padding:8px 14px;border-radius:3px;font-size:11.5px;cursor:pointer;}
  .es-btn-sec:hover{border-color:#FF0054;color:#FF0054;}
  .es-item{border:1px solid #e6e3d8;border-radius:5px;padding:12px 14px;margin-bottom:10px;display:flex;justify-content:space-between;gap:12px;align-items:flex-start;}
  .es-item-t{font-family:Georgia,serif;font-size:14.5px;color:#260717;margin-bottom:3px;}
  .es-item-m{font-size:11px;color:#888;}
  .es-item-d{font-size:11.5px;color:#555;margin-top:5px;line-height:1.5;max-width:520px;}
  .es-acts{display:flex;flex-direction:column;gap:5px;align-items:flex-end;flex:0 0 auto;}
  .es-link{font-size:11px;color:#FF0054;font-weight:bold;cursor:pointer;background:none;border:none;text-decoration:none;}
  .es-link:hover{text-decoration:underline;}
  .es-del{font-size:10.5px;color:#b33;background:none;border:none;cursor:pointer;opacity:.7;}
  .es-del:hover{opacity:1;text-decoration:underline;}
  .es-empty{font-size:12px;color:#777;font-style:italic;padding:8px 0;}
  .es-msg{font-size:11px;color:#1a7f37;font-weight:bold;margin-left:8px;}
`;
document.head.appendChild(css);

const wrap = document.createElement('div');
wrap.className = 'es-wrap';
wrap.innerHTML = `
  <div class="es-card" id="esCard">
    <div class="es-head" id="esHead">
      <div class="es-title">Estudios de discovery <span>guardados</span> — refínalos aquí y continúa en el API Designer</div>
      <div class="es-toggle" id="esToggle">Abrir ▾</div>
    </div>
    <div class="es-body">
      <div>
        <div class="es-fg"><label>Nombre del estudio</label><input id="esNombre" placeholder="Ej: Remesas para trabajadores gig"></div>
        <div class="es-fg"><label>Segmento / audiencia</label><input id="esSegmento" placeholder="Ej: Trabajadores de plataformas, ticket medio USD 180"></div>
        <div class="es-fg"><label>Descripción refinada del caso de uso</label><textarea id="esDesc" placeholder="La descripción que le darás al agente del Designer: procesos, actores, restricciones, hallazgos del discovery (TAM/SAM/SOM, propensión)…"></textarea></div>
        <button class="es-btn" id="esGuardar">Guardar estudio</button>
        <button class="es-btn-sec" id="esCapturar" title="Rellena con el caso personalizado definido en esta página">Capturar de esta página</button>
        <span class="es-msg" id="esMsg"></span>
      </div>
      <div><div id="esLista"></div></div>
    </div>
  </div>`;
const anchor = document.querySelector('.main, #steps-bar, header');
(anchor?.parentNode || document.body).insertBefore(wrap, anchor?.nextSibling || null);

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
let editandoId = null;

$('esHead').onclick = () => {
  const c = $('esCard'); c.classList.toggle('open');
  $('esToggle').textContent = c.classList.contains('open') ? 'Cerrar ▴' : 'Abrir ▾';
};

async function renderLista() {
  const items = await Storage.listEstudios();
  if (!items.length) { $('esLista').innerHTML = '<div class="es-empty">Sin estudios guardados. Define el caso, captúralo y guárdalo — podrás refinarlo y llevarlo al Designer cuando esté maduro.</div>'; return; }
  const detalles = await Promise.all(items.map((i) => Storage.loadEstudio(i.id)));
  $('esLista').innerHTML = detalles.map((e) => `
    <div class="es-item">
      <div>
        <div class="es-item-t">${esc(e.nombre)}</div>
        <div class="es-item-m">${esc(e.segmento || '')} · actualizado ${e.actualizadoEn ? new Date(e.actualizadoEn).toLocaleString('es') : '—'}</div>
        <div class="es-item-d">${esc((e.descripcion || '').slice(0, 220))}${(e.descripcion || '').length > 220 ? '…' : ''}</div>
      </div>
      <div class="es-acts">
        <a class="es-link" href="../../2-api-design/api-designer.html?estudio=${e.id}">Continuar en API Designer →</a>
        <button class="es-link" data-edit="${e.id}" style="color:#4F062A;">editar</button>
        <button class="es-del" data-del="${e.id}">eliminar</button>
      </div>
    </div>`).join('');
  $('esLista').querySelectorAll('[data-edit]').forEach((b) => b.onclick = async () => {
    const e = await Storage.loadEstudio(b.dataset.edit);
    if (!e) return;
    editandoId = e.id; $('esNombre').value = e.nombre; $('esSegmento').value = e.segmento || ''; $('esDesc').value = e.descripcion || '';
    $('esMsg').textContent = 'editando "' + e.nombre + '"';
  });
  $('esLista').querySelectorAll('[data-del]').forEach((b) => b.onclick = async () => {
    if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = '¿seguro?'; setTimeout(() => { b.dataset.armed = ''; b.textContent = 'eliminar'; }, 3000); return; }
    await Storage.removeEstudio(b.dataset.del); renderLista();
  });
}

$('esGuardar').onclick = async () => {
  const nombre = $('esNombre').value.trim();
  if (!nombre) { $('esNombre').focus(); return; }
  await Storage.saveEstudio({ id: editandoId, nombre, segmento: $('esSegmento').value.trim(), descripcion: $('esDesc').value.trim() });
  editandoId = null; $('esNombre').value = ''; $('esSegmento').value = ''; $('esDesc').value = '';
  $('esMsg').textContent = '✓ guardado'; setTimeout(() => { const m = document.getElementById('esMsg'); if (m) m.textContent = ''; }, 2500);
  renderLista();
};

$('esCapturar').onclick = () => {
  // Toma lo definido en el formulario de caso personalizado de esta página, si existe
  const nombre = document.getElementById('custom-name')?.value || document.getElementById('uc-name-display')?.textContent || '';
  const desc = document.getElementById('custom-desc')?.value || '';
  if (nombre) $('esNombre').value = nombre;
  if (desc) $('esDesc').value = desc;
  $('esMsg').textContent = nombre || desc ? '✓ capturado — complétalo y guarda' : 'define primero el caso en la página';
  setTimeout(() => { const m = document.getElementById('esMsg'); if (m) m.textContent = ''; }, 3000);
};

renderLista();
