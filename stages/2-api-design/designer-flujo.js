// designer-flujo.js — Flujo guiado del API Designer (F22 · refinado visual)
// ─────────────────────────────────────────────────────────────────────────────
// Capa de presentación sobre el Designer existente, sin tocar su lógica:
//  1) Barra de progreso de 4 pasos (Describir → Propuesta y revisión →
//     Artefactos → Siguiente paso) que sigue a showSec().
//  2) Marcas D15 en cada pantalla: quién actúa (agente, método MBC) y dónde
//     decide la persona (human-in-the-loop, AGT-HIL-01), enlazadas al
//     Repositorio de agentes y al espacio de Gobierno.
//  3) Guía de 4 pasos en la portada y bloque "Siguiente paso" al final.
// Script clásico: se carga después del script principal del Designer.
// ─────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var AGENTES = '../agentes/index.html?agente=';
  var GOB = 'governance-policies.html#';

  // ── 1) Barra de pasos ──
  var PASOS = ['Describir el caso', 'Propuesta y revisión', 'Artefactos OpenAPI', 'Siguiente paso'];
  var PASO_DE = { sec1: 1, sec2: 2, sec3: 2, sec4: 3, sec5: 4 };
  var brand = document.querySelector('#app-header .hdr-brand');
  if (brand) {
    var ol = document.createElement('ol');
    ol.className = 'df-steps';
    ol.setAttribute('aria-label', 'Progreso del diseño');
    ol.innerHTML = PASOS.map(function (t, i) {
      return (i ? '<li class="df-sep" aria-hidden="true"></li>' : '') +
        '<li class="df-step" data-paso="' + (i + 1) + '"><span class="n">' + (i + 1) + '</span>' + t + '</li>';
    }).join('');
    brand.insertBefore(ol, brand.firstChild);
  }
  function marcar(n) {
    document.querySelectorAll('.df-step').forEach(function (li) {
      var p = +li.getAttribute('data-paso');
      li.classList.toggle('on', p === n);
      li.classList.toggle('ok', p < n);
      li.querySelector('.n').textContent = p < n ? '✓' : p;
      if (p === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    document.querySelectorAll('.df-sep').forEach(function (s, i) { s.classList.toggle('ok', i + 1 < n); });
  }
  if (typeof window.showSec === 'function') {
    var original = window.showSec;
    window.showSec = function (id) { original(id); if (PASO_DE[id]) marcar(PASO_DE[id]); };
  }
  marcar(1);

  // ── 2) Marcas D15 ──
  function chip(clase, texto, href, titulo) {
    return '<a class="' + clase + '" href="' + href + '" title="' + (titulo || texto) + '">' + texto + '</a>';
  }
  function anadirAlEyebrow(sel, html) {
    var eb = document.querySelector(sel);
    if (eb) eb.insertAdjacentHTML('beforeend', html);
  }
  var baChip = chip('chip-agente', 'Agente · Business Analyst', AGENTES + 'business-analyst', 'Ver la ficha del agente en el Repositorio de agentes');
  var abChip = chip('chip-agente', 'Agente · API Builder', AGENTES + 'api-builder', 'Ver la ficha del agente en el Repositorio de agentes');
  anadirAlEyebrow('#sec1 .sec-hdr .eyebrow', baChip);
  anadirAlEyebrow('#sec2 .agent-card .eyebrow', baChip);
  anadirAlEyebrow('#sec3-review .sec-hdr .eyebrow', chip('chip-hibrido', 'Decides tú · AGT-HIL-01', GOB + 'AGT-HIL-01', 'Human-in-the-loop: el agente no cierra un campo de baja confianza sin decisión de la persona'));
  anadirAlEyebrow('#sec3-proposal .sec-hdr .eyebrow', baChip);
  anadirAlEyebrow('#sec4 .agent-card .eyebrow', abChip);
  anadirAlEyebrow('#sec5 .sec-hdr .eyebrow', abChip + chip('chip-metodo', 'Método MBC · revisión GOV-*', AGENTES + 'revision-gobierno', 'Validación determinista de $ref, naming y cobertura ISO 20022 contra las políticas de gobierno'));

  var rp = document.querySelector('#sec3-review .review-progress');
  if (rp) rp.insertAdjacentHTML('beforeend', '<span class="hil-nota">Regla aplicada: <a href="' + GOB + 'AGT-HIL-01">Human-in-the-loop</a> · <a href="' + GOB + 'AGT-INV-01">Prohibido inventar</a></span>');

  // Pestaña Swagger: icono SVG en lugar de emoji
  var tabSw = document.querySelector('.tab[onclick*="tp2-swagger"]');
  if (tabSw) tabSw.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 1.5h5.5L12 4v10.5H4z"/><path d="M9.5 1.5V4H12M6 8h4M6 10.5h4"/></svg>Swagger UI';

  // ── 3a) Guía de la portada ──
  var body = document.querySelector('#portada .p-body');
  if (body) {
    var guia = document.createElement('div');
    guia.className = 'p-guia';
    var textos = [
      'Eliges cómo empezar: desde cero o desde un estudio guardado en Discovery.',
      'El Business Analyst propone paths y diccionario ISO 20022; tú decides los campos dudosos.',
      'El API Builder genera OpenAPI 3.1 y JSON Schemas; la revisión GOV-* los valida.',
      'Guardas el diseño en el caso y sigues en Gestión y Versionado o en el API Lab.'
    ];
    guia.innerHTML = PASOS.map(function (t, i) { return '<div><b><span>' + (i + 1) + '</span>' + t + '</b>' + textos[i] + '</div>'; }).join('');
    body.after(guia);
  }

  // ── 3b) Siguiente paso ──
  var wrap5 = document.querySelector('#sec5 > .wrap');
  if (wrap5) {
    var caso = new URLSearchParams(location.search).get('caso');
    var next = document.createElement('section');
    next.className = 'df-next';
    next.setAttribute('aria-label', 'Siguiente paso');
    next.innerHTML = '<h3>Siguiente paso</h3><p>El diseño queda listo para seguir su ciclo de vida en la plataforma.</p><div class="df-next-grid">' +
      (caso ? '<a href="#" id="dfGuardar"><b>Guardar el diseño en el caso</b><small>La API pasa a estado «diseñada» en el caso de uso del Assessment.</small></a>' : '') +
      '<a href="enrichment.html"><b>Gestión y Versionado</b><small>Enriquecimiento ISO 20022, mejora de la especificación y ciclo de vida.</small></a>' +
      '<a href="../3-api-lab/index.html"><b>API Lab</b><small>Despliegue en sandbox y pruebas con partners.</small></a>' +
      '</div>';
    wrap5.appendChild(next);
    var g = $('dfGuardar');
    if (g) g.addEventListener('click', function (e) {
      e.preventDefault();
      var btn = $('dcGuardar');
      if (btn && !btn.disabled) btn.click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
