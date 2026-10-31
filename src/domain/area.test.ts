import { describe, expect, it } from 'vitest';
import { isInsideArea, parseCoordinates } from './area.ts';

describe('isInsideArea', () => {
  it('covers Bordeaux and Arcachon, not Toulouse', () => {
    expect(isInsideArea({ lat: 44.8414, lon: -0.5707 })).toBe(true);
    expect(isInsideArea({ lat: 44.6586, lon: -1.1689 })).toBe(true);
    expect(isInsideArea({ lat: 43.6045, lon: 1.4442 })).toBe(false);
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
