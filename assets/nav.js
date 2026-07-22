// assets/nav.js — Barra de navegación de la plataforma (Open Business Accelerator)
// ─────────────────────────────────────────────────────────────────────────────
// Uso: incluir al final del <body> de cada herramienta:
//   <script src="<ruta-relativa>/assets/nav.js" data-current="assessment"></script>
// Valores de data-current: assessment | discovery | api-designer | enrichment | api-lab
//
// La barra se inyecta arriba del todo: muestra el recorrido 01→05, resalta el
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
    { id: 'api-designer', num: '03', nombre: 'API Designer', url: 'stages/2-api-design/api-designer.html',          etapa: 1 },
    { id: 'enrichment',   num: '04', nombre: 'Enrichment',   url: 'stages/2-api-design/enrichment.html',            etapa: 1 },
    { id: 'api-lab',      num: '05', nombre: 'API Lab',      url: 'stages/3-api-lab/index.html',                    etapa: 2 }
  ];

  var css = ''
    + '.obx-nav{background:#260717;border-bottom:2px solid #FF0054;font-family:Arial,sans-serif;'
    + 'display:flex;align-items:center;gap:18px;padding:0 24px;height:40px;min-width:1280px;'
    + 'position:relative;z-index:3000;box-sizing:border-box;}'
    + '.obx-nav a{text-decoration:none;}'
    + '.obx-home{display:flex;align-items:center;gap:7px;color:#fff;font-size:12px;letter-spacing:.5px;white-space:nowrap;}'
    + '.obx-home svg{flex:0 0 auto;}'
    + '.obx-home:hover{color:#FF0054;}'
    + '.obx-sep{width:1px;height:18px;background:rgba(255,255,255,.18);flex:0 0 auto;}'
    + '.obx-steps{display:flex;align-items:center;gap:4px;flex:1;}'
    + '.obx-step{display:flex;align-items:center;gap:6px;padding:0 10px;height:40px;'
    + 'color:rgba(255,255,255,.55);font-size:11.5px;letter-spacing:.4px;white-space:nowrap;'
    + 'border-bottom:2px solid transparent;margin-bottom:-2px;box-sizing:border-box;}'
    + '.obx-step .obx-num{font-family:Georgia,serif;font-size:12.5px;color:rgba(255,0,84,.65);}'
    + '.obx-step:hover{color:#fff;}'
    + '.obx-step:hover .obx-num{color:#FF0054;}'
    + '.obx-step.obx-actual{color:#fff;border-bottom-color:#FF0054;}'
    + '.obx-step.obx-actual .obx-num{color:#FF0054;}'
    + '.obx-arrow{color:rgba(255,255,255,.22);font-size:10px;flex:0 0 auto;}'
    + '.obx-etapa{color:rgba(255,255,255,.4);font-size:10.5px;letter-spacing:1.2px;'
    + 'text-transform:uppercase;white-space:nowrap;}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var nav = document.createElement('nav');
  nav.className = 'obx-nav';
  nav.setAttribute('aria-label', 'Recorrido Open Business Accelerator');

  var homeIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none">'
    + '<path d="M3 10.5 12 3l9 7.5" stroke="#FF0054" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
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
  html += '</div><div class="obx-etapa">' + (etapaActual || 'Open Business Accelerator') + '</div>';

  nav.innerHTML = html;
  document.body.insertBefore(nav, document.body.firstChild);
})();
