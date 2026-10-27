import type { CardKind } from '../domain/comparison.ts';

export function optionName(kind: CardKind, folding: boolean): string {
  switch (kind) {
    case 'walk':
      return 'À pied';
    case 'bike':
      return 'À vélo';
    case 'transit':
      return 'Transports en commun';
    case 'transitBike':
      return folding ? 'Transports avec votre vélo pliant' : 'Transports avec votre vélo';
  }
}

/**
 * How each option is drawn on the map: a colour and a dash pattern, so no option is told by its colour alone (RGAA 3.1),
 * and an offset, so options that share a street stay side by side. Dashes are in line widths, as MapLibre counts them.
 */
export const OPTION_LINES: Record<CardKind, { color: string; width: number; offset: number; dash?: [number, number] }> = {
  transit: { color: '#005f87', width: 5, offset: -6 },
  transitBike: { color: '#a4262c', width: 5, offset: -2, dash: [3, 1.5] },
  bike: { color: '#1b6e3a', width: 4, offset: 2, dash: [1, 1.5] },
  walk: { color: '#5b3f8c', width: 4, offset: 6, dash: [0.1, 2] },
};
