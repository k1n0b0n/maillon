import { describe, expect, it } from 'vitest';
import { decodePolyline } from './polyline.ts';

describe('decodePolyline', () => {
  it('decodes the reference polyline of the format', () => {
    expect(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@', 5)).toEqual([
      { lat: 38.5, lon: -120.2 },
      { lat: 40.7, lon: -120.95 },
      { lat: 43.252, lon: -126.453 },
    ]);
  });

  it('reads the precision the engine states', () => {
    const [first] = decodePolyline('oh}ntAtw~`@', 6);

    expect(first?.lat).toBeCloseTo(44.8259, 3);
    expect(first?.lon).toBeCloseTo(-0.5567, 3);
  });
});
