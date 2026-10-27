<script setup lang="ts">
import type { LngLatBoundsLike, Map as MapLibreMap } from 'maplibre-gl';
// URLs only: the stylesheet and the worker load when the map opens, never with the page (NFR2).
import stylesheet from 'maplibre-gl/dist/maplibre-gl.css?url';
import worker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import type { CardKind } from '../domain/comparison.ts';
import type { ItineraryMap } from '../ui/geojson.ts';
import { OPTION_LINES } from '../ui/options.ts';

const props = defineProps<{
  /** The search, with its places' coordinates and the time searched, for `/api/itineraires`. */
  query: string;
  options: { kind: CardKind; name: string }[];
}>();

/** OpenFreeMap's light style, loaded only when the person opens the map (ADR-0005). */
const STYLE = 'https://tiles.openfreemap.org/styles/positron';

const hydrated = ref(false);
const open = ref(false);
const loading = ref(false);
const failed = ref(false);
const canvas = ref<HTMLElement | null>(null);
const toggle = ref<HTMLButtonElement | null>(null);
let map: MapLibreMap | undefined;

onMounted(() => {
  hydrated.value = true;
});

onBeforeUnmount(() => map?.remove());

function bounds(data: ItineraryMap): LngLatBoundsLike {
  const points = data.features.flatMap((feature) =>
    feature.geometry.type === 'Point' ? [feature.geometry.coordinates] : feature.geometry.coordinates,
  );
  const lons = points.map(([lon]) => lon);
  const lats = points.map(([, lat]) => lat);
  return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
}

function dash(kind: CardKind): string | undefined {
  const { dash: pattern, width } = OPTION_LINES[kind];
  return pattern && pattern.map((length) => Math.max(length * width, 0.5)).join(' ');
}

function loadStylesheet(): void {
  if (document.querySelector(`link[href="${stylesheet}"]`) === null) {
    document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: stylesheet }));
  }
}

async function show(): Promise<void> {
  open.value = true;
  loading.value = true;
  failed.value = false;
  await nextTick();
  loadStylesheet();
  try {
    const [{ Map, NavigationControl, setWorkerUrl }, response] = await Promise.all([
      import('maplibre-gl'),
      fetch(`/api/itineraires?${props.query}`),
    ]);
    setWorkerUrl(worker);
    if (!response.ok || canvas.value === null) {
      throw new Error(`the itineraries answered ${response.status}`);
    }
    const data = (await response.json()) as ItineraryMap;
    map = new Map({
      container: canvas.value,
      style: STYLE,
      bounds: bounds(data),
      fitBoundsOptions: { padding: 40 },
      cooperativeGestures: true,
    });
    map.addControl(new NavigationControl({ showCompass: false }));
    map.getCanvas().setAttribute('aria-label', 'Carte des trajets ; leurs étapes sont décrites dans la liste.');
    map.on('load', () => {
      if (map === undefined) return;
      map.addSource('trajets', { type: 'geojson', data });
      map.addLayer({
        id: 'trajets-fond',
        type: 'line',
        source: 'trajets',
        filter: ['==', ['geometry-type'], 'LineString'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.8 },
      });
      for (const { kind } of props.options) {
        const line = OPTION_LINES[kind];
        map.addLayer({
          id: `trajet-${kind}`,
          type: 'line',
          source: 'trajets',
          filter: ['==', ['get', 'option'], kind],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': line.color,
            'line-width': line.width,
            'line-offset': line.offset,
            ...(line.dash && { 'line-dasharray': line.dash }),
          },
        });
      }
      map.addLayer({
        id: 'extremites',
        type: 'circle',
        source: 'trajets',
        filter: ['has', 'end'],
        paint: {
          'circle-radius': 7,
          'circle-color': ['match', ['get', 'end'], 'from', '#1b1b1b', '#ffffff'],
          'circle-stroke-color': '#1b1b1b',
          'circle-stroke-width': 3,
        },
      });
    });
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

function hide(): void {
  map?.remove();
  map = undefined;
  open.value = false;
  toggle.value?.focus();
}

function keydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    hide();
  }
}
</script>

<template>
  <section
    v-if="hydrated"
    class="map"
    aria-labelledby="carte-titre"
    @keydown="keydown"
  >
    <h2 id="carte-titre">
      Carte des trajets
    </h2>
    <button
      ref="toggle"
      type="button"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="carte"
      @click="open ? hide() : show()"
    >
      {{ open ? 'Masquer la carte' : 'Afficher la carte' }}
    </button>
    <div
      v-show="open"
      id="carte"
    >
      <p>La carte reprend les trajets décrits plus haut. Échap la referme.</p>
      <ul class="legend">
        <li
          v-for="option in options"
          :key="option.kind"
        >
          <svg
            width="40"
            height="12"
            aria-hidden="true"
          >
            <line
              x1="4"
              y1="6"
              x2="36"
              y2="6"
              :stroke="OPTION_LINES[option.kind].color"
              :stroke-width="OPTION_LINES[option.kind].width"
              :stroke-dasharray="dash(option.kind)"
              stroke-linecap="round"
            />
          </svg>
          {{ option.name }}
        </li>
        <li>
          <svg
            width="40"
            height="12"
            aria-hidden="true"
          >
            <circle
              cx="10"
              cy="6"
              r="4"
              fill="#1b1b1b"
            />
            <circle
              cx="30"
              cy="6"
              r="4"
              fill="#ffffff"
              stroke="#1b1b1b"
              stroke-width="2"
            />
          </svg>
          Départ, arrivée
        </li>
      </ul>
      <p
        v-if="loading"
        role="status"
      >
        Chargement de la carte…
      </p>
      <p
        v-if="failed"
        role="alert"
      >
        La carte n’a pas pu se charger ; les trajets restent décrits plus haut.
      </p>
      <div
        ref="canvas"
        class="canvas"
      />
    </div>
  </section>
</template>

<style scoped>
.map {
  margin: 2rem 0;
}

button {
  padding: 0.5rem 1rem;
  font: inherit;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  padding: 0;
  list-style: none;
}

.legend svg {
  vertical-align: middle;
}

.canvas {
  height: 60vh;
  min-height: 300px;
}
</style>
