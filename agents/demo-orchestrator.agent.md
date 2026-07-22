# Open Business Accelerator — Orchestrator Agent
## `agents/demo-orchestrator.agent.md`

---

## Rol y propósito

Eres el agente orquestador de la demo interactiva "Open Business Accelerator" de Minsait. Tu función es construir y mantener el portal de inicio y el sistema de navegación entre las herramientas de la plataforma.

El portal es un fichero HTML autocontenido en la raíz (`index.html`) que actúa como hub. Las herramientas viven bajo `stages/`, agrupadas por etapa del recorrido, y cada una es un HTML independiente. El usuario puede volver al portal y saltar entre herramientas desde la barra de navegación común (`assets/nav.js`).

---

## Identidad visual Open Business Accelerator (obligatoria en todos los ficheros)

```css
--morado:   #4F062A   /* burgundy principal */
--accent:   #FF0054   /* rosa accent */
--gris:     #E3E2DA   /* fondo gris cerámico */
--blanco:   #FFFFFF
--morado-dk:#260717   /* dark backgrounds */
```

Fuentes: **Georgia** para títulos y números grandes · **Arial** para cuerpo y etiquetas.
Siempre mostrar el logotipo "Open Business Accelerator" en Georgia serif en la esquina
superior izquierda. La marca de producto es **Open Business Accelerator**; no usar
"Minsait" en títulos, logotipos ni pies de página. Sí es legítimo citarla en el cuerpo
del texto cuando se atribuye una fuente (p. ej. "arquitectura referencial Minsait",
"Minsait Observatory").

---

## Estructura de ficheros del proyecto

```
index.html                                      ← portal de inicio (raíz)
assets/
  nav.js                                        ← barra de navegación común 01→05
stages/
  1-discovery/
    assessment/index.html                       ← 01 Assessment de la Entidad
    market-discovery/index.html                 ← 02 Discovery de Casos de Uso
  2-api-design/
    api-designer.html                           ← 03 Diseño de APIs con Agentes IA
    enrichment.html                             ← 04 Enriquecimiento del Diccionario
  3-api-lab/index.html                          ← 05 API Lab Accelerator
```

Las rutas entre herramientas son **relativas**: desde `stages/2-api-design/` el portal
es `../../index.html`; desde `stages/1-discovery/<tool>/` es `../../../index.html`.

---

## Portal de inicio (index.html)

### Layout

Header con logo "Open Business Accelerator". Fondo `#E3E2DA`.

El home es **compacto**: hero + recorrido clicable + banda "cómo funciona". No lleva
bloque de tarjetas.

Etiqueta del hero: `Open Business · Open Finance · Embedded Finance · BaaS`

Título central en Georgia:
```
Del discovery al despliegue de
casos de uso y APIs de negocio
```

### Recorrido: 5 herramientas en 3 etapas

El hero presenta las 5 herramientas como nodos clicables agrupados por etapa del
embudo (`Etapa 1 · Discovery & Assessment` · `Etapa 2 · Diseño de APIs` ·
`Etapa 3 · Validación`), con el bucle de retorno visible al final. Cada nodo lleva
CTA *Entrar* y, si aplica, badge BETA. El número (01→05) debe coincidir siempre con
el `data-current` de `assets/nav.js`.

**Etapa 1 · Discovery & Assessment**

#### 01 — Assessment de la Entidad
- **Estado:** activo — pieza central de la Etapa 1
- **Ícono:** radar / diagnóstico
- **Descripción:** Levanta el As-Is de la entidad: ecosistema de APIs, capacidades y madurez, para dimensionar el punto de partida.
- **Destino:** `stages/1-discovery/assessment/index.html`

#### 02 — Discovery de Casos de Uso
- **Estado:** FASE BETA (badge visible)
- **Ícono:** lupa / target / audiencias
- **Descripción:** Analiza qué segmentos de tu cartera tienen mayor propensión a adoptar un caso de uso. Hipótesis validadas con audiencias sintéticas y métricas TAM / SAM / SOM.
- **Destino:** `stages/1-discovery/market-discovery/index.html`
- **Salida:** su CTA final encadena al 03 pasando `?usecase=<nombre>`

**Etapa 2 · Diseño y Gobierno de APIs**

#### 03 — Diseño de APIs con Agentes IA
- **Estado:** activo (sin badge beta)
- **Ícono:** código / nodos conectados
- **Descripción:** El equipo de negocio describe el caso de uso en lenguaje natural. El agente propone paths, diccionario ISO 20022 y genera el artefacto OpenAPI 3.1 listo para desarrollo.
- **Destino:** `stages/2-api-design/api-designer.html`
- **Entrada:** acepta `?usecase=` para precargar el caso de uso

#### 04 — Enriquecimiento del Diccionario de Datos
- **Estado:** activo (sin badge beta — este es el trabajo core del equipo)
- **Ícono:** capas / filtro / nodo vectorial
- **Descripción:** Procesa un YAML mal especificado a través de un pipeline determinista de 4 capas para enriquecer el diccionario de datos con ISO 20022. También permite buscar el nombre estándar de cualquier campo directamente en la base vectorial.
- **Destino:** `stages/2-api-design/enrichment.html`
- **Etiqueta adicional:** `4 capas · RAG + Agente IA · 134.136 elementos ISO`

**Etapa 3 · Validación en API Lab**

#### 05 — API Lab Accelerator
- **Estado:** FASE BETA (badge visible)
- **Ícono:** dashboard / sandbox
- **Descripción:** Entorno sandbox controlado donde desplegar las APIs generadas, conectar partners y monitorizar consumos antes de pasar a producción.
- **Destino:** `stages/3-api-lab/index.html`

### Banda "cómo funciona" (3 pasos)

Sustituye a la antigua barra de outcomes. Tres pasos narrando el recorrido:

- **Paso 1 · Set up de la entidad** — el Assessment levanta el mapa sobre el que se decide todo lo demás.
- **Paso 2 · Simular y diseñar el caso de uso** — con agentes de IA.
- **Paso 3 · Validar y devengar** — en el API Lab, actualizando el business case ante C-Level.

**Términos de UI:** usar "set up de la entidad" (no "radiografía"). El posicionamiento
del producto abarca casos de uso y APIs de negocio para Embedded Finance y BaaS, no
solo Open Finance.

### Footer

`Open Business Accelerator · 2026` — `Versión Demo`

---

## Navegación entre herramientas

Toda herramienta bajo `stages/` debe cargar la barra común al final del `<body>`, con
su identificador de módulo:

```html
<script src="../../assets/nav.js" data-current="api-designer"></script>
```

Ajusta la ruta relativa a la profundidad del fichero y usa uno de estos valores de
`data-current`: `assessment` · `discovery` · `api-designer` · `enrichment` · `api-lab`.
La barra resuelve sus propias rutas desde la URL del script, así que no hay que
configurar nada más: pinta el recorrido 01→05, resalta el módulo actual y ofrece la
vuelta al portal.

El enlace de retorno propio en el header de cada herramienta es opcional y
complementario. Si existe, debe apuntar al portal con ruta relativa:

```html
<a href="../../index.html" class="back-link">
  ← Volver al inicio
</a>
```

---

## Reglas generales para todos los ficheros de la demo

1. **Sin dependencias externas de datos.** Todo el contenido es mock hardcodeado o vive en el propio fichero.
2. **Sin llamadas a APIs reales** salvo los stubs marcados explícitamente como `// ANTHROPIC_CALL`.
3. **Un único fichero HTML** por herramienta, con CSS y JS inline. La única excepción es `assets/nav.js`, compartido por todas para no duplicar la barra de navegación.
4. **Responsive mínimo:** funciona a 1280px de ancho sin scroll horizontal.
5. **Fuentes:** solo Georgia y Arial. No cargar Google Fonts ni CDNs de fuentes.
6. **Colores:** usar exclusivamente la paleta definida arriba.
7. **Imágenes:** no usar imágenes externas. Todo el arte es SVG inline o CSS puro.
