<script setup lang="ts">
import { ref } from 'vue';
import type { CardKind } from '../domain/comparison.ts';
import { ICONS } from '../ui/icons.ts';
import { panelId, type PickerOption } from '../ui/options.ts';
import { useMapOption } from './use-map-option.ts';

const props = defineProps<{
  options: PickerOption[];
  /** The option shown on arrival: the one the link asks for, else the first. */
  initial: CardKind;
}>();

const chosen = ref<CardKind>(props.initial);
const announcement = ref('');
const { showOnMap } = useMapOption();

/**
 * Without JavaScript, each link loads the page with its option shown. Once hydrated, a press shows the option's panel in
 * place (the server renders them all, the others hidden), keeps its link in the address bar, and tells the map.
 */
function pick(event: MouseEvent, option: PickerOption): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  event.preventDefault();
  chosen.value = option.kind;
  for (const { kind } of props.options) {
    const panel = document.getElementById(panelId(kind));
    if (panel !== null) {
      panel.hidden = kind !== option.kind;
    }
  }
  history.replaceState(history.state, '', option.href);
  showOnMap(option.kind);
  announcement.value = `Affiché : ${option.name}.`;
}
</script>

<template>
  <nav aria-label="Options, de la première arrivée à la dernière">
    <ul>
      <li
        v-for="option in options"
        :key="option.kind"
      >
        <a
          :href="option.href"
          :aria-current="option.kind === chosen ? 'true' : undefined"
          @click="pick($event, option)"
        >
          <span class="label">
            <!-- eslint-disable vue/no-v-html -- Lucide's paths, from the code, never from the person. -->
            <svg
              v-for="mode in option.modes"
              :key="mode"
              class="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              focusable="false"
              v-html="ICONS[mode]"
            />
            <!-- eslint-enable vue/no-v-html -->
            {{ option.label }}
          </span>
          <span
            v-if="option.arrival"
            class="times"
          >
            <time
              class="arrival"
              :datetime="option.arrival.iso"
            >{{ option.arrival.text }}</time>
            <span class="secondary">{{ option.duration }}</span>
          </span>
          <span
            v-else
            class="none"
          >Aucun trajet</span>
          <span
            v-if="option.first"
            class="secondary"
          >le plus rapide</span>
        </a>
      </li>
    </ul>
    <p
      class="visually-hidden"
      role="status"
    >
      {{ announcement }}
    </p>
  </nav>
</template>

<style scoped>
ul {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

a {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  color: var(--text);
  text-decoration: none;
  background: var(--surface);
  border: 2px solid var(--control);
  border-radius: var(--radius);
}

a:hover {
  border-color: var(--accent);
}

/* Filled, not only another colour: the option shown stands out in lightness too (RGAA 3.1). */
a[aria-current='true'] {
  color: var(--on-accent);
  background: var(--accent);
  border-color: var(--accent);
}

.label {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
}

.label .icon {
  width: 1rem;
  height: 1rem;
}

.times {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.5rem;
  align-items: baseline;
}

.arrival {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
}

.none {
  padding: 0.125rem 0;
  font-weight: 600;
}

.secondary {
  font-size: 0.8125rem;
  color: var(--muted);
}

a[aria-current='true'] .secondary {
  color: inherit;
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
