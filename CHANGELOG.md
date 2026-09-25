# Changelog

Todos los cambios notables de este proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/);
versionado según [SemVer](https://semver.org/lang/es/).

## [Unreleased]

### Added
- **Discovery · paso 5 "Viabilidad y requerimientos"** (F18 · `discovery-viabilidad.js`, módulo aditivo; el Discovery sigue funcionando sin él):
  - **Viabilidad temprana** (Método MBC): nueva `core/viabilidad.js` (`clasificarCaso`) clasifica cada API que pide el caso contra el inventario de la entidad y, si existe, contra el set up del Assessment: *Reutilizable · Extender · Nueva · Sin capacidad*, con API base, backend, motivo y condiciones previas; semáforo, lectura en lenguaje de negocio y esfuerzo relativo. Un backend marcado como GAP en el grafo de la entidad degrada el estado. La reutilizará el Inventario en F19.
  - **Requerimientos del producto** (Híbrido): nuevo agente `Agents.requerimientosProducto` (mock) que propone requisitos funcionales, de datos y consentimiento, no funcionales y regulatorios sobre la plantilla MBC por categoría, adaptados a la audiencia prioritaria; editables en línea, con alta y baja de requisitos.
  - **Paquete de requerimientos de negocio** (Método MBC): descarga en Markdown y JSON (caso, audiencia, mercado, requisitos editados, viabilidad, políticas GOV aplicables) y "Guardar como estudio y continuar en el API Designer".
  - Chips de la convención agente/determinista (D15) en los pasos del Discovery; los casos del catálogo con demo en la biblioteca muestran la etiqueta *Demo* y el paso 5 enlaza la demo relacionada.
- `core/viabilidad.js → politicasAplicables()`: políticas GOV-* que aplican a un conjunto de endpoints.
- **Inventario cruzado con el caso** (F19 · `inventory-cruce.js`, módulo aditivo): selector "Cruzar el inventario con un caso de uso" (estudios del Discovery y casos del Assessment) y entrada por URL (`?estudio=`, `?caso=`, `?dcaso=` desde el paso 5). Cada API se marca *Reutilizable*, *A extender* o *No aplica* con las operaciones que el caso le pide; las implicadas suben arriba y el resto se atenúa; el detalle muestra qué pide el caso a esa API; y un bloque "APIs nuevas que ningún activo cubre" lista lo nuevo ("Diseñar nueva →" al Designer con la API objetivo) y lo que no tiene capacidad ("Revisar en el set up"). Misma función que el Discovery: el mismo caso da los mismos números en los dos módulos.
- `core/viabilidad.js`: `clasificarRecursos()` (casos del Assessment, que guardan recursos del delta en vez de endpoints, con las mismas reglas) y `vistaPorApi()` (clasificación agrupada por API del inventario).

- **Repositorio de agentes** (F20 · D14): `stages/agentes/index.html` con el formato de catálogo de referencia — "Dónde entra un agente" por etapa, filtros por etapa y por tipo (Agente / Híbrido / Método MBC), tarjetas por etapa y **ficha de cada agente como una API**: endpoint lógico, versión SemVer, owner, plataforma, ciclo de vida, contrato de entrada y salida, módulo donde actúa, definición en el repo y guardrails que cumple. Enlazable con `?agente=<id>` y `?etapa=<id>`.
- `assets/agents-data.js`: fuente única del catálogo (24 entradas: 8 servicios de la plataforma, 3 agentes y 3 skills del pipeline Copilot de diseño de APIs, 4 agentes de construcción, pasos de Método MBC) y espejo de los guardrails AGT-* del espacio de Gobierno.
- `agents/README.md`: índice de las tres familias de agentes (plataforma, pipeline Copilot, construcción) y checklist de alta o cambio. Cierra F10 sin mover `.github/agents` (Copilot los descubre allí).

### Changed
- `assets/nav.js`: entrada **Agentes** con icono entre Demos y Gobierno; por debajo de 1440 px se oculta la etiqueta de etapa para que los seis pasos y las tres entradas quepan (el paso activo ya la indica).
- Portal: la banda de Gobierno cuenta los 15 agentes inventariados y "Dónde acelera la IA" enlaza al repositorio de agentes y a los guardrails.
- Políticas de Gobierno: `governance-policies.html#agentes` abre directamente los guardrails de agentes. La documentación (D16, plan, storytelling) usa los identificadores AGT-* existentes en lugar de los GOV-AG-* previstos.
- Discovery: el paso 5 de la barra pasa a llamarse *Viabilidad*; el antiguo bloque "Para implementar este caso necesitas" lo sustituye la tabla de viabilidad, y el acceso directo al Designer queda como secundario ("Ir al API Designer sin guardar").
- API Designer (`designer-entrada.js`): al cargar un estudio con paquete de requerimientos, añade a la descripción del agente las APIs clasificadas, los requisitos no funcionales y regulatorios y las políticas aplicables, y lo indica en el aviso de carga.
- Discovery (paso 5): "Ver el caso cruzado en el inventario" abre el Inventario con el mismo caso y sus endpoints.
- API Designer: acepta `?api=` junto a `?estudio=` o `?usecase=` y muestra la API a diseñar primero (llega desde "Diseñar nueva" del Inventario).
- `docs/contratos-agentes.md`: contrato de `requerimientosProducto` y nota sobre la viabilidad como método determinista.

## [0.3.0] - 2026-09-25

La plataforma cambia a la identidad visual **MBC** (tokens compartidos, Montserrat, logo) en portal, barra de navegación y los seis módulos; entra el plan de evolución hacia herramienta de venta (decisiones D12–D16, features F14–F24), el portal se rehace como pieza comercial (enfoques de proyecto y consultoría 4.0), llega la biblioteca de demos con demos protegidas por cifrado, el Designer arranca desde un caso o un estudio de Discovery y el API Lab cierra el bucle de refinamiento.

### Added
- **Biblioteca de demos** (F17 · D13): `demos/index.html` (filtros por tipo, dominio, geografía y acceso; buscador; tarjetas con candado para las protegidas) y `demos/catalog.js` como registro único (`window.DEMO_CATALOG`). Cada demo es un HTML autocontenido bajo `demos/<slug>/` que vuelve al hub desde su hero; no carga `nav.js`. El portal ya la lee para la sección "Casos que ya hemos probado".
- **Demos protegidas por contraseña**: `tools/proteger-demo.py` cifra el HTML (PBKDF2-HMAC-SHA256 · AES-256-GCM) y genera una página de desbloqueo en identidad MBC que descifra en el navegador con WebCrypto; sin backend ni build. La versión en claro vive en `_private/` (ignorado por git) y nunca se commitea. Primera demo protegida: `demos/uy-mandato-debito-precargado-push/` (activación de mandatos de débito, solicitud precargada y push bancario, 14 pasos; `acceso: 'protegida'`, `estado: 'revision'`).
- `tools/check_demo.py`: comprobaciones previas a publicar una demo (placeholders, Montserrat, logo MBC, nota de datos ficticios, recursos externos permitidos, tamaño, registro en `catalog.js`).
- `assets/nav.js`: entrada **Demos** con icono junto a **Gobierno**; `data-current="demos"` para la biblioteca.
- Documentación: `docs/PLAN_MBC_Y_STORYTELLING.md` (diagnóstico, storytelling de venta en cuatro tipologías de proyecto, convención agente/determinista, biblioteca de demos con demos protegidas por cifrado, repositorio de agentes inventariado, plan F14–F24) y `docs/guia-identidad-MBC.md` (tokens, tipografía, logo, componentes y mapa de migración a la identidad MBC).
- Favicon (`assets/favicon.svg`/`.png`) en las 8 páginas y metadatos Open Graph / Twitter Card en el portal (`assets/og-card.png` 1200×630) para que el enlace compartido en chats muestre tarjeta con título, descripción e imagen.
- API Lab: panel "Validación de casos de uso" (`lab-loop.js`) — simulación de sandbox con métricas por caso, refinamiento del diseño por el agente (`labResults` persistidos, la API del caso pasa de "diseñada" a "refinada") y cierre del bucle hacia el re-análisis del Assessment.
- Discovery: gestión de **estudios de mercado** (`estudios.js`, alta/edición/borrado) persistidos vía `Storage.listEstudios/loadEstudio/saveEstudio/removeEstudio` (`core/storage.local.js`), para reutilizarlos como contexto de entrada del Designer.
- API Designer: **entrada dual** (`designer-entrada.js`) — arranca desde un caso de uso o desde un estudio de Discovery, precargando el contexto en vez de partir de cero.

### Changed
- Portal `index.html` rehecho como pieza de venta (F16): hero con el posicionamiento de la práctica ("Abrimos la entidad financiera a terceros con visión de startup y experiencia de gran banca") y panel "Nuestra diferencia"; **cuatro enfoques de proyecto** (Diagnóstico y hoja de ruta · Descubrimiento y monetización · Diseño y gobierno de APIs · Validación con el ecosistema) con la pregunta de la entidad, el impacto y el módulo que lo soporta; sección **Consultoría 4.0** (consultores con la IA generativa en el ADN, velocidad de startup con experiencia de gran banca, sin deuda técnica, alineados con la regulación) y tabla "Dónde acelera la IA en cada enfoque" (antes / con consultoría 4.0); "Casos que ya hemos probado" desde `demos/catalog.js`; banda de Gobierno; la plataforma se presenta como la herramienta con la que ejecutamos, no como producto. Responsive hasta 390 px.
- **Identidad visual MBC en todo el hub (D12, F14).** Nueva hoja de tokens `assets/mbc-tokens.css` (azul oscuro `#003478`, azul eléctrico `#147AFF`, gris cerámica, neutros fríos, Montserrat, radios, chips de la convención agente/determinista) cargada antes que cualquier estilo en las 9 páginas; los `:root` de cada página pasan a ser alias de los tokens y ningún color de marca queda en hex fuera de ellos. Montserrat (Google Fonts) en títulos y cuerpo, con pesos 700/800 donde antes había Georgia. Logo MBC vectorial en la barra de navegación, en la cabecera y en el pie del portal. `assets/favicon.svg/.png` y `assets/og-card.png` regenerados en MBC. Retirados los emojis pictográficos restantes (Designer, Versionado, Lab, Discovery) y sustituidos por SVG inline donde eran iconos (barra lateral del Lab, tarjetas de insight del Discovery, zona de subida de Versionado).
- `assets/nav.js`: estilos a tokens (con valor de reserva), numeración en eléctrico, entrada **Gobierno** con icono en lugar del texto secundario "Políticas", logo MBC a la derecha. El selector pasa a `nav.obx-nav` y fija dirección, padding y anchura para que ninguna regla de página sobre `nav{}` la deforme.
- Portal `index.html`: mismo recorrido y estructura, retintado en MBC (cabecera y pie azul oscuro con logo, hero con degradado y destacado en eléctrico, enlaces del bloque "Cómo funciona" en azul oscuro subrayado por contraste).
- `docs/DECISIONES_Y_ARQUITECTURA.md`: decisiones D12 (identidad MBC en todo el repo), D13 (biblioteca de demos en el repo y excepción a D4 solo con cifrado), D14 (repositorio de agentes inventariado como APIs), D15 (chips Agente / Método MBC / Híbrido) y D16 (gobierno transversal de APIs y agentes; exportación de requerimientos de negocio). `docs/plan-de-trabajo.md`: tramo F (F14–F24); F10 absorbida por F20 y F11 sustituida por F15.
- Pestaña 12: las tarjetas de caso muestran sus APIs con estado coloreado.
- Módulo 05 renombrado de **Enrichment** a **Gestión & Versionado** (`assets/nav.js`, portal y `enrichment.html`): agrupa enriquecimiento ISO 20022, mejora de la especificación y ciclo de vida/deprecación bajo un solo espacio, con hilo Diseño → Revisión → Publicación → Gestión & Versionado → Deprecación.
- Inventario de APIs: **acciones de ciclo de vida** por API (proponer nueva versión SemVer · GOV-VER-01, iniciar deprecación · GOV-VER-02) y enlace "Gestión & versionado". La barra de ciclo de vida del API Designer se oculta y su gestión se traslada a este espacio (feedback UX: confundía en el Designer).

### Fixed
- API Lab: la barra de navegación de la plataforma se deformaba y quedaba bajo la cabecera del Lab al navegar. Causa: la regla `nav{…}` de la barra lateral del Lab (ancho 200 px, columna, padding) se aplicaba también al `<nav class="obx-nav">` inyectado. La barra lateral pasa a `nav.lab-nav`, la cabecera del Lab deja de ser `sticky` (el scroll es interno) y `lab-loop.js` se inyecta dentro de `.main-area`.
- `.gitattributes` (`* text=auto eol=lf`): el working tree en Windows mostraba 36 ficheros modificados solo por finales de línea.

## [0.2.0] - 2026-07-23

El recorrido crece a 6 módulos e integra el dominio: el Assessment persiste vía `core/storage`, los casos de uso escriben el roadmap y la inversión de la entidad, entra el Inventario de APIs, el API Designer toma contexto por URL, y aparece el espacio de Políticas de Gobierno que Enrichment evalúa en una segunda fase.

### Added
- Espacio de **Políticas de Gobierno de APIs** (`stages/2-api-design/governance-policies.html`): la base de conocimiento que gobierna cualquier diseño, versionada y citable. Accesible desde un enlace lateral en `assets/nav.js` (fuera del recorrido numerado) y referenciada desde el Inventario y desde la pestaña de Gobierno de Enrichment.
- API Designer con contexto de entrada (`designer-context.js`): `?caso=` muestra el caso y sus APIs del delta y permite guardar el diseño en `caso.ecosistema.apis` (estado "diseñada"); `?from=` precarga la API del inventario a extender; `?usecase=` muestra el contexto de Market Discovery. `assets/inventory-data.js` como fuente única del inventario demo.
- Assessment (pestaña 12 · Casos de Uso): alta, listado y borrado de casos simulados sobre la entidad activa, distinguiendo naturaleza (Embedded Finance/BaaS = solo APIs · caso completo = APIs + frontal). Colección aparte por `entidadId` vía `Storage.listCasos/saveCaso/removeCaso`. La pestaña se inyecta dinámicamente y, si el módulo no carga (`file://`), simplemente no aparece.
- Assessment (pestaña 13): botón "Actualizar roadmap de la entidad" tras el análisis del delta — el agente genera iniciativas etiquetadas por caso (slot y devengo) que se agregan al roadmap del dominio, y panel "Roadmap de casos de uso" con CAPEX/OPEX agregados por entidad (recalculados al añadir o quitar casos, sin duplicados).
- Módulo 03 · **Inventario de APIs** (`stages/2-api-design/api-inventory.html`): catálogo del estate existente con el mapeo endpoint → sistema backend → servicio interno, y acción "Extender esta API" que precarga el API Designer con el conocimiento ya generado en vez de partir de cero. Sirve tanto para APIs externas como internas.
- Enrichment: pestaña **Gobierno de APIs** con revisión del YAML contra las buenas prácticas de gobierno (versionado, errores, FAPI, paginación, idempotencia, metadatos de catálogo) y modo de búsqueda simple de campo ISO 20022.
- `stages/1-discovery/assessment/storage-bridge.js`: puente del Assessment al dominio (cada cliente guardado = una Entidad; la forma de `S` se conserva en `entidad.assessment`). Migración aditiva del almacén antiguo y degradación elegante si los módulos ES no cargan (`file://`).

### Changed
- Enrichment: pipeline en dos fases — Fase 1 diccionario ISO 20022 (4 capas) y nueva Fase 2 "Mejora de la especificación" que evalúa en vivo las 8 reglas del espacio de Políticas de Gobierno (GOV-*) con conformidad puntuada; la pestaña "Gobierno de APIs" del resultado pasa a ser la salida de esa fase.
- Assessment (pestaña 13): enlace "Diseñar →" por cada API del delta hacia el Designer.
- El recorrido pasa de 5 a **6 módulos**: el Inventario entra como 03 y renumera API Designer (04), Enrichment (05) y API Lab (06) en `assets/nav.js` y en el portal.
- Documentación del recorrido actualizada a 6 módulos + Políticas transversales: `README.md` (diagrama, fichas y estructura) y `agents/demo-orchestrator.agent.md` (árbol, numeración y `data-current`).
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
