import { describe, expect, it } from 'vitest';
import type { Itinerary, Leg } from '../domain/itinerary.ts';
import { cardModes } from './options.ts';

const at = new Date('2026-10-27T09:30:00Z');
const leg = (mode: Leg['mode']): Leg => ({ mode, from: '', to: '', departure: at, arrival: at });
const itinerary = (...modes: Leg['mode'][]): Itinerary => ({ departure: at, arrival: at, legs: modes.map(leg) });

describe('cardModes', () => {
  it('shows walking and cycling as themselves', () => {
    expect(cardModes({ kind: 'walk', itinerary: itinerary('walk') })).toEqual(['walk']);
    expect(cardModes({ kind: 'bike' })).toEqual(['bike']);
  });

  it('shows the vehicles a transit option rides, once each, then the bike it carries', () => {
    expect(cardModes({ kind: 'transit', itinerary: itinerary('walk', 'train', 'walk', 'tram', 'tram', 'walk') })).toEqual(['train', 'tram']);
    expect(cardModes({ kind: 'transitBike', itinerary: itinerary('bike', 'ferry', 'bike') })).toEqual(['ferry', 'bike']);
  });

  it('shows the tram for a transit option with no result', () => {
    expect(cardModes({ kind: 'transit' })).toEqual(['tram']);
    expect(cardModes({ kind: 'transitBike' })).toEqual(['tram', 'bike']);
  });
});
