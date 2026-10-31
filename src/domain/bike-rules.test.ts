import { describe, expect, it } from 'vitest';
import { BIKE_RULES, takesBikes } from './bike-rules.ts';

const at = (first: string, last: string) => {
  const minutes = (time: string) => {
    const [hours = 0, mins = 0] = time.split(':').map(Number);
    return hours * 60 + mins;
  };
  return { first: minutes(first), last: minutes(last) };
};

describe('takesBikes', () => {
  it('lets a bike on a tram that runs between the peaks', () => {
    expect(takesBikes('tram', at('10:30', '11:20'))).toBe(true);
  });

  it('refuses a bike on a tram that overlaps a peak, even by a minute', () => {
    expect(takesBikes('tram', at('06:20', '07:01'))).toBe(false);
    expect(takesBikes('tram', at('18:59', '19:40'))).toBe(false);
  });

  it('lets a bike on a tram that ends when the peak starts', () => {
    expect(takesBikes('tram', at('06:10', '07:00'))).toBe(true);
  });

  it('reads a trip after midnight against the next morning peaks', () => {
    expect(takesBikes('tram', at('24:30', '25:10'))).toBe(true);
    expect(takesBikes('tram', at('30:50', '31:10'))).toBe(false);
  });

  it('never lets an unfolded bike on a bus, a coach or a TGV', () => {
    for (const vehicle of ['bus', 'coach', 'other-train'] as const) {
      expect(takesBikes(vehicle, at('10:00', '11:00'))).toBe(false);
    }
  });

  it('lets a bike on Le Bato and the TER at any hour', () => {
    expect(takesBikes('ferry', at('08:00', '08:10'))).toBe(true);
    expect(takesBikes('regional-train', at('17:00', '18:00'))).toBe(true);
  });

  it('states a source and the date it was checked for every rule', () => {
    for (const rule of Object.values(BIKE_RULES)) {
      expect(rule.source).toMatch(/^https:\/\//);
      expect(rule.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
