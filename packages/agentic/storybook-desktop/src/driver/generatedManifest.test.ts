import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { NativeDriverArtifact } from '@fluentui-react-native/desktop-driver';
import { validateDesktopCaseOptions } from '@fluentui-react-native/desktop-driver/authoring';
import { createDesktopStorybookInstance } from '../config/instance';
import { makeDesktopStorybookConfig } from '../config/makeDesktopStorybookConfig';
import { createDesktopStorybookDriverManifest, writeDesktopStorybookDriverManifest } from './driverManifest';
import { createFixturePrivateStorage } from './fixtures/privateStorage';
import { parseStoredDriverManifest, readDriverManifest } from './generatedManifest';

const appRoot = path.resolve(__dirname, '../../../../../apps/storybook');
const hash = (contents: string) => createHash('sha256').update(contents).digest('hex');
const maliciousHelper = "#!/usr/bin/env node\nrequire('node:fs').writeFileSync(process.env.FURN_TEST_SPAWN_MARKER, 'spawned');\n";

describe('generated manifest trust handoff', () => {
  let root: string;
  let manifestPath: string;
  let marker: string;
  let handoff: string;

  beforeEach(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-provenance-'));
    manifestPath = path.join(root, 'driver-manifest.json');
    marker = path.join(root, 'unexpected-spawn');
    process.env.FURN_TEST_SPAWN_MARKER = marker;
    const executablePath = path.join(root, 'helper');
    fs.writeFileSync(executablePath, '#!/usr/bin/env node\nprocess.exit(0);\n', { mode: 0o700 });
    const nativeDriver: NativeDriverArtifact = {
      architecture: 'x64',
      artifactId: hash(fs.readFileSync(executablePath, 'utf8')),
      artifactRoot: root,
      buildFingerprint: 'build',
      buildId: 'build-id',
      compatibilityKey: 'compatibility',
      configuration: 'release',
      endpoints: ['windows', 'win32'],
      executablePath,
      features: ['probe'],
      origin: 'cache',
      provider: 'windows',
      schemaVersion: 1,
      signing: { mode: 'none' },
      sourceDigest: 'source',
      wireProtocol: { major: 1, minor: 0 },
    };
    const config = makeDesktopStorybookConfig({ projectRoot: appRoot });
    const manifest = createDesktopStorybookDriverManifest({
      config,
      instance: createDesktopStorybookInstance({ projectRoot: appRoot, bundleIdentifierPrefix: config.macosBundleIdentifier }),
      nativeDriver,
      platform: 'windows',
      storyManifest: {
        endpoint: 'windows',
        entries: [],
        platformManifestDigest: 'platform',
        portablePlanDigest: 'portable',
        schemaVersion: 1,
      },
    });
    handoff = await writeDesktopStorybookDriverManifest(
      { ...manifest, application: { ...manifest.application, leasePath: path.join(root, '.private', 'application-lease.windows.json') } },
      manifestPath,
      createFixturePrivateStorage,
    );
  });
  afterEach(() => {
    delete process.env.FURN_TEST_SPAWN_MARKER;
    fs.rmSync(root, { force: true, recursive: true });
  });

  test.each(['executablePath', 'artifactId', 'sourceDigest', 'signing'] as const)(
    'refuses a substituted %s before the helper can spawn, even with a matching editable hash',
    async (field) => {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const executable = path.join(root, 'untrusted-helper');
      fs.writeFileSync(executable, maliciousHelper, { mode: 0o700 });
      if (field === 'signing') manifest.nativeDriver.signing = { mode: 'signed', identity: 'untrusted' };
      else manifest.nativeDriver[field] = field === 'executablePath' ? executable : 'changed';
      manifest.nativeDriver.artifactId = hash(maliciousHelper);
      fs.writeFileSync(manifestPath, JSON.stringify(manifest));
      await expect(readDriverManifest(manifestPath, handoff, createFixturePrivateStorage)).rejects.toThrow('trusted parent handoff');
      expect(fs.existsSync(marker)).toBe(false);
    },
  );

  test('rehashes the independently pinned executable before even the verification handshake can spawn it', async () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    fs.writeFileSync(manifest.nativeDriver.executablePath, maliciousHelper);
    await expect(readDriverManifest(manifestPath, handoff, createFixturePrivateStorage)).rejects.toThrow('hash does not match');
    expect(fs.existsSync(marker)).toBe(false);
  });

  test.each(['root', 'nativeDriver', 'signing', 'application', 'agent', 'credentials', 'wdio', 'storyManifest'])(
    'rejects unknown %s fields instead of stripping them',
    (section) => {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const object =
        section === 'root'
          ? manifest
          : section === 'signing'
            ? manifest.nativeDriver.signing
            : section === 'agent'
              ? (manifest.agent = { descriptor: 'agent.json', readyPath: path.join(root, 'ready.json') })
              : section === 'wdio'
                ? (manifest.wdio = {})
                : manifest[section];
      object.unrecognized = true;
      expect(() => parseStoredDriverManifest(manifest)).toThrow('driver manifest');
    },
  );

  test('rejects unknown schema versions and credential reuse', async () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(() => parseStoredDriverManifest({ ...manifest, schemaVersion: 2 })).toThrow('driver manifest');
    const credentialsPath = path.join(manifest.credentials.root, manifest.credentials.name);
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    credentials.leaseNonce = credentials.bridgeNonce;
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials));
    await expect(readDriverManifest(manifestPath, undefined, createFixturePrivateStorage)).rejects.toThrow('distinct purposes');
  });

  test.each(['credentials', 'handoff'])('rejects unknown %s fields', async (section) => {
    if (section === 'handoff') {
      await expect(
        readDriverManifest(manifestPath, JSON.stringify({ ...JSON.parse(handoff), unknown: true }), createFixturePrivateStorage),
      ).rejects.toThrow('helper handoff');
      expect(fs.existsSync(marker)).toBe(false);
    } else {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const credentialsPath = path.join(manifest.credentials.root, manifest.credentials.name);
      fs.writeFileSync(credentialsPath, JSON.stringify({ ...JSON.parse(fs.readFileSync(credentialsPath, 'utf8')), unknown: true }));
      await expect(readDriverManifest(manifestPath, undefined, createFixturePrivateStorage)).rejects.toThrow('credentials');
    }
  });

  test.each(['tests', 'options'])('delegates unknown authored %s fields to their owning validators', (section) => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.storyManifest.entries = [
      {
        id: 'fixture--story',
        name: 'Story',
        packageName: 'fixture',
        sourcePath: 'Fixture.stories.tsx',
        tags: [],
        title: 'Fixture',
        ...(section === 'tests'
          ? { tests: { version: 1, tests: [], unknown: true } }
          : {
              wdio: {
                digest: 'digest',
                exportName: 'Story',
                cases: [{ name: 'case', options: { input: 'both', inputSource: 'derived', unknown: true } }],
              },
            }),
      },
    ];
    expect(() => parseStoredDriverManifest(manifest)).toThrow('unknown field');
  });

  test.each([undefined, 'physical'] as const)('accepts extracted case options with %s authored input', (input) => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const options = validateDesktopCaseOptions({ ...(input === undefined ? {} : { input }), requires: ['keyboard'] });
    manifest.storyManifest.entries = [
      {
        id: 'fixture--story',
        name: 'Story',
        packageName: 'fixture',
        sourcePath: 'Fixture.stories.tsx',
        tags: [],
        title: 'Fixture',
        wdio: { digest: 'digest', exportName: 'Story', cases: [{ name: 'case', options }] },
      },
    ];
    expect(parseStoredDriverManifest(manifest).storyManifest.entries[0].wdio?.cases?.[0].options).toEqual(options);
    manifest.storyManifest.entries[0].wdio.cases[0].options.inputSource = 'unknown';
    expect(() => parseStoredDriverManifest(manifest)).toThrow('driver manifest');
  });

  (process.platform === 'darwin' ? test : test.skip)(
    'publishes and reads real macOS owner-private records, refusing a permissive credential mode',
    async () => {
      const fixture = await readDriverManifest(manifestPath, undefined, createFixturePrivateStorage);
      fs.rmSync(path.join(root, '.private'), { recursive: true });
      await writeDesktopStorybookDriverManifest(fixture, manifestPath);
      const hydrated = await readDriverManifest(manifestPath);
      expect(hydrated.bridgeNonce).toBe(fixture.bridgeNonce);
      expect(hydrated.application.leaseNonce).toBe(fixture.application.leaseNonce);
      const stored = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      expect(fs.statSync(stored.credentials.root).mode & 0o777).toBe(0o700);
      for (const name of [stored.credentials.name, stored.credentials.runtimeModule]) {
        expect(fs.statSync(path.join(stored.credentials.root, name)).mode & 0o777).toBe(0o600);
      }
      fs.chmodSync(path.join(stored.credentials.root, stored.credentials.name), 0o644);
      await expect(readDriverManifest(manifestPath)).rejects.toThrow();
    },
  );

  test('projects only the bridge credential into the runtime, keeping both secrets out of the public manifest', async () => {
    const contents = fs.readFileSync(manifestPath, 'utf8');
    const stored = JSON.parse(contents);
    const manifest = await readDriverManifest(manifestPath, undefined, createFixturePrivateStorage);
    expect(manifest.application.leaseNonce).not.toBe(manifest.bridgeNonce);
    expect(contents).not.toContain(manifest.bridgeNonce);
    expect(contents).not.toContain(manifest.application.leaseNonce);
    const runtimePath = path.join(stored.credentials.root, stored.credentials.runtimeModule);
    const runtime = fs.readFileSync(runtimePath, 'utf8');
    expect(runtime).toContain(manifest.bridgeNonce);
    expect(runtime).not.toContain(manifest.application.leaseNonce);
    if (process.platform !== 'win32') {
      expect(fs.statSync(stored.credentials.root).mode & 0o777).toBe(0o700);
      expect(fs.statSync(runtimePath).mode & 0o777).toBe(0o600);
      expect(fs.statSync(path.join(stored.credentials.root, stored.credentials.name)).mode & 0o777).toBe(0o600);
    }
  });
});
