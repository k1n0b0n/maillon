import { onBeforeUnmount, onMounted } from 'vue';
import type { CardKind } from '../domain/comparison.ts';

/** The picker and the map are separate islands: the picker tells the map the option chosen through an event on `window`. */
const CHOSEN = 'maillon:option';

/** For the picker: tells the map which option to draw. */
export function useMapOption() {
  return {
    showOnMap: (kind: CardKind) => window.dispatchEvent(new CustomEvent(CHOSEN, { detail: kind })),
  };
}

/** For the map: hears the option chosen. */
export function useMapRequests(onChosen: (kind: CardKind) => void): void {
  const listener = (event: Event) => onChosen((event as CustomEvent<CardKind>).detail);
  onMounted(() => window.addEventListener(CHOSEN, listener));
  onBeforeUnmount(() => window.removeEventListener(CHOSEN, listener));
}
