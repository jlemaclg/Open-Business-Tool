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

### ⬜ F10 · Consolidar agentes — `chore/agentes-consolidacion`
Una sola fuente en `agents/` (v2 canónico, resolver duplicados con `.github/agents`), README del repo reescrito para la plataforma.

### ⬜ F11 · Release v0.3.0 — recorrido end-to-end demoable.

---

## Tramo E — Cierre (cuando toque)

### ⬜ F12 · Fase 2: login Supabase — `feat/auth-supabase` (+ `storage.cloud.js`)
### ⬜ F13 · Repo a privado (fin de la demo abierta, D11) + evaluar Pages de pago o Azure.

---

## Reglas de cada sesión de trabajo
1. Al empezar: `git checkout develop && git pull` → crear la rama de la feature.
2. Claude entrega archivos + DoD verificado en local por Jonathan.
3. Copilot commitea (Conventional Commits) + anota CHANGELOG `[Unreleased]` + push de la rama.
4. Merge a `develop` cuando el DoD se cumple; borrar la rama.
5. A `main` solo en features de release (F2, F7, F11…), con tag y CHANGELOG versionado.
