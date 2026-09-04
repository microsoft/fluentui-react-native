import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { atomicWriteJson, canonicalJson, listFiles, sha256, throwIfAborted } from '../filesystem.js';
import { NativeDriverError } from '../NativeDriverError.js';
import type { NativeDriverConfiguration, NativeDriverSigning } from '../types.js';

const bundleIdentifier = 'com.microsoft.fluentui-react-native.desktop-driver';
const bundleName = 'FurnDesktopDriverHost.app';
const executableName = 'furn-desktop-driver-host';

export type MacOSToolchain = {
  codesignIdentity: string;
  fingerprint: string;
  macosSdkPath: string;
  macosSdkVersion: string;
  signing: NativeDriverSigning;
  swiftPath: string;
  swiftVersion: string;
  xcodeVersion: string;
};

export type MacOSSigningIdentity = {
  hash: string;
  name: string;
};

export type BuildMacOSDriverOptions = {
  buildId: string;
  configuration: NativeDriverConfiguration;
  packageRoot: string;
  signal?: AbortSignal;
  sourceDigest: string;
  stagingRoot: string;
  toolchain: MacOSToolchain;
};

export type BuildMacOSDriverResult = {
  buildLogPath: string;
  bundlePath: string;
  executablePath: string;
  signing: NativeDriverSigning;
};

type CommandResult = {
  stderr: string;
  stdout: string;
};

export function macOSDriverSourceFiles(sourceRoot: string): string[] {
  const packageManifest = path.join(sourceRoot, 'Package.swift');
  const sourcesRoot = path.join(sourceRoot, 'Sources');
  if (!fs.existsSync(packageManifest) || !fs.statSync(packageManifest).isFile() || !fs.existsSync(sourcesRoot)) {
    throw new NativeDriverError('build-source-missing', `macOS native driver sources are incomplete beneath "${sourceRoot}".`);
  }
  return [
    packageManifest,
    ...(fs.existsSync(path.join(sourceRoot, 'Package.resolved')) ? [path.join(sourceRoot, 'Package.resolved')] : []),
    ...listFiles(sourcesRoot).filter((filePath) => path.extname(filePath) === '.swift'),
  ]
    .map((filePath) => path.relative(sourceRoot, filePath))
    .sort((left, right) => left.localeCompare(right));
}

export function hashMacOSDriverSources(sourceRoot: string): string {
  const entries = macOSDriverSourceFiles(sourceRoot).map((relativePath) => ({
    path: relativePath.replaceAll(path.sep, '/'),
    sha256: sha256(fs.readFileSync(path.join(sourceRoot, relativePath))),
  }));
  return sha256(canonicalJson(entries));
}

export function macOSCodeSignArguments(toolchain: Pick<MacOSToolchain, 'codesignIdentity' | 'signing'>, bundlePath: string): string[] {
  return [
    '--force',
    '--sign',
    toolchain.codesignIdentity,
    '--identifier',
    bundleIdentifier,
    ...(toolchain.signing.mode === 'signed' ? ['--options', 'runtime', '--timestamp'] : ['--timestamp=none']),
    bundlePath,
  ];
}

export function macOSCertificateExtractionArguments(certificatePrefix: string, bundlePath: string): string[] {
  return ['--display', `--extract-certificates=${certificatePrefix}`, bundlePath];
}

export async function probeMacOSToolchain(
  signingIdentity: MacOSSigningIdentity | undefined,
  signal?: AbortSignal,
): Promise<MacOSToolchain> {
  if (process.platform !== 'darwin') {
    throw new NativeDriverError('unsupported-host', 'The macOS native driver can only be built on macOS.');
  }
  if (process.arch !== 'arm64') {
    throw new NativeDriverError('unsupported-host', 'Desktop Driver V1 macOS builds require a native Apple Silicon Node.js process.');
  }
  throwIfAborted(signal);

  const swiftPath = combinedOutput(await runCommand('xcrun', ['--find', 'swift'], signal)).trim();
  const swiftVersion = combinedOutput(await runCommand(swiftPath, ['--version'], signal)).trim();
  const macosSdkPath = combinedOutput(await runCommand('xcrun', ['--sdk', 'macosx', '--show-sdk-path'], signal)).trim();
  const macosSdkVersion = combinedOutput(await runCommand('xcrun', ['--sdk', 'macosx', '--show-sdk-version'], signal)).trim();
  const xcodeVersion = combinedOutput(await runCommand('xcodebuild', ['-version'], signal)).trim();
  const signing: NativeDriverSigning = signingIdentity
    ? { certificateHash: signingIdentity.hash, identity: signingIdentity.name, mode: 'signed' }
    : { mode: 'adhoc' };

  return {
    codesignIdentity: signingIdentity?.hash ?? '-',
    fingerprint: sha256(
      canonicalJson({
        codesignIdentity: signingIdentity?.hash ?? 'adhoc',
        macosSdkPath,
        macosSdkVersion,
        swiftPath,
        swiftVersion,
        xcodeVersion,
      }),
    ),
    macosSdkPath,
    macosSdkVersion,
    signing,
    swiftPath,
    swiftVersion,
    xcodeVersion,
  };
}

export async function buildMacOSDriver({
  buildId,
  configuration,
  packageRoot,
  signal,
  sourceDigest,
  stagingRoot,
  toolchain,
}: BuildMacOSDriverOptions): Promise<BuildMacOSDriverResult> {
  throwIfAborted(signal);
  const sourceRoot = path.join(packageRoot, 'native', 'macos');
  const packageManifest = path.join(sourceRoot, 'Package.swift');
  if (!fs.existsSync(packageManifest)) {
    throw new NativeDriverError('build-source-missing', `macOS native driver package does not exist at "${packageManifest}".`);
  }

  const stagedPackageRoot = path.join(stagingRoot, 'package');
  const scratchRoot = path.join(stagingRoot, 'build');
  const outputRoot = path.join(stagingRoot, 'output');
  for (const relativePath of macOSDriverSourceFiles(sourceRoot)) {
    const destination = path.join(stagedPackageRoot, relativePath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(sourceRoot, relativePath), destination);
  }
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.writeFileSync(
    path.join(stagedPackageRoot, 'Sources', 'DesktopDriverHost', 'GeneratedBuildInfo.swift'),
    [
      'enum FurnBuildInfo {',
      `  static let buildId = "${escapeSwiftString(buildId)}"`,
      `  static let sourceDigest = "${escapeSwiftString(sourceDigest)}"`,
      '}',
      '',
    ].join('\n'),
  );

  const nativeConfiguration = configuration === 'debug' ? 'debug' : 'release';
  const canonicalSourceRoot = '/furn-desktop-driver/native/macos';
  const buildArguments = [
    'build',
    '--package-path',
    stagedPackageRoot,
    '--scratch-path',
    scratchRoot,
    '--configuration',
    nativeConfiguration,
    '--arch',
    'arm64',
    ...(configuration === 'release' ? ['-Xlinker', '-no_uuid'] : []),
    '-Xswiftc',
    '-file-prefix-map',
    '-Xswiftc',
    `${stagedPackageRoot}=${canonicalSourceRoot}`,
    '-Xswiftc',
    '-debug-prefix-map',
    '-Xswiftc',
    `${stagedPackageRoot}=${canonicalSourceRoot}`,
    '-Xswiftc',
    '-debug-prefix-map',
    '-Xswiftc',
    `${scratchRoot}=/furn-desktop-driver/build`,
  ];
  const buildLogPath = path.join(stagingRoot, 'build.log');
  const output = await runCommand(toolchain.swiftPath, buildArguments, signal).catch((error) => {
    atomicWriteJson(path.join(stagingRoot, 'build-error.json'), {
      message: error instanceof Error ? error.message : String(error),
      toolchain,
    });
    throw error;
  });
  fs.writeFileSync(buildLogPath, combinedOutput(output));

  const binPathResult = await runCommand(toolchain.swiftPath, [...buildArguments, '--show-bin-path'], signal);
  const binPath = binPathResult.stdout.trim();
  if (!binPath) {
    throw new NativeDriverError(
      'build-failed',
      `SwiftPM did not report its binary output path.${binPathResult.stderr.trim() ? `\n${binPathResult.stderr.trim()}` : ''}`,
    );
  }
  const builtExecutable = path.join(binPath, executableName);
  if (!fs.existsSync(builtExecutable)) {
    throw new NativeDriverError('build-failed', `SwiftPM completed without producing "${builtExecutable}".`);
  }

  const bundlePath = path.join(outputRoot, bundleName);
  const contentsPath = path.join(bundlePath, 'Contents');
  const executablePath = path.join(contentsPath, 'MacOS', executableName);
  fs.mkdirSync(path.dirname(executablePath), { recursive: true });
  fs.copyFileSync(builtExecutable, executablePath);
  fs.chmodSync(executablePath, 0o755);
  if (configuration === 'release') {
    await runCommand('xcrun', ['strip', '-S', '-x', executablePath], signal);
  }
  fs.writeFileSync(path.join(contentsPath, 'Info.plist'), makeInfoPlist());

  if (toolchain.signing.mode === 'adhoc') {
    process.emitWarning(
      'The macOS native Desktop Driver helper is using an ad hoc signature. Configure a stable signing identity for durable TCC permissions.',
      { code: 'FURN_MACOS_ADHOC_SIGNING' },
    );
  }
  await runCommand('codesign', macOSCodeSignArguments(toolchain, bundlePath), signal);
  const verifiedSigning = await verifyMacOSDriver(executablePath, toolchain.signing, signal);
  return {
    buildLogPath,
    bundlePath,
    executablePath,
    signing: verifiedSigning,
  };
}

export async function verifyMacOSDriver(
  executablePath: string,
  expectedSigning?: NativeDriverSigning,
  signal?: AbortSignal,
): Promise<NativeDriverSigning> {
  const bundlePath = macOSBundleForExecutable(executablePath);
  await runCommand('codesign', ['--verify', '--strict', '--verbose=2', bundlePath], signal);
  const details = combinedOutput(await runCommand('codesign', ['--display', '--verbose=4', bundlePath], signal));
  const identifier = readCodeSignValue(details, 'Identifier');
  if (identifier !== bundleIdentifier) {
    throw new NativeDriverError(
      'signature-mismatch',
      `macOS native driver bundle identifier "${identifier ?? 'unknown'}" does not match "${bundleIdentifier}".`,
    );
  }
  const adhoc = readCodeSignValue(details, 'Signature') === 'adhoc';
  const mode: NativeDriverSigning['mode'] = adhoc ? 'adhoc' : 'signed';
  if (mode === 'signed') {
    if (!/^CodeDirectory .*\bflags=.*\bruntime\b/m.test(details)) {
      throw new NativeDriverError('signature-mismatch', 'The signed macOS native driver does not enable Hardened Runtime.');
    }
    if (!readCodeSignValue(details, 'Timestamp')) {
      throw new NativeDriverError('signature-mismatch', 'The signed macOS native driver does not contain a secure timestamp.');
    }
  }
  const identity = details.match(/^Authority=(.+)$/m)?.[1];
  const teamId = readCodeSignValue(details, 'TeamIdentifier');
  const certificateHash = mode === 'signed' ? await extractSigningCertificateHash(bundlePath, signal) : undefined;
  const designatedRequirement = await readDesignatedRequirement(bundlePath, signal);
  const signing: NativeDriverSigning = {
    ...(certificateHash ? { certificateHash } : {}),
    designatedRequirement,
    ...(identity ? { identity } : {}),
    mode,
    ...(teamId && teamId !== 'not set' ? { teamId } : {}),
  };
  if (expectedSigning) {
    if (expectedSigning.mode !== signing.mode) {
      throw new NativeDriverError(
        'signature-mismatch',
        `macOS native driver signature mode "${signing.mode}" does not match "${expectedSigning.mode}".`,
      );
    }
    if (expectedSigning.mode === 'signed' && !expectedSigning.certificateHash) {
      throw new NativeDriverError('signature-mismatch', 'The expected macOS signing metadata does not identify its leaf certificate.');
    }
    for (const field of ['certificateHash', 'designatedRequirement', 'identity', 'teamId'] as const) {
      if (expectedSigning[field] !== undefined && expectedSigning[field] !== signing[field]) {
        throw new NativeDriverError(
          'signature-mismatch',
          `macOS native driver signer ${field} "${signing[field] ?? 'unknown'}" does not match "${expectedSigning[field]}".`,
        );
      }
    }
  }
  return signing;
}

export function resolveMacOSExecutablePath(helperPath: string): string {
  const resolvedPath = path.resolve(helperPath);
  if (path.extname(resolvedPath).toLowerCase() !== '.app') {
    return resolvedPath;
  }
  return path.join(resolvedPath, 'Contents', 'MacOS', executableName);
}

export function macOSBundleForExecutable(executablePath: string): string {
  const resolvedPath = path.resolve(executablePath);
  const macosDirectory = path.dirname(resolvedPath);
  const contentsDirectory = path.dirname(macosDirectory);
  const bundlePath = path.dirname(contentsDirectory);
  if (
    path.basename(macosDirectory) !== 'MacOS' ||
    path.basename(contentsDirectory) !== 'Contents' ||
    path.extname(bundlePath).toLowerCase() !== '.app'
  ) {
    throw new NativeDriverError('signature-mismatch', `macOS native driver executable is not contained in an application bundle.`);
  }
  return bundlePath;
}

export async function resolveMacOSSigningIdentity(
  configuredIdentity: string | undefined,
  signal?: AbortSignal,
): Promise<MacOSSigningIdentity | undefined> {
  const identity = configuredIdentity?.trim();
  if (!identity) {
    return undefined;
  }
  const output = combinedOutput(await runCommand('security', ['find-identity', '-v', '-p', 'codesigning'], signal));
  const identities = parseMacOSSigningIdentities(output);
  const selected = identities.find((candidate) => candidate.hash === identity.toUpperCase() || candidate.name === identity);
  if (!selected) {
    throw new NativeDriverError('signing-identity-missing', `The macOS code-signing identity "${identity}" is not available.`);
  }
  return selected;
}

export function parseMacOSSigningIdentities(output: string): MacOSSigningIdentity[] {
  return [...output.matchAll(/^\s*\d+\)\s+([0-9A-F]{40})\s+"([^"]+)"(?:\s+\([^)]*\))?$/gm)].map((match) => ({
    hash: match[1],
    name: match[2],
  }));
}

async function extractSigningCertificateHash(bundlePath: string, signal?: AbortSignal): Promise<string> {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-driver-certificate-'));
  const certificatePrefix = path.join(temporaryRoot, 'certificate');
  try {
    await runCommand('codesign', macOSCertificateExtractionArguments(certificatePrefix, bundlePath), signal);
    const certificatePath = `${certificatePrefix}0`;
    if (!fs.existsSync(certificatePath)) {
      throw new NativeDriverError('signature-mismatch', 'macOS native driver signature does not contain a leaf certificate.');
    }
    return createHash('sha1').update(fs.readFileSync(certificatePath)).digest('hex').toUpperCase();
  } finally {
    fs.rmSync(temporaryRoot, { force: true, recursive: true });
  }
}

async function readDesignatedRequirement(bundlePath: string, signal?: AbortSignal): Promise<string> {
  const output = combinedOutput(await runCommand('codesign', ['--display', '-r-', bundlePath], signal));
  const requirement = output.match(/^(?:# )?designated => (.+)$/m)?.[1]?.trim();
  if (!requirement) {
    throw new NativeDriverError('signature-mismatch', 'macOS native driver signature does not contain a designated requirement.');
  }
  return requirement;
}

function readCodeSignValue(output: string, key: string): string | undefined {
  return output.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1];
}

function combinedOutput(result: CommandResult): string {
  return `${result.stdout}${result.stderr}`;
}

async function runCommand(command: string, args: readonly string[], signal?: AbortSignal): Promise<CommandResult> {
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    let settled = false;
    const child = spawn(command, [...args], {
      signal,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let timedOut = false;
    const timeout = setTimeout(
      () => {
        timedOut = true;
        child.kill();
      },
      30 * 60 * 1000,
    );
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
      const output = Buffer.concat(stdout).toString('utf8');
      const errorOutput = Buffer.concat(stderr).toString('utf8');
      if (timedOut) {
        reject(new NativeDriverError('build-timeout', `${path.basename(command)} exceeded the 30-minute build deadline.`));
        return;
      }
      if (code !== 0) {
        const details = `${output}${errorOutput}`.trim();
        reject(
          new NativeDriverError(
            command === 'codesign' ? 'signing-failed' : 'build-failed',
            `${path.basename(command)} exited with code ${String(code)}.${details ? `\n${details}` : ''}`,
          ),
        );
        return;
      }
      resolve({ stderr: errorOutput, stdout: output });
    });
  });
}

function makeInfoPlist(): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    '<dict>',
    '  <key>CFBundleDevelopmentRegion</key>',
    '  <string>en</string>',
    '  <key>CFBundleExecutable</key>',
    `  <string>${executableName}</string>`,
    '  <key>CFBundleIdentifier</key>',
    `  <string>${bundleIdentifier}</string>`,
    '  <key>CFBundleInfoDictionaryVersion</key>',
    '  <string>6.0</string>',
    '  <key>CFBundleName</key>',
    '  <string>Furn Desktop Driver Host</string>',
    '  <key>CFBundlePackageType</key>',
    '  <string>APPL</string>',
    '  <key>CFBundleShortVersionString</key>',
    '  <string>1.0</string>',
    '  <key>CFBundleVersion</key>',
    '  <string>1</string>',
    '  <key>LSMinimumSystemVersion</key>',
    '  <string>14.0</string>',
    '  <key>LSUIElement</key>',
    '  <true/>',
    '</dict>',
    '</plist>',
    '',
  ].join('\n');
}

function escapeSwiftString(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}
