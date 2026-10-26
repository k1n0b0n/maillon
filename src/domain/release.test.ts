import { describe, expect, it } from 'vitest';
import { coveredDays, isStale, lostTrips } from './release.ts';

describe('coveredDays', () => {
  it('stops at the first feed that ends', () => {
    expect(coveredDays('2026-10-26', ['2027-01-22', '2027-03-31'])).toBe(89);
  });

  it('caps the days loaded', () => {
    expect(coveredDays('2026-10-26', ['2027-12-31'], 120)).toBe(120);
  });

  it('covers nothing once a feed has ended', () => {
    expect(coveredDays('2026-10-26', ['2026-10-25', '2027-03-31'])).toBe(0);
  });
});

describe('isStale', () => {
  it('flags data older than 48 hours', () => {
    const now = new Date('2026-10-28T12:00:00Z');
    expect(isStale(new Date('2026-10-26T11:59:00Z'), now)).toBe(true);
    expect(isStale(new Date('2026-10-26T12:01:00Z'), now)).toBe(false);
  });
});

describe('lostTrips', () => {
  it('flags a feed that lost more than half of its trips', () => {
    expect(lostTrips(68_000, 30_000)).toBe(true);
    expect(lostTrips(68_000, 60_000)).toBe(false);
    expect(lostTrips(undefined, 10)).toBe(false);
  });
});
