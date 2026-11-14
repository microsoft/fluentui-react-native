import { randomUUID } from 'node:crypto';
import path from 'node:path';

import type {
  ApplicationLease,
  DesktopHost,
  DesktopTarget,
  NativeDesktopApplicationDescriptor,
} from '@fluentui-react-native/desktop-driver';
import type { DesktopApplicationResource, DesktopResourceRecord } from './resources.js';

export type DesktopApplicationIdentity = Readonly<{
  schemaVersion: 1;
  endpoint: 'macos' | 'windows' | 'win32';
  processId: number;
  processStartedAt: string;
  executablePath?: string;
  interactiveSession?: string;
  aumid?: string;
}>;

/** Captures the native kernel identity. Legacy millisecond/LaunchServices lease timestamps cannot be upgraded. */
export function captureDesktopApplicationIdentity(
  lease: ApplicationLease,
  endpoint: DesktopApplicationIdentity['endpoint'],
): DesktopApplicationIdentity {
  const identity = {
    schemaVersion: 1 as const,
    endpoint,
    processId: lease.processId,
    processStartedAt: lease.processStartedAt,
    ...(endpoint === 'macos'
      ? {}
      : {
          executablePath: lease.executablePath,
          interactiveSession: lease.interactiveSession,
          ...(lease.aumid === undefined ? {} : { aumid: lease.aumid }),
        }),
  };
  validateIdentity(identity);
  return Object.freeze(identity);
}

/** Selects an exact external incarnation without transferring ownership or consulting a Storybook lease. */
export function desktopApplicationIdentityDescriptor(
  identity: DesktopApplicationIdentity,
  application: NativeDesktopApplicationDescriptor,
): NativeDesktopApplicationDescriptor {
  validateIdentity(identity);
  if (application.leasePath || application.leaseNonce)
    throw new TypeError('An exact application identity cannot be combined with a legacy lease.');
  if (!application.windowTitle) throw new TypeError('An exact application attach requires a window title.');
  if (
    identity.endpoint !== 'macos' &&
    ((application.aumid !== undefined && application.aumid !== identity.aumid) ||
      (application.executablePath !== undefined && application.executablePath.toLowerCase() !== identity.executablePath!.toLowerCase()))
  )
    throw new TypeError('The application descriptor differs from the recorded exact identity.');
  const { schemaVersion: _schemaVersion, endpoint: _endpoint, ...processIdentity } = identity;
  return Object.freeze({
    ...application,
    processIdentity: Object.freeze(processIdentity),
  });
}

export type DesktopApplicationHostOptions = {
  target: Omit<DesktopTarget, 'host'>;
  lifetime: 'session' | 'supervisor' | 'external';
  resourcePrefix: string;
  /** Synchronous durable publication: failure prevents dispatch or fences an already dispatched acquisition. */
  onResource?: (resource: DesktopResourceRecord) => void;
};

type Entry = { record: DesktopResourceRecord; lease?: ApplicationLease; uncertain: boolean };

/**
 * Keeps application lifetime independent of WebDriver session lifetime. The native host remains the only authority
 * allowed to signal an application; an advisory exit notification never settles a resource.
 */
export async function createDesktopApplicationHost(host: DesktopHost, options: DesktopApplicationHostOptions): Promise<DesktopHost> {
  const entries = new Map<string, Entry>();
  const inFlight = new Set<Promise<ApplicationLease>>();
  let retained: ApplicationLease | undefined;
  let closing: Promise<void> | undefined;
  let generation = 0;
  const publish = (entry: Entry, fields: Partial<DesktopResourceRecord> = {}) => {
    entry.record = Object.freeze({ ...entry.record, ...fields });
    options.onResource?.(entry.record);
  };
  const requireEntry = (lease: ApplicationLease): Entry => {
    const matches = [...entries.values()].filter((entry) => entry.lease?.id === lease.id);
    const entry = matches.length === 1 ? matches[0] : undefined;
    if (
      !entry?.lease ||
      entry.lease.processId !== lease.processId ||
      entry.lease.processStartedAt !== lease.processStartedAt ||
      entry.record.disposal === 'settled'
    ) {
      throw new Error('The application lease is foreign, stale, or already released.');
    }
    return entry;
  };
  const acquire = async (target: DesktopTarget, launch: boolean, signal?: AbortSignal): Promise<ApplicationLease> => {
    if (closing) throw new Error('The application owner is closing.');
    signal?.throwIfAborted();
    const owns = launch;
    const entry: Entry = {
      record: Object.freeze({
        id: `${options.resourcePrefix}:application:${++generation}`,
        identity: `application-acquisition:${randomUUID()}`,
        generation,
        ownership: owns ? 'owned' : 'borrowed',
        readiness: 'pending',
        disposal: owns ? 'pending' : 'not-owned',
        application: Object.freeze({ endpoint: target.endpoint, lifetime: owns ? options.lifetime : 'external' }),
      }),
      uncertain: owns,
    };
    // Register the possibility of a launch before the provider may create a process.
    publish(entry);
    entries.set(entry.record.id, entry);
    try {
      const lease = await (launch ? host.launch(target, signal) : host.attach(target, signal));
      entry.lease = Object.freeze({ ...lease });
      if (launch && lease.ownership !== 'launched') throw new Error('A launch did not return an owned application lease.');
      if (!launch && lease.ownership !== 'attached') throw new Error('Attach attempted to transfer application ownership.');
      const application: DesktopApplicationResource = Object.freeze({
        endpoint: target.endpoint,
        lifetime: launch ? options.lifetime : 'external',
        leaseId: lease.id,
        ...(lease.processId === undefined ? {} : { processId: lease.processId }),
        ...(lease.processStartedAt === undefined ? {} : { processStartedAt: lease.processStartedAt }),
        ...(lease.executablePath === undefined ? {} : { executablePath: lease.executablePath }),
        ...(lease.interactiveSession === undefined ? {} : { interactiveSession: lease.interactiveSession }),
        ...(lease.aumid === undefined ? {} : { aumid: lease.aumid }),
        ...(lease.containment === undefined ? {} : { containment: lease.containment }),
        ...(lease.launchKind === undefined ? {} : { launchKind: lease.launchKind }),
      });
      publish(entry, {
        identity: JSON.stringify([target.endpoint, lease.id, lease.processId, lease.processStartedAt]),
        application,
        readiness: 'ready',
      });
      if ([...entries.values()].some((candidate) => candidate !== entry && candidate.lease?.id === lease.id)) {
        entry.uncertain = true;
        throw new Error('The native host reused an application lease identifier; ownership is ambiguous.');
      }
      entry.uncertain = false;
      return entry.lease;
    } catch (error) {
      const data = errorData(error);
      const application = Object.freeze({
        ...entry.record.application!,
        ...(Number.isSafeInteger(data?.processId) && Number(data?.processId) > 0 ? { processId: Number(data?.processId) } : {}),
        ...(typeof data?.processStartedAt === 'string' ? { processStartedAt: data.processStartedAt } : {}),
        ...(typeof data?.executablePath === 'string' ? { executablePath: data.executablePath } : {}),
        ...(typeof data?.interactiveSession === 'string' ? { interactiveSession: data.interactiveSession } : {}),
        ...(typeof data?.aumid === 'string' ? { aumid: data.aumid } : {}),
        ...(data?.launchKind === 'launch-services' || data?.launchKind === 'direct-child' || data?.launchKind === 'packaged-activation'
          ? { launchKind: data.launchKind }
          : {}),
        ...(data?.containment === 'job-object' || data?.containment === 'uncontained' ? { containment: data.containment } : {}),
      });
      if (!entry.lease) {
        const effect = error && typeof error === 'object' && 'effect' in error ? error.effect : undefined;
        const reportedProcess = data?.processId !== undefined || data?.processStartedAt !== undefined;
        const mayHaveStarted =
          reportedProcess ||
          (data?.applicationSettlement !== undefined &&
            data.applicationSettlement !== 'not-started' &&
            data.applicationSettlement !== 'exited') ||
          effect === 'applied' ||
          effect === 'partial' ||
          effect === 'unknown';
        const notStarted = data?.applicationSettlement === 'not-started' && !reportedProcess;
        entry.uncertain = owns && data?.applicationSettlement !== 'exited' && !notStarted && mayHaveStarted;
      }
      try {
        publish(entry, {
          application,
          readiness: 'failed',
          disposal: owns ? (entry.uncertain ? 'failed' : 'settled') : 'not-owned',
        });
      } catch (publication) {
        throw new AggregateError([error, publication], 'Application acquisition and ownership publication failed.');
      }
      throw error;
    }
  };
  const track = (work: Promise<ApplicationLease>) => {
    inFlight.add(work);
    void work.finally(() => inFlight.delete(work)).catch(() => undefined);
    return work;
  };
  const borrowed = async (signal?: AbortSignal): Promise<ApplicationLease> => {
    if (closing || !retained) throw new Error('The supervisor-owned application is not available.');
    requireEntry(retained);
    await host.windows(retained, signal);
    return Object.freeze({ ...retained, ownership: 'attached' });
  };
  const overrides: Pick<DesktopHost, 'launch' | 'attach' | 'closeApplication' | 'dispose'> = {
    launch: (target, signal) => {
      if (options.lifetime === 'external') return Promise.reject(new Error('External applications may only be attached.'));
      return options.lifetime === 'supervisor' ? borrowed(signal) : track(acquire(target, true, signal));
    },
    attach: (target, signal) => (options.lifetime === 'supervisor' ? borrowed(signal) : track(acquire(target, false, signal))),
    closeApplication: async (lease, signal) => {
      const entry = requireEntry(lease);
      if (options.lifetime === 'supervisor' && entry.lease?.ownership === 'launched') return;
      try {
        await host.closeApplication(entry.lease!, signal);
        publish(entry, { disposal: entry.record.ownership === 'owned' ? 'settled' : 'not-owned' });
        entries.delete(entry.record.id);
      } catch (error) {
        publish(entry, { disposal: entry.record.ownership === 'owned' ? 'failed' : 'not-owned' });
        throw error;
      }
    },
    dispose: (signal) =>
      (closing ??= (async () => {
        await Promise.allSettled(inFlight);
        const failures: unknown[] = [];
        for (const entry of [...entries.values()].reverse()) {
          if (!entry.lease || entry.record.disposal === 'settled') continue;
          try {
            requireEntry(entry.lease);
            await host.closeApplication(entry.lease, signal);
            entry.uncertain = false;
            publish(entry, { disposal: entry.record.ownership === 'owned' ? 'settled' : 'not-owned' });
          } catch (error) {
            failures.push(error);
            try {
              publish(entry, { disposal: entry.record.ownership === 'owned' ? 'failed' : 'not-owned' });
            } catch (publication) {
              failures.push(publication);
            }
          }
        }
        try {
          await host.dispose(signal);
        } catch (error) {
          failures.push(error);
        }
        if ([...entries.values()].some((entry) => entry.uncertain))
          failures.push(new Error('An application acquisition has no exact settled identity; its workload claim remains fenced.'));
        if (failures.length) throw new AggregateError(failures, 'Application ownership cleanup did not settle.');
      })()),
  };
  const wrapped = new Proxy(host, {
    get(target, key) {
      if (Object.hasOwn(overrides, key)) return overrides[key as keyof typeof overrides];
      const value = Reflect.get(target, key, target) as unknown;
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
  if (options.lifetime === 'supervisor') {
    try {
      await host.probe();
      retained = await track(acquire({ ...options.target, host }, true));
      captureDesktopApplicationIdentity(retained, options.target.endpoint);
    } catch (error) {
      try {
        await wrapped.dispose();
      } catch (cleanup) {
        throw new AggregateError([error, cleanup], 'Supervisor application acquisition and cleanup failed.');
      }
      throw error;
    }
  }
  return wrapped;
}

function validateIdentity(value: unknown): asserts value is DesktopApplicationIdentity {
  const identity = value as DesktopApplicationIdentity | undefined;
  if (
    !identity ||
    identity.schemaVersion !== 1 ||
    !['macos', 'windows', 'win32'].includes(identity.endpoint) ||
    !Number.isSafeInteger(identity.processId) ||
    identity.processId < 1 ||
    identity.processId > 0x7fffffff ||
    typeof identity.processStartedAt !== 'string' ||
    !(
      identity.endpoint === 'macos'
        ? /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}Z$/
        : /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{7}Z$/
    ).test(identity.processStartedAt) ||
    !Number.isFinite(Date.parse(identity.processStartedAt))
  ) {
    throw new TypeError(
      'An application identity requires an exact native PID and microsecond (macOS) or 100 ns (Windows) start timestamp.',
    );
  }
  if (
    identity.endpoint !== 'macos' &&
    (typeof identity.executablePath !== 'string' ||
      !path.win32.isAbsolute(identity.executablePath) ||
      identity.executablePath.length > 4096 ||
      /\p{Cc}/u.test(identity.executablePath) ||
      typeof identity.interactiveSession !== 'string' ||
      !/^windows-session:[0-9]{1,10}$/.test(identity.interactiveSession) ||
      (identity.aumid !== undefined &&
        (typeof identity.aumid !== 'string' || !identity.aumid || identity.aumid.length > 4096 || /\p{Cc}/u.test(identity.aumid))))
  )
    throw new TypeError('A Windows application identity requires a native executable, AUMID when packaged, and session evidence.');
}

function errorData(error: unknown): Record<string, unknown> | undefined {
  if (!error || typeof error !== 'object' || !('data' in error) || !error.data || typeof error.data !== 'object') return undefined;
  return error.data as Record<string, unknown>;
}
