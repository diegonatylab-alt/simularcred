import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: 'static',
  site: 'https://simularcred.com',

  integrations: [
    preact({ compat: true }),
    tailwind(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      customPages: [],
    }),
  ],

  adapter: cloudflare(),

  vite: {
    build: {
      modulePreload: { polyfill: false },
    },
  },
});
