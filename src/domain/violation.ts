import { engineIsUp } from '../adapters/motis/health.ts';

// Deliberate boundary violation (story 002): CI must fail on it.
export const violation = engineIsUp;
