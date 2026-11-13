import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { describeMacOSService, describeWindowsService } from '@fluentui-react-native/desktop-driver/authority';
import type { DesktopServiceIdentity } from '@fluentui-react-native/desktop-driver/authority';
import { resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver/native';
import { NativeDriverError } from '@fluentui-react-native/desktop-driver';
import type { NativeDriverResolveOptions } from '@fluentui-react-native/desktop-driver';

import type { DesktopResourceRecord } from './resources.js';

export type DesktopWorkloadProcessIdentity = Readonly<Omit<DesktopServiceIdentity, 'incarnation'>>;

export type DesktopWorkloadOwnerIdentity = Readonly<{
  id: string;
  processId: number;
  /** Absent when a caller cannot provide the verified operating-system identity. Never derived from wall-clock uptime. */
  processStartedAt?: string;
  processIdentity?: DesktopWorkloadProcessIdentity;
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
  schemaVersion: 2 | 3;
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
  /** Obtained from the driver's native service-identity describe operation, not a JavaScript clock estimate. */
  processIdentity?: DesktopWorkloadProcessIdentity;
};

export async function describeDesktopWorkloadOwner(
  nativeDriver?: Omit<NativeDriverResolveOptions, 'platform' | 'buildPolicy'>,
): Promise<DesktopWorkloadProcessIdentity | undefined> {
  if (process.platform !== 'darwin' && process.platform !== 'win32') return undefined;
  try {
    const artifact = await resolveNativeDesktopDriver({
      ...nativeDriver,
      platform: process.platform === 'darwin' ? 'macos' : 'windows',
      buildPolicy: 'never',
    });
    return process.platform === 'darwin'
      ? describeMacOSService({ artifact, pid: process.pid })
      : describeWindowsService({ artifact, pid: process.pid });
  } catch (error) {
    // Report-only/custom integrations can run without a helper. Their claim cannot authorize automatic recovery.
    if (error instanceof NativeDriverError && error.code === 'no-verified-prebuilt') return undefined;
    throw error;
  }
}

/**
 * The per-user claim directory. It is independent of TMPDIR, so workloads started with different temporary directories,
 * and from different checkouts, contend for the same claim.
 */
function defaultDesktopWorkloadDirectory(platform: NodeJS.Platform = process.platform): string {
  if (platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    if (!localAppData) throw new Error('LOCALAPPDATA is required to resolve the per-user desktop workload claim directory.');
    return path.join(localAppData, 'Microsoft', 'FluentUIReactNative', 'desktop-test', 'workload');
  }
  if (platform === 'darwin')
    return path.join(os.homedir(), 'Library', 'Caches', 'com.microsoft.fluentui-react-native.desktop-test', 'workload');
  return path.join(os.homedir(), '.cache', 'fluentui-react-native', 'desktop-test', 'workload');
}

export function createDesktopWorkloadClaim(options: DesktopWorkloadClaimOptions): DesktopWorkloadClaim {
  if (options.processIdentity && !validProcessIdentity(options.processIdentity, process.pid))
    throw new TypeError("Desktop workload ownership requires this process's native operating-system identity.");
  const root = options.directory ?? defaultDesktopWorkloadDirectory();
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  const filename = path.join(root, 'interactive.lock');
  const owner: DesktopWorkloadOwnerIdentity = Object.freeze({
    id: randomUUID(),
    processId: process.pid,
    ...(options.processIdentity
      ? {
          processStartedAt: options.processIdentity.startedAt,
          processIdentity: Object.freeze({ ...options.processIdentity }),
        }
      : {}),
    runId: options.runId,
    targetId: options.targetId,
    targetInstanceId: options.targetInstanceId,
  });
  let current: DesktopWorkloadOwnershipRecord = Object.freeze({
    schemaVersion: 3,
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
    // A crash mid-write must leave the previous complete record, never a truncated one.
    replaceFileAtomically(filename, nextContents);
    contents = nextContents;
    current = Object.freeze(next);
  };

  return {
    get record() {
      return current;
    },
    updateResource(resource) {
      const resources = current.resources.filter((entry) => entry.id !== resource.id);
      resources.push(
        Object.freeze({ ...resource, ...(resource.application ? { application: Object.freeze({ ...resource.application }) } : {}) }),
      );
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
  // v2 used a wall-clock estimate. Comparing it with a kernel timestamp would misidentify a live owner as PID reuse.
  if (record.schemaVersion !== 3 || !record.owner.processIdentity) return { state: 'unknown', record };
  const result = await probe(record.owner);
  if (result.state === 'unknown') return { state: 'unknown', record };
  if (result.state === 'exited') return { state: 'exited', record };
  if (result.processStartedAt !== record.owner.processStartedAt) return { state: 'pid-reused', record };
  return { state: 'live', record };
}

function replaceFileAtomically(filename: string, contents: string): void {
  const temporary = `${filename}.${randomUUID()}.tmp`;
  fs.writeFileSync(temporary, contents, { flag: 'wx', mode: 0o600 });
  try {
    for (let retries = 0; ; retries++) {
      try {
        fs.renameSync(temporary, filename);
        return;
      } catch (error) {
        const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
        if (process.platform !== 'win32' || retries === 10 || (code !== 'EPERM' && code !== 'EACCES' && code !== 'EBUSY')) throw error;
        // Windows readers can briefly deny delete sharing; the previous record stays intact while the rename is retried.
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25);
      }
    }
  } catch (error) {
    fs.rmSync(temporary, { force: true });
    throw error;
  }
}

function parseOwnershipRecord(contents: string): DesktopWorkloadOwnershipRecord {
  const record = JSON.parse(contents) as DesktopWorkloadOwnershipRecord;
  if (
    (record.schemaVersion !== 2 && record.schemaVersion !== 3) ||
    (record.state !== 'active' && record.state !== 'fenced') ||
    !record.owner ||
    typeof record.owner.id !== 'string' ||
    !Number.isSafeInteger(record.owner.processId) ||
    record.owner.processId < 1 ||
    (record.owner.processStartedAt !== undefined && typeof record.owner.processStartedAt !== 'string') ||
    (record.owner.processIdentity !== undefined &&
      (!validProcessIdentity(record.owner.processIdentity, record.owner.processId) ||
        record.owner.processStartedAt !== record.owner.processIdentity.startedAt)) ||
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

function validProcessIdentity(value: DesktopWorkloadProcessIdentity, pid: number): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    value.pid === pid &&
    typeof value.executablePath === 'string' &&
    path.isAbsolute(value.executablePath) &&
    typeof value.interactiveSession === 'string' &&
    (value.platform === 'macos'
      ? /^macos-session:[0-9]+$/.test(value.interactiveSession) &&
        /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}Z$/.test(value.startedAt)
      : value.platform === 'windows' &&
        /^windows-session:[0-9]+$/.test(value.interactiveSession) &&
        /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{7}Z$/.test(value.startedAt))
  );
}
