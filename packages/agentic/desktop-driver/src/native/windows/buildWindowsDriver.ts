import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { atomicWriteJson, sha256, throwIfAborted } from '../filesystem.js';
import { NativeDriverError } from '../NativeDriverError.js';
import type { NativeDriverConfiguration } from '../types.js';

export type WindowsToolchain = {
  fingerprint: string;
  msbuildPath: string;
  msbuildVersion: string;
  platformToolset: string;
  sdkVersion: string;
  visualStudioPath: string;
};

export type BuildWindowsDriverOptions = {
  buildId: string;
  configuration: NativeDriverConfiguration;
  packageRoot: string;
  signal?: AbortSignal;
  sourceDigest: string;
  stagingRoot: string;
  toolchain: WindowsToolchain;
};

export type BuildWindowsDriverResult = {
  buildLogPath: string;
  executablePath: string;
};

export async function probeWindowsToolchain(signal?: AbortSignal): Promise<WindowsToolchain> {
  if (process.platform !== 'win32') {
    throw new NativeDriverError('unsupported-host', 'The Windows native driver can only be built on Windows.');
  }
  throwIfAborted(signal);
  const programFilesX86 = process.env['ProgramFiles(x86)'];
  if (!programFilesX86) {
    throw new NativeDriverError('toolchain-missing', 'ProgramFiles(x86) is not available.');
  }
  const vswherePath = path.join(programFilesX86, 'Microsoft Visual Studio', 'Installer', 'vswhere.exe');
  if (!fs.existsSync(vswherePath)) {
    throw new NativeDriverError('toolchain-missing', `Visual Studio Installer was not found at "${vswherePath}".`);
  }
  const visualStudioPath = (
    await runCommand(
      vswherePath,
      ['-latest', '-products', '*', '-requires', 'Microsoft.VisualStudio.Component.VC.Tools.x86.x64', '-property', 'installationPath'],
      signal,
    )
  ).trim();
  if (!visualStudioPath) {
    throw new NativeDriverError('toolchain-missing', 'Visual Studio with the Desktop development with C++ workload was not found.');
  }
  const msbuildCandidates = [
    path.join(visualStudioPath, 'MSBuild', 'Current', 'Bin', 'MSBuild.exe'),
    path.join(visualStudioPath, 'MSBuild', '15.0', 'Bin', 'MSBuild.exe'),
  ];
  const msbuildPath = msbuildCandidates.find((candidate) => fs.existsSync(candidate));
  if (!msbuildPath) {
    throw new NativeDriverError('toolchain-missing', `MSBuild was not found beneath "${visualStudioPath}".`);
  }
  const msbuildVersion = (await runCommand(msbuildPath, ['-version', '-nologo'], signal)).trim().split(/\r?\n/).at(-1) ?? '';
  const platformToolset = fs
    .readdirSync(path.join(visualStudioPath, 'VC', 'Auxiliary', 'Build'), { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^Microsoft\.VCToolsVersion\.v\d+\.default\.txt$/.test(entry.name))
    .map((entry) => entry.name.match(/\.v(\d+)\./)?.[1])
    .filter((value): value is string => value !== undefined)
    .map((value) => `v${value}`)
    .sort((left, right) => Number(left.slice(1)) - Number(right.slice(1)))
    .at(-1);
  if (!platformToolset) {
    throw new NativeDriverError('toolchain-missing', `No MSVC platform toolset was found beneath "${visualStudioPath}".`);
  }
  const sdkRoot = path.join(programFilesX86, 'Windows Kits', '10', 'Include');
  const sdkVersion = fs
    .readdirSync(sdkRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d+\.\d+\.\d+\.\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort(compareVersions)
    .at(-1);
  if (!sdkVersion) {
    throw new NativeDriverError('toolchain-missing', `No Windows SDK was found beneath "${sdkRoot}".`);
  }
  return {
    fingerprint: sha256(JSON.stringify({ msbuildPath, msbuildVersion, platformToolset, sdkVersion, visualStudioPath })),
    msbuildPath,
    msbuildVersion,
    platformToolset,
    sdkVersion,
    visualStudioPath,
  };
}

export async function buildWindowsDriver({
  buildId,
  configuration,
  packageRoot,
  signal,
  sourceDigest,
  stagingRoot,
  toolchain,
}: BuildWindowsDriverOptions): Promise<BuildWindowsDriverResult> {
  throwIfAborted(signal);
  const projectPath = path.join(packageRoot, 'native', 'windows', 'DesktopDriverHost.vcxproj');
  if (!fs.existsSync(projectPath)) {
    throw new NativeDriverError('build-source-missing', `Windows native driver project does not exist at "${projectPath}".`);
  }

  const buildRoot = path.join(stagingRoot, 'build');
  const outputRoot = path.join(stagingRoot, 'output');
  const generatedRoot = path.join(buildRoot, 'generated');
  fs.mkdirSync(generatedRoot, { recursive: true });
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.writeFileSync(
    path.join(generatedRoot, 'build_info.h'),
    [
      '#pragma once',
      `inline constexpr wchar_t FurnDesktopDriverBuildId[] = L"${escapeCppString(buildId)}";`,
      `inline constexpr wchar_t FurnDesktopDriverSourceDigest[] = L"${escapeCppString(sourceDigest)}";`,
      '',
    ].join('\n'),
  );

  const buildLogPath = path.join(stagingRoot, 'build.log');
  const nativeConfiguration = configuration === 'debug' ? 'Debug' : 'Release';
  const output = await runCommand(
    toolchain.msbuildPath,
    [
      projectPath,
      '-nologo',
      '-m',
      '-restore:false',
      `/p:Configuration=${nativeConfiguration}`,
      '/p:Platform=x64',
      `/p:PlatformToolset=${toolchain.platformToolset}`,
      `/p:OutDir=${ensureTrailingSeparator(outputRoot)}`,
      `/p:IntDir=${ensureTrailingSeparator(path.join(buildRoot, 'obj'))}`,
      `/p:FurnGeneratedDir=${ensureTrailingSeparator(generatedRoot)}`,
      `/p:WindowsTargetPlatformVersion=${toolchain.sdkVersion}`,
    ],
    signal,
  ).catch((error) => {
    atomicWriteJson(path.join(stagingRoot, 'build-error.json'), {
      message: error instanceof Error ? error.message : String(error),
      toolchain,
    });
    throw error;
  });
  fs.writeFileSync(buildLogPath, output);

  const executablePath = path.join(outputRoot, 'furn-desktop-driver-host.exe');
  if (!fs.existsSync(executablePath)) {
    throw new NativeDriverError('build-failed', `MSBuild completed without producing "${executablePath}".`);
  }
  return { buildLogPath, executablePath };
}

async function runCommand(command: string, args: readonly string[], signal?: AbortSignal): Promise<string> {
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    const child = spawn(command, [...args], {
      signal,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.once('error', reject);
    child.once('close', (code) => {
      const output = Buffer.concat(stdout).toString('utf8');
      const errorOutput = Buffer.concat(stderr).toString('utf8');
      if (code !== 0) {
        const details = `${output}${errorOutput}`.trim();
        reject(
          new NativeDriverError(
            'build-failed',
            `${path.basename(command)} exited with code ${String(code)}.${details ? `\n${details}` : ''}`,
          ),
        );
        return;
      }
      resolve(`${output}${errorOutput}`);
    });
  });
}

function compareVersions(left: string, right: string): number {
  const leftParts = left.split('.').map(Number);
  const rightParts = right.split('.').map(Number);
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }
  return 0;
}

function ensureTrailingSeparator(value: string): string {
  return value.endsWith(path.sep) ? value : `${value}${path.sep}`;
}

function escapeCppString(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}
