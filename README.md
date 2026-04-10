# SimularCred — Simulador de Crédito LATAM

Calculadora interactiva de préstamos y simulador de crédito para América Latina. Genera tablas de amortización francesa y alemana para MXN, COP, CLP, PEN, ARS y USD.

## Tech Stack

- **Astro 5** (SSG, output: static)
- **Preact** (Astro Islands, client:visible)
- **Tailwind CSS 3** + @astrojs/tailwind
- **Chart.js 4** (gráficas de amortización)
- **TypeScript strict**
- **@astrojs/sitemap**

## Instalación

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # genera dist/
npm run preview   # previsualiza dist/
```

## Estructura del Proyecto

```
src/
├── components/     # Preact islands + Astro components
│   ├── Calculator.tsx
│   ├── AmortizationTable.tsx
│   ├── Chart.tsx
│   ├── AdUnit.astro
│   ├── Header.astro
│   ├── Footer.astro
│   ├── FAQ.astro
│   └── Breadcrumbs.astro
├── layouts/
│   ├── BaseLayout.astro
│   └── LandingLayout.astro
├── lib/
│   ├── amortization.ts    # Lógica de cálculo
│   ├── formatters.ts      # Formateo de monedas
│   └── landing-combos.ts  # Generador de páginas landing
├── pages/
│   ├── index.astro
│   ├── robots.txt.ts
│   ├── simulador/[slug].astro
│   ├── guias/
│   └── paises/
└── styles/global.css
```

## Deploy en Cloudflare Pages

1. Fork o conecta el repo en Cloudflare Pages
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Node.js version: 20+

## Generar más páginas landing

Edita `src/lib/landing-combos.ts`:
- Cambia `MAX_COMBOS` a `Infinity` para generar todas (~5000 páginas)
- Agrega montos, tasas o plazos en `CONFIGS`
- Modifica las reglas de filtrado según necesites

## Licencia

MIT
