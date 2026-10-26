import { type Comparison, earliestArrival, type Itinerary, transfers } from './itinerary.ts';

export type CardKind = 'walk' | 'bike' | 'transit' | 'transitBike';

export interface Card {
  kind: CardKind;
  /** Absent when the engine found nothing for this option; the card then says why. */
  itinerary?: Itinerary;
}

const ORDER: CardKind[] = ['walk', 'bike', 'transit', 'transitBike'];

/** One card per option, sorted by arrival, then by fewer changes; the options without a result come last. */
export function cards(comparison: Comparison): Card[] {
  const best: Record<CardKind, Itinerary | undefined> = {
    walk: comparison.walk,
    bike: comparison.bike,
    transit: earliestArrival(comparison.transit),
    transitBike: earliestArrival(comparison.transitBike),
  };
  return ORDER.map((kind) => {
    const itinerary = best[kind];
    return itinerary === undefined ? { kind } : { kind, itinerary };
  }).sort((a, b) => {
    if (a.itinerary === undefined || b.itinerary === undefined) {
      return Number(a.itinerary === undefined) - Number(b.itinerary === undefined);
    }
    return a.itinerary.arrival.getTime() - b.itinerary.arrival.getTime() || transfers(a.itinerary) - transfers(b.itinerary);
  });
}
