import { describe, expect, it } from 'vitest';
import { parseSearch } from './search.ts';

describe('parseSearch', () => {
  it('reads a complete search from the URL', () => {
    const parsed = parseSearch(new URLSearchParams('de=Gare+Saint-Jean&a=Place+de+la+Bourse'));

    expect(parsed).toEqual({ complete: true, search: { from: 'Gare Saint-Jean', to: 'Place de la Bourse', folding: false } });
  });

  it('lists the missing places and keeps what was typed', () => {
    const parsed = parseSearch(new URLSearchParams('de=Pessac&a=+++'));

    expect(parsed).toEqual({ complete: false, values: { from: 'Pessac', to: '', folding: false }, missing: ['to'] });
  });

  it('reads the folding bike', () => {
    const parsed = parseSearch(new URLSearchParams('de=Pessac&a=Bourse&velo=pliant'));

    expect(parsed.complete && parsed.search.folding).toBe(true);
  });

  it('keeps the coordinates of a chosen place', () => {
    const parsed = parseSearch(new URLSearchParams('de=Ma+position&dep=44.8,-0.6&a=Bourse&arr=nowhere'));

    expect(parsed.complete && parsed.search).toEqual({ from: 'Ma position', to: 'Bourse', folding: false, fromAt: { lat: 44.8, lon: -0.6 } });
  });

  it('reads the time searched, and ignores one that is not a date', () => {
    const at = parseSearch(new URLSearchParams('de=Pessac&a=Bourse&quand=2026-10-27T09:30:00.000Z'));
    const wrong = parseSearch(new URLSearchParams('de=Pessac&a=Bourse&quand=demain'));

    expect(at.complete && at.search.at?.toISOString()).toBe('2026-10-27T09:30:00.000Z');
    expect(wrong.complete && wrong.search.at).toBeUndefined();
  });

  it('cuts a place name at 200 characters', () => {
    const parsed = parseSearch(new URLSearchParams({ de: 'x'.repeat(500), a: 'Pessac' }));

    expect(parsed.complete && parsed.search.from.length).toBe(200);
  });
});
