export type Mode = 'walk' | 'bike' | 'tram' | 'bus' | 'ferry' | 'train' | 'coach' | 'other';

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Place {
  name: string;
  coordinates: Coordinates;
}

export interface Suggestion extends Place {
  kind: 'stop' | 'address' | 'place';
  town?: string;
  /** What stops there, for a stop: tells La Cité du Vin of the tram from the one of Le Bato. */
  modes: Mode[];
}

export interface Leg {
  mode: Mode;
  from: string;
  to: string;
  departure: Date;
  arrival: Date;
  distanceMeters?: number;
  line?: string;
  headsign?: string;
  /** The way the leg follows, for the map. */
  path?: Coordinates[];
}

export interface Itinerary {
  departure: Date;
  arrival: Date;
  legs: Leg[];
}

/** A folded bike rides every vehicle, the bus included. */
export type Bike = 'none' | 'classic' | 'folding';

/** The four options of the comparison screen; `transitBike` holds the folding bike's options when asked. */
export interface Comparison {
  walk?: Itinerary;
  bike?: Itinerary;
  transit: Itinerary[];
  transitBike: Itinerary[];
}

export type Option = keyof Comparison;

export interface PlanQuery {
  from: Coordinates;
  to: Coordinates;
  time: Date;
  arriveBy: boolean;
  bike: Bike;
}

export function isTransit(leg: Leg): boolean {
  return leg.mode !== 'walk' && leg.mode !== 'bike';
}

export function transfers(itinerary: Itinerary): number {
  return Math.max(0, itinerary.legs.filter(isTransit).length - 1);
}

/** The one that arrives first, then the one with fewer changes. */
export function earliestArrival(itineraries: Itinerary[]): Itinerary | undefined {
  return itineraries.toSorted(
    (a, b) => a.arrival.getTime() - b.arrival.getTime() || transfers(a) - transfers(b),
  )[0];
}

export function options(comparison: Comparison, option: Option): Itinerary[] {
  const value = comparison[option];
  return Array.isArray(value) ? value : value === undefined ? [] : [value];
}
