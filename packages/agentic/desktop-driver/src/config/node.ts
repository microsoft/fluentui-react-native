import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createJiti } from 'jiti';

import { DEFAULT_RENDER_TIMEOUT, DEFAULT_STORYBOOK_PORT, resolveDesktopOptions } from '../config.ts';
import { DesktopValidationError } from '../errors.ts';
import { isLoopbackHost } from '../core/loopback.ts';
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
  configFingerprint: string;
  sources: Readonly<Record<string, string>>;
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

const LOG_LEVELS = new Set(['trace', 'debug', 'info', 'warn', 'error', 'silent']);
const PLATFORMS: readonly DesktopPlatform[] = ['fake', 'macos', 'windows'];
const PLATFORM_BACKENDS = { fake: 'fake', macos: 'mac2', windows: 'novawindows' } as const;

function requiredObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new DesktopValidationError('Invalid desktop project config', [`${label} must be an object`]);
  }
  return value as Record<string, unknown>;
}

function checkKeys(value: Record<string, unknown>, allowed: readonly string[], label: string, issues: string[]): void {
  const allowedKeys = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      issues.push(`${label}.${key} is not supported`);
    }
  }
}

function optionalString(value: unknown, label: string, issues: string[]): void {
  if (value !== undefined && (typeof value !== 'string' || value.length === 0)) {
    issues.push(`${label} must be a non-empty string`);
  }
}

function optionalBoolean(value: unknown, label: string, issues: string[]): void {
  if (value !== undefined && typeof value !== 'boolean') {
    issues.push(`${label} must be a boolean`);
  }
}

function optionalInteger(value: unknown, label: string, issues: string[], minimum = 1, maximum = Number.MAX_SAFE_INTEGER): void {
  if (value !== undefined && (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum)) {
    issues.push(`${label} must be an integer between ${minimum} and ${maximum}`);
  }
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

function validateReadiness(value: unknown, label: string, issues: string[], allowNullTestId = false): void {
  if (value === undefined) {
    return;
  }
  const readiness = requiredObject(value, label);
  checkKeys(readiness, ['requireWindow', 'requireStorybookChannel', 'requireTestId', 'timeout'], label, issues);
  optionalBoolean(readiness.requireWindow, `${label}.requireWindow`, issues);
  optionalBoolean(readiness.requireStorybookChannel, `${label}.requireStorybookChannel`, issues);
  if (readiness.requireTestId !== undefined && !(allowNullTestId && readiness.requireTestId === null)) {
    optionalString(readiness.requireTestId, `${label}.requireTestId`, issues);
  }
  optionalInteger(readiness.timeout, `${label}.timeout`, issues);
}

function validateConfig(value: unknown): DesktopProjectConfig {
  const issues: string[] = [];
  const config = requiredObject(value, 'config');
  checkKeys(
    config,
    ['schemaVersion', 'rootDir', 'application', 'storybook', 'tests', 'base', 'environment', 'platforms'],
    'config',
    issues,
  );
  if (config.schemaVersion !== DESKTOP_CONFIG_SCHEMA_VERSION) {
    issues.push(`schemaVersion must be ${DESKTOP_CONFIG_SCHEMA_VERSION}`);
  }
  optionalString(config.rootDir, 'rootDir', issues);

  const application = requiredObject(config.application, 'application');
  checkKeys(application, ['manifest', 'readyTestId'], 'application', issues);
  optionalString(application.manifest, 'application.manifest', issues);
  optionalString(application.readyTestId, 'application.readyTestId', issues);
  if (!application.manifest) {
    issues.push('application.manifest is required');
  }

  const storybook = requiredObject(config.storybook, 'storybook');
  checkKeys(storybook, ['configDir', 'stories', 'channel'], 'storybook', issues);
  optionalString(storybook.configDir, 'storybook.configDir', issues);
  if (!storybook.configDir) {
    issues.push('storybook.configDir is required');
  }
  if (!Array.isArray(storybook.stories) || storybook.stories.length === 0) {
    issues.push('storybook.stories must be a non-empty array');
  } else {
    storybook.stories.forEach((entry, index) => {
      const story = requiredObject(entry, `storybook.stories[${index}]`);
      checkKeys(story, ['directory', 'files'], `storybook.stories[${index}]`, issues);
      optionalString(story.directory, `storybook.stories[${index}].directory`, issues);
      optionalString(story.files, `storybook.stories[${index}].files`, issues);
    });
  }
  if (storybook.channel !== undefined) {
    const channel = requiredObject(storybook.channel, 'storybook.channel');
    checkKeys(channel, ['host', 'port', 'mcp'], 'storybook.channel', issues);
    optionalString(channel.host, 'storybook.channel.host', issues);
    if (typeof channel.host === 'string' && !isLoopbackHost(channel.host)) {
      issues.push('storybook.channel.host must be a loopback address');
    }
    optionalInteger(channel.port, 'storybook.channel.port', issues, 1, 65535);
    optionalBoolean(channel.mcp, 'storybook.channel.mcp', issues);
  }

  const tests = requiredObject(config.tests, 'tests');
  checkKeys(
    tests,
    ['storyParameter', 'generatedDirectory', 'fakeScene', 'artifactsDirectory', 'framework', 'sessionStrategy', 'timeoutMs', 'runner'],
    'tests',
    issues,
  );
  for (const key of ['storyParameter', 'generatedDirectory', 'fakeScene', 'artifactsDirectory'] as const) {
    optionalString(tests[key], `tests.${key}`, issues);
  }
  if (tests.storyParameter !== undefined && tests.storyParameter !== 'desktopTest') {
    issues.push('tests.storyParameter currently supports only "desktopTest"');
  }
  if (tests.framework !== undefined && !['mocha', 'jasmine', 'cucumber'].includes(String(tests.framework))) {
    issues.push('tests.framework must be mocha, jasmine, or cucumber');
  }
  if (tests.sessionStrategy !== undefined && tests.sessionStrategy !== 'suite' && tests.sessionStrategy !== 'spec') {
    issues.push('tests.sessionStrategy must be suite or spec');
  }
  optionalInteger(tests.timeoutMs, 'tests.timeoutMs', issues);
  const runner = requiredObject(tests.runner, 'tests.runner');
  checkKeys(runner, ['command', 'args', 'cwd', 'timeoutMs'], 'tests.runner', issues);
  optionalString(runner.command, 'tests.runner.command', issues);
  optionalString(runner.cwd, 'tests.runner.cwd', issues);
  optionalInteger(runner.timeoutMs, 'tests.runner.timeoutMs', issues);
  if (runner.args !== undefined && (!Array.isArray(runner.args) || runner.args.some((entry) => typeof entry !== 'string'))) {
    issues.push('tests.runner.args must be an array of strings');
  }
  if (!tests.generatedDirectory || !tests.artifactsDirectory || !runner.command) {
    issues.push('tests.generatedDirectory, tests.artifactsDirectory, and tests.runner.command are required');
  }

  if (config.base !== undefined) {
    const base = requiredObject(config.base, 'base');
    checkKeys(base, ['driverHost', 'readiness'], 'base', issues);
    if (base.driverHost !== undefined) {
      const driverHost = requiredObject(base.driverHost, 'base.driverHost');
      checkKeys(driverHost, ['host', 'port', 'startupTimeoutMs', 'logLevel'], 'base.driverHost', issues);
      optionalString(driverHost.host, 'base.driverHost.host', issues);
      if (typeof driverHost.host === 'string' && !isLoopbackHost(driverHost.host)) {
        issues.push('base.driverHost.host must be a loopback address');
      }
      optionalInteger(driverHost.port, 'base.driverHost.port', issues, 0, 65535);
      optionalInteger(driverHost.startupTimeoutMs, 'base.driverHost.startupTimeoutMs', issues);
      if (driverHost.logLevel !== undefined && !LOG_LEVELS.has(String(driverHost.logLevel))) {
        issues.push('base.driverHost.logLevel is invalid');
      }
    }
    validateReadiness(base.readiness, 'base.readiness', issues);
  }

  if (config.environment !== undefined) {
    const environment = requiredObject(config.environment, 'environment');
    const environmentKeys = ['platform', 'launchApp', 'identity', 'processId', 'windowHandle', 'windowTitle', 'logLevel', 'storyFilter'];
    checkKeys(environment, environmentKeys, 'environment', issues);
    for (const key of environmentKeys) {
      optionalString(environment[key], `environment.${key}`, issues);
    }
  }

  const platforms = requiredObject(config.platforms, 'platforms');
  checkKeys(platforms, PLATFORMS, 'platforms', issues);
  for (const platform of PLATFORMS) {
    const platformConfig = requiredObject(platforms[platform], `platforms.${platform}`);
    checkKeys(platformConfig, ['backend', 'target', 'readiness'], `platforms.${platform}`, issues);
    if (platformConfig.backend !== PLATFORM_BACKENDS[platform]) {
      issues.push(`platforms.${platform}.backend must be ${PLATFORM_BACKENDS[platform]}`);
    }
    const target = requiredObject(platformConfig.target, `platforms.${platform}.target`);
    checkKeys(target, ['defaultMode', 'attach'], `platforms.${platform}.target`, issues);
    if (target.defaultMode !== 'attach') {
      issues.push(`platforms.${platform}.target.defaultMode must be attach`);
    }
    const attach = requiredObject(target.attach, `platforms.${platform}.target.attach`);
    const attachKeys = ['identity', 'identityFromApplicationManifest', 'title', 'titleFromApplicationManifest'];
    checkKeys(attach, attachKeys, `platforms.${platform}.target.attach`, issues);
    for (const key of attachKeys) {
      optionalString(attach[key], `platforms.${platform}.target.attach.${key}`, issues);
    }
    validateReadiness(platformConfig.readiness, `platforms.${platform}.readiness`, issues, true);
  }

  if (issues.length > 0) {
    throw new DesktopValidationError('Invalid desktop project config', issues);
  }
  return config as unknown as DesktopProjectConfig;
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
  const config = validateConfig((loaded as { default?: unknown }).default ?? loaded);

  const configDirectory = path.dirname(configFile);
  const rootDir = realDirectory(path.resolve(configDirectory, config.rootDir ?? '.'), 'rootDir');
  const applicationManifestPath = path.resolve(rootDir, config.application.manifest);
  const applicationManifest = readJson(applicationManifestPath, 'application.manifest');
  validateManifestReferences(config, applicationManifest);
  const env = options.env ?? process.env;
  const platform = parsePlatform(config, options);
  const platformConfig = config.platforms[platform];
  if (!platformConfig) {
    throw new DesktopValidationError('Invalid desktop project config', [`platforms.${platform} is required`]);
  }
  const channelHost = config.storybook.channel?.host ?? '127.0.0.1';
  if (!isLoopbackHost(channelHost)) {
    throw new DesktopValidationError('Invalid desktop project config', ['storybook.channel.host must be a loopback address']);
  }
  const channelPort = config.storybook.channel?.port ?? DEFAULT_STORYBOOK_PORT;
  const generatedDirectory = outputPath(rootDir, config.tests.generatedDirectory, 'tests.generatedDirectory');
  const fakeScene = config.tests.fakeScene ? realFile(path.resolve(rootDir, config.tests.fakeScene), 'tests.fakeScene') : undefined;
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
    fakeScene,
    logLevel,
  };
  const project: ResolvedDesktopProject = {
    configFile,
    rootDir,
    platform,
    configFingerprint: '',
    sources: resolutionSources(config, options, env, platform),
    applicationManifest,
    storybook: {
      configDir: realDirectory(path.resolve(rootDir, config.storybook.configDir), 'storybook.configDir'),
      stories: config.storybook.stories.map((entry) => ({
        ...entry,
        directory: realDirectory(path.resolve(rootDir, entry.directory), `storybook.stories directory "${entry.directory}"`),
      })),
      channel: { host: channelHost, port: channelPort, mcp: config.storybook.channel?.mcp ?? true },
    },
    tests: {
      generatedDirectory,
      manifestPath: path.join(generatedDirectory, 'story-tests.manifest.json'),
      generatedSpecPath: path.join(generatedDirectory, 'story-plans.generated.spec.ts'),
      runtimePath: path.join(generatedDirectory, 'desktop-runtime.generated.ts'),
      fakeScene,
      artifactsDirectory: outputPath(rootDir, config.tests.artifactsDirectory, 'tests.artifactsDirectory'),
      framework: config.tests.framework ?? 'mocha',
      sessionStrategy: config.tests.sessionStrategy ?? 'suite',
      timeoutMs: config.tests.timeoutMs ?? 120_000,
      runner: {
        command: config.tests.runner.command,
        args: config.tests.runner.args ?? ['wdio', 'run', 'wdio.conf.ts'],
        cwd: realDirectory(path.resolve(rootDir, config.tests.runner.cwd ?? '.'), 'tests.runner.cwd'),
        timeoutMs: config.tests.runner.timeoutMs ?? 900_000,
        resultsDirectory: outputPath(rootDir, config.tests.artifactsDirectory, 'tests.artifactsDirectory'),
      },
    },
    driver: resolveDesktopOptions(driverOptions),
    storyFilter: environmentValue(config, env, 'storyFilter', 'DESKTOP_TEST_GREP'),
  };
  project.configFingerprint = desktopConfigFingerprint(project);
  return project;
}

function resolutionSources(
  config: DesktopProjectConfig,
  options: LoadDesktopConfigOptions,
  env: Readonly<Record<string, string | undefined>>,
  platform: DesktopPlatform,
): Readonly<Record<string, string>> {
  const platformConfig = config.platforms[platform];
  const sources: Record<string, string> = {
    platform:
      options.platform !== undefined
        ? 'option:platform'
        : (environmentSource(config, env, 'platform', 'DESKTOP_TEST_PLATFORM') ?? 'default:fake'),
    'storybook.host': config.storybook.channel?.host !== undefined ? 'storybook.channel.host' : 'default:127.0.0.1',
    'storybook.port': config.storybook.channel?.port !== undefined ? 'storybook.channel.port' : `default:${DEFAULT_STORYBOOK_PORT}`,
    generatedDirectory: 'tests.generatedDirectory',
    artifactsDirectory: 'tests.artifactsDirectory',
  };
  const launchSource = environmentSource(config, env, 'launchApp', 'DESKTOP_TEST_APP');
  if (launchSource) {
    sources['target.mode'] = launchSource;
    sources['target.app'] = launchSource;
  } else {
    sources['target.mode'] = `platforms.${platform}.target.defaultMode`;
    const attach = platformConfig.target.attach;
    sources['target.identity'] =
      environmentSource(config, env, 'identity', 'DESKTOP_TEST_IDENTITY') ??
      (attach.identity !== undefined
        ? `platforms.${platform}.target.attach.identity`
        : attach.identityFromApplicationManifest
          ? `application.manifest:${attach.identityFromApplicationManifest}`
          : 'unset');
    sources['target.processId'] = environmentSource(config, env, 'processId', 'DESKTOP_TEST_PID') ?? 'unset';
    sources['target.windowHandle'] = environmentSource(config, env, 'windowHandle', 'DESKTOP_TEST_WINDOW') ?? 'unset';
    sources['target.title'] =
      environmentSource(config, env, 'windowTitle', 'DESKTOP_TEST_WINDOW_TITLE') ??
      (attach.title !== undefined
        ? `platforms.${platform}.target.attach.title`
        : attach.titleFromApplicationManifest
          ? `application.manifest:${attach.titleFromApplicationManifest}`
          : 'unset');
  }
  sources.logLevel =
    environmentSource(config, env, 'logLevel', 'DESKTOP_TEST_LOG_LEVEL') ??
    (config.base?.driverHost?.logLevel !== undefined ? 'base.driverHost.logLevel' : 'default:warn');
  for (const field of ['requireWindow', 'requireStorybookChannel', 'timeout'] as const) {
    sources[`readiness.${field}`] =
      platformConfig.readiness?.[field] !== undefined
        ? `platforms.${platform}.readiness.${field}`
        : config.base?.readiness?.[field] !== undefined
          ? `base.readiness.${field}`
          : 'package-default';
  }
  sources['readiness.requireTestId'] =
    platformConfig.readiness?.requireTestId !== undefined
      ? `platforms.${platform}.readiness.requireTestId`
      : config.base?.readiness?.requireTestId !== undefined
        ? 'base.readiness.requireTestId'
        : config.application.readyTestId !== undefined
          ? 'application.readyTestId'
          : 'unset';
  return sources;
}

function environmentSource(
  config: DesktopProjectConfig,
  env: Readonly<Record<string, string | undefined>>,
  key: keyof NonNullable<DesktopProjectConfig['environment']>,
  fallbackName: string,
): string | undefined {
  const name = environmentName(config, key, fallbackName);
  return env[name] !== undefined ? `environment:${name}` : undefined;
}

function realDirectory(directory: string, label: string): string {
  let resolved: string;
  try {
    resolved = fs.realpathSync(directory);
  } catch (error) {
    throw new DesktopValidationError('Invalid desktop project config', [`${label} "${directory}": ${(error as Error).message}`]);
  }
  if (!fs.statSync(resolved).isDirectory()) {
    throw new DesktopValidationError('Invalid desktop project config', [`${label} "${resolved}" must be a directory`]);
  }
  return resolved;
}

function outputPath(rootDir: string, configured: string, label: string): string {
  const resolved = path.resolve(rootDir, configured);
  const relative = path.relative(rootDir, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new DesktopValidationError('Invalid desktop project config', [`${label} must stay inside rootDir`]);
  }
  return resolved;
}

function realFile(file: string, label: string): string {
  let resolved: string;
  try {
    resolved = fs.realpathSync(file);
  } catch (error) {
    throw new DesktopValidationError('Invalid desktop project config', [`${label} "${file}": ${(error as Error).message}`]);
  }
  if (!fs.statSync(resolved).isFile()) {
    throw new DesktopValidationError('Invalid desktop project config', [`${label} "${resolved}" must be a file`]);
  }
  return resolved;
}

function validateManifestReferences(config: DesktopProjectConfig, manifest: Readonly<Record<string, unknown>>): void {
  const problems: string[] = [];
  for (const platform of PLATFORMS) {
    const attach = config.platforms[platform].target.attach;
    for (const [field, dottedPath] of [
      ['identityFromApplicationManifest', attach.identityFromApplicationManifest],
      ['titleFromApplicationManifest', attach.titleFromApplicationManifest],
    ] as const) {
      if (dottedPath && readManifestValue(manifest, dottedPath) === undefined) {
        problems.push(`platforms.${platform}.target.attach.${field} "${dottedPath}" does not resolve to a non-empty string`);
      }
    }
  }
  if (problems.length > 0) {
    throw new DesktopValidationError('Invalid desktop project config', problems);
  }
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
  const manifest = validateStoryTestManifest(value, project.tests.manifestPath);
  if (manifest.configDigest !== project.configFingerprint) {
    throw new DesktopValidationError('Stale desktop project manifest', [
      `${project.tests.manifestPath} was generated from a different desktop config; run desktop-driver stories generate`,
    ]);
  }
  return manifest;
}

/** Hashes normalized discovery inputs that must stay identical across platform jobs. */
export function desktopConfigFingerprint(project: ResolvedDesktopProject): string {
  const normalized = {
    schemaVersion: DESKTOP_CONFIG_SCHEMA_VERSION,
    stories: project.storybook.stories.map((entry) => ({
      directory: path.relative(project.rootDir, entry.directory).replaceAll(path.sep, '/'),
      files: entry.files,
    })),
    generatedDirectory: path.relative(project.rootDir, project.tests.generatedDirectory).replaceAll(path.sep, '/'),
  };
  return crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
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
  const contents = renderDesktopRuntime(project, manifest);
  fs.mkdirSync(path.dirname(project.tests.runtimePath), { recursive: true });
  const temporary = `${project.tests.runtimePath}.${process.pid}-${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temporary, contents, 'utf8');
    fs.renameSync(temporary, project.tests.runtimePath);
  } catch (error) {
    fs.rmSync(temporary, { force: true });
    throw error;
  }
  return project.tests.runtimePath;
}

/** Renders and validates the RN-safe project projection without writing it. */
export function renderDesktopRuntime(project: ResolvedDesktopProject, manifest: StoryTestManifest): string {
  validateFakeScene(project, manifest);
  return `export const desktopRuntime = ${JSON.stringify(
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
    configFingerprint: project.configFingerprint,
    rootDir: project.rootDir,
    platform: project.platform,
    sources: project.sources,
    storybook: project.storybook,
    tests: project.tests,
    driver: project.driver,
    storyFilter: project.storyFilter,
  };
}
