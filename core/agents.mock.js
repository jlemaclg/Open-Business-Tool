// core/agents.mock.js
// ─────────────────────────────────────────────────────────────────────────────
// Implementación MOCK de los agentes: respuestas REALISTAS y deterministas para
// que la plataforma funcione end-to-end sin backend. Cuando exista Azure Function
// → Azure OpenAI, se sustituye por AzureAgents con la MISMA firma (ver agents.js).
//
// Los mocks ramifican por `naturaleza` del caso de uso:
//   • EMBEDDED_BAAS  → solo APIs, delta pequeño (canal ya habilitado).
//   • CASO_COMPLETO  → APIs + frontal + más necesidades tech/equipo → delta grande.
// ─────────────────────────────────────────────────────────────────────────────

import { Naturaleza, EstadoAPI } from './domain/casoDeUso.js';
import { TipoDependencia, EstadoDependencia } from './domain/entidad.js';

// Latencia simulada para que la UI ejercite estados de carga como con el agente real.
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const esCompleto = (cu) => cu?.naturaleza === Naturaleza.CASO_COMPLETO;

export const MockAgents = {
  async marketDiscovery(casoUso, _entidad) {
    await delay();
    const completo = esCompleto(casoUso);
    return {
      hipotesisProducto: completo
        ? `Nuevo caso de uso "${casoUso.nombre}" con frontal propio dirigido a clientes desatendidos.`
        : `Exponer "${casoUso.nombre}" vía API a partners de embedded finance / BaaS.`,
      tam: completo ? 1200_000_000 : 450_000_000,
      sam: completo ? 320_000_000 : 140_000_000,
      som: completo ? 28_000_000 : 12_000_000,
      propension: completo ? 0.34 : 0.52,
      _mock: true,
    };
  },

  // ⭐ El agente central: calcula el delta contra la radiografía de la entidad.
  async gapsYDependencias(casoUso, entidad) {
    await delay();
    const completo = esCompleto(casoUso);
    const capacidades = new Set((entidad?.stack?.canales || []).concat(entidad?.stack?.servicios || []));
    const tieneEmbedded = capacidades.has('canal-embedded-habilitado');

    const apisNecesarias = [
      { nombre: 'payments', estado: 'nueva', razon: 'no expuesta como API pública hoy' },
      { nombre: 'accounts', estado: capacidades.has('core-pagos') ? 'existente' : 'nueva',
        razon: capacidades.has('core-pagos') ? 'disponible en core-pagos' : 'requiere exponer cuentas' },
    ];
    if (completo) {
      apisNecesarias.push({ nombre: 'onboarding', estado: 'nueva', razon: 'alta de cliente para el frontal propio' });
    }

    const necesidadesTecnologicas = [];
    if (!tieneEmbedded || completo) {
      necesidadesTecnologicas.push({ item: 'Servicio de tokenización backend', capa: 'backend', existe: false, inversionEstim: '20-30 jornadas' });
    }
    if (completo) {
      necesidadesTecnologicas.push(
        { item: 'Frontal web/app + design system', capa: 'frontend', existe: false, inversionEstim: '60-90 jornadas' },
        { item: 'Motor de decisión/riesgo', capa: 'backend', existe: false, inversionEstim: '40 jornadas' },
      );
    }

    const necesidadesEquipo = completo
      ? [
          { rol: '2 devs backend', duracion: '4 meses', motivo: 'APIs + servicios de soporte' },
          { rol: '2 devs frontend', duracion: '4 meses', motivo: 'frontal propio del caso de uso' },
          { rol: '1 PO + 1 diseñador', duracion: '4 meses', motivo: 'producto y UX' },
        ]
      : [{ rol: '2 devs backend', duracion: '3 meses', motivo: 'exponer y operar la API de payments' }];

    const dependencias = [
      { origen: 'API payments', destino: 'core-pagos', tipo: TipoDependencia.TECNICA,
        estado: capacidades.has('core-pagos') ? EstadoDependencia.SATISFECHA : EstadoDependencia.BLOQUEANTE,
        descripcion: 'La API de pagos necesita el core de pagos.' },
      { origen: 'Lanzamiento', destino: 'Equipo de Riesgo', tipo: TipoDependencia.ORGANIZATIVA,
        estado: EstadoDependencia.BLOQUEANTE, descripcion: 'Riesgo debe validar el flujo antes de salir.' },
    ];

    const capex = completo ? 480_000 : 90_000;
    const opex = completo ? 120_000 : 30_000;

    return {
      apisNecesarias,
      necesidadesTecnologicas,
      necesidadesEquipo,
      gaps: necesidadesTecnologicas.filter((n) => !n.existe).map((n) => `Falta: ${n.item}`),
      dependencias,
      inversionIncremental: { capex, opex, confianza: completo ? 'media' : 'alta' },
      _mock: true,
    };
  },

  async diseñarAPI(descripcionNL) {
    await delay();
    return {
      useCase: descripcionNL?.slice(0, 60) || 'Caso de uso',
      iso20022Domain: 'pain',
      paths: [
        { method: 'POST', path: '/payments', operationId: 'createPayment' },
        { method: 'GET', path: '/payments/{id}', operationId: 'getPayment' },
      ],
      schemas: { Payment: { fields: [
        { name: 'paymentId', type: 'string', iso20022Type: 'Max35Text', mandatory: true },
        { name: 'amount', type: 'object', iso20022Type: 'ActiveCurrencyAndAmount', mandatory: true },
      ] } },
      _mock: true,
    };
  },

  async construirAPI(dataDictionary) {
    await delay();
    return {
      openapi: '3.1.0',
      artefacto: `# OpenAPI generado (mock) para ${dataDictionary?.useCase || 'API'}`,
      schemasGenerados: Object.keys(dataDictionary?.schemas || { Payment: 1 }),
      cobertura: { totalCampos: 6, iso20022: 5, locales: 1 },
      _mock: true,
    };
  },

  async enriquecerAPI(_yamlExistente) {
    await delay();
    return { camposEnriquecidos: 12, cobertura: 0.83, elementosISO: 134_136, _mock: true };
  },

  // ⭐ Cierra el bucle: del Lab salen refinamientos que vuelven al diseño.
  async refinarAPI(_diseño, labResults) {
    await delay();
    const conErrores = (labResults || []).some((r) => (r?.metricas?.tasaError || 0) > 0.02);
    return {
      refinamientos: [
        { campo: 'amount.currency', cambio: 'añadir enum [PEN, USD]', motivo: 'valores observados en sandbox' },
        ...(conErrores ? [{ campo: 'status', cambio: 'ampliar estados de error', motivo: 'errores en comercios reales' }] : []),
      ],
      nuevoEstado: EstadoAPI.REFINADA,
      _mock: true,
    };
  },

  // ⭐ Write-back: convierte el caso en iniciativas + inversión para el roadmap.
  async actualizarRoadmap(casoUso, _entidad) {
    await delay();
    const inv = casoUso?.inversionIncremental || { capex: 90_000, opex: 30_000 };
    return {
      iniciativas: [
        { nombre: `Implementar ${casoUso?.nombre || 'caso de uso'}`, slot: 'Q1', casoDeUsoId: casoUso?.id },
        { nombre: 'Integración y pruebas en API Lab', slot: 'Q2', casoDeUsoId: casoUso?.id },
      ],
      inversion: { capex: inv.capex, opex: inv.opex, devengo: 'lineal-12m' },
      _mock: true,
    };
  },
};
