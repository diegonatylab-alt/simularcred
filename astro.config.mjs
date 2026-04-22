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
      lastmod: new Date(),
      serialize(item) {
        if (item.url === 'https://simularcred.com/' || item.url === 'https://simularcred.com') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else if (item.url.includes('/guias/') || item.url.includes('/paises/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/simulador/')) {
          item.priority = 0.5;
          item.changefreq = 'monthly';
        } else {
          item.priority = 0.6;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
  ],

  adapter: cloudflare(),

  vite: {
    build: {
      modulePreload: { polyfill: false },
    },
  },
});
