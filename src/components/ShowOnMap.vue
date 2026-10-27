<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { CardKind } from '../domain/comparison.ts';
import { useMapOption } from './use-map-option.ts';

defineProps<{
  kind: CardKind;
  /** The option's name, for screen readers: every card has the same button. */
  name: string;
}>();

const hydrated = ref(false);
const { shown, showOnMap } = useMapOption();

onMounted(() => {
  hydrated.value = true;
});
</script>

<template>
  <button
    v-if="hydrated"
    type="button"
    :aria-pressed="shown === kind ? 'true' : 'false'"
    @click="showOnMap(kind)"
  >
    <!-- Lucide's map icon (ISC, LICENSES/lucide.txt). -->
    <svg
      class="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
      <path d="M15 5.764v15" />
      <path d="M9 3.236v15" />
    </svg>
    Voir sur la carte<span class="visually-hidden"> : {{ name }}</span>
  </button>
</template>

<style scoped>
button {
  margin-top: 0.5rem;
}

button[aria-pressed='true'] {
  color: var(--on-accent);
  background: var(--accent);
  border-color: var(--accent);
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
