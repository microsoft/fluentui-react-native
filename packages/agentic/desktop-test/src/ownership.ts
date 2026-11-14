import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { describeMacOSService, describeWindowsService } from '@fluentui-react-native/desktop-driver/authority';
import type { DesktopServiceIdentity } from '@fluentui-react-native/desktop-driver/authority';
import { resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver/native';
import { NativeDriverError } from '@fluentui-react-native/desktop-driver';
import type { NativeDriverResolveOptions } from '@fluentui-react-native/desktop-driver';
import type { NativeApplicationIdentity } from '@fluentui-react-native/desktop-driver';

import type { DesktopResourceRecord } from './resources.js';
import { captureDesktopApplicationIdentity } from './applicationOwnership.js';

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
  requireNoRecoveryBarrier(filename);
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

/**
 * Reconciles only recorded Windows applications and the in-owner driver listener. Unknown resources/effects and
 * interrupted acquisitions without native identity remain fenced; this is not general stale-lock reclamation.
 */
export async function recoverWindowsDesktopWorkloadClaim(options: {
  directory?: string;
  endpoint: 'windows' | 'win32';
  targetId: string;
  targetInstanceId: string;
  /** The recoverer's verified native identity, also used to reconcile an interrupted recovery barrier. */
  processIdentity: DesktopWorkloadProcessIdentity;
  probeOwner: (owner: DesktopWorkloadOwnerIdentity) => Promise<DesktopWorkloadOwnerProbe>;
  /** Must prove exact native exit, with application-control exclusion held through cleanup. */
  recoverApplication: (identity: NativeApplicationIdentity) => Promise<void>;
}): Promise<{ state: 'absent' } | { state: 'recovered'; applications: number }> {
  const filename = path.join(options.directory ?? defaultDesktopWorkloadDirectory(), 'interactive.lock');
  requireNoLegacyRecoveryBarrier(filename);
  if (options.processIdentity?.platform !== 'windows' || !validProcessIdentity(options.processIdentity, process.pid))
    throw new TypeError("Desktop recovery requires this process's native Windows operating-system identity.");
  if (!fs.existsSync(filename)) {
    await retireWindowsRecoveryBarrier(filename, options);
    return { state: 'absent' };
  }
  let file = fs.lstatSync(filename);
  if (!file.isFile() || file.isSymbolicLink() || file.nlink !== 1 || file.size > 1024 * 1024)
    throw new Error('The desktop claim identity is unsafe; recovery remains fenced.');
  let contents = fs.readFileSync(filename, 'utf8');
  let record = parseOwnershipRecord(contents);
  if (
    record.schemaVersion !== 3 ||
    record.owner.processIdentity?.platform !== 'windows' ||
    record.owner.targetId !== options.targetId ||
    record.owner.targetInstanceId !== options.targetInstanceId
  )
    throw new Error('The desktop claim has an unverified owner or a different target identity; recovery remains fenced.');
  const owner = await options.probeOwner(record.owner);
  if (!windowsOwnerExited(owner, record.owner.processStartedAt!))
    throw new Error('The recorded desktop owner is live or unknown; recovery remains fenced.');

  const claimUnchanged = () => {
    const current = fs.lstatSync(filename);
    if (
      !current.isFile() ||
      current.isSymbolicLink() ||
      current.nlink !== 1 ||
      current.dev !== file.dev ||
      current.ino !== file.ino ||
      fs.readFileSync(filename, 'utf8') !== contents
    )
      throw new Error('Desktop claim ownership changed; refusing recovery of another owner.');
  };
  claimUnchanged();
  await retireWindowsRecoveryBarrier(filename, options);
  claimUnchanged();
  const barrier = acquireWindowsRecoveryBarrier(filename, options.processIdentity);
  const unchanged = () => {
    barrier.assertOwned();
    claimUnchanged();
  };
  const failures: unknown[] = [];
  let recoveredApplications = 0;
  try {
    unchanged();
    const resources = new Map<string, DesktopResourceRecord>();
    const applications: { resource: DesktopResourceRecord; identity: NativeApplicationIdentity }[] = [];
    for (const resource of record.resources) {
      if (
        !resource ||
        typeof resource.id !== 'string' ||
        typeof resource.identity !== 'string' ||
        !Number.isSafeInteger(resource.generation) ||
        resource.generation < 1 ||
        resources.has(resource.id) ||
        !['owned', 'borrowed'].includes(resource.ownership) ||
        !['pending', 'settled', 'failed', 'not-owned'].includes(resource.disposal)
      )
        throw new Error('A desktop resource identity is invalid; recovery remains fenced.');
      resources.set(resource.id, resource);
      if (resource.ownership === 'borrowed') {
        if (
          resource.disposal !== 'not-owned' ||
          (resource.application && (resource.application.lifetime !== 'external' || resource.application.containment !== 'external'))
        )
          throw new Error('An external resource has inconsistent ownership; recovery remains fenced.');
        continue;
      }
      if (resource.disposal === 'settled') continue;
      if (resource.application) {
        const application = resource.application;
        if (
          application.endpoint !== options.endpoint ||
          typeof application.leaseId !== 'string' ||
          application.leaseId.length < 1 ||
          resource.readiness !== 'ready' ||
          !['session', 'supervisor'].includes(application.lifetime) ||
          !(
            (application.containment === 'job-object' && application.launchKind === 'direct-child') ||
            (application.containment === 'uncontained' && application.launchKind === 'packaged-activation')
          )
        )
          throw new Error('The application resource lacks exact Windows ownership evidence; recovery remains fenced.');
        const {
          schemaVersion: _schemaVersion,
          endpoint: _endpoint,
          ...identity
        } = captureDesktopApplicationIdentity({ ...application, id: application.leaseId, ownership: 'launched' }, options.endpoint);
        applications.push({ resource, identity });
      } else if (
        resource.id !== 'webdriver' ||
        resource.identity !== `driver-service:${options.targetId}:${options.targetInstanceId}` ||
        resource.serviceReady !== undefined
      ) {
        throw new Error('An owned desktop resource cannot be proven exited; recovery remains fenced.');
      }
    }
    for (const effect of record.unresolvedEffects) {
      const resource = resources.get(effect?.resourceId);
      if (
        !resource ||
        resource.ownership !== 'owned' ||
        effect.id !== `dispose:${resource.id}:${resource.generation}` ||
        effect.resourceIdentity !== resource.identity
      )
        throw new Error('An unresolved desktop effect requires operator reconciliation; recovery remains fenced.');
    }
    for (const { resource, identity } of applications) {
      unchanged();
      await options.recoverApplication(identity);
      unchanged();
      record = {
        ...record,
        resources: record.resources.map((entry) => (entry.id === resource.id ? { ...entry, disposal: 'settled' } : entry)),
        unresolvedEffects: record.unresolvedEffects.filter((effect) => effect.resourceId !== resource.id),
      };
      const next = JSON.stringify(record);
      replaceFileAtomically(filename, next);
      contents = next;
      file = fs.lstatSync(filename);
    }
    unchanged();
    fs.unlinkSync(filename);
    recoveredApplications = applications.length;
  } catch (error) {
    failures.push(error);
  }
  try {
    barrier.release();
  } catch (error) {
    failures.push(error);
  }
  if (failures.length > 1) throw new AggregateError(failures, 'Desktop workload recovery and barrier cleanup failed.');
  if (failures.length) throw failures[0];
  return { state: 'recovered', applications: recoveredApplications };
}

function requireNoRecoveryBarrier(filename: string): void {
  requireNoLegacyRecoveryBarrier(filename);
  if (recoveryBarrierStat(`${filename}.recovery-v2`)) throw recoveryBusy();
}

function requireNoLegacyRecoveryBarrier(filename: string): void {
  if (recoveryBarrierStat(`${filename}.recovery`)) throw recoveryBusy();
}

function recoveryBusy(cause?: unknown): Error {
  return new Error('Desktop workload recovery is busy; a live or unverified recoverer keeps ownership fenced.', { cause });
}

function recoveryBarrierStat(filename: string): fs.Stats | undefined {
  try {
    return fs.lstatSync(filename);
  } catch (error) {
    if (error !== null && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return undefined;
    throw error;
  }
}

function assertRecoveryDirectory(filename: string, expected: fs.Stats): void {
  const current = recoveryBarrierStat(filename);
  if (!current || !current.isDirectory() || current.isSymbolicLink() || current.dev !== expected.dev || current.ino !== expected.ino)
    throw new Error('Desktop recovery barrier ownership changed; refusing to remove another recovery claim.');
}

function windowsOwnerExited(probe: DesktopWorkloadOwnerProbe, startedAt: string): boolean {
  return (
    probe.state === 'exited' ||
    (probe.state === 'alive' && validWindowsStartedAt(probe.processStartedAt) && probe.processStartedAt !== startedAt)
  );
}

async function retireWindowsRecoveryBarrier(
  filename: string,
  options: {
    targetId: string;
    targetInstanceId: string;
    probeOwner: (owner: DesktopWorkloadOwnerIdentity) => Promise<DesktopWorkloadOwnerProbe>;
  },
): Promise<void> {
  requireNoLegacyRecoveryBarrier(filename);
  const root = `${filename}.recovery-v2`;
  const directory = recoveryBarrierStat(root);
  if (!directory) return;
  assertRecoveryDirectory(root, directory);
  const entries = fs.readdirSync(root);
  if (entries.length > 16) throw recoveryBusy();
  const pins = entries.map((entry) => {
    const match = /^owner-([1-9][0-9]{0,9})-([0-9]{21})-([a-f0-9]{32})$/.exec(entry);
    if (!match) throw recoveryBusy();
    const processId = Number(match[1]);
    const time = match[2];
    const processStartedAt = `${time.slice(0, 4)}-${time.slice(4, 6)}-${time.slice(6, 8)}T${time.slice(8, 10)}:${time.slice(10, 12)}:${time.slice(12, 14)}.${time.slice(14)}Z`;
    if (processId > 2147483647 || !validWindowsStartedAt(processStartedAt)) throw recoveryBusy();
    const owner: DesktopWorkloadOwnerIdentity = {
      id: match[3],
      processId,
      processStartedAt,
      runId: 'desktop-recovery',
      targetId: options.targetId,
      targetInstanceId: options.targetInstanceId,
    };
    const filename = path.join(root, entry);
    const identity = fs.lstatSync(filename);
    assertRecoveryDirectory(filename, identity);
    if (fs.readdirSync(filename).length) throw recoveryBusy();
    return { filename, identity, owner };
  });
  for (const { owner } of pins) {
    if (!windowsOwnerExited(await options.probeOwner(owner), owner.processStartedAt!)) throw recoveryBusy();
  }
  assertRecoveryDirectory(root, directory);
  const current = fs.readdirSync(root);
  if (current.length !== entries.length || current.some((entry) => !entries.includes(entry))) throw recoveryBusy();
  // Only remove the unique dead owner's pin, never a new recoverer's replacement directory.
  for (const pin of pins) {
    assertRecoveryDirectory(root, directory);
    assertRecoveryDirectory(pin.filename, pin.identity);
    fs.rmdirSync(pin.filename);
  }
  assertRecoveryDirectory(root, directory);
  try {
    fs.rmdirSync(root);
  } catch (error) {
    throw recoveryBusy(error);
  }
}

function acquireWindowsRecoveryBarrier(filename: string, processIdentity: DesktopWorkloadProcessIdentity) {
  requireNoRecoveryBarrier(filename);
  const root = `${filename}.recovery-v2`;
  try {
    fs.mkdirSync(root, { mode: 0o700 });
  } catch (error) {
    throw recoveryBusy(error);
  }
  const directory = fs.lstatSync(root);
  assertRecoveryDirectory(root, directory);
  const nativeTime = processIdentity.startedAt.replaceAll(/[-:.TZ]/g, '');
  const owner = path.join(root, `owner-${processIdentity.pid}-${nativeTime}-${randomUUID().replaceAll('-', '')}`);
  // mkdir publishes the complete native owner atomically; an empty v2 root authorizes no recovery effects.
  let identity: fs.Stats;
  try {
    fs.mkdirSync(owner, { mode: 0o700 });
    identity = fs.lstatSync(owner);
  } catch (error) {
    try {
      assertRecoveryDirectory(root, directory);
      fs.rmdirSync(root);
    } catch (cleanup) {
      throw new AggregateError([error, cleanup], 'Desktop recovery barrier publication and cleanup failed.');
    }
    throw error;
  }
  return {
    assertOwned() {
      requireNoLegacyRecoveryBarrier(filename);
      assertRecoveryDirectory(root, directory);
      assertRecoveryDirectory(owner, identity);
      const entries = fs.readdirSync(root);
      if (entries.length !== 1 || entries[0] !== path.basename(owner))
        throw new Error('Desktop recovery barrier ownership changed; refusing ambiguous recovery.');
    },
    release() {
      assertRecoveryDirectory(owner, identity);
      fs.rmdirSync(owner);
      assertRecoveryDirectory(root, directory);
      fs.rmdirSync(root);
    },
  };
}

function validWindowsStartedAt(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{7}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === `${value.slice(0, 23)}Z`
  );
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
      : value.platform === 'windows' && /^windows-session:[0-9]+$/.test(value.interactiveSession) && validWindowsStartedAt(value.startedAt))
  );
}
