/**
 * Shared command handlers.
 *
 * The CLI, the loopback test service, and (later) an MCP endpoint all call these functions, so
 * every surface produces the same structured result for the same request.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { availableBackends } from '../driver-host/backends.ts';
import { missingPortableCommands, PORTABLE_COMMANDS, PORTABLE_COMMAND_SURFACES, portableCommandsFor } from '../capabilities.ts';
import { defaultBackendFor, resolveDesktopOptions } from '../config.ts';
import { detectDesktopDriver, installDesktopDriver, isBlockingDriverPrerequisite } from '../drivers.ts';
import { DesktopValidationError } from '../errors.ts';
import { emitGeneratedStorySpec, verifyLinkedSpecTags } from '../storybook/generated-spec.ts';
import { findStoryFiles, generateStoryTestManifest } from '../storybook/manifest.ts';
import { checkMacosPrerequisites } from '../platforms/macos.ts';
import { PACKAGE_VERSION } from '../package-version.ts';
import { DESKTOP_PROTOCOL_VERSION, PORTABLE_COMMAND_MATRIX_VERSION } from '../protocol.ts';
import { StoryController } from '../storybook/controller.ts';
import { checkWindowsPrerequisites } from '../platforms/windows.ts';
import type { DesktopDriverOptions, DesktopPlatform, DesktopPrerequisiteStatus, StoryTestManifest } from '../types.ts';

export { detectDesktopDriver, installDesktopDriver };

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
  /** Directory that receives the generated manifest and spec. */
  outputDirectory: string;
  /** Directories a linked spec may resolve into. Defaults to `storyRoots`. */
  specRoots?: readonly string[];
  packageSpecifier?: string;
}

export interface GenerateStoriesResult {
  manifest: StoryTestManifest;
  manifestPath: string;
  specPath: string;
  problems: readonly string[];
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

  const manifest = generateStoryTestManifest({
    storyFiles: findStoryFiles(storyRoots),
    specRoots: (options.specRoots ?? storyRoots).map((root) => path.resolve(root)),
    generatedSpecPath,
  });

  const problems = verifyLinkedSpecTags(manifest);
  if (problems.length > 0) {
    throw new DesktopValidationError('Invalid linked desktop specs', problems);
  }

  emitGeneratedStorySpec({ manifest, outputPath: generatedSpecPath, manifestPath, packageSpecifier: options.packageSpecifier });
  return { manifest, manifestPath, specPath: generatedSpecPath, problems: [] };
}

/** Lists the stories a running application reports. */
export async function listRunningStories(options: DesktopDriverOptions): Promise<readonly { id: string; title: string; name: string }[]> {
  const resolved = resolveDesktopOptions(options);
  const controller = new StoryController({
    baseUrl: `http://${resolved.storybook.host}:${resolved.storybook.port}`,
    renderTimeout: resolved.storybook.renderTimeout,
  });
  const stories = await controller.listStories();
  return stories.map((entry) => ({ id: entry.id, title: entry.title, name: entry.name }));
}
