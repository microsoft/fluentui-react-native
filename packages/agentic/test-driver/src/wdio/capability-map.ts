/**
 * Internal capability mapping.
 *
 * The `appium:` prefix below is required by the reused W3C driver implementations. It does not
 * mean a test uses an Appium client, and it does not mean the Appium CLI or multi-driver router
 * is running: the capabilities travel to a single-driver host this package owns.
 *
 * `browserName: ''` is set deliberately. WebdriverIO decides between its web and native command
 * implementations from the capability shape, and the two backends would otherwise disagree
 * (`appium:app` marks a session as native, `appium:bundleId` does not). Pinning it here makes
 * `getValue()`, `setValue()`, and the wait commands resolve to the same implementation on both
 * platforms, which is a precondition for a write-once spec.
 */

import { attachIdentityPrecedence } from '../config.ts';
import { DesktopValidationError } from '../errors.ts';
import { normalizeWindowHandle } from './window-discovery.ts';
import type { DesktopAppTarget, ResolvedDesktopDriverOptions } from '../types.ts';

/** Overrides applied on top of the mapping derived from the resolved options. */
export interface CapabilityOverrides {
  /** Native window handle resolved by attach-mode window discovery. */
  windowHandle?: string;
  /**
   * Build the capabilities for the throwaway root-desktop session used to discover a window,
   * rather than for the session under test.
   */
  rootSession?: boolean;
}

/** Builds the backend capabilities for a resolved configuration. */
export function buildCapabilities(options: ResolvedDesktopDriverOptions, overrides: CapabilityOverrides = {}): Record<string, unknown> {
  const base: Record<string, unknown> = { browserName: '' };

  switch (options.backend) {
    case 'mac2':
      Object.assign(base, macosCapabilities(options.target));
      break;
    case 'novawindows':
      Object.assign(base, windowsCapabilities(options.target, overrides));
      break;
    case 'fake':
    default:
      Object.assign(base, { platformName: 'fake', 'appium:automationName': 'Fake' });
      break;
  }

  base['appium:newCommandTimeout'] = 0;
  assertSafeCapabilityOverrides(options, base, overrides);
  return { ...base, ...options.backendCapabilities };
}

/** Capabilities for the throwaway root-desktop session that enumerates top-level windows. */
export function buildRootSessionCapabilities(options: ResolvedDesktopDriverOptions): Record<string, unknown> {
  return buildCapabilities(options, { rootSession: true });
}

function macosCapabilities(target: DesktopAppTarget): Record<string, unknown> {
  const capabilities: Record<string, unknown> = {
    platformName: 'mac',
    'appium:automationName': 'Mac2',
  };

  if (target.mode === 'launch') {
    if (target.app.endsWith('.app') || target.app.includes('/')) {
      capabilities['appium:appPath'] = target.app;
    } else {
      capabilities['appium:bundleId'] = target.app;
    }
    if (target.args && target.args.length > 0) {
      capabilities['appium:arguments'] = [...target.args];
    }
    if (target.environment) {
      capabilities['appium:environment'] = { ...target.environment };
    }
    return capabilities;
  }

  // Attach must never relaunch or terminate the application. `noReset` keeps Mac2 from restarting
  // an already running app, and `skipAppKill` keeps it running after the session ends.
  capabilities['appium:noReset'] = true;
  capabilities['appium:skipAppKill'] = true;
  if (target.identity) {
    capabilities['appium:bundleId'] = target.identity;
  }
  return capabilities;
}

function windowsCapabilities(target: DesktopAppTarget, overrides: CapabilityOverrides): Record<string, unknown> {
  const capabilities: Record<string, unknown> = {
    platformName: 'Windows',
    'appium:automationName': 'NovaWindows',
  };

  if (target.mode === 'launch') {
    capabilities['appium:app'] = target.app;
    if (target.args && target.args.length > 0) {
      capabilities['appium:appArguments'] = target.args.join(' ');
    }
    if (target.workingDirectory) {
      capabilities['appium:appWorkingDir'] = target.workingDirectory;
    }
    return capabilities;
  }

  // NovaWindows closes the window under test at session end unless this is false.
  capabilities['appium:shouldCloseApp'] = false;

  // `app` and `appTopLevelWindow` are mutually exclusive. Attaching is therefore two steps: a
  // root-desktop session that enumerates windows, then the real session pinned to the handle that
  // matched.
  const handle = overrides.rootSession ? undefined : (overrides.windowHandle ?? target.windowHandle);
  if (handle) {
    capabilities['appium:appTopLevelWindow'] = normalizeWindowHandle(handle);
  } else {
    capabilities['appium:app'] = 'Root';
  }
  return capabilities;
}

function assertSafeCapabilityOverrides(
  options: ResolvedDesktopDriverOptions,
  generated: Readonly<Record<string, unknown>>,
  overrides: CapabilityOverrides,
): void {
  const protectedKeys = new Set<string>();

  if (options.target.mode === 'attach') {
    if (options.backend === 'mac2') {
      protectedKeys.add('appium:noReset');
      protectedKeys.add('appium:skipAppKill');
      protectedKeys.add('appium:bundleId');
      protectedKeys.add('appium:appPath');
    } else if (options.backend === 'novawindows') {
      protectedKeys.add('appium:shouldCloseApp');
      protectedKeys.add('appium:app');
      protectedKeys.add('appium:appTopLevelWindow');
    }
  }

  if (overrides.rootSession) {
    protectedKeys.add('appium:app');
    protectedKeys.add('appium:appTopLevelWindow');
  }

  const conflicts = [...protectedKeys].filter(
    (key) => key in options.backendCapabilities && options.backendCapabilities[key] !== generated[key],
  );
  if (conflicts.length > 0) {
    throw new DesktopValidationError(
      'Backend capabilities cannot override attach ownership or routing',
      conflicts.map((key) => `backendCapabilities.${key} conflicts with the protected value`),
    );
  }
}

/**
 * Describes how an attach target will be resolved, for the doctor command and failure
 * diagnostics. Process id and window handle are exact; identity and title are queries that can
 * match zero or many windows and must be rejected when ambiguous.
 */
export function describeAttachResolution(target: DesktopAppTarget): { exact: boolean; order: readonly string[] } {
  const order = attachIdentityPrecedence(target);
  return { exact: order[0] === 'processId' || order[0] === 'windowHandle', order };
}
