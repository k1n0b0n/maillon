import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { takesBikes } from '../../domain/bike-rules.ts';
import { readTrips, writeBikesAllowed } from './feed.ts';

async function feed(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'gtfs-'));
  await Promise.all(Object.entries(files).map(([name, content]) => writeFile(join(dir, name), content)));
  return dir;
}

async function rewrite(dir: string, source: 'route-type' | 'sncf-stop-category'): Promise<string> {
  const { vehicles, spans } = await readTrips(dir, source);
  await writeBikesAllowed(dir, (tripId) => takesBikes(vehicles.get(tripId) ?? 'bus', spans.get(tripId) ?? { first: 0, last: 0 }));
  return readFile(join(dir, 'trips.txt'), 'utf8');
}

describe('a TBM feed', () => {
  it('writes bikes_allowed from the route type and the trip hours, keeping the other columns', async () => {
    const dir = await feed({
      'routes.txt': 'route_id,route_type\nA,0\n1,3\n951,4\n',
      'trips.txt':
        'route_id,service_id,trip_id,trip_headsign,bikes_allowed\n' +
        'A,s,peak,"Lormont, Lauriers",0\nA,s,calm,Pessac,0\n1,s,bus,Gare,0\n951,s,boat,Lormont,1\n',
      'stop_times.txt':
        'trip_id,arrival_time,departure_time,stop_id,stop_sequence\n' +
        'peak,08:10:00,08:10:00,x,1\npeak,08:40:00,08:40:00,y,2\n' +
        'calm,10:30:00,10:30:00,x,1\ncalm,11:00:00,11:00:00,y,2\n' +
        'bus,10:30:00,10:30:00,x,1\nboat,08:00:00,08:00:00,x,1\n',
    });

    expect(await rewrite(dir, 'route-type')).toBe(
      'route_id,service_id,trip_id,trip_headsign,bikes_allowed\n' +
        'A,s,peak,"Lormont, Lauriers",2\nA,s,calm,Pessac,1\n1,s,bus,Gare,2\n951,s,boat,Lormont,1\n',
    );
  });
});

describe('an SNCF feed', () => {
  it('adds bikes_allowed from the kind of train its stops name', async () => {
    const dir = await feed({
      'routes.txt': 'route_id,route_type\nr,2\n',
      'trips.txt': 'route_id,service_id,trip_id\nr,s,ter\nr,s,tgv\nr,s,car\n',
      'stop_times.txt':
        'trip_id,arrival_time,departure_time,stop_id,stop_sequence\n' +
        'ter,08:00:00,08:00:00,StopPoint:OCETrain TER-87581009,1\n' +
        'tgv,08:00:00,08:00:00,StopPoint:OCETGV INOUI-87581009,1\n' +
        'car,08:00:00,08:00:00,StopPoint:OCECar TER-87581009,1\n',
    });

    expect(await rewrite(dir, 'sncf-stop-category')).toBe(
      'route_id,service_id,trip_id,bikes_allowed\nr,s,ter,1\nr,s,tgv,2\nr,s,car,2\n',
    );
  });
});
