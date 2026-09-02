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
import {
  buildMacOSDriver,
  hashMacOSDriverSources,
  macOSBundleForExecutable,
  probeMacOSToolchain,
  resolveMacOSExecutablePath,
  resolveMacOSSigningIdentity,
  verifyMacOSDriver,
} from './macos/buildMacOSDriver.js';
import type { BuildMacOSDriverResult, MacOSSigningIdentity } from './macos/buildMacOSDriver.js';
import { buildWindowsDriver, probeWindowsToolchain } from './windows/buildWindowsDriver.js';
import type { BuildWindowsDriverResult } from './windows/buildWindowsDriver.js';

export const FURN_DESKTOP_DRIVER_BUILD_POLICY = 'FURN_DESKTOP_DRIVER_BUILD_POLICY';
export const FURN_DESKTOP_DRIVER_CACHE_ROOT = 'FURN_DESKTOP_DRIVER_CACHE_ROOT';
export const FURN_DESKTOP_DRIVER_HELPER_PATH = 'FURN_DESKTOP_DRIVER_HELPER_PATH';
export const FURN_DESKTOP_DRIVER_INSTALL_ROOT = 'FURN_DESKTOP_DRIVER_INSTALL_ROOT';
export const FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY = 'FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY';

const buildCoordinatorVersion = 2;

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
  signingIdentity?: MacOSSigningIdentity;
  sourceDigest: string;
};

type NativeBuildResult = BuildMacOSDriverResult | BuildWindowsDriverResult;

export async function buildNativeDesktopDriver(options: NativeDriverBuildOptions): Promise<NativeDriverArtifact> {
  const context = await resolveBuildContext(options);
  let build: (buildId: string, stagingRoot: string) => Promise<NativeBuildResult>;
  let toolchainFingerprint: string;
  if (context.provider === 'windows') {
    const toolchain = await probeWindowsToolchain(options.signal);
    toolchainFingerprint = toolchain.fingerprint;
    build = (buildId, stagingRoot) =>
      buildWindowsDriver({
        buildId,
        configuration: context.configuration,
        packageRoot: context.packageRoot,
        signal: options.signal,
        sourceDigest: context.sourceDigest,
        stagingRoot,
        toolchain,
      });
  } else {
    const toolchain = await probeMacOSToolchain(context.signingIdentity, options.signal);
    toolchainFingerprint = toolchain.fingerprint;
    build = (buildId, stagingRoot) =>
      buildMacOSDriver({
        buildId,
        configuration: context.configuration,
        packageRoot: context.packageRoot,
        signal: options.signal,
        sourceDigest: context.sourceDigest,
        stagingRoot,
        toolchain,
      });
  }
  const buildFingerprint = sha256(
    canonicalJson({
      compatibilityKey: context.compatibilityKey,
      toolchain: toolchainFingerprint,
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
      const buildId = buildFingerprint;
      const built = await build(buildId, stagingRoot);
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
      let publishedExecutable: string;
      if ('bundlePath' in built) {
        const publishedBundle = path.join(publicationBin, path.basename(built.bundlePath));
        fs.cpSync(built.bundlePath, publishedBundle, { recursive: true });
        publishedExecutable = path.join(publishedBundle, path.relative(built.bundlePath, built.executablePath));
      } else {
        publishedExecutable = path.join(publicationBin, path.basename(built.executablePath));
        fs.copyFileSync(built.executablePath, publishedExecutable);
      }
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
        signing: 'signing' in built ? built.signing : { mode: 'none' },
        sourceDigest: context.sourceDigest,
        wireProtocol: handshake.protocol,
      };
      atomicWriteJson(path.join(publicationRoot, 'artifact.json'), manifest);
      fs.mkdirSync(path.dirname(artifactRoot), { recursive: true });
      try {
        fs.renameSync(publicationRoot, artifactRoot);
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code !== 'EEXIST' && code !== 'ENOTEMPTY') {
          throw error;
        }
        try {
          const existing = readArtifact(artifactRoot, 'built');
          validateCachedArtifactContext(existing, context);
          await verifyNativeDriverArtifact(existing, options.signal);
          fs.rmSync(publicationRoot, { force: true, recursive: true });
        } catch (collisionError) {
          quarantinePublishedArtifact(context.cacheRoot, artifactRoot, collisionError);
          fs.renameSync(publicationRoot, artifactRoot);
        }
      }
      writeSelection(context.cacheRoot, context.compatibilityKey, artifactRoot);
      assertManagedPath(artifactCompatibilityRoot(context), artifactRoot, 'directory');
      return verifyNativeDriverArtifact(readArtifact(artifactRoot, 'built'), options.signal);
    } finally {
      fs.rmSync(stagingRoot, { force: true, recursive: true });
    }
  } finally {
    lock.release();
  }
}

function quarantinePublishedArtifact(cacheRoot: string, artifactRoot: string, error: unknown): void {
  const trashRoot = path.join(cacheRoot, 'v1', 'trash');
  fs.mkdirSync(trashRoot, { recursive: true });
  assertManagedPath(cacheRoot, trashRoot, 'directory');
  const quarantinePath = path.join(trashRoot, `${Date.now()}-${randomUUID()}-${path.basename(artifactRoot)}`);
  fs.renameSync(artifactRoot, quarantinePath);
  atomicWriteJson(`${quarantinePath}.error.json`, {
    artifactRoot,
    message: error instanceof Error ? error.message : String(error),
  });
  process.emitWarning(`Quarantined invalid published native driver artifact "${artifactRoot}".`, {
    code: 'FURN_NATIVE_DRIVER_CACHE_INVALID',
  });
}

export async function resolveNativeDesktopDriver(options: NativeDriverResolveOptions): Promise<NativeDriverArtifact> {
  const context = await resolveBuildContext(options);
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
  if (artifact.provider === 'macos') {
    await verifyMacOSDriver(executablePath, artifact.signing, signal);
  }
  const handshake = await readOneShotHandshake(executablePath, signal);
  validateHandshake(handshake, artifact);
  return Object.freeze({ ...artifact, executablePath, features: Object.freeze([...handshake.features]) });
}

async function resolveBuildContext(options: NativeDriverBuildOptions): Promise<NativeBuildContext> {
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
      provider: provider === 'macos' ? hashMacOSDriverSources(providerRoot) : hashTree(providerRoot),
    }),
  );
  const configuredSigningIdentity =
    provider === 'macos'
      ? normalizeSigningIdentity(options.macosSigningIdentity ?? process.env[FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY])
      : undefined;
  const signingIdentity = await resolveMacOSSigningIdentity(configuredSigningIdentity, options.signal);
  const compatibilityKey = sha256(
    canonicalJson({
      architecture,
      configuration,
      coordinatorVersion: buildCoordinatorVersion,
      protocol: nativeDriverWireProtocol,
      provider,
      signingMode: provider === 'macos' ? (signingIdentity ? 'signed' : 'adhoc') : 'none',
      signingIdentity: signingIdentity?.hash,
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
    signingIdentity,
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
  assertManagedPath(context.cacheRoot, selectionRoot, 'directory');
  const selections = listFiles(selectionRoot)
    .filter((filePath) => filePath.endsWith('.json'))
    .sort((left, right) => right.localeCompare(left));
  for (const selectionPath of selections) {
    try {
      assertManagedPath(selectionRoot, selectionPath, 'file');
      const selection = readJsonFile<NativeArtifactSelection>(selectionPath);
      if (selection.schemaVersion !== 1 || typeof selection.artifactPath !== 'string') {
        throw new NativeDriverError('integrity-mismatch', `Invalid native driver selection at "${selectionPath}".`);
      }
      const artifactRoot = path.resolve(context.cacheRoot, selection.artifactPath);
      const compatibilityRoot = artifactCompatibilityRoot(context);
      if (!isArtifactRoot(compatibilityRoot, artifactRoot) || !fs.existsSync(path.join(artifactRoot, 'artifact.json'))) {
        throw new NativeDriverError('integrity-mismatch', `Native driver selection points to an invalid artifact.`);
      }
      assertManagedPath(context.cacheRoot, compatibilityRoot, 'directory');
      assertManagedPath(compatibilityRoot, artifactRoot, 'directory');
      const artifact = readArtifact(artifactRoot, origin);
      validateCachedArtifactContext(artifact, context);
      return await verifyNativeDriverArtifact(artifact);
    } catch (error) {
      if (origin === 'install-root') {
        throw error;
      }
      quarantineCachedSelection(context.cacheRoot, selectionRoot, selectionPath, error);
    }
  }
  return undefined;
}

function quarantineCachedSelection(cacheRoot: string, selectionRoot: string, selectionPath: string, error: unknown): void {
  try {
    assertManagedPath(selectionRoot, selectionPath, 'file');
  } catch (pathError) {
    if ((pathError as NodeJS.ErrnoException).code === 'ENOENT') {
      return;
    }
    throw pathError;
  }
  const trashRoot = path.join(cacheRoot, 'v1', 'trash');
  fs.mkdirSync(trashRoot, { recursive: true });
  assertManagedPath(cacheRoot, trashRoot, 'directory');
  const quarantineRoot = path.join(trashRoot, `${Date.now()}-${randomUUID()}`);
  fs.mkdirSync(quarantineRoot, { recursive: true });
  assertManagedPath(trashRoot, quarantineRoot, 'directory');
  try {
    fs.renameSync(selectionPath, path.join(quarantineRoot, path.basename(selectionPath)));
  } catch (renameError) {
    if ((renameError as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw renameError;
    }
  }
  atomicWriteJson(path.join(quarantineRoot, 'error.json'), {
    message: error instanceof Error ? error.message : String(error),
    selectionPath,
  });
  process.emitWarning(`Quarantined invalid native driver cache selection "${selectionPath}".`, {
    code: 'FURN_NATIVE_DRIVER_CACHE_INVALID',
  });
}

function readArtifact(artifactRoot: string, origin: NativeDriverArtifactOrigin): NativeDriverArtifact {
  const manifestPath = path.join(artifactRoot, 'artifact.json');
  assertManagedPath(artifactRoot, manifestPath, 'file');
  const manifest = readJsonFile<NativeArtifactManifest>(manifestPath);
  if (manifest.schemaVersion !== 1 || typeof manifest.executable !== 'string') {
    throw new NativeDriverError('integrity-mismatch', `Invalid native driver artifact manifest beneath "${artifactRoot}".`);
  }
  const executablePath = path.resolve(artifactRoot, manifest.executable);
  if (!isWithin(artifactRoot, executablePath)) {
    throw new NativeDriverError('integrity-mismatch', 'Native driver artifact executable escapes its artifact root.');
  }
  assertManagedPath(artifactRoot, executablePath, 'file');
  const { executable: _executable, ...artifact } = manifest;
  return {
    ...artifact,
    artifactRoot,
    executablePath,
    origin,
  };
}

function validateCachedArtifactContext(artifact: NativeDriverArtifact, context: NativeBuildContext): void {
  const endpointsMatch =
    artifact.endpoints.length === context.endpoints.length &&
    context.endpoints.every((endpoint, index) => artifact.endpoints[index] === endpoint);
  if (
    artifact.architecture !== context.architecture ||
    artifact.compatibilityKey !== context.compatibilityKey ||
    artifact.configuration !== context.configuration ||
    !endpointsMatch ||
    artifact.provider !== context.provider ||
    (context.provider === 'macos' &&
      (artifact.signing.mode !== (context.signingIdentity ? 'signed' : 'adhoc') ||
        (context.signingIdentity !== undefined &&
          (artifact.signing.certificateHash !== context.signingIdentity.hash ||
            artifact.signing.identity !== context.signingIdentity.name)))) ||
    artifact.sourceDigest !== context.sourceDigest
  ) {
    throw new NativeDriverError(
      'integrity-mismatch',
      `Native driver artifact "${artifact.artifactId}" does not match the requested build context.`,
    );
  }
}

async function verifyDirectArtifact(
  helperPath: string,
  context: NativeBuildContext,
  origin: NativeDriverArtifactOrigin,
  signal?: AbortSignal,
): Promise<NativeDriverArtifact> {
  const executablePath = fs.realpathSync.native(
    context.provider === 'macos' ? resolveMacOSExecutablePath(helperPath) : path.resolve(helperPath),
  );
  const signing =
    context.provider === 'macos'
      ? await verifyMacOSDriver(
          executablePath,
          context.signingIdentity
            ? {
                certificateHash: context.signingIdentity.hash,
                identity: context.signingIdentity.name,
                mode: 'signed',
              }
            : undefined,
          signal,
        )
      : ({ mode: 'none' } as const);
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
    artifactRoot: context.provider === 'macos' ? macOSBundleForExecutable(executablePath) : path.dirname(executablePath),
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
    signing,
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
    let settled = false;
    const child = spawn(executablePath, ['--handshake', '--json'], {
      signal,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, 10_000);
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.once('error', (error) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        reject(error);
      }
    });
    child.once('close', (code) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      if (timedOut) {
        reject(new NativeDriverError('handshake-timeout', 'Native driver helper did not complete its handshake within 10 seconds.'));
        return;
      }
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

function normalizeSigningIdentity(value?: string): string | undefined {
  const identity = value?.trim();
  return identity || undefined;
}

function isWithin(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function assertManagedPath(root: string, candidate: string, expectedType: 'directory' | 'file'): void {
  const absoluteRoot = path.resolve(root);
  const absoluteCandidate = path.resolve(candidate);
  if (!isWithin(absoluteRoot, absoluteCandidate)) {
    throw new NativeDriverError('integrity-mismatch', `Managed native driver path escapes "${absoluteRoot}".`);
  }
  const relative = path.relative(absoluteRoot, absoluteCandidate);
  let current = absoluteRoot;
  for (const component of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, component);
    if (fs.lstatSync(current).isSymbolicLink()) {
      throw new NativeDriverError('integrity-mismatch', `Managed native driver path contains a symbolic link or junction.`);
    }
  }
  const stat = fs.lstatSync(absoluteCandidate);
  if ((expectedType === 'file' && !stat.isFile()) || (expectedType === 'directory' && !stat.isDirectory())) {
    throw new NativeDriverError('integrity-mismatch', `Managed native driver path is not a ${expectedType}.`);
  }
  const realRoot = fs.realpathSync.native(absoluteRoot);
  const realCandidate = fs.realpathSync.native(absoluteCandidate);
  if (!isWithin(realRoot, realCandidate)) {
    throw new NativeDriverError('integrity-mismatch', `Managed native driver path resolves outside "${realRoot}".`);
  }
}

function artifactCompatibilityRoot(context: NativeBuildContext): string {
  return path.join(context.cacheRoot, 'v1', 'artifacts', `${context.provider}-${context.architecture}`, shortKey(context.compatibilityKey));
}

function isArtifactRoot(compatibilityRoot: string, candidate: string): boolean {
  if (!isWithin(compatibilityRoot, candidate)) {
    return false;
  }
  const relative = path.relative(path.resolve(compatibilityRoot), path.resolve(candidate));
  return relative !== '' && relative.split(path.sep).length === 2;
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
