import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

import type { DesktopResourceRecord } from './resources.js';

export type DesktopWorkloadOwnerIdentity = Readonly<{
  id: string;
  processId: number;
  processStartedAt: string;
  runId: string;
  targetId: string;
  targetInstanceId: string;
}>;

export type DesktopUnresolvedEffect = Readonly<{
  id: string;
  resourceId: string;
  resourceIdentity: string;
}>;

export type DesktopWorkloadOwnershipRecord = Readonly<{
  schemaVersion: 2;
  state: 'active' | 'fenced';
  owner: DesktopWorkloadOwnerIdentity;
  resources: readonly DesktopResourceRecord[];
  unresolvedEffects: readonly DesktopUnresolvedEffect[];
}>;

export type DesktopWorkloadClaim = {
  readonly record: DesktopWorkloadOwnershipRecord;
  updateResource(resource: DesktopResourceRecord): void;
  recordUnresolvedEffect(effect: DesktopUnresolvedEffect): void;
  settleUnresolvedEffect(id: string): void;
  release(): void;
};

export type DesktopWorkloadOwnerProbe = { state: 'alive'; processStartedAt: string } | { state: 'exited' } | { state: 'unknown' };

export type DesktopWorkloadClaimInspection =
  | { state: 'live'; record: DesktopWorkloadOwnershipRecord }
  | { state: 'exited'; record: DesktopWorkloadOwnershipRecord }
  | { state: 'pid-reused'; record: DesktopWorkloadOwnershipRecord }
  | { state: 'unknown'; record: DesktopWorkloadOwnershipRecord };

type DesktopWorkloadClaimOptions = {
  runId: string;
  targetId: string;
  targetInstanceId: string;
  directory?: string;
};

export function createDesktopWorkloadClaim(options: DesktopWorkloadClaimOptions): DesktopWorkloadClaim {
  const user = createHash('sha256').update(os.homedir()).digest('hex').slice(0, 16);
  const root = options.directory ?? path.join(os.tmpdir(), `furn-desktop-workload-${user}`);
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  const filename = path.join(root, 'interactive.lock');
  const owner: DesktopWorkloadOwnerIdentity = Object.freeze({
    id: randomUUID(),
    processId: process.pid,
    processStartedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
    runId: options.runId,
    targetId: options.targetId,
    targetInstanceId: options.targetInstanceId,
  });
  let current: DesktopWorkloadOwnershipRecord = Object.freeze({
    schemaVersion: 2,
    state: 'active',
    owner,
    resources: Object.freeze([]),
    unresolvedEffects: Object.freeze([]),
  });
  let contents = JSON.stringify(current);
  try {
    fs.writeFileSync(filename, contents, { flag: 'wx', mode: 0o600 });
  } catch (error) {
    throw new Error(
      `Another desktop workload holds ${filename}. Do not run parallel physical-input suites. After a crash or failed cleanup, verify the recorded owner and its resources have stopped before removing its claim.`,
      { cause: error },
    );
  }

  const update = (next: DesktopWorkloadOwnershipRecord) => {
    if (fs.readFileSync(filename, 'utf8') !== contents)
      throw new Error('Desktop claim ownership changed; refusing to update another owner.');
    const nextContents = JSON.stringify(next);
    fs.writeFileSync(filename, nextContents, { mode: 0o600 });
    contents = nextContents;
    current = Object.freeze(next);
  };

  return {
    get record() {
      return current;
    },
    updateResource(resource) {
      const resources = current.resources.filter((entry) => entry.id !== resource.id);
      resources.push(Object.freeze({ ...resource }));
      const unresolvedEffects = current.unresolvedEffects.filter((effect) => effect.resourceId !== resource.id);
      if (resource.ownership === 'owned' && resource.disposal === 'failed') {
        unresolvedEffects.push({
          id: `dispose:${resource.id}:${resource.generation}`,
          resourceId: resource.id,
          resourceIdentity: resource.identity,
        });
      } else if (resource.disposal === 'pending') {
        unresolvedEffects.push({
          id: `dispose:${resource.id}:${resource.generation}`,
          resourceId: resource.id,
          resourceIdentity: resource.identity,
        });
      }
      update({
        ...current,
        state: unresolvedEffects.length ? 'fenced' : 'active',
        resources: Object.freeze(resources),
        unresolvedEffects: Object.freeze(unresolvedEffects),
      });
    },
    recordUnresolvedEffect(effect) {
      if (current.unresolvedEffects.some((entry) => entry.id === effect.id)) return;
      update({
        ...current,
        state: 'fenced',
        unresolvedEffects: Object.freeze([...current.unresolvedEffects, Object.freeze({ ...effect })]),
      });
    },
    settleUnresolvedEffect(id) {
      const unresolvedEffects = current.unresolvedEffects.filter((effect) => effect.id !== id);
      update({
        ...current,
        state: unresolvedEffects.length ? 'fenced' : 'active',
        unresolvedEffects: Object.freeze(unresolvedEffects),
      });
    },
    release() {
      if (current.unresolvedEffects.length > 0)
        throw new Error('Desktop claim has unresolved effects; refusing to release fenced ownership.');
      if (current.resources.some((resource) => resource.ownership === 'owned' && resource.disposal !== 'settled')) {
        throw new Error('Desktop claim has unsettled owned resources; refusing to release ownership.');
      }
      if (fs.readFileSync(filename, 'utf8') !== contents)
        throw new Error('Desktop claim ownership changed; refusing to remove another owner.');
      fs.unlinkSync(filename);
    },
  };
}

export async function inspectDesktopWorkloadClaim(
  filename: string,
  probe: (owner: DesktopWorkloadOwnerIdentity) => Promise<DesktopWorkloadOwnerProbe>,
): Promise<DesktopWorkloadClaimInspection> {
  const record = parseOwnershipRecord(fs.readFileSync(filename, 'utf8'));
  const result = await probe(record.owner);
  if (result.state === 'unknown') return { state: 'unknown', record };
  if (result.state === 'exited') return { state: 'exited', record };
  if (result.processStartedAt !== record.owner.processStartedAt) return { state: 'pid-reused', record };
  return { state: 'live', record };
}

function parseOwnershipRecord(contents: string): DesktopWorkloadOwnershipRecord {
  const record = JSON.parse(contents) as DesktopWorkloadOwnershipRecord;
  if (
    record.schemaVersion !== 2 ||
    (record.state !== 'active' && record.state !== 'fenced') ||
    !record.owner ||
    typeof record.owner.id !== 'string' ||
    !Number.isSafeInteger(record.owner.processId) ||
    typeof record.owner.processStartedAt !== 'string' ||
    typeof record.owner.runId !== 'string' ||
    typeof record.owner.targetId !== 'string' ||
    typeof record.owner.targetInstanceId !== 'string' ||
    !Array.isArray(record.resources) ||
    !Array.isArray(record.unresolvedEffects)
  ) {
    throw new TypeError('Desktop workload claim is invalid; refusing recovery.');
  }
  return record;
}
