import { releaseBatchSize } from './limits.js';

export type ReleaseFlush = {
  /** True when a release call failed; the ids stay pending and the next flush retries them. */
  failed: boolean;
  /** Ids still waiting after the flush. */
  pending: number;
  released: number;
};

/**
 * Tracks the native element ids Node created for agent observation and no longer needs. Ownership is rechecked
 * immediately before every release batch, so an id that regained an owner while its release was failing or queued is
 * never released out from under a live reference.
 *
 * Ids Node has issued to WebDriver clients are `external`: FDR1 lets Node release only the ids it created for
 * observation, so those are never queued and stay with the provider until the window or application closes.
 */
export class ReleaseLedger {
  private readonly external = new Set<string>();
  private readonly pending = new Set<string>();
  private readonly isRetained: (nativeId: string) => boolean;
  private readonly batchSize: number;

  constructor(isRetained: (nativeId: string) => boolean, batchSize: number = releaseBatchSize) {
    this.isRetained = isRetained;
    this.batchSize = Math.max(1, Math.min(batchSize, releaseBatchSize));
  }

  get pendingCount(): number {
    return this.pending.size;
  }

  markExternal(nativeId: string): void {
    this.external.add(nativeId);
    this.pending.delete(nativeId);
  }

  isExternal(nativeId: string): boolean {
    return this.external.has(nativeId);
  }

  /** Queues ids for release unless something still owns them. */
  queue(nativeIds: Iterable<string>): void {
    for (const nativeId of nativeIds) {
      if (!this.external.has(nativeId) && !this.isRetained(nativeId)) {
        this.pending.add(nativeId);
      }
    }
  }

  /** Discards everything pending, for a new application incarnation whose provider records are already gone. */
  clear(): void {
    this.pending.clear();
    this.external.clear();
  }

  /**
   * Releases pending ids in batches of at most `releaseBatchSize`. A failed batch is not an error for the caller: the
   * ids stay pending and the result says so, because the operation that triggered the flush already succeeded.
   */
  async flush(release: (nativeIds: string[]) => Promise<unknown>, maxBatches = 5): Promise<ReleaseFlush> {
    let released = 0;
    for (let batches = 0; batches < maxBatches; batches += 1) {
      const batch = this.takeBatch();
      if (batch.length === 0) {
        break;
      }
      try {
        await release(batch);
      } catch {
        return { failed: true, pending: this.pending.size, released };
      }
      for (const nativeId of batch) {
        this.pending.delete(nativeId);
      }
      released += batch.length;
    }
    return { failed: false, pending: this.pending.size, released };
  }

  private takeBatch(): string[] {
    const batch: string[] = [];
    for (const nativeId of this.pending) {
      if (this.external.has(nativeId) || this.isRetained(nativeId)) {
        this.pending.delete(nativeId);
        continue;
      }
      batch.push(nativeId);
      if (batch.length >= this.batchSize) {
        break;
      }
    }
    return batch;
  }
}
