# ISO 20022 Pipeline — Skill
## `agents/iso20022-pipeline.skill.md`

---

## Propósito

Define la lógica completa del pipeline de enriquecimiento de 4 capas que transforma campos de APIs As-Is en campos enriquecidos con referencia canónica ISO 20022. Cargar esta skill cuando el agente necesite procesar campos de un YAML o responder a una búsqueda simple.

---

## Arquitectura del pipeline

El pipeline aplica las capas en orden estricto. Un campo resuelto en Capa N no llega a Capa N+1. El objetivo es maximizar el uso de métodos deterministas (C1, C2) y minimizar el uso del LLM (C4).

```
Campo As-Is (nombre + tipo + descripción + dominio)
    │
    ▼
[CAPA 1] Exact Match Algorítmico
    │ match?  → Resultado automático (confianza: 1.0)
    │ no match ↓
[CAPA 2] Rule-Based Patterns
    │ match?  → Resultado automático (confianza: 1.0)
    │ no match ↓
[CAPA 3] Embedding Similarity (RAG)
    │ confidence ≥ 0.75?  → Resultado automático
    │ confidence < 0.75   ↓
[CAPA 4] LLM Decision
    │ decide?  → Resultado con justificación
    │ rechaza  ↓
[GEOGRAPHY OVERLAY]
    → Campo local, flag "requiere revisión"
```

---

## Capa 1 — Exact Match Algorítmico

**Fuentes:** `alias-detection.json` + `semantic-clusters.json`
**Velocidad:** ~0ms · **Cobertura estimada:** ~30% de campos · **Precisión:** 100%

### Alias dictionary (subset para demo)

```javascript
const ALIAS_DETECTION = {
  // Campos monetarios
  "amount":                 { iso: "ActiveCurrencyAndAmount",           type: "object" },
  "paymentAmount":          { iso: "ActiveCurrencyAndAmount",           type: "object" },
  "totalAmount":            { iso: "ActiveCurrencyAndAmount",           type: "object" },
  "instructedAmount":       { iso: "InstructedAmount",                  type: "object" },
  "remittanceAmount":       { iso: "RemittanceAmountAndType",           type: "object" },

  // Identificadores de partes
  "debtor":                 { iso: "PartyIdentification",               type: "object" },
  "creditor":               { iso: "PartyIdentification",               type: "object" },
  "debtor.name":            { iso: "Debtor.Name",                       type: "string", maxLength: 140 },
  "creditor.name":          { iso: "Creditor.Name",                     type: "string", maxLength: 140 },
  "name":                   { iso: "Name",                              type: "string", maxLength: 140 },

  // Cuentas
  "iban":                   { iso: "AccountIdentification.IBAN",        type: "string", pattern: "^[A-Z]{2}[0-9]{2}[A-Z0-9]+$" },
  "creditorAccount":        { iso: "AccountIdentification",             type: "object" },
  "debtorAccount":          { iso: "AccountIdentification",             type: "object" },
  "creditor.account.iban":  { iso: "AccountIdentification.IBAN",        type: "string" },
  "account.number":         { iso: "AccountIdentification",             type: "string" },

  // Pagos
  "remittanceId":           { iso: "PaymentIdentification.EndToEndId",  type: "string", maxLength: 35 },
  "paymentId":              { iso: "PaymentIdentification",             type: "string" },

  // Moneda
  "currency":               { iso: "ActiveOrHistoricCurrencyCode",      type: "string", pattern: "^[A-Z]{3}$" },
  "currencyCode":           { iso: "ActiveOrHistoricCurrencyCode",      type: "string", pattern: "^[A-Z]{3}$" },

  // Importes numéricos
  "amount.value":           { iso: "Amount",                            type: "number", minimum: 0 },

  // Estado
  "status":                 { iso: "TransactionGroupStatus",            type: "string" },
  "paymentStatus":          { iso: "PaymentGroupStatus",                type: "string" },

  // Error model BBVA
  "code":                   { iso: "StatusCode",                        type: "string" },
  "messages":               { iso: "ErrorMessages",                     type: "array" },
  "messages.code":          { iso: "TransactionsRejectionsReason",      type: "string" },
  "messages.parameters":    { iso: "Parameters",                        type: "array" },

  // Alias de paginación (normalizar a pageSize)
  "limit":                  { iso: null, alias: "pageSize",             govNote: "Normalizar a 'pageSize' (canon)" },
  "size":                   { iso: null, alias: "pageSize",             govNote: "Normalizar a 'pageSize' (canon)" },
  "pageSize":               { iso: "Pagination.PageSize",               type: "integer", minimum: 1 },
};
```

---

## Capa 2 — Rule-Based Patterns

**Tipo:** Regex sobre el nombre del campo · **Cobertura estimada:** ~25% adicional · **Determinista y auditable**

```javascript
const RULE_BASED_PATTERNS = [
  {
    pattern: /Amount$/i,
    iso: "ActiveCurrencyAndAmount",
    suggestedType: "object",
    confidence: 1.0,
    note: "Sufijo *Amount → monetary amount object per ISO"
  },
  {
    pattern: /Id$/i,
    iso: "Identification",
    suggestedType: "string",
    confidence: 1.0,
    note: "Sufijo *Id → Identification (string, not integer)"
  },
  {
    pattern: /Identifier$/i,
    iso: "Identification",
    suggestedType: "string",
    confidence: 1.0
  },
  {
    pattern: /^endToEnd/i,
    iso: "EndToEndIdentification",
    suggestedType: "string",
    maxLength: 35,
    confidence: 1.0
  },
  {
    pattern: /Date$/i,
    iso: "ISODate",
    suggestedType: "string",
    format: "date",
    confidence: 1.0
  },
  {
    pattern: /DateTime$/i,
    iso: "ISODateTime",
    suggestedType: "string",
    format: "date-time",
    confidence: 1.0
  },
  {
    pattern: /Type$/i,
    iso: "SchemeName",
    suggestedType: "string",
    confidence: 0.70,
    note: "Baja confianza: *Type es ambiguo, continúa a C3"
  },
  {
    pattern: /Status$/i,
    iso: "TransactionGroupStatus",
    suggestedType: "string",
    confidence: 0.80
  },
  {
    pattern: /Code$/i,
    iso: "Code",
    suggestedType: "string",
    confidence: 0.85
  },
  {
    pattern: /^(number|count|num)Of/i,
    iso: "Quantity",
    suggestedType: "integer",
    minimum: 0,
    confidence: 0.90
  },
  {
    pattern: /^numberOfTransactions/i,
    iso: "NumberOfTransactions",
    suggestedType: "integer",
    minimum: 1,
    confidence: 1.0
  },
];

// Una regla con confianza < 0.75 pasa a Capa 3 en lugar de resolver
```

---

## Capa 3 — Embedding Similarity (RAG)

**Base vectorial:** ChromaDB `iso_completa` (134.136 elementos ISO 20022)
**Modelo:** `bge-small-en-v1.5` (384 dimensiones, normalizado, cosine distance)
**Cobertura estimada:** ~35% adicional · **Umbral de auto-aceptación:** distance < 0.50 (confidence > 0.75)

### Construcción del payload de búsqueda

```javascript
function buildSearchPayload(field) {
  // Payload Nivel C (Enriquecido): Nombre + Tipo + Descripción + Dominio
  const parts = [field.name];

  if (field.type) parts.push(field.type);
  if (field.description) parts.push(field.description);
  if (field.domain) parts.push(`domain: ${field.domain}`);
  if (field.example) parts.push(`example: ${field.example}`);

  return parts.join(' · ');
  // Ejemplo: "documentType · string · tipo de documento de identidad · domain: payments"
}
```

### Interpretación de distancias coseno

```javascript
const THRESHOLDS = {
  AUTO_ACCEPT:    0.50,  // distance < 0.50 → auto-aceptar (confidence > 0.75)
  REVIEW:         0.65,  // 0.50 ≤ dist < 0.65 → aceptar con nota de revisión
  LLM_ESCALATE:  0.65,  // distance ≥ 0.65 → escalar a Capa 4 (LLM)
};

function interpretDistance(distance) {
  if (distance < 0.35)  return { label: "ALTA",  auto: true,  color: "green" };
  if (distance < 0.50)  return { label: "MEDIA", auto: true,  color: "yellow" };
  if (distance < 0.65)  return { label: "BAJA",  auto: false, color: "orange" };
  return                       { label: "MUY BAJA", auto: false, escalate: true, color: "red" };
}
```

### Resultados mock de Capa 3 (para demo)

```javascript
const MOCK_VECTOR_RESULTS = {
  "documentType": [
    { iso: "OtherIdentification/SchemeName", distance: 0.49, domain: "payments" },
    { iso: "Proprietary/SchemeName",         distance: 0.51, domain: "common" },
    { iso: "IdentificationType/Code",         distance: 0.58, domain: "accounts" },
  ],
  "creditor.account.number": [
    { iso: "AccountIdentification/IBAN",      distance: 0.39, domain: "payments" },
    { iso: "GenericAccountIdentification",    distance: 0.45, domain: "common" },
    { iso: "CashAccountType",                 distance: 0.62, domain: "payments" },
  ],
  "numberOfTransactions": [
    { iso: "NumberOfTransactions",            distance: 0.41, domain: "payments" },
    { iso: "MaximumNumberOfTransactions",     distance: 0.48, domain: "payments" },
    { iso: "TotalNumberOfTransactions",       distance: 0.51, domain: "camt" },
  ],
  "status": [
    { iso: "TransactionGroupStatus",          distance: 0.44, domain: "payments" },
    { iso: "PaymentGroupStatus",              distance: 0.47, domain: "payments" },
    { iso: "ClosurePending",                  distance: 0.61, domain: "camt" },
  ],
  "header.controlSum": [
    { iso: "RemittanceAmountAndType",         distance: 0.52, domain: "camt" },
    { iso: "ControlSum",                      distance: 0.55, domain: "payments" },
    { iso: "TotalAmount",                     distance: 0.60, domain: "common" },
  ],
};
```

---

## Capa 4 — LLM Decision

**Trigger:** Solo cuando Capa 3 retorna distance ≥ 0.65 en todos los top-3 candidatos
**Cobertura estimada:** ~10% de campos · **Requiere API de Anthropic**
**Output esperado:** decision (accept/reject/review) + justificación

### Contexto que se envía al LLM

```javascript
// ANTHROPIC_CALL stub
const llmPayload = {
  role: "user",
  content: `
Eres un experto en el estándar ISO 20022 y en el diseño de APIs financieras.
Debes decidir el mapeo correcto para el siguiente campo de una API bancaria:

Campo: ${field.name}
Tipo actual: ${field.type}
Descripción: ${field.description || "Sin descripción"}
Contexto API: ${apiName} · ${httpVerb} ${endpoint}
Schema: ${schemaName}

Candidatos encontrados por búsqueda vectorial:
1. ${candidate1.iso} (distancia: ${candidate1.distance})
   Definición ISO: "${candidate1.definition}"
2. ${candidate2.iso} (distancia: ${candidate2.distance})
   Definición ISO: "${candidate2.definition}"
3. ${candidate3.iso} (distancia: ${candidate3.distance})
   Definición ISO: "${candidate3.definition}"

Decide:
- Si alguno de los candidatos es correcto: selecciónalo y justifica (max 2 frases).
- Si ninguno aplica: recomienda marcarlo como campo local con x-gov-geography.
- Si necesitas más contexto del equipo: indica qué preguntar.

Responde en JSON: { decision: "accept|reject|review", selected: "isoName|null", confidence: float, justification: "...", question: "..." }
  `
};
```

---

## Geography Overlay

Campos que no tienen equivalente ISO universal deben marcarse con:

```yaml
fieldName:
  type: string
  x-gov-note: "Local field — no ISO 20022 universal equivalent"
  x-gov-geography: "PE"   # PE | MX | CO | ES | AR | XG
  x-gov-values: "DNI, RUC, CE"   # valores válidos en la geografía
```

Campos locales conocidos por geografía:

```javascript
const LOCAL_FIELDS_BY_GEO = {
  MX: ["RFC", "CLABE", "CURP", "CIE"],
  PE: ["RUC", "DNI", "CE"],
  CO: ["NIT", "CC", "CE", "TI"],
  ES: ["NIF", "NIE", "CIF"],
  AR: ["CUIT", "CUIL", "DNI"],
};
```
