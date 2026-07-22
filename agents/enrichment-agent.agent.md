# Enriquecimiento de APIs Existentes — Agent
## `agents/enrichment-agent.agent.md`

---

## Rol y propósito

Eres el agente responsable de construir y mantener `enrichment.html`: la sección de **Gobierno de APIs — Enriquecimiento del Diccionario de Datos** de la demo API Lab Accelerator de Minsait / BBVA Embedded Finance.

Esta sección representa el trabajo original que dio origen a todo el proyecto. Permite tomar un YAML de OpenAPI mal especificado (As-Is), procesarlo a través de un **pipeline determinista de 4 capas** que busca en la base vectorial ISO 20022 para enriquecer el diccionario de datos de cada campo, y finalmente generar artefactos técnicos To-Be. El agente de IA solo interviene cuando las capas programáticas no logran el match: la mayor parte del trabajo es RAG puro, no IA generativa.

La sección también incluye una **búsqueda simple** donde el usuario escribe un campo y su descripción para obtener el nombre canónico ISO 20022 correspondiente.

---

## Skills que debes cargar antes de construir

- `agents/synthetic-audiences.skill.md` — contexto del proyecto
- `agents/iso20022-pipeline.skill.md` — lógica de las 4 capas
- `.github/skills/vector-search/SKILL.md` — comportamiento del RAG con ChromaDB *(pendiente: aún no existe en el repo)*

---

## Estructura general de la pantalla

```
HEADER: Logo + "Gobierno de APIs · Enriquecimiento" + ← Volver al inicio

TOGGLE PRINCIPAL:
  [⚙ Pipeline completo — Mejorar un YAML]   [🔍 Búsqueda simple de campo]

═══════════════════════════════════════════
  ÁREA PRINCIPAL (cambia según el toggle)
═══════════════════════════════════════════
```

---

## MODO 1 — Pipeline completo: Mejorar un YAML existente

### Introducción visual

Franja de contexto en gris cerámico con texto explicativo:

> "Esta sección procesa un YAML de OpenAPI con un diccionario de datos incompleto o no normalizado. El pipeline aplica 4 capas progresivas — de mayor a menor determinismo — para enriquecer cada campo con su referencia ISO 20022 canónica. El agente de IA solo interviene en la Capa 4, cuando las búsquedas programáticas no logran un match con suficiente confianza."

### PASO 1 — Carga del YAML As-Is

#### Área de carga

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   📄  Sube tu YAML de OpenAPI                              │
│                                                            │
│   [Seleccionar fichero]   o usa el ejemplo precargado →   │
│                           [Cargar Bulk Payments PE]        │
│                                                            │
│   Formatos aceptados: .yaml · .yml                         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Al hacer clic en "Cargar Bulk Payments PE" se pre-carga el YAML mock de ejemplo (hardcodeado). Mostrar el contenido del YAML en un bloque de código con syntax highlighting (fondo oscuro, colores Minsait).

#### YAML mock pre-cargado (Bulk Payments PE — As-Is problemático)

```yaml
# Bulk Payments PE — As-Is (ANTES del enriquecimiento)
# Problemas: tipos incorrectos, campos sin descripción ISO,
# documentType mal mapeado, status ambiguo

openapi: "3.0.3"
info:
  title: "Bulk Payments PE"
  version: "2.0.19"
paths:
  /remittances:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/RemittanceCreateRequest"
  /remittances/{remittance-id}:
    get:
      responses:
        "200":
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Remittance"
    patch:
      responses:
        "200":
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/RemittancePatch"
components:
  schemas:
    RemittanceCreateRequest:
      type: object
      properties:
        amount:
          type: string          # ⚠ debería ser object con value + currency
          description: "Importe"
        status:
          type: object          # ⚠ ambiguo: ¿string enum o objeto?
        debtor:
          type: object
          properties:
            name:
              type: string
            documentType:
              type: string      # ⚠ baja confianza ISO
            id:
              type: integer     # ⚠ debería ser string
        creditor:
          type: object
          properties:
            name:
              type: string
            account:
              type: object
              properties:
                number:
                  type: string
                  description: "Numero de cuenta"
        endToEndId:
          type: string
        numberOfTransactions:
          type: number
        createdAt:
          type: string
          format: date-time
```

#### Estadísticas del YAML cargado

Mostrar inmediatamente tras cargar:

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  3 paths     │  8 schemas   │  13 campos   │  4 problemas │
│  detectados  │  analizados  │  a procesar  │  encontrados │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

Botón: `[🚀 Iniciar pipeline de enriquecimiento]`

---

### PASO 2 — Visualización del pipeline de 4 capas

Esta es la pantalla más importante de la sección. Mostrar el pipeline completo con animación secuencial por campo. El layout principal es una vista de dos columnas:

- **Columna izquierda (40%):** La tabla de campos procesados con su estado en cada capa
- **Columna derecha (60%):** El detalle de la capa activa en tiempo real

#### Header del pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚙ Pipeline ISO 20022 en ejecución                                  │
│  Base vectorial: iso_completa (134.136 elementos) · ChromaDB HNSW  │
│  Modelo embeddings: bge-small-en-v1.5 · Métrica: Cosine Distance   │
│                                                      [13/13] ████  │
└─────────────────────────────────────────────────────────────────────┘
```

#### Columna izquierda — Tabla de campos

Tabla scrollable con una fila por campo. Cada fila muestra:

| Campo | Tipo As-Is | Capa resuelta | Match ISO | Confianza | Estado |
|---|---|---|---|---|---|
| `amount` | string | C1 — Exact | ActiveCurrencyAndAmount | 100% | ✅ Auto |
| `status` | object | C3 — Vector | TransactionGroupStatus | 74% | ✅ Auto |
| `debtor.name` | string | C1 — Exact | Debtor.Name | 100% | ✅ Auto |
| `debtor.documentType` | string | C4 — LLM | OtherIdentification/SchemeName | 61% | ⚠ Revisión |
| `debtor.id` | integer | C2 — Reglas | Identification.Id | 100% | ✅ Auto |
| `creditor.name` | string | C1 — Exact | Creditor.Name | 100% | ✅ Auto |
| `creditor.account.number` | string | C3 — Vector | AccountIdentification/IBAN | 71% | ✅ Auto |
| `endToEndId` | string | C2 — Reglas | EndToEndIdentification | 100% | ✅ Auto |
| `numberOfTransactions` | number | C3 — Vector | NumberOfTransactions | 68% | ✅ Auto |
| `createdAt` | string/datetime | C2 — Reglas | ISODateTime | 100% | ✅ Auto |
| `name` (RemittancePatch) | string | C1 — Exact | Name.Max140Text | 100% | ✅ Auto |
| `payments[].paymentAmount` | — | C3 — Vector | PaymentAmount | 91% | ✅ Auto |
| `header.controlSum` | — | C4 — LLM | RemittanceAmountAndType | 55% | ⚠ Revisión |

Color coding de filas:
- ✅ Verde claro: resuelto automáticamente
- ⚠ Amarillo: requiere revisión humana (confianza < 0.65)
- 🔴 Rojo: no se encontró match válido (campo local)

#### Columna derecha — Detalle de la capa activa

Mostrar las 4 capas como bloques visuales apilados verticalmente. La capa actualmente procesando pulsa en accent pink. Las capas ya superadas aparecen en verde con checkmark.

```
┌─────────────────────────────────────────────────────────────────┐
│  Campo en proceso: debtor.documentType                          │
│  Payload: "documentType · string · tipo de documento identidad" │
└─────────────────────────────────────────────────────────────────┘

┌─ CAPA 1 — Exact Match Algorítmico ────────────────── ✅ Superada ─┐
│  alias-detection.json + semantic-clusters.json                    │
│  ⟶ 0ms · 100% precisión · Cubre ~30% casos                      │
│  → documentType NOT FOUND en alias-detection.json                 │
│  → CONTINÚA a Capa 2                                              │
└───────────────────────────────────────────────────────────────────┘

┌─ CAPA 2 — Rule-Based Patterns ────────────────────── ✅ Superada ─┐
│  regex: *Type → SchemeName · *Date → ISODate · *Id → Identification│
│  Cubre ~25% adicional · Determinista, auditable                    │
│  → Patrón *Type detectado: candidato "SchemeName"                  │
│  → Confianza insuficiente (< 0.75) → CONTINÚA a Capa 3           │
└───────────────────────────────────────────────────────────────────┘

┌─ CAPA 3 — Embedding Similarity (RAG) ─────── 🔄 EN PROCESO... ──┐
│  ChromaDB HNSW · bge-small-en-v1.5 · Cosine Distance             │
│  Vector query: [0.234, -0.891, 0.445, ... 384 dims]               │
│                                                                    │
│  Top-3 candidatos ISO 20022:                                       │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ #1  OtherIdentification/SchemeName      dist: 0.49  ★★★ │     │
│  │ #2  Proprietary/SchemeName              dist: 0.51  ★★☆ │     │
│  │ #3  IdentificationType/CodeOrProprietary dist: 0.58  ★☆☆│     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                    │
│  confidence = 1 - dist_normalizada = 0.61  < umbral (0.75)       │
│  → CONTINÚA a Capa 4 (LLM Decision)                               │
└───────────────────────────────────────────────────────────────────┘

┌─ CAPA 4 — LLM Decision ────────────────────── ⏳ Pendiente ──────┐
│  Recibe top-3 del embedding + contexto estructurado               │
│  Decide o rechaza con justificación                               │
│  [API name: POST /remittances · HTTP verb · schema context]       │
│  → 🤖 Agente IA intervendrá aquí                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ GEOGRAPHY OVERLAY ───────────────────────────────────────────────┐
│  Si no hay match válido → flag "requiere revisión"                │
│  → Campo específico local (DNI/PE, RFC/MX, CC/CO)                 │
└───────────────────────────────────────────────────────────────────┘
```

#### Cuando el agente necesita intervención del usuario

Cuando un campo llega a Capa 4 sin match válido, mostrar una burbuja de agente (estilo chat, fondo burgundy):

```
┌─────────────────────────────────────────────────────────────────┐
│ 🤖 ISO 20022 Enrichment Agent                                   │
│                                                                 │
│ Necesito tu ayuda con el campo "debtor.documentType".          │
│                                                                 │
│ He encontrado 3 candidatos en ISO 20022, pero ninguno supera   │
│ el umbral de confianza (0.75). Aquí están mis opciones:        │
│                                                                 │
│ ① OtherIdentification/SchemeName (dist: 0.49)                  │
│   → Tipo de identificación como DNI, PASSPORT, NIT             │
│   "Ideal si los valores son códigos de tipo de documento"       │
│                                                                 │
│ ② Proprietary/SchemeName (dist: 0.51)                           │
│   → Nombre de esquema propietario                               │
│   "Más genérico, válido si los valores son libres"              │
│                                                                 │
│ ③ Marcar como campo local (Geography Overlay)                   │
│   → Sin equivalente ISO universal (DNI/PE, RFC/MX, CC/CO)      │
│                                                                 │
│ ¿Cuál aplica a tu caso?                                         │
│                                                                 │
│ [① OtherIdentification]  [② Proprietary]  [③ Campo local]     │
└─────────────────────────────────────────────────────────────────┘
```

Al seleccionar una opción: el campo se marca con el resultado elegido y el pipeline continúa con el siguiente campo pendiente.

---

### PASO 3 — Resumen de resultados del enriquecimiento

Mostrar tras procesar todos los campos.

#### Panel de resumen

```
┌────────────────────────────────────────────────────────────────────┐
│  RESULTADO DEL ENRIQUECIMIENTO                                     │
├──────────────┬──────────────┬──────────────┬───────────────────────┤
│  11 campos   │  2 campos    │  0 campos    │  100% procesados      │
│  auto-match  │  revisados   │  sin match   │  en 4.2 segundos      │
└──────────────┴──────────────┴──────────────┴───────────────────────┘
```

#### Tabla de comparación As-Is vs To-Be

| Campo | Tipo As-Is | ISO 20022 | Tipo To-Be | Capa | ΔCambio |
|---|---|---|---|---|---|
| `amount` | string | ActiveCurrencyAndAmount | object {value, currency} | C1 | 🔄 Tipo cambiado |
| `debtor.id` | integer | Identification.Id | string | C2 | 🔄 Tipo corregido |
| `debtor.documentType` | string | OtherIdentification/SchemeName | string + enum | C4 | 📝 Enriquecido |
| `endToEndId` | string | EndToEndIdentification | string (maxLen: 35) | C2 | 📝 Restricción añadida |
| `numberOfTransactions` | number | NumberOfTransactions | integer (min: 1) | C3 | 🔄 Tipo precisado |
| `createdAt` | string | ISODateTime | string (format: date-time) | C2 | ✅ Correcto |
| `debtor.name` | string | Debtor.Name | string (maxLen: 140) | C1 | 📝 Restricción añadida |

Leyenda: 🔄 tipo corregido · 📝 metadatos enriquecidos · ✅ ya correcto · ⚠ requirió revisión

#### Problemas resueltos vs. pendientes

```
Resueltos automáticamente:
  ✅ amount: string → object (ActiveCurrencyAndAmount)
  ✅ debtor.id: integer → string (estándar ISO)
  ✅ endToEndId: maxLength: 35 añadido
  ✅ numberOfTransactions: number → integer

Requirieron revisión humana:
  ⚠ debtor.documentType → OtherIdentification/SchemeName (validado por usuario)
  ⚠ header.controlSum → RemittanceAmountAndType (validado por usuario)
```

---

### PASO 4 — Generación de artefactos

Botón: `[📦 Generar artefactos To-Be]`

Animación de generación (2 segundos):
```
[10:34:22] ✓ Aplicando cambios al YAML original...
[10:34:23] ✓ Generando JSON Schema con $ref canónicos...
[10:34:24] ✓ Construyendo diccionario de datos .md...
[10:34:24] ✓ Generando Excel para equipos funcionales...
[10:34:25] ✅ 4 artefactos generados
```

#### Artefactos generados (tabs)

**Tab: YAML To-Be** — Mostrar el YAML enriquecido con syntax highlighting:

```yaml
# Bulk Payments PE — To-Be (DESPUÉS del enriquecimiento)
# Enriquecido con ISO 20022 · Pipeline 4 capas · bge-small-en-v1.5

openapi: "3.1.0"
info:
  title: "Bulk Payments PE"
  version: "2.0.19"
  x-iso20022-domain: "pain"
  x-gov-owner: "API Governance · Embedded Finance"
components:
  schemas:
    RemittanceCreateRequest:
      type: object
      properties:
        amount:
          $ref: "schemas/common/Amount.schema.json"
          # ISO 20022: ActiveCurrencyAndAmount
          # x-iso20022-ref: "ActiveCurrencyAndAmount"
          # x-gov-confidence: 1.0 (Capa 1 — Exact Match)
        status:
          type: string
          enum: [PENDING, PROCESSING, COMPLETED, CANCELLED]
          x-iso20022-ref: "TransactionGroupStatus"
          # x-gov-confidence: 0.74 (Capa 3 — Embedding)
        debtor:
          type: object
          x-iso20022-ref: "PartyIdentification"
          properties:
            name:
              type: string
              maxLength: 140
              x-iso20022-ref: "Debtor.Name"
              x-iso20022-type: "Max140Text"
            documentType:
              type: string
              x-iso20022-ref: "OtherIdentification/SchemeName"
              x-gov-note: "Values vary by geography: DNI (PE), RFC (MX)"
              x-gov-reviewed: true
              # ⚠ Capa 4 — LLM + revisión humana
            id:
              type: string               # corregido: integer → string
              x-iso20022-ref: "Identification.Id"
              x-gov-note: "Corrected from integer to string per ISO standard"
        endToEndId:
          type: string
          maxLength: 35                  # añadido por Capa 2 — Rule-Based
          x-iso20022-ref: "EndToEndIdentification"
        numberOfTransactions:
          type: integer                  # corregido: number → integer
          minimum: 1
          x-iso20022-ref: "NumberOfTransactions"
      required: [amount, debtor, endToEndId]
      additionalProperties: false
```

**Tab: JSON Schema** — Mostrar Amount.schema.json común:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://api.bbva.com/schemas/common/Amount.schema.json",
  "title": "Amount",
  "x-iso20022-ref": "ActiveCurrencyAndAmount",
  "x-gov-owner": "API Governance · Embedded Finance",
  "x-gov-confidence": 1.0,
  "x-gov-layer": "C1-ExactMatch",
  "type": "object",
  "properties": {
    "value": {
      "type": "number",
      "minimum": 0,
      "examples": [250.00, 1500.50]
    },
    "currency": {
      "type": "string",
      "pattern": "^[A-Z]{3}$",
      "x-iso20022-ref": "ActiveOrHistoricCurrencyCode",
      "examples": ["EUR", "PEN", "MXN"]
    }
  },
  "required": ["value", "currency"],
  "additionalProperties": false
}
```

**Tab: Diccionario .md** — Tabla legible para equipos funcionales con todas las columnas del enriquecimiento.

**Tab: Reporte QA** — Mostrar estadísticas del pipeline:

```
REPORTE DE ENRIQUECIMIENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Campos procesados:        13 / 13  (100%)
Resueltos C1 (Exact):     5 campos  (38%)
Resueltos C2 (Reglas):    3 campos  (23%)
Resueltos C3 (Vector):    3 campos  (23%)
Resueltos C4 (LLM):       2 campos  (15%)  ← intervención del agente
Campos locales:           0 campos   (0%)

Confianza promedio:       0.89
Umbral aplicado:          0.75
Tiempo total:             4.2 segundos
Base vectorial:           134.136 elementos ISO 20022
Modelo embeddings:        bge-small-en-v1.5 (384 dims, cosine)

Correcciones de tipo:     4 campos corregidos
Restricciones añadidas:   6 propiedades nuevas (maxLength, minimum, enum)
$ref generados:           8 referencias canónicas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Botón de descarga: `[⬇ Descargar YAML To-Be]` — descarga el YAML enriquecido.

---

## MODO 2 — Búsqueda simple de campo ISO 20022

### Layout

Vista limpia con una sola área de búsqueda central.

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│   🔍 Busca el nombre estándar ISO 20022 para tu campo              │
│                                                                    │
│   Nombre del campo:  [________________________]                    │
│   Descripción:       [________________________]                    │
│                      (opcional pero mejora la precisión)           │
│                                                                    │
│   Ejemplos rápidos:  [amount]  [documentType]  [creditorAccount]  │
│                                                                    │
│                      [🔍 Buscar en ISO 20022]                      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Proceso de búsqueda (animación)

Al hacer clic en buscar, mostrar el proceso de forma visual:

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔄 Procesando: "amount · Importe monetario de la transacción"   │
│                                                                 │
│ 1. Generando embedding del campo...                             │
│    Vector: [0.234, -0.891, 0.445, 0.12, ... 384 dimensiones]  │
│    Modelo: bge-small-en-v1.5                                    │
│                                                                 │
│ 2. Consultando ChromaDB (134.136 elementos ISO 20022)...        │
│    Algoritmo: HNSW · Métrica: Cosine Distance                   │
│    ██████████████████████████ 100%                              │
│                                                                 │
│ 3. Top-3 candidatos encontrados en 89ms ✓                       │
└─────────────────────────────────────────────────────────────────┘
```

### Resultados de la búsqueda

Mostrar los 3 candidatos más próximos en tarjetas ordenadas por distancia coseno:

```
RESULTADOS PARA: "amount"

┌─ #1 ─────────────────────────────────────────────────── 🏆 MATCH ─┐
│  ActiveCurrencyAndAmount                                           │
│  Distancia coseno: 0.31  |  Confianza: ALTA (> 0.75)             │
│  Tipo ISO: Complex Type · Dominio: pain (Payment Initiation)      │
│                                                                    │
│  Definición ISO:                                                   │
│  "A number of monetary units specified in an active currency       │
│   where the unit of currency is explicit and compliant with        │
│   ISO 4217."                                                       │
│                                                                    │
│  Estructura sugerida:                                              │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ amount:                                                     │  │
│  │   type: object                                              │  │
│  │   x-iso20022-ref: "ActiveCurrencyAndAmount"                 │  │
│  │   properties:                                               │  │
│  │     value: { type: number, minimum: 0 }                     │  │
│  │     currency: { type: string, pattern: "^[A-Z]{3}$" }       │  │
│  │   required: [value, currency]                               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  [✓ Usar este estándar]  [📋 Copiar YAML]                         │
└───────────────────────────────────────────────────────────────────┘

┌─ #2 ──────────────────────────────────────────── Alternativa ─────┐
│  Amount                                                            │
│  Distancia coseno: 0.44  |  Confianza: MEDIA (0.50–0.75)         │
│  Tipo ISO: Simple Type · Dominio: common                          │
│                                                                    │
│  Definición ISO:                                                   │
│  "Number of monetary units specified in a currency..."             │
│                                                                    │
│  [Ver detalles]                                                    │
└───────────────────────────────────────────────────────────────────┘

┌─ #3 ──────────────────────────────────────────── Alternativa ─────┐
│  RemittanceAmountAndType                                           │
│  Distancia coseno: 0.52  |  Confianza: BAJA (< 0.50)             │
│  Tipo ISO: Complex Type · Dominio: camt (Cash Management)         │
│                                                                    │
│  [Ver detalles]                                                    │
└───────────────────────────────────────────────────────────────────┘
```

### Bloque de interpretación geográfica

Mostrar siempre debajo de los resultados:

```
¿No encuentras tu campo en ISO 20022?

Si el campo es específico de tu geografía (por ejemplo: RFC, CLABE,
CLABE para México · DNI, RUC para Perú · NIT, CC para Colombia),
márcalo como campo local:

  x-gov-note: "Local field — specific to [GEO]"
  x-gov-geography: "[MX|PE|CO|ES|AR]"

Estos campos van a /geography-overlays/ en el repositorio canónico
y no bloquean la aprobación del schema en el proceso de gobernanza.

[📖 Ver catálogo de campos locales por geografía]
```

### Búsquedas de ejemplo precargadas

Botones de ejemplo rápido que se autocompletan al hacer clic:

| Campo | Descripción | Resultado esperado |
|---|---|---|
| `amount` | Importe monetario de la transacción | ActiveCurrencyAndAmount (dist: 0.31) |
| `documentType` | Tipo de documento de identidad (DNI, PASSPORT...) | OtherIdentification/SchemeName (dist: 0.49) |
| `endToEndId` | Identificador único de extremo a extremo | EndToEndIdentification (dist: 0.35) |
| `creditorAccount` | Cuenta bancaria del beneficiario / acreedor | AccountIdentification/IBAN (dist: 0.38) |
| `numberOfTransactions` | Número de transacciones en el lote | NumberOfTransactions (dist: 0.41) |
| `status` | Estado del proceso de pago | TransactionGroupStatus (dist: 0.44) |

---

## Integración con el resto de secciones

### CTA al final de ambos modos

Al finalizar el pipeline completo o una búsqueda, mostrar:

```
┌─────────────────────────────────────────────────────────────────┐
│ ¿Tienes el campo enriquecido? Úsalo para diseñar tu nueva API.  │
│                                                                 │
│ [→ Ir al Diseño de APIs con Agentes IA]                        │
└─────────────────────────────────────────────────────────────────┘
```

### Navegación de retorno

Siempre visible en el header: `← Volver al inicio`

---

## Notas de arquitectura para mostrar al usuario

Incluir un bloque informativo plegable (acordeón) titulado "¿Cómo funciona el pipeline?" con el siguiente contenido explicativo orientado a negocio:

> **Capa 1 — Exact Match:** Búsqueda directa en un diccionario de aliases predefinidos (alias-detection.json). Si el campo tiene un nombre exactamente conocido, el match es instantáneo (0ms) y 100% preciso. Cubre el 30% de los campos.
>
> **Capa 2 — Reglas Deterministas:** Patrones basados en sufijos y prefijos del nombre del campo (`*Amount`, `*Date`, `*Id`, `*Type`, `*Status`). Sin IA, sin embeddings. 100% auditable. Cubre el 25% adicional.
>
> **Capa 3 — Búsqueda Vectorial (RAG):** El campo se convierte en un vector de 384 dimensiones usando el modelo `bge-small-en-v1.5`. Se busca en ChromaDB entre 134.136 elementos ISO 20022 usando distancia coseno para encontrar los 3 candidatos semánticamente más próximos. Esto **no es IA generativa**: es matemática de similitud semántica. Cubre el 35% adicional.
>
> **Capa 4 — LLM Decision:** Solo cuando las 3 capas anteriores no logran un match con confianza > 0.75, el agente de IA recibe los 3 candidatos del vector y el contexto del campo (API, verbo HTTP, schema) para tomar la decisión final o solicitar revisión humana. Cubre el 10% restante.

---

## Stubs de integración real

```javascript
// ── CAPA 3 ────────────────────────────────────────────────────────
// ANTHROPIC_CALL: No aplica — esta capa es RAG puro, no LLM
// Implementación real:
//   1. XenovaEmbeddingFunction.embed(fieldPayload)
//      → vector[384] con bge-small-en-v1.5 (normalize: true)
//   2. chromaCollection.query({ queryEmbeddings: [vector], nResults: 3 })
//      → { ids, documents, distances }
//   3. confidence = 1 - (distances[0] / 2)  // normalizar cosine [0,2] → [0,1]

// ── CAPA 4 ────────────────────────────────────────────────────────
// ANTHROPIC_CALL: iso20022-enricher → skill: x-iso20022-ref · x-bbva-status
// Input: {
//   field: { name, type, description, domain },
//   candidates: [{ isoName, definition, distance }],  // top-3 de Capa 3
//   context: { apiName, httpVerb, schemaName }
// }
// Output: {
//   decision: "accept" | "reject" | "review",
//   selectedCandidate: isoName,
//   confidence: float,
//   justification: string,
//   suggestedOasExtensions: { "x-iso20022-ref": ..., "x-gov-note": ... }
// }
// Model: claude-sonnet-4-20250514

// ── BÚSQUEDA SIMPLE ───────────────────────────────────────────────
// ANTHROPIC_CALL: No aplica — la búsqueda simple es RAG puro
// Igual que Capa 3, sin intervención de LLM
// Si distance > 0.75 en todos los candidatos → mostrar aviso "considera campo local"
```
