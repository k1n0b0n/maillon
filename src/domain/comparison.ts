import { type Bike, type Comparison, earliestArrival, type Itinerary, transfers } from './itinerary.ts';

export type CardKind = 'walk' | 'bike' | 'transit' | 'transitBike';

export interface Card {
  kind: CardKind;
  /** Absent when the engine found nothing for this option; the card then says why. */
  itinerary?: Itinerary;
}

const ORDER: readonly CardKind[] = ['walk', 'bike', 'transit', 'transitBike'];

/** Without a bike, only walking and transit are compared. */
export function optionsFor(bike: Bike): readonly CardKind[] {
  return bike === 'none' ? ['walk', 'transit'] : ORDER;
}

/**
 * The option the results show among the sorted cards: the one asked, even without a result, to say why; else the first,
 * which arrives first. None when nothing was found: the page then only says why.
 */
export function shownCard(sorted: Card[], asked?: CardKind): Card | undefined {
  if (!sorted.some(({ itinerary }) => itinerary !== undefined)) {
    return undefined;
  }
  return sorted.find(({ kind }) => kind === asked) ?? sorted[0];
}

/** One card per option asked, sorted by arrival, then by fewer changes; the options without a result come last. */
export function cards(comparison: Comparison, kinds: readonly CardKind[]): Card[] {
  const best: Record<CardKind, Itinerary | undefined> = {
    walk: comparison.walk,
    bike: comparison.bike,
    transit: earliestArrival(comparison.transit),
    transitBike: earliestArrival(comparison.transitBike),
  };
  return kinds.map((kind) => {
    const itinerary = best[kind];
    return itinerary === undefined ? { kind } : { kind, itinerary };
  }).sort((a, b) => {
    if (a.itinerary === undefined || b.itinerary === undefined) {
      return Number(a.itinerary === undefined) - Number(b.itinerary === undefined);
    }
    return a.itinerary.arrival.getTime() - b.itinerary.arrival.getTime() || transfers(a.itinerary) - transfers(b.itinerary);
  });
}
