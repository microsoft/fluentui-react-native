import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

import type { DesktopEndpoint, DesktopRenderer, NativeDesktopApplicationDescriptor } from '@fluentui-react-native/desktop-driver';
import type { DesktopIntegration } from './integration.ts';

export type DesktopCommand = {
  command: string;
  args?: readonly string[];
  cwd?: string;
  env?: Readonly<Record<string, string>>;
};

export type DesktopReadiness = { kind: 'native'; testId?: string; timeoutMs?: number };
export type DesktopStage = 'prep' | 'bundle' | 'build' | 'run';
export type DesktopHostConfig = {
  kind: 'installed' | 'react-native-test-app' | 'rex';
  application?: NativeDesktopApplicationDescriptor;
  ownership?: 'session' | 'external';
  renderer?: DesktopRenderer;
  appConfigPath?: string;
  component?: string;
  windowTitle?: string;
  bundleRoot?: string;
};

export type DesktopTargetConfig = {
  endpoint?: DesktopEndpoint;
  host: DesktopHostConfig;
  readiness?: DesktopReadiness;
  commands?: Partial<Record<DesktopStage, DesktopCommand | readonly DesktopCommand[] | false>>;
  services?: readonly { id: string; command: DesktopCommand; readyUrl?: string }[];
  launchTimeoutMs?: number;
  nativeDriver?: { cacheRoot?: string; helperPath?: string; installRoot?: string };
};

export type DesktopTargetReference = { use: { config: string; target: string } };
export type DesktopSpecs = readonly (string | readonly string[])[];
export type DesktopWdioSuite = {
  kind: 'wdio';
  framework: 'jasmine' | 'mocha' | 'cucumber';
  specs: DesktopSpecs | Partial<Record<DesktopEndpoint, DesktopSpecs>>;
  hooks?: string;
  readiness?: DesktopReadiness;
  maxInstances?: 1;
  specFileRetries?: number;
  bail?: number;
  timeoutMs?: number;
  optional?: boolean;
};

export type DesktopReportingConfig = {
  artifactsRoot?: string;
  console?: 'auto' | 'plain' | 'github-actions';
  junit?: boolean;
  summary?: 'auto' | false;
};

export type DesktopConfig = {
  schemaVersion: 1;
  projectRoot?: string | URL;
  targets: Readonly<Record<string, DesktopTargetConfig | DesktopTargetReference>>;
  suites?: Readonly<Record<string, DesktopWdioSuite | { kind: 'csf-wdio' }>>;
  integration?: DesktopIntegration;
  reporting?: DesktopReportingConfig;
};

export type ResolvedDesktopTarget = DesktopTargetConfig & {
  endpoint: DesktopEndpoint;
  id: string;
  instanceId: string;
  projectRoot: string;
  configPath: string;
};

export type ResolvedDesktopConfig = {
  config: DesktopConfig;
  configPath: string;
  projectRoot: string;
  targets: Readonly<Record<string, ResolvedDesktopTarget>>;
  reporting: DesktopReportingConfig & { artifactsRoot: string };
};

const configNames = ['desktop.config.mts', 'desktop.config.ts', 'desktop.config.mjs', 'desktop.config.js', 'desktop.config.cjs'];
const endpoints = ['macos', 'windows', 'win32'] as const;
const stages = ['prep', 'bundle', 'build', 'run'] as const;

/** A structural, source-loadable entry point; config generation does not require a repository build. */
export function defineDesktopConfig<T extends DesktopConfig>(config: T): T {
  validateDesktopConfig(config);
  return config;
}

export function validateDesktopConfig(value: unknown): asserts value is DesktopConfig {
  const config = object(value, 'desktop config');
  keys(config, ['schemaVersion', 'projectRoot', 'targets', 'suites', 'integration', 'reporting'], 'desktop config');
  if (config.schemaVersion !== 1) throw new TypeError('Desktop config schemaVersion must be 1.');
  if (config.projectRoot !== undefined && !(config.projectRoot instanceof URL)) text(config.projectRoot, 'projectRoot');
  const targets = object(config.targets, 'targets');
  if (Object.keys(targets).length === 0) throw new TypeError('Desktop config must declare at least one target.');
  for (const [id, entry] of Object.entries(targets)) {
    text(id, 'target id');
    const target = object(entry, `target ${id}`);
    if ('use' in target) {
      keys(target, ['use'], `referenced target ${id} (overrides are ambiguous)`);
      const reference = object(target.use, `${id}.use`);
      keys(reference, ['config', 'target'], `${id}.use`);
      text(reference.config, `${id}.use.config`);
      text(reference.target, `${id}.use.target`);
      continue;
    }
    keys(target, ['endpoint', 'host', 'readiness', 'commands', 'services', 'launchTimeoutMs', 'nativeDriver'], `target ${id}`);
    oneOf(target.endpoint ?? id, endpoints, `${id}.endpoint`);
    const host = object(target.host, `${id}.host`);
    keys(host, ['kind', 'application', 'ownership', 'renderer', 'appConfigPath', 'component', 'windowTitle', 'bundleRoot'], `${id}.host`);
    oneOf(host.kind, ['installed', 'react-native-test-app', 'rex'], `${id}.host.kind`);
    optionalEnum(host.ownership, ['session', 'external'], `${id}.host.ownership`);
    optionalEnum(host.renderer, ['fabric', 'paper'], `${id}.host.renderer`);
    for (const field of ['appConfigPath', 'component', 'windowTitle', 'bundleRoot']) {
      if (host[field] !== undefined) text(host[field], `${id}.host.${field}`);
    }
    if (host.kind === 'rex' && (target.endpoint ?? id) !== 'win32') throw new TypeError('REX requires the win32 endpoint.');
    if (host.kind === 'react-native-test-app' && (target.endpoint ?? id) === 'win32') {
      throw new TypeError('Win32 uses REX, not react-native-test-app.');
    }
    if (host.application !== undefined) validateApplication(host.application, `${id}.host.application`);
    if (host.kind === 'installed' && host.application === undefined)
      throw new TypeError(`${id}: installed hosts require application identity.`);
    if (target.readiness !== undefined) validateReadiness(target.readiness);
    positive(target.launchTimeoutMs, `${id}.launchTimeoutMs`);
    if (target.nativeDriver !== undefined) {
      const driver = object(target.nativeDriver, `${id}.nativeDriver`);
      keys(driver, ['cacheRoot', 'helperPath', 'installRoot'], `${id}.nativeDriver`);
      for (const [field, setting] of Object.entries(driver)) text(setting, `${id}.nativeDriver.${field}`);
    }
    if (target.commands !== undefined) {
      const commands = object(target.commands, `${id}.commands`);
      keys(commands, stages, `${id}.commands`);
      for (const command of Object.values(commands)) {
        if (command !== false) for (const item of Array.isArray(command) ? command : [command]) validateCommand(item);
      }
    }
    if (target.services !== undefined) {
      if (!Array.isArray(target.services)) throw new TypeError(`${id}.services must be an array.`);
      const ids = new Set<string>();
      for (const entry of target.services) {
        const service = object(entry, `${id}.service`);
        keys(service, ['id', 'command', 'readyUrl'], `${id}.service`);
        text(service.id, 'service id');
        if (ids.has(service.id)) throw new TypeError(`Duplicate service ${service.id}.`);
        ids.add(service.id);
        validateCommand(service.command);
        if (service.readyUrl !== undefined) {
          text(service.readyUrl, 'readyUrl');
          const url = new URL(service.readyUrl);
          if (!['http:', 'https:'].includes(url.protocol) || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
            throw new TypeError('Service readiness URLs must be loopback HTTP URLs.');
          }
        }
      }
    }
  }
  if (config.suites !== undefined) {
    for (const [id, entry] of Object.entries(object(config.suites, 'suites'))) {
      const suite = object(entry, `suite ${id}`);
      oneOf(suite.kind, ['wdio', 'csf-wdio'], `${id}.kind`);
      if (suite.kind === 'csf-wdio') {
        keys(suite, ['kind'], `suite ${id}`);
        if (!config.integration) throw new TypeError('CSF suites require an explicitly imported integration.');
        continue;
      }
      keys(
        suite,
        ['kind', 'framework', 'specs', 'hooks', 'readiness', 'maxInstances', 'specFileRetries', 'bail', 'timeoutMs', 'optional'],
        `suite ${id}`,
      );
      oneOf(suite.framework, ['jasmine', 'mocha', 'cucumber'], `${id}.framework`);
      if (Array.isArray(suite.specs)) validateSpecs(suite.specs);
      else {
        const specs = object(suite.specs, `${id}.specs`);
        keys(specs, endpoints, `${id}.specs`);
        for (const selection of Object.values(specs)) validateSpecs(selection);
      }
      if (suite.maxInstances !== undefined && suite.maxInstances !== 1) throw new TypeError('Desktop suites require maxInstances: 1.');
      for (const field of ['specFileRetries', 'bail']) positive(suite[field], `${id}.${field}`, true);
      positive(suite.timeoutMs, `${id}.timeoutMs`);
      if (suite.hooks !== undefined) text(suite.hooks, `${id}.hooks`);
      if (suite.readiness !== undefined) validateReadiness(suite.readiness);
      if (suite.optional !== undefined && typeof suite.optional !== 'boolean') throw new TypeError(`${id}.optional must be boolean.`);
    }
  }
  if (config.reporting !== undefined) {
    const reporting = object(config.reporting, 'reporting');
    keys(reporting, ['artifactsRoot', 'console', 'junit', 'summary'], 'reporting');
    if (reporting.artifactsRoot !== undefined) text(reporting.artifactsRoot, 'reporting.artifactsRoot');
    optionalEnum(reporting.console, ['auto', 'plain', 'github-actions'], 'reporting.console');
    if (reporting.junit !== undefined && typeof reporting.junit !== 'boolean') throw new TypeError('reporting.junit must be boolean.');
    if (reporting.summary !== undefined && reporting.summary !== false && reporting.summary !== 'auto') {
      throw new TypeError('reporting.summary must be auto or false.');
    }
  }
  if (config.integration !== undefined) {
    const integration = object(config.integration, 'integration');
    text(integration.name, 'integration.name');
    if (typeof integration.validate !== 'function') throw new TypeError('An integration must expose validate().');
    integration.validate();
  }
}

export async function loadDesktopConfig(configPath?: string, cwd = process.cwd()): Promise<ResolvedDesktopConfig> {
  const filename = configPath
    ? path.resolve(cwd, configPath)
    : configNames.map((name) => path.resolve(cwd, name)).find((candidate) => fs.existsSync(candidate));
  if (!filename) throw new Error(`No ${configNames.join(', ')} found in ${cwd}.`);
  const cache = new Map<string, Promise<{ config: DesktopConfig; root: string; file: string }>>();
  const read = (filename: string) => {
    const file = fs.realpathSync(filename);
    let pending = cache.get(file);
    if (!pending) {
      pending = (async () => {
        const loaded = (await import(pathToFileURL(file).href)) as { default?: unknown; config?: unknown };
        const config = loaded.default ?? loaded.config;
        validateDesktopConfig(config);
        const root = fs.realpathSync(
          config.projectRoot instanceof URL
            ? fileURLToPath(config.projectRoot)
            : path.resolve(path.dirname(file), config.projectRoot ?? '.'),
        );
        return { config, root, file };
      })();
      cache.set(file, pending);
    }
    return pending;
  };
  const resolve = async (filename: string, id: string, ancestry: readonly string[]): Promise<ResolvedDesktopTarget> => {
    const { config, root, file } = await read(filename);
    const key = `${file}#${id}`;
    if (ancestry.includes(key)) throw new Error(`Desktop target reference cycle: ${[...ancestry, key].join(' -> ')}`);
    const target = config.targets[id];
    if (!target) throw new Error(`Unknown desktop target "${id}" in ${file}.`);
    if ('use' in target) return resolve(path.resolve(path.dirname(file), target.use.config), target.use.target, [...ancestry, key]);
    const endpoint = target.endpoint ?? (id as DesktopEndpoint);
    const host = {
      ...target.host,
      ...(target.host.appConfigPath ? { appConfigPath: path.resolve(root, target.host.appConfigPath) } : {}),
      ...(target.host.bundleRoot ? { bundleRoot: path.resolve(root, target.host.bundleRoot) } : {}),
      ...(target.host.application
        ? {
            application: {
              ...target.host.application,
              ...resolvePaths(root, target.host.application, ['executablePath', 'leasePath', 'workingDirectory']),
            },
          }
        : {}),
    };
    const instanceId = targetInstanceId(root, endpoint, host.renderer);
    return Object.freeze({
      ...target,
      endpoint,
      host: Object.freeze(host),
      id: `${endpoint}-${instanceId}`,
      instanceId,
      projectRoot: root,
      configPath: file,
      nativeDriver: target.nativeDriver
        ? { ...target.nativeDriver, ...resolvePaths(root, target.nativeDriver, ['cacheRoot', 'helperPath', 'installRoot']) }
        : undefined,
    });
  };
  const { config, root, file } = await read(filename);
  const targets = Object.fromEntries(await Promise.all(Object.keys(config.targets).map(async (id) => [id, await resolve(file, id, [])])));
  return {
    config,
    configPath: file,
    projectRoot: root,
    targets: Object.freeze(targets),
    reporting: { ...config.reporting, artifactsRoot: path.resolve(root, config.reporting?.artifactsRoot ?? 'artifacts/desktop') },
  };
}

export function selectDesktopRenderer(target: ResolvedDesktopTarget, renderer: DesktopRenderer): ResolvedDesktopTarget {
  if (target.endpoint !== 'macos' || target.host.kind !== 'react-native-test-app')
    throw new Error('Renderer switching requires a macOS RN Test App target; regenerate with prep after switching.');
  const instanceId = targetInstanceId(target.projectRoot, target.endpoint, renderer);
  return Object.freeze({
    ...target,
    host: Object.freeze({ ...target.host, renderer }),
    instanceId,
    id: `${target.endpoint}-${instanceId}`,
  });
}

function targetInstanceId(root: string, endpoint: DesktopEndpoint, renderer?: DesktopRenderer): string {
  return createHash('sha256')
    .update(`${root}\0${endpoint}\0${renderer ?? 'native'}`)
    .digest('hex')
    .slice(0, 16);
}

export function resolveDesktopSpecs(suite: DesktopWdioSuite, endpoint: DesktopEndpoint, root: string): (string | string[])[] {
  const specs: DesktopSpecs | undefined = Array.isArray(suite.specs)
    ? suite.specs
    : (suite.specs as Partial<Record<DesktopEndpoint, DesktopSpecs>>)[endpoint];
  if (!specs?.length) throw new Error(`No specs selected for ${endpoint}.`);
  const resolve = (pattern: string) => {
    const matches = [...fs.globSync(pattern, { cwd: root })].sort().map((file) => path.resolve(root, file));
    if (matches.length === 0) throw new Error(`Unmatched ${endpoint} spec pattern "${pattern}" in ${root}; refusing reduced coverage.`);
    return matches;
  };
  return specs.flatMap<string | string[]>((entry) => (typeof entry === 'string' ? resolve(entry) : [entry.flatMap(resolve)]));
}

function resolvePaths(root: string, settings: object, fields: readonly string[]): Record<string, string> {
  return Object.fromEntries(
    Object.entries(settings)
      .filter(([key, value]) => fields.includes(key) && typeof value === 'string')
      .map(([key, value]) => [key, path.resolve(root, value)]),
  );
}

function validateApplication(value: unknown, context: string): void {
  const application = object(value, context);
  keys(
    application,
    ['arguments', 'aumid', 'bundleIdentifier', 'executablePath', 'leaseNonce', 'leasePath', 'windowTitle', 'workingDirectory'],
    context,
  );
  for (const [field, setting] of Object.entries(application)) {
    if (field === 'arguments') {
      if (!Array.isArray(setting) || !setting.every((item) => typeof item === 'string'))
        throw new TypeError(`${context}.arguments must be strings.`);
    } else text(setting, `${context}.${field}`);
  }
  if (Boolean(application.leasePath) !== Boolean(application.leaseNonce))
    throw new TypeError(`${context}: leasePath and leaseNonce must be paired.`);
}

function validateReadiness(value: unknown): void {
  const readiness = object(value, 'readiness');
  keys(readiness, ['kind', 'testId', 'timeoutMs'], 'readiness');
  oneOf(readiness.kind, ['native'], 'readiness.kind');
  if (readiness.testId !== undefined) text(readiness.testId, 'readiness.testId');
  positive(readiness.timeoutMs, 'readiness.timeoutMs');
}

export function validateCommand(value: unknown): asserts value is DesktopCommand {
  const command = object(value, 'command');
  keys(command, ['command', 'args', 'cwd', 'env'], 'command');
  text(command.command, 'command.command');
  if (command.cwd !== undefined) text(command.cwd, 'command.cwd');
  if (command.args !== undefined && (!Array.isArray(command.args) || !command.args.every((arg) => typeof arg === 'string'))) {
    throw new TypeError('command.args must be strings.');
  }
  if (command.env !== undefined)
    for (const [key, value] of Object.entries(object(command.env, 'command.env'))) {
      if (typeof value !== 'string') throw new TypeError(`command.env.${key} must be a string.`);
    }
}

function validateSpecs(value: unknown): void {
  if (!Array.isArray(value) || value.length === 0)
    throw new TypeError('specs must be a nonempty array (nested arrays preserve worker grouping).');
  for (const entry of value) {
    if (Array.isArray(entry)) {
      if (!entry.length) throw new TypeError('A spec group cannot be empty.');
      for (const pattern of entry) text(pattern, 'spec pattern');
    } else text(entry, 'spec pattern');
  }
}

function object(value: unknown, context: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${context} must be an object.`);
  return value as Record<string, unknown>;
}

function keys(value: Record<string, unknown>, allowed: readonly string[], context: string): void {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new TypeError(`Unknown ${context} field "${key}".`);
}

function text(value: unknown, context: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim() || value.includes('\0'))
    throw new TypeError(`${context} must be a nonempty string without NUL.`);
}

function oneOf(value: unknown, allowed: readonly string[], context: string): void {
  if (typeof value !== 'string' || !allowed.includes(value)) throw new TypeError(`${context} must be one of ${allowed.join(', ')}.`);
}

function optionalEnum(value: unknown, allowed: readonly string[], context: string): void {
  if (value !== undefined) oneOf(value, allowed, context);
}

function positive(value: unknown, context: string, zero = false): void {
  if (
    value !== undefined &&
    (typeof value !== 'number' || !Number.isSafeInteger(value) || value < (zero ? 0 : 1) || value > 2_147_483_647)
  ) {
    throw new TypeError(`${context} must be an integer between ${zero ? 0 : 1} and 2147483647.`);
  }
}
