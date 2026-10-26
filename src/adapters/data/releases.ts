import { readdir, readFile, readlink, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface FeedSummary {
  id: string;
  version: string;
  end: string;
  trips: number;
  withBikes: number;
}

export interface Release {
  id: string;
  createdAt: string;
  coverage: { from: string; to: string };
  feeds: FeedSummary[];
}

/**
 * Releases live in `<root>/releases/<id>`; `<root>/current` points to the one the engine serves.
 * The switch is a rename, so a reader sees the old release or the new one, never half of each.
 */
export class ReleaseStore {
  readonly root: string;

  constructor(root: string) {
    this.root = root;
  }

  dir(id: string): string {
    return join(this.root, 'releases', id);
  }

  async current(): Promise<Release | undefined> {
    try {
      return JSON.parse(await readFile(join(this.root, 'current', 'release.json'), 'utf8')) as Release;
    } catch {
      return undefined;
    }
  }

  async publish(release: Release): Promise<void> {
    await writeFile(join(this.dir(release.id), 'release.json'), JSON.stringify(release, null, 2));
    const previous = await readlink(join(this.root, 'current')).catch(() => undefined);
    await rm(join(this.root, 'current.next'), { force: true });
    await symlink(join('releases', release.id), join(this.root, 'current.next'));
    await rename(join(this.root, 'current.next'), join(this.root, 'current'));
    const keep = new Set([release.id, previous?.replace(/^releases\//, '')]);
    for (const id of await readdir(join(this.root, 'releases'))) {
      if (!keep.has(id)) {
        await rm(this.dir(id), { recursive: true, force: true });
      }
    }
  }
}
