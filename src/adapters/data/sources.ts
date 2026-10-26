import { createWriteStream } from 'node:fs';
import { rename, stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
import { pipeline } from 'node:stream/promises';

/** Downloads `url` to `file`, unless the file is younger than `maxAgeDays`. */
export async function download(url: string, file: string, maxAgeDays = 0): Promise<'downloaded' | 'kept'> {
  const age = await stat(file).then(
    (info) => (Date.now() - info.mtimeMs) / 86_400_000,
    () => Infinity,
  );
  if (age < maxAgeDays) {
    return 'kept';
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(10 * 60 * 1000) });
  if (!response.ok || response.body === null) {
    throw new Error(`${url} answered ${response.status}`);
  }
  await pipeline(Readable.fromWeb(response.body as ReadableStream<Uint8Array>), createWriteStream(`${file}.part`));
  await rename(`${file}.part`, file);
  return 'downloaded';
}
