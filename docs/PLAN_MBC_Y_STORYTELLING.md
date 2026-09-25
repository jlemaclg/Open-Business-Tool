# Open Business Accelerator · Identidad MBC, storytelling de venta y plan de trabajo

> Análisis y plan para convertir la plataforma en una **herramienta de venta** de la práctica Open Business: identidad MBC en todo el recorrido, home que cuenta la tipología de proyectos y soluciones, biblioteca de demos alimentando el Discovery, repositorio de agentes inventariado y gobernado, y refinado visual de los módulos.
> Fecha: 25-09-2026 · Owner: Jonathan Lema · Complementa `DECISIONES_Y_ARQUITECTURA.md` (fuente de verdad; decisiones D12–D16) y `plan-de-trabajo.md` (tramos F14–F24).

---

## 0. Resumen ejecutivo

La plataforma funciona (v0.2.0 pública, 6 módulos, dominio y agentes mock) pero **cuenta un mapa de herramienta, no una propuesta de valor**. El home enumera módulos; un cliente necesita entender *qué tipos de proyecto hacemos, qué le entregamos en cada uno y por qué somos rápidos* (método propio + agentes + evidencia de casos probados).

Tres movimientos, en este orden:

1. **Identidad MBC en todo el repo** (una rama, una release): tokens compartidos, Montserrat, logo MBC, barra de navegación y cabeceras. Deja el terreno limpio para que todo lo demás nazca ya en MBC.
2. **El home como pieza de venta**: cuatro tipologías de proyecto (Entender · Descubrir y decidir · Diseñar y gobernar · Probar y devengar), la capa transversal de Gobierno, la biblioteca de demos como evidencia y el repositorio de agentes como prueba de "cómo lo tenemos montado".
3. **Cerrar el flujo Discovery → Inventario → Diseño** con tres piezas que hoy faltan: viabilidad temprana del caso (cruce con el inventario), marcado explícito de *dónde actúa un agente y dónde es determinista*, y exportación de requerimientos de negocio para el traspaso a equipos técnicos.

Estimación: **11 features en ~11 sesiones** (una por rama), con dos releases intermedias (v0.3.0 identidad · v0.4.0 storytelling completo).

---

## 1. Diagnóstico

### 1.1 Estado del repo (25-09-2026)

| Aspecto | Situación | Implicación |
|---|---|---|
| Ramas | Local en `feat/designer-entrada-y-versionado` (commit `3d4e7b6`, ya en origin, **sin mergear a `develop`**). `develop` = v0.2.0 + link-preview. `main` = v0.2.0. | Primer paso: PR de esa rama a `develop` y cerrar F-Designer-entrada antes de abrir la identidad. |
| Working tree | 36 ficheros "modificados" por **ruido de fin de línea (CRLF)**: 8.044 líneas cambiadas, 12 reales. Cambios reales sin commit en `stages/3-api-lab/index.html` y `lab-loop.js` (header sticky retirado, panel inyectado en `.main-area`). | Añadir `.gitattributes` (`* text=auto eol=lf`) y renormalizar en un `chore/` aparte; commitear el fix del API Lab reconciliado (la copia local **quita el favicon y reintroduce un emoji 💡**: hay que conservar el favicon y no el emoji). |
| Identidad Minsait antigua | 16 ficheros con hex `#4F062A / #FF0054 / #260717` y `Georgia` (enrichment 32 ocurrencias, assessment 21+19, designer 18, lab 16+13, discovery 15+10, home 12, nav 9…). Cada página lleva **su propio `:root`**; no hay hoja de tokens compartida. `favicon.svg` y `og-card.png` también son Minsait. | La migración es mecánica pero transversal: primero tokens, después sustitución fichero a fichero. |
| Emojis | Quedan emojis en tabs/textos de `api-designer.html`, `enrichment.html`, `api-lab/index.html` (📊 🔌 👥 📈 🚀), `market-discovery/index.html`. | Contra la norma (iconos SVG inline). Se limpian en la misma pasada de identidad. |
| Demos | No existe `demos/` en el repo. La demo `uy-mandato-debito-precargado-push` (handoff del 25-09) está lista fuera del repo, ya en MBC, con nombre de cliente real. | Crear la biblioteca (`demos/` + `catalog.js` + `demos/index.html`) y el mecanismo de **demos protegidas** antes de subir material de cliente (§4). |
| Agentes | 7 servicios en `core/agents.mock.js` con contratos en `docs/contratos-agentes.md`; definiciones dispersas en `agents/*.agent.md` y `.github/agents/*` (F10 pendiente). **No hay ninguna vista** del repositorio de agentes. | F10 se absorbe en la feature del repositorio de agentes (§5). |
| Políticas de gobierno | Página completa (`governance-policies.html`, 8 reglas GOV-*) pero enlazada como un texto secundario "Políticas" en la barra y sin nodo en el home. | Debe ser una **capa transversal visible** (home, barra y chips "políticas aplicadas" en cada módulo) y cubrir también a los agentes. |
| API Lab | Header propio `position:sticky` que se montaba sobre la barra `obx-nav` al navegar (captura de Jonathan). Fix hecho en local, sin commit. | `fix/api-lab-header` (ver 1.1 working tree). |
| Documentación | `DECISIONES_Y_ARQUITECTURA.md` fechado 19-jul; `plan-de-trabajo.md` termina en F13; las instrucciones del proyecto de Claude aún dicen "estética Minsait (morado, rosa, Georgia)". | Se actualizan en esta entrega (D12–D16, F14–F24). **Pendiente de Jonathan:** editar las instrucciones del proyecto de Claude (restricción 5) para que digan identidad MBC. |

### 1.2 Qué cuenta hoy el home y qué debería contar

Hoy: hero "Del discovery al despliegue…", recorrido de 6 nodos con pregunta, "cómo funciona" en 3 pasos y 5 outcomes. Es correcto como mapa, pero:

- No distingue **tipologías de proyecto** (assessment, discovery de monetización, diseño/gobierno de APIs, validación) ni qué se lleva el cliente de cada una.
- No enseña **dónde actúa un agente y dónde es método determinista** nuestro; para un cliente esa es la diferencia entre "una demo con IA" y "una práctica con método".
- No hay **evidencia**: casos de uso ya trabajados y probados (las demos) no aparecen.
- El **gobierno** (de APIs y de agentes) no es visible, y es lo que da confianza a un banco.
- Visualmente: hero denso, 5 franjas de color oscuro, tipografía serif. La línea de las demos (fondo claro, tarjetas blancas, azul oscuro + eléctrico, Montserrat) es más limpia y es la que se adopta.

---

## 2. Storytelling: cómo se cuenta la plataforma

### 2.1 La frase

> **Abrimos la entidad financiera a terceros con visión de startup y experiencia de gran banca.**
> Cuatro enfoques de proyecto en Open Finance, Embedded Finance y BaaS, ejecutados por consultores 4.0 con la IA generativa en el ADN; soluciones que nacen sin deuda técnica y alineadas con la regulación vigente.

**Mensajes de marca (revisados con Jonathan, 25-09-2026):**

- **No vendemos un producto: mostramos nuestros enfoques de proyecto** para generar impacto en la entidad. La plataforma es *la herramienta con la que lo ejecutamos*, nunca el protagonista del mensaje. Evitar "tipos de proyecto sobre una plataforma".
- **Consultores 4.0 con la IA generativa en el ADN**: identifican oportunidades de mejora en procesos manuales para aumentar el impacto del proyecto. La IA se cuenta como "dónde acelera" (antes / con consultoría 4.0), no con nombres técnicos de servicios.
- **Visión y mentalidad de startup con la experiencia de grandes entidades financieras.**
- **Sin deuda técnica desde el día uno** y **alineados con los marcos regulatorios vigentes** (la regulación entra como regla de diseño, no como revisión final).

Nombres de los enfoques en la UI: **01 Diagnóstico y hoja de ruta · 02 Descubrimiento y monetización · 03 Diseño y gobierno de APIs · 04 Validación con el ecosistema** (equivalen a las tipologías de la tabla 2.2).

### 2.2 Los cuatro enfoques de proyecto (el hilo del home y de la barra)

| # | Tipología (lo que vende la práctica) | Pregunta del cliente | Qué entregamos | Módulos que lo soportan | Dónde actúa un agente / dónde es determinista |
|---|---|---|---|---|---|
| 1 | **Entender la entidad** | ¿Dónde estoy y qué me falta para abrir mi arquitectura a terceros? | Set up de la entidad: As-Is, stack, GAPs, dependencias, roadmap e inversión. | 01 Assessment | **Determinista:** método y KB propios (levantamiento, scoring, business case). **Agente:** `gapsYDependencias` calcula el delta de cada caso contra el set up. |
| 2 | **Descubrir y decidir la monetización** | ¿Qué caso de uso tiene mercado, para quién, y es viable con lo que tengo? | Caso de uso priorizado con audiencia, requerimientos del producto, **viabilidad temprana** y **paquete de requerimientos de negocio** exportable. | 02 Discovery + biblioteca de demos | **Determinista:** repositorio de casos probados, reglas de viabilidad contra el inventario, plantilla de requerimientos (nuestra información + la del cliente). **Agente:** `marketDiscovery` (audiencias sintéticas, propensión, TAM/SAM/SOM) y refinado de la descripción del caso. |
| 3 | **Diseñar y gobernar las APIs** | ¿Qué reutilizo, qué extiendo y qué construyo, y cómo lo mantengo en estándar? | Inventario cruzado con el caso, APIs diseñadas en ISO 20022, versionadas y conformes a políticas. | 03 Inventario · 04 Designer · 05 Gestión & Versionado · Políticas | **Determinista:** inventario, políticas GOV-*, pipeline ISO 20022 por capas, SemVer. **Agente:** `diseñarAPI`, `construirAPI`, `enriquecerAPI` (propuesta y mapeo; siempre revisada contra políticas). |
| 4 | **Probar y devengar** | ¿Funciona con partners reales y qué le cuento al comité? | APIs validadas en sandbox, refinamientos y business case actualizado. | 06 API Lab → bucle al Assessment | **Determinista:** sandbox, métricas, devengo. **Agente:** `refinarAPI`, `actualizarRoadmap`. |

Capa transversal (no es una etapa, está debajo de todas): **Gobierno** — políticas de APIs y de agentes, versionadas y citables — y el **Repositorio de agentes**, cada uno inventariado como una API (contrato de entrada/salida, owner, versión, políticas que cumple).

### 2.3 Convención "agente vs determinista" (D15)

Se marca en toda la UI, siempre igual, para que en la demo se pueda señalar con el dedo:

- Chip **"Agente"** (icono chispa, fondo `--mbc-electric-soft`, texto `--mbc-navy`): el paso lo produce un agente; lleva el nombre del servicio (`marketDiscovery`, `gapsYDependencias`…) y, mientras sea mock, el banner "datos simulados".
- Chip **"Método MBC"** (icono engranaje, fondo `--mbc-ceramic`, texto `--text`): paso determinista construido y adaptado por nosotros con nuestra información + la del cliente (KB, reglas, plantillas, cálculos).
- Chip **"Híbrido"** cuando el agente propone y una regla determinista valida (p. ej. Designer → políticas).

Se define como componente en `assets/mbc-tokens.css` (F14) y se aplica en cada módulo a partir de F16.

### 2.4 Guion de demo (10 minutos)

1. **Home (1')** — la frase, las cuatro tipologías, dónde entran agentes, la evidencia (3 demos destacadas) y el gobierno.
2. **Assessment (2')** — set up de una entidad ficticia: GAPs y dependencias; el agente calcula el delta de un caso. *Señalar chip Agente vs Método.*
3. **Discovery (3')** — elegir un caso del repositorio (abre la demo del caso como evidencia), audiencia sintética, requerimientos del producto, **semáforo de viabilidad** contra el inventario y **exportar el paquete de requerimientos de negocio**.
4. **Inventario → Designer (2')** — el inventario ya sabe qué APIs del caso son reutilizables / a extender / nuevas; el Designer arranca precargado y sus artefactos se ven como en la demo (pantalla + Backend/Secuencia).
5. **Gobierno y agentes (1')** — políticas aplicadas en el diseño; repositorio de agentes: "esto también está inventariado y gobernado".
6. **API Lab (1')** — validación con partners y el bucle al business case.

---

## 3. Home comercial: estructura (F16 · implementada, revisada 25-09)

> Implementado: hero con la frase de 2.1 y panel "Nuestra diferencia" → enfoques (pregunta, impacto, módulo) → Consultoría 4.0 (pilares + "Dónde acelera la IA") → casos probados → gobierno → la plataforma (recorrido 01–06). Los chips Agente/Método/Híbrido de D15 se quedan en los módulos, no en el home. La estructura original se conserva abajo como referencia.

Identidad MBC, fondo claro, una sola columna de contenido `max-width 1240px`, sin `min-width:1280px` (hoy el home no es responsive).

1. **Cabecera compacta** (componente 7.1 de `copilot-instructions_identidad-MBC.md`): "Open Business Accelerator" + una frase + logo MBC en su columna.
2. **Hero corto**: la frase de 2.1 con destacado en azul eléctrico, dos CTAs (`Ver el recorrido` · `Ver demos`).
3. **"Qué hacemos" — 4 tarjetas de tipología** (tabla 2.2): pregunta del cliente, entregable, módulos (enlaces) y el par de chips Agente / Método.
4. **"Dónde entra un agente"** — la línea de tiempo de 4 etapas del formato del cliente (imagen de referencia), adaptada: por etapa, los agentes y los pasos deterministas con sus chips. Enlaza al repositorio de agentes.
5. **"Casos que ya hemos probado"** — 3 tarjetas de la biblioteca de demos (leídas de `demos/catalog.js`, sin duplicar datos) + enlace a la biblioteca completa.
6. **"Gobierno desde el primer artefacto"** — banda `--mbc-ceramic` con las políticas de APIs y de agentes y las cifras (8 reglas GOV-*, N agentes gobernados).
7. **Recorrido numerado 01–06** como pie navegable (sustituye al hero actual de nodos; conserva el bucle Lab → Assessment).
8. Pie con logo MBC azul.

Copy: reglas vigentes (sin "Minsait" en la UI, "set up de la entidad", cero emojis, "Apunte experto" para conclusiones). El logo MBC sí aparece (es la marca).

---

## 4. Biblioteca de demos y demos protegidas (F17 · D13)

**Estructura** (según la skill `mbc-ux-demos`): `demos/index.html` (biblioteca con filtros dominio/tipo/audiencia), `demos/catalog.js` (una entrada por demo), `demos/<slug>/index.html` (autocontenida, sin `nav.js`, con enlace "← Biblioteca de demos" en el hero). El hub añade "Demos" a la barra y el Discovery enlaza cada caso del catálogo con su demo (`demoSlug` en el catálogo de casos).

**Excepción para demos de cliente (decisión de Jonathan, 25-09):** una demo que nombra a un cliente real puede entrar en el repo **solo protegida por contraseña**. Cómo se hace sin backend y sin que sea un adorno:

| Opción | Qué protege realmente | Veredicto |
|---|---|---|
| Puerta de contraseña en JS (comparar y mostrar) | Nada: el HTML completo viaja en claro; "ver código fuente" lo salta. | Descartada. |
| **Cifrado del fichero (AES-GCM, WebCrypto)** — la demo se guarda como `demos/<slug>/index.html` que contiene solo un desbloqueo (campo de contraseña) y el contenido cifrado; la clave se deriva de la contraseña (PBKDF2) y se descifra en el navegador. | El contenido en el repo y en Pages está cifrado; sin contraseña no se lee. Buildless para el sitio: el cifrado lo hace un script de un solo uso (`tools/proteger-demo.py`) **antes** del commit. | **Adoptada.** Contraseña compartida fuera de banda (Teams/voz), una por cliente, rotable regenerando el fichero. |
| Login Supabase (Fase 2) | Control real por usuario. | Destino futuro; no bloquea. |

Reglas que acompañan la excepción:

- **Nunca commitear la versión en claro** de una demo de cliente (ni en rama, ni en `develop`): el historial de git es público. El script produce el fichero cifrado y la fuente en claro queda fuera del repo (carpeta local o `_private/` ignorada por `.gitignore`).
- `catalog.js` marca `acceso: 'protegida'`; la tarjeta muestra candado y el texto "Demo de cliente · acceso con contraseña". El título y el resumen del catálogo también son anonimizados (la tarjeta se ve sin contraseña).
- El aviso legal del pie de cada demo protegida: "Material de propuesta, uso restringido".
- La demo de Urutec entra por este camino con `geografia: 'UY'`, `marco: 'Transferencias de débito sobre SPI · MVP DIC 2026'`, `version: '0.2.0'`, `acceso: 'protegida'`.

---

## 5. Repositorio de agentes (F20 · D14)

Referencia visual: el catálogo del cliente (capturas): filtros por etapa con contador, tarjetas con icono, tipo (copilot / gems / notebooks), nombre, descripción, "Ver ficha"; y la sección "Dónde entra un agente" con línea de tiempo por etapa. Se adapta a MBC y a nuestro dominio:

- **Página** `stages/agentes/index.html` (o `agents/index.html`; se decide en la feature) con `data-current="agentes"` en la barra.
- **Datos** en `assets/agents-data.js` (misma idea que `inventory-data.js`): una entrada por agente con `id`, `nombre`, `etapa` (Entender · Descubrir · Diseñar y gobernar · Probar), `tipo` (`agente` · `determinista` · `híbrido`), `plataforma` (Azure OpenAI vía Function · Copilot · mock), `servicio` (método de `core/agents.js`), `contrato` (input/output de `docs/contratos-agentes.md`), `politicas` (IDs AGT-*), `owner`, `version`, `estado`.
- **Ficha** de cada agente = **como una API del inventario**: endpoint lógico (`Agents.gapsYDependencias`), contrato request/response, versión SemVer, owner, ciclo de vida, políticas aplicadas, y enlace al módulo donde actúa. Con eso se cumple "también está inventariado como un API y tiene un gobierno".
- **Filtros** por etapa y por tipo (Agente / Método / Híbrido) reutilizando los chips de D15.
- Absorbe **F10**: una única fuente de definiciones en `agents/` (los `.agent.md` de `.github/agents` se referencian, no se duplican).

---

## 6. Gobierno transversal (F21)

- `governance-policies.html` pasa a tener **dos pestañas**: *Políticas de APIs* (las 8 GOV-* actuales) y *Políticas de agentes* (los guardrails AGT-* que ya existían en el espacio: fuentes, citación obligatoria, prohibido inventar, human-in-the-loop, auditoría, datos y gobierno del cambio).
- **Protagonismo**: nodo propio en el home (§3.6), entrada "Gobierno" con icono en la barra (no un texto secundario), y en cada módulo un bloque "Políticas aplicadas en este paso" con chips que enlazan a la regla.
- El Designer y Gestión & Versionado ya evalúan GOV-*; el Discovery y el repositorio de agentes pasan a citar las suyas.

---

## 7. Flujo Discovery → Inventario → Diseño (F18 · F19 · D16)

**Discovery (F18)**

1. Caso de uso: del repositorio (con enlace a su demo) o propio. Chip Método.
2. Audiencia sintética: chip Agente (`marketDiscovery`), banner simulado.
3. Requerimientos del producto: plantilla determinista (nuestra info + la del cliente) que el agente rellena en borrador y el consultor edita. Chip Híbrido.
4. **Viabilidad temprana** (nuevo): semáforo determinista que cruza las APIs que pide el caso con `OBA_INVENTORY` y con los GAPs del Assessment → *Reutilizable · Extender · Nueva · Sin capacidad*. Sale con una lectura: "el caso es viable con 2 APIs existentes y 1 extensión; la API de consentimiento es nueva".
5. **Exportar requerimientos de negocio** (nuevo): botón que genera el *paquete* (Markdown + JSON) con caso, audiencia, requerimientos, viabilidad, APIs y políticas aplicables — para pasarlo al equipo que escribe los requerimientos técnicos. También se guarda en el estudio (`Storage.saveEstudio`) y el Designer lo consume como contexto (`?estudio=`).

**Inventario (F19)**

- Al entrar con `?caso=` o `?estudio=`, cada API del inventario se etiqueta respecto al caso (*reutilizable / a extender / no aplica*) y aparece la lista de *APIs nuevas* que ningún activo cubre. Es la misma clasificación que la viabilidad de Discovery (una sola función en `core/`, dos vistas).
- "Extender esta API" ya lleva al Designer; se añade "Diseñar nueva" para las que no existen.

---

## 8. Refinado visual de Designer y Gestión & Versionado (F22 · F23)

Patrón de la demo (`index_1.html`): pantalla protagonista, botones **Backend / Secuencia** que abren un panel lateral con el payload o el diagrama de secuencia SVG del paso; tarjetas blancas, chips de estado, panel técnico oscuro para código.

- **Designer (F22):** el flujo pasa a 4 pasos visibles (Describir → Propuesta → Artefactos → Guardar en el caso) con la barra de pasos de la demo; los artefactos (diccionario, diagrama del modelo, OpenAPI, JSON Schema, reporte) se presentan como pestañas dentro de una única tarjeta; nuevos modelos de datos ISO 20022 a incorporar los define Jonathan al abrir la feature (la KB va aparte). Diagrama del modelo en SVG con la línea de la demo. Sin emojis en pestañas.
- **Gestión & Versionado (F23):** misma tarjeta de artefactos; la comparativa As-Is / To-Be con dos columnas y diff resaltado; el mini-strip de ciclo de vida con los chips de D15; la conformidad GOV-* como lista puntuada con enlace a la regla.

---

## 9. Plan de trabajo por features

Cadencia vigente: una feature = una sesión = una rama desde `develop`; PR a `develop`; `main` solo en releases. Detalle y DoD en `plan-de-trabajo.md`.

| Orden | Feature | Rama | Alcance | Sesiones |
|---|---|---|---|---|
| 0 | Cerrar lo abierto | PR `feat/designer-entrada-y-versionado` → `develop` · `fix/api-lab-header` · `chore/eol-gitattributes` | Mergear la feature pendiente; commitear el fix del header del Lab (con favicon, sin emoji); `.gitattributes` y renormalización para que el diff deje de ser ruido. | 0,5 |
| 1 | **F14 · Identidad MBC** | `refactor/hub-identidad-mbc` | `assets/mbc-tokens.css` (tokens + chips D15 + componentes), Montserrat, logo MBC inline, `nav.js` (estilos + entradas Demos / Agentes / Gobierno), home retintado sin cambiar estructura, 7 páginas de `stages/` + `lab-loop.js` + `estudios.js` + `gaps-dependencias.js` + `casos-de-uso.js` a tokens, favicon y og-card regenerados, emojis fuera. Criterio: el `grep` de la guía no devuelve nada. | 2 |
| 2 | **F15 · Release v0.3.0** | `chore/release-v0.3.0` | Identidad MBC publicada en Pages. | 0,5 |
| 3 | **F16 · Home comercial** | `feat/home-comercial` | Estructura §3. Lee `demos/catalog.js` si existe (degrada si no). | 1 |
| 4 | **F17 · Biblioteca de demos** | `feat/biblioteca-demos` | `demos/`, `catalog.js`, `demos/index.html`, `tools/proteger-demo.py`, `.gitignore` para `_private/`, demo Urutec protegida, "Demos" en la barra. | 1 |
| 5 | **F18 · Discovery: viabilidad y exportación** | `feat/discovery-viabilidad-export` | §7 Discovery. Función de clasificación en `core/` (`viabilidad.js`). | 1,5 |
| 6 | **F19 · Inventario cruzado con el caso** | `feat/inventario-cruce-caso` | §7 Inventario, misma función de `core/`. | 1 |
| 7 | **F20 · Repositorio de agentes** | `feat/repositorio-agentes` | §5 + absorbe F10. | 1,5 |
| 8 | **F21 · Gobierno transversal** | `feat/gobierno-transversal` | §6. | 1 |
| 9 | **F22 · Designer: flujo y artefactos** | `refactor/designer-flujos` | §8. | 1,5 |
| 10 | **F23 · Gestión & Versionado visual** | `refactor/versionado-visual` | §8. | 1 |
| 11 | **F24 · Release v0.4.0** | `chore/release-v0.4.0` | Storytelling completo demoable. | 0,5 |

Después siguen F12 (Supabase, que además sustituye el cifrado de demos por login) y F13 (repo privado).

**Dependencias:** F16 puede ir antes que F17 (degrada sin catálogo) pero conviene hacerlas seguidas; F18 y F19 comparten `core/viabilidad.js` (F18 la crea); F20 antes que F21 (las políticas de agentes se citan desde las fichas); F22 y F23 son independientes del resto y pueden reordenarse si una demo con cliente lo pide.

---

## 10. Riesgos y decisiones abiertas

- **Confidencialidad en repo público:** la excepción D13 solo es válida con cifrado y sin versión en claro en el historial. Si alguna vez se sube en claro, la única corrección real es reescribir el historial (o dar la demo por pública).
- **Tamaño de las páginas:** `api-designer.html` (95 KB) y `enrichment.html` (78 KB) concentran CSS+JS inline; F22/F23 deberían extraer al menos el CSS a `assets/` sin cambiar la lógica (refactor mínimo, D7 se mantiene: sin build).
- **Nombre del área de agentes:** `stages/agentes/` (parte del recorrido) o `agents/index.html` (junto a las definiciones). Propuesta: `stages/agentes/` para que el enrutado de `nav.js` no cambie de patrón.
- **Modelos nuevos del Designer (F22):** Jonathan aporta la lista de modelos/dominios ISO 20022 a añadir al abrir la feature.
- **Instrucciones del proyecto de Claude:** actualizar la restricción 5 (estética Minsait → identidad MBC) y el listado de archivos de conocimiento (añadir este plan y la guía `copilot-instructions_identidad-MBC.md`).
