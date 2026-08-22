/**
 * WebdriverIO configuration factory.
 *
 * Produces an ordinary WebdriverIO config. Consumers keep their own hooks, reporters, and
 * framework choice; the factory only adds the desktop services, the generated backend
 * capabilities, and a session strategy that keeps one warm session per run.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { buildCapabilities } from './capability-map.ts';
import { DesktopDriverService, type DesktopServiceOptions } from './service.ts';
import { resolveDesktopOptions } from '../config.ts';
import { DesktopValidationError } from '../errors.ts';
import { validateStoryTestManifest } from '../storybook/manifest.ts';
import type { DesktopDriverOptions } from '../types.ts';

/** How specs are distributed across WebdriverIO workers. */
export type DesktopSessionStrategy = 'suite' | 'spec';

export interface DesktopWdioConfigOptions extends DesktopDriverOptions {
  /** Spec globs or paths, resolved relative to `rootDir`. */
  specs: readonly string[];
  exclude?: readonly string[];
  /** Defaults to `mocha`; `jasmine` and `cucumber` work through their normal adapters. */
  framework?: 'mocha' | 'jasmine' | 'cucumber';
  /**
   * `suite` (the default) groups every spec into one ordered array so the run keeps a single warm
   * worker and session. `spec` restores WebdriverIO's per-spec session, which is only safe when
   * each worker gets its own application, ports, and artifact directory.
   */
  sessionStrategy?: DesktopSessionStrategy;
  rootDir?: string;
  reporters?: readonly unknown[];
  mochaOpts?: Record<string, unknown>;
  jasmineOpts?: Record<string, unknown>;
  cucumberOpts?: Record<string, unknown>;
  /** Additional services composed after the desktop services. */
  services?: readonly unknown[];
  /** Hooks are composed, never overwritten. */
  hooks?: Record<string, unknown>;
  /** Default per-test timeout in milliseconds. Defaults to 120000. */
  testTimeout?: number;
  /** Mocha grep expression, used by "run current story" to select exactly one test. */
  grep?: string;
  bail?: number;
  /**
   * Path to the generated `story-tests.manifest.json`, resolved relative to `rootDir`.
   *
   * Its digest is recorded in `run.json` so a CI job can prove that two platforms executed the
   * same story tests. Every platform must therefore read the same manifest, and a manifest that
   * has not been generated is an error rather than a missing field.
   */
  storyManifest?: string;
  /** Explicit spec digest, for a consumer that generates its manifest some other way. */
  specDigest?: string;
}

/**
 * Reads the digest out of a generated story-test manifest.
 *
 * The digest is the portability gate, so an unreadable or malformed manifest fails loudly here
 * rather than silently leaving `run.json.specDigest` undefined.
 */
export function readStoryManifestDigest(manifestPath: string): string {
  let raw: string;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch {
    throw new DesktopValidationError('Invalid desktop WebdriverIO config', [
      `storyManifest "${manifestPath}" does not exist; run \`desktop-driver stories generate\` before the testrunner`,
    ]);
  }
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    throw new DesktopValidationError('Invalid desktop WebdriverIO config', [
      `storyManifest "${manifestPath}" is not valid JSON: ${(error as Error).message}`,
    ]);
  }
  return validateStoryTestManifest(value, manifestPath).digest;
}

/**
 * Guards the shared-spec boundary.
 *
 * A shared spec must not import a platform extension or branch on the platform, so the factory
 * refuses spec patterns that name a platform, which is the cheap half of the portability gate.
 * The other half — rejecting platform imports inside the files — belongs to the repository lint
 * rules described in the README.
 */
const PLATFORM_SPEC_PATTERN = /(^|[./\\-])(windows|macos|win32|darwin)([./\\-]|$)/i;

export function assertSharedSpecs(specs: readonly string[], rootDir = process.cwd()): void {
  const expanded = specs.flatMap((spec) => {
    const matches = fs.globSync(spec, { cwd: rootDir });
    return matches.length > 0 ? matches : [spec];
  });
  const offenders = expanded.filter((spec) => {
    const projectPath = path.isAbsolute(spec) ? path.relative(rootDir, spec) : spec;
    return PLATFORM_SPEC_PATTERN.test(projectPath);
  });
  if (offenders.length > 0) {
    throw new DesktopValidationError(
      'Shared spec globs must not reference platform-specific files',
      offenders.map((spec) => `"${spec}" names a platform; move it into a platform-specific suite`),
    );
  }
}

/** Builds a WebdriverIO config for the desktop driver. */
export function createDesktopWdioConfig(options: DesktopWdioConfigOptions): Record<string, unknown> {
  const resolved = resolveDesktopOptions(options);
  const rootDir = path.resolve(options.rootDir ?? process.cwd());
  const framework = options.framework ?? 'mocha';
  const sessionStrategy = options.sessionStrategy ?? 'suite';
  const testTimeout = options.testTimeout ?? 120_000;

  if (!Array.isArray(options.specs) || options.specs.length === 0) {
    throw new DesktopValidationError('Invalid desktop WebdriverIO config', ['specs must be a non-empty array']);
  }
  assertSharedSpecs(options.specs, rootDir);

  const resolvedSpecs = options.specs.map((spec) => (path.isAbsolute(spec) ? spec : path.join(rootDir, spec)));

  const manifestPath = options.storyManifest
    ? path.isAbsolute(options.storyManifest)
      ? options.storyManifest
      : path.join(rootDir, options.storyManifest)
    : undefined;
  const specDigest = options.specDigest ?? (manifestPath ? readStoryManifestDigest(manifestPath) : undefined);

  // Grouping the specs into one nested array makes WebdriverIO treat them as a single unit of
  // work, which keeps one worker and one warm session for the whole run.
  const specs = sessionStrategy === 'suite' ? [resolvedSpecs] : resolvedSpecs;

  const serviceOptions: DesktopServiceOptions = {
    platform: resolved.platform,
    backend: resolved.backend,
    target: resolved.target,
    host: resolved.host,
    port: options.port,
    startupTimeout: resolved.startupTimeout,
    readiness: resolved.readiness,
    storybook: resolved.storybook,
    artifactsDirectory: resolved.artifactsDirectory,
    backendCapabilities: options.backendCapabilities,
    fakeScene: resolved.fakeScene,
    logLevel: resolved.logLevel,
    specDigest,
  };

  const frameworkOptions: Record<string, unknown> = {};
  if (framework === 'mocha') {
    frameworkOptions.mochaOpts = { ui: 'bdd', timeout: testTimeout, ...(options.grep ? { grep: options.grep } : {}), ...options.mochaOpts };
  } else if (framework === 'jasmine') {
    frameworkOptions.jasmineOpts = { defaultTimeoutInterval: testTimeout, ...options.jasmineOpts };
  } else {
    frameworkOptions.cucumberOpts = { timeout: testTimeout, ...options.cucumberOpts };
  }

  return {
    runner: 'local',
    rootDir,
    specs,
    // Recorded in `run.json` so a CI job can prove both platforms ran the same story tests.
    desktopSpecDigest: specDigest,
    exclude: options.exclude ? options.exclude.map((spec) => (path.isAbsolute(spec) ? spec : path.join(rootDir, spec))) : [],
    // One desktop is one shared resource. Parallelism is only safe once every worker owns an
    // isolated application, endpoint, port set, and artifact directory.
    maxInstances: 1,
    specFileRetries: 0,
    bail: options.bail ?? 0,
    protocol: 'http',
    hostname: resolved.host,
    // Replaced by the launcher once the owned host has an allocated port.
    port: options.port && options.port > 0 ? options.port : 4723,
    path: '/',
    capabilities: [buildCapabilities(resolved)],
    logLevel: resolved.logLevel,
    framework,
    ...frameworkOptions,
    reporters: options.reporters ?? ['spec'],
    services: [[DesktopDriverService, serviceOptions], ...(options.services ?? [])],
    ...options.hooks,
  };
}
