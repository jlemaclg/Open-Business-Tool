# Plan de trabajo por features — Open Business Accelerator

> **Cadencia:** una feature = una sesión de trabajo = una rama. La rama nace de `develop`
> y se borra al mergear. `main` solo recibe merges desde `develop` cuando hay algo
> demoable (Pages re-despliega y se etiqueta versión). Detalle del modelo de ramas en
> `DECISIONES_Y_ARQUITECTURA.md` §6.

**Estado:** ✅ hecha · 🔜 siguiente · ⬜ pendiente

---

## Tramo A — Publicar la demo cuanto antes

### ✅ F0 · Fundaciones (Sprint 0 + reorganización)
Dominio (`core/domain`), adaptadores `storage.js`/`agents.js` con mocks, estructura
`stages/`, LICENSE, `.gitignore`. *Ya commiteado.*

### 🔜 F1 · Portal completo — `feat/portal-assessment`
**Objetivo:** que el portal refleje la plataforma real y todo navegue.
- Tarjeta del **Assessment** en `index.html` (hoy no existe) como pieza central de Discovery.
- Revisar/corregir los enlaces de vuelta y rutas internas de los 4 HTML movidos a `stages/`.
- Título/branding del portal alineado al recorrido (Discovery → Diseño → Lab).
**DoD:** abro `index.html` en local y llego a los 5 módulos y vuelvo, sin errores de consola.

### ⬜ F2 · Release v0.1.0 — publicar Pages — `chore/release-v0.1.0`
**Objetivo:** el link abierto de la demo, ya.
- Merge `develop` → `main`, tag `v0.1.0`, mover `[Unreleased]` del CHANGELOG a `[0.1.0]`.
- Activar Pages (Settings → Pages → `main`/root) y verificar la URL pública.
**DoD:** la URL de Pages abre el portal y los 5 módulos funcionan desde internet.

---

## Tramo B — El Assessment se conecta al dominio

### ⬜ F3 · Assessment sobre `core/` — `refactor/assessment-core`
**Objetivo:** la herramienta persiste vía `Storage` (Entidad) en lugar de su `localStorage` directo.
- Envolver `guardar()/cargarCliente()/store()` con `Storage.saveEntidad/loadEntidad` (la forma de `S` se conserva dentro de la Entidad; refactor mínimo, D6/§5).
- Mantener export/import JSON intactos.
**DoD:** un assessment guardado antes del cambio se sigue cargando; crear/guardar/cargar/exportar funciona igual que hoy.

### ⬜ F4 · Gestión de Casos de Uso — `feat/casos-de-uso`
**Objetivo:** crear y listar casos de uso sobre la entidad activa.
- UI mínima: lista de casos por entidad, alta con `nombre` + `naturaleza`
  (Embedded Finance/BaaS = solo APIs · Caso completo = APIs + frontal).
- Persistencia vía `Storage.saveCaso/listCasos` (colección aparte por `entidadId`).
**DoD:** creo 2 casos de distinta naturaleza, recargo la página y siguen ahí, ligados a su entidad.

---

## Tramo C — El valor diferencial (agentes mock)

### ⬜ F5 · GAPs & Dependencias — `feat/gaps-dependencias`  ⭐ la variable pendiente
**Objetivo:** la nueva pestaña del Assessment con el grafo y el delta.
- Editor sencillo del grafo de la entidad (nodos: capacidad/servicio/core/canal/equipo; aristas técnica/organizativa/equipo con estado).
- Botón "Analizar caso de uso" → `Agents.gapsYDependencias(caso, entidad)` (mock) → vista del delta: APIs necesarias, necesidades tech/equipo, GAPs, bloqueos, inversión incremental. Banner "datos simulados" si `_mock`.
**DoD:** con un caso BaaS el delta sale pequeño y con un caso completo sale grande; los bloqueos se distinguen visualmente.

### ⬜ F6 · Write-back al roadmap — `feat/roadmap-writeback`
**Objetivo:** cerrar el círculo económico.
- `Agents.actualizarRoadmap(caso)` → iniciativas + inversión con devengo se agregan al roadmap y business case de la Entidad, etiquetadas por caso de uso.
**DoD:** tras analizar un caso, el roadmap de la entidad muestra sus iniciativas y la inversión agregada cambia.

### ⬜ F7 · Release v0.2.0 — `chore/release-v0.2.0`
Merge a `main` + tag: la demo pública ya cuenta la historia completa de Discovery.

---

## Tramo D — El recorrido completo entre módulos

### ⬜ F8 · API Design consume el Caso de Uso — `feat/api-design-caso`
El API Designer arranca desde las `apisNecesarias` del caso (contexto precargado) y guarda el artefacto en `caso.ecosistema.apis` con estado `diseñada`.

### ⬜ F9 · Bucle del API Lab — `feat/api-lab-refine`
El Lab registra `labResults` y `Agents.refinarAPI` (mock) devuelve refinamientos → la API pasa a `refinada` y se refleja de vuelta en el caso.

### ⬜ F10 · Consolidar agentes — *absorbida por F20 (repositorio de agentes)*
Una sola fuente en `agents/` (v2 canónico, resolver duplicados con `.github/agents`), README del repo reescrito para la plataforma.

### ⬜ F11 · Release v0.3.0 — *sustituida por F15 (la v0.3.0 publica la identidad MBC).*

---

## Tramo E — Cierre (cuando toque)

### ⬜ F12 · Fase 2: login Supabase — `feat/auth-supabase` (+ `storage.cloud.js`)
### ⬜ F13 · Repo a privado (fin de la demo abierta, D11) + evaluar Pages de pago o Azure.

---

## Tramo F — Identidad MBC y herramienta de venta (25-09-2026)

> Análisis, storytelling y detalle de cada feature en `PLAN_MBC_Y_STORYTELLING.md`. Decisiones D12–D16 en `DECISIONES_Y_ARQUITECTURA.md`. Orden acordado: **identidad primero**, después home y módulos.

### 🔜 F14.0 · Cerrar lo abierto — PR `feat/designer-entrada-y-versionado` → `develop` · `fix/api-lab-header` · `chore/eol-gitattributes`
- Mergear la feature pendiente (commit `3d4e7b6`).
- Commitear el fix del header del API Lab (sticky retirado, `lab-loop.js` inyectado en `.main-area`) **conservando el favicon y sin el emoji** que trae la copia local.
- `.gitattributes` (`* text=auto eol=lf`) + `git add --renormalize .` para que el diff deje de ser ruido CRLF (hoy 36 ficheros "modificados", 12 líneas reales).
**DoD:** `git status` limpio en `develop`; el API Lab navega sin montar su cabecera sobre la barra.

### ⬜ F14 · Identidad MBC en todo el repo — `refactor/hub-identidad-mbc`
- `assets/mbc-tokens.css` (tokens de `guia-identidad-MBC.md` §3 + chips Agente / Método MBC / Híbrido de D15 + componentes §7), cargado antes que cualquier otra hoja.
- Montserrat (Google Fonts, único recurso externo), logo MBC SVG inline en cabecera (blanco) y pie (azul).
- `assets/nav.js`: estilos a tokens; entradas nuevas **Demos**, **Agentes** y **Gobierno** (con icono, no texto secundario); etiquetas cortas.
- Home `index.html`: retintado y tipografía **sin cambiar estructura** (la estructura cambia en F16). Quitar `min-width:1280px`.
- 7 páginas de `stages/` + `lab-loop.js`, `estudios.js`, `gaps-dependencias.js`, `casos-de-uso.js`, `designer-*.js` a tokens; emojis fuera (Designer, Versionado, Lab, Discovery).
- `assets/favicon.svg/.png` y `assets/og-card.png` regenerados en MBC.
**DoD:** `grep -rniE "#4F062A|#FF0054|#A40037|#EF659D|#260717|Georgia|Minsait" index.html assets/ stages/` sin resultados; 9 páginas cargan Montserrat y los tokens; sin errores de consola; se ve bien a 1280 y 390 px.

### ⬜ F15 · Release v0.3.0 — `chore/release-v0.3.0`
Identidad MBC publicada en Pages; CHANGELOG `[0.3.0]`; tag `v0.3.0`.

### ⬜ F16 · Home comercial — `feat/home-comercial`
Estructura de `PLAN_MBC_Y_STORYTELLING.md` §3: cabecera compacta · hero corto con dos CTAs · 4 tarjetas de tipología de proyecto (pregunta del cliente, entregable, módulos, chips Agente/Método) · "Dónde entra un agente" (línea de tiempo por etapa) · "Casos que ya hemos probado" (3 tarjetas de `demos/catalog.js`, degrada si no existe) · banda de Gobierno · recorrido 01–06 como pie navegable con el bucle.
**DoD:** un cliente entiende en una pantalla qué hacemos, dónde actúan agentes y qué evidencia hay; todo enlaza; copy sin "Minsait", sin emojis.

### ⬜ F17 · Biblioteca de demos y demos protegidas — `feat/biblioteca-demos`
- `demos/index.html` (filtros dominio/tipo/audiencia/acceso), `demos/catalog.js`, `demos/<slug>/index.html` autocontenidas con "← Biblioteca de demos".
- `tools/proteger-demo.py` (AES-GCM + PBKDF2, salida = HTML de desbloqueo con el contenido cifrado) y `_private/` en `.gitignore`. Primera demo protegida: `uy-mandato-debito-precargado-push` (`acceso: 'protegida'`).
- "Demos" en la barra; el catálogo de casos del Discovery enlaza cada caso con su demo (`demoSlug`).
**DoD:** la biblioteca lista las demos; la protegida no muestra nada sin contraseña y se abre con ella; `git log -p` no contiene el HTML en claro; `check_demo.py` sin errores.

### ⬜ F18 · Discovery: viabilidad temprana y exportación de requerimientos — `feat/discovery-viabilidad-export`
- Chips D15 en los 5 pasos (caso = Método · audiencia = Agente `marketDiscovery` · requerimientos = Híbrido · viabilidad = Método · export = Método).
- `core/viabilidad.js`: clasifica las APIs que pide el caso contra `OBA_INVENTORY` y los GAPs del Assessment → Reutilizable · Extender · Nueva · Sin capacidad, con lectura en lenguaje de negocio.
- Paso "Requerimientos del producto": plantilla determinista rellenada en borrador por el agente y editable.
- Botón **Exportar requerimientos de negocio** (Markdown + JSON) y guardado en el estudio; el Designer lo consume vía `?estudio=`.
**DoD:** con un caso del catálogo se obtiene un semáforo de viabilidad coherente con el inventario y se descarga el paquete; el Designer arranca precargado desde ese estudio.

### ⬜ F19 · Inventario cruzado con el caso — `feat/inventario-cruce-caso`
Con `?caso=` o `?estudio=`, cada API del inventario se etiqueta (reutilizable / a extender / no aplica) y aparece la lista de APIs nuevas; misma función `core/viabilidad.js`; acción "Diseñar nueva" hacia el Designer.
**DoD:** la clasificación coincide con la de Discovery para el mismo caso.

### ⬜ F20 · Repositorio de agentes — `feat/repositorio-agentes` (absorbe F10)
`stages/agentes/index.html` + `assets/agents-data.js`: filtros por etapa y tipo con contador, tarjetas (icono, tipo, nombre, descripción, "Ver ficha"), sección "Dónde entra un agente" (4 etapas), ficha por agente como una API del inventario (contrato, versión, owner, ciclo de vida, políticas). Una sola fuente de definiciones en `agents/`.
**DoD:** los 7 servicios de `core/agents.js` (más los pasos deterministas relevantes) aparecen inventariados y cada ficha enlaza al módulo donde actúa.

### ⬜ F21 · Gobierno transversal — `feat/gobierno-transversal`
`governance-policies.html` con pestañas *APIs* (GOV-*) y *Agentes* (GOV-AG-*: trazabilidad, datos prohibidos, revisión humana, versionado de prompt/contrato, banner de simulación, coste); nodo en el home; entrada "Gobierno" en la barra; bloque "Políticas aplicadas" en cada módulo.
**DoD:** desde cualquier módulo se llega en un clic a la regla concreta que aplica; el repositorio de agentes cita GOV-AG-*.

### ⬜ F22 · Designer: flujo y artefactos — `refactor/designer-flujos`
Patrón de la demo (pantalla protagonista + paneles Backend / Secuencia): 4 pasos visibles, artefactos en pestañas de una única tarjeta, diagrama del modelo en SVG, modelos ISO 20022 nuevos (lista de Jonathan), CSS extraído a `assets/` sin build. Sin emojis.
**DoD:** el recorrido Describir → Propuesta → Artefactos → Guardar se sigue sin explicación; visualmente coherente con las demos.

### ⬜ F23 · Gestión & Versionado visual — `refactor/versionado-visual`
Misma tarjeta de artefactos; comparativa As-Is / To-Be en dos columnas con diff resaltado; strip de ciclo de vida con chips D15; conformidad GOV-* como lista puntuada con enlace a la regla.

### ⬜ F24 · Release v0.4.0 — `chore/release-v0.4.0`
Storytelling completo demoable (home comercial, demos, viabilidad, agentes, gobierno).

> Después: F12 (Supabase; sustituye el cifrado de demos por login) y F13 (repo privado).

---

## Reglas de cada sesión de trabajo
1. Al empezar: `git checkout develop && git pull` → crear la rama de la feature.
2. Claude entrega archivos + DoD verificado en local por Jonathan.
3. Copilot commitea (Conventional Commits) + anota CHANGELOG `[Unreleased]` + push de la rama.
4. Merge a `develop` cuando el DoD se cumple; borrar la rama.
5. A `main` solo en features de release (F2, F7, F11…), con tag y CHANGELOG versionado.
