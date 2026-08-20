/**
 * Ownership manifest.
 *
 * Cleanup resolves the exact process ids, ports, sessions, and window handles this package
 * started. It never kills by process name, and it never terminates anything recorded as
 * `external`, which is what lets an attach-mode run leave an interactive Storybook app running.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { DesktopDriverError } from './errors.ts';
import type { DesktopOwnedResource, DesktopOwnership } from './types.ts';

export interface OwnershipManifestData {
  runId: string;
  createdAt: string;
  resources: DesktopOwnedResource[];
}

export class OwnershipManifest {
  readonly runId: string;
  private readonly createdAt: string;
  private readonly resources: DesktopOwnedResource[] = [];

  constructor(runId: string) {
    this.runId = runId;
    this.createdAt = new Date().toISOString();
  }

  record(kind: DesktopOwnedResource['kind'], id: string | number, ownership: DesktopOwnership, label?: string): void {
    this.resources.push({ kind, id: String(id), ownership, label, recordedAt: new Date().toISOString() });
  }

  /** Returns true when this manifest started the resource and may therefore stop it. */
  owns(kind: DesktopOwnedResource['kind'], id: string | number): boolean {
    return this.resources.some((entry) => entry.kind === kind && entry.id === String(id) && entry.ownership === 'self');
  }

  list(): readonly DesktopOwnedResource[] {
    return [...this.resources];
  }

  ownedProcesses(): readonly number[] {
    return this.resources
      .filter(
        (entry) => (entry.kind === 'app' || entry.kind === 'driverHost' || entry.kind === 'nativeDriver') && entry.ownership === 'self',
      )
      .map((entry) => Number(entry.id))
      .filter((pid) => Number.isInteger(pid) && pid > 0);
  }

  toJSON(): OwnershipManifestData {
    return { runId: this.runId, createdAt: this.createdAt, resources: this.list() as DesktopOwnedResource[] };
  }

  save(directory: string): string {
    fs.mkdirSync(directory, { recursive: true });
    const file = path.join(directory, 'ownership.json');
    fs.writeFileSync(file, `${JSON.stringify(this.toJSON(), null, 2)}\n`, 'utf8');
    return file;
  }

  static load(file: string): OwnershipManifest {
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as OwnershipManifestData;
    const manifest = new OwnershipManifest(data.runId);
    for (const resource of data.resources ?? []) {
      manifest.resources.push(resource);
    }
    return manifest;
  }

  /**
   * Terminates only owned processes, cooperatively first.
   *
   * Returns the failures instead of throwing so a caller can append them to a primary failure
   * rather than replacing it.
   */
  async terminateOwnedProcesses(gracePeriodMs = 5000): Promise<readonly Error[]> {
    const failures: Error[] = [];
    const pids = this.ownedProcesses();

    for (const pid of pids) {
      try {
        if (isAlive(pid)) {
          process.kill(pid, 'SIGTERM');
        }
      } catch (error) {
        failures.push(new DesktopDriverError(`Failed to signal owned process ${pid}`, { kind: 'ownership', cause: error }));
      }
    }

    const deadline = Date.now() + gracePeriodMs;
    while (Date.now() < deadline && pids.some((pid) => isAlive(pid))) {
      await delay(100);
    }

    for (const pid of pids.filter((candidate) => isAlive(candidate))) {
      try {
        process.kill(pid, 'SIGKILL');
      } catch (error) {
        failures.push(new DesktopDriverError(`Failed to force-stop owned process ${pid}`, { kind: 'ownership', cause: error }));
      }
    }

    return failures;
  }
}

/** Returns true when a process id currently exists and is signalable. */
export function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
