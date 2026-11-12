import path from 'node:path';

import { createStorybookPrivateStorage, driverManifestDigest, readDriverManifest } from './generatedManifest.js';
import type { CreateStorybookPrivateStorage } from './generatedManifest.js';

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

/** Smoke scripts supply OS-observed identity, never credentials or private-storage paths. */
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
    if (previous !== undefined && driverManifestDigest(previous) === digest) await storage.remove(name, previous);
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
