# Herramienta de Assessment Open Finance — Decisiones y Arquitectura

> **Fuente de verdad del proyecto.** Recoge las decisiones tomadas y el plan técnico para
> exponer a internet la *Herramienta de Estimación de Costos & Business Case Open Finance*.
> Pensado para dos lectores: (a) cualquier persona del equipo, y (b) **GitHub Copilot en el
> IDE**, que NO tiene acceso a la conversación donde se decidió esto — este MD es su contexto.
>
> **Cómo usarlo con Copilot:** *"lee `DECISIONES_Y_ARQUITECTURA.md`, aplica los cambios que te
> indique, documéntalos en `CHANGELOG.md` y prepara la rama/PR según §6"*. Mantén este archivo
> actualizado cuando cambie una decisión.

- **Owner:** Jonathan Lema — Manager Open Business, Minsait (Open Finance & MMPP)
- **Audiencia:** consultores de negocio (LATAM + España). Autoformación / demos internas.
- **Última actualización:** 19 julio 2026
- **Estado:** arranque de proyecto (Fase 0 · MVP)

---

## 1. Qué construimos y por qué

El producto es una **plataforma que recorre el embudo de implementación de un caso de uso Open Finance** (Discovery → PoC → MVP → Producción → Evolutivos). No son módulos sueltos: son **etapas de un mismo recorrido** que se pasan datos hacia delante y hacia atrás.

**El Assessment es la columna vertebral: una radiografía única y viva por entidad**, independiente del caso de uso (hoy es el HTML de 11 pestañas: Cliente → Levantamiento → As-Is → Stack & GAPs → Iniciativas → Roadmap → Célula → BAU → Monetización → Business Case → SaaS vs In-house). Sobre esa radiografía se **simulan N casos de uso**, y cada uno calcula su *delta*: qué APIs, qué necesidades tecnológicas/equipo y cuánta **inversión** hay que justificar ante C-Level (`necesidades = f(casoDeUso, entidad)` = lo que el caso pide − lo que la entidad ya tiene). El API Designer genera las APIs, el API Lab las prueba (Sandbox as a Service o conectado al del cliente), y sus resultados **refinan los diseños y actualizan el roadmap y la inversión** de la entidad.

Ese cálculo del *delta* y el entendimiento (GAPs, dependencias) es trabajo de **agentes**, hoy servidos como **mocks realistas** vía el adaptador `agents.js`, mañana Azure Function → Azure OpenAI (§8). Ver modelo de dominio en §5.4 y el mapa de agentes en `docs/contratos-agentes.md`.

**Objetivo del MVP (Fase 0):** exponer el Assessment a internet para que el equipo (~20 personas) y terceros invitados lo usen. **Se entrega un LINK y con eso basta.** El resto de etapas se van integrando sobre esa base.

**Restricción de producto innegociable:** *"abre la URL y funciona"*. Audiencia de negocio, no técnica. **Nada de pasos previos**: sin instalar, sin descargar, sin terminal, sin build.

---

## 2. Modelo de acceso por fases (IMPORTANTE — leer antes de tocar auth)

| Fase | Acceso | Qué implica |
|------|--------|-------------|
| **Fase 0 · MVP (ahora)** | **Link abierto, SIN login.** Cualquiera con el enlace entra a ver la demo. | No hace falta backend ni Supabase. Solo GitHub Pages + `localStorage`. **Solo datos demo/ficticios.** |
| **Fase 2** | **Correo + contraseña** como primer filtro de seguridad. | Supabase Auth (email/password). NO tiene por qué atarse a la cuenta Minsait; es una barrera básica. Restringir a `@minsait.com` es **opcional**, solo si sale fácil. |

> Consecuencia: en el MVP, que la GitHub Pages sea **pública es aceptable e incluso deseable**
> (el objetivo es repartir el link libremente). El control de acceso llega en Fase 2 vía login,
> no vía privacidad del repo. Por tanto la duda "¿la org es Enterprise?" deja de ser bloqueante.

---

## 3. Decisiones cerradas

| # | Decisión | Razón |
|---|----------|-------|
| D1 | **Hosting: GitHub Pages** (repo Minsait). | Jonathan ya tiene cuenta GitHub Minsait; Azure no es viable a corto plazo. Cero coste. Sirve HTML estático tal cual. |
| D2 | **MVP sin autenticación**: link abierto, `localStorage`, datos demo. | El objetivo del MVP es repartir un link y que la gente vea la demo sin fricción (§2). |
| D3 | **Fase 2: Supabase Auth con email + contraseña.** Vínculo a `@minsait.com` opcional. | Primer filtro de seguridad ligero sin depender del tenant corporativo. Free tier sobra. |
| D4 | **Solo datos demo / anonimizados** mientras el almacenamiento esté fuera del tenant Indra (GitHub / Supabase). | Los datos son de clientes bancarios. Nada confidencial real hasta migrar a Azure o con visto bueno de IT. |
| D5 | **Sin backend propio ni LangChain por ahora.** | La herramienta es cálculo/estimación. La IA es Fase 3 y, cuando llegue, **llamada directa a Azure OpenAI**, no LangChain (§8). |
| D6 | **Commits los hace Jonathan desde VS Code** (con Copilot). Claude entrega archivos + resumen de cambios. | Control del owner; el puente no tiene salida a internet, el `push` sale del IDE. Flujo en §6. |
| D7 | **Buildless.** Sin bundler, framework ni compilación. HTML + CSS + JS (módulos ES) servidos tal cual. | Preserva "abre y funciona" y hace trivial el deploy en GitHub Pages. |
| D8 | **Plataforma única por etapas del embudo**, no productos sueltos. Monorepo modular (`core/`, `stages/`, `agents/`). | El assessment, el API Designer y el API Lab son etapas de un mismo recorrido que comparten datos (§5.4). |
| D9 | **Modelo de dominio en dos niveles:** Entidad (radiografía única) + Casos de Uso (colección aparte por `entidadId`). Dependencias como **grafo**. | El assessment es un mapa vivo de la entidad; los casos de uso se simulan encima. Un caso puede tener ecosistema propio de APIs y pantallas → colección aparte. |
| D10 | **Agentes tras un adaptador `agents.js`** (gemelo de `storage.js`). Hoy **mocks realistas**; mañana Azure Function → Azure OpenAI, misma firma. | Permite construir el recorrido end-to-end sin backend y sustituir a real cambiando una línea. Sin LangChain (D5). |
| D11 | **Licencia propietaria** (© Minsait/Indra, todos los derechos reservados; ver `LICENSE`). Repo **público solo durante la demo**, luego **privado**. | Es IP corporativa (herramienta + metodología `KB`). "Link abierto" ≠ open-source. Nada de MIT/Apache/GPL. Al pasar a privado, Pages desde repo privado requiere plan de pago de GitHub (verificar). Validar con legal/OSS de Indra. |

---

## 4. Arquitectura objetivo

**Fase 0 (MVP) — plataforma buildless con mocks:**
```
Navegador → GitHub Pages → index.html (portal/recorrido)
                             ├─ core/domain (Entidad, CasoDeUso)
                             ├─ core/storage.js  → localStorage
                             ├─ core/agents.js   → mocks realistas (agents.mock.js)
                             └─ stages/ (assessment, api-design, api-lab)
```
Sin login, sin servidor, sin nube de datos. Se reparte el link.

**Futuro — mismos contratos, backend real:**
```
Navegador ─(login Supabase)─► GitHub Pages (front)
   core/storage.js → Supabase / Azure (persistencia por usuario)
   core/agents.js  → Azure Function → Azure OpenAI (GAPs, refinamiento, roadmap)
```
Los adaptadores `storage.js` y `agents.js` no cambian su interfaz: solo su implementación.

### 4-bis. Arquitectura previa (referencia)

**Fase 0 (MVP):**
```
Navegador  →  GitHub Pages  →  index.html + css + js  (estático, buildless, localStorage)
```
Sin login, sin servidor, sin nube de datos. Se reparte el link.

**Fase 2 (login + guardado por usuario):**
```
Navegador ─(login email/contraseña)─►  GitHub Pages (front)
                                              │  (cliente JS de Supabase, vía CDN)
                                              ▼
                                        Supabase
                                          ├─ Auth      → email + password
                                          └─ Postgres  → tabla `assessments` (jsonb) + RLS
```
`localStorage` se mantiene como caché/offline; Supabase pasa a ser la fuente por usuario.

---

## 5. Modelo de datos actual y refactor recomendado

### 5.1 Cómo persiste hoy (punto de partida)
Lógica concentrada en pocas funciones — se **envuelve**, no se reescribe la herramienta:

- `let S = defaultState();` — estado global del assessment en curso.
- `defaultState()` / `normalize()` — esquema por defecto y saneamiento al cargar.
- `const LSKEY = ...` — clave de `localStorage`.
- `store()` → diccionario `{ nombreCliente: S }`; `guardar()` vuelca `S`; `cargarCliente(n)` recupera.
- `exportJSON()` / `importJSON()` — portabilidad manual. `TARIFAS`, `PRESETS_SAAS` — constantes de negocio.

Cada "cliente" es un assessment completo (un objeto `S`). Migrar a la nube = mover ese diccionario a una tabla conservando la forma de `S`.

### 5.2 Refactor (criterio técnico): cambio mínimo + adaptador de almacenamiento
No reescribir. Separar el monolito e introducir una **capa de almacenamiento intercambiable**:

```
/ (raíz del repo)
├─ index.html            # estructura + contenedores; enlaza css/js
├─ assets/styles.css     # el <style> actual
├─ src/
│  ├─ state.js           # defaultState(), normalize(), TARIFAS, PRESETS_SAAS
│  ├─ ui.js              # tab(), renderAll(), render por pestaña
│  ├─ storage.js         # ⭐ ADAPTADOR: interfaz list/load/save/remove
│  ├─ storage.local.js   # implementación localStorage (Fase 0)
│  ├─ storage.cloud.js   # implementación Supabase (Fase 2)
│  └─ auth.js            # login email/contraseña (Fase 2)
├─ kb/                    # KB_01..KB_05 .md (conocimiento; RAG en Fase 3)
├─ CHANGELOG.md
├─ DECISIONES_Y_ARQUITECTURA.md
└─ README.md
```

> Aceptable mantener un solo `app.js` en Fase 0 y trocear en Fase 2. Lo esencial es aislar `storage.js`.

```js
// storage.js — la herramienta solo conoce esta interfaz, agnóstica de dónde viven los datos
export const Storage = {
  async list(),            // → [{nombre, updatedAt}]
  async load(nombre),      // → objeto S
  async save(nombre, S),   // persiste
  async remove(nombre),    // borra
};
```
Fase 0: `Storage` = `localStorage`. Fase 2: `Storage` = Supabase. **La herramienta no cambia**, solo el adaptador (las llamadas pasan a `await`).

### 5.3 Tabla Supabase (Fase 2)
```
assessments
  id          uuid pk default gen_random_uuid()
  owner       uuid → auth.users(id)
  cliente     text            -- nombre del assessment
  data        jsonb           -- el objeto S completo
  updated_at  timestamptz default now()
  -- RLS: cada usuario ve/edita lo suyo (lectura compartida al equipo, por decidir)
```
> Nota (D9): en el modelo de dos niveles, `assessments` pasa a ser `entidades` + una tabla
> `casos_de_uso` con FK a `entidades(id)`. La forma de `S` se conserva dentro del `jsonb`.

### 5.4 Modelo de dominio en dos niveles (D8/D9) — vigente

**Entidad (radiografía única por entidad · `core/domain/entidad.js`):** As-Is, stack, BAU, células, líneas de monetización y un **grafo de dependencias** (nodos = capacidad/servicio/core/canal/equipo; aristas = dependencia técnica/organizativa/equipo con estado satisfecha/bloqueante/riesgo). Agrega el roadmap y la inversión que le escriben los casos de uso.

**Caso de Uso (colección aparte por `entidadId` · `core/domain/casoDeUso.js`):** se simula contra la entidad. Campo `naturaleza` distingue en discovery:
- `embedded-finance-baas` → **solo APIs** (canal ya habilitado, delta pequeño).
- `caso-de-uso-completo` → **APIs + frontal propio + complejidad** (delta grande).

Guarda su ecosistema (`apis[]`, `pantallas[]`), el **delta** calculado por el agente (`necesidades`: apisNecesarias, necesidadesTecnologicas, necesidadesEquipo, gaps, dependencias), los `labResults` y la `inversionIncremental` (con devengo) que justifica ante C-Level.

**Adaptador de agentes (`core/agents.js`):** 7 servicios con firma estable — `marketDiscovery`, `gapsYDependencias` ⭐, `diseñarAPI`, `construirAPI`, `enriquecerAPI`, `refinarAPI` ⭐, `actualizarRoadmap` ⭐. Contratos input/output en `docs/contratos-agentes.md`. Hoy `agents.mock.js`; mañana Azure.

---

## 6. Flujo de trabajo (Claude ↔ VS Code ↔ GitHub)

**Reparto de roles:** Claude diseña y entrega archivos + un resumen de cambios. Jonathan, en VS Code (con Copilot), revisa el diff, documenta en `CHANGELOG.md`, commitea en una rama de feature y abre PR a `develop`.

- **Modelo de ramas (GitFlow simplificado):** `main` = solo lo demoable (es lo que despliega Pages; cada merge lleva **tag de versión** `v0.x.0` y versiona el CHANGELOG). `develop` = rama de integración, siempre en estado funcional. **Una feature = una sesión = una rama** (`feat/…`, `fix/…`, `refactor/…`, `chore/…`, `docs/…`) que nace de `develop` y se borra al mergear. Cada feature tiene su *Definition of Done* (ver `docs/plan-de-trabajo.md`); al ser buildless, la prueba es abrir `index.html` en local antes de mergear. Si entra otra persona: mismas reglas, cada uno sus ramas de feature + revisión de PR.
- **Commits:** convención *Conventional Commits* → `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- **CHANGELOG:** formato *Keep a Changelog*; las novedades se anotan bajo `## [Unreleased]` y se cierran en una sección con versión y fecha al promocionar a `main`.
- **PR de feature → `develop`:** descripción con *qué cambia · por qué · cómo probar*. Al mergear, la rama de feature se borra.
- **Promoción `develop` → `main`:** solo cuando lo integrado es demoable. Se cierra el bloque `[Unreleased]` del CHANGELOG como `## [0.x.0]`, se mergea y se etiqueta con `v0.x.0` → Pages se re-despliega solo.
- **Cada entrega de Claude incluirá:** lista de archivos tocados + un texto de resumen listo para el mensaje de commit y la entrada de CHANGELOG, para que Copilot solo lo pegue/ajuste.

---

## 7. (reservado — futuras notas de operación)

---

## 8. LangChain: por qué NO (por ahora)

Para una llamada única a un LLM, LangChain es sobreingeniería: una llamada directa a Azure OpenAI es más simple y mantenible. LangChain/LangGraph solo se justifica con **agentes multi-paso, orquestación de herramientas o RAG con varios recuperadores**. Empezar directo; migrar el día que la complejidad lo pida.

---

## 9. Azure — estado y camino a futuro

Destino a futuro (datos reales in-tenant), no vía de arranque. Indra ya tiene tenant; falta **suscripción** + permisos (comprobar en `portal.azure.com → Suscripciones` y rol en `entra.microsoft.com`; probablemente **ticket a IT/Cloud CoE**). Cuando exista: migrar a **Azure Static Web Apps (Free) + Entra ID + Functions + Cosmos/SQL** reutilizando el adaptador `storage.js` (§5.2) sin tocar la herramienta.

---

## 10. Plan por fases (tareas para Copilot)

### Fase 0 — MVP: publicar el HTML, link abierto (ahora)
- [ ] Crear repo (p. ej. `openfinance-assessment`) en GitHub Minsait, con `main`.
- [ ] `index.html` en la raíz (el HTML actual). `KB_01..KB_05` → `/kb`. Añadir `CHANGELOG.md`, `README.md`, este MD.
- [ ] Activar Pages: *Settings → Pages → Deploy from a branch → `main` / root*.
- [ ] Verificar la URL y **repartir el link**. Solo datos demo.

### Fase 2 — Login email/contraseña + guardado por usuario
- [ ] Proyecto Supabase (Free) + tabla `assessments` con RLS (§5.3).
- [ ] Refactor §5.2: extraer `storage.js` + `storage.local.js`.
- [ ] `auth.js`: pantalla de login (email + contraseña) antes de la herramienta. (`@minsait.com` opcional.)
- [ ] `storage.cloud.js`: cliente Supabase (CDN). Migrar `guardar/cargarCliente` a `await Storage.*`. Mantener export/import JSON.

### Fase 3 — Capa de IA (cuando haya caso claro)
- [ ] Primer caso (p. ej. resumen ejecutivo del Business Case, o copiloto de assessment con RAG sobre `/kb`).
- [ ] Implementar con **Azure Function → Azure OpenAI** (§8). Conecta con la Fase 2 RAG de OBTA.

---

## 11. Pendientes / decisiones abiertas

- Nombre definitivo del repo y de la herramienta pública.
- En Fase 2: ¿los assessments se comparten a todo el equipo (lectura común) o cada uno ve solo los suyos? (afecta RLS).
- En Fase 2: ¿restringimos el alta a `@minsait.com` o abierto a cualquier email? (D3 lo deja opcional).
- Primer caso de uso concreto de IA (dispara la Fase 3).
