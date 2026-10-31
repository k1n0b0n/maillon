import { describe, expect, it } from 'vitest';
import { isInsideArea, parseCoordinates } from './area.ts';

describe('isInsideArea', () => {
  it('covers Nouvelle-Aquitaine, its islands and its edges', () => {
    const inside = {
      Bordeaux: { lat: 44.8414, lon: -0.5707 },
      Arcachon: { lat: 44.6586, lon: -1.1689 },
      Thenon: { lat: 45.1383, lon: 1.0711 },
      Périgueux: { lat: 45.1846, lon: 0.7214 },
      Limoges: { lat: 45.8336, lon: 1.2611 },
      Guéret: { lat: 46.1716, lon: 1.8717 },
      Poitiers: { lat: 46.5802, lon: 0.3404 },
      'La Rochelle': { lat: 46.1603, lon: -1.1511 },
      "Saint-Pierre-d'Oléron": { lat: 45.9443, lon: -1.306 },
      Pau: { lat: 43.2951, lon: -0.3708 },
      Hendaye: { lat: 43.3586, lon: -1.7746 },
    };
    for (const [name, place] of Object.entries(inside)) {
      expect(isInsideArea(place), name).toBe(true);
    }
  });

  it('stops at the region', () => {
    const outside = {
      Toulouse: { lat: 43.6045, lon: 1.4442 },
      Cahors: { lat: 44.4475, lon: 1.4419 },
      'Clermont-Ferrand': { lat: 45.7772, lon: 3.087 },
      Tours: { lat: 47.3941, lon: 0.6848 },
      Nantes: { lat: 47.2184, lon: -1.5536 },
      Bilbao: { lat: 43.263, lon: -2.935 },
    };
    for (const [name, place] of Object.entries(outside)) {
      expect(isInsideArea(place), name).toBe(false);
    }
  });
});

describe('parseCoordinates', () => {
  it('reads latitude and longitude', () => {
    expect(parseCoordinates('44.82577,-0.55681')).toEqual({ lat: 44.82577, lon: -0.55681 });
  });

  it('ignores anything else', () => {
    for (const text of [null, '', 'Pessac', '44.8', '95,2', '44.8;-0.5', '44.8,-0.5,1']) {
      expect(parseCoordinates(text)).toBeUndefined();
    }
  });
});
