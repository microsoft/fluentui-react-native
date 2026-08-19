/**
 * Shared command handlers.
 *
 * The CLI, the loopback test service, and (later) an MCP endpoint all call these functions, so
 * every surface produces the same structured result for the same request.
 */

import * as path from 'node:path';

import { availableBackends } from '../driver-host/backends.ts';
import { missingPortableCommands, PORTABLE_COMMANDS, PORTABLE_COMMAND_SURFACES, portableCommandsFor } from '../capabilities.ts';
import { defaultBackendFor, resolveDesktopOptions } from '../config.ts';
import { emitGeneratedStorySpec, verifyLinkedSpecTags } from '../storybook/generated-spec.ts';
import { findStoryFiles, generateStoryTestManifest } from '../storybook/manifest.ts';
import { MACOS_PREREQUISITES } from '../platforms/macos.ts';
import { PACKAGE_VERSION } from '../package-version.ts';
import { DESKTOP_PROTOCOL_VERSION, PORTABLE_COMMAND_MATRIX_VERSION } from '../protocol.ts';
import { StoryController } from '../storybook/controller.ts';
import { WINDOWS_PREREQUISITES } from '../platforms/windows.ts';
import type { DesktopDriverOptions, DesktopPlatform, StoryTestManifest } from '../types.ts';

export interface DoctorReport {
  packageVersion: string;
  protocolVersion: number;
  portableCommandMatrixVersion: number;
  node: string;
  os: NodeJS.Platform;
  availableBackends: readonly string[];
  defaultBackend: string;
  portableCommands: readonly { command: string; surface: string; supported: boolean }[];
  prerequisites: readonly { id: string; description: string }[];
  warnings: readonly string[];
}

/** Reports what this machine can run, without starting anything. */
export function doctor(platform: DesktopPlatform): DoctorReport {
  const backends = availableBackends();
  const backend = defaultBackendFor(platform);
  const supported = new Set(portableCommandsFor(backend));
  const warnings: string[] = [];

  if (!backends.includes(backend)) {
    warnings.push(`Backend "${backend}" is not available on ${process.platform}; only ${backends.join(', ')} can be started here.`);
  }
  for (const command of missingPortableCommands(backend)) {
    warnings.push(`Backend "${backend}" does not implement portable command "${command}".`);
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
    prerequisites: platform === 'macos' ? MACOS_PREREQUISITES : platform === 'windows' ? WINDOWS_PREREQUISITES : [],
    warnings,
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

  const manifest = generateStoryTestManifest({
    storyFiles: findStoryFiles(storyRoots),
    specRoots: (options.specRoots ?? storyRoots).map((root) => path.resolve(root)),
    generatedSpecPath,
  });

  emitGeneratedStorySpec({ manifest, outputPath: generatedSpecPath, manifestPath, packageSpecifier: options.packageSpecifier });

  return { manifest, manifestPath, specPath: generatedSpecPath, problems: verifyLinkedSpecTags(manifest) };
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
