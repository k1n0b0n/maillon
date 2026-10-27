import { onBeforeUnmount, type Ref, ref, watch } from 'vue';
import type { Suggestion } from '../domain/itinerary.ts';

const DELAY_MS = 200;
const MIN_LENGTH = 2;

/** Suggestions for what the person types, asked a moment after they stop, the previous request cancelled. */
export function usePlaceSuggestions(text: Ref<string>, enabled: Ref<boolean>) {
  const suggestions = ref<Suggestion[]>([]);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: AbortController | undefined;

  async function load(query: string): Promise<void> {
    pending?.abort();
    pending = new AbortController();
    try {
      const response = await fetch(`/api/lieux?q=${encodeURIComponent(query)}`, { signal: pending.signal });
      suggestions.value = response.ok ? ((await response.json()) as Suggestion[]) : [];
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        suggestions.value = [];
      }
    }
  }

  watch([text, enabled], ([query, on]) => {
    clearTimeout(timer);
    // An answer for the previous text must not land after this one.
    pending?.abort();
    if (!on || query.trim().length < MIN_LENGTH) {
      suggestions.value = [];
      return;
    }
    timer = setTimeout(() => void load(query.trim()), DELAY_MS);
  });

  onBeforeUnmount(() => {
    clearTimeout(timer);
    pending?.abort();
  });

  return { suggestions };
}
