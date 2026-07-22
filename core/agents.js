// core/agents.js
// ─────────────────────────────────────────────────────────────────────────────
// Adaptador de INVOCACIÓN DE AGENTES. Mismo patrón que storage.js: la herramienta
// llama a un contrato estable; NO conoce si detrás hay un mock o Azure OpenAI.
//
//   Fase 0 (hoy):   MockAgents        → respuestas realistas locales, sin red.
//   Futuro:         AzureAgents       → Azure Function → Azure OpenAI (misma firma).
//
// Sin LangChain (decisión D5): llamada directa cuando exista backend.
// Para pasar a real se cambia UNA línea (el import de abajo).
// ─────────────────────────────────────────────────────────────────────────────

import { MockAgents } from './agents.mock.js';

/** Implementación activa. Cambiar a AzureAgents cuando el backend exista. */
const impl = MockAgents;

export const Agents = {
  /** Discovery de mercado: hipótesis + TAM/SAM/SOM + propensión. */
  marketDiscovery: (casoUso, entidad) => impl.marketDiscovery(casoUso, entidad),

  /** ⭐ El delta: qué APIs/tecnología/equipo faltan y cuánta inversión implica. */
  gapsYDependencias: (casoUso, entidad) => impl.gapsYDependencias(casoUso, entidad),

  /** Diseño conversacional de API → diccionario de datos + paths + ISO 20022. */
  diseñarAPI: (descripcionNL) => impl.diseñarAPI(descripcionNL),

  /** Construcción del artefacto → OpenAPI 3.1 + JSON Schemas. */
  construirAPI: (dataDictionary) => impl.construirAPI(dataDictionary),

  /** Enriquecimiento ISO 20022 de un YAML existente. */
  enriquecerAPI: (yamlExistente) => impl.enriquecerAPI(yamlExistente),

  /** ⭐ Refinamiento del diseño a partir de resultados del API Lab. */
  refinarAPI: (diseño, labResults) => impl.refinarAPI(diseño, labResults),

  /** ⭐ Write-back: iniciativas + inversión devengada → roadmap de la entidad. */
  actualizarRoadmap: (casoUso, entidad) => impl.actualizarRoadmap(casoUso, entidad),
};
