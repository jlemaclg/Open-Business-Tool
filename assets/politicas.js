// assets/politicas.js — Gobierno transversal (F21 · D16)
// ─────────────────────────────────────────────────────────────────────────────
// 1) Catálogo de reglas del espacio de Políticas de Gobierno (GOV-* para APIs,
//    AGT-* para agentes) con su título corto.
// 2) Qué reglas aplica cada módulo del recorrido (OBA_POLICY_MAP).
// 3) Franja "Gobierno en este módulo" bajo la barra de navegación: cada regla
//    enlaza a stages/2-api-design/governance-policies.html#<ID>, que abre la
//    página de la regla y la resalta.
// La carga assets/nav.js (no hace falta tocar el HTML de los módulos). Script
// clásico: funciona también abriendo los ficheros en local (file://).
// ─────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  var P = window.OBA_POLICIES = {
    // Fundamentos
    'GOV-ENC-01': { t: 'Codificación UTF-8', a: 'api' },
    'GOV-DAT-01': { t: 'Fechas y horas ISO 8601 en UTC', a: 'api' },
    'GOV-ISO-01': { t: 'Diccionario de datos ISO 20022', a: 'api' },
    'GOV-DOC-01': { t: 'Documentación publicada', a: 'api' },
    // Contratos
    'GOV-NAM-01': { t: 'Naming de recursos', a: 'api' },
    'GOV-NAM-02': { t: 'Rutas y sub-recursos', a: 'api' },
    'GOV-NAM-03': { t: 'Verbos y parámetros', a: 'api' },
    'GOV-VER-01': { t: 'Versionado semántico', a: 'api' },
    'GOV-VER-02': { t: 'Política de deprecación', a: 'api' },
    'GOV-HDR-01': { t: 'Headers FAPI de petición', a: 'api' },
    'GOV-HDR-02': { t: 'Headers de respuesta y trazabilidad', a: 'api' },
    'GOV-STA-01': { t: 'Códigos de estado HTTP homogéneos', a: 'api' },
    'GOV-ERR-01': { t: 'Cuerpo de error unificado', a: 'api' },
    'GOV-ERR-02': { t: 'Buenas prácticas de errores', a: 'api' },
    // Operación
    'GOV-IDM-01': { t: 'Idempotencia', a: 'api' },
    'GOV-PAG-01': { t: 'Paginación', a: 'api' },
    'GOV-SEC-01': { t: 'Capas de seguridad FAPI 2.0', a: 'api' },
    'GOV-SEC-02': { t: 'Pruebas y monitoreo de seguridad', a: 'api' },
    // Agentes IA
    'AGT-SRC-01': { t: 'Fuentes de conocimiento', a: 'agente' },
    'AGT-CIT-01': { t: 'Citación obligatoria', a: 'agente' },
    'AGT-INV-01': { t: 'Prohibido inventar', a: 'agente' },
    'AGT-HIL-01': { t: 'Human-in-the-loop', a: 'agente' },
    'AGT-AUD-01': { t: 'Auditoría', a: 'agente' },
    'AGT-DAT-01': { t: 'Datos', a: 'agente' },
    'AGT-GOV-01': { t: 'Gobierno del cambio', a: 'agente' },
  };

  // Módulo (data-current de nav.js) → reglas que aplica y en qué momento
  var M = window.OBA_POLICY_MAP = {
    'assessment':   { nombre: 'Assessment', donde: 'set up de la entidad y cálculo del delta de cada caso',
                      reglas: ['AGT-DAT-01', 'AGT-SRC-01', 'AGT-HIL-01', 'AGT-AUD-01'] },
    'discovery':    { nombre: 'Discovery', donde: 'audiencias, requerimientos del producto y viabilidad temprana',
                      reglas: ['AGT-DAT-01', 'AGT-HIL-01', 'GOV-VER-01', 'GOV-ISO-01', 'GOV-SEC-01'] },
    'inventory':    { nombre: 'Inventario', donde: 'ficha de gobierno, ciclo de vida y cruce con el caso',
                      reglas: ['GOV-VER-01', 'GOV-VER-02', 'GOV-DOC-01', 'GOV-NAM-01'] },
    'api-designer': { nombre: 'API Designer', donde: 'diseño de paths, diccionario de datos y OpenAPI',
                      reglas: ['GOV-NAM-01', 'GOV-NAM-02', 'GOV-NAM-03', 'GOV-ISO-01', 'GOV-ERR-01', 'GOV-HDR-01', 'GOV-ENC-01', 'GOV-DAT-01', 'AGT-INV-01', 'AGT-CIT-01', 'AGT-HIL-01'] },
    'enrichment':   { nombre: 'Gestión y Versionado', donde: 'enriquecimiento ISO 20022, mejora de la especificación y ciclo de vida',
                      reglas: ['GOV-ISO-01', 'GOV-ERR-01', 'GOV-ERR-02', 'GOV-IDM-01', 'GOV-PAG-01', 'GOV-SEC-01', 'GOV-VER-01', 'GOV-VER-02', 'AGT-INV-01', 'AGT-CIT-01'] },
    'api-lab':      { nombre: 'API Lab', donde: 'despliegue en sandbox, pruebas con partners y refinamiento',
                      reglas: ['GOV-SEC-01', 'GOV-SEC-02', 'GOV-STA-01', 'GOV-HDR-02', 'AGT-HIL-01', 'AGT-AUD-01'] },
    'agentes':      { nombre: 'Repositorio de agentes', donde: 'cada agente declara los guardrails que cumple',
                      reglas: ['AGT-SRC-01', 'AGT-CIT-01', 'AGT-INV-01', 'AGT-HIL-01', 'AGT-AUD-01', 'AGT-DAT-01', 'AGT-GOV-01'] },
  };

  /** Módulos donde se aplica una regla (para el índice del espacio de Gobierno). */
  window.OBA_policyModules = function (id) {
    return Object.keys(M).filter(function (k) { return M[k].reglas.indexOf(id) >= 0; }).map(function (k) { return { id: k, nombre: M[k].nombre }; });
  };

  // ── Franja "Gobierno en este módulo" ──
  var script = document.currentScript;
  var current = script && script.getAttribute('data-current');
  var root = script ? new URL('..', script.src).href : '../';
  if (!current || !M[current]) return;

  var css = ''
    + '.obx-gov{display:flex;align-items:center;gap:10px;flex-wrap:nowrap;background:var(--mbc-electric-soft,#E7F1FF);border-bottom:1px solid rgba(20,122,255,.25);'
    + 'padding:7px 18px;font-family:var(--sans,Montserrat,Arial,sans-serif);min-width:1280px;width:100%;box-sizing:border-box;flex-shrink:0;position:relative;z-index:2999;overflow:hidden;}'
    + '.obx-gov .lbl{display:flex;align-items:center;gap:6px;font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--mbc-navy,#003478);white-space:nowrap;flex:0 0 auto;}'
    + '.obx-gov .lbl svg{color:var(--mbc-electric,#147AFF);}'
    + '.obx-gov .donde{font-size:11px;color:var(--text-dim,#555);white-space:nowrap;flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;max-width:230px;}'
    + '.obx-gov .rules{display:flex;gap:6px;flex:1;min-width:0;overflow:hidden;}'
    + '.obx-gov a.r{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:600;color:var(--text,#101B33);background:#fff;border:1px solid rgba(20,122,255,.3);'
    + 'border-radius:20px;padding:2px 9px 2px 3px;white-space:nowrap;text-decoration:none;flex:0 0 auto;}'
    + '.obx-gov a.r code{font-family:var(--mono,Consolas,monospace);font-size:10px;font-weight:700;color:#fff;background:var(--mbc-navy,#003478);border-radius:20px;padding:1px 6px;}'
    + '.obx-gov a.r.ag code{background:var(--mbc-electric,#147AFF);}'
    + '.obx-gov a.r:hover{border-color:var(--mbc-navy,#003478);}'
    + '.obx-gov .mas{font-size:11px;font-weight:700;color:var(--mbc-navy,#003478);white-space:nowrap;flex:0 0 auto;text-decoration:underline;text-decoration-color:rgba(20,122,255,.5);text-underline-offset:2px;}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var gp = root + 'stages/2-api-design/governance-policies.html';
  var mod = M[current];
  var chips = mod.reglas.map(function (id) {
    var p = P[id] || { t: '', a: 'api' };
    return '<a class="r' + (p.a === 'agente' ? ' ag' : '') + '" href="' + gp + '#' + id + '" title="' + id + ' · ' + p.t + '"><code>' + id + '</code>' + p.t + '</a>';
  }).join('');
  var bar = document.createElement('div');
  bar.className = 'obx-gov';
  bar.setAttribute('role', 'note');
  bar.setAttribute('aria-label', 'Políticas de gobierno aplicadas en este módulo');
  bar.innerHTML = '<span class="lbl" title="' + mod.nombre + ': ' + mod.donde + '"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6L12 3z"/><path d="m9 12 2 2 4-4"/></svg>Gobierno aplicado</span>'
    + '<span class="rules">' + chips + '</span>'
    + '<a class="mas" href="' + gp + '#indice">Dónde se aplica cada regla</a>';

  function colocar() {
    var nav = document.querySelector('nav.obx-nav');
    if (nav) nav.after(bar); else document.body.insertBefore(bar, document.body.firstChild);
    // Si no caben todas las reglas, se ocultan las que desbordan y se indica cuántas (todas siguen en el índice)
    var cont = bar.querySelector('.rules');
    var limite = cont.getBoundingClientRect().right + 1;
    var fuera = Array.prototype.slice.call(cont.children).filter(function (c) { return c.getBoundingClientRect().right > limite; });
    if (fuera.length) {
      var m = document.createElement('a');
      m.className = 'mas'; m.href = gp + '#indice'; m.textContent = '+' + fuera.length + ' más';
      cont.after(m);
      // el enlace "+n" resta sitio: se vuelve a medir
      limite = cont.getBoundingClientRect().right + 1;
      var n = 0;
      var cortar = false; // en cuanto una no cabe, se ocultan todas las siguientes (se respeta el orden)
      Array.prototype.slice.call(cont.children).forEach(function (c) { if (cortar || c.getBoundingClientRect().right > limite) { cortar = true; c.style.display = 'none'; n++; } });
      m.textContent = '+' + n + ' más';
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', colocar); else colocar();
})();
