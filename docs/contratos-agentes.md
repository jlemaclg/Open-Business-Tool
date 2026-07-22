# Contratos de agentes — `core/agents.js`

Los agentes se invocan **siempre** a través del adaptador `Agents` (`core/agents.js`), nunca directamente. Hoy la implementación es `agents.mock.js` (respuestas realistas, sin red); mañana `agents.azure.js` (Azure Function → Azure OpenAI) con **la misma firma**. Sin LangChain (D5).

Cambiar de mock a real = cambiar una línea en `core/agents.js`:
```js
// import { MockAgents } from './agents.mock.js';
import { AzureAgents } from './agents.azure.js';
const impl = AzureAgents;
```

Todos los métodos son `async` y devuelven objetos JSON. Los mocks incluyen `_mock: true` para poder detectarlos en UI (banner "datos simulados").

---

## Mapa agente ↔ etapa del embudo

| Etapa | Método | Estado |
|---|---|---|
| Discovery | `marketDiscovery(casoUso, entidad)` | existente (demo) |
| Discovery / Assessment | `gapsYDependencias(casoUso, entidad)` ⭐ | nuevo · mock |
| API Design | `diseñarAPI(descripcionNL)` | existente |
| API Design | `construirAPI(dataDictionary)` | existente |
| API Design | `enriquecerAPI(yamlExistente)` | existente |
| API Lab | `refinarAPI(diseño, labResults)` ⭐ | nuevo · mock |
| Cross / write-back | `actualizarRoadmap(casoUso, entidad)` ⭐ | nuevo · mock |

---

## Contratos

### `gapsYDependencias(casoUso, entidad)` ⭐ — el agente central
Calcula el *delta* del caso de uso contra la radiografía. Ramifica por `casoUso.naturaleza`.

**Input:** `casoUso` (al menos `{ nombre, naturaleza, ecosistema.apis }`) + `entidad` (al menos `{ stack, grafoDependencias }`).

**Output:**
```jsonc
{
  "apisNecesarias":         [{ "nombre": "payments", "estado": "nueva|existente", "razon": "…" }],
  "necesidadesTecnologicas":[{ "item": "…", "capa": "backend|frontend", "existe": false, "inversionEstim": "20-30 jornadas" }],
  "necesidadesEquipo":      [{ "rol": "2 devs backend", "duracion": "3 meses", "motivo": "…" }],
  "gaps":                   ["Falta: …"],
  "dependencias":           [{ "origen": "API payments", "destino": "core-pagos", "tipo": "tecnica|organizativa|equipo", "estado": "satisfecha|bloqueante|riesgo", "descripcion": "…" }],
  "inversionIncremental":   { "capex": 90000, "opex": 30000, "confianza": "alta|media|baja" }
}
```
Las `dependencias` devueltas tienen la forma de aristas del grafo → se pueden inyectar directamente en `entidad.grafoDependencias`.

### `marketDiscovery(casoUso, entidad)`
**Output:** `{ hipotesisProducto, tam, sam, som, propension }`.

### `diseñarAPI(descripcionNL)`
**Output:** `{ useCase, iso20022Domain, paths[], schemas{} }` (diccionario de datos aprobable).

### `construirAPI(dataDictionary)`
**Output:** `{ openapi, artefacto, schemasGenerados[], cobertura{ totalCampos, iso20022, locales } }`.

### `enriquecerAPI(yamlExistente)`
**Output:** `{ camposEnriquecidos, cobertura, elementosISO }`.

### `refinarAPI(diseño, labResults)` ⭐ — cierra el bucle del Lab
**Output:** `{ refinamientos: [{ campo, cambio, motivo }], nuevoEstado: "refinada" }`.

### `actualizarRoadmap(casoUso, entidad)` ⭐ — write-back a la entidad
**Output:** `{ iniciativas: [{ nombre, slot, casoDeUsoId }], inversion: { capex, opex, devengo } }`.
El consumidor las agrega en `entidad.roadmap` e `entidad.inversion`.

---

## Cuando exista el backend
- Crear `core/agents.azure.js` que implemente los 7 métodos llamando a Azure Functions.
- Cada Function invoca Azure OpenAI (y, cuando aplique, RAG sobre `/kb` para `gapsYDependencias`).
- Mantener `_mock` fuera de las respuestas reales (o en `false`) para que la UI deje de mostrar el banner de simulación.
