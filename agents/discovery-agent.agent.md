# Discovery de Casos de Uso — Agent
## `agents/discovery-agent.agent.md`

---

## Rol y propósito

Eres el agente responsable de construir y mantener `stages/1-discovery/market-discovery/index.html`: la herramienta 02 Discovery de Casos de Uso de la plataforma Open Business Accelerator de Minsait.

Esta sección permite a equipos de negocio de entidades financieras seleccionar o crear un caso de uso, analizar qué segmentos de su cartera tienen mayor propensión de adopción, y obtener métricas TAM/SAM/SOM orientativas junto con una recomendación de qué APIs diseñar a continuación.

---

## Skills que debes cargar antes de construir

- `agents/synthetic-audiences.skill.md` — datos de los 4 segmentos y lógica de matching
- `.github/skills/tam-sam-som/SKILL.md` — lógica de cálculo de TAM/SAM/SOM *(pendiente: aún no existe en el repo)*
- `.github/skills/use-case-catalog/SKILL.md` — catálogo de casos de uso de referencia *(pendiente: aún no existe en el repo)*

---

## Flujo completo de la sección (5 pasos)

```
PASO 1: Selección o creación del caso de uso
   ↓
PASO 2: Configuración de variables de matching
   ↓
PASO 3: Análisis de audiencias sintéticas (mock)
   ↓
PASO 4: Resultados TAM/SAM/SOM + propensión por segmento
   ↓
PASO 5: Recomendación de APIs → enlace a Sección 2
```

---

## PASO 1 — Selección o creación del caso de uso

### Header de la pantalla

Barra superior Minsait con enlace "← Volver al inicio" y badge "FASE BETA".

Título: "Discovery de Casos de Uso"
Subtítulo: "Identifica qué segmentos de tu cartera tienen mayor propensión a adoptar un nuevo producto"

### Selector de caso de uso

Dos opciones visuales en tabs o toggle:

#### Tab A: "Seleccionar del catálogo"

Mostrar el catálogo organizado en 7 categorías. Cada categoría desplegable con sus subcasos. Al hacer clic en un subcaso queda seleccionado (highlight en accent pink).

**Categorías y subcasos del catálogo de referencia:**

```
A. PAGOS EMBEBIDOS
   - Pagos dentro de ERP
   - Pagos en marketplaces
   - Pagos en apps de delivery
   - Pagos en plataformas SaaS
   - Pagos en redes sociales
   - Pagos en apps de movilidad
   - Pago en checkout e-commerce
   - Recaudación digital automatizada

B. CUENTAS EMBEBIDAS
   - Cuenta para usuarios finales dentro de apps
   - Wallet para clientes de plataformas
   - Cuenta para sellers en marketplaces
   - Cuenta empresarial en ERP
   - Subcuentas para gestión financiera interna
   - Cuentas para gestión de fondos de terceros

C. CRÉDITO EMBEBIDO
   - Checkout financing (BNPL)
   - Capital de trabajo para sellers
   - Adelanto de sueldo
   - Crédito para gig workers
   - Crédito educativo
   - Crédito para consumo en apps
   - Crédito agrícola
   - Crédito vehicular embebido
   - Líneas de crédito en ERP

D. RECAUDACIÓN Y DISPERSIÓN
   - Pago a proveedores automatizado
   - Pago de planillas
   - Pago a freelancers
   - Distribución de subsidios
   - Recaudación de servicios
   - Split de pagos en plataformas

E. SEGUROS EMBEBIDOS
   - Seguro en compra (e-commerce)
   - Seguro por uso (on-demand)
   - Seguro para freelancers
   - Seguro en viajes
   - Microseguros

F. INVERSIÓN Y AHORRO EMBEBIDO
   - Ahorro automático
   - Redondeo de compras
   - Microinversiones
   - Inversión en plataformas digitales
   - Fondos de inversión desde apps

G. DATA-DRIVEN USE CASES
   - Personal finance management en apps
   - Ofertas personalizadas basadas en data
   - Scoring alternativo para terceros
   - Insights financieros para empresas
   - Precalificación crediticia en tiempo real
```

#### Tab B: "Crear caso de uso propio"

Formulario libre con los campos:

```
- Nombre del caso de uso (input texto, obligatorio)
- Descripción del producto o servicio (textarea)
- Categoría principal (select: Pagos / Crédito / Cuentas / Seguros / Inversión / Datos / Otro)
- Canal de distribución (select: App móvil / Web / API B2B / ERP / Marketplace / Omnicanal)
- Ticket promedio estimado (select: <50€ / 50–500€ / 500–5.000€ / >5.000€)
- Frecuencia de uso esperada (select: Única / Mensual / Semanal / Diaria)
- ¿Requiere scoring crediticio? (toggle Sí/No)
- ¿Requiere KYC? (toggle Sí/No)
```

Botón "Analizar este caso de uso" → avanza al PASO 2.

---

## PASO 2 — Configuración de audiencias y variables

### Audiencias sintéticas precargadas (por defecto)

Mostrar los 4 segmentos disponibles como tarjetas seleccionables (todos activos por defecto):

```
┌─────────────────────────────────────────────────────────────────┐
│ GIG ECONOMY         INFORMAL           THIN FILE    EMPRENDEDOR │
│ 28% cartera         19% cartera        35% cartera  18% cartera │
│ ~588.000 usuarios   ~399.000           ~735.000     ~378.000    │
└─────────────────────────────────────────────────────────────────┘
```

Descripción de cada segmento (mostrar en tooltip o expansión):

**GIG Economy** — Trabajadores de plataformas (Uber, Glovo, Bolt, Deliveroo, TaskRabbit). Ingresos variables pero frecuentes, alta actividad digital, score bancario rechazado por falta de contrato fijo. Variables clave: ingresos_plataforma_mensual, valoracion_media, servicios_completados.

**Informal** — Trabajadores de economía informal, autónomos no registrados, pequeños comerciantes. Ingresos en efectivo, baja huella digital tradicional. Variables clave: estabilidad_flujo, visitas_comercios_sem, transferencias_recibidas_mes.

**Thin File** — Personas con historial crediticio escaso o inexistente. Pueden tener ingresos estables pero sin productos bancarios suficientes. Variables clave: antiguedad_sim, alquiler_al_dia, servicios_basicos_al_dia.

**Emprendedor** — Pequeños empresarios, fundadores de startup, autónomos formalizados. Ingresos variables, uso de billeteras digitales, alta actividad en redes profesionales. Variables clave: cobros_recurrentes_externos, actividad_laboral_declarada, saldo_medio_billetera.

### Parámetros de la cartera (configurables en pantalla)

Mostrar como sliders y selects editables. Valores por defecto cargados del resumen ejecutivo:

```
Universo total de clientes:    [2.100.000] (input numérico)
Clientes activos en app:       [67%]       (slider 0-100%)
Segmentación de cartera:
  GIG Economy:    [28%]  (slider, suma debe dar 100%)
  Informal:       [19%]  (slider)
  Thin File:      [35%]  (slider)
  Emprendedor:    [18%]  (slider)
```

Botón (desactivado, visible): "📤 Importar mi cartera (CSV/Excel)" — badge "Próximamente". Al hacer hover mostrar tooltip: "En la versión completa podrás importar tu propia cartera para un análisis personalizado."

Botón activo: "Calcular propensión" → avanza al PASO 3 con animación de loading.

---

## PASO 3 — Análisis (animación de procesamiento)

Mostrar durante 3 segundos una pantalla de análisis con los siguientes pasos animados secuencialmente:

```
✦ Clasificando el caso de uso en el catálogo ISO 20022...          [✓]
✦ Cruzando variables de scoring alternativo con los segmentos...   [✓]
✦ Calculando propensión de adopción por segmento...                [✓]
✦ Estimando TAM / SAM / SOM según parámetros de cartera...        [✓]
✦ Identificando APIs necesarias para este caso de uso...           [✓]
```

Fondo dark (burgundy oscuro), texto blanco, punto de carga en accent pink.

---

## PASO 4 — Resultados: propensión + TAM/SAM/SOM

### Layout de resultados

Dividido en dos bloques:

#### Bloque izquierdo (60%): Propensión por segmento

Tabla de ranking de segmentos. Las propensiones son mock calculadas según la lógica del SKILL de audiencias sintéticas:

**Ejemplo para caso "Crédito para gig workers":**

| Segmento | Propensión | Perfil tipo | Adopción est. | Penetración |
|---|---|---|---|---|
| 🥇 GIG Economy | 87% | Alta actividad plataformas, ingresos regulares via app, score bancario bajo | 65% en 12m | 14,3% cartera |
| 🥈 Thin File | 54% | Sin historial crediticio, uso de telco alternativa, pagos de alquiler al día | 38% en 12m | 8,9% cartera |
| 🥉 Emprendedor | 41% | Flujos variables, billetera externa activa, bajo endeudamiento formal | 29% en 12m | 3,7% cartera |
| Informal | 28% | Ingresos en efectivo, baja trazabilidad digital | 18% en 12m | 1,9% cartera |

Bajo cada segmento mostrar las 3 variables más relevantes que explican la propensión (pill tags):
- GIG: `ingresos_plataforma_mensual` `valoracion_media` `servicios_completados`
- Thin File: `antiguedad_sim` `alquiler_al_dia` `estabilidad_flujo`

#### Bloque derecho (40%): TAM / SAM / SOM

Visualización en embudo vertical o círculos concéntricos:

```
TAM — Mercado Total Disponible
[Número = usuarios con propensión > 20%]
Ej: 847.000 usuarios   →  €127M potencial anual

    SAM — Mercado Servible
    [Segmentos con infraestructura actual]
    Ej: 412.000 usuarios  →  €61M potencial anual

        SOM — Mercado Obtenible (12 meses)
        [Estimación realista año 1]
        Ej: 82.000 usuarios  →  €12M

```

Los porcentajes TAM→SAM y SAM→SOM son editables inline (click para editar). Por defecto:
- SAM = 48% del TAM
- SOM = 20% del SAM

Al editar se recalcula el potencial en euros automáticamente.

Mostrar nota discreta: "* Estimaciones orientativas basadas en datos sintéticos de referencia Minsait. El análisis sobre datos reales requiere parametrización completa de la cartera."

#### Características de adopción (tarjetas de insight)

3 tarjetas debajo con insights del análisis:

**Insight 1 — Velocidad de adopción**
"El segmento GIG Economy muestra patrones de adopción rápida: 72% realizan su primera transacción en los primeros 30 días tras el onboarding."

**Insight 2 — Ticket medio esperado**
"El ticket medio estimado para este caso de uso en el segmento prioritario es de €340/mes, con ratio de recurrencia mensual del 78%."

**Insight 3 — Riesgo de abandono**
"Los usuarios Thin File presentan mayor churn en mes 3 si no reciben un segundo producto complementario (seguro o cuenta de ahorro asociada)."

---

## PASO 5 — Recomendación de APIs

### Bloque de recomendación

Franja burgundy oscuro con texto blanco. Título: "Para implementar este caso de uso necesitas:"

Mostrar las APIs recomendadas como pills/chips:

**Ejemplo para "Crédito para gig workers":**
```
APIs requeridas:
[POST /credit-applications]  [GET /credit-scoring/alternative]
[POST /disbursements]  [GET /repayment-schedule]  [PATCH /credit-status]

APIs complementarias:
[POST /kyc/lite]  [GET /income-verification/gig]
```

Descripción breve: "Son necesarias **2 APIs principales** y **2 APIs de soporte** para implementar el flujo completo. El agente de diseño te ayudará a generarlas con el estándar ISO 20022."

### CTA principal

Botón grande en accent pink:
```
Diseñar estas APIs con el Agente IA →
```
Al hacer clic: abre `../../2-api-design/api-designer.html` y, mediante parámetro URL, pre-carga el nombre del caso de uso en el formulario (`?usecase=Crédito+para+gig+workers&team=Créditos`).

Botón secundario (outline):
```
Volver al inicio
```

---

## Lógica de matching entre casos de uso y segmentos

Usar esta matriz de propensión predefinida. El agente debe calcular la propensión como un porcentaje basado en la afinidad del caso de uso con el perfil del segmento:

| Caso de uso (categoría) | GIG Economy | Informal | Thin File | Emprendedor |
|---|---|---|---|---|
| CRÉDITO — gig workers / adelanto sueldo | 87% | 31% | 48% | 24% |
| CRÉDITO — BNPL / checkout | 52% | 44% | 71% | 38% |
| CRÉDITO — capital de trabajo | 41% | 38% | 29% | 82% |
| CRÉDITO — educativo | 34% | 29% | 68% | 41% |
| PAGOS — internacionales / remesas | 48% | 77% | 35% | 29% |
| PAGOS — en plataformas | 83% | 52% | 44% | 67% |
| CUENTAS — wallet / básica | 61% | 73% | 58% | 45% |
| CUENTAS — empresarial | 38% | 41% | 22% | 88% |
| SEGUROS — microseguros | 72% | 55% | 61% | 43% |
| SEGUROS — on-demand | 68% | 44% | 51% | 39% |
| INVERSIÓN — ahorro automático | 55% | 42% | 48% | 61% |
| DATA — scoring alternativo | 77% | 68% | 81% | 59% |

Para casos de uso personalizados (Tab B), calcular propensión basándose en:
- Si requiere scoring crediticio → prioriza GIG y Thin File
- Si ticket < 500€ → prioriza Informal y GIG
- Si frecuencia = Diaria → prioriza GIG
- Si canal = App móvil → eleva todos +10%
- Si requiere KYC → penaliza Informal -15%

---

## Comportamientos de UI

- El botón "Calcular propensión" solo se activa si hay un caso de uso seleccionado o el formulario personalizado está completo.
- Los sliders de segmentación muestran alerta si la suma ≠ 100%.
- Los porcentajes TAM/SAM/SOM son editables con doble clic. Al editar se recalcula todo en tiempo real.
- La tabla de segmentos se ordena siempre de mayor a menor propensión.
- El botón "Importar cartera" está visible pero deshabilitado, con cursor not-allowed y tooltip.
- Animación de loading mínima 2,5 segundos aunque el cálculo sea instantáneo (es una demo, debe parecer que procesa).

---

## Nota sobre el stub de Anthropic

El análisis de matching es actualmente mock (lógica hardcodeada). El punto de integración real está marcado así:

```javascript
// ANTHROPIC_CALL: discovery-agent → skill: analyze-use-case-fit
// Input: { useCaseId, description, segments, carteraParams }
// Output: { propensionBySegment, tamSamSom, apiRecommendations, insights }
// Model: claude-sonnet-4-20250514
```
