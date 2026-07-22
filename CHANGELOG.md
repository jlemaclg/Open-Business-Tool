# Changelog

Todos los cambios notables de este proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/);
versionado según [SemVer](https://semver.org/lang/es/).

## [Unreleased]

### Added
- Módulo 03 · **Inventario de APIs** (`stages/2-api-design/api-inventory.html`): catálogo del estate existente con el mapeo endpoint → sistema backend → servicio interno, y acción "Extender esta API" que precarga el API Designer con el conocimiento ya generado en vez de partir de cero. Sirve tanto para APIs externas como internas.
- Enrichment: pestaña **Gobierno de APIs** con revisión del YAML contra las buenas prácticas de gobierno (versionado, errores, FAPI, paginación, idempotencia, metadatos de catálogo) y modo de búsqueda simple de campo ISO 20022.
- `stages/1-discovery/assessment/storage-bridge.js`: puente del Assessment al dominio (cada cliente guardado = una Entidad; la forma de `S` se conserva en `entidad.assessment`). Migración aditiva del almacén antiguo y degradación elegante si los módulos ES no cargan (`file://`).

### Changed
- El recorrido pasa de 5 a **6 módulos**: el Inventario entra como 03 y renumera API Designer (04), Enrichment (05) y API Lab (06) en `assets/nav.js` y en el portal.
- Assessment (`index.html`): gancho `window.__oba` e inclusión del módulo `storage-bridge.js`. Sin cambios en cálculos ni en export/import.
- Assessment: subtítulos de las 11 pestañas en lenguaje de acción (qué haces aquí y qué alimenta), sin referencias internas en superficie; las 6 recomendaciones de consultoría pasan a bloques plegables "Apunte experto · <tema>" con título formal. API Lab: eliminado emoji decorativo (norma de estilo: SVG inline).

## [0.1.0] - 2026-07-22

Primera demo pública: portal, 5 módulos y core con mocks.

### Added
- Estructura inicial del proyecto y documento fuente de verdad `DECISIONES_Y_ARQUITECTURA.md`.
- `README.md` de la plataforma orientado al repositorio público: recorrido de las 3 etapas, ejecución en local, estructura y nota de licencia y datos.
- `docs/plan-de-trabajo.md`: plan por features (F1–F13) con rama y *Definition of Done* por feature; cadencia una feature = una sesión = una rama.
- `assets/nav.js`: barra de navegación común inyectada en las 5 herramientas de `stages/`, con el recorrido 01→05, resaltado del módulo actual y vuelta al portal. Resuelve sus rutas desde la URL del propio script, así que funciona a cualquier profundidad.

### Changed
- Rediseño UX del portal (`index.html`): hero con recorrido 01→05 clicable (CTA *Entrar* y badges BETA en nodos), bucle de retorno visible, banda "cómo funciona" en 3 pasos y home compacto sin bloque de tarjetas. Branding "Open Business Accelerator" (sin Minsait en UI), posicionamiento ampliado a casos de uso y APIs de negocio para Embedded Finance/BaaS, y "set up de la entidad" como término de UI.
- `DECISIONES_Y_ARQUITECTURA.md` §6: modelo de ramas `develop`/`main` con tags de versión.
- Instrucciones de agentes alineadas con la estructura `stages/`: `demo-orchestrator.agent.md` consolidado (absorbe la v2 de *Instrucciones actualizadas* y documenta las 5 herramientas en 3 etapas, el árbol real de ficheros y el uso de `assets/nav.js`); rutas reales en `discovery-agent.agent.md` y `api-lab-agent.agent.md`.
- `agents/` aplanado: `enrichment-agent.agent.md` e `iso20022-pipeline.skill.md` suben desde la subcarpeta *Instrucciones actualizadas*, que se elimina. Todos los ficheros de agentes quedan al mismo nivel y sin espacios ni tildes en las rutas.
- Autorreferencias de `agents/*.md` corregidas: apuntaban a `.github/agents/…` y `.github/skills/…`, rutas que no ocupan. Los ficheros de `agents/` son especificaciones de diseño (sin frontmatter); los agentes funcionales de Copilot siguen en `.github/agents/`.
- Marca de producto en las 5 herramientas y en las instrucciones de agentes: pasa de "Minsait" a **Open Business Accelerator** en títulos, logotipos y pies de página. Se conserva la paleta y la tipografía, y las citas de fuente en cuerpo de texto.
- Assessment (`stages/1-discovery/assessment/index.html`): anonimizada la identidad del cliente de la precarga — el nombre pasa a "Entidad Demo" y las referencias de calibración a "entidad de referencia". El análisis As-Is (28 entradas), las iniciativas (49) y los presupuestos se mantienen intactos como contexto de referencia de un proceso de assessment.

### Removed
- `agents/Instrucciones actualizadas/demo-orchestrator-v2.agent.md`: era un superconjunto de `demo-orchestrator.agent.md`, se consolidan en este último para dejar una única fuente de verdad.
- `kb/` (`KB_01`…`KB_05`) queda fuera del repositorio: es metodología propietaria y se excluye mientras el repo sea público. Los ficheros siguen en el disco de trabajo.

### Fixed
- Enlaces internos de las demos movidas a `stages/` (referencias a `demo-home.html` y `api-designer-demo-v2.html`), incluido el CTA dinámico de market-discovery que pasa `?usecase=` al API Designer.

<!--
Convención de secciones (usar las que apliquen en cada entrada):
  Added      — funcionalidad nueva
  Changed    — cambios en funcionalidad existente
  Deprecated — funcionalidad que se retirará
  Removed    — funcionalidad eliminada
  Fixed      — correcciones de errores
  Security   — temas de seguridad

Flujo: anota aquí bajo [Unreleased] a medida que entran cambios.
Al publicar una versión, mueve el bloque a una sección con versión y fecha, p. ej.:

## [0.1.0] - 2026-07-XX
### Added
- ...
-->
