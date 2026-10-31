import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { freezeDay } from '../adapters/gtfs/freeze.ts';
import { extract } from '../adapters/gtfs/feed.ts';
import { isInsideArea } from '../domain/area.ts';

/**
 * Builds the golden routes' frozen dataset (E2.3) from the last downloads of the data volume: one service day,
 * and for the SNCF only the trips that stop in the area covered. `scripts/freeze-dataset.sh` adds the OSM extract.
 */
const [day, output = '/dataset'] = process.argv.slice(2);
const downloads = join(process.env['DATA_DIR'] ?? '/data', 'downloads');

if (day === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
  process.stderr.write('usage: node src/pipeline/freeze.ts YYYY-MM-DD [output]\n');
  process.exit(2);
}

const work = await mkdtemp(join(tmpdir(), 'freeze-'));
try {
  for (const [id, inArea] of [['tbm', undefined], ['sncf', isInsideArea]] as const) {
    await extract(join(downloads, `${id}.gtfs.zip`), join(work, id));
    const trips = await freezeDay(join(work, id), join(output, id), day, inArea);
    process.stderr.write(`${id}: ${trips} trips on ${day}\n`);
  }
} finally {
  await rm(work, { recursive: true, force: true });
}
