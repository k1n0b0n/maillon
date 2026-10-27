import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { CardKind } from '../domain/comparison.ts';

/** The map and the "Voir sur la carte" buttons are separate islands: they talk through two events on `window`. */
const ASKED = 'maillon:carte';
const SHOWN = 'maillon:carte-affichee';

function listen<T>(name: string, handler: (detail: T) => void): void {
  const listener = (event: Event) => handler((event as CustomEvent<T>).detail);
  onMounted(() => window.addEventListener(name, listener));
  onBeforeUnmount(() => window.removeEventListener(name, listener));
}

/** For a button: asks the map for an option, and knows which option the map shows. */
export function useMapOption() {
  const shown = ref<CardKind>();
  listen<CardKind | undefined>(SHOWN, (kind) => {
    shown.value = kind;
  });
  return {
    shown,
    showOnMap: (kind: CardKind) => window.dispatchEvent(new CustomEvent(ASKED, { detail: kind })),
  };
}

/** For the map: hears the options asked, and tells the buttons which one it shows, none once hidden. */
export function useMapRequests(onAsked: (kind: CardKind) => void) {
  listen(ASKED, onAsked);
  return {
    tellShown: (kind: CardKind | undefined) => window.dispatchEvent(new CustomEvent(SHOWN, { detail: kind })),
  };
}
