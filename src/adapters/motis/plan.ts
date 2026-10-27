import type { Comparison, Itinerary, Leg, PlanQuery } from '../../domain/itinerary.ts';
import { MODES } from './modes.ts';
import { decodePolyline } from './polyline.ts';

interface MotisPlace {
  name: string;
}

interface MotisLeg {
  mode: string;
  from: MotisPlace;
  to: MotisPlace;
  startTime: string;
  endTime: string;
  distance?: number;
  routeShortName?: string;
  headsign?: string;
  legGeometry?: { points: string; precision: number };
}

interface MotisItinerary {
  startTime: string;
  endTime: string;
  legs: MotisLeg[];
}

interface MotisPlan {
  direct: MotisItinerary[];
  itineraries: MotisItinerary[];
}

/** The engine names the search's two ends; the page knows them better. */
const ENDS = new Set(['START', 'END']);

/** The engine's own limit on a direct walk or ride: without it, MOTIS drops a walk over 30 minutes. */
const MAX_DIRECT_SECONDS = 6 * 60 * 60;

function leg(motis: MotisLeg): Leg {
  return {
    mode: MODES[motis.mode] ?? 'other',
    from: ENDS.has(motis.from.name) ? '' : motis.from.name,
    to: ENDS.has(motis.to.name) ? '' : motis.to.name,
    departure: new Date(motis.startTime),
    arrival: new Date(motis.endTime),
    ...(motis.distance === undefined ? {} : { distanceMeters: Math.round(motis.distance) }),
    ...(motis.routeShortName ? { line: motis.routeShortName } : {}),
    ...(motis.headsign ? { headsign: motis.headsign } : {}),
    ...(motis.legGeometry ? { path: decodePolyline(motis.legGeometry.points, motis.legGeometry.precision) } : {}),
  };
}

export function itinerary(motis: MotisItinerary): Itinerary {
  return { departure: new Date(motis.startTime), arrival: new Date(motis.endTime), legs: motis.legs.map(leg) };
}

async function request(baseUrl: string, query: PlanQuery, params: Record<string, string>): Promise<MotisPlan> {
  const url = new URL('/api/v6/plan', baseUrl);
  url.search = new URLSearchParams({
    fromPlace: `${query.from.lat},${query.from.lon}`,
    toPlace: `${query.to.lat},${query.to.lon}`,
    time: query.time.toISOString(),
    arriveBy: String(query.arriveBy),
    ...params,
  }).toString();
  // One retry covers the engine's restart on a new release, under a second (ADR-0004).
  for (let attempt = 1; ; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (!response.ok) {
        throw new Error(`the engine answered ${response.status}`);
      }
      return (await response.json()) as MotisPlan;
    } catch (error) {
      if (attempt === 2 || !(error instanceof TypeError)) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

/** Two requests: walk, bike and transit together, then transit with the bike on board (ADR-0001); without a bike, the first on foot only. */
export async function compare(baseUrl: string, query: PlanQuery): Promise<Comparison> {
  const hasBike = query.bike !== 'none';
  const [plain, withBike] = await Promise.all([
    request(baseUrl, query, { directModes: hasBike ? 'WALK,BIKE' : 'WALK', maxDirectTime: String(MAX_DIRECT_SECONDS) }),
    hasBike
      ? request(baseUrl, query, {
          directModes: '',
          preTransitModes: 'BIKE',
          postTransitModes: 'BIKE',
          ...(query.bike === 'folding' ? {} : { requireBikeTransport: 'true' }),
        })
      : undefined,
  ]);
  const direct = (mode: string) => plain.direct.find((motis) => motis.legs[0]?.mode === mode);
  const walk = direct('WALK');
  const bike = direct('BIKE');
  return {
    ...(walk ? { walk: itinerary(walk) } : {}),
    ...(bike ? { bike: itinerary(bike) } : {}),
    transit: plain.itineraries.map(itinerary),
    transitBike: withBike?.itineraries.map(itinerary) ?? [],
  };
}
