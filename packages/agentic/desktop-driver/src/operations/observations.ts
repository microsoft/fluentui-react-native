import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import type { NativeObservation, NativeObserveFact } from '../host/types.js';
import type { ProjectionFormat, ProjectionView } from './projection.js';
import type { SampleInfo } from './shapes.js';

const maxEntries = 2;
const maxBytes = 8 * 1024 * 1024;
const maxRetainedIds = 8_000;
const maxCursorLength = 512;

export type ObservationSnapshot = {
  observation: NativeObservation;
  projection: {
    deadlineMs: number;
    facts: readonly NativeObserveFact[];
    format: ProjectionFormat;
    maxBytes: number;
    maxDepth: number;
    maxNodes: number;
    maxStringLength: number;
    maxVisited: number;
    shown: readonly NativeObserveFact[];
    view: ProjectionView;
  };
  rootId?: string;
  sample: Omit<SampleInfo, 'root'>;
  scopeKey: string;
  windowId: string;
};

export type ObservationCursor =
  | { kind: 'snapshot'; offset: number; sampleId: string }
  | { baseSampleId: string; kind: 'delta'; offset: number; sampleId: string };

type StoredSnapshot = { bytes: number; ids: string[]; value: ObservationSnapshot };

/** Bounded session-local snapshots that pin provider ids while a page or delta can still use them. */
export class ObservationStore {
  private readonly entries = new Map<string, StoredSnapshot>();
  private readonly secret = randomBytes(32);
  private readonly retainedIds = new Map<string, number>();
  private bytes = 0;

  add(snapshot: ObservationSnapshot, preserve: readonly string[] = []): { evicted: string[]; stored: boolean } {
    const immutable = freeze(structuredClone(snapshot));
    const snapshotBytes = Buffer.byteLength(JSON.stringify(immutable), 'utf8');
    const ids = [...new Set(immutable.observation.nodes.map((node) => node.id))];
    const preserved = new Set(preserve);
    const pinnedEntries = [...this.entries.entries()].filter(([id]) => preserved.has(id) && id !== snapshot.sample.id);
    const pinnedBytes = pinnedEntries.reduce((total, [, entry]) => total + entry.bytes, 0);
    const pinnedIds = new Set(pinnedEntries.flatMap(([, entry]) => entry.ids));
    if (snapshotBytes > maxBytes || pinnedBytes + snapshotBytes > maxBytes || new Set([...pinnedIds, ...ids]).size > maxRetainedIds) {
      return { evicted: [], stored: false };
    }

    const evicted: string[] = [];
    this.remove(snapshot.sample.id, evicted);
    while (
      this.entries.size >= maxEntries ||
      this.bytes + snapshotBytes > maxBytes ||
      new Set([...this.retainedIds.keys(), ...ids]).size > maxRetainedIds
    ) {
      const victim = [...this.entries.keys()].find((id) => !preserved.has(id));
      if (victim === undefined) {
        return { evicted, stored: false };
      }
      this.remove(victim, evicted);
    }
    this.entries.set(snapshot.sample.id, { bytes: snapshotBytes, ids, value: immutable });
    this.bytes += snapshotBytes;
    for (const id of ids) {
      this.retainedIds.set(id, (this.retainedIds.get(id) ?? 0) + 1);
    }
    return { evicted, stored: true };
  }

  get(sampleId: string): ObservationSnapshot | undefined {
    const entry = this.entries.get(sampleId);
    if (entry) {
      this.entries.delete(sampleId);
      this.entries.set(sampleId, entry);
    }
    return entry?.value;
  }

  holds(nativeId: string): boolean {
    return this.retainedIds.has(nativeId);
  }

  cursor(cursor: ObservationCursor): string {
    const payload = Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
    const signature = createHmac('sha256', this.secret).update(payload).digest('base64url');
    return `${payload}.${signature}`;
  }

  readCursor(value: string): ObservationCursor | undefined {
    if (value.length > maxCursorLength) {
      return undefined;
    }
    const [payload, signature, extra] = value.split('.');
    if (!payload || !signature || extra !== undefined) {
      return undefined;
    }
    const expected = createHmac('sha256', this.secret).update(payload).digest();
    let received: Buffer;
    try {
      received = Buffer.from(signature, 'base64url');
    } catch {
      return undefined;
    }
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      return undefined;
    }
    try {
      const cursor: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      return isObservationCursor(cursor) ? cursor : undefined;
    } catch {
      return undefined;
    }
  }

  dropWindow(windowId: string): string[] {
    const ids: string[] = [];
    for (const [sampleId, entry] of this.entries) {
      if (entry.value.windowId === windowId) {
        this.remove(sampleId, ids);
      }
    }
    return ids;
  }

  dropOtherEpoch(incarnation: number, region: number): string[] {
    const ids: string[] = [];
    for (const [sampleId, entry] of this.entries) {
      const { epoch } = entry.value.sample;
      if (epoch.incarnation !== incarnation || epoch.region !== region) {
        this.remove(sampleId, ids);
      }
    }
    return ids;
  }

  clear(): void {
    this.entries.clear();
    this.retainedIds.clear();
    this.bytes = 0;
  }

  private remove(sampleId: string, ids: string[]): void {
    const entry = this.entries.get(sampleId);
    if (!entry) {
      return;
    }
    this.entries.delete(sampleId);
    this.bytes -= entry.bytes;
    for (const id of entry.ids) {
      const count = this.retainedIds.get(id) ?? 0;
      if (count <= 1) {
        this.retainedIds.delete(id);
      } else {
        this.retainedIds.set(id, count - 1);
      }
      ids.push(id);
    }
  }
}

function isObservationCursor(value: unknown): value is ObservationCursor {
  if (typeof value !== 'object' || value === null || !('kind' in value) || !('sampleId' in value) || !('offset' in value)) {
    return false;
  }
  const cursor = value as Record<string, unknown>;
  if (typeof cursor.sampleId !== 'string' || !/^o[1-9][0-9]{0,9}$/.test(cursor.sampleId)) {
    return false;
  }
  if (!Number.isSafeInteger(cursor.offset) || typeof cursor.offset !== 'number' || cursor.offset < 0) {
    return false;
  }
  if (cursor.kind === 'snapshot') {
    return Object.keys(cursor).length === 3;
  }
  return (
    cursor.kind === 'delta' &&
    typeof cursor.baseSampleId === 'string' &&
    /^o[1-9][0-9]{0,9}$/.test(cursor.baseSampleId) &&
    cursor.baseSampleId !== cursor.sampleId &&
    Object.keys(cursor).length === 4
  );
}

function freeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) {
      freeze(child);
    }
  }
  return value;
}
