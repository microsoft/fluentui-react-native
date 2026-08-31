import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import {
  acquireDirectoryLock,
  atomicWriteJson,
  canonicalJson,
  defaultNativeDriverCacheRoot,
  hashTree,
  listFiles,
  readJsonFile,
  sha256,
  throwIfAborted,
} from './filesystem.js';
import { nativeDriverWireProtocol } from './constants.js';
import { NativeDriverError } from './NativeDriverError.js';
import type {
  NativeDriverArchitecture,
  NativeDriverArtifact,
  NativeDriverArtifactOrigin,
  NativeDriverBuildOptions,
  NativeDriverBuildPolicy,
  NativeDriverConfiguration,
  NativeDriverProvider,
  NativeDriverResolveOptions,
  NativeHostHello,
} from './types.js';
import { buildWindowsDriver, probeWindowsToolchain } from './windows/buildWindowsDriver.js';

export const FURN_DESKTOP_DRIVER_BUILD_POLICY = 'FURN_DESKTOP_DRIVER_BUILD_POLICY';
export const FURN_DESKTOP_DRIVER_CACHE_ROOT = 'FURN_DESKTOP_DRIVER_CACHE_ROOT';
export const FURN_DESKTOP_DRIVER_HELPER_PATH = 'FURN_DESKTOP_DRIVER_HELPER_PATH';
export const FURN_DESKTOP_DRIVER_INSTALL_ROOT = 'FURN_DESKTOP_DRIVER_INSTALL_ROOT';

const buildCoordinatorVersion = 1;

type NativeArtifactManifest = Omit<NativeDriverArtifact, 'artifactRoot' | 'executablePath' | 'origin'> & {
  executable: string;
};

type NativeArtifactSelection = {
  artifactPath: string;
  createdAt: string;
  schemaVersion: 1;
};

type NativeBuildContext = {
  architecture: NativeDriverArchitecture;
  cacheRoot: string;
  compatibilityKey: string;
  configuration: NativeDriverConfiguration;
  endpoints: readonly ('macos' | 'windows' | 'win32')[];
  packageRoot: string;
  provider: NativeDriverProvider;
  sourceDigest: string;
};

export async function buildNativeDesktopDriver(options: NativeDriverBuildOptions): Promise<NativeDriverArtifact> {
  const context = resolveBuildContext(options);
  if (context.provider !== 'windows') {
    throw new NativeDriverError('unsupported-host', 'The macOS native helper is not implemented in this checkout.');
  }
  const toolchain = await probeWindowsToolchain(options.signal);
  const buildFingerprint = sha256(
    canonicalJson({
      compatibilityKey: context.compatibilityKey,
      toolchain: toolchain.fingerprint,
    }),
  );
  const lockRoot = path.join(context.cacheRoot, 'v1', 'locks');
  fs.mkdirSync(lockRoot, { recursive: true });
  const lock = await acquireDirectoryLock(path.join(lockRoot, shortKey(buildFingerprint)), options.signal);
  try {
    if (!options.force) {
      const cached = await resolveCachedArtifact(context, 'cache');
      if (cached?.buildFingerprint === buildFingerprint) {
        return cached;
      }
    }
    throwIfAborted(options.signal);
    const stagingRoot = path.join(context.cacheRoot, 'v1', 'staging', `${buildFingerprint}-${process.pid}-${randomUUID()}`);
    fs.mkdirSync(stagingRoot, { recursive: true });
    try {
      const buildId = `${buildFingerprint.slice(0, 16)}-${Date.now().toString(36)}`;
      const built = await buildWindowsDriver({
        buildId,
        configuration: context.configuration,
        packageRoot: context.packageRoot,
        signal: options.signal,
        sourceDigest: context.sourceDigest,
        stagingRoot,
        toolchain,
      });
      const handshake = await readOneShotHandshake(built.executablePath, options.signal);
      validateHandshake(handshake, {
        architecture: context.architecture,
        buildId,
        provider: context.provider,
        sourceDigest: context.sourceDigest,
      });
      const artifactId = sha256(fs.readFileSync(built.executablePath));
      const artifactRoot = path.join(
        context.cacheRoot,
        'v1',
        'artifacts',
        `${context.provider}-${context.architecture}`,
        shortKey(context.compatibilityKey),
        shortKey(buildFingerprint),
        shortKey(artifactId),
      );
      const publicationRoot = path.join(context.cacheRoot, 'v1', 'staging', `publish-${artifactId}-${randomUUID()}`);
      const publicationBin = path.join(publicationRoot, 'bin');
      fs.mkdirSync(publicationBin, { recursive: true });
      const publishedExecutable = path.join(publicationBin, path.basename(built.executablePath));
      fs.copyFileSync(built.executablePath, publishedExecutable);
      fs.copyFileSync(built.buildLogPath, path.join(publicationRoot, 'build.log'));
      const manifest: NativeArtifactManifest = {
        architecture: context.architecture,
        artifactId,
        buildFingerprint,
        buildId,
        compatibilityKey: context.compatibilityKey,
        configuration: context.configuration,
        endpoints: context.endpoints,
        executable: path.relative(publicationRoot, publishedExecutable),
        features: handshake.features,
        provider: context.provider,
        schemaVersion: 1,
        signing: { mode: 'none' },
        sourceDigest: context.sourceDigest,
        wireProtocol: handshake.protocol,
      };
      atomicWriteJson(path.join(publicationRoot, 'artifact.json'), manifest);
      fs.mkdirSync(path.dirname(artifactRoot), { recursive: true });
      try {
        fs.renameSync(publicationRoot, artifactRoot);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
          throw error;
        }
        fs.rmSync(publicationRoot, { force: true, recursive: true });
      }
      writeSelection(context.cacheRoot, context.compatibilityKey, artifactRoot);
      return verifyNativeDriverArtifact(readArtifact(artifactRoot, 'built'), options.signal);
    } finally {
      fs.rmSync(stagingRoot, { force: true, recursive: true });
    }
  } finally {
    lock.release();
  }
}

export async function resolveNativeDesktopDriver(options: NativeDriverResolveOptions): Promise<NativeDriverArtifact> {
  const context = resolveBuildContext(options);
  const helperPath = options.helperPath ?? process.env[FURN_DESKTOP_DRIVER_HELPER_PATH];
  if (helperPath) {
    return verifyDirectArtifact(helperPath, context, 'explicit-path', options.signal);
  }
  const installRoot = options.installRoot ?? process.env[FURN_DESKTOP_DRIVER_INSTALL_ROOT];
  if (installRoot) {
    const installed = await resolveCachedArtifact({ ...context, cacheRoot: path.resolve(installRoot) }, 'install-root');
    if (!installed) {
      throw new NativeDriverError(
        'no-verified-prebuilt',
        `No compatible ${context.provider}-${context.architecture} helper was found beneath "${installRoot}".`,
      );
    }
    return installed;
  }
  const cached = await resolveCachedArtifact(context, 'cache');
  if (cached) {
    return cached;
  }
  const buildPolicy = resolveBuildPolicy(options.buildPolicy);
  if (buildPolicy === 'never') {
    throw new NativeDriverError(
      'no-verified-prebuilt',
      `No verified ${context.provider}-${context.architecture} helper is available and source builds are disabled.`,
      { cacheRoot: context.cacheRoot, compatibilityKey: context.compatibilityKey },
    );
  }
  return buildNativeDesktopDriver(options);
}

export async function verifyNativeDriverArtifact(artifact: NativeDriverArtifact, signal?: AbortSignal): Promise<NativeDriverArtifact> {
  throwIfAborted(signal);
  const executablePath = fs.realpathSync.native(artifact.executablePath);
  if (!fs.statSync(executablePath).isFile()) {
    throw new NativeDriverError('integrity-mismatch', `Native driver helper is not a file: "${executablePath}".`);
  }
  const executableHash = sha256(fs.readFileSync(executablePath));
  if (artifact.artifactId !== executableHash) {
    throw new NativeDriverError('integrity-mismatch', `Native driver helper hash does not match "${artifact.artifactId}".`);
  }
  const handshake = await readOneShotHandshake(executablePath, signal);
  validateHandshake(handshake, artifact);
  return Object.freeze({ ...artifact, executablePath, features: Object.freeze([...handshake.features]) });
}

function resolveBuildContext(options: NativeDriverBuildOptions): NativeBuildContext {
  const provider = normalizeProvider(options.platform);
  const architecture = options.architecture ?? defaultArchitecture(provider);
  validateArchitecture(provider, architecture);
  const configuration = options.configuration ?? resolveConfiguration();
  const packageRoot = resolvePackageRoot();
  const nativeRoot = path.join(packageRoot, 'native');
  const providerRoot = path.join(nativeRoot, provider);
  if (!fs.existsSync(providerRoot)) {
    throw new NativeDriverError('build-source-missing', `Native driver source does not exist at "${providerRoot}".`);
  }
  const sourceDigest = sha256(
    canonicalJson({
      coordinatorVersion: buildCoordinatorVersion,
      protocol: sha256(fs.readFileSync(path.join(nativeRoot, 'protocol.json'))),
      provider: hashTree(providerRoot),
    }),
  );
  const compatibilityKey = sha256(
    canonicalJson({
      architecture,
      configuration,
      coordinatorVersion: buildCoordinatorVersion,
      protocol: nativeDriverWireProtocol,
      provider,
      sourceDigest,
    }),
  );
  const cacheRoot = path.resolve(options.cacheRoot ?? process.env[FURN_DESKTOP_DRIVER_CACHE_ROOT] ?? defaultNativeDriverCacheRoot());
  return {
    architecture,
    cacheRoot,
    compatibilityKey,
    configuration,
    endpoints: provider === 'windows' ? ['windows', 'win32'] : ['macos'],
    packageRoot,
    provider,
    sourceDigest,
  };
}

async function resolveCachedArtifact(
  context: NativeBuildContext,
  origin: Extract<NativeDriverArtifactOrigin, 'cache' | 'install-root'>,
): Promise<NativeDriverArtifact | undefined> {
  const selectionRoot = path.join(context.cacheRoot, 'v1', 'selections', shortKey(context.compatibilityKey));
  if (!fs.existsSync(selectionRoot)) {
    return undefined;
  }
  const selections = listFiles(selectionRoot)
    .filter((filePath) => filePath.endsWith('.json'))
    .sort((left, right) => right.localeCompare(left));
  for (const selectionPath of selections) {
    const selection = readJsonFile<NativeArtifactSelection>(selectionPath);
    if (selection.schemaVersion !== 1 || typeof selection.artifactPath !== 'string') {
      continue;
    }
    const artifactRoot = path.resolve(context.cacheRoot, selection.artifactPath);
    if (!isWithin(context.cacheRoot, artifactRoot) || !fs.existsSync(path.join(artifactRoot, 'artifact.json'))) {
      continue;
    }
    try {
      return await verifyNativeDriverArtifact(readArtifact(artifactRoot, origin));
    } catch (error) {
      if (origin === 'install-root') {
        throw error;
      }
    }
  }
  return undefined;
}

function readArtifact(artifactRoot: string, origin: NativeDriverArtifactOrigin): NativeDriverArtifact {
  const manifest = readJsonFile<NativeArtifactManifest>(path.join(artifactRoot, 'artifact.json'));
  if (manifest.schemaVersion !== 1 || typeof manifest.executable !== 'string') {
    throw new NativeDriverError('integrity-mismatch', `Invalid native driver artifact manifest beneath "${artifactRoot}".`);
  }
  const executablePath = path.resolve(artifactRoot, manifest.executable);
  if (!isWithin(artifactRoot, executablePath)) {
    throw new NativeDriverError('integrity-mismatch', 'Native driver artifact executable escapes its artifact root.');
  }
  const { executable: _executable, ...artifact } = manifest;
  return {
    ...artifact,
    artifactRoot,
    executablePath,
    origin,
  };
}

async function verifyDirectArtifact(
  helperPath: string,
  context: NativeBuildContext,
  origin: NativeDriverArtifactOrigin,
  signal?: AbortSignal,
): Promise<NativeDriverArtifact> {
  const executablePath = fs.realpathSync.native(path.resolve(helperPath));
  const handshake = await readOneShotHandshake(executablePath, signal);
  if (handshake.provider !== context.provider || handshake.architecture !== context.architecture) {
    throw new NativeDriverError(
      'platform-mismatch',
      `Native driver helper reports ${handshake.provider}-${handshake.architecture}, expected ${context.provider}-${context.architecture}.`,
    );
  }
  if (handshake.protocol.major !== nativeDriverWireProtocol.major || handshake.protocol.minor < nativeDriverWireProtocol.minor) {
    throw new NativeDriverError(
      'protocol-mismatch',
      `Native helper protocol ${handshake.protocol.major}.${handshake.protocol.minor} is incompatible with ${nativeDriverWireProtocol.major}.${nativeDriverWireProtocol.minor}.`,
    );
  }
  const artifactId = sha256(fs.readFileSync(executablePath));
  return {
    architecture: context.architecture,
    artifactId,
    artifactRoot: path.dirname(executablePath),
    buildFingerprint: handshake.buildId,
    buildId: handshake.buildId,
    compatibilityKey: context.compatibilityKey,
    configuration: context.configuration,
    endpoints: context.endpoints,
    executablePath,
    features: Object.freeze([...handshake.features]),
    origin,
    provider: context.provider,
    schemaVersion: 1,
    signing: { mode: context.provider === 'macos' ? 'adhoc' : 'none' },
    sourceDigest: handshake.sourceDigest,
    wireProtocol: handshake.protocol,
  };
}

function writeSelection(cacheRoot: string, compatibilityKey: string, artifactRoot: string): void {
  const selectionRoot = path.join(cacheRoot, 'v1', 'selections', shortKey(compatibilityKey));
  const generation = `${new Date().toISOString().replaceAll(/[-:.TZ]/g, '')}-${randomUUID()}`;
  atomicWriteJson(path.join(selectionRoot, `${generation}.json`), {
    artifactPath: path.relative(cacheRoot, artifactRoot),
    createdAt: new Date().toISOString(),
    schemaVersion: 1,
  } satisfies NativeArtifactSelection);
}

async function readOneShotHandshake(executablePath: string, signal?: AbortSignal): Promise<NativeHostHello> {
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    const child = spawn(executablePath, ['--handshake', '--json'], {
      signal,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code !== 0) {
        reject(
          new NativeDriverError(
            'handshake-failed',
            `Native driver helper exited with code ${String(code)} during handshake: ${Buffer.concat(stderr).toString('utf8')}`,
          ),
        );
        return;
      }
      try {
        const hello = JSON.parse(Buffer.concat(stdout).toString('utf8')) as NativeHostHello;
        if (hello.type !== 'hello') {
          throw new Error('Handshake response is not a hello message.');
        }
        resolve(hello);
      } catch (error) {
        reject(new NativeDriverError('handshake-failed', error instanceof Error ? error.message : String(error)));
      }
    });
  });
}

function validateHandshake(
  handshake: NativeHostHello,
  expected: Pick<NativeDriverArtifact, 'architecture' | 'buildId' | 'provider' | 'sourceDigest'>,
): void {
  if (handshake.protocol.major !== nativeDriverWireProtocol.major || handshake.protocol.minor < nativeDriverWireProtocol.minor) {
    throw new NativeDriverError(
      'protocol-mismatch',
      `Native helper protocol ${handshake.protocol.major}.${handshake.protocol.minor} is incompatible with ${nativeDriverWireProtocol.major}.${nativeDriverWireProtocol.minor}.`,
    );
  }
  for (const field of ['architecture', 'buildId', 'provider', 'sourceDigest'] as const) {
    if (handshake[field] !== expected[field]) {
      throw new NativeDriverError(
        'integrity-mismatch',
        `Native helper ${field} "${handshake[field]}" does not match "${expected[field]}".`,
      );
    }
  }
}

function normalizeProvider(endpoint: 'macos' | 'win32' | 'windows'): NativeDriverProvider {
  return endpoint === 'macos' ? 'macos' : 'windows';
}

function defaultArchitecture(provider: NativeDriverProvider): NativeDriverArchitecture {
  return provider === 'macos' ? 'arm64' : 'x64';
}

function validateArchitecture(provider: NativeDriverProvider, architecture: NativeDriverArchitecture): void {
  if ((provider === 'windows' && architecture !== 'x64') || (provider === 'macos' && architecture !== 'arm64')) {
    throw new NativeDriverError('unsupported-platform', `Desktop Driver V1 does not support ${provider}-${architecture}.`);
  }
}

function resolveConfiguration(): NativeDriverConfiguration {
  const value = process.env.FURN_DESKTOP_DRIVER_CONFIGURATION;
  if (!value) {
    return 'release';
  }
  if (value !== 'debug' && value !== 'release') {
    throw new NativeDriverError('invalid-configuration', `Unsupported native driver configuration "${value}".`);
  }
  return value;
}

function resolveBuildPolicy(value?: NativeDriverBuildPolicy): NativeDriverBuildPolicy {
  const configured = value ?? process.env[FURN_DESKTOP_DRIVER_BUILD_POLICY] ?? 'if-missing';
  if (configured !== 'if-missing' && configured !== 'never') {
    throw new NativeDriverError('invalid-configuration', `Unsupported native driver build policy "${configured}".`);
  }
  return configured;
}

function isWithin(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function shortKey(value: string): string {
  return value.slice(0, 20);
}

function resolvePackageRoot(): string {
  const cliRoot = findPackageRoot(process.argv[1] ? path.dirname(path.resolve(process.argv[1])) : undefined);
  if (cliRoot) {
    return cliRoot;
  }
  try {
    const requireFromCwd = createRequire(path.join(process.cwd(), 'package.json'));
    return path.dirname(requireFromCwd.resolve('@fluentui-react-native/desktop-driver/package.json'));
  } catch (error) {
    throw new NativeDriverError(
      'build-source-missing',
      `Could not resolve @fluentui-react-native/desktop-driver from "${process.cwd()}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function findPackageRoot(start?: string): string | undefined {
  let current = start;
  while (current) {
    const manifestPath = path.join(current, 'package.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = readJsonFile<{ name?: string }>(manifestPath);
      if (manifest.name === '@fluentui-react-native/desktop-driver') {
        return current;
      }
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return undefined;
    }
    current = parent;
  }
  return undefined;
}
