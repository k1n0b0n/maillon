<script setup lang="ts">
import type { LngLatBoundsLike, Map as MapLibreMap, Marker } from 'maplibre-gl';
// URLs only: the stylesheet and the worker load with the map, after the page (NFR2).
import stylesheet from 'maplibre-gl/dist/maplibre-gl.css?url';
import worker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import type { CardKind } from '../domain/comparison.ts';
import type { ItineraryMap, MarkerFeature } from '../ui/geojson.ts';
import type { ICONS } from '../ui/icons.ts';
import { OPTION_LINES } from '../ui/options.ts';
import { useMapRequests } from './use-map-option.ts';

const props = defineProps<{
  /** The search, with its places' coordinates and the time searched, for `/api/itineraires`. */
  query: string;
  /** The options found: the ones it can draw. */
  options: { kind: CardKind; name: string }[];
  /** The option shown on arrival, drawn first. */
  initial: CardKind;
}>();

/** OpenFreeMap's light style (ADR-0005), loaded with the results unless the browser asks to save data (ADR-0006). */
const STYLE = 'https://tiles.openfreemap.org/styles/positron';
/** Room for the markers around the route, the attribution below it and the zoom buttons. */
const PADDING = { top: 48, right: 56, bottom: 76, left: 48 };

const hydrated = ref(false);
const open = ref(false);
const loading = ref(false);
const failed = ref(false);
const shown = ref<CardKind>(props.initial);
const canvas = ref<HTMLElement | null>(null);
const toggle = ref<HTMLButtonElement | null>(null);
/** Absent for an option with no result: nothing to draw. */
const shownName = computed(() => props.options.find(({ kind }) => kind === shown.value)?.name);
let map: MapLibreMap | undefined;
let data: ItineraryMap | undefined;
let markers: Marker[] = [];
let newMarker: ((feature: MarkerFeature) => Marker) | undefined;
/** Counts the openings: a map that finishes loading after the person hid it is dropped. */
let opening = 0;

// A map hidden, or waiting for a press under Save-Data, stays so: it draws the option chosen once open.
useMapRequests((kind) => {
  shown.value = kind;
  draw();
});

function savesData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true || matchMedia('(prefers-reduced-data: reduce)').matches;
}

function reducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

onMounted(() => {
  hydrated.value = true;
  if (!savesData()) {
    void show();
  }
});

onBeforeUnmount(() => map?.remove());

function bounds(collection: ItineraryMap, kind: CardKind): LngLatBoundsLike {
  const own = collection.features.filter(({ properties }) => properties.option === kind);
  const points = (own.length > 0 ? own : collection.features).flatMap((feature) =>
    feature.geometry.type === 'Point' ? [feature.geometry.coordinates] : feature.geometry.coordinates,
  );
  const lons = points.map(([lon]) => lon);
  const lats = points.map(([, lat]) => lat);
  return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
}

function loadStylesheet(): void {
  if (document.querySelector(`link[href="${stylesheet}"]`) === null) {
    document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: stylesheet }));
  }
}

/** Told apart by shape and icon, not by colour alone (RGAA 3.1); the title is the step's text, which the list also gives. */
function markerElement({ properties }: MarkerFeature, icons: typeof ICONS): HTMLElement {
  const element = document.createElement('div');
  element.className = `map-marker map-marker-${properties.marker}`;
  element.title = properties.title;
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', properties.title);
  const icon = properties.marker === 'to' ? icons.flag : properties.marker === 'change' && properties.mode ? icons[properties.mode] : undefined;
  if (icon !== undefined) {
    element.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icon}</svg>`;
  }
  return element;
}

/** Draws the option shown, alone, with its markers, and frames it. */
function draw(): void {
  const kind = shown.value;
  if (map === undefined || data === undefined || newMarker === undefined || map.getLayer('trajet-fond') === undefined) {
    return;
  }
  map.setFilter('trajet-fond', ['all', ['==', ['geometry-type'], 'LineString'], ['==', ['get', 'option'], kind]]);
  for (const option of props.options) {
    map.setLayoutProperty(`trajet-${option.kind}`, 'visibility', option.kind === kind ? 'visible' : 'none');
  }
  for (const marker of markers) {
    marker.remove();
  }
  const drawn = map;
  const create = newMarker;
  const collection = data;
  markers = collection.features
    .filter((feature): feature is MarkerFeature => 'marker' in feature.properties && feature.properties.option === kind)
    .map((feature) => create(feature).addTo(drawn));
  if (shownName.value === undefined) {
    return;
  }
  // After an option with no result, the canvas shows again on the next render: frame the route at its size.
  void nextTick(() => {
    drawn.resize();
    drawn.fitBounds(bounds(collection, kind), { padding: PADDING, animate: !reducedMotion() });
  });
}

async function show(): Promise<void> {
  const current = ++opening;
  open.value = true;
  loading.value = true;
  failed.value = false;
  await nextTick();
  loadStylesheet();
  try {
    const [{ Map, Marker, NavigationControl, setWorkerUrl }, { ICONS: icons }, response] = await Promise.all([
      import('maplibre-gl'),
      import('../ui/icons.ts'),
      fetch(`/api/itineraires?${props.query}`),
    ]);
    setWorkerUrl(worker);
    if (!response.ok || canvas.value === null) {
      throw new Error(`the itineraries answered ${response.status}`);
    }
    const collection = (await response.json()) as ItineraryMap;
    if (current !== opening || !open.value) {
      return;
    }
    data = collection;
    newMarker = (feature) => new Marker({ element: markerElement(feature, icons) }).setLngLat(feature.geometry.coordinates);
    map = new Map({
      container: canvas.value,
      style: STYLE,
      bounds: bounds(collection, shown.value),
      fitBoundsOptions: { padding: PADDING },
      cooperativeGestures: true,
    });
    map.addControl(new NavigationControl({ showCompass: false }));
    map.getCanvas().setAttribute('aria-label', 'Carte de l’option affichée ; ses étapes sont décrites dessous.');
    let loaded = false;
    // OpenFreeMap down or its style broken: say so, since `load` will never come.
    map.on('error', () => {
      if (!loaded) failed.value = true;
    });
    map.on('load', () => {
      loaded = true;
      if (map === undefined) return;
      map.addSource('trajets', { type: 'geojson', data: collection });
      map.addLayer({
        id: 'trajet-fond',
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
          filter: ['all', ['==', ['geometry-type'], 'LineString'], ['==', ['get', 'option'], kind]],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': line.color,
            'line-width': line.width,
            ...(line.dash && { 'line-dasharray': line.dash }),
          },
        });
      }
      draw();
    });
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

function hide(): void {
  opening += 1;
  loading.value = false;
  for (const marker of markers) {
    marker.remove();
  }
  markers = [];
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
    aria-label="Carte du trajet"
    @keydown="keydown"
  >
    <div
      v-show="open"
      id="carte"
    >
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
        La carte n’a pas pu se charger ; les étapes restent décrites en texte.
      </p>
      <p
        v-if="shownName === undefined"
        class="hint"
      >
        Pas de trajet à montrer sur la carte pour cette option.
      </p>
      <div
        v-show="shownName !== undefined"
        ref="canvas"
        class="canvas"
      />
      <ul
        v-if="shownName !== undefined"
        class="legend"
      >
        <li>
          <span
            class="map-marker map-marker-from"
            aria-hidden="true"
          />
          Départ
        </li>
        <li>
          <span
            class="map-marker map-marker-change"
            aria-hidden="true"
          />
          Changement
        </li>
        <li>
          <span
            class="map-marker map-marker-to"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line
                x1="4"
                x2="4"
                y1="22"
                y2="15"
              />
            </svg>
          </span>
          Arrivée
        </li>
      </ul>
    </div>
    <p class="controls">
      <button
        ref="toggle"
        type="button"
        :aria-expanded="open ? 'true' : 'false'"
        aria-controls="carte"
        @click="open ? hide() : show()"
      >
        {{ open ? 'Masquer la carte' : 'Afficher la carte' }}
      </button>
      <span
        v-if="open"
        class="hint"
      >Échap la masque aussi.</span>
    </p>
  </section>
</template>

<style scoped>
.map {
  margin: 0.75rem 0;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin: 0.5rem 0 0;
  padding: 0;
  font-size: 0.875rem;
  list-style: none;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  align-items: center;
  margin: 0.5rem 0 0;
}

.legend li {
  display: flex;
  gap: 0.375rem;
  align-items: center;
}

.legend .map-marker {
  width: 1.25rem;
  height: 1.25rem;
}

.hint {
  margin: 0;
  font-size: 0.875rem;
  color: var(--muted);
}

/* Short enough for the picker, the map and the option's arrival on a phone's first screen. */
.canvas {
  height: 30vh;
  min-height: 220px;
  max-height: 28rem;
  border-radius: var(--radius);
}

@media (min-width: 48rem) {
  .canvas {
    height: 45vh;
  }
}
</style>

<style>
/* The markers live inside MapLibre's own elements, out of reach of scoped styles. The map's style is always light. */
.map-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  color: #fff;
  background: #1b1b1b;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgb(0 0 0 / 45%);
}

.map-marker svg {
  width: 1rem;
  height: 1rem;
}

.map-marker-from::after {
  width: 0.5rem;
  height: 0.5rem;
  background: #fff;
  border-radius: 50%;
  content: '';
}

.map-marker-to {
  border-radius: 0.375rem;
}

.map-marker-change {
  color: #005f87;
  background: #fff;
  border: 3px solid #005f87;
}
</style>
