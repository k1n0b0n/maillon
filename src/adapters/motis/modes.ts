import type { Mode } from '../../domain/itinerary.ts';

/** The engine's modes, as the domain names them. */
export const MODES: Partial<Record<string, Mode>> = {
  WALK: 'walk',
  BIKE: 'bike',
  TRAM: 'tram',
  BUS: 'bus',
  FERRY: 'ferry',
  COACH: 'coach',
  RAIL: 'train',
  REGIONAL_RAIL: 'train',
  REGIONAL_FAST_RAIL: 'train',
  SUBURBAN: 'train',
  HIGHSPEED_RAIL: 'train',
  LONG_DISTANCE: 'train',
  NIGHT_RAIL: 'train',
};

