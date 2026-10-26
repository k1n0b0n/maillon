import node from '@astrojs/node';
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  env: {
    schema: {
      MOTIS_URL: envField.string({ context: 'server', access: 'secret', default: 'http://localhost:8080' }),
    },
  },
});
