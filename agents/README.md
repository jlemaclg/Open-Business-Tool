# Agentes de Open Business Accelerator — índice

> Índice único de los agentes, skills y métodos del repositorio (F10 consolidado en F20 · decisión D14).
> La vista navegable es **`stages/agentes/index.html`** (Repositorio de agentes) y su fuente de datos es **`assets/agents-data.js`**: si añades, versionas o retiras un agente, actualiza esa entrada en el mismo PR.

En el repo conviven tres familias que **no son lo mismo** y no deben mezclarse:

| Familia | Dónde vive | Qué es | Estado |
|---|---|---|---|
| **Agentes de la plataforma** | `core/agents.js` (+ `core/agents.mock.js`) | Servicios que usan los módulos (GAPs, audiencias, requerimientos, diseño, construcción, enriquecimiento, refinamiento, roadmap). Contratos en `docs/contratos-agentes.md`. | Simulados en la demo; mañana Azure Function → Azure OpenAI con la misma firma (D10) |
| **Pipeline de diseño de APIs (Copilot)** | `.github/agents/*.agent.md` + `.github/skills/*/SKILL.md` | Orquestador, business analyst y api builder que diseñan APIs con semántica ISO 20022 desde VS Code. | Operativos. Se quedan en `.github/`: es donde GitHub Copilot los descubre |
| **Agentes de construcción de la plataforma** | `agents/*.agent.md` (esta carpeta) | Instrucciones para que Copilot construya y mantenga cada módulo de la web. | Operativos (ingeniería interna, no servicio al cliente) |

Además, los **pasos de Método MBC** (deterministas, sin IA) se inventarían junto a los agentes para mostrar también dónde no entra la IA: viabilidad temprana (`core/viabilidad.js`), pipeline ISO 20022 capas 1–3 (`agents/iso20022-pipeline.skill.md`), revisión contra políticas GOV-*, levantamiento y business case, sandbox y métricas.

## Contenido de esta carpeta

| Fichero | Tipo | Construye / define |
|---|---|---|
| `demo-orchestrator.agent.md` | Agente de construcción | Portal, barra común (`assets/nav.js`) y coherencia del recorrido |
| `discovery-agent.agent.md` | Agente de construcción | Módulo 02 · Discovery |
| `enrichment-agent.agent.md` | Agente de construcción | Módulo 05 · Gestión y Versionado |
| `api-lab-agent.agent.md` | Agente de construcción | Módulo 06 · API Lab |
| `iso20022-pipeline.skill.md` | Skill (método) | Pipeline de enriquecimiento ISO 20022 en 4 capas (1–3 deterministas, 4 con agente) |
| `synthetic-audiences.skill.md` | Skill (método) | Segmentos sintéticos, variables de decisión y matriz de propensión |

## Gobierno de los agentes

Todos los agentes cumplen los guardrails **AGT-*** del espacio de Políticas de Gobierno (`stages/2-api-design/governance-policies.html#agentes`): fuentes de conocimiento, citación obligatoria, prohibido inventar, human-in-the-loop, auditoría, datos y gobierno del cambio. Cada entrada de `assets/agents-data.js` declara qué guardrails y qué reglas GOV-* le aplican.

## Alta o cambio de un agente (checklist)

1. Definición: fichero `.agent.md` / `SKILL.md` en su familia, o método en `core/agents.js` con su contrato en `docs/contratos-agentes.md`.
2. Entrada en `assets/agents-data.js`: etapa, tipo (agente / híbrido / método), plataforma, contrato de entrada y salida, versión SemVer, owner, ciclo de vida, políticas y módulo donde actúa.
3. Un cambio de prompt, modelo o contrato es una **nueva versión** (AGT-GOV-01): PR con aprobación de Gobierno.
4. CHANGELOG bajo `[Unreleased]`.
