# Instrucciones para GitHub Copilot · Identidad visual MBC en Open-Business-Tool

> Guía de la feature **F14 · `refactor/hub-identidad-mbc`** (decisión D12 en `DECISIONES_Y_ARQUITECTURA.md`). Pégala en Copilot Chat al empezar la feature o enlázala desde `.github/copilot-instructions.md`. Añade a los tokens de §3 los chips de la convención agente/determinista (D15): `.chip-agente`, `.chip-metodo`, `.chip-hibrido`.
> Fuentes: *Libro de estilo transitorio de la Unidad de Consultoría* V2.2 (MBC, 22-07-2026) y la línea visual de las demos de `demos/` (referencia viva: cualquier `demos/<slug>/index.html` de tipo `recorrido-guiado`).

---

## 1. Objetivo y alcance

Migrar el **hub** (`index.html` raíz, `assets/*.css`, `assets/nav.js` y páginas enlazadas desde el recorrido numerado) de la identidad Minsait antigua a la identidad **MBC**, con el mismo lenguaje visual que las demos: fondo claro, azul oscuro dominante, azul eléctrico para acentos, Montserrat, tarjetas blancas con borde fino y radios generosos.

**Fuera de alcance:** todo lo que hay bajo `demos/` (cuando exista, F17) (ya está en MBC y cada demo es un fichero autocontenido que no se toca desde aquí).

---

## 2. Reglas no negociables (manual de marca)

1. **Logo:** MBC, en vector. "Minsait Business Consulting" ya no se usa. El formato Minsait rojo solo se permite en propuestas conjuntas con Minsait IT: **no aplica al hub**.
2. **Color principal:** azul oscuro `#003478`.
3. **Paleta corporativa:** azul oscuro `#003478`, azul eléctrico `#147AFF`, blanco `#FFFFFF`, negro `#000000`, gris cerámica `#E3E2DA`.
4. **Tipografía única:** Montserrat, en títulos, subtítulos y cuerpo.
5. **Destacar dentro de un título:** con azul eléctrico sobre fondo claro, o blanco sobre fondo oscuro. Títulos breves, máximo dos líneas.
6. **Prohibido en el hub:** Pruno `#4F062A`, rosa `#FF0054`, `#A40037`, `#EF659D`, `#260717`, Georgia, *ForFuture Sans*, *Playfair Display*, Times, Trebuchet, emojis como iconos y la palabra "Minsait" en cabeceras o pies.

---

## 3. Tokens de diseño

Crea `assets/mbc-tokens.css` con este bloque y cárgalo **antes** que cualquier otra hoja del hub. A partir de aquí, **ningún color se escribe en hex fuera de `:root`**: todo va por `var(--…)`.

```css
/* assets/mbc-tokens.css — Identidad MBC · Open-Business-Tool */
:root{
  /* Marca (manual V2.2) */
  --mbc-navy:#003478;        /* color principal: cabeceras, títulos, botón primario */
  --mbc-navy-deep:#001F4D;   /* degradado de la cabecera, hover del primario */
  --mbc-electric:#147AFF;    /* acento: estados activos, iconos, foco, destacados */
  --mbc-electric-soft:#E7F1FF;/* fondo de elementos activos y chips */
  --mbc-ceramic:#E3E2DA;     /* gris cerámica: bandas y superficies secundarias */
  --mbc-white:#FFFFFF;
  --mbc-black:#000000;

  /* Neutros de interfaz (línea de las demos) */
  --bg:#F3F5F9;              /* lienzo de página */
  --panel:#FFFFFF;           /* tarjetas */
  --text:#101B33;            /* texto principal */
  --text-dim:rgba(16,27,51,.62);
  --text-faint:rgba(16,27,51,.42);
  --line:rgba(16,27,51,.12); /* bordes finos */

  /* Estados de interfaz (no son colores de marca: úsalos solo para estado) */
  --ok:#0F9D58; --bad:#D93025; --warn:#E8A400;

  /* Secundaria del tema del manual: solo gráficos y categorías de datos */
  --data-1:#147AFF; --data-2:#44B757; --data-3:#8661F5; --data-4:#E56813; --data-5:#00B0BD;

  /* Panel técnico oscuro (bloques de código) */
  --code-bg:#0B1B3A; --code-key:#7CB8FF; --code-str:#DDE8F7; --code-cm:#7F92B3; --code-hl:#FFD166;

  /* Tipografía y forma */
  --sans:'Montserrat','Segoe UI',Arial,Helvetica,sans-serif;
  --mono:Consolas,'SFMono-Regular',Menlo,monospace;
  --radius-lg:20px;  /* cabecera */
  --radius:14px;     /* tarjetas y paneles */
  --radius-sm:10px;  /* botones, campos */
  --pill:20px;       /* chips, etiquetas */
  --shadow:0 2px 6px rgba(0,52,120,.14);
  --maxw:1240px;
}
```

**Neutros:** el lienzo `#F3F5F9` no está en el manual; es el neutro frío que usan las demos y el que se mantiene. El gris cerámica `#E3E2DA` sí es de marca: úsalo en bandas, separadores de sección y superficies secundarias, no como lienzo general.

---

## 4. Tipografía

Carga en el `<head>` de cada página del hub (único recurso externo permitido):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

Escala web (adaptación del manual, que fija 24 pt títulos / 16 pt subtítulos / 12 pt cuerpo para diapositivas):

| Uso | Tamaño | Peso | Color |
|---|---|---|---|
| Título de cabecera (h1) | 19–23 px | 800 | blanco sobre `--mbc-navy` |
| Título de sección (h2) | 16–17 px | 800 | `--mbc-navy` |
| Título de tarjeta (h3/h4) | 14 px | 700–800 | `--mbc-navy` |
| Cuerpo | 12.5–14 px, interlineado 1.5–1.6 | 400–500 | `--text` / `--text-dim` |
| Etiqueta de sección | 10.5–11 px, MAYÚSCULAS, `letter-spacing:.08–.12em` | 700 | `--text-faint` o `--mbc-electric` |
| Chips, botones | 11–13 px | 700 | según componente |
| Código | 11 px | 400 | `--mono` |

Destacado dentro de un título, como pide el manual:

```html
<h2>Un modelo común para <span class="hl">todo el ecosistema</span></h2>
```
```css
.hl{color:var(--mbc-electric);}            /* sobre fondo claro */
.on-dark .hl{color:var(--mbc-white);}      /* sobre fondo oscuro */
```

> Nota de criterio: el manual compone los títulos en peso regular porque piensa en diapositivas a 24 pt. En web, a 16–23 px, las demos usan 800 para ganar jerarquía y es la línea que se adopta. Si se quisiera más fidelidad al manual, bajar h1/h2 a 600 es el único ajuste necesario.

---

## 5. Contraste (WCAG 2.1 AA)

| Combinación | Ratio | Uso permitido |
|---|---|---|
| Blanco sobre `#003478` | 11.9 | Todo |
| `#003478` sobre blanco / `#F3F5F9` / `#E3E2DA` | 10.9–12 | Todo |
| `#101B33` sobre `#F3F5F9` | 15.7 | Todo |
| Blanco sobre `#147AFF` | **3.99** | Solo texto grande (≥ 18.7 px en negrita o ≥ 24 px), iconos y estados. **No** para texto normal |
| `#147AFF` sobre blanco | **3.99** | Igual: iconos, bordes, subrayados, títulos grandes; no párrafos ni enlaces pequeños |
| `#147AFF` sobre `#003478` | 2.98 | Solo decorativo |

Consecuencia práctica: el **botón primario es azul oscuro**; el azul eléctrico se usa en fondos de estado activo (`--mbc-electric-soft` con texto `--mbc-navy`), iconos, bordes, foco y textos grandes. Los enlaces en texto corrido van en `--mbc-navy` subrayados.

---

## 6. Logo

Vector inline, nunca imagen rasterizada. Toma el color de `currentColor`:

```html
<svg class="mbc-logo" viewBox="0 0 3860.17 856.07" xmlns="http://www.w3.org/2000/svg" fill="currentColor" role="img" aria-label="MBC"><path d="M418.06 0 626.07 488.07 701.67 492.29 910.14 0 1328.21 0 1328.21 856.07 1100.17 856.07 1100.17 192.01 1048.6 192.48 830.28 684.35 496.03 682.1 280.46 194.49 228.04 192.01 228.04 856.07 0 856.07 0 0 418.06 0Z"/><path d="M3139.84 201 3860.17 201 3860.17 0 3148.64 0C3148.13 0 3147.62 0.01 3147.11 0.02 2906.1 1.66 2724.88 176.94 2724.88 428.03 2724.88 679.12 2905.48 852.72 3144.73 856.01 3145.07 856.01 3145.42 856.02 3145.76 856.03 3145.9 856.03 3146.05 856.03 3146.19 856.03 3147 856.04 3147.81 856.06 3148.63 856.06L3860.16 856.06 3860.16 655.06 3141.03 655.06C3033.15 651.52 2947.27 567.26 2947.27 428.02 2947.27 288.78 3029.79 204.6 3139.84 200.98Z"/><path d="M1485.95 0 2304.74 0C2482.07 0 2588.46 94.17 2588.46 231.14 2588.46 311.86 2550.55 384.01 2463.72 407.24L2463.72 426.81C2560.33 441.49 2614.14 508.75 2614.14 618.81 2614.14 765.56 2516.3 856.06 2334.08 856.06L1485.94 856.06 1485.94 0ZM2292.51 335.09C2345.1 335.09 2373.23 305.74 2373.23 259.27 2373.23 212.8 2345.1 183.45 2292.51 183.45L1706.08 183.45 1706.08 335.1 2292.51 335.1ZM2299.84 672.62C2357.32 672.62 2386.67 646.94 2386.67 595.57 2386.67 544.2 2357.32 518.52 2299.84 518.52L1706.08 518.52 1706.08 672.61 2299.84 672.61Z"/></svg>
```

| Contexto | Color | Altura |
|---|---|---|
| Cabecera (fondo azul oscuro) | blanco | 26–30 px (20–22 px en móvil) |
| Pie (fondo claro) | `--mbc-navy` | 16 px |

Reglas: margen libre alrededor ≥ la altura de la "M"; sin sombras, degradados ni recolorear a azul eléctrico; no acompañar con "Minsait". En la cabecera, el logo va en **su propia columna** a la derecha para que nunca pise el título (ver §7.1).

---

## 7. Componentes (copiar de las demos)

### 7.1 Cabecera compacta

```html
<header class="hero">
  <h1>Open Business Accelerator</h1>
  <p>Una frase que explica qué es esta página y para quién.</p>
  <svg class="mbc-logo" …></svg>
</header>
```
```css
header.hero{
  background:linear-gradient(135deg,var(--mbc-navy) 0%,var(--mbc-navy-deep) 100%);
  color:#fff; border-radius:16px; padding:16px 22px 14px; margin-bottom:12px;
  position:relative; overflow:hidden;
  display:grid; grid-template-columns:minmax(0,1fr) auto;
  grid-template-areas:"title logo" "intro logo"; column-gap:22px; align-items:center;
}
header.hero::after{content:""; position:absolute; right:-40px; top:-70px; width:180px; height:180px;
  background:radial-gradient(circle,rgba(20,122,255,.55),transparent 70%);}
header.hero > *{position:relative; z-index:1;}
header.hero h1{grid-area:title; font-size:19px; line-height:1.25; margin:0 0 5px; font-weight:800;}
header.hero p{grid-area:intro; margin:0; font-size:12.5px; line-height:1.5; color:rgba(255,255,255,.82);}
header.hero .mbc-logo{grid-area:logo; height:26px; width:auto; color:#fff;}
@media (max-width:640px){
  header.hero{grid-template-columns:1fr; grid-template-areas:"logo" "title" "intro";}
  header.hero .mbc-logo{height:20px; justify-self:start; margin-bottom:8px;}
}
```

### 7.2 Tarjetas y tarjetas de navegación

```css
.card{background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); padding:18px 22px;}
.card h4{margin:0 0 6px; font-size:14px; color:var(--mbc-navy); font-weight:800;}
.card p{margin:0; font-size:12.5px; line-height:1.6; color:var(--text-dim);}
.card .lbl{font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--text-faint); font-weight:700; margin-bottom:8px;}

/* Tarjeta numerada (recorrido del hub, equivalente a los "actos" de las demos) */
.nav-card{background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:10px 14px;
  display:flex; gap:10px; align-items:center; cursor:pointer; transition:.2s; text-decoration:none; color:inherit;}
.nav-card .n{width:26px; height:26px; border-radius:50%; background:var(--line); color:var(--text-dim);
  font-weight:800; font-size:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0;}
.nav-card b{display:block; font-size:12px; color:var(--text);}
.nav-card small{font-size:10.5px; color:var(--text-faint); font-weight:600;}
.nav-card:hover, .nav-card.active{border-color:var(--mbc-electric); background:var(--mbc-electric-soft);}
.nav-card.active .n{background:var(--mbc-navy); color:#fff;}
.nav-card.done .n{background:var(--ok); color:#fff;}
```

### 7.3 Botones

```css
.btn{display:inline-flex; align-items:center; gap:6px; font-family:var(--sans); font-size:13px; font-weight:700;
  padding:9px 16px; border-radius:var(--radius-sm); border:1px solid transparent; cursor:pointer; text-decoration:none;}
.btn svg{width:16px; height:16px;}
.btn-primary{background:var(--mbc-navy); color:#fff;}
.btn-primary:hover{background:var(--mbc-navy-deep);}
.btn-secondary{background:var(--mbc-electric-soft); color:var(--mbc-navy); border:1.5px solid var(--mbc-electric); box-shadow:var(--shadow);}
.btn-secondary:hover{background:#fff;}
.btn-secondary.on{background:var(--mbc-electric); border-color:var(--mbc-electric); color:#fff;} /* estado activo: texto corto y en negrita */
.btn-ghost{background:#fff; color:var(--mbc-navy); border-color:var(--line);}
.btn-ghost:hover{border-color:var(--mbc-electric); background:var(--mbc-electric-soft);}
.btn:focus-visible{outline:3px solid var(--mbc-electric); outline-offset:2px;}
```

### 7.4 Chips y etiquetas de estado

```css
.chip{font-size:11px; font-weight:700; color:var(--mbc-navy); background:var(--mbc-electric-soft);
  border:1px solid rgba(20,122,255,.25); border-radius:var(--pill); padding:4px 10px;}
.chip.neutral{background:#fff; border-color:var(--line); color:var(--text-dim);}
.tag{font-size:10px; font-weight:800; letter-spacing:.04em; text-transform:uppercase; border-radius:var(--pill); padding:3px 8px;}
.tag.ok{background:#E6F6EC; color:var(--ok);} .tag.bad{background:#FCE8E6; color:var(--bad);} .tag.warn{background:#FFF4D6; color:#9A6B00;}
```
(Los fondos suaves de `.tag` pueden pasar a tokens `--ok-soft`, `--bad-soft`, `--warn-soft` en `:root`.)

### 7.5 Panel técnico oscuro

```css
.tech{background:var(--code-bg); border-radius:var(--radius); color:#fff; padding:18px 20px;}
.tech .t-head{font-size:11px; letter-spacing:.12em; text-transform:uppercase; font-weight:700; color:var(--mbc-electric);}
pre.code{margin:0; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:10px;
  padding:12px 14px; font-family:var(--mono); font-size:11px; line-height:1.5; color:var(--code-str); overflow:auto;}
```

### 7.6 Maquetación, pie e iconos

```css
html,body{margin:0; background:var(--bg); color:var(--text); font-family:var(--sans);}
body{padding:28px 18px 60px;}
.wrap{max-width:var(--maxw); margin:0 auto;}
footer{margin-top:24px; font-size:10.5px; color:var(--text-faint); text-align:center; line-height:1.5;}
footer .mbc-logo{height:16px; color:var(--mbc-navy);}
```
Iconos: SVG inline de trazo (`fill="none" stroke="currentColor" stroke-width="2"`, `viewBox="0 0 24 24"`), 14–16 px, heredan color. Nunca emojis ni librerías de iconos por CDN.

---

## 8. Mapa de migración del hub

Localiza lo antiguo:

```bash
grep -rniE "#4F062A|#FF0054|#A40037|#EF659D|#260717|Georgia|ForFuture|Playfair|Minsait" index.html assets/ --include=*.html --include=*.css --include=*.js
```

| Antiguo (Minsait) | Nuevo (MBC) |
|---|---|
| `#4F062A` burdeos/Pruno (fondos, cabeceras, títulos) | `var(--mbc-navy)` |
| `#FF0054` rosa (acentos, enlaces, números, bordes activos) | `var(--mbc-electric)`; si es texto pequeño o enlace, `var(--mbc-navy)` (ver §5) |
| `#A40037`, `#EF659D` (hover, variantes) | `var(--mbc-navy-deep)` / `var(--mbc-electric-soft)` |
| `#260717` (texto oscuro) | `var(--text)` |
| Fondos beige/grises cálidos | `var(--bg)` como lienzo; `var(--mbc-ceramic)` en bandas |
| `Georgia`, serif en títulos | `var(--sans)` (Montserrat) con los pesos de §4 |
| Logo o texto "Minsait" en cabecera/pie | Logo MBC vectorial (§6) |

---

## 9. Cómo debe trabajar Copilot en este repo

**Hacer**
- Trabajar en la rama `refactor/hub-identidad-mbc`, nacida de `develop`. Commits pequeños en Conventional Commits en español: `refactor(hub): tokens MBC`, `refactor(hub): cabecera y logo MBC`, `refactor(nav): colores MBC en la navegación lateral`.
- Introducir primero `assets/mbc-tokens.css` y después sustituir colores y fuentes por tokens, fichero a fichero.
- Mantener los nombres de clase y la lógica de `assets/nav.js` (clases `obx-*`, cálculo de `root`, enlace `current`): cambiar solo estilos.
- Añadir una línea en `CHANGELOG.md` bajo `## [Unreleased]` → `### Changed`.

**No hacer**
- No tocar nada bajo `demos/`.
- No añadir frameworks, preprocesadores, paso de build ni CDNs (salvo Google Fonts).
- No escribir hex fuera de `:root`, no usar colores fuera de §3, no introducir tipografías distintas de Montserrat.
- No rediseñar estructura ni contenido de las páginas: la feature es de identidad visual.
- No reformatear ficheros enteros: diffs mínimos, revisables en VS Code.

---

## 10. Criterios de aceptación

1. El `grep` de §8 no devuelve resultados en el hub (salvo en `CHANGELOG.md` o documentación histórica).
2. Todas las páginas cargan Montserrat y usan `assets/mbc-tokens.css`.
3. La cabecera muestra el logo MBC blanco en su propia columna; el pie, el logo en azul oscuro.
4. Ningún texto de tamaño normal en blanco sobre `#147AFF` ni en `#147AFF` sobre blanco.
5. La navegación lateral (`nav.js`) sigue funcionando en todas las páginas y el enlace a `demos/index.html` lleva a la biblioteca.
6. Visualmente coherente con cualquier demo de `demos/`: mismos azules, mismos radios, mismas tarjetas.
7. Sin errores de consola; se ve bien a 1280 px y a 390 px.
