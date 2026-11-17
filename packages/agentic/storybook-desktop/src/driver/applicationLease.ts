import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { createDesktopMacOSApplicationLeaseResource } from '@fluentui-react-native/desktop-test/application-ownership';
import { createDesktopMacOSApplicationInspector } from '@fluentui-react-native/desktop-test/macos-application-inspection';
import type { DesktopResourceContribution, DesktopResourcePlan } from '@fluentui-react-native/desktop-test/resources';

import { createStorybookPrivateStorage, driverManifestDigest, readDriverManifest } from './generatedManifest.js';
import type { CreateStorybookPrivateStorage } from './generatedManifest.js';

export type StorybookMacOSApplicationLeaseOptions = {
  manifestPath: string;
  handoff: string;
  createStorage?: CreateStorybookPrivateStorage;
  openInspector?: typeof createDesktopMacOSApplicationInspector;
  addSecret(secret: string): void;
  onFailure(error: Error): void;
  onWarning?(message: string): void;
  intervalMs?: number;
};

/** Binds the neutral, read-only lease maintainer to the independently pinned Storybook manifest. */
export function createStorybookMacOSApplicationLeaseResource(options: StorybookMacOSApplicationLeaseOptions): DesktopResourceContribution {
  if (!options.handoff) throw new Error('Desktop Storybook application leases require the trusted parent handoff.');
  const createStorage = options.createStorage ?? createStorybookPrivateStorage;
  const openInspector = options.openInspector ?? createDesktopMacOSApplicationInspector;
  return {
    id: 'macos-application-lease',
    ownership: 'owned',
    prepare: (context) => {
      let inner: DesktopResourcePlan | undefined;
      return {
        identity: `storybook-macos-application-lease:${context.targetId}`,
        async acquire(signal) {
          const manifest = await readDriverManifest(options.manifestPath, options.handoff, createStorage);
          signal.throwIfAborted();
          const { application } = manifest;
          if (
            manifest.endpoint !== 'macos' ||
            manifest.targetId !== context.targetId ||
            !application.bundleIdentifier ||
            !application.windowTitle
          ) {
            throw new Error('The Storybook application lease does not match the hosted macOS target.');
          }
          const selector = {
            bundleIdentifier: application.bundleIdentifier,
            windowTitle: application.windowTitle,
            ...(application.executablePath ? { executablePath: application.executablePath } : {}),
          };
          inner = createDesktopMacOSApplicationLeaseResource({
            selector,
            record: path.basename(application.leasePath),
            nonce: application.leaseNonce,
            openStorage: () => createStorage(path.dirname(application.leasePath), manifest.nativeDriver),
            openInspector: (value) =>
              openInspector({
                artifact: manifest.nativeDriver,
                targetId: manifest.targetId,
                selector: value,
                onFailure: options.onFailure,
              }),
            addSecret: options.addSecret,
            onFailure: options.onFailure,
            onWarning: options.onWarning,
            intervalMs: options.intervalMs,
          }).prepare(context);
          await inner.acquire(signal);
        },
        async dispose() {
          await inner?.dispose();
        },
      };
    },
  };
}

/** Waits for the host's lease without writing, adopting, or taking ownership of the application. */
export async function waitForStorybookMacOSApplicationLease(
  manifestPath: string,
  options: { timeoutMs: number; signal?: AbortSignal; createStorage?: CreateStorybookPrivateStorage },
): Promise<void> {
  if (!Number.isSafeInteger(options.timeoutMs) || options.timeoutMs <= 0 || options.timeoutMs > 2_147_483_647) {
    throw new RangeError('The macOS application lease timeout must be a positive integer.');
  }
  const createStorage = options.createStorage ?? createStorybookPrivateStorage;
  const manifest = await readDriverManifest(manifestPath, undefined, createStorage);
  if (manifest.endpoint !== 'macos' || !manifest.application.bundleIdentifier || !manifest.application.windowTitle) {
    throw new Error('The Storybook macOS application lease descriptor is incomplete.');
  }
  const storage = await createStorage(path.dirname(manifest.application.leasePath), manifest.nativeDriver);
  const timeout = AbortSignal.timeout(options.timeoutMs);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
  while (!signal.aborted) {
    const contents = await storage.read(path.basename(manifest.application.leasePath));
    if (signal.aborted) break;
    if (contents !== undefined) {
      let lease: unknown;
      try {
        lease = JSON.parse(contents);
      } catch {
        throw new Error('The Storybook macOS application lease is invalid.');
      }
      if (
        !lease ||
        typeof lease !== 'object' ||
        Array.isArray(lease) ||
        !('schemaVersion' in lease) ||
        lease.schemaVersion !== 1 ||
        !('endpoint' in lease) ||
        lease.endpoint !== 'macos' ||
        !('nonce' in lease) ||
        lease.nonce !== manifest.application.leaseNonce ||
        !('bundleIdentifier' in lease) ||
        lease.bundleIdentifier !== manifest.application.bundleIdentifier ||
        !('windowTitle' in lease) ||
        lease.windowTitle !== manifest.application.windowTitle
      ) {
        throw new Error('The Storybook macOS application lease does not match the current host.');
      }
      return;
    }
    try {
      await delay(100, undefined, { signal });
    } catch {
      break;
    }
  }
  if (options.signal?.aborted) throw options.signal.reason;
  throw new Error(`Timed out waiting for the Storybook macOS application lease after ${options.timeoutMs}ms.`);
}

type WindowsApplication = {
  aumid?: string;
  executablePath?: string;
  processId: number;
  processStartedAt: string;
  windowTitle: string;
};

type LeaseUpdate =
  | { operation: 'publish'; application: WindowsApplication; previousDigest?: string }
  | { operation: 'remove'; digest: string };

/** The native smoke owner supplies exact identity, never credentials or private-storage paths. */
export async function updateWindowsApplicationLease(
  manifestPath: string,
  handoff: string,
  update: LeaseUpdate,
  createStorage: CreateStorybookPrivateStorage = createStorybookPrivateStorage,
): Promise<string | undefined> {
  if (!handoff) throw new Error('Desktop Storybook application leases require the trusted parent handoff.');
  const manifest = await readDriverManifest(manifestPath, handoff, createStorage);
  if (manifest.endpoint === 'macos') throw new Error('Desktop Storybook Windows application leases require a Windows endpoint.');
  const digest = update.operation === 'remove' ? update.digest : update.previousDigest;
  if (digest !== undefined && !/^[0-9a-f]{64}$/.test(digest)) throw new TypeError('Invalid application lease receipt.');
  let contents: string | undefined;
  if (update.operation === 'publish') {
    const application = update.application;
    if (
      !Number.isSafeInteger(application.processId) ||
      application.processId <= 0 ||
      !boundedText(application.processStartedAt, 64) ||
      !Number.isFinite(Date.parse(application.processStartedAt)) ||
      !boundedText(application.windowTitle, 4096) ||
      application.windowTitle !== manifest.application.windowTitle ||
      (manifest.endpoint === 'windows'
        ? !boundedText(application.aumid, 4096) || application.executablePath !== undefined
        : !boundedText(application.executablePath, 4096) || application.aumid !== undefined)
    ) {
      throw new TypeError('Invalid Desktop Storybook application lease identity.');
    }
    contents = JSON.stringify({
      ...application,
      endpoint: manifest.endpoint,
      nonce: manifest.application.leaseNonce,
      schemaVersion: 1,
    });
  }
  const storage = await createStorage(path.dirname(manifest.application.leasePath), manifest.nativeDriver);
  const name = path.basename(manifest.application.leasePath);
  const previous = await storage.read(name);
  if (update.operation === 'remove') {
    if (previous !== undefined) {
      if (driverManifestDigest(previous) !== digest || !(await storage.remove(name, previous))) {
        throw new Error('Desktop Storybook application lease changed during cleanup; the foreign record was preserved.');
      }
    }
    return undefined;
  }
  if (previous === undefined ? digest !== undefined : driverManifestDigest(previous) !== digest) {
    throw new Error('Desktop Storybook application lease does not match its previous receipt.');
  }
  if (previous !== undefined && !(await storage.remove(name, previous))) {
    throw new Error('Desktop Storybook application lease changed during replacement.');
  }
  await storage.publish(name, contents!);
  return driverManifestDigest(contents!);
}

function boundedText(value: unknown, maximum: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maximum && !/\p{Cc}/u.test(value);
}
