import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { type Bbox, freezeDay } from '../adapters/gtfs/freeze.ts';
import { extract } from '../adapters/gtfs/feed.ts';

/**
 * Builds the golden routes' frozen dataset (E2.3) from the last downloads of the data volume: one service day,
 * and for the SNCF only the trips that stop in the Gironde. `scripts/freeze-dataset.sh` adds the OSM extract.
 */
const [day, output = '/dataset'] = process.argv.slice(2);
const downloads = join(process.env['DATA_DIR'] ?? '/data', 'downloads');
const GIRONDE: Bbox = [-1.27, 44.19, 0.32, 45.58];

if (day === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
  process.stderr.write('usage: node src/pipeline/freeze.ts YYYY-MM-DD [output]\n');
  process.exit(2);
}

const work = await mkdtemp(join(tmpdir(), 'freeze-'));
try {
  for (const [id, bbox] of [['tbm', undefined], ['sncf', GIRONDE]] as const) {
    await extract(join(downloads, `${id}.gtfs.zip`), join(work, id));
    const trips = await freezeDay(join(work, id), join(output, id), day, bbox);
    process.stderr.write(`${id}: ${trips} trips on ${day}\n`);
  }
} finally {
  await rm(work, { recursive: true, force: true });
}
