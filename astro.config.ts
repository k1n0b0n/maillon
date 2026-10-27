import node from '@astrojs/node';
import vue from '@astrojs/vue';
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [vue()],
  // MapLibre's worker is an ES module that imports a chunk it shares with the page.
  vite: { worker: { format: 'es' } },
  env: {
    schema: {
      MOTIS_URL: envField.string({ context: 'server', access: 'secret', default: 'http://localhost:8080' }),
      DATA_DIR: envField.string({ context: 'server', access: 'secret', default: '/data' }),
    },
  },
});
