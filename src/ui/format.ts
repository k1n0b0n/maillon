import type { BikeRule, Vehicle } from '../domain/bike-rules.ts';
import { type Itinerary, type Leg, type Mode, transfers } from '../domain/itinerary.ts';

const CLOCK = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' });

const VEHICLES: Record<Mode, string> = {
  walk: 'À pied',
  bike: 'À vélo',
  tram: 'Tram',
  bus: 'Bus',
  ferry: 'Bato',
  train: 'Train',
  coach: 'Car',
  other: 'Transport',
};

/** A number and its unit never part at the end of a line: French typography, and narrow phones. */
const NBSP = '\u00a0';

export function clock(date: Date): string {
  return CLOCK.format(date).replace(':', `${NBSP}h${NBSP}`);
}

export function duration(from: Date, to: Date): string {
  const minutes = Math.round((to.getTime() - from.getTime()) / 60_000);
  if (minutes < 60) {
    return `${minutes}${NBSP}min`;
  }
  const rest = minutes % 60;
  return `${Math.floor(minutes / 60)}${NBSP}h${rest === 0 ? '' : `${NBSP}${String(rest).padStart(2, '0')}`}`;
}

export function distance(meters: number): string {
  return meters < 1000
    ? `${Math.max(10, Math.round(meters / 10) * 10)}${NBSP}m`
    : `${(meters / 1000).toFixed(1).replace('.', ',')}${NBSP}km`;
}

export function changes(itinerary: Itinerary): string {
  const count = transfers(itinerary);
  return count === 0 ? 'sans correspondance' : count === 1 ? '1 correspondance' : `${count} correspondances`;
}

/** A step of the route detail: its head names the mode, line and direction; its detail gives the stops and times. */
export interface Step {
  vehicle: string;
  line?: string;
  towards: string;
  detail: string;
}

/** One step of the text detail; the engine leaves the search's two ends unnamed. */
export function step(leg: Leg, origin: string, destination: string): Step {
  const from = leg.from || origin;
  const to = leg.to || destination;
  if (leg.mode === 'walk' || leg.mode === 'bike') {
    const length = leg.distanceMeters === undefined ? '' : `, ${distance(leg.distanceMeters)}`;
    return { vehicle: VEHICLES[leg.mode], towards: `jusqu’à ${to}`, detail: `${duration(leg.departure, leg.arrival)}${length}` };
  }
  return {
    vehicle: VEHICLES[leg.mode],
    ...(leg.line ? { line: leg.line } : {}),
    towards: leg.headsign ? `direction ${leg.headsign}` : `jusqu’à ${to}`,
    detail: `Montez à ${from} à ${clock(leg.departure)}, descendez à ${to} à ${clock(leg.arrival)}`,
  };
}

const RIDDEN: Record<Vehicle, string> = {
  tram: 'Tram',
  bus: 'Bus',
  ferry: 'Bato',
  'regional-train': 'TER',
  'other-train': 'Train',
  coach: 'Car',
};

/** What a rider with a bike must know about a vehicle, from the bike rules. */
export function bikeNote(vehicle: Vehicle, rule: BikeRule): string | undefined {
  const parts = [rule.note, rule.capacity === undefined ? undefined : `${rule.capacity} vélos au plus par ${vehicle === 'ferry' ? 'bateau' : 'véhicule'}`];
  const text = parts.filter((part) => part !== undefined).join(', ');
  return text === '' ? undefined : `${RIDDEN[vehicle]} : ${text}.`;
}
