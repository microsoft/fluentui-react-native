import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { DesktopAuthority } from '../authority/grants';
import { createDesktopDriverClient } from '../client/DesktopDriverClient';
import type { NativeObserveRequest } from '../host/types';
import { encodeJsonFrame, NativeFrameDecoder } from '../hosts/native/framing';
import { NativeDesktopHost } from '../hosts/native/NativeDesktopHost';
import { NativeHostProcess } from '../hosts/native/NativeHostProcess';
import { parseNativeObservation } from '../protocol/observation';
import { createDesktopDriverServer } from '../server/createDesktopDriverServer';
import type { NativeDriverArtifact, NativeHostJsonMessage } from './types';
import {
  hashMacOSDriverSources,
  macOSCertificateExtractionArguments,
  macOSDriverSourceFiles,
  macOSCodeSignArguments,
  parseMacOSSigningIdentities,
} from './macos/buildMacOSDriver';
import { buildNativeDesktopDriver, resolveNativeDesktopDriver } from './nativeDriver';
import { hashWindowsDriverSources, windowsDriverSourceFiles } from './windows/buildWindowsDriver';

async function expectProtectedNativeService(artifact: NativeDriverArtifact): Promise<void> {
  const endpoint = artifact.provider;
  const authority = new DesktopAuthority();
  const grant = authority.issue({ label: 'native-contract', targets: ['native-contract'] });
  const host = new NativeDesktopHost({ application: {}, artifact, endpoint });
  const probe = jest.spyOn(host, 'probe');
  const launch = jest.spyOn(host, 'launch');
  const service = await createDesktopDriverServer({
    authority,
    targets: [{ endpoint, host, id: 'native-contract', platformName: endpoint, renderer: 'fabric' }],
  });
  try {
    const unauthenticated = createDesktopDriverClient({ url: service.url });
    await expect(unauthenticated.status()).rejects.toMatchObject({ code: 'unauthorized' });
    await expect(unauthenticated.newSession({ alwaysMatch: {} })).rejects.toMatchObject({ code: 'unauthorized' });
    expect(probe).not.toHaveBeenCalled();
    expect(launch).not.toHaveBeenCalled();

    const hidden = authority.issue({ label: 'out-of-scope', targets: ['not-registered'] });
    await expect(createDesktopDriverClient({ grant: hidden.token, url: service.url }).status()).resolves.toMatchObject({
      targets: [],
    });
    expect(probe).not.toHaveBeenCalled();

    const authenticated = createDesktopDriverClient({ grant: grant.token, url: service.url });
    await expect(authenticated.status()).resolves.toMatchObject({
      service: { incarnation: authority.incarnation },
      targets: [{ id: 'native-contract', host: { endpoint, platformName: endpoint, protocolVersion: 1 } }],
    });
    expect(probe).toHaveBeenCalledTimes(1);
    authority.revoke(grant.id);
    await expect(authenticated.status()).rejects.toMatchObject({ code: 'unauthorized' });
    expect(probe).toHaveBeenCalledTimes(1);
  } finally {
    await service.close();
  }
}

jest.setTimeout(240_000);

const windowsTest = process.platform === 'win32' && process.env.FURN_NATIVE_DRIVER_TEST === '1' ? test : test.skip;
const macosTest = process.platform === 'darwin' && process.env.FURN_NATIVE_DRIVER_TEST === '1' ? test : test.skip;
const macosSigningIdentity = process.env.FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY;
const signedMacosTest =
  process.platform === 'darwin' && macosSigningIdentity && process.env.FURN_NATIVE_DRIVER_TEST === '1' ? test : test.skip;

describe('native driver build and resolution', () => {
  test('locates its published sources independently of the caller working directory', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-native-caller-'));
    try {
      const anchor = path.resolve(__dirname, '../../lib/native/packageRoot.cjs');
      const child = spawnSync(
        process.execPath,
        ['-e', `process.stdout.write(require(${JSON.stringify(anchor)}).nativeDriverPackageRoot)`],
        {
          cwd: root,
          encoding: 'utf8',
          timeout: 10_000,
        },
      );
      expect(child.status).toBe(0);
      expect(child.stdout).toBe(path.resolve(__dirname, '../..'));
      expect(fs.existsSync(path.join(child.stdout, 'native', 'protocol.json'))).toBe(true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  macosTest('builds, signs, reuses, and handshakes with the macOS helper', async () => {
    const cacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-driver-macos-native-'));
    const emitWarning = jest.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
    try {
      const built = await buildNativeDesktopDriver({ cacheRoot, macosSigningIdentity: '', platform: 'macos' });
      expect(built).toMatchObject({
        architecture: 'arm64',
        endpoints: ['macos'],
        origin: 'built',
        provider: 'macos',
        signing: { designatedRequirement: expect.stringContaining('cdhash H"'), mode: 'adhoc' },
        wireProtocol: { major: 1, minor: 0 },
      });
      expect(built.executablePath).toContain(`${path.sep}FurnDesktopDriverHost.app${path.sep}Contents${path.sep}MacOS${path.sep}`);

      const rebuilt = await buildNativeDesktopDriver({ cacheRoot, force: true, macosSigningIdentity: '', platform: 'macos' });
      expect(rebuilt).toMatchObject({
        artifactId: built.artifactId,
        buildId: built.buildId,
        origin: 'built',
      });
      fs.writeFileSync(built.executablePath, 'corrupt');
      const healed = await buildNativeDesktopDriver({ cacheRoot, force: true, macosSigningIdentity: '', platform: 'macos' });
      expect(healed).toMatchObject({
        artifactId: built.artifactId,
        buildId: built.buildId,
        origin: 'built',
      });
      expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'trash'))).not.toHaveLength(0);

      const reused = await buildNativeDesktopDriver({ cacheRoot, macosSigningIdentity: '', platform: 'macos' });
      expect(reused).toMatchObject({
        artifactId: built.artifactId,
        origin: 'cache',
      });
      const resolved = await resolveNativeDesktopDriver({
        buildPolicy: 'never',
        cacheRoot,
        macosSigningIdentity: '',
        platform: 'macos',
      });
      expect(resolved.artifactId).toBe(built.artifactId);
      const bundlePath = path.dirname(path.dirname(path.dirname(resolved.executablePath)));
      const direct = await resolveNativeDesktopDriver({
        cacheRoot,
        helperPath: bundlePath,
        macosSigningIdentity: '',
        platform: 'macos',
      });
      expect(direct).toMatchObject({
        artifactId: built.artifactId,
        artifactRoot: bundlePath,
        origin: 'explicit-path',
      });

      const helper = await NativeHostProcess.start({ artifact: resolved });
      await expect(helper.request('probe', { endpoint: 'macos' })).resolves.toMatchObject({
        result: {
          endpoint: 'macos',
          platformName: 'macos',
          protocolVersion: 1,
        },
      });
      await helper.dispose();
      await expectProtectedNativeService(resolved);
      await expectEffectReporting(resolved.executablePath);
      await expectBoundedObservation(resolved.executablePath, 'macos');
      await expectMacosRequestMemoryStable(resolved.executablePath);

      const observationDump = path.join(cacheRoot, 'self-test-observations.json');
      const selfTest = spawnSync(resolved.executablePath, ['--self-test'], {
        encoding: 'utf8',
        env: { ...process.env, FURN_DRIVER_SELF_TEST_OBSERVATIONS: observationDump },
        timeout: 120_000,
      });
      expect(selfTest.status).toBe(0);
      expect(selfTest.stdout).toContain('ok ');
      expectSelfTestObservationsToConform(observationDump);
    } finally {
      emitWarning.mockRestore();
      fs.rmSync(cacheRoot, { force: true, maxRetries: 10, recursive: true, retryDelay: 100 });
    }
  });

  signedMacosTest('builds and verifies the macOS helper with a configured signing identity', async () => {
    const cacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-driver-macos-signed-'));
    try {
      const built = await buildNativeDesktopDriver({ cacheRoot, macosSigningIdentity, platform: 'macos' });
      expect(built.signing).toMatchObject({
        certificateHash: expect.stringMatching(/^[0-9A-F]{40}$/),
        designatedRequirement: expect.any(String),
        mode: 'signed',
      });
      const rebuilt = await buildNativeDesktopDriver({ cacheRoot, force: true, macosSigningIdentity, platform: 'macos' });
      expect(rebuilt).toMatchObject({
        buildId: built.buildId,
        signing: {
          certificateHash: built.signing.certificateHash,
          designatedRequirement: built.signing.designatedRequirement,
          mode: 'signed',
        },
      });
      await expect(
        resolveNativeDesktopDriver({ buildPolicy: 'never', cacheRoot, macosSigningIdentity, platform: 'macos' }),
      ).resolves.toMatchObject({
        artifactId: rebuilt.artifactId,
        origin: 'cache',
      });
    } finally {
      fs.rmSync(cacheRoot, { force: true, maxRetries: 10, recursive: true, retryDelay: 100 });
    }
  });

  test('hashes and stages only declared macOS Swift package sources', () => {
    const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-driver-macos-sources-'));
    try {
      fs.mkdirSync(path.join(sourceRoot, 'Sources', 'DesktopDriverHost'), { recursive: true });
      fs.writeFileSync(path.join(sourceRoot, 'Package.swift'), '// package');
      fs.writeFileSync(path.join(sourceRoot, 'Sources', 'DesktopDriverHost', 'main.swift'), 'print("hello")');
      const digest = hashMacOSDriverSources(sourceRoot);

      fs.mkdirSync(path.join(sourceRoot, '.build', 'arm64-apple-macosx', 'release'), { recursive: true });
      fs.writeFileSync(path.join(sourceRoot, '.build', 'arm64-apple-macosx', 'release', 'helper'), 'generated');
      fs.writeFileSync(path.join(sourceRoot, 'Sources', '.DS_Store'), 'editor');

      expect(hashMacOSDriverSources(sourceRoot)).toBe(digest);
    } finally {
      fs.rmSync(sourceRoot, { force: true, recursive: true });
    }
  });

  test('orders macOS Swift package sources by code point and rejects a symbolic link to a declared source', () => {
    const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-driver-macos-order-'));
    try {
      fs.mkdirSync(path.join(sourceRoot, 'Sources', 'DesktopDriverHost'), { recursive: true });
      fs.writeFileSync(path.join(sourceRoot, 'Package.swift'), '// package');
      for (const name of ['b.swift', 'Z.swift', 'a.swift']) {
        fs.writeFileSync(path.join(sourceRoot, 'Sources', 'DesktopDriverHost', name), name);
      }
      expect(macOSDriverSourceFiles(sourceRoot)).toEqual([
        'Package.swift',
        'Sources/DesktopDriverHost/Z.swift',
        'Sources/DesktopDriverHost/a.swift',
        'Sources/DesktopDriverHost/b.swift',
      ]);

      fs.symlinkSync(path.join(sourceRoot, 'Package.swift'), path.join(sourceRoot, 'Sources', 'linked.swift'));
      expect(() => macOSDriverSourceFiles(sourceRoot)).toThrow(/symbolic link/);
    } finally {
      fs.rmSync(sourceRoot, { force: true, recursive: true });
    }
  });

  test('hashes and stages only the sources the Windows project declares', () => {
    const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-driver-windows-sources-'));
    const writeProject = (items: string) =>
      fs.writeFileSync(
        path.join(sourceRoot, 'DesktopDriverHost.vcxproj'),
        [
          '<Project>',
          '  <ItemGroup><ProjectConfiguration Include="Release|x64"><Platform>x64</Platform></ProjectConfiguration></ItemGroup>',
          '  <!-- <ClCompile Include="src\\commented.cpp" /> -->',
          `  <ItemGroup>${items}</ItemGroup>`,
          '</Project>',
        ].join('\n'),
      );
    try {
      fs.mkdirSync(path.join(sourceRoot, 'src'));
      for (const name of ['main.cpp', 'main.h', 'app.manifest']) {
        fs.writeFileSync(path.join(sourceRoot, 'src', name), name);
      }
      writeProject('<ClCompile Include="src\\main.cpp" /><ClInclude Include="src\\main.h" /><Manifest Include="src\\app.manifest" />');
      const digest = hashWindowsDriverSources(sourceRoot);
      expect(windowsDriverSourceFiles(sourceRoot)).toEqual(['DesktopDriverHost.vcxproj', 'src/app.manifest', 'src/main.cpp', 'src/main.h']);

      fs.writeFileSync(path.join(sourceRoot, 'README.md'), 'documentation');
      fs.writeFileSync(path.join(sourceRoot, 'src', 'notes.txt'), 'notes');
      fs.mkdirSync(path.join(sourceRoot, '.vs'));
      fs.writeFileSync(path.join(sourceRoot, '.vs', 'cache.db'), 'editor');
      expect(hashWindowsDriverSources(sourceRoot)).toBe(digest);

      fs.writeFileSync(path.join(sourceRoot, 'src', 'main.cpp'), 'changed');
      expect(hashWindowsDriverSources(sourceRoot)).not.toBe(digest);

      writeProject('<ClCompile Include="src\\missing.cpp" />');
      expect(() => windowsDriverSourceFiles(sourceRoot)).toThrow(/does not exist/);
      writeProject('<ClCompile Include="..\\outside.cpp" />');
      expect(() => windowsDriverSourceFiles(sourceRoot)).toThrow(/escapes the source root/);
      writeProject('<ClCompile Include="src\\*.cpp" />');
      expect(() => windowsDriverSourceFiles(sourceRoot)).toThrow(/plain relative file path/);
    } finally {
      fs.rmSync(sourceRoot, { force: true, recursive: true });
    }
  });

  test('declares every shipped Windows source in the project so the staged build is complete', () => {
    const sourceRoot = path.resolve(__dirname, '../../native/windows');
    const declared = new Set(windowsDriverSourceFiles(sourceRoot));
    const onDisk = fs.readdirSync(path.join(sourceRoot, 'src'), { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile());

    expect(onDisk.length).toBeGreaterThan(0);
    for (const entry of onDisk) {
      const relativePath = path.relative(sourceRoot, path.join(entry.parentPath, entry.name)).replaceAll(path.sep, '/');
      expect(declared.has(relativePath)).toBe(true);
    }
  });

  test('forms unambiguous macOS code-signing arguments', () => {
    expect(macOSCertificateExtractionArguments('/tmp/certificate', '/tmp/Helper.app')).toEqual([
      '--display',
      '--extract-certificates=/tmp/certificate',
      '/tmp/Helper.app',
    ]);
    expect(
      macOSCodeSignArguments(
        {
          codesignIdentity: 'ABCDEF',
          signing: { certificateHash: 'ABCDEF', identity: 'Example', mode: 'signed' },
        },
        '/tmp/Helper.app',
      ),
    ).toEqual([
      '--force',
      '--sign',
      'ABCDEF',
      '--identifier',
      'com.microsoft.fluentui-react-native.desktop-driver',
      '--options',
      'runtime',
      '--timestamp',
      '/tmp/Helper.app',
    ]);
    expect(macOSCodeSignArguments({ codesignIdentity: '-', signing: { mode: 'adhoc' } }, '/tmp/Helper.app')).toContain('--timestamp=none');
    expect(
      parseMacOSSigningIdentities(
        '  1) AB592605F8619FCAA952B4A2525AE6D41296FDD7 "FURN Desktop Driver Development" (CSSMERR_TP_NOT_TRUSTED)\n',
      ),
    ).toEqual([
      {
        hash: 'AB592605F8619FCAA952B4A2525AE6D41296FDD7',
        name: 'FURN Desktop Driver Development',
      },
    ]);
  });

  windowsTest('builds, reuses, resolves, and handshakes with the Windows helper', async () => {
    const cacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-driver-native-'));
    const externalRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-driver-external-'));
    try {
      const built = await buildNativeDesktopDriver({ cacheRoot, platform: 'windows' });
      expect(built).toMatchObject({
        architecture: 'x64',
        endpoints: ['windows', 'win32'],
        origin: 'built',
        provider: 'windows',
        wireProtocol: { major: 1, minor: 0 },
      });
      expect(fs.existsSync(built.executablePath)).toBe(true);

      const reused = await buildNativeDesktopDriver({ cacheRoot, platform: 'win32' });
      expect(reused).toMatchObject({
        artifactId: built.artifactId,
        origin: 'cache',
      });

      const resolved = await resolveNativeDesktopDriver({ buildPolicy: 'never', cacheRoot, platform: 'windows' });
      expect(resolved.artifactId).toBe(built.artifactId);

      const emitWarning = jest.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
      try {
        const compatibilityRoot = path.dirname(path.dirname(resolved.artifactRoot));
        const incompatibleRoot = path.join(compatibilityRoot, 'incompatible-build', 'incompatible-artifact');
        fs.cpSync(resolved.artifactRoot, incompatibleRoot, { recursive: true });
        const incompatibleManifestPath = path.join(incompatibleRoot, 'artifact.json');
        const incompatibleManifest = JSON.parse(fs.readFileSync(incompatibleManifestPath, 'utf8')) as Record<string, unknown>;
        incompatibleManifest.compatibilityKey = 'incompatible-context';
        fs.writeFileSync(incompatibleManifestPath, `${JSON.stringify(incompatibleManifest, null, 2)}\n`);
        const compatibilityDirectory = fs.readdirSync(path.join(cacheRoot, 'v1', 'selections')).at(0);
        if (!compatibilityDirectory) {
          throw new Error('The native build did not write its compatibility selection.');
        }
        const selectionRoot = path.join(cacheRoot, 'v1', 'selections', compatibilityDirectory);
        fs.writeFileSync(
          path.join(selectionRoot, 'zzzy-incompatible.json'),
          `${JSON.stringify({
            artifactPath: path.relative(cacheRoot, incompatibleRoot),
            createdAt: new Date().toISOString(),
            schemaVersion: 1,
          })}\n`,
        );
        const unrelatedRoot = path.join(path.dirname(compatibilityRoot), 'unrelated-context', 'build-context', 'artifact-context');
        fs.mkdirSync(unrelatedRoot, { recursive: true });
        fs.writeFileSync(path.join(unrelatedRoot, 'artifact.json'), '{');
        fs.writeFileSync(
          path.join(selectionRoot, 'zzzz-unrelated.json'),
          `${JSON.stringify({
            artifactPath: path.relative(cacheRoot, unrelatedRoot),
            createdAt: new Date().toISOString(),
            schemaVersion: 1,
          })}\n`,
        );
        const externalArtifactRoot = path.join(externalRoot, 'artifact');
        fs.cpSync(resolved.artifactRoot, externalArtifactRoot, { recursive: true });
        const junctionRoot = path.join(compatibilityRoot, 'junction-build', 'junction-artifact');
        fs.mkdirSync(path.dirname(junctionRoot), { recursive: true });
        fs.symlinkSync(externalArtifactRoot, junctionRoot, 'junction');
        fs.writeFileSync(
          path.join(selectionRoot, 'zzzx-junction.json'),
          `${JSON.stringify({
            artifactPath: path.relative(cacheRoot, junctionRoot),
            createdAt: new Date().toISOString(),
            schemaVersion: 1,
          })}\n`,
        );
        await expect(resolveNativeDesktopDriver({ buildPolicy: 'never', cacheRoot, platform: 'windows' })).resolves.toMatchObject({
          artifactId: resolved.artifactId,
        });
        expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'trash'))).toHaveLength(3);
        expect(fs.existsSync(incompatibleRoot)).toBe(true);
        expect(fs.existsSync(unrelatedRoot)).toBe(true);
        expect(fs.existsSync(externalArtifactRoot)).toBe(true);

        await expect(NativeHostProcess.start({ artifact: { ...resolved, buildId: 'mismatched-build' } })).rejects.toMatchObject({
          code: 'handshake-failed',
        });
        await expectMalformedJsonFailsTransport(resolved.executablePath);

        const helper = await NativeHostProcess.start({ artifact: resolved });
        await expect(helper.request('probe', { padding: 'x'.repeat(8 * 1024 * 1024) })).rejects.toThrow('exceeds');
        await expect(helper.request('probe', { endpoint: 'windows' })).resolves.toMatchObject({
          result: {
            endpoint: 'windows',
            platformName: 'windows',
            protocolVersion: 1,
          },
        });
        await helper.dispose();
        await expectProtectedNativeService(resolved);
        await expectEffectReporting(resolved.executablePath);
        await expectBoundedObservation(resolved.executablePath, 'windows');

        const observationDump = path.join(cacheRoot, 'self-test-observations.json');
        const selfTest = spawnSync(resolved.executablePath, ['--self-test'], {
          encoding: 'utf8',
          env: { ...process.env, FURN_DRIVER_SELF_TEST_OBSERVATIONS: observationDump },
          timeout: 120_000,
        });
        expect(selfTest.status).toBe(0);
        expect(selfTest.stdout).toContain('self-test passed');
        expectSelfTestObservationsToConform(observationDump);

        fs.writeFileSync(resolved.executablePath, 'corrupt');
        await expect(resolveNativeDesktopDriver({ buildPolicy: 'never', cacheRoot, platform: 'windows' })).rejects.toMatchObject({
          code: 'no-verified-prebuilt',
        });
        expect(fs.readdirSync(path.join(cacheRoot, 'v1', 'trash'))).toHaveLength(4);
        expect(emitWarning).toHaveBeenCalledWith(expect.stringContaining('Quarantined invalid native driver cache selection'), {
          code: 'FURN_NATIVE_DRIVER_CACHE_INVALID',
        });
      } finally {
        emitWarning.mockRestore();
      }
    } finally {
      fs.rmSync(cacheRoot, { force: true, maxRetries: 10, recursive: true, retryDelay: 100 });
      fs.rmSync(externalRoot, { force: true, maxRetries: 10, recursive: true, retryDelay: 100 });
    }
  });

  test('rejects unsupported V1 architecture combinations before building', async () => {
    await expect(buildNativeDesktopDriver({ architecture: 'arm64', platform: 'windows' })).rejects.toMatchObject({
      code: 'unsupported-platform',
    });
  });

  test('honors the prebuilt-only build policy from the environment', async () => {
    const cacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-driver-policy-'));
    const previousPolicy = process.env.FURN_DESKTOP_DRIVER_BUILD_POLICY;
    process.env.FURN_DESKTOP_DRIVER_BUILD_POLICY = 'never';
    try {
      await expect(resolveNativeDesktopDriver({ cacheRoot, platform: 'windows' })).rejects.toMatchObject({
        code: 'no-verified-prebuilt',
      });
    } finally {
      if (previousPolicy === undefined) {
        delete process.env.FURN_DESKTOP_DRIVER_BUILD_POLICY;
      } else {
        process.env.FURN_DESKTOP_DRIVER_BUILD_POLICY = previousPolicy;
      }
      fs.rmSync(cacheRoot, { force: true, recursive: true });
    }
  });

  // PROTOCOL.md: invalid JSON fails the transport, because the frame may have
  // carried a request or cancel the helper cannot correlate.
  async function expectMalformedJsonFailsTransport(executablePath: string): Promise<void> {
    const child = spawn(executablePath, ['--stdio'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const closed = new Promise<number | null>((resolve) => child.once('close', (code) => resolve(code)));
    const decoder = new NativeFrameDecoder();
    const responses: string[] = [];
    decoder.on('json', (message: NativeHostJsonMessage) => {
      if (message.type === 'response' && typeof message.id === 'string') {
        responses.push(message.id);
      }
    });
    child.stdout.on('data', (chunk: Buffer) => decoder.write(chunk));
    child.stderr.resume();
    // The helper may exit before it reads the frames written after the malformed one.
    child.stdin.on('error', () => undefined);
    try {
      await waitForMessage(decoder, (message) => message.type === 'hello');
      child.stdin.write(encodeMalformedJsonFrame());
      child.stdin.write(
        encodeJsonFrame({
          command: 'probe',
          id: 'probe-after-malformed',
          params: { endpoint: 'windows' },
          type: 'request',
        }),
      );
      const exit = await Promise.race([
        closed,
        new Promise<'still-running'>((resolve) => setTimeout(() => resolve('still-running'), 10_000).unref()),
      ]);
      expect(exit).toBe(1);
      expect(responses).not.toContain('probe-after-malformed');
    } finally {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill();
        await closed;
      }
    }
  }

  // The effect is what lets the driver tell a rejected mutation from one that may have reached the application.
  async function expectEffectReporting(executablePath: string): Promise<void> {
    const child = spawn(executablePath, ['--stdio'], { stdio: ['pipe', 'pipe', 'pipe'] });
    const closed = new Promise<void>((resolve) => child.once('close', () => resolve()));
    const decoder = new NativeFrameDecoder();
    child.stdout.on('data', (chunk: Buffer) => decoder.write(chunk));
    child.stderr.resume();
    const request = (id: string, command: string, params: Record<string, unknown>) => {
      const response = waitForMessage(decoder, (message) => message.type === 'response' && message.id === id);
      child.stdin.write(encodeJsonFrame({ command, id, params, type: 'request' }));
      return response;
    };
    try {
      await waitForMessage(decoder, (message) => message.type === 'hello');

      await expect(request('click-unknown-element', 'click', { elementId: 'element-never-issued' })).resolves.toMatchObject({
        error: { code: 'stale-element', effect: 'none' },
      });
      await expect(request('send-keys-without-text', 'sendKeys', { elementId: 'element-never-issued' })).resolves.toMatchObject({
        error: { code: 'invalid-params', effect: 'none' },
      });
      const read = await request('windows-without-lease', 'windows', {});
      expect(read).toHaveProperty('error.code');
      expect(read).not.toHaveProperty('error.effect');

      const cancelled = waitForMessage(decoder, (message) => message.type === 'cancelled' && message.id === 'never-dispatched');
      child.stdin.write(encodeJsonFrame({ id: 'never-dispatched', type: 'cancel' }));
      await expect(cancelled).resolves.toMatchObject({ effect: 'none' });

      await request('dispose-after-effects', 'dispose', {});
      await closed;
    } finally {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill();
        await closed;
      }
    }
  }

  // These commands run before any application is leased, so they hold on any machine, trusted for Accessibility or not.
  async function expectBoundedObservation(executablePath: string, endpoint: 'macos' | 'windows'): Promise<void> {
    const child = spawn(executablePath, ['--stdio'], { stdio: ['pipe', 'pipe', 'pipe'] });
    const closed = new Promise<void>((resolve) => child.once('close', () => resolve()));
    const decoder = new NativeFrameDecoder();
    child.stdout.on('data', (chunk: Buffer) => decoder.write(chunk));
    child.stderr.resume();
    const request = (id: string, command: string, params: Record<string, unknown>) => {
      const response = waitForMessage(decoder, (message) => message.type === 'response' && message.id === id);
      child.stdin.write(encodeJsonFrame({ command, id, params, type: 'request' }));
      return response;
    };
    const budget = { deadlineMs: 1000, maxBytes: 65_536, maxDepth: 4, maxStringLength: 64, maxVisited: 50 };
    try {
      await expect(waitForMessage(decoder, (message) => message.type === 'hello')).resolves.toMatchObject({
        features: expect.arrayContaining(['boundedObservation']),
      });
      await expect(request('probe-observation', 'probe', { endpoint })).resolves.toMatchObject({
        result: { features: { boundedObservation: expect.any(Boolean) } },
      });

      const malformed = await request('observe-without-budget', 'observe', { facts: [], windowId: 'window-never-issued' });
      expect(malformed).toMatchObject({ error: { code: 'invalid-params' } });
      expect(malformed).not.toHaveProperty('error.effect');
      const unknownWindow = await request('observe-unknown-window', 'observe', {
        budget,
        facts: ['enabled'],
        windowId: 'window-never-issued',
      });
      expect(unknownWindow).toMatchObject({ error: { code: 'no-such-window' } });
      expect(unknownWindow).not.toHaveProperty('error.effect');

      await expect(request('release-nothing', 'releaseElements', { ids: ['element-never-issued'] })).resolves.toMatchObject({
        result: { released: 0 },
      });
      await expect(request('release-malformed', 'releaseElements', { ids: 'element-never-issued' })).resolves.toMatchObject({
        error: { code: 'invalid-params' },
      });

      await request('dispose-after-observation', 'dispose', {});
      await closed;
    } finally {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill();
        await closed;
      }
    }
  }

  // The helper serves one session for a long time from threads that run no run loop, so anything autoreleased per request
  // that is not drained there accumulates; before the fix a probe round trip cost the helper about 25 KB for good.
  async function expectMacosRequestMemoryStable(executablePath: string): Promise<void> {
    const child = spawn(executablePath, ['--stdio'], { stdio: ['pipe', 'pipe', 'pipe'] });
    const closed = new Promise<void>((resolve) => child.once('close', () => resolve()));
    const decoder = new NativeFrameDecoder();
    child.stdout.on('data', (chunk: Buffer) => decoder.write(chunk));
    child.stderr.resume();
    const residentKilobytes = (): number =>
      Number(spawnSync('ps', ['-o', 'rss=', '-p', String(child.pid)], { encoding: 'utf8' }).stdout.trim());
    const roundTrip = async (id: string, command: string, params: Record<string, unknown>) => {
      const response = waitForMessage(decoder, (message) => message.type === 'response' && message.id === id);
      child.stdin.write(encodeJsonFrame({ command, id, params, type: 'request' }));
      await response;
    };
    try {
      await waitForMessage(decoder, (message) => message.type === 'hello');
      for (let index = 0; index < 200; index += 1) {
        await roundTrip(`warm-${index}`, 'probe', { endpoint: 'macos' });
      }
      const before = residentKilobytes();
      expect(before).toBeGreaterThan(0);
      for (let index = 0; index < 1000; index += 1) {
        await roundTrip(`probe-${index}`, 'probe', { endpoint: 'macos' });
      }
      expect(residentKilobytes() - before).toBeLessThan(8 * 1024);

      await roundTrip('dispose-after-memory-check', 'dispose', {});
      await closed;
    } finally {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill();
        await closed;
      }
    }
  }

  // The self-test builds samples from synthetic trees; the Node validator is the independent judge of their conformance.
  function expectSelfTestObservationsToConform(dumpPath: string): void {
    const entries = JSON.parse(fs.readFileSync(dumpPath, 'utf8')) as {
      name: string;
      request: NativeObserveRequest;
      result: unknown;
    }[];
    expect(entries.length).toBeGreaterThan(100);
    const rejected = entries.flatMap((entry) => {
      const parsed = parseNativeObservation(entry.request, entry.result);
      return parsed.status === 'rejected' ? [`${entry.name}: ${parsed.message}`] : [];
    });
    expect(rejected).toEqual([]);
    const complete = entries.filter((entry) => (entry.result as { complete: boolean }).complete);
    expect(complete.length).toBeGreaterThan(0);
    expect(complete.length).toBeLessThan(entries.length);
  }

  function encodeMalformedJsonFrame(): Buffer {
    const payload = Buffer.from('{', 'utf8');
    const header = Buffer.alloc(12);
    header.write('FDR1', 0, 'ascii');
    header[4] = 1;
    header.writeUInt32LE(payload.length, 8);
    return Buffer.concat([header, payload]);
  }

  function waitForMessage(
    decoder: NativeFrameDecoder,
    predicate: (message: NativeHostJsonMessage) => boolean,
  ): Promise<NativeHostJsonMessage> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Timed out waiting for the native helper response.'));
      }, 5000);
      const onJson = (message: NativeHostJsonMessage) => {
        if (predicate(message)) {
          cleanup();
          resolve(message);
        }
      };
      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };
      const cleanup = () => {
        clearTimeout(timeout);
        decoder.off('json', onJson);
        decoder.off('error', onError);
      };
      decoder.on('json', onJson);
      decoder.once('error', onError);
    });
  }
});
