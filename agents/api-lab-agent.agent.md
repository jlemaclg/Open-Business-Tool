# API Lab Accelerator — Agent
## `agents/api-lab-agent.agent.md`

---

## Rol y propósito

Eres el agente responsable de construir y mantener `stages/3-api-lab/index.html`: la herramienta 05 API Lab Accelerator de la plataforma Open Business Accelerator de Minsait.

Esta sección simula la interfaz de un API Manager / Developer Portal interno donde el equipo de la entidad financiera puede ver las APIs desplegadas en el sandbox, monitorizar consumos de partners, y gestionar el ciclo de vida de las APIs antes de promoverlas a producción.

Es una interfaz de tipo APIM (API Management): visual, densa en datos, orientada a operadores técnicos y a negocio con supervisión del portafolio de APIs activo en el lab.

---

## Skills que debes cargar antes de construir

- `agents/synthetic-audiences.skill.md` — referencia de segmentos para contextualizar APIs
- `.github/skills/api-catalog-mock/SKILL.md` — catálogo de APIs mock con sus datos de consumo *(pendiente: aún no existe en el repo)*

---

## Layout general

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER: Logo Open Business · API Lab · Estado del entorno           │
├──────────────┬──────────────────────────────────────────────────────┤
│ LEFT NAV     │  ÁREA PRINCIPAL (cambia según la sección activa)     │
│ (sidebar)    │                                                       │
│              │                                                       │
│  - Dashboard │                                                       │
│  - APIs      │                                                       │
│  - Partners  │                                                       │
│  - Métricas  │                                                       │
│  - Desplegar │                                                       │
└──────────────┴──────────────────────────────────────────────────────┘
│ FOOTER: entorno · fecha · versión                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Header

Fondo dark (`#260717`). Contenido:
- Izquierda: logo "Open Business" en Georgia + separador + "API Lab"
- Centro: badge de entorno `● SANDBOX · Controlado` en verde
- Derecha: `← Volver al inicio` + badge "FASE BETA"

Indicadores de estado rápidos en el header (chips):
```
[✓ 6 APIs activas]  [4 partners conectados]  [↑ 2.341 calls hoy]  [⚡ 99.2% uptime]
```

---

## Sidebar de navegación

Fondo `#4F062A`. Items:

```
📊 Dashboard          ← activo por defecto
🔌 APIs en Sandbox
👥 Partners
📈 Métricas
🚀 Desplegar API      ← acción principal
```

Al hacer clic en cada item el área principal cambia (sin recargar la página).

---

## SECCIÓN: Dashboard (vista por defecto)

### Fila de KPIs globales (4 stats cards)

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ APIs activas │ Partners     │ Calls hoy    │ Uptime       │
│     6        │     4        │   2.341      │   99.2%      │
│ en sandbox   │ conectados   │ +18% vs ayer │ últimas 24h  │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Actividad reciente (tabla)

Últimas 10 llamadas al sandbox. Mock hardcodeado, simular timestamps recientes:

| Timestamp | Partner | API | Método | Endpoint | Status | Latencia |
|---|---|---|---|---|---|---|
| hace 2 min | Fintech A | Remittances API | POST | /remittances | 201 ✅ | 143ms |
| hace 3 min | Open Banking B | Scoring API | GET | /credit-scoring/alternative | 200 ✅ | 89ms |
| hace 5 min | Integrador C | Disbursements API | POST | /disbursements | 201 ✅ | 201ms |
| hace 7 min | Fintech A | KYC Lite API | POST | /kyc/lite | 200 ✅ | 312ms |
| hace 12 min | Open Banking B | Remittances API | GET | /remittances/{id} | 404 ⚠️ | 67ms |
| hace 15 min | Empresa D | Payments API | POST | /payments/batch | 202 ✅ | 445ms |
| hace 18 min | Fintech A | Accounts API | GET | /accounts/{id}/balance | 200 ✅ | 78ms |
| hace 22 min | Integrador C | Remittances API | DELETE | /remittances/{id} | 204 ✅ | 55ms |
| hace 28 min | Open Banking B | Scoring API | POST | /credit-scoring/batch | 200 ✅ | 567ms |
| hace 35 min | Empresa D | KYC Lite API | GET | /kyc/{id}/status | 200 ✅ | 91ms |

Status codes con colores: 2xx verde, 4xx naranja, 5xx rojo.

### Mini-gráfico de calls (últimas 24h)

Gráfico de barras simple en SVG/Canvas. 24 barras (una por hora). Pico en horas de oficina (9-18h). Colores: barras en accent pink, fondo `#f8f3f5`.

---

## SECCIÓN: APIs en Sandbox

### Catálogo de APIs mock (6 APIs activas + 2 en borrador)

Cada API se muestra como una tarjeta expandible:

#### API 1 — Remittances API ✅ ACTIVA
```
Versión: 1.0.0  |  Creada por: Equipo Créditos  |  Desplegada: hace 3 días
ISO 20022: pain.001  |  Paths: 5  |  Partners activos: 3
Calls hoy: 847  |  Latencia p95: 143ms  |  Error rate: 0.2%
[Ver docs]  [Ver métricas]  [Gestionar acceso]  [Promover a producción ↗]
```

#### API 2 — Alternative Scoring API ✅ ACTIVA
```
Versión: 2.1.0  |  Creada por: Equipo Data & AI  |  Desplegada: hace 8 días
ISO 20022: —  |  Paths: 4  |  Partners activos: 2
Calls hoy: 412  |  Latencia p95: 312ms  |  Error rate: 0.8%
[Ver docs]  [Ver métricas]  [Gestionar acceso]  [Promover a producción ↗]
```

#### API 3 — KYC Lite API ✅ ACTIVA
```
Versión: 1.2.0  |  Creada por: Equipo KYC  |  Desplegada: hace 5 días
ISO 20022: —  |  Paths: 3  |  Partners activos: 2
Calls hoy: 298  |  Latencia p95: 267ms  |  Error rate: 1.1%
[Ver docs]  [Ver métricas]  [Gestionar acceso]  [Promover a producción ↗]
```

#### API 4 — Disbursements API ✅ ACTIVA
```
Versión: 1.0.0  |  Creada por: Equipo Pagos  |  Desplegada: hace 2 días
ISO 20022: pacs.008  |  Paths: 6  |  Partners activos: 1
Calls hoy: 521  |  Latencia p95: 198ms  |  Error rate: 0.0%
[Ver docs]  [Ver métricas]  [Gestionar acceso]  [Promover a producción ↗]
```

#### API 5 — Accounts Embedded API ✅ ACTIVA
```
Versión: 3.0.1  |  Creada por: Equipo Banca Digital  |  Desplegada: hace 12 días
ISO 20022: camt.053  |  Paths: 8  |  Partners activos: 3
Calls hoy: 189  |  Latencia p95: 89ms  |  Error rate: 0.3%
[Ver docs]  [Ver métricas]  [Gestionar acceso]  [Promover a producción ↗]
```

#### API 6 — Batch Payments API ✅ ACTIVA
```
Versión: 1.1.0  |  Creada por: Equipo Pagos  |  Desplegada: hace 6 días
ISO 20022: pain.001  |  Paths: 4  |  Partners activos: 1
Calls hoy: 74  |  Latencia p95: 445ms  |  Error rate: 2.1%
[Ver docs]  [Ver métricas]  [Gestionar acceso]  [Promover a producción ↗]
```

#### API 7 — Insurance Embedded API ⏳ BORRADOR
```
Versión: 0.1.0  |  Creada por: Equipo Seguros  |  Estado: en revisión
ISO 20022: —  |  Paths: 0 diseñados / 3 planificados
[Diseñar con Agente IA →]  [Ver borrador]
```

#### API 8 — Gig Credit API ⏳ BORRADOR
```
Versión: 0.2.0  |  Creada por: Equipo Créditos  |  Estado: pendiente aprobación
ISO 20022: —  |  Paths: 4 diseñados
[Diseñar con Agente IA →]  [Ver borrador]  [Solicitar revisión]
```

### Filtros de la vista

Pills filtrables sobre las tarjetas:
`[Todas]  [Activas]  [Borradores]  [Con alertas]  [Mis APIs]`

---

## SECCIÓN: Partners

### Lista de partners conectados al sandbox

Tabla con estado y actividad:

| Partner | Tipo | Estado | APIs autorizadas | Calls hoy | SLA | Acceso desde |
|---|---|---|---|---|---|---|
| 🟢 Fintech Partner A | Fintech | ACTIVO | Remittances, KYC Lite, Accounts | 486 | 99.8% | hace 8 días |
| 🔴 Open Banking B | Aggregador | TESTING | Scoring, Remittances | 274 | 98.1% | hace 4 días |
| 🔴 Integrador C | SI | TESTING | Disbursements, Remittances | 181 | 100% | hace 2 días |
| ⚫ Empresa D | Corporativo | EN ESPERA | Batch Payments, Accounts | — | — | pendiente |

### Por cada partner (expandible)

Al expandir mostrar:
- Credentials: Client ID (ofuscado: `sk_sandbox_••••••••••••••••`)
- Rate limit: X llamadas/min / Y llamadas/día
- Últimas 5 llamadas con status
- Botones: `[Gestionar acceso]` `[Revocar]` `[Ver historial]`

### Botón de acción

`+ Invitar nuevo partner` — al hacer clic muestra un modal con formulario:
```
Nombre del partner:     [____________]
Email de contacto:      [____________]
APIs a autorizar:       [checkboxes con las 6 APIs activas]
Rate limit:             [select: Standard / Premium / Custom]
[Enviar invitación]     (mock: muestra toast "Invitación enviada")
```

---

## SECCIÓN: Métricas

### Gráficos de rendimiento (SVG/Canvas puros)

**Gráfico 1 — Calls por API (barras horizontales)**
```
Remittances API      ████████████████████ 847
Disbursements API    ████████████ 521
Alternative Scoring  ████████ 412
KYC Lite API         ██████ 298
Accounts Embedded    ████ 189
Batch Payments       ██ 74
```

**Gráfico 2 — Calls por partner (dona)**
Fintech A: 486 (20.8%) / Open Banking B: 274 (11.7%) / Integrador C: 181 (7.8%) / Resto: 1.400 (59.8%)

**Gráfico 3 — Latencia p95 por API (línea de tiempo)**
24 horas. Líneas de colores por API. Picos en las horas punta (10h y 16h). Línea de umbral SLA en rojo (500ms).

**Tabla de SLA**

| API | p50 | p95 | p99 | SLA objetivo | Estado |
|---|---|---|---|---|---|
| Remittances API | 89ms | 143ms | 312ms | 500ms | ✅ OK |
| Alternative Scoring | 198ms | 312ms | 634ms | 500ms | ✅ OK |
| KYC Lite API | 145ms | 267ms | 489ms | 500ms | ✅ OK |
| Disbursements API | 112ms | 198ms | 401ms | 500ms | ✅ OK |
| Accounts Embedded | 45ms | 89ms | 198ms | 500ms | ✅ OK |
| Batch Payments API | 287ms | 445ms | 891ms | 500ms | ⚠️ REVISAR |

---

## SECCIÓN: Desplegar API

### Flujo de despliegue (mock)

Esta es la acción principal del API Lab. Permite "desplegar" una API al sandbox.

**Paso 1 — Selección del artefacto**

```
¿Qué quieres desplegar?

○ Subir fichero OpenAPI YAML    [Seleccionar archivo] → (mock, no procesa)
○ Seleccionar de mis borradores  [desplegable con API 7 e API 8]
○ Usar el último generado por el Agente IA
```

**Paso 2 — Configuración del despliegue**

```
Nombre en sandbox:    [Gig Credit API v0.2.0]
Entorno:              [● Sandbox]  (no editable)
Rate limit:           [select: 100 req/min / 500 req/min / Sin límite]
Partners autorizados: [checkboxes: Fintech A / Open Banking B / Integrador C / Empresa D]
Datos mock:           [✓] Generar datos de respuesta automáticamente
Validación OAS:       [✓] Validar spec antes de desplegar
```

**Paso 3 — Confirmación (botón)**

```
[🚀 Desplegar en Sandbox]
```

Al hacer clic:
1. Mostrar spinner 2 segundos
2. Mostrar log de despliegue animado:
   ```
   [10:34:22] ✓ Spec OpenAPI validada (OAS 3.1.0)
   [10:34:23] ✓ Generando datos mock para los 4 endpoints...
   [10:34:24] ✓ Configurando rate limits: 100 req/min
   [10:34:24] ✓ Registrando en API Registry...
   [10:34:25] ✓ Endpoint disponible en sandbox
   [10:34:25] ✅ Despliegue completado en 3.2 segundos
   ```
3. Toast de éxito: "API desplegada correctamente en sandbox"
4. La API aparece ahora en la lista con estado "ACTIVA"

**Nota visible en la sección:**
```
💡 El YAML generado por el Agente de Diseño de APIs (Sección 2)
   se puede desplegar aquí directamente en un clic.
```

---

## Comportamientos de UI generales

- El sidebar mantiene la sección activa resaltada en accent pink.
- Los botones "Promover a producción" muestran un modal de confirmación con texto: "Esta acción promovería la API al entorno de producción. En la versión completa se requiere aprobación del equipo de Gobierno de APIs." + botón "Entendido".
- Todos los datos son mock hardcodeados. No se hace ninguna llamada a APIs reales.
- Los timestamps de actividad se calculan como `new Date() - X_minutos` para que siempre sean relativos a "ahora".
- Los gráficos SVG son estáticos pero con animación de entrada (barras que crecen al cargar la sección).

---

## Stub de integración

```javascript
// ANTHROPIC_CALL: api-lab-agent → skill: deploy-api-to-sandbox
// Input: { oasYaml, config: { rateLimits, partners, mockData } }
// Output: { deploymentId, endpointUrl, status, logs }
// Model: claude-sonnet-4-20250514

// ANTHROPIC_CALL: api-lab-agent → skill: analyze-api-metrics
// Input: { apiId, timeRange, granularity }
// Output: { callsByHour, latencyPercentiles, errorRates, partnerBreakdown }
// Model: claude-sonnet-4-20250514
```
