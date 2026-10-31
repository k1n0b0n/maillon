import { createWriteStream } from 'node:fs';
import { copyFile, rename, stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

/** Downloads `url` to `file`, unless the file is younger than `maxAgeDays`; a `file:` URL is copied. */
export async function download(url: string, file: string, maxAgeDays = 0): Promise<'downloaded' | 'kept' | 'copied'> {
  if (url.startsWith('file:')) {
    await copyFile(fileURLToPath(url), file);
    return 'copied';
  }
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
