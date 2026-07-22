# Synthetic Audiences — Skill
## `agents/synthetic-audiences.skill.md`

---

## Propósito

Esta skill define los 4 segmentos de audiencias sintéticas disponibles en la demo, sus características, variables clave y la lógica de matching con casos de uso. Los datos provienen del dataset de referencia Minsait (cartera_demo_minsait.xlsx) con 50 clientes de muestra representativos de 2.100.000 usuarios.

Cargar esta skill cada vez que el agente necesite:
- Mostrar los segmentos disponibles
- Calcular propensión de un caso de uso sobre los segmentos
- Mostrar variables explicativas del scoring alternativo
- Generar el análisis TAM/SAM/SOM

---

## Los 4 segmentos

### Segmento 1 — GIG ECONOMY

**Descripción:** Trabajadores de plataformas digitales (Uber, Glovo, Bolt, Deliveroo, TaskRabbit). Ingresos variables pero frecuentes, alta actividad digital, historial crediticio rechazado por ausencia de contrato laboral formal.

**Peso en la cartera demo:** 28% (~588.000 usuarios en un universo de 2,1M)

**Perfil tipo:**
- Ingresos mensuales por plataforma: €879 – €2.221 (media €1.580)
- Valoración media en plataforma: 4,1 – 5,0
- Servicios completados: 450 – 1.605
- Billetera digital externa: Revolut, Bizum, PayPal (mayoría activos)
- Estabilidad de flujo: ALTA en el 60% de los casos
- Score banco tradicional: 250–480 (rechazados mayoritariamente)
- Plataformas más frecuentes: Glovo, Bolt, Uber, Deliveroo
- Zona residencia: mayoritariamente Urbana / Periurbana

**Variables de scoring alternativo más discriminatorias:**
```
MUY ALTO: ingresos_plataforma_mensual, servicios_completados
ALTO:     valoracion_media, estabilidad_flujo, cobros_recurrentes_externos
MEDIO:    datos_consumidos_mes, visitas_comercios_frecuencia
```

**Afinidad por categoría de caso de uso:**
- CRÉDITO gig workers / adelanto sueldo: **87%**
- PAGOS en plataformas: **83%**
- SEGUROS microseguros / on-demand: **72%**
- CUENTAS wallet: **61%**
- CRÉDITO BNPL: **52%**
- PAGOS internacionales: **48%**

---

### Segmento 2 — INFORMAL

**Descripción:** Trabajadores de economía informal, autónomos no registrados, pequeños comerciantes. Ingresos en efectivo o semi-digital, baja huella tradicional pero patrones de pago alternativos consistentes.

**Peso en la cartera demo:** 19% (~399.000 usuarios)

**Perfil tipo:**
- Ingresos regulares pero no trazables vía nómina
- Billetera externa: Bizum, PayPal, N26 (uso irregular)
- Estabilidad de flujo: MEDIA predominante
- Pagos de alquiler al día: 60% de los casos
- Visitas a comercios: alta frecuencia (22-30/semana)
- Zona residencia: variada (Urbana, Periurbana, Rural, Centro)
- Movilidad laboral: moderada (3-35 km)
- Score banco tradicional: 280–461 (rechazados)

**Variables de scoring alternativo más discriminatorias:**
```
MUY ALTO: estabilidad_flujo, cobros_recurrentes_externos
ALTO:     alquiler_al_dia, servicios_basicos_al_dia, transferencias_recibidas_mes
MEDIO:    visitas_comercios_frecuencia, antiguedad_sim, datos_consumidos_mes
```

**Afinidad por categoría de caso de uso:**
- PAGOS internacionales / remesas: **77%**
- CUENTAS wallet / básica: **73%**
- SEGUROS microseguros: **55%**
- PAGOS en plataformas: **52%**
- CRÉDITO BNPL: **44%**
- DATA scoring alternativo: **68%**

---

### Segmento 3 — THIN FILE

**Descripción:** Personas con historial crediticio escaso o inexistente. Jóvenes, inmigrantes recientes, o personas que han operado siempre en efectivo. Pueden tener ingresos estables pero sin productos bancarios suficientes para calificar en modelos tradicionales.

**Peso en la cartera demo:** 35% (~735.000 usuarios) — el segmento más grande

**Perfil tipo:**
- Antigüedad bancaria: 9–52 meses (corta)
- Saldo medio: €138 – €1.957 (muy variable)
- Productos contratados: 1–3 (mínimos)
- Billetera externa: Revolut, Wise, N26 (usuarios más digitales del grupo)
- Antigüedad SIM: alta (36-86 meses) — indicador de estabilidad
- Alquiler al día: 60% sí
- Servicios básicos al día: 70% sí
- Score banco tradicional: 254–456

**Variables de scoring alternativo más discriminatorias:**
```
MUY ALTO: alquiler_al_dia, servicios_basicos_al_dia
ALTO:     antiguedad_sim, historial_telco_meses, cuotas_seguros_pagadas
MEDIO:    transferencias_recibidas_mes, saldo_medio_billetera
```

**Afinidad por categoría de caso de uso:**
- DATA scoring alternativo: **81%**
- CRÉDITO BNPL: **71%**
- CRÉDITO educativo: **68%**
- SEGUROS microseguros: **61%**
- CUENTAS wallet: **58%**
- INVERSIÓN ahorro automático: **48%**

---

### Segmento 4 — EMPRENDEDOR

**Descripción:** Pequeños empresarios, fundadores de startup, autónomos formalizados con actividad económica propia. Ingresos variables, uso activo de herramientas digitales, presencia en redes profesionales.

**Peso en la cartera demo:** 18% (~378.000 usuarios)

**Perfil tipo:**
- Antigüedad bancaria: 13–84 meses (más alta que otros segmentos)
- Saldo medio: €162 – €2.700 (dispersión alta)
- Canal cobro nómina: 30% sí (resto variable)
- Billetera externa: Revolut, PayPal, N26, Wise
- Red social laboral: LinkedIn predominante (refleja perfil profesional)
- Antigüedad perfil LinkedIn: 18–117 meses
- Actividad publicaciones: ALTA en 40% de los casos
- Movilidad laboral: alta (5-35 km)
- Score banco tradicional: 257–480

**Variables de scoring alternativo más discriminatorias:**
```
MUY ALTO: cobros_recurrentes_externos, actividad_laboral_declarada
ALTO:     consistencia_perfil, saldo_medio_billetera, antiguedad_cuenta_laboral
MEDIO:    movilidad_laboral_km, diversificacion_fuentes
```

**Afinidad por categoría de caso de uso:**
- CUENTAS empresarial: **88%**
- CRÉDITO capital de trabajo: **82%**
- DATA insights financieros: **59%**
- INVERSIÓN ahorro automático: **61%**
- CRÉDITO educativo: **41%**
- CUENTAS wallet: **45%**

---

## Resumen ejecutivo de referencia

Usar estos números en la demo cuando se muestren datos de contexto:

```javascript
const RESUMEN_EJECUTIVO = {
  universoTotal:         2_100_000,   // clientes activos del banco
  clientesEnDataset:            50,   // muestra demo
  fuentesExternas:               6,   // telco, OB, gig, social, bureau alt, geo
  variablesGeneradas:           47,   // variables discriminatorias Minsait
  proyectosReferencia:          12,   // implementaciones previas en banca
  clientesRecuperablesEst:  680_000,  // 32% del universo rechazado
  mejoraGiniEstimada:           14,   // puntos vs modelo interno actual
  ingresosPotencialesAnuales: 41_000_000, // EUR nueva cartera crediticia
  elaboradoPor: "Minsait — Área de Data & AI"
};
```

---

## Variables del catálogo de scoring alternativo (para mostrar como pills explicativos)

Usar estas variables cuando el agente explique qué señales explican la propensión de cada segmento:

```javascript
const VARIABLES_CATALOGO = {
  TELCO: [
    { id: "regularidad_recargas",    label: "Consistencia recargas",    peso: "ALTO" },
    { id: "antiguedad_sim",          label: "Antigüedad SIM",           peso: "ALTO" },
    { id: "datos_consumidos_mes",    label: "GB consumidos/mes",        peso: "MEDIO" },
    { id: "roaming_frecuente",       label: "Roaming (movilidad)",      peso: "MEDIO" },
  ],
  OPEN_BANKING: [
    { id: "cobros_recurrentes",      label: "Cobros recurrentes ext.",  peso: "MUY ALTO" },
    { id: "estabilidad_flujo",       label: "Estabilidad de flujo",     peso: "MUY ALTO" },
    { id: "saldo_medio_billetera",   label: "Saldo medio billetera",    peso: "ALTO" },
    { id: "transferencias_recibidas",label: "Transferencias recibidas", peso: "ALTO" },
  ],
  GIG: [
    { id: "servicios_completados",   label: "Servicios completados",    peso: "MUY ALTO" },
    { id: "ingresos_plataforma",     label: "Ingresos por plataforma",  peso: "MUY ALTO" },
    { id: "valoracion_media",        label: "Valoración en plataforma", peso: "ALTO" },
  ],
  BUREAU_ALT: [
    { id: "alquiler_al_dia",         label: "Alquiler al día",          peso: "MUY ALTO" },
    { id: "servicios_basicos",       label: "Servicios básicos al día", peso: "ALTO" },
    { id: "cuotas_seguros",          label: "Seguros pagados",          peso: "ALTO" },
  ],
  SOCIAL: [
    { id: "actividad_laboral",       label: "Actividad laboral declarada", peso: "ALTO" },
    { id: "consistencia_perfil",     label: "Consistencia de perfil",   peso: "ALTO" },
    { id: "antiguedad_cuenta_lab",   label: "Antigüedad perfil laboral",peso: "ALTO" },
  ],
  GEO: [
    { id: "densidad_economica",      label: "Densidad económica zona",  peso: "MEDIO" },
    { id: "visitas_comercios",       label: "Visitas a comercios",      peso: "MEDIO" },
    { id: "movilidad_laboral",       label: "Movilidad laboral (km)",   peso: "BAJO" },
  ]
};
```

---

## Cómo calcular el potencial monetario

Para el bloque TAM/SAM/SOM usar esta fórmula con los parámetros del caso de uso:

```javascript
function calcularPotencial(segmento, propension, universo, ticketMedio, frecuenciaMeses) {
  const usuariosSegmento = universo * segmento.pesoCartera;
  const usuariosTAM = usuariosSegmento * (propension / 100);
  const usuariosSAM = usuariosTAM * 0.48;   // editable por el usuario
  const usuariosSOM = usuariosSAM * 0.20;   // editable por el usuario

  return {
    tam: { usuarios: Math.round(usuariosTAM), eur: usuariosTAM * ticketMedio * frecuenciaMeses },
    sam: { usuarios: Math.round(usuariosSAM), eur: usuariosSAM * ticketMedio * frecuenciaMeses },
    som: { usuarios: Math.round(usuariosSOM), eur: usuariosSOM * ticketMedio * frecuenciaMeses },
  };
}
```

Valores de ticket medio por defecto según categoría:
```javascript
const TICKET_MEDIO_DEFAULT = {
  "CREDITO":      340,  // EUR/mes
  "PAGOS":        120,  // EUR/transacción
  "CUENTAS":       18,  // EUR/mes (comisión o margen)
  "SEGUROS":       22,  // EUR/mes
  "INVERSION":    180,  // EUR/mes
  "DATA":        1200,  // EUR/año (B2B pricing)
};
```
