import { describe, expect, it } from 'vitest';
import type { Itinerary, Leg } from '../domain/itinerary.ts';
import { BIKE_RULES } from '../domain/bike-rules.ts';
import { bikeNote, changes, clock, distance, duration, step } from './format.ts';

const at = (time: string) => new Date(`2026-10-27T${time}:00+01:00`);

describe('format', () => {
  it('writes times the French way, in Bordeaux time', () => {
    expect(clock(new Date('2026-10-27T09:31:00Z'))).toBe('10 h 31');
  });

  it('writes durations in minutes, then hours', () => {
    expect(duration(at('10:30'), at('10:41'))).toBe('11 min');
    expect(duration(at('10:30'), at('12:35'))).toBe('2 h 05');
    expect(duration(at('10:30'), at('12:30'))).toBe('2 h');
  });

  it('writes distances in metres, then kilometres', () => {
    expect(distance(16)).toBe('20 m');
    expect(distance(8992)).toBe('9,0 km');
  });

  it('counts the changes between vehicles', () => {
    const ride = (mode: Leg['mode']): Leg => ({ mode, from: '', to: '', departure: at('10:00'), arrival: at('10:10') });
    const itinerary = (legs: Leg[]): Itinerary => ({ departure: at('10:00'), arrival: at('11:00'), legs });
    expect(changes(itinerary([ride('bike'), ride('tram'), ride('bike')]))).toBe('sans correspondance');
    expect(changes(itinerary([ride('walk'), ride('tram'), ride('walk'), ride('bus')]))).toBe('1 correspondance');
  });

  it('names the search ends the engine leaves unnamed', () => {
    const toStop: Leg = { mode: 'bike', from: '', to: 'Gare Saint-Jean', departure: at('10:30'), arrival: at('10:31'), distanceMeters: 16 };
    const ride: Leg = { mode: 'tram', from: 'Gare Saint-Jean', to: 'Tauzia', departure: at('10:31'), arrival: at('10:32'), line: 'F', headsign: 'Mérignac Aéroport' };
    const home: Leg = { mode: 'walk', from: 'Tauzia', to: '', departure: at('10:32'), arrival: at('10:41') };

    expect(step(toStop, 'Ma rue', 'Bourse')).toBe('À vélo jusqu’à Gare Saint-Jean : 1 min, 20 m.');
    expect(step(ride, 'Ma rue', 'Bourse')).toBe('Tram F direction Mérignac Aéroport, de Gare Saint-Jean à 10 h 31 jusqu’à Tauzia à 10 h 32.');
    expect(step(home, 'Ma rue', 'Bourse')).toBe('À pied jusqu’à Bourse : 9 min.');
  });

  it('turns the bike rules into what a rider must know', () => {
    expect(bikeNote('ferry', BIKE_RULES.ferry)).toBe('Bato : 6 vélos au plus par bateau.');
    expect(bikeNote('tram', BIKE_RULES.tram)).toBe('Tram : vélo accepté hors heures de pointe, si l’affluence le permet.');
  });
});
