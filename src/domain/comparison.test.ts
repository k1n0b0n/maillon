import { describe, expect, it } from 'vitest';
import { cards, optionsFor, shownCard } from './comparison.ts';
import type { Itinerary, Leg } from './itinerary.ts';

const at = (time: string) => new Date(`2026-10-27T${time}:00+01:00`);
const leg = (mode: Leg['mode']): Leg => ({ mode, from: 'a', to: 'b', departure: at('10:30'), arrival: at('10:40') });
const trip = (arrival: string, ...modes: Leg['mode'][]): Itinerary => ({ departure: at('10:30'), arrival: at(arrival), legs: modes.map(leg) });
const four = optionsFor('classic');

describe('cards', () => {
  it('sorts the four options by arrival', () => {
    const sorted = cards(
      {
        walk: trip('11:02', 'walk'),
        bike: trip('10:41', 'bike'),
        transit: [trip('10:58', 'walk', 'tram', 'walk')],
        transitBike: [trip('10:52', 'bike', 'tram', 'bike')],
      },
      four,
    );

    expect(sorted.map(({ kind }) => kind)).toEqual(['bike', 'transitBike', 'transit', 'walk']);
  });

  it('puts the option with fewer changes first when two arrive together', () => {
    const sorted = cards(
      {
        transit: [trip('10:50', 'walk', 'tram', 'walk', 'bus', 'walk')],
        transitBike: [trip('10:50', 'bike', 'tram', 'bike')],
      },
      four,
    );

    expect(sorted.slice(0, 2).map(({ kind }) => kind)).toEqual(['transitBike', 'transit']);
  });

  it('keeps the options without a result, last, without an itinerary', () => {
    const sorted = cards({ bike: trip('11:20', 'bike'), transit: [], transitBike: [] }, four);

    expect(sorted).toEqual([{ kind: 'bike', itinerary: trip('11:20', 'bike') }, { kind: 'walk' }, { kind: 'transit' }, { kind: 'transitBike' }]);
  });

  it('shows the earliest arrival of each transit option', () => {
    const [first] = cards({ transit: [trip('11:10', 'walk', 'bus'), trip('10:55', 'walk', 'tram')], transitBike: [] }, four);

    expect(first?.itinerary?.arrival).toEqual(at('10:55'));
  });

  it('shows only the options asked', () => {
    const sorted = cards({ walk: trip('11:02', 'walk'), transit: [], transitBike: [] }, optionsFor('none'));

    expect(sorted).toEqual([{ kind: 'walk', itinerary: trip('11:02', 'walk') }, { kind: 'transit' }]);
  });
});

describe('shownCard', () => {
  const sorted = cards({ walk: trip('11:02', 'walk'), bike: trip('10:41', 'bike'), transit: [], transitBike: [] }, four);

  it('shows the option that arrives first, unless another is asked', () => {
    expect(shownCard(sorted)?.kind).toBe('bike');
    expect(shownCard(sorted, 'walk')?.kind).toBe('walk');
  });

  it('shows an option asked with no result, to say why', () => {
    expect(shownCard(sorted, 'transit')).toEqual({ kind: 'transit' });
  });

  it('shows the first option when the one asked is not compared', () => {
    expect(shownCard(cards({ walk: trip('11:02', 'walk'), transit: [], transitBike: [] }, optionsFor('none')), 'bike')?.kind).toBe('walk');
  });

  it('shows none when nothing was found', () => {
    expect(shownCard(cards({ transit: [], transitBike: [] }, four), 'walk')).toBeUndefined();
  });
});

describe('optionsFor', () => {
  it('compares walking and transit without a bike, the four options with one', () => {
    expect(optionsFor('none')).toEqual(['walk', 'transit']);
    expect(optionsFor('classic')).toEqual(['walk', 'bike', 'transit', 'transitBike']);
    expect(optionsFor('folding')).toEqual(['walk', 'bike', 'transit', 'transitBike']);
  });
});
