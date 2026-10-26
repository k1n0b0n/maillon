import type { Comparison, Itinerary, Leg, Mode, PlanQuery } from '../../domain/itinerary.ts';

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

const MODES: Record<string, Mode> = {
  WALK: 'walk',
  BIKE: 'bike',
  TRAM: 'tram',
  BUS: 'bus',
  FERRY: 'ferry',
  COACH: 'coach',
  RAIL: 'train',
  REGIONAL_RAIL: 'train',
  REGIONAL_FAST_RAIL: 'train',
  SUBURBAN: 'train',
  HIGHSPEED_RAIL: 'train',
  LONG_DISTANCE: 'train',
  NIGHT_RAIL: 'train',
};

/** The engine's own limit on a direct walk or ride: without it, MOTIS drops a walk over 30 minutes. */
const MAX_DIRECT_SECONDS = 6 * 60 * 60;

function leg(motis: MotisLeg): Leg {
  return {
    mode: MODES[motis.mode] ?? 'other',
    from: motis.from.name,
    to: motis.to.name,
    departure: new Date(motis.startTime),
    arrival: new Date(motis.endTime),
    ...(motis.distance === undefined ? {} : { distanceMeters: Math.round(motis.distance) }),
    ...(motis.routeShortName ? { line: motis.routeShortName } : {}),
    ...(motis.headsign ? { headsign: motis.headsign } : {}),
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

/** Two requests: walk, bike and transit together, then transit with the bike on board (ADR-0001). */
export async function compare(baseUrl: string, query: PlanQuery): Promise<Comparison> {
  const [plain, withBike] = await Promise.all([
    request(baseUrl, query, { directModes: 'WALK,BIKE', maxDirectTime: String(MAX_DIRECT_SECONDS) }),
    request(baseUrl, query, {
      directModes: '',
      preTransitModes: 'BIKE',
      postTransitModes: 'BIKE',
      ...(query.folding ? {} : { requireBikeTransport: 'true' }),
    }),
  ]);
  const direct = (mode: string) => plain.direct.find((motis) => motis.legs[0]?.mode === mode);
  const walk = direct('WALK');
  const bike = direct('BIKE');
  return {
    ...(walk ? { walk: itinerary(walk) } : {}),
    ...(bike ? { bike: itinerary(bike) } : {}),
    transit: plain.itineraries.map(itinerary),
    transitBike: withBike.itineraries.map(itinerary),
  };
}
