const DAY_MS = 24 * 60 * 60 * 1000;

/** Days of timetable to load from `today`: up to the first feed that ends, at most `max`. */
export function coveredDays(today: string, feedEnds: string[], max = 120): number {
  const start = Date.parse(today);
  const ends = feedEnds.map((end) => Date.parse(end)).filter((end) => end >= start);
  if (ends.length < feedEnds.length || ends.length === 0) {
    return 0;
  }
  return Math.min(max, Math.round((Math.min(...ends) - start) / DAY_MS) + 1);
}

export function isStale(createdAt: Date, now: Date, maxHours = 48): boolean {
  return now.getTime() - createdAt.getTime() > maxHours * 60 * 60 * 1000;
}

/** A feed that lost more than half of its trips since the last release is broken, not thinner. */
export function lostTrips(previous: number | undefined, current: number): boolean {
  return previous !== undefined && current < previous / 2;
}
