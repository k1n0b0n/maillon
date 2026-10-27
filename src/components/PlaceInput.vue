<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { Mode, Suggestion } from '../domain/itinerary.ts';
import { usePlaceSuggestions } from './use-place-suggestions.ts';

const props = defineProps<{
  /** The text field's name in the URL (`de`, `a`) and the coordinates' (`dep`, `arr`). */
  name: string;
  coordinatesName: string;
  label: string;
  value: string;
  coordinates?: string | undefined;
  error?: string | undefined;
  /** Offers the person's own position, for the departure. */
  locate?: boolean;
}>();

const KINDS: Record<Suggestion['kind'], string> = { stop: 'Arrêt', address: 'Adresse', place: 'Lieu' };
const MODES: Partial<Record<Mode, string>> = { tram: 'tram', bus: 'bus', ferry: 'Bato', train: 'train', coach: 'car' };

const text = ref(props.value);
const coordinates = ref(props.coordinates ?? '');
const open = ref(false);
const active = ref(-1);
const hydrated = ref(false);
const locating = ref(false);
const locateError = ref('');

const { suggestions } = usePlaceSuggestions(text, open);
watch(suggestions, () => {
  active.value = -1;
});
const inputId = `lieu-${props.name}`;
const listId = `${inputId}-suggestions`;
const errorId = `${inputId}-erreur`;
const expanded = computed(() => open.value && suggestions.value.length > 0);
const announcement = computed(() => {
  if (!open.value || text.value.trim().length < 2) return '';
  const count = suggestions.value.length;
  return count === 0 ? 'Aucune suggestion.' : `${count} suggestion${count > 1 ? 's' : ''}, flèche bas pour les parcourir.`;
});

onMounted(() => {
  hydrated.value = true;
});

function detail(suggestion: Suggestion): string {
  const modes = suggestion.modes.flatMap((mode) => MODES[mode] ?? []).join(', ');
  return [KINDS[suggestion.kind] + (modes ? ` ${modes}` : ''), suggestion.town].filter(Boolean).join(' · ');
}

function typed(event: Event): void {
  text.value = (event.target as HTMLInputElement).value;
  coordinates.value = '';
  open.value = true;
  active.value = -1;
}

function choose(suggestion: Suggestion): void {
  text.value = suggestion.name;
  coordinates.value = `${suggestion.coordinates.lat.toFixed(5)},${suggestion.coordinates.lon.toFixed(5)}`;
  open.value = false;
  active.value = -1;
}

/** -1 is the text field itself: moving past either end of the list comes back to it. */
function move(step: 1 | -1): void {
  if (!expanded.value) {
    open.value = true;
    return;
  }
  const next = active.value + step;
  const count = suggestions.value.length;
  active.value = next < -1 ? count - 1 : next >= count ? -1 : next;
}

function keydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    move(1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    move(-1);
  } else if (event.key === 'Enter' && expanded.value && active.value >= 0) {
    event.preventDefault();
    const suggestion = suggestions.value[active.value];
    if (suggestion) choose(suggestion);
  } else if (event.key === 'Escape' && open.value) {
    event.preventDefault();
    open.value = false;
    active.value = -1;
  }
}

function useMyPosition(): void {
  locateError.value = '';
  locating.value = true;
  const typedBefore = text.value;
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      locating.value = false;
      // The person typed a place while waiting: their choice wins.
      if (text.value !== typedBefore) return;
      text.value = 'Ma position';
      coordinates.value = `${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}`;
    },
    () => {
      locating.value = false;
      locateError.value = 'Position indisponible : tapez une adresse ou un nom d’arrêt.';
    },
    { timeout: 10_000, maximumAge: 60_000 },
  );
}
</script>

<template>
  <div class="place">
    <label :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      :name="name"
      :value="text"
      type="text"
      required
      maxlength="200"
      autocomplete="off"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="expanded ? 'true' : 'false'"
      :aria-controls="listId"
      :aria-activedescendant="expanded && active >= 0 ? `${listId}-${active}` : undefined"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? errorId : undefined"
      @input="typed"
      @keydown="keydown"
      @blur="open = false"
    >
    <input
      v-if="hydrated && coordinates !== ''"
      type="hidden"
      :name="coordinatesName"
      :value="coordinates"
    >
    <ul
      v-show="expanded"
      :id="listId"
      role="listbox"
      :aria-label="`Suggestions pour ${label.toLowerCase()}`"
    >
      <li
        v-for="(suggestion, index) in suggestions"
        :id="`${listId}-${index}`"
        :key="`${suggestion.name}-${suggestion.coordinates.lat}-${suggestion.coordinates.lon}`"
        role="option"
        :aria-selected="index === active ? 'true' : 'false'"
        @pointerdown.prevent
        @click="choose(suggestion)"
      >
        <span class="name">{{ suggestion.name }}</span>
        <span class="detail">{{ detail(suggestion) }}</span>
      </li>
    </ul>
    <span
      class="visually-hidden"
      role="status"
    >{{ announcement }}</span>
    <span
      v-if="error"
      :id="errorId"
      class="error"
    >{{ error }}</span>
    <template v-if="hydrated && locate">
      <button
        type="button"
        class="locate"
        :disabled="locating"
        @click="useMyPosition"
      >
        {{ locating ? 'Localisation…' : 'Utiliser ma position' }}
      </button>
      <span
        role="status"
        class="error"
      >{{ locateError }}</span>
    </template>
  </div>
</template>

<style scoped>
.place {
  position: relative;
  margin: 1rem 0;
}

label {
  display: block;
}

input[type='text'] {
  box-sizing: border-box;
  width: 100%;
  padding: 0.5rem;
  font: inherit;
}

ul {
  position: absolute;
  z-index: 1;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--background);
  border: 1px solid var(--muted);
}

li {
  padding: 0.5rem;
  cursor: pointer;
}

li[aria-selected='true'] {
  outline: 3px solid var(--accent);
  outline-offset: -3px;
}

.name,
.detail {
  display: block;
}

.detail {
  font-size: 0.875rem;
  color: var(--muted);
}

.error {
  color: var(--error);
}

.locate {
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  font: inherit;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
