import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createJiti } from 'jiti';

import { DEFAULT_RENDER_TIMEOUT, DEFAULT_STORYBOOK_PORT, resolveDesktopOptions } from '../config.ts';
import { DesktopValidationError } from '../errors.ts';
import { isInlinePlan, planTestIds } from '../story-plan.ts';
import { validateStoryTestManifest } from '../storybook/manifest.ts';
import { DESKTOP_PROTOCOL_VERSION } from '../protocol/index.ts';
import type {
  DesktopAppTarget,
  DesktopDriverOptions,
  DesktopPlatform,
  ResolvedDesktopDriverOptions,
  DesktopFakeScene,
  StoryTestManifest,
} from '../types.ts';
import { DESKTOP_CONFIG_SCHEMA_VERSION, type DesktopProjectConfig, type DesktopStorySource } from './schema.ts';

export interface ResolvedDesktopStorySource extends DesktopStorySource {
  directory: string;
}

export interface ResolvedDesktopProject {
  configFile: string;
  rootDir: string;
  platform: DesktopPlatform;
  applicationManifest: Readonly<Record<string, unknown>>;
  storybook: {
    configDir: string;
    stories: readonly ResolvedDesktopStorySource[];
    channel: { host: string; port: number; mcp: boolean };
  };
  tests: {
    generatedDirectory: string;
    manifestPath: string;
    generatedSpecPath: string;
    runtimePath: string;
    fakeScene?: string;
    artifactsDirectory: string;
    framework: 'mocha' | 'jasmine' | 'cucumber';
    sessionStrategy: 'suite' | 'spec';
    timeoutMs: number;
    runner: { command: string; args: readonly string[]; cwd: string; timeoutMs: number; resultsDirectory: string };
  };
  driver: ResolvedDesktopDriverOptions;
  storyFilter?: string;
}

export interface LoadDesktopConfigOptions {
  platform?: DesktopPlatform;
  env?: Readonly<Record<string, string | undefined>>;
}

export type DesktopProjectWdioOptions = ResolvedDesktopDriverOptions & {
  rootDir: string;
  framework: 'mocha' | 'jasmine' | 'cucumber';
  sessionStrategy: 'suite' | 'spec';
  testTimeout: number;
  specs: readonly string[];
  storyManifest: string;
  artifactsDirectory: string;
  grep?: string;
  reporters: readonly string[];
};

const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', 'localhost']);

function requiredObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new DesktopValidationError('Invalid desktop project config', [`${label} must be an object`]);
  }
  return value as Record<string, unknown>;
}

function readJson(file: string, label: string): Record<string, unknown> {
  try {
    return requiredObject(JSON.parse(fs.readFileSync(file, 'utf8')), label);
  } catch (error) {
    if (error instanceof DesktopValidationError) {
      throw error;
    }
    throw new DesktopValidationError('Invalid desktop project config', [`${label} "${file}": ${(error as Error).message}`]);
  }
}

function readManifestValue(manifest: Readonly<Record<string, unknown>>, dottedPath?: string): string | undefined {
  let value: unknown = manifest;
  for (const segment of dottedPath?.split('.') ?? []) {
    value = typeof value === 'object' && value !== null ? (value as Record<string, unknown>)[segment] : undefined;
  }
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function environmentName(
  config: DesktopProjectConfig,
  key: keyof NonNullable<DesktopProjectConfig['environment']>,
  fallback: string,
): string {
  return config.environment?.[key] ?? fallback;
}

function environmentValue(
  config: DesktopProjectConfig,
  env: Readonly<Record<string, string | undefined>>,
  key: keyof NonNullable<DesktopProjectConfig['environment']>,
  fallbackName: string,
): string | undefined {
  return env[environmentName(config, key, fallbackName)];
}

function parsePlatform(config: DesktopProjectConfig, options: LoadDesktopConfigOptions): DesktopPlatform {
  const value = options.platform ?? environmentValue(config, options.env ?? process.env, 'platform', 'DESKTOP_TEST_PLATFORM') ?? 'fake';
  if (value !== 'fake' && value !== 'macos' && value !== 'windows') {
    throw new DesktopValidationError('Invalid desktop project config', [`platform "${value}" must be fake, macos, or windows`]);
  }
  return value;
}

function resolveTarget(
  config: DesktopProjectConfig,
  platform: DesktopPlatform,
  applicationManifest: Readonly<Record<string, unknown>>,
  env: Readonly<Record<string, string | undefined>>,
): DesktopAppTarget {
  const launchApp = environmentValue(config, env, 'launchApp', 'DESKTOP_TEST_APP');
  if (launchApp) {
    return { mode: 'launch', app: launchApp };
  }

  const platformConfig = config.platforms[platform];
  if (!platformConfig) {
    throw new DesktopValidationError('Invalid desktop project config', [`platforms.${platform} is required`]);
  }
  const configured = platformConfig.target.attach;
  const identity =
    environmentValue(config, env, 'identity', 'DESKTOP_TEST_IDENTITY') ??
    configured.identity ??
    readManifestValue(applicationManifest, configured.identityFromApplicationManifest);
  const title =
    environmentValue(config, env, 'windowTitle', 'DESKTOP_TEST_WINDOW_TITLE') ??
    configured.title ??
    readManifestValue(applicationManifest, configured.titleFromApplicationManifest);
  const processIdValue = environmentValue(config, env, 'processId', 'DESKTOP_TEST_PID');
  const processId = processIdValue === undefined ? undefined : Number(processIdValue);
  const windowHandle = environmentValue(config, env, 'windowHandle', 'DESKTOP_TEST_WINDOW');
  return { mode: 'attach', identity, processId, windowHandle, title };
}

function validateConfig(config: DesktopProjectConfig): void {
  const issues: string[] = [];
  if (config.schemaVersion !== DESKTOP_CONFIG_SCHEMA_VERSION) {
    issues.push(`schemaVersion must be ${DESKTOP_CONFIG_SCHEMA_VERSION}`);
  }
  if (!config.application?.manifest) {
    issues.push('application.manifest is required');
  }
  if (!config.storybook?.configDir) {
    issues.push('storybook.configDir is required');
  }
  if (!Array.isArray(config.storybook?.stories) || config.storybook.stories.length === 0) {
    issues.push('storybook.stories must be a non-empty array');
  }
  if (!config.tests?.generatedDirectory || !config.tests.artifactsDirectory || !config.tests.runner?.command) {
    issues.push('tests.generatedDirectory, tests.artifactsDirectory, and tests.runner.command are required');
  }
  if (issues.length > 0) {
    throw new DesktopValidationError('Invalid desktop project config', issues);
  }
}

function resolveConfigFile(input?: string | URL): string {
  if (input instanceof URL) {
    return fileURLToPath(input);
  }
  const file = path.resolve(input ?? 'desktop.config.ts');
  if (!fs.existsSync(file)) {
    throw new DesktopValidationError('Missing desktop project config', [
      `${file} does not exist; pass --config or create desktop.config.ts`,
    ]);
  }
  return file;
}

/** Loads and resolves one explicit desktop project configuration. */
export function loadDesktopConfig(input?: string | URL, options: LoadDesktopConfigOptions = {}): ResolvedDesktopProject {
  const configFile = resolveConfigFile(input);
  const extension = path.extname(configFile);
  const loaded = extension === '.json' ? readJson(configFile, 'config') : createJiti(configFile, { interopDefault: true })(configFile);
  const config = ((loaded as { default?: unknown }).default ?? loaded) as DesktopProjectConfig;
  validateConfig(config);

  const configDirectory = path.dirname(configFile);
  const rootDir = path.resolve(configDirectory, config.rootDir ?? '.');
  const applicationManifestPath = path.resolve(rootDir, config.application.manifest);
  const applicationManifest = readJson(applicationManifestPath, 'application.manifest');
  const env = options.env ?? process.env;
  const platform = parsePlatform(config, options);
  const platformConfig = config.platforms[platform];
  if (!platformConfig) {
    throw new DesktopValidationError('Invalid desktop project config', [`platforms.${platform} is required`]);
  }
  const channelHost = config.storybook.channel?.host ?? '127.0.0.1';
  if (!LOOPBACK_HOSTS.has(channelHost)) {
    throw new DesktopValidationError('Invalid desktop project config', ['storybook.channel.host must be a loopback address']);
  }
  const channelPort = config.storybook.channel?.port ?? DEFAULT_STORYBOOK_PORT;
  const generatedDirectory = path.resolve(rootDir, config.tests.generatedDirectory);
  const readiness = { ...config.base?.readiness, ...platformConfig.readiness };
  const requireTestId = readiness.requireTestId === null ? undefined : (readiness.requireTestId ?? config.application.readyTestId);
  const target = resolveTarget(config, platform, applicationManifest, env);
  const logLevel =
    (environmentValue(config, env, 'logLevel', 'DESKTOP_TEST_LOG_LEVEL') as DesktopDriverOptions['logLevel']) ??
    config.base?.driverHost?.logLevel ??
    'warn';

  const driverOptions: DesktopDriverOptions = {
    platform,
    backend: platformConfig.backend,
    target,
    host: config.base?.driverHost?.host,
    port: config.base?.driverHost?.port,
    startupTimeout: config.base?.driverHost?.startupTimeoutMs,
    readiness: {
      requireWindow: readiness.requireWindow,
      requireStorybookChannel: readiness.requireStorybookChannel,
      requireTestId,
      timeout: readiness.timeout,
    },
    storybook: {
      host: channelHost,
      port: channelPort,
      renderTimeout: DEFAULT_RENDER_TIMEOUT,
    },
    artifactsDirectory: path.resolve(rootDir, config.tests.artifactsDirectory),
    fakeScene: config.tests.fakeScene ? path.resolve(rootDir, config.tests.fakeScene) : undefined,
    logLevel,
  };
  return {
    configFile,
    rootDir,
    platform,
    applicationManifest,
    storybook: {
      configDir: path.resolve(rootDir, config.storybook.configDir),
      stories: config.storybook.stories.map((entry) => ({ ...entry, directory: path.resolve(rootDir, entry.directory) })),
      channel: { host: channelHost, port: channelPort, mcp: config.storybook.channel?.mcp ?? true },
    },
    tests: {
      generatedDirectory,
      manifestPath: path.join(generatedDirectory, 'story-tests.manifest.json'),
      generatedSpecPath: path.join(generatedDirectory, 'story-plans.generated.spec.ts'),
      runtimePath: path.join(generatedDirectory, 'desktop-runtime.generated.ts'),
      fakeScene: config.tests.fakeScene ? path.resolve(rootDir, config.tests.fakeScene) : undefined,
      artifactsDirectory: path.resolve(rootDir, config.tests.artifactsDirectory),
      framework: config.tests.framework ?? 'mocha',
      sessionStrategy: config.tests.sessionStrategy ?? 'suite',
      timeoutMs: config.tests.timeoutMs ?? 120_000,
      runner: {
        command: config.tests.runner.command,
        args: config.tests.runner.args ?? ['wdio', 'run', 'wdio.conf.ts'],
        cwd: path.resolve(rootDir, config.tests.runner.cwd ?? '.'),
        timeoutMs: config.tests.runner.timeoutMs ?? 900_000,
        resultsDirectory: path.resolve(rootDir, config.tests.artifactsDirectory),
      },
    },
    driver: resolveDesktopOptions(driverOptions),
    storyFilter: environmentValue(config, env, 'storyFilter', 'DESKTOP_TEST_GREP'),
  };
}

/** Loads the generated manifest and returns exact WDIO specs for the selected project. */
export function loadProjectManifest(project: ResolvedDesktopProject): StoryTestManifest {
  let value: unknown;
  try {
    value = JSON.parse(fs.readFileSync(project.tests.manifestPath, 'utf8'));
  } catch (error) {
    throw new DesktopValidationError('Missing generated story-test manifest', [
      `${project.tests.manifestPath}: ${(error as Error).message}; run desktop-driver stories generate first`,
    ]);
  }
  return validateStoryTestManifest(value, project.tests.manifestPath);
}

/** Projects a resolved project into the existing WebdriverIO factory contract. */
export function toDesktopWdioOptions(project: ResolvedDesktopProject): DesktopProjectWdioOptions {
  const manifest = loadProjectManifest(project);
  return {
    ...project.driver,
    rootDir: project.rootDir,
    framework: project.tests.framework,
    sessionStrategy: project.tests.sessionStrategy,
    testTimeout: project.tests.timeoutMs,
    specs: [...new Set(manifest.entries.map((entry) => entry.spec))],
    storyManifest: project.tests.manifestPath,
    artifactsDirectory: project.tests.artifactsDirectory,
    grep: project.storyFilter,
    reporters: ['spec'],
  };
}

/** Writes the only project data allowed into the React Native bundle. */
export function writeDesktopRuntime(project: ResolvedDesktopProject, manifest: StoryTestManifest): string {
  validateFakeScene(project, manifest);
  const contents = `export const desktopRuntime = ${JSON.stringify(
    {
      protocolVersion: DESKTOP_PROTOCOL_VERSION,
      channel: {
        host: project.storybook.channel.host,
        port: project.storybook.channel.port,
      },
      manifestDigest: manifest.digest,
      testedStoryIds: manifest.entries.map((entry) => entry.storyId),
    },
    null,
    2,
  )} as const;\n`;
  fs.mkdirSync(path.dirname(project.tests.runtimePath), { recursive: true });
  fs.writeFileSync(project.tests.runtimePath, contents, 'utf8');
  return project.tests.runtimePath;
}

function validateFakeScene(project: ResolvedDesktopProject, manifest: StoryTestManifest): void {
  if (!project.tests.fakeScene) {
    return;
  }
  const scene = readJson(project.tests.fakeScene, 'tests.fakeScene') as unknown as DesktopFakeScene;
  const problems: string[] = [];
  for (const entry of manifest.entries) {
    if (!isInlinePlan(entry.plan)) {
      continue;
    }
    const available = new Set(scene.stories?.[entry.storyId]?.elements?.map((element) => element.testId) ?? []);
    for (const testId of planTestIds(entry.plan)) {
      if (!available.has(testId)) {
        problems.push(`${entry.storyId} references testId "${testId}" that is missing from ${project.tests.fakeScene}`);
      }
    }
  }
  if (problems.length > 0) {
    throw new DesktopValidationError('The fake scene does not cover every inline story plan', problems);
  }
}

/** Values consumed by the foreground desktop Storybook host. */
export function toDesktopHostOptions(project: ResolvedDesktopProject): {
  configPath: string;
  manifestPath: string;
  runner: { command: string; args: readonly string[]; cwd: string; timeoutMs: number; resultsDirectory: string };
  host: string;
  port: number;
  experimentalMcp: boolean;
} {
  return {
    configPath: project.storybook.configDir,
    manifestPath: project.tests.manifestPath,
    runner: project.tests.runner,
    host: project.storybook.channel.host,
    port: project.storybook.channel.port,
    experimentalMcp: project.storybook.channel.mcp,
  };
}

/** JSON-safe projection for scripts and diagnostics. */
export function serializeResolvedDesktopProject(project: ResolvedDesktopProject): Record<string, unknown> {
  return {
    configFile: project.configFile,
    rootDir: project.rootDir,
    platform: project.platform,
    storybook: project.storybook,
    tests: project.tests,
    driver: project.driver,
    storyFilter: project.storyFilter,
  };
}
