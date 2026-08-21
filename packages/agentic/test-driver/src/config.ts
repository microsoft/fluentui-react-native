/**
 * Portable configuration validation and resolution.
 *
 * Validation is deliberately strict about two things: the driver host must stay on loopback, and
 * an `attach` target must identify exactly one application. Ambiguity in either place is how an
 * automated run ends up terminating a process it does not own.
 */

import * as path from 'node:path';

import { DesktopValidationError } from './errors.ts';
import type { DesktopAppTarget, DesktopBackendId, DesktopDriverOptions, DesktopPlatform, ResolvedDesktopDriverOptions } from './types.ts';
import { expectEnum, isNonEmptyString, isPlainObject, ValidationIssues } from './validate.ts';

const PLATFORMS: readonly DesktopPlatform[] = ['macos', 'windows', 'fake'];
const BACKENDS: readonly DesktopBackendId[] = ['mac2', 'novawindows', 'fake'];
const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'silent'] as const;

const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', 'localhost']);

/** Backends that are legal for each platform. The first entry is the default. */
const PLATFORM_BACKENDS: Readonly<Record<DesktopPlatform, readonly DesktopBackendId[]>> = {
  macos: ['mac2'],
  windows: ['novawindows'],
  fake: ['fake'],
};

export const DEFAULT_STORYBOOK_PORT = 7007;
export const DEFAULT_STARTUP_TIMEOUT = 120_000;
export const DEFAULT_READINESS_TIMEOUT = 60_000;
export const DEFAULT_RENDER_TIMEOUT = 30_000;

/** Returns the default backend for a platform. */
export function defaultBackendFor(platform: DesktopPlatform): DesktopBackendId {
  return PLATFORM_BACKENDS[platform][0];
}

/**
 * Validates an application target.
 *
 * `attach` requires at least one identity. Precedence is process id, then native window handle,
 * then bundle/package identity, then window title, and the resolver rejects an ambiguous match
 * later at runtime.
 */
export function validateAppTarget(target: unknown, issues: ValidationIssues, path_ = 'target'): void {
  if (!isPlainObject(target)) {
    issues.add(path_, 'must be an object');
    return;
  }
  if (!expectEnum(issues, `${path_}.mode`, target.mode, ['launch', 'attach'] as const)) {
    return;
  }
  if (target.mode === 'launch') {
    if (!isNonEmptyString(target.app)) {
      issues.add(`${path_}.app`, 'must be a non-empty string when mode is "launch"');
    }
    if (target.args !== undefined && (!Array.isArray(target.args) || target.args.some((arg) => typeof arg !== 'string'))) {
      issues.add(`${path_}.args`, 'must be an array of strings');
    }
    return;
  }
  const identities = ['identity', 'processId', 'windowHandle', 'title'].filter((key) => target[key] !== undefined);
  if (identities.length === 0) {
    issues.add(path_, 'must provide identity, processId, windowHandle, or title when mode is "attach"');
  }
  if (target.processId !== undefined && (!Number.isInteger(target.processId) || (target.processId as number) <= 0)) {
    issues.add(`${path_}.processId`, 'must be a positive integer');
  }
}

/**
 * Ranks the attach identities by precedence.
 *
 * Process id and native window handle are exact; identity and title are not, so a backend must
 * treat them as a query that can legitimately return zero or many matches.
 */
export function attachIdentityPrecedence(target: DesktopAppTarget): readonly ('processId' | 'windowHandle' | 'identity' | 'title')[] {
  if (target.mode !== 'attach') {
    return [];
  }
  const ordered: ('processId' | 'windowHandle' | 'identity' | 'title')[] = [];
  if (target.processId !== undefined) {
    ordered.push('processId');
  }
  if (target.windowHandle !== undefined) {
    ordered.push('windowHandle');
  }
  if (target.identity !== undefined) {
    ordered.push('identity');
  }
  if (target.title !== undefined) {
    ordered.push('title');
  }
  return ordered;
}

/** Validates and fills in portable driver options. Throws `DesktopValidationError` on failure. */
export function resolveDesktopOptions(options: DesktopDriverOptions): ResolvedDesktopDriverOptions {
  const issues = new ValidationIssues();

  if (!isPlainObject(options)) {
    throw new DesktopValidationError('Invalid desktop driver options', ['options must be an object']);
  }

  const platformOk = expectEnum(issues, 'platform', options.platform, PLATFORMS);
  const platform = platformOk ? options.platform : 'fake';

  let backend = options.backend ?? defaultBackendFor(platform);
  if (options.backend !== undefined && expectEnum(issues, 'backend', options.backend, BACKENDS)) {
    if (platformOk && !PLATFORM_BACKENDS[platform].includes(options.backend)) {
      issues.add('backend', `is not valid for platform "${platform}" (expected ${PLATFORM_BACKENDS[platform].join(' or ')})`);
    }
  } else if (options.backend !== undefined) {
    backend = defaultBackendFor(platform);
  }

  validateAppTarget(options.target, issues);
  if (
    platform === 'macos' &&
    options.target?.mode === 'attach' &&
    (!isNonEmptyString(options.target.identity) ||
      options.target.processId !== undefined ||
      options.target.windowHandle !== undefined ||
      options.target.title !== undefined)
  ) {
    issues.add(
      'target',
      'macOS attach requires identity and does not support processId, windowHandle, or title until Mac2 window discovery is implemented',
    );
  }

  const host = options.host ?? '127.0.0.1';
  if (!LOOPBACK_HOSTS.has(host)) {
    issues.add('host', 'must be a loopback address; the driver host never binds to an external interface');
  }

  const port = options.port ?? 0;
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    issues.add('port', 'must be an integer between 0 and 65535');
  }

  const startupTimeout = options.startupTimeout ?? DEFAULT_STARTUP_TIMEOUT;
  if (!Number.isInteger(startupTimeout) || startupTimeout <= 0) {
    issues.add('startupTimeout', 'must be a positive integer');
  }

  if (options.logLevel !== undefined) {
    expectEnum(issues, 'logLevel', options.logLevel, LOG_LEVELS);
  }

  if (options.backendCapabilities !== undefined && !isPlainObject(options.backendCapabilities)) {
    issues.add('backendCapabilities', 'must be an object');
  }

  if (issues.length > 0) {
    throw new DesktopValidationError('Invalid desktop driver options', issues.list());
  }

  const readiness = options.readiness ?? {};
  const storybook = options.storybook ?? {};

  return {
    platform,
    backend,
    target: options.target,
    host,
    port,
    startupTimeout,
    readiness: {
      requireWindow: readiness.requireWindow ?? true,
      requireStorybookChannel: readiness.requireStorybookChannel ?? false,
      requireTestId: readiness.requireTestId,
      timeout: readiness.timeout ?? DEFAULT_READINESS_TIMEOUT,
    },
    storybook: {
      host: storybook.host ?? '127.0.0.1',
      port: storybook.port ?? DEFAULT_STORYBOOK_PORT,
      renderTimeout: storybook.renderTimeout ?? DEFAULT_RENDER_TIMEOUT,
      specRoots: (storybook.specRoots ?? []).map((root) => path.resolve(root)),
    },
    artifactsDirectory: path.resolve(options.artifactsDirectory ?? path.join('artifacts', 'desktop-tests')),
    backendCapabilities: options.backendCapabilities ?? {},
    fakeScene: options.fakeScene,
    logLevel: options.logLevel ?? 'warn',
  };
}
