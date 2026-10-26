import { defineConfig } from 'vitest/config';

// The golden routes need the engine: `npm run golden`, through scripts/golden.sh.
export default defineConfig({ test: { include: ['src/**/*.test.ts'] } });
