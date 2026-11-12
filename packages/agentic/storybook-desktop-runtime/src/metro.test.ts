import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

jest.mock('@rnx-kit/metro-config', () => ({
  makeMetroConfig: (config: object) => ({
    ...config,
    serializer: { getPolyfills: () => ['base-polyfill'] },
    watchFolders: ['existing-workspace'],
  }),
}));
jest.mock('@rnx-kit/metro-resolver-symlinks', () => () => jest.fn());
jest.mock('@storybook/react-native/withStorybook', () => ({ withStorybook: (config: unknown) => config }));

const { createDesktopStorybookMetroConfig } = require('../config/metro.cjs');
const hash = (contents: string) => createHash('sha256').update(contents).digest('hex');
const environmentKeys = [
  'STORYBOOK_DRIVER_MANIFEST',
  'STORYBOOK_DRIVER_HANDOFF',
  'STORYBOOK_GENERATED_CONTRACT',
  'STORYBOOK_WS_PORT',
  'FURN_STORYBOOK_INSTANCE_ID',
];

describe('controlled Metro generation fixtures', () => {
  let root: string;
  let originalEnvironment: (string | undefined)[];
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-metro-contract-'));
    originalEnvironment = environmentKeys.map((key) => process.env[key]);
    for (const key of environmentKeys) delete process.env[key];
  });
  afterEach(() => {
    environmentKeys.forEach((key, index) => {
      if (originalEnvironment[index] === undefined) delete process.env[key];
      else process.env[key] = originalEnvironment[index];
    });
    fs.rmSync(root, { force: true, recursive: true });
  });

  function controlledManifest(privateRoot = path.join(root, 'storybook-desktop.generated', '.private')) {
    const runtimeModulePath = path.join(privateRoot, 'runtime-fixture.js');
    const runtimeContents = 'export default {"bridgeNonce":"bridge-only"};\n';
    const nativeDriver = {
      architecture: 'x64',
      artifactId: 'artifact',
      artifactRoot: root,
      buildFingerprint: 'build',
      buildId: 'build-id',
      compatibilityKey: 'compatibility',
      configuration: 'release',
      endpoints: ['windows', 'win32'],
      executablePath: path.join(root, 'helper.exe'),
      features: ['probe'],
      origin: 'cache',
      provider: 'windows',
      schemaVersion: 1,
      signing: { mode: 'none' },
      sourceDigest: 'source',
      wireProtocol: { major: 1, minor: 0 },
    };
    const manifest = {
      application: { leasePath: path.join(privateRoot, 'application-lease.windows.json'), windowTitle: 'Fixture' },
      appName: 'Fixture',
      credentials: { name: 'credentials-fixture.json', root: privateRoot, runtimeModule: 'runtime-fixture.js' },
      displayName: 'Fixture',
      driverPort: 7010,
      endpoint: 'windows',
      instanceId: 'fixture',
      metroPort: 8081,
      nativeDriver,
      platformManifestDigest: 'platform',
      portablePlanDigest: 'portable',
      renderer: 'fabric',
      schemaVersion: 3,
      storyManifest: {
        endpoint: 'windows',
        entries: [],
        platformManifestDigest: 'platform',
        portablePlanDigest: 'portable',
        schemaVersion: 1,
      },
      storybookPort: 7007,
      targetId: 'fixture-windows',
      testIDPrefix: 'fixture',
    };
    const manifestPath = path.join(root, 'storybook-desktop.generated', 'driver-manifest.json');
    const contents = JSON.stringify(manifest);
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.mkdirSync(privateRoot, { recursive: true, mode: 0o700 });
    fs.writeFileSync(runtimeModulePath, runtimeContents, { mode: 0o600 });
    fs.writeFileSync(manifestPath, contents);
    process.env.STORYBOOK_DRIVER_MANIFEST = manifestPath;
    process.env.STORYBOOK_GENERATED_CONTRACT = path.resolve(__dirname, '../../storybook-desktop/config/generated-contract.cjs');
    process.env.STORYBOOK_DRIVER_HANDOFF = JSON.stringify({
      credentialsDigest: 'credentials',
      manifestDigest: hash(contents),
      nativeDriver,
      runtimeModuleDigest: hash(runtimeContents),
      runtimeModulePath,
      schemaVersion: 1,
    });
    return { manifest, manifestPath, runtimeModulePath, runtimeContents };
  }

  test('generates unauthenticated defaults only under the controlled fixture root', () => {
    process.env.FURN_STORYBOOK_INSTANCE_ID = 'controlled-fixture';
    process.env.STORYBOOK_WS_PORT = '7123';
    const config = createDesktopStorybookMetroConfig({ configPath: path.join(root, 'src') });
    const generated = path.join(root, 'storybook-desktop.generated', 'runtime-instance.js');
    expect(config.serializer.getPolyfills()).toEqual(['base-polyfill']);
    expect(
      config.resolver.resolveRequest(
        { originModulePath: path.join(__dirname, 'createDesktopStorybookApp.tsx') },
        '../config/runtime-instance.cjs',
        'macos',
      ),
    ).toEqual({ type: 'sourceFile', filePath: generated });
    expect(fs.readFileSync(generated, 'utf8')).toMatch(/^export default \{[^\n]+\};\n$/);
    expect(fs.readFileSync(generated, 'utf8')).toContain('"instanceId":"controlled-fixture","storybookPort":7123');
  });

  test('uses the parent-published private bridge-only projection without copying it to public generated output', () => {
    const fixture = controlledManifest();
    const config = createDesktopStorybookMetroConfig({ configPath: path.join(root, 'src') });
    expect(config.serializer.getPolyfills()).toEqual(['base-polyfill']);
    expect(
      config.resolver.resolveRequest(
        { originModulePath: path.join(__dirname, 'createDesktopStorybookApp.tsx') },
        '../config/runtime-instance.cjs',
        'macos',
      ),
    ).toEqual({ type: 'sourceFile', filePath: fixture.runtimeModulePath });
    expect(fs.readFileSync(fixture.runtimeModulePath, 'utf8')).toBe(fixture.runtimeContents);
    expect(fs.existsSync(path.join(root, 'storybook-desktop.generated', 'runtime-instance.js'))).toBe(false);
  });

  test('watches a pinned projection outside the app workspace while preserving existing workspace roots', () => {
    const fixture = controlledManifest(path.join(root, 'per-user-state', 'storybook-fixture'));
    const project = path.join(root, 'workspace', 'app');
    const config = createDesktopStorybookMetroConfig({ configPath: path.join(project, 'src') });
    expect(config.watchFolders).toEqual(['existing-workspace', path.dirname(fixture.runtimeModulePath)]);
    expect(
      config.resolver.resolveRequest(
        { originModulePath: path.join(__dirname, 'createDesktopStorybookApp.tsx') },
        '../config/runtime-instance.cjs',
        'windows',
      ),
    ).toEqual({ type: 'sourceFile', filePath: fixture.runtimeModulePath });
    expect(fs.existsSync(path.join(project, 'storybook-desktop.generated'))).toBe(false);
  });

  test.each(['missing-handoff', 'missing-contract', 'unknown-field', 'manifest-tamper', 'runtime-tamper'])(
    'fails closed on %s before generating a runtime module',
    (failure) => {
      const fixture = controlledManifest();
      if (failure === 'missing-handoff') delete process.env.STORYBOOK_DRIVER_HANDOFF;
      if (failure === 'missing-contract') delete process.env.STORYBOOK_GENERATED_CONTRACT;
      if (failure === 'unknown-field') fs.writeFileSync(fixture.manifestPath, JSON.stringify({ ...fixture.manifest, unknown: true }));
      if (failure === 'manifest-tamper') fs.writeFileSync(fixture.manifestPath, JSON.stringify({ ...fixture.manifest, driverPort: 7020 }));
      if (failure === 'runtime-tamper') fs.writeFileSync(fixture.runtimeModulePath, 'throw new Error("untrusted polyfill");\n');
      expect(() => createDesktopStorybookMetroConfig({ configPath: path.join(root, 'src') })).toThrow();
      expect(fs.existsSync(path.join(root, 'storybook-desktop.generated', 'runtime-instance.js'))).toBe(false);
    },
  );
});
