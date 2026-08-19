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
import type { DesktopAppTarget, ResolvedDesktopDriverOptions } from '../types.ts';

/** Builds the backend capabilities for a resolved configuration. */
export function buildCapabilities(options: ResolvedDesktopDriverOptions): Record<string, unknown> {
  const base: Record<string, unknown> = { browserName: '' };

  switch (options.backend) {
    case 'mac2':
      Object.assign(base, macosCapabilities(options.target));
      break;
    case 'windows':
    case 'novawindows':
      Object.assign(base, windowsCapabilities(options.target, options.backend));
      break;
    case 'fake':
    default:
      Object.assign(base, { platformName: 'fake', 'appium:automationName': 'Fake' });
      break;
  }

  base['appium:newCommandTimeout'] = 0;
  return { ...base, ...options.backendCapabilities };
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

function windowsCapabilities(target: DesktopAppTarget, backend: 'windows' | 'novawindows'): Record<string, unknown> {
  const capabilities: Record<string, unknown> = {
    platformName: 'Windows',
    'appium:automationName': backend === 'windows' ? 'Windows' : 'NovaWindows',
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

  // Attaching starts from a root-desktop session; the window is then selected by handle.
  //
  // The "never terminate what we did not start" guarantee is expressed with each backend's own
  // capability, because Appium only warns about an unrecognized one and would silently keep its
  // default. Windows Driver gates WinAppDriver's `/forcequit` on `ms:forcequit`, and NovaWindows
  // closes the window under test at session end unless `shouldCloseApp` is false.
  capabilities['appium:app'] = 'Root';
  if (backend === 'windows') {
    capabilities['ms:forcequit'] = false;
  } else {
    capabilities['appium:shouldCloseApp'] = false;
  }
  if (target.windowHandle) {
    capabilities['appium:appTopLevelWindow'] = target.windowHandle;
  }
  return capabilities;
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
