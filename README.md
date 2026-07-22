# Open Business Accelerator

Plataforma de **casos de uso y APIs de negocio** para **Open Finance, Embedded Finance y BaaS**: acompaña un caso de uso desde el discovery hasta el despliegue, con el business case y la inversión actualizándose en cada paso.

> **Demo:** https://jlemaclg.github.io/Open-Business-Tool/
> Abre la URL y funciona — sin instalación, sin build, sin backend. Solo datos demo/ficticios.

## El recorrido

```
Etapa 1 · Discovery & Assessment          Etapa 2 · Diseño de APIs                Etapa 3 · Validación
┌──────────────┐ ┌──────────────┐  ┌──────────────┐ ┌──────────────┐ ┌──────────┐  ┌──────────┐
│01 Assessment │→│ 02 Discovery │ →│03 Inventario │→│04 API Design │→│05 Enrich.│→ │06 API Lab│
└──────────────┘ └──────────────┘  └──────────────┘ └──────────────┘ └──────────┘  └──────────┘
       ▲                                                                                 │
       └──── el bucle: los resultados del Lab refinan las APIs y actualizan el ──────────┘
             roadmap y la inversión del Assessment

             Transversal · Políticas de Gobierno de APIs — las reglas que cita cualquier diseño
```

- **01 · Assessment de la Entidad** — el *set up*: As-Is, stack, GAPs y dependencias, casos de uso, iniciativas, roadmap, monetización y business case. Es la columna vertebral: los casos de uso se simulan contra él.
- **02 · Discovery de Casos de Uso** *(beta)* — propensión por segmento, audiencias sintéticas, TAM/SAM/SOM.
- **03 · Inventario de APIs** — el catálogo del estate existente, con el mapeo endpoint → sistema backend → servicio interno. Desde cualquier API se lanza "Extender esta API" y el diseño parte del conocimiento ya generado.
- **04 · Diseño de APIs con Agentes IA** — de la descripción en lenguaje natural al artefacto OpenAPI 3.1 con diccionario ISO 20022. Toma contexto por URL: caso de uso, API del inventario o discovery.
- **05 · Enriquecimiento de APIs** — normaliza YAMLs existentes contra ISO 20022 (pipeline de 4 capas + RAG) y los revisa contra las políticas de gobierno.
- **06 · API Lab** *(beta)* — sandbox para probar con partners y comercios reales (Sandbox as a Service o el del cliente).
- **Políticas de Gobierno de APIs** *(transversal, fuera del recorrido numerado)* — la base de conocimiento versionada que gobierna cualquier diseño.

## Ejecutar en local

Clona el repo y abre `index.html` en el navegador. No hay dependencias ni paso de build (HTML + CSS + JS con módulos ES). El estado se guarda en `localStorage`.

## Estructura

```
index.html            Portal (el recorrido)
assets/nav.js         Barra de navegación compartida entre herramientas
core/                 Dominio y adaptadores
  domain/             entidad.js (set up + grafo de dependencias) · casoDeUso.js
  storage.js          Adaptador de persistencia (hoy localStorage; mañana Supabase/Azure)
  agents.js           Adaptador de agentes IA (hoy mocks realistas; mañana Azure OpenAI)
stages/               Las herramientas, por etapa del recorrido
  1-discovery/        assessment/ · market-discovery/
  2-api-design/       api-inventory.html · api-designer.html · enrichment.html · governance-policies.html
  3-api-lab/          index.html
agents/               Definiciones de agentes y skills
docs/                 DECISIONES_Y_ARQUITECTURA.md (fuente de verdad) · contratos-agentes.md · plan-de-trabajo.md
```

## Arquitectura en una línea

Buildless por diseño: la plataforma completa se sirve como estático (GitHub Pages). Las capas que evolucionan — persistencia (`core/storage.js`) e inteligencia (`core/agents.js`) — están aisladas tras adaptadores con firma estable, de modo que pasar de `localStorage`+mocks a Supabase/Azure OpenAI no toca las herramientas. Detalle en `docs/DECISIONES_Y_ARQUITECTURA.md`.

## Estado y roadmap

En desarrollo activo por features (ver `docs/plan-de-trabajo.md`). Los agentes de IA responden hoy con **mocks realistas** (marcados como datos simulados); la sustitución por backend real está diseñada y pendiente de infraestructura.

## Licencia y datos

© 2026 Minsait — Indra Sistemas, S.A. Todos los derechos reservados. **No es código abierto**: ver `LICENSE`. La publicación temporal de este repositorio sirve únicamente para la demo y no otorga derechos de uso o reutilización. Todos los datos incluidos son ficticios o anonimizados.
