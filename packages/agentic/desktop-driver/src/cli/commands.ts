/**
 * Shared command handlers.
 *
 * The CLI, the loopback test service, and (later) an MCP endpoint all call these functions, so
 * every surface produces the same structured result for the same request.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { availableBackends } from '../server/webdriver/backends.ts';
import { missingPortableCommands, PORTABLE_COMMANDS, PORTABLE_COMMAND_SURFACES, portableCommandsFor } from '../capabilities.ts';
import { DEFAULT_RENDER_TIMEOUT, DEFAULT_STORYBOOK_PORT, defaultBackendFor } from '../config.ts';
import { detectDesktopDriver, isBlockingDriverPrerequisite, verifyDesktopDriver } from '../drivers.ts';
import { DesktopDriverError, DesktopValidationError } from '../errors.ts';
import { emitGeneratedStorySpec, verifyLinkedSpecTags } from '../storybook/generated-spec.ts';
import { digestEntries, findStoryFiles, generateStoryTestManifest } from '../storybook/manifest.ts';
import { checkMacosPrerequisites } from '../platforms/macos.ts';
import { hostForUrl } from '../net.ts';
import { isLoopbackHost } from '../core/loopback.ts';
import { PACKAGE_VERSION } from '../package-version.ts';
import { DESKTOP_PROTOCOL_VERSION, PORTABLE_COMMAND_MATRIX_VERSION } from '../protocol/versions.ts';
import { StoryController } from '../server/channel/client.ts';
import { checkWindowsPrerequisites } from '../platforms/windows.ts';
import type { DesktopPlatform, DesktopPrerequisiteStatus, StoryTestManifest } from '../types.ts';

export { detectDesktopDriver, verifyDesktopDriver };

export interface DoctorReport {
  packageVersion: string;
  protocolVersion: number;
  portableCommandMatrixVersion: number;
  node: string;
  os: NodeJS.Platform;
  availableBackends: readonly string[];
  defaultBackend: string;
  portableCommands: readonly { command: string; surface: string; supported: boolean }[];
  prerequisites: readonly DesktopPrerequisiteStatus[];
  warnings: readonly string[];
  ready: boolean;
}

/** Reports what this machine can run, without starting anything. */
export function doctor(platform: DesktopPlatform): DoctorReport {
  const backends = availableBackends();
  const backend = defaultBackendFor(platform);
  const supported = new Set(portableCommandsFor(backend));
  const warnings: string[] = [];
  let ready = true;

  if (!backends.includes(backend)) {
    warnings.push(`Backend "${backend}" is not available on ${process.platform}; only ${backends.join(', ')} can be started here.`);
    ready = false;
  }
  for (const command of missingPortableCommands(backend)) {
    warnings.push(`Backend "${backend}" does not implement portable command "${command}".`);
  }

  const prerequisites = platform === 'macos' ? checkMacosPrerequisites() : platform === 'windows' ? checkWindowsPrerequisites() : [];
  for (const prerequisite of prerequisites.filter((entry) => entry.status === 'missing')) {
    warnings.push(`Prerequisite "${prerequisite.id}" is not satisfied: ${prerequisite.description}.`);
    if (isBlockingDriverPrerequisite(platform, prerequisite.id)) {
      ready = false;
    }
  }

  return {
    packageVersion: PACKAGE_VERSION,
    protocolVersion: DESKTOP_PROTOCOL_VERSION,
    portableCommandMatrixVersion: PORTABLE_COMMAND_MATRIX_VERSION,
    node: process.version,
    os: process.platform,
    availableBackends: backends,
    defaultBackend: backend,
    portableCommands: PORTABLE_COMMANDS.map((command) => ({
      command,
      surface: PORTABLE_COMMAND_SURFACES[command],
      supported: supported.has(command),
    })),
    prerequisites,
    warnings,
    ready,
  };
}

export interface GenerateStoriesOptions {
  /** Directories scanned for `*.stories.tsx`. */
  storyRoots: readonly string[];
  /** Exact story files supplied by a project config. */
  storyFiles?: readonly string[];
  /** Directory that receives the generated manifest and spec. */
  outputDirectory: string;
  /** Directories a linked spec may resolve into. Defaults to `storyRoots`. */
  specRoots?: readonly string[];
  packageSpecifier?: string;
  additionalOutputPaths?: readonly string[];
  additionalOutputs?: (manifest: StoryTestManifest) => readonly { path: string; contents: string | Uint8Array }[];
  configDigest?: string;
}

export interface GenerateStoriesResult {
  manifest: StoryTestManifest;
  manifestPath: string;
  specPath: string;
  problems: readonly string[];
}

export interface StorybookConnectionOptions {
  host?: string;
  port?: number;
  renderTimeout?: number;
  fetchImpl?: typeof fetch;
}

/** Scans story modules and writes the manifest plus the compiled inline-plan spec. */
export function generateStories(options: GenerateStoriesOptions): GenerateStoriesResult {
  const storyRoots = options.storyRoots.map((root) => path.resolve(root));
  const outputDirectory = path.resolve(options.outputDirectory);
  const generatedSpecPath = path.join(outputDirectory, 'story-plans.generated.spec.ts');
  const manifestPath = path.join(outputDirectory, 'story-tests.manifest.json');
  // Remove stale outputs before validation so a failed generation cannot leave an older runnable
  // manifest looking current.
  fs.rmSync(generatedSpecPath, { force: true });
  fs.rmSync(manifestPath, { force: true });
  for (const output of options.additionalOutputPaths ?? []) {
    fs.rmSync(path.resolve(output), { force: true });
  }

  const manifest = generateStoryTestManifest({
    storyFiles: options.storyFiles ?? findStoryFiles(storyRoots),
    specRoots: (options.specRoots ?? storyRoots).map((root) => path.resolve(root)),
    generatedSpecPath,
  });

  const problems = verifyLinkedSpecTags(manifest);
  if (problems.length > 0) {
    throw new DesktopValidationError('Invalid linked desktop specs', problems);
  }

  const portableManifest: StoryTestManifest = {
    ...manifest,
    configDigest: options.configDigest,
    entries: manifest.entries.map((entry) => ({
      ...entry,
      spec: path.relative(outputDirectory, entry.spec).replaceAll(path.sep, '/'),
      storyPath: path.relative(outputDirectory, entry.storyPath).replaceAll(path.sep, '/'),
    })),
  };
  portableManifest.digest = digestEntries(portableManifest.entries, outputDirectory, portableManifest.configDigest);
  const additionalFiles = options.additionalOutputs?.(portableManifest) ?? [];
  emitGeneratedStorySpec({
    manifest: portableManifest,
    outputPath: generatedSpecPath,
    manifestPath,
    packageSpecifier: options.packageSpecifier,
    additionalFiles,
  });
  return { manifest: portableManifest, manifestPath, specPath: generatedSpecPath, problems: [] };
}

/** Lists the stories a running application reports. */
export async function listRunningStories(
  options: StorybookConnectionOptions = {},
): Promise<readonly { id: string; title: string; name: string }[]> {
  const controller = storyController(options);
  const stories = await controller.listStories();
  return stories.map((entry) => ({ id: entry.id, title: entry.title, name: entry.name }));
}

/** Selects one story and waits for its rendered acknowledgement. */
export async function selectRunningStory(
  options: StorybookConnectionOptions,
  storyId: string,
): Promise<{ storyId: string; rendered: true }> {
  if (!storyId) {
    throw new DesktopValidationError('Invalid Storybook command', ['storyId is required']);
  }
  await storyController(options).select(storyId);
  return { storyId, rendered: true };
}

/** Updates controls for one running story. */
export async function updateRunningStoryArgs(
  options: StorybookConnectionOptions,
  storyId: string,
  updatedArgs: Record<string, unknown>,
): Promise<{ storyId: string; updated: true }> {
  if (!storyId) {
    throw new DesktopValidationError('Invalid Storybook command', ['storyId is required']);
  }
  await storyController(options).updateArgs(storyId, updatedArgs);
  return { storyId, updated: true };
}

/** Selects every indexed story serially and reports all render failures. */
export async function smokeRunningStories(options: StorybookConnectionOptions): Promise<{ success: true; stories: number }> {
  const controller = storyController(options);
  const stories = await controller.listStories();
  const failures: { storyId: string; message: string }[] = [];
  for (const story of stories) {
    try {
      await controller.select(story.id);
    } catch (error) {
      failures.push({ storyId: story.id, message: error instanceof Error ? error.message : String(error) });
    }
  }
  if (failures.length > 0) {
    throw new DesktopDriverError(`${failures.length} of ${stories.length} stories failed to render`, {
      kind: 'storybook',
      detail: { failures },
    });
  }
  return { success: true, stories: stories.length };
}

function storyController(options: StorybookConnectionOptions): StoryController {
  const host = options.host ?? '127.0.0.1';
  const port = options.port ?? DEFAULT_STORYBOOK_PORT;
  const renderTimeout = options.renderTimeout ?? DEFAULT_RENDER_TIMEOUT;
  if (!isLoopbackHost(host)) {
    throw new DesktopValidationError('Invalid Storybook connection', ['host must be a loopback address']);
  }
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new DesktopValidationError('Invalid Storybook connection', ['port must be an integer between 1 and 65535']);
  }
  const controller = new StoryController({
    baseUrl: `http://${hostForUrl(host)}:${port}`,
    renderTimeout,
    fetchImpl: options.fetchImpl,
  });
  return controller;
}
