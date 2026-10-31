export type Mode = 'walk' | 'bike' | 'tram' | 'bus' | 'ferry' | 'train' | 'coach' | 'other';

export interface Coordinates {
  lat: number;
  lon: number;
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
}

export interface Itinerary {
  departure: Date;
  arrival: Date;
  legs: Leg[];
}

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
  folding: boolean;
}

export function isTransit(leg: Leg): boolean {
  return leg.mode !== 'walk' && leg.mode !== 'bike';
}

export function transfers(itinerary: Itinerary): number {
  return Math.max(0, itinerary.legs.filter(isTransit).length - 1);
}

export function options(comparison: Comparison, option: Option): Itinerary[] {
  const value = comparison[option];
  return Array.isArray(value) ? value : value === undefined ? [] : [value];
}
