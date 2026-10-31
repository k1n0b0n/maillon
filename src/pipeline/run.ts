import { cp, link, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type FeedSummary, ReleaseStore } from '../adapters/data/releases.ts';
import { download } from '../adapters/data/sources.ts';
import { checkFeed, extract, feedEnd, readTrips, type VehicleSource, writeBikesAllowed } from '../adapters/gtfs/feed.ts';
import { importTimetables } from '../adapters/motis/import.ts';
import { takesBikes } from '../domain/bike-rules.ts';
import { coveredDays, lostTrips } from '../domain/release.ts';

/**
 * Builds a release of the engine's data: downloads, validates, applies the bike rules, imports, then switches.
 * Any failure leaves the current release in place and exits with 1.
 */
const env = process.env;
const root = env['DATA_DIR'] ?? '/data';
const feeds: { id: string; url: string; vehicles: VehicleSource }[] = [
  {
    id: 'tbm',
    url:
      env['TBM_GTFS_URL'] ??
      'https://bdx.mecatran.com/utw/ws/gtfsfeed/static/bordeaux?apiKey=opendata-bordeaux-metropole-flux-gtfs-rt',
    vehicles: 'route-type',
  },
  {
    id: 'sncf',
    url: env['SNCF_GTFS_URL'] ?? 'https://eu.ftp.opendatasoft.com/sncf/plandata/Export_OpenData_SNCF_GTFS_NewTripId.zip',
    vehicles: 'sncf-stop-category',
  },
];
// Clipped each week by the `osm` workflow: clipping needs 4 GB, more than the server has (ADR-0004).
const osmUrl = env['OSM_URL'] ?? 'https://github.com/k1n0b0n/maillon/releases/download/osm-gironde/gironde.osm.pbf';
const osmMaxAgeDays = Number(env['OSM_MAX_AGE_DAYS'] ?? 7);
const today = env['PIPELINE_TODAY'] ?? new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());

function log(message: string): void {
  process.stderr.write(`${new Date().toISOString()} ${message}\n`);
}

async function prepareFeed(
  feed: (typeof feeds)[number],
  dir: string,
  downloads: string,
  tripsBefore: number | undefined,
): Promise<FeedSummary> {
  const gtfs = join(dir, feed.id);
  if (feed.url.startsWith('file:')) {
    // A folder, as the golden routes' frozen dataset keeps its feeds.
    await cp(fileURLToPath(feed.url), gtfs, { recursive: true });
    checkFeed(gtfs);
  } else {
    const zip = join(downloads, `${feed.id}.gtfs.zip`);
    log(`${feed.id}: ${await download(feed.url, zip)}`);
    await extract(zip, gtfs);
  }
  const { end, version } = await feedEnd(gtfs);
  const { vehicles, spans } = await readTrips(gtfs, feed.vehicles);
  const counts = await writeBikesAllowed(gtfs, (tripId) => {
    const vehicle = vehicles.get(tripId);
    const span = spans.get(tripId);
    return vehicle !== undefined && span !== undefined && takesBikes(vehicle, span);
  });
  if (lostTrips(tripsBefore, counts.trips)) {
    throw new Error(`${feed.id} has ${counts.trips} trips against ${tripsBefore} in the current release`);
  }
  log(`${feed.id}: ${counts.trips} trips, ${counts.withBikes} with bikes, valid until ${end}`);
  return { id: feed.id, version, end, ...counts };
}

async function main(): Promise<void> {
  const store = new ReleaseStore(root);
  const current = await store.current();
  const id = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
  const dir = store.dir(id);
  const downloads = join(root, 'downloads');
  await mkdir(dir, { recursive: true });
  await mkdir(downloads, { recursive: true });
  try {
    const summaries: FeedSummary[] = [];
    for (const feed of feeds) {
      summaries.push(await prepareFeed(feed, dir, downloads, current?.feeds.find(({ id }) => id === feed.id)?.trips));
    }
    const days = coveredDays(today, summaries.map(({ end }) => end));
    if (days === 0) {
      throw new Error(`a feed has ended before ${today}`);
    }
    const osm = join(downloads, 'area.osm.pbf');
    log(`osm: ${await download(osmUrl, osm, osmMaxAgeDays)}`);
    await link(osm, join(dir, 'area.osm.pbf'));
    log(`engine: importing ${days} days from ${today}`);
    await importTimetables({
      dir,
      osm: 'area.osm.pbf',
      datasets: Object.fromEntries(feeds.map(({ id }) => [id, id])),
      firstDay: today,
      days,
    });
    // The engine serves from data/ alone: the inputs would double the release's size.
    await Promise.all([...feeds.map(({ id }) => join(dir, id)), join(dir, 'area.osm.pbf')].map((path) => rm(path, { recursive: true })));
    const to = new Date(Date.parse(today) + (days - 1) * 86_400_000).toISOString().slice(0, 10);
    await store.publish({ id, createdAt: new Date().toISOString(), coverage: { from: today, to }, feeds: summaries });
    log(`release ${id} published, covering ${today} to ${to}`);
  } catch (error) {
    await rm(dir, { recursive: true, force: true });
    throw error;
  }
}

main().catch((error: unknown) => {
  log(`failed, the current release stays: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
