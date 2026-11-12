import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { createMacOSPrivateStorage, createWindowsPrivateStorage } from '@fluentui-react-native/desktop-driver/authority';
import type { PrivateStorage } from '@fluentui-react-native/desktop-driver/authority';
import { verifyNativeDriverArtifact } from '@fluentui-react-native/desktop-driver/native';
import type { NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';
import { validateDesktopCaseOptions, validateDesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';
import {
  credentialsVersion,
  handoffVersion,
  parseCredentials,
  parseDriverManifest,
  parseHandoff,
} from '../../config/generated-contract.cjs';

import type { DesktopStorybookDriverManifest } from './driverManifest.js';

export type StoredDriverManifest = Omit<DesktopStorybookDriverManifest, 'application' | 'bridgeNonce'> & {
  application: Omit<DesktopStorybookDriverManifest['application'], 'leaseNonce'>;
  credentials: { name: string; root: string; runtimeModule: string };
};

type Credentials = { schemaVersion: 1; manifestDigest: string; bridgeNonce: string; leaseNonce: string };
type Handoff = {
  schemaVersion: 1;
  credentialsDigest: string;
  manifestDigest: string;
  nativeDriver: NativeDriverArtifact;
  runtimeModuleDigest: string;
  runtimeModulePath: string;
};
export type CreateStorybookPrivateStorage = (root: string, artifact: NativeDriverArtifact) => Promise<PrivateStorage>;

export const createStorybookPrivateStorage: CreateStorybookPrivateStorage = (root, artifact) => {
  if (process.platform === 'win32') return createWindowsPrivateStorage({ artifact, root });
  return createMacOSPrivateStorage(root);
};

export function parseStoredDriverManifest(value: unknown): StoredDriverManifest {
  const manifest = parseDriverManifest(value) as StoredDriverManifest;
  for (const entry of manifest.storyManifest.entries) {
    if (entry.tests !== undefined) validateDesktopStoryTests(entry.tests, `driver manifest story ${entry.id}`);
    for (const test of entry.wdio?.cases ?? []) validateDesktopCaseOptions(test.options, `driver manifest case ${entry.id}/${test.name}`);
  }
  return manifest;
}

export function driverManifestDigest(contents: string): string {
  return createHash('sha256').update(contents).digest('hex');
}

/** Publishes secrets through the OS ownership boundary; the editable generated manifest contains only references. */
export async function publishDriverManifest(
  manifest: DesktopStorybookDriverManifest,
  outputPath: string,
  createStorage = createStorybookPrivateStorage,
): Promise<string> {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const root = path.join(path.dirname(outputPath), '.private');
  const storage = await createStorage(root, manifest.nativeDriver);
  const id = randomUUID();
  const name = `credentials-${id}.json`;
  const runtimeModule = `runtime-${id}.js`;
  const { bridgeNonce, application, ...rest } = manifest;
  const { leaseNonce, ...publicApplication } = application;
  const stored = parseStoredDriverManifest({ ...rest, application: publicApplication, credentials: { name, root, runtimeModule } });
  const contents = `${JSON.stringify(stored, null, 2)}\n`;
  const manifestDigest = driverManifestDigest(contents);
  const credentials = JSON.stringify(parseCredentials({ bridgeNonce, leaseNonce, manifestDigest, schemaVersion: credentialsVersion }));
  const runtimeInstance = {
    bridgeNonce,
    endpoint: manifest.endpoint,
    instanceId: manifest.instanceId,
    platformManifestDigest: manifest.platformManifestDigest,
    portablePlanDigest: manifest.portablePlanDigest,
    storybookPort: manifest.storybookPort,
    targetId: manifest.targetId,
    testIDPrefix: manifest.testIDPrefix,
  };
  const runtimeContents = `export default ${JSON.stringify(runtimeInstance)};\n`;
  let previous: StoredDriverManifest | undefined;
  if (fs.existsSync(outputPath)) {
    try {
      previous = parseStoredDriverManifest(JSON.parse(fs.readFileSync(outputPath, 'utf8')));
    } catch {
      // An obsolete or malformed generated record is replaceable, but never authorizes private-record cleanup.
    }
  }
  await storage.publish(name, credentials);
  try {
    await storage.publish(runtimeModule, runtimeContents);
    fs.rmSync(manifest.application.leasePath, { force: true });
    if (manifest.agent) fs.rmSync(manifest.agent.readyPath, { force: true });
    // No secret is present here; privateStorage owns credential and runtime-module publication.
    const pending = `${outputPath}.${id}.pending`;
    try {
      fs.writeFileSync(pending, contents, { flag: 'wx' });
      fs.renameSync(pending, outputPath);
    } finally {
      fs.rmSync(pending, { force: true });
    }
  } catch (error) {
    await storage.remove(name, credentials);
    await storage.remove(runtimeModule, runtimeContents);
    throw error;
  }
  if (previous?.credentials.root === root) {
    for (const recordName of [previous.credentials.name, previous.credentials.runtimeModule]) {
      const previousContents = await storage.read(recordName);
      if (previousContents !== undefined) await storage.remove(recordName, previousContents);
    }
  }
  return JSON.stringify({
    credentialsDigest: driverManifestDigest(credentials),
    manifestDigest,
    nativeDriver: manifest.nativeDriver,
    runtimeModuleDigest: driverManifestDigest(runtimeContents),
    runtimeModulePath: path.join(root, runtimeModule),
    schemaVersion: handoffVersion,
  } satisfies Handoff);
}

/**
 * The parent passes its resolved helper and digest separately from generated files. Verify this binding before any
 * verification handshake or Windows private-storage helper can execute a path read from the manifest.
 */
export async function readDriverManifest(
  manifestPath: string,
  handoff?: string,
  createStorage = createStorybookPrivateStorage,
  trustedArtifact?: NativeDriverArtifact,
): Promise<DesktopStorybookDriverManifest> {
  const contents = fs.readFileSync(manifestPath, 'utf8');
  const stored = parseStoredDriverManifest(JSON.parse(contents));
  if (
    stored.credentials.root !== path.join(path.dirname(manifestPath), '.private') ||
    stored.application.leasePath !== path.join(stored.credentials.root, `application-lease.${stored.endpoint}.json`)
  ) {
    throw new Error('Desktop Storybook private state must use the generated instance namespace.');
  }
  let artifact = trustedArtifact ?? stored.nativeDriver;
  let trusted: Handoff | undefined;
  if (handoff !== undefined) {
    trusted = parseHandoff(JSON.parse(handoff)) as Handoff;
    if (
      trusted.manifestDigest !== driverManifestDigest(contents) ||
      JSON.stringify(trusted.nativeDriver) !== JSON.stringify(stored.nativeDriver) ||
      trusted.runtimeModulePath !== path.join(stored.credentials.root, stored.credentials.runtimeModule)
    ) {
      throw new Error('Desktop Storybook manifest does not match the trusted parent handoff.');
    }
    artifact = await verifyNativeDriverArtifact(trusted.nativeDriver);
  } else if (!trustedArtifact && createStorage === createStorybookPrivateStorage && process.platform !== 'darwin') {
    // macOS lease writers only read private records, without executing a helper. Windows always needs trusted provenance.
    throw new Error('Desktop Storybook requires a trusted parent helper handoff.');
  }
  const storage = await createStorage(stored.credentials.root, artifact);
  const record = await storage.read(stored.credentials.name);
  if (trusted && (record === undefined || trusted.credentialsDigest !== driverManifestDigest(record))) {
    throw new Error('Desktop Storybook credentials do not match the trusted parent handoff.');
  }
  const credentials = parseCredentials(record === undefined ? undefined : JSON.parse(record)) as Credentials;
  if (credentials.manifestDigest !== driverManifestDigest(contents)) {
    throw new Error('Desktop Storybook manifest does not match its private credentials.');
  }
  const { credentials: _credentials, ...manifest } = stored;
  return {
    ...manifest,
    bridgeNonce: credentials.bridgeNonce,
    application: { ...manifest.application, leaseNonce: credentials.leaseNonce },
    nativeDriver: artifact,
  };
}
