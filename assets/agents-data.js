// assets/agents-data.js — Repositorio de agentes de la práctica (F20 · D14)
// ─────────────────────────────────────────────────────────────────────────────
// Fuente única del catálogo que pinta stages/agentes/index.html. Cada agente se
// inventaría COMO UNA API: contrato de entrada/salida, versión SemVer, owner,
// estado de ciclo de vida, políticas que cumple y dónde actúa.
//
// Tres familias (no se mezclan):
//   plataforma  servicios de core/agents.js (hoy simulados; mañana Azure Function → Azure OpenAI)
//   copilot     pipeline de diseño de APIs que ya opera en VS Code (.github/agents + .github/skills)
//   ingenieria  agentes que guían a Copilot para construir cada módulo (agents/*.agent.md)
// y los pasos de Método MBC (deterministas) para mostrar también dónde NO entra la IA.
//
// Guardrails de agentes: identificadores AGT-* del espacio de Políticas de Gobierno
// (stages/2-api-design/governance-policies.html#agentes). Reglas de API: GOV-*.
// ─────────────────────────────────────────────────────────────────────────────
window.OBA_AGENT_STAGES = [
  { id: 'entender',   n: 1, nombre: 'Entender',            lema: 'Levantar la entidad y calcular cuánto le falta para cada caso.' },
  { id: 'descubrir',  n: 2, nombre: 'Descubrir y decidir', corto: 'Descubrir', lema: 'Elegir el caso con mercado y saber pronto si es viable.' },
  { id: 'disenar',    n: 3, nombre: 'Diseñar y gobernar', corto: 'Diseñar',  lema: 'Lo que se diseña se revisa contra las mismas reglas para todo el mundo.' },
  { id: 'probar',     n: 4, nombre: 'Probar y devengar', corto: 'Probar',   lema: 'El sandbox devuelve datos y el business case los recoge.' },
  { id: 'ingenieria', n: 5, nombre: 'Ingeniería de la plataforma', corto: 'Ingeniería', lema: 'Agentes que construyen y mantienen cada módulo con Copilot.' },
];

window.OBA_AGENT_PLATFORMS = {
  plataforma: { etiqueta: 'plataforma', titulo: 'Servicio de la plataforma', detalle: 'core/agents.js · hoy simulado, mañana Azure Function → Azure OpenAI (misma firma)' },
  copilot:    { etiqueta: 'copilot',    titulo: 'Agente Copilot',            detalle: 'GitHub Copilot en VS Code · .github/agents' },
  skill:      { etiqueta: 'skill',      titulo: 'Skill',                     detalle: 'Conocimiento versionado que cargan los agentes' },
  metodo:     { etiqueta: 'método',     titulo: 'Método MBC',                detalle: 'Regla determinista de la práctica, sin IA' },
};

// Las definiciones se enlazan al repositorio (Pages no publica .github/ ni sirve los .md en bruto)
window.OBA_AGENT_REPO = 'https://github.com/jlemaclg/Open-Business-Tool/blob/main/';

window.OBA_AGENT_LIFECYCLE = ['Diseño', 'Simulado', 'Piloto', 'Operativo', 'Deprecado'];

const _AGT = ['AGT-SRC-01', 'AGT-HIL-01', 'AGT-AUD-01', 'AGT-DAT-01'];            // base para todo agente
const _AGT_ISO = _AGT.concat(['AGT-CIT-01', 'AGT-INV-01']);                      // + citación y no inventar

window.OBA_AGENTS = [
  // ── Etapa 1 · Entender ─────────────────────────────────────────────────────
  { id: 'gaps-dependencias', nombre: 'GAPs y Dependencias', etapa: 'entender', tipo: 'agente', plataforma: 'plataforma', icono: 'grafo',
    desc: 'Calcula el delta de un caso de uso contra el set up de la entidad: APIs, tecnología, equipo, dependencias e inversión.',
    servicio: 'Agents.gapsYDependencias(casoUso, entidad)', version: '0.3.0', ciclo: 'Simulado', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'Assessment · pestaña 13', url: 'stages/1-discovery/assessment/index.html' }, definicion: 'docs/contratos-agentes.md',
    entrada: { casoUso: { nombre: 'Pagos embebidos en ERP', naturaleza: 'embedded-finance-baas' }, entidad: { stack: '…', grafoDependencias: '…' } },
    salida: { apisNecesarias: [{ nombre: 'payments', estado: 'nueva' }], gaps: ['Falta: servicio de tokenización'], dependencias: [{ origen: 'API payments', destino: 'core-pagos', estado: 'bloqueante' }], inversionIncremental: { capex: 90000, opex: 30000, confianza: 'media' }, _mock: true },
    politicas: _AGT },
  { id: 'levantamiento-bc', nombre: 'Levantamiento y business case', etapa: 'entender', tipo: 'metodo', plataforma: 'metodo', icono: 'tabla',
    desc: 'Once pestañas de levantamiento, stack, iniciativas, roadmap, célula y business case con la base de conocimiento de la práctica.',
    servicio: 'Assessment (pestañas 1–11)', version: '0.3.0', ciclo: 'Operativo', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'Assessment', url: 'stages/1-discovery/assessment/index.html' }, definicion: 'stages/1-discovery/assessment/index.html',
    entrada: { cliente: '…', horizonte: 12, tarifas: 'preset región' }, salida: { roadmap: '…', businessCase: { van: '…', payback: '…' } },
    politicas: [] },

  // ── Etapa 2 · Descubrir y decidir ─────────────────────────────────────────
  { id: 'market-discovery', nombre: 'Audiencias sintéticas', etapa: 'descubrir', tipo: 'agente', plataforma: 'plataforma', icono: 'personas',
    desc: 'Propensión por segmento, TAM/SAM/SOM y señales de adopción para un caso de uso sobre audiencias sintéticas.',
    servicio: 'Agents.marketDiscovery(casoUso, entidad)', version: '0.3.0', ciclo: 'Simulado', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'Discovery · pasos 2–4', url: 'stages/1-discovery/market-discovery/index.html' }, definicion: 'agents/synthetic-audiences.skill.md',
    entrada: { casoUso: { nombre: 'Crédito para gig workers', categoria: 'CRÉDITO' } },
    salida: { hipotesisProducto: '…', tam: 450000000, sam: 140000000, som: 12000000, propension: 0.52, _mock: true },
    politicas: _AGT },
  { id: 'requerimientos-producto', nombre: 'Requerimientos del producto', etapa: 'descubrir', tipo: 'hibrido', plataforma: 'plataforma', icono: 'lista',
    desc: 'Borrador de requisitos funcionales, de datos, no funcionales y regulatorios sobre la plantilla MBC; el consultor decide.',
    servicio: 'Agents.requerimientosProducto(casoUso, audiencia)', version: '0.1.0', ciclo: 'Simulado', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'Discovery · paso 5', url: 'stages/1-discovery/market-discovery/index.html' }, definicion: 'docs/contratos-agentes.md',
    entrada: { casoUso: { nombre: 'Recaudación digital automatizada', categoria: 'PAGOS' }, audiencia: { segmentoPrioritario: { nombre: 'GIG Economy', propension: 83 } } },
    salida: { grupos: [{ id: 'func', titulo: 'Funcionales', items: [{ texto: '…', origen: 'plantilla|agente' }] }], _mock: true },
    politicas: _AGT },
  { id: 'viabilidad-temprana', nombre: 'Viabilidad temprana', etapa: 'descubrir', tipo: 'metodo', plataforma: 'metodo', icono: 'semaforo',
    desc: 'Clasifica cada API del caso contra el inventario y el set up: reutilizable, extender, nueva o sin capacidad. Sin IA, siempre la misma respuesta.',
    servicio: 'clasificarCaso(endpoints, { inventario, entidad })', version: '1.0.0', ciclo: 'Operativo', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'Discovery · paso 5 e Inventario', url: 'stages/2-api-design/api-inventory.html' }, definicion: 'core/viabilidad.js',
    entrada: { endpoints: [{ endpoint: 'POST /payments', rol: 'requerida' }] },
    salida: { semaforo: 'verde', resumen: { reutilizable: 4, extender: 1, nueva: 0, sinCapacidad: 0 }, lectura: '…' },
    politicas: ['GOV-VER-01'] },
  { id: 'skill-audiencias', nombre: 'Segmentos y variables de decisión', etapa: 'descubrir', tipo: 'metodo', plataforma: 'skill', icono: 'libro',
    desc: 'Los cuatro segmentos sintéticos, sus variables clave y la matriz de propensión por categoría que usa el agente de audiencias.',
    servicio: 'synthetic-audiences', version: '1.0.0', ciclo: 'Operativo', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'Discovery', url: 'stages/1-discovery/market-discovery/index.html' }, definicion: 'agents/synthetic-audiences.skill.md',
    entrada: { categoria: 'CRÉDITO' }, salida: { gig: 87, inf: 31, thin: 54, emp: 41 }, politicas: [] },

  // ── Etapa 3 · Diseñar y gobernar ──────────────────────────────────────────
  { id: 'api-design-orchestrator', nombre: 'API Design Orchestrator', etapa: 'disenar', tipo: 'agente', plataforma: 'copilot', icono: 'orquesta',
    desc: 'Orquesta el diseño de una API desde la conversación de negocio hasta el OpenAPI: delega en el business analyst y en el api builder.',
    servicio: '@api-design-orchestrator', version: '1.0.0', ciclo: 'Operativo', owner: 'Arquitectura de APIs',
    modulo: { nombre: 'API Designer', url: 'stages/2-api-design/api-designer.html' }, definicion: '.github/agents/api-design-orchestrator.agent.md',
    entrada: { casoDeUso: 'Remesas para trabajadores gig', procesos: ['alta de beneficiario', 'envío', 'consulta de estado'] },
    salida: { 'output/discovery/data-dictionary.json': '…', 'output/api/openapi.yaml': '…' }, politicas: _AGT_ISO },
  { id: 'business-analyst', nombre: 'Business Analyst', etapa: 'disenar', tipo: 'agente', plataforma: 'copilot', icono: 'chat',
    desc: 'Conversa con negocio, valida funcionalidades y propone recursos y diccionario de datos con semántica ISO 20022; pregunta cuando duda.',
    servicio: '@business-analyst', version: '1.0.0', ciclo: 'Operativo', owner: 'Arquitectura de APIs',
    modulo: { nombre: 'API Designer', url: 'stages/2-api-design/api-designer.html' }, definicion: '.github/agents/business-analyst.agent.md',
    entrada: { casoDeUso: '…', descripcion: 'texto en lenguaje natural' },
    salida: { paths: ['POST /remittances'], diccionario: [{ campo: 'creditorAccount', iso20022: 'CdtrAcct', confianza: 'alta' }] }, politicas: _AGT_ISO },
  { id: 'api-builder', nombre: 'API Builder', etapa: 'disenar', tipo: 'agente', plataforma: 'copilot', icono: 'codigo',
    desc: 'Convierte el diccionario de datos aprobado en OpenAPI 3.1, JSON Schemas y artefactos listos para el equipo de desarrollo.',
    servicio: '@api-builder', version: '1.0.0', ciclo: 'Operativo', owner: 'Arquitectura de APIs',
    modulo: { nombre: 'API Designer', url: 'stages/2-api-design/api-designer.html' }, definicion: '.github/agents/api-builder.agent.md',
    entrada: { diccionarioAprobado: 'output/discovery/data-dictionary.json' }, salida: { openapi: '3.1.0', schemas: ['Remittance.json'], reporte: 'report.md' }, politicas: _AGT_ISO },
  { id: 'disenar-api', nombre: 'Diseño de API', etapa: 'disenar', tipo: 'agente', plataforma: 'plataforma', icono: 'chat',
    desc: 'Versión web del business analyst: de la descripción del caso a paths y diccionario de datos aprobable en ISO 20022.',
    servicio: 'Agents.diseñarAPI(descripcionNL)', version: '0.3.0', ciclo: 'Simulado', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'API Designer', url: 'stages/2-api-design/api-designer.html' }, definicion: 'docs/contratos-agentes.md',
    entrada: { descripcionNL: '…' }, salida: { useCase: '…', iso20022Domain: 'pacs', paths: ['…'], schemas: {} }, politicas: _AGT_ISO },
  { id: 'construir-api', nombre: 'Construcción de API', etapa: 'disenar', tipo: 'agente', plataforma: 'plataforma', icono: 'codigo',
    desc: 'Versión web del api builder: del diccionario aprobado al OpenAPI 3.1 con cobertura ISO 20022 medida.',
    servicio: 'Agents.construirAPI(dataDictionary)', version: '0.3.0', ciclo: 'Simulado', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'API Designer', url: 'stages/2-api-design/api-designer.html' }, definicion: 'docs/contratos-agentes.md',
    entrada: { dataDictionary: '…' }, salida: { openapi: '…', cobertura: { totalCampos: 24, iso20022: 21, locales: 3 } }, politicas: _AGT_ISO },
  { id: 'enriquecer-api', nombre: 'Enriquecimiento ISO 20022', etapa: 'disenar', tipo: 'hibrido', plataforma: 'plataforma', icono: 'capas',
    desc: 'Enriquece un YAML existente: las capas 1–3 son reglas; el agente solo entra en la capa 4, cuando la búsqueda no alcanza confianza.',
    servicio: 'Agents.enriquecerAPI(yamlExistente)', version: '0.3.0', ciclo: 'Simulado', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'Gestión y Versionado', url: 'stages/2-api-design/enrichment.html' }, definicion: 'agents/iso20022-pipeline.skill.md',
    entrada: { yamlExistente: 'openapi.yaml (As-Is)' }, salida: { camposEnriquecidos: 18, cobertura: '92 %', elementosISO: ['Dbtr', 'Cdtr'] }, politicas: _AGT_ISO },
  { id: 'pipeline-iso', nombre: 'Pipeline ISO 20022 · capas 1–3', etapa: 'disenar', tipo: 'metodo', plataforma: 'skill', icono: 'capas',
    desc: 'Coincidencia exacta, diccionario de sinónimos y búsqueda semántica sobre el catálogo ISO 20022: de mayor a menor determinismo.',
    servicio: 'iso20022-pipeline', version: '1.0.0', ciclo: 'Operativo', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'Gestión y Versionado', url: 'stages/2-api-design/enrichment.html' }, definicion: 'agents/iso20022-pipeline.skill.md',
    entrada: { campo: 'debtor_account', descripcion: 'cuenta del ordenante' }, salida: { canonico: 'DbtrAcct', capa: 1, confianza: 'alta' }, politicas: ['GOV-ISO-01'] },
  { id: 'revision-gobierno', nombre: 'Revisión contra políticas GOV', etapa: 'disenar', tipo: 'metodo', plataforma: 'metodo', icono: 'escudo',
    desc: 'Evalúa la especificación contra las reglas GOV-* de la entidad y puntúa la conformidad; cada observación cita su regla.',
    servicio: 'Fase 2 · Mejora de la especificación', version: '1.0.1', ciclo: 'Operativo', owner: 'Equipo de Gobierno de APIs',
    modulo: { nombre: 'Gestión y Versionado', url: 'stages/2-api-design/enrichment.html' }, definicion: 'stages/2-api-design/governance-policies.html',
    entrada: { yaml: 'openapi.yaml' }, salida: { conformidad: '6/8', observaciones: [{ regla: 'GOV-ERR-01', detalle: '…' }] },
    politicas: ['GOV-NAM-01', 'GOV-VER-01', 'GOV-ERR-01', 'GOV-SEC-01', 'GOV-PAG-01', 'GOV-IDM-01'] },
  { id: 'skill-diccionario', nombre: 'Design Data Dictionary', etapa: 'disenar', tipo: 'metodo', plataforma: 'skill', icono: 'libro',
    desc: 'Cómo proponer e iterar un diccionario de datos con mapeos ISO 20022 a partir del caso de uso descubierto.',
    servicio: 'design-data-dictionary', version: '1.0.0', ciclo: 'Operativo', owner: 'Arquitectura de APIs',
    modulo: { nombre: 'API Designer', url: 'stages/2-api-design/api-designer.html' }, definicion: '.github/skills/design-data-dictionary/SKILL.md',
    entrada: { casoDescubierto: '…' }, salida: { diccionario: '…' }, politicas: ['GOV-ISO-01'] },
  { id: 'skill-oas', nombre: 'Generate OAS API', etapa: 'disenar', tipo: 'metodo', plataforma: 'skill', icono: 'libro',
    desc: 'Plantillas y convenciones para transformar el diccionario aprobado en artefactos OpenAPI 3.1.',
    servicio: 'generate-oas-api', version: '1.0.0', ciclo: 'Operativo', owner: 'Arquitectura de APIs',
    modulo: { nombre: 'API Designer', url: 'stages/2-api-design/api-designer.html' }, definicion: '.github/skills/generate-oas-api/SKILL.md',
    entrada: { diccionario: '…' }, salida: { openapi: '…' }, politicas: ['GOV-NAM-01', 'GOV-DOC-01'] },
  { id: 'skill-caso', nombre: 'Discover Use Case', etapa: 'disenar', tipo: 'metodo', plataforma: 'skill', icono: 'libro',
    desc: 'Guía para entender un caso de uso de negocio y extraer información estructurada de una descripción en lenguaje natural.',
    servicio: 'discover-use-case', version: '1.0.0', ciclo: 'Operativo', owner: 'Arquitectura de APIs',
    modulo: { nombre: 'API Designer', url: 'stages/2-api-design/api-designer.html' }, definicion: '.github/skills/discover-use-case/SKILL.md',
    entrada: { descripcion: '…' }, salida: { actores: ['…'], procesos: ['…'] }, politicas: [] },

  // ── Etapa 4 · Probar y devengar ───────────────────────────────────────────
  { id: 'refinar-api', nombre: 'Refinamiento desde el sandbox', etapa: 'probar', tipo: 'agente', plataforma: 'plataforma', icono: 'bucle',
    desc: 'Lee los resultados del API Lab (errores, latencias, uso de partners) y propone cambios concretos sobre el diseño.',
    servicio: 'Agents.refinarAPI(diseño, labResults)', version: '0.3.0', ciclo: 'Simulado', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'API Lab', url: 'stages/3-api-lab/index.html' }, definicion: 'docs/contratos-agentes.md',
    entrada: { diseño: '…', labResults: [{ sandbox: 'SaaS', metricas: { p95: 420, errores: '1,2 %' } }] },
    salida: { refinamientos: [{ campo: 'amount', cambio: 'decimal(18,2)', motivo: 'redondeos en partner B' }], nuevoEstado: 'refinada', _mock: true }, politicas: _AGT },
  { id: 'actualizar-roadmap', nombre: 'Write-back al roadmap', etapa: 'probar', tipo: 'agente', plataforma: 'plataforma', icono: 'grafica',
    desc: 'Convierte el caso en iniciativas etiquetadas e inversión con devengo que se agregan al roadmap y al business case de la entidad.',
    servicio: 'Agents.actualizarRoadmap(casoUso, entidad)', version: '0.3.0', ciclo: 'Simulado', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'Assessment · pestaña 13', url: 'stages/1-discovery/assessment/index.html' }, definicion: 'docs/contratos-agentes.md',
    entrada: { casoUso: '…', entidad: '…' }, salida: { iniciativas: [{ nombre: '…', slot: 'Q1' }], inversion: { capex: 90000, opex: 30000, devengo: 'lineal-12m' }, _mock: true }, politicas: _AGT },
  { id: 'sandbox-metricas', nombre: 'Sandbox, métricas y devengo', etapa: 'probar', tipo: 'metodo', plataforma: 'metodo', icono: 'grafica',
    desc: 'Despliegue en sandbox, simulación con partners y comercios y métricas por caso; la base objetiva para el comité.',
    servicio: 'API Lab', version: '0.3.0', ciclo: 'Operativo', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'API Lab', url: 'stages/3-api-lab/index.html' }, definicion: 'agents/api-lab-agent.agent.md',
    entrada: { api: 'openapi.yaml', partners: 4 }, salida: { llamadas: 2341, uptime: '99,2 %', incidencias: 1 }, politicas: ['GOV-STA-01'] },

  // ── Ingeniería de la plataforma ───────────────────────────────────────────
  { id: 'demo-orchestrator', nombre: 'Orquestador de la plataforma', etapa: 'ingenieria', tipo: 'agente', plataforma: 'copilot', icono: 'orquesta',
    desc: 'Construye y mantiene el portal, la barra de navegación común y la coherencia del recorrido entre módulos.',
    servicio: 'agents/demo-orchestrator', version: '0.3.0', ciclo: 'Operativo', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'Portal', url: 'index.html' }, definicion: 'agents/demo-orchestrator.agent.md',
    entrada: { peticion: 'Añadir un módulo al recorrido' }, salida: { ficheros: ['index.html', 'assets/nav.js'] }, politicas: ['AGT-HIL-01', 'AGT-GOV-01'] },
  { id: 'discovery-agent', nombre: 'Constructor del Discovery', etapa: 'ingenieria', tipo: 'agente', plataforma: 'copilot', icono: 'codigo',
    desc: 'Construye el módulo de Discovery: catálogo de casos, audiencias, análisis, resultados y viabilidad.',
    servicio: 'agents/discovery-agent', version: '0.3.0', ciclo: 'Operativo', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'Discovery', url: 'stages/1-discovery/market-discovery/index.html' }, definicion: 'agents/discovery-agent.agent.md',
    entrada: { peticion: '…' }, salida: { ficheros: ['stages/1-discovery/market-discovery/index.html'] }, politicas: ['AGT-HIL-01', 'AGT-GOV-01'] },
  { id: 'enrichment-agent', nombre: 'Constructor de Gestión y Versionado', etapa: 'ingenieria', tipo: 'agente', plataforma: 'copilot', icono: 'codigo',
    desc: 'Construye el módulo de enriquecimiento ISO 20022, la mejora de la especificación y el ciclo de vida de las APIs.',
    servicio: 'agents/enrichment-agent', version: '0.3.0', ciclo: 'Operativo', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'Gestión y Versionado', url: 'stages/2-api-design/enrichment.html' }, definicion: 'agents/enrichment-agent.agent.md',
    entrada: { peticion: '…' }, salida: { ficheros: ['stages/2-api-design/enrichment.html'] }, politicas: ['AGT-HIL-01', 'AGT-GOV-01'] },
  { id: 'api-lab-agent', nombre: 'Constructor del API Lab', etapa: 'ingenieria', tipo: 'agente', plataforma: 'copilot', icono: 'codigo',
    desc: 'Construye el API Lab: panel de APIs en sandbox, partners, métricas y despliegue.',
    servicio: 'agents/api-lab-agent', version: '0.3.0', ciclo: 'Operativo', owner: 'Práctica Open Business · MBC',
    modulo: { nombre: 'API Lab', url: 'stages/3-api-lab/index.html' }, definicion: 'agents/api-lab-agent.agent.md',
    entrada: { peticion: '…' }, salida: { ficheros: ['stages/3-api-lab/index.html'] }, politicas: ['AGT-HIL-01', 'AGT-GOV-01'] },
];

// Guardrails de agentes (espejo de la página "Guardrails de los agentes IA" del espacio de Gobierno)
window.OBA_AGENT_POLICIES = {
  'AGT-SRC-01': 'Fuentes de conocimiento: solo el espacio de gobierno y el inventario / set up de la entidad, versionados.',
  'AGT-CIT-01': 'Citación obligatoria: cada observación cita la regla aplicada por su identificador.',
  'AGT-INV-01': 'Prohibido inventar referencias ISO 20022 o políticas; ante la duda, se pregunta al usuario.',
  'AGT-HIL-01': 'Human-in-the-loop: toda salida es una propuesta; el agente no aprueba ni publica.',
  'AGT-AUD-01': 'Auditoría: se registran agente, versión de políticas, entradas, salidas y decisiones humanas.',
  'AGT-DAT-01': 'Datos: fuera del tenant de la entidad, solo datos demo o anonimizados.',
  'AGT-GOV-01': 'Gobierno del cambio: propuesta → PR → aprobación de Gobierno y Riesgo Tecnológico → versión etiquetada.',
};
