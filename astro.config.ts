import node from '@astrojs/node';
import vue from '@astrojs/vue';
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [vue()],
  env: {
    schema: {
      MOTIS_URL: envField.string({ context: 'server', access: 'secret', default: 'http://localhost:8080' }),
      DATA_DIR: envField.string({ context: 'server', access: 'secret', default: '/data' }),
    },
  },
});
