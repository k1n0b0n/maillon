import { execFile } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

export interface ImportInput {
  /** Holds the inputs; the engine's data lands in its `data/` folder. */
  dir: string;
  osm: string;
  /** Dataset tag (no `_`) → GTFS folder, both relative to `dir`. */
  datasets: Record<string, string>;
  firstDay: string;
  days: number;
}

export async function importTimetables({ dir, osm, datasets, firstDay, days }: ImportInput): Promise<void> {
  const config = [
    `osm: ${osm}`,
    'timetable:',
    `  first_day: ${firstDay}`,
    `  num_days: ${days}`,
    '  datasets:',
    ...Object.entries(datasets).flatMap(([tag, path]) => [`    ${tag}:`, `      path: ${path}`]),
    'street_routing: true',
    'osr_footpath: true',
    'geocoding: true',
    'reverse_geocoding: true',
    '',
  ].join('\n');
  await writeFile(join(dir, 'config.yml'), config);
  await run('motis', ['import'], { cwd: dir, maxBuffer: 64 * 1024 * 1024 });
}
