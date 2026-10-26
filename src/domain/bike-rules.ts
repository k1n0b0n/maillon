export type Vehicle = 'tram' | 'bus' | 'ferry' | 'regional-train' | 'other-train' | 'coach';

/** Minutes since the start of the service day; a trip after midnight goes past 1440. */
export interface Span {
  first: number;
  last: number;
}

interface Window {
  from: string;
  to: string;
}

export interface BikeRule {
  bikes: 'allowed' | 'outside-peaks' | 'folded-only';
  peaks?: Window[];
  /** Bikes a vehicle takes, when a source gives the number. */
  capacity?: number;
  note?: string;
  source: string;
  checkedOn: string;
}

const BORDEAUX_METROPOLE = 'https://sedeplacer.bordeaux-metropole.fr/a-velo/se-deplacer-a-velo/voyager-avec-velo';
const TER_NOUVELLE_AQUITAINE =
  'https://www.ter.sncf.com/nouvelle-aquitaine/services-contacts/voyager-avec-velo/voyager-avec-velo-ter';

export const BIKE_RULES: Record<Vehicle, BikeRule> = {
  tram: {
    bikes: 'outside-peaks',
    peaks: [
      { from: '07:00', to: '09:00' },
      { from: '16:00', to: '19:00' },
    ],
    note: 'Accepté hors heures de pointe si l’affluence le permet.',
    source: BORDEAUX_METROPOLE,
    checkedOn: '2026-10-26',
  },
  bus: { bikes: 'allowed', source: BORDEAUX_METROPOLE, checkedOn: '2026-10-26' },
  ferry: {
    bikes: 'allowed',
    capacity: 6,
    note: 'Places vélo limitées à bord.',
    source: BORDEAUX_METROPOLE,
    checkedOn: '2026-10-26',
  },
  'regional-train': {
    bikes: 'allowed',
    note: 'Gratuit dans la limite des places ; billet vélo de 3 € sur certaines lignes du 1er mai au 27 septembre.',
    source: TER_NOUVELLE_AQUITAINE,
    checkedOn: '2026-10-26',
  },
  'other-train': {
    bikes: 'folded-only',
    note: 'TGV, Intercités et autres : vélo démonté ou réservé, hors périmètre.',
    source: TER_NOUVELLE_AQUITAINE,
    checkedOn: '2026-10-26',
  },
  coach: { bikes: 'folded-only', source: TER_NOUVELLE_AQUITAINE, checkedOn: '2026-10-26' },
};

const DAY = 24 * 60;

function minutes(time: string): number {
  const [hours = 0, mins = 0] = time.split(':').map(Number);
  return hours * 60 + mins;
}

function overlapsPeak(span: Span, peaks: Window[]): boolean {
  return [0, DAY].some((shift) =>
    peaks.some(({ from, to }) => span.first < minutes(to) + shift && span.last > minutes(from) + shift),
  );
}

/**
 * Whether a trip takes an unfolded bike. A trip that overlaps a peak loses its bike for its whole run:
 * GTFS has one `bikes_allowed` per trip, and the cautious choice is the one a rider can trust.
 */
export function takesBikes(vehicle: Vehicle, span: Span, rules = BIKE_RULES): boolean {
  const rule = rules[vehicle];
  switch (rule.bikes) {
    case 'allowed':
      return true;
    case 'folded-only':
      return false;
    case 'outside-peaks':
      return !overlapsPeak(span, rule.peaks ?? []);
  }
}
