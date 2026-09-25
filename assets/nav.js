// assets/nav.js — Barra de navegación de la plataforma (Open Business Accelerator)
// ─────────────────────────────────────────────────────────────────────────────
// Uso: incluir al final del <body> de cada herramienta:
//   <script src="<ruta-relativa>/assets/nav.js" data-current="assessment"></script>
// Valores de data-current: assessment | discovery | inventory | api-designer | enrichment | api-lab | policies
//
// La barra se inyecta arriba del todo: muestra el recorrido 01→06, resalta el
// módulo actual y siempre ofrece la vuelta al portal. Las rutas se calculan
// desde la URL de este script, así funciona a cualquier profundidad sin config.
// ─────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';
  var script = document.currentScript;
  if (!script) return;
  var current = script.getAttribute('data-current') || '';
  var root = new URL('..', script.src).href; // assets/nav.js → raíz del repo

  var ETAPAS = ['Etapa 1 · Discovery & Assessment', 'Etapa 2 · Diseño y Gobierno de APIs', 'Etapa 3 · Validación y despliegue'];
  var ITEMS = [
    { id: 'assessment',   num: '01', nombre: 'Assessment',   url: 'stages/1-discovery/assessment/index.html',       etapa: 0 },
    { id: 'discovery',    num: '02', nombre: 'Discovery',    url: 'stages/1-discovery/market-discovery/index.html', etapa: 0 },
    { id: 'inventory',    num: '03', nombre: 'Inventario',   url: 'stages/2-api-design/api-inventory.html',         etapa: 1 },
    { id: 'api-designer', num: '04', nombre: 'API Designer', url: 'stages/2-api-design/api-designer.html',          etapa: 1 },
    { id: 'enrichment',   num: '05', nombre: 'Versionado', url: 'stages/2-api-design/enrichment.html',    etapa: 1 },
    { id: 'api-lab',      num: '06', nombre: 'API Lab',      url: 'stages/3-api-lab/index.html',                    etapa: 2 }
  ];

  // Estilos: tokens de assets/mbc-tokens.css con valor de reserva por si una página no la carga.
  // Selector `nav.obx-nav` (elemento+clase) para ganar a reglas de página sobre `nav{}` (p. ej. la
  // barra lateral del API Lab), y se fijan explícitamente dirección, padding y anchura por lo mismo.
  var css = ''
    + 'nav.obx-nav{background:var(--mbc-navy,#003478);border-bottom:2px solid var(--mbc-electric,#147AFF);'
    + 'font-family:var(--sans,Montserrat,Arial,sans-serif);display:flex;flex-direction:row;align-items:center;'
    + 'gap:14px;padding:0 18px;height:42px;min-width:1280px;width:100%;position:relative;z-index:3000;'
    + 'box-sizing:border-box;flex-shrink:0;margin:0;}'
    + 'nav.obx-nav a{text-decoration:none;}'
    + '.obx-home{display:flex;align-items:center;gap:7px;color:#fff;font-size:12px;font-weight:700;letter-spacing:.3px;white-space:nowrap;}'
    + '.obx-home svg{flex:0 0 auto;}'
    + '.obx-home:hover{color:var(--mbc-electric-soft,#E7F1FF);}'
    + '.obx-sep{width:1px;height:18px;background:rgba(255,255,255,.2);flex:0 0 auto;}'
    + '.obx-steps{display:flex;align-items:center;gap:2px;flex:1;min-width:0;}'
    + '.obx-step{display:flex;align-items:center;gap:6px;padding:0 10px;height:42px;'
    + 'color:rgba(255,255,255,.62);font-size:11.5px;font-weight:600;letter-spacing:.2px;white-space:nowrap;'
    + 'border-bottom:2px solid transparent;margin-bottom:-2px;box-sizing:border-box;transition:color .15s;}'
    + '.obx-step .obx-num{font-size:10.5px;font-weight:800;color:var(--mbc-electric,#147AFF);letter-spacing:.04em;}'
    + '.obx-step:hover{color:#fff;}'
    + '.obx-step.obx-actual{color:#fff;border-bottom-color:var(--mbc-electric,#147AFF);}'
    + '.obx-step.obx-actual .obx-num{background:var(--mbc-electric,#147AFF);color:#fff;border-radius:6px;padding:1px 5px;}'
    + '.obx-arrow{color:rgba(255,255,255,.22);font-size:10px;flex:0 0 auto;}'
    + '.obx-etapa{color:rgba(255,255,255,.5);font-size:10px;font-weight:700;letter-spacing:.1em;'
    + 'text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:210px;}'
    + '.obx-pol{display:flex;align-items:center;gap:6px;color:rgba(255,255,255,.75);font-size:11px;font-weight:700;'
    + 'letter-spacing:.2px;white-space:nowrap;padding:4px 9px;border-radius:8px;border:1px solid rgba(255,255,255,.22);}'
    + '.obx-pol svg{flex:0 0 auto;}'
    + '.obx-pol:hover{color:#fff;border-color:var(--mbc-electric,#147AFF);background:rgba(20,122,255,.18);}'
    + '.obx-pol.obx-pol-actual{color:#fff;background:var(--mbc-electric,#147AFF);border-color:var(--mbc-electric,#147AFF);}'
    + '.obx-logo{height:16px;width:auto;color:#fff;flex:0 0 auto;margin-left:4px;}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var nav = document.createElement('nav');
  nav.className = 'obx-nav';
  nav.setAttribute('aria-label', 'Recorrido Open Business Accelerator');

  var homeIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none">'
    + '<path d="M3 10.5 12 3l9 7.5" stroke="var(--mbc-electric,#147AFF)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<path d="M5.5 9.5V21h13V9.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

  var html = '<a class="obx-home" href="' + root + 'index.html">' + homeIcon + 'Inicio</a>'
    + '<div class="obx-sep"></div><div class="obx-steps">';

  var etapaActual = '';
  for (var i = 0; i < ITEMS.length; i++) {
    var it = ITEMS[i];
    if (i > 0) {
      html += '<span class="obx-arrow">' + (ITEMS[i - 1].etapa !== it.etapa ? '│' : '›') + '</span>';
    }
    var actual = it.id === current;
    if (actual) etapaActual = ETAPAS[it.etapa];
    html += '<a class="obx-step' + (actual ? ' obx-actual' : '') + '" href="' + root + it.url + '"'
      + (actual ? ' aria-current="page"' : '') + '>'
      + '<span class="obx-num">' + it.num + '</span>' + it.nombre + '</a>';
  }
  var shieldIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6L12 3z"/><path d="m9 12 2 2 4-4"/></svg>';
  // Logo MBC (vector, currentColor). Manual de marca: siempre en su propio hueco, nunca sobre el título.
  var mbcLogo = '<svg class="obx-logo" viewBox="0 0 3860.17 856.07" xmlns="http://www.w3.org/2000/svg" fill="currentColor" role="img" aria-label="MBC">'
    + '<path d="M418.06 0 626.07 488.07 701.67 492.29 910.14 0 1328.21 0 1328.21 856.07 1100.17 856.07 1100.17 192.01 1048.6 192.48 830.28 684.35 496.03 682.1 280.46 194.49 228.04 192.01 228.04 856.07 0 856.07 0 0 418.06 0Z"/>'
    + '<path d="M3139.84 201 3860.17 201 3860.17 0 3148.64 0C3148.13 0 3147.62 0.01 3147.11 0.02 2906.1 1.66 2724.88 176.94 2724.88 428.03 2724.88 679.12 2905.48 852.72 3144.73 856.01 3145.07 856.01 3145.42 856.02 3145.76 856.03 3145.9 856.03 3146.05 856.03 3146.19 856.03 3147 856.04 3147.81 856.06 3148.63 856.06L3860.16 856.06 3860.16 655.06 3141.03 655.06C3033.15 651.52 2947.27 567.26 2947.27 428.02 2947.27 288.78 3029.79 204.6 3139.84 200.98Z"/>'
    + '<path d="M1485.95 0 2304.74 0C2482.07 0 2588.46 94.17 2588.46 231.14 2588.46 311.86 2550.55 384.01 2463.72 407.24L2463.72 426.81C2560.33 441.49 2614.14 508.75 2614.14 618.81 2614.14 765.56 2516.3 856.06 2334.08 856.06L1485.94 856.06 1485.94 0ZM2292.51 335.09C2345.1 335.09 2373.23 305.74 2373.23 259.27 2373.23 212.8 2345.1 183.45 2292.51 183.45L1706.08 183.45 1706.08 335.1 2292.51 335.1ZM2299.84 672.62C2357.32 672.62 2386.67 646.94 2386.67 595.57 2386.67 544.2 2357.32 518.52 2299.84 518.52L1706.08 518.52 1706.08 672.61 2299.84 672.61Z"/></svg>';

  html += '</div><a class="obx-pol' + (current === 'policies' ? ' obx-pol-actual' : '') + '" href="' + root
    + 'stages/2-api-design/governance-policies.html" title="Gobierno: políticas de APIs y de agentes que aplican en todo el recorrido">' + shieldIcon + 'Gobierno</a>'
    + '<div class="obx-sep"></div><div class="obx-etapa">'
    + (current === 'policies' ? 'Set up · Gobierno' : (etapaActual || 'Open Business Accelerator')) + '</div>'
    + mbcLogo;

  nav.innerHTML = html;
  document.body.insertBefore(nav, document.body.firstChild);
})();
