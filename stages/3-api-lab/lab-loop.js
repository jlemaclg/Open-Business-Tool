// lab-loop.js — El bucle de refinamiento del API Lab (F9)
// ─────────────────────────────────────────────────────────────────────────────
// La pieza que cierra el recorrido: las APIs diseñadas para un caso de uso se
// prueban en el sandbox (labResults) y el agente propone refinamientos — la API
// pasa de "diseñada" a "refinada" en el caso, y ese resultado alimenta la
// actualización del roadmap y la inversión en el Assessment (pestaña 13).
//
// Módulo aditivo (patrón designer-context): se inyecta al final de la página
// del Lab. Si no carga (file://), el Lab original queda intacto.
// ─────────────────────────────────────────────────────────────────────────────

import { Storage } from '../../core/storage.js';
import { Agents } from '../../core/agents.js';
import { EstadoAPI, Naturaleza } from '../../core/domain/casoDeUso.js';

const css = document.createElement('style');
css.textContent = `
  .ll-wrap{max-width:1200px;margin:26px auto 60px;padding:0 40px;font-family:Arial,sans-serif;}
  .ll-card{background:#fff;border-radius:6px;box-shadow:0 2px 12px rgba(0,0,0,.08);overflow:hidden;}
  .ll-head{background:#260717;color:#fff;padding:16px 22px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;}
  .ll-title{font-family:Georgia,serif;font-size:18px;} .ll-title span{color:#FF0054;}
  .ll-sub{font-size:11px;color:rgba(255,255,255,.55);letter-spacing:1px;text-transform:uppercase;}
  .ll-body{padding:20px 22px;}
  .ll-row{display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;margin-bottom:14px;}
  .ll-fg{display:flex;flex-direction:column;gap:4px;min-width:220px;}
  .ll-fg label{font-size:10px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#4F062A;}
  .ll-fg select{padding:8px 10px;border:1px solid #c9c6bb;border-radius:3px;font-size:12.5px;background:#fff;}
  .ll-btn{background:#4F062A;color:#fff;border:none;padding:10px 18px;border-radius:3px;font-size:12.5px;cursor:pointer;letter-spacing:.4px;}
  .ll-btn:hover{background:#FF0054;} .ll-btn:disabled{background:#999;cursor:default;}
  .ll-btn-sec{background:#fff;color:#4F062A;border:1px solid #4F062A;padding:9px 16px;border-radius:3px;font-size:12px;cursor:pointer;}
  .ll-btn-sec:hover{border-color:#FF0054;color:#FF0054;}
  .ll-metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:14px 0;}
  .ll-m{background:#f7f6f2;border:1px solid #e6e3d8;border-radius:5px;padding:12px 14px;text-align:center;}
  .ll-m b{font-family:Georgia,serif;font-size:20px;color:#260717;display:block;}
  .ll-m small{font-size:9.5px;letter-spacing:1.2px;text-transform:uppercase;color:#999;}
  .ll-m.bad b{color:#c62828;}
  table.ll-t{width:100%;border-collapse:collapse;font-size:11.5px;margin:8px 0 4px;}
  .ll-t th{text-align:left;color:#4F062A;border-bottom:2px solid #4F062A;padding:5px 8px;font-size:10px;letter-spacing:.6px;text-transform:uppercase;}
  .ll-t td{padding:6px 8px;border-bottom:1px solid #efede6;}
  .ll-estado{display:inline-block;font-size:10px;padding:2px 9px;border-radius:12px;letter-spacing:.4px;}
  .ll-e-dis{background:rgba(181,137,0,.12);color:#b58900;border:1px solid rgba(181,137,0,.35);}
  .ll-e-ref{background:rgba(26,127,55,.12);color:#1a7f37;border:1px solid rgba(26,127,55,.35);}
  .ll-mock{background:rgba(255,0,84,.08);border:1px solid rgba(255,0,84,.3);color:#FF0054;font-size:10px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;padding:3px 9px;border-radius:2px;}
  .ll-empty{font-size:12.5px;color:#777;font-style:italic;padding:10px 0;}
  .ll-loop{margin-top:12px;background:rgba(79,6,42,.05);border-left:3px solid #FF0054;padding:11px 15px;font-size:12px;line-height:1.6;}
  .ll-loop b{color:#4F062A;} .ll-loop a{color:#FF0054;font-weight:bold;text-decoration:none;}
  .ll-spin{font-size:12px;color:#FF0054;font-style:italic;padding:8px 0;}
`;
document.head.appendChild(css);

const wrap = document.createElement('div');
wrap.className = 'll-wrap';
wrap.innerHTML = `
  <div class="ll-card">
    <div class="ll-head">
      <div>
        <div class="ll-title">Validación de casos de uso — <span>el bucle de refinamiento</span></div>
        <div class="ll-sub">Sandbox · resultados reales → el agente refina el diseño → el assessment actualiza roadmap e inversión</div>
      </div>
      <span class="ll-mock">Datos simulados</span>
    </div>
    <div class="ll-body">
      <div class="ll-row">
        <div class="ll-fg"><label>Entidad</label><select id="llEnt"></select></div>
        <div class="ll-fg"><label>Caso de uso</label><select id="llCaso"></select></div>
        <div class="ll-fg"><label>API a probar</label><select id="llApi"></select></div>
        <button class="ll-btn" id="llSimular">Simular pruebas en sandbox</button>
      </div>
      <div id="llResultado"><div class="ll-empty">Selecciona una API diseñada para el caso (creada desde el API Designer con "Guardar diseño en el caso") y simula su comportamiento con partners y comercios del sandbox.</div></div>
    </div>
  </div>`;
document.body.insertBefore(wrap, document.querySelector('script[src*="nav.js"]') || null);

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
let ultimoLab = null;

async function cargarEntidades() {
  const ents = await Storage.listEntidades();
  $('llEnt').innerHTML = ents.length
    ? ents.map((e) => `<option value="${e.id}">${esc(e.nombre)}</option>`).join('')
    : '<option value="">— guarda una entidad en el Assessment —</option>';
  await cargarCasos();
}
async function cargarCasos() {
  const entId = $('llEnt').value;
  const casos = entId ? await Storage.listCasos(entId) : [];
  $('llCaso').innerHTML = casos.length
    ? casos.map((c) => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('')
    : '<option value="">— sin casos de uso —</option>';
  await cargarApis();
}
async function cargarApis() {
  const casoId = $('llCaso').value;
  const caso = casoId ? await Storage.loadCaso(casoId) : null;
  const apis = caso?.ecosistema?.apis || [];
  $('llApi').innerHTML = apis.length
    ? apis.map((a) => `<option value="${esc(a.nombre)}">${esc(a.nombre)} (${a.estado})</option>`).join('')
    : '<option value="">— el caso no tiene APIs diseñadas —</option>';
}
$('llEnt').onchange = cargarCasos;
$('llCaso').onchange = cargarApis;

$('llSimular').onclick = async () => {
  const casoId = $('llCaso').value, apiNombre = $('llApi').value;
  if (!casoId || !apiNombre) return;
  const caso = await Storage.loadCaso(casoId);
  $('llResultado').innerHTML = '<div class="ll-spin">Desplegando en sandbox y ejecutando tráfico de partners y comercios…</div>';
  await new Promise((r) => setTimeout(r, 900));
  // Resultados de sandbox (mock realista; la tasa de error >2% dispara refinamiento extra)
  const esCompleto = caso.naturaleza === Naturaleza.CASO_COMPLETO;
  ultimoLab = {
    sandbox: 'Sandbox as a Service · OBA',
    api: apiNombre,
    comerciosReales: esCompleto ? 4 : 7,
    partners: esCompleto ? 2 : 3,
    metricas: { llamadas: esCompleto ? 18420 : 31240, latenciaP95ms: esCompleto ? 412 : 238, tasaError: esCompleto ? 0.034 : 0.012, consentimientosOk: 0.97 },
    refinamientos: [],
  };
  const m = ultimoLab.metricas;
  $('llResultado').innerHTML = `
    <div class="ll-metrics">
      <div class="ll-m"><small>Llamadas</small><b>${m.llamadas.toLocaleString('es')}</b></div>
      <div class="ll-m"><small>Partners</small><b>${ultimoLab.partners}</b></div>
      <div class="ll-m"><small>Comercios reales</small><b>${ultimoLab.comerciosReales}</b></div>
      <div class="ll-m ${m.latenciaP95ms > 300 ? 'bad' : ''}"><small>Latencia p95</small><b>${m.latenciaP95ms} ms</b></div>
      <div class="ll-m ${m.tasaError > 0.02 ? 'bad' : ''}"><small>Tasa de error</small><b>${(m.tasaError * 100).toFixed(1)}%</b></div>
    </div>
    <button class="ll-btn" id="llRefinar">Refinar diseño con el agente</button>
    <div id="llRefino"></div>`;
  $('llRefinar').onclick = () => refinar(caso.id, apiNombre);
};

async function refinar(casoId, apiNombre) {
  const caso = await Storage.loadCaso(casoId);
  $('llRefino').innerHTML = '<div class="ll-spin">El agente está contrastando los resultados con el diseño y las políticas de gobierno…</div>';
  const labResults = [...(caso.labResults || []), ultimoLab];
  const r = await Agents.refinarAPI({ api: apiNombre }, labResults);
  // Persistir el bucle: resultados + estado de la API → refinada
  ultimoLab.refinamientos = r.refinamientos;
  caso.labResults = labResults;
  caso.ecosistema.apis = (caso.ecosistema.apis || []).map((a) =>
    a.nombre === apiNombre ? { ...a, estado: r.nuevoEstado || EstadoAPI.REFINADA } : a);
  await Storage.saveCaso(caso);
  await cargarApis();
  $('llRefino').innerHTML = `
    ${r._mock ? '<div style="margin-top:12px;"><span class="ll-mock">Datos simulados — agente mock</span></div>' : ''}
    <table class="ll-t"><thead><tr><th>Campo</th><th>Refinamiento propuesto</th><th>Motivo (observado en sandbox)</th></tr></thead><tbody>
      ${r.refinamientos.map((f) => `<tr><td style="font-family:Consolas,monospace;font-size:11px;">${esc(f.campo)}</td><td>${esc(f.cambio)}</td><td>${esc(f.motivo)}</td></tr>`).join('')}
    </tbody></table>
    <div style="margin-top:10px;">La API <b>${esc(apiNombre)}</b> pasa a <span class="ll-estado ll-e-ref">refinada</span> en el caso de uso.</div>
    <div class="ll-loop"><b>El bucle se cierra:</b> con el diseño refinado y los resultados del sandbox, vuelve al
      <a href="../1-discovery/assessment/index.html">Assessment</a> (pestaña 13) y re-analiza el caso —
      el roadmap y la inversión de la entidad se actualizan con lo aprendido en el Lab.</div>`;
}

cargarEntidades();
