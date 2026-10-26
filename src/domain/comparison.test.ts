import { describe, expect, it } from 'vitest';
import { cards } from './comparison.ts';
import type { Itinerary, Leg } from './itinerary.ts';

const at = (time: string) => new Date(`2026-10-27T${time}:00+01:00`);
const leg = (mode: Leg['mode']): Leg => ({ mode, from: 'a', to: 'b', departure: at('10:30'), arrival: at('10:40') });
const trip = (arrival: string, ...modes: Leg['mode'][]): Itinerary => ({ departure: at('10:30'), arrival: at(arrival), legs: modes.map(leg) });

describe('cards', () => {
  it('sorts the four options by arrival', () => {
    const sorted = cards({
      walk: trip('11:02', 'walk'),
      bike: trip('10:41', 'bike'),
      transit: [trip('10:58', 'walk', 'tram', 'walk')],
      transitBike: [trip('10:52', 'bike', 'tram', 'bike')],
    });

    expect(sorted.map(({ kind }) => kind)).toEqual(['bike', 'transitBike', 'transit', 'walk']);
  });

  it('puts the option with fewer changes first when two arrive together', () => {
    const sorted = cards({
      transit: [trip('10:50', 'walk', 'tram', 'walk', 'bus', 'walk')],
      transitBike: [trip('10:50', 'bike', 'tram', 'bike')],
    });

    expect(sorted.slice(0, 2).map(({ kind }) => kind)).toEqual(['transitBike', 'transit']);
  });

  it('keeps the options without a result, last, without an itinerary', () => {
    const sorted = cards({ bike: trip('11:20', 'bike'), transit: [], transitBike: [] });

    expect(sorted).toEqual([{ kind: 'bike', itinerary: trip('11:20', 'bike') }, { kind: 'walk' }, { kind: 'transit' }, { kind: 'transitBike' }]);
  });

  it('shows the earliest arrival of each transit option', () => {
    const [first] = cards({ transit: [trip('11:10', 'walk', 'bus'), trip('10:55', 'walk', 'tram')], transitBike: [] });

    expect(first?.itinerary?.arrival).toEqual(at('10:55'));
  });
});
