import { desktopInputModes } from '../authoring/input.js';
import type { DesktopInputMode } from '../authoring/input.js';
import type { DesktopHostInfo, DesktopTarget } from '../host/types.js';
import { invalidArgument, toWebDriverError, WebDriverError } from './errors.js';
import { withCommandTimeout } from './timeouts.js';
import type { DesktopClickMode, NewSessionCapabilities } from './types.js';

const standardCapabilities = new Set([
  'acceptInsecureCerts',
  'browserName',
  'browserVersion',
  'pageLoadStrategy',
  'platformName',
  'proxy',
  'setWindowRect',
  'strictFileInteractability',
  'timeouts',
  'unhandledPromptBehavior',
  'webSocketUrl',
]);

// The `furn:` capabilities a request may carry. The driver returns others (`furn:features`, `furn:storybook`), but a
// request never sets them, so a misspelled name fails instead of silently selecting a default.
const requestedFurnCapabilities = new Set([
  'furn:clickMode',
  'furn:endpoint',
  'furn:inputMode',
  'furn:launchMode',
  'furn:renderer',
  'furn:target',
]);

export type MatchedCapabilities = {
  clickMode: DesktopClickMode;
  hostInfo: DesktopHostInfo;
  inputMode: DesktopInputMode;
  launchMode: 'attach' | 'launch';
  requested: Record<string, unknown>;
  target: DesktopTarget;
};

export function getCapabilityCandidates(capabilities: NewSessionCapabilities): Record<string, unknown>[] {
  if (!capabilities || typeof capabilities !== 'object' || Array.isArray(capabilities)) {
    throw invalidArgument('"capabilities" must be an object.');
  }
  const alwaysMatch = validateCapabilityObject(capabilities.alwaysMatch ?? {}, 'alwaysMatch');
  const firstMatch = capabilities.firstMatch ?? [{}];
  if (!Array.isArray(firstMatch) || firstMatch.length === 0) {
    throw invalidArgument('"firstMatch" must be a non-empty array when provided.');
  }

  return firstMatch.map((entry, index) => {
    const candidate = validateCapabilityObject(entry, `firstMatch[${index}]`);
    for (const key of Object.keys(candidate)) {
      if (key in alwaysMatch) {
        throw invalidArgument(`Capability "${key}" appears in both alwaysMatch and firstMatch[${index}].`);
      }
    }
    return { ...alwaysMatch, ...candidate };
  });
}

export async function matchCapabilities(
  capabilities: NewSessionCapabilities,
  targets: readonly DesktopTarget[],
): Promise<MatchedCapabilities> {
  const candidates = getCapabilityCandidates(capabilities);
  for (const requested of candidates) {
    validateCapabilityNames(requested);
    const requestedClickMode = validateClickMode(requested['furn:clickMode']);
    const inputMode = validateInputMode(requested['furn:inputMode']);
    const launchMode = validateLaunchMode(requested['furn:launchMode']);
    const targetId = validateOptionalText(requested, 'furn:target');
    validateOptionalText(requested, 'furn:endpoint');
    validateOptionalText(requested, 'furn:renderer');
    const candidatesForTarget =
      targetId !== undefined ? targets.filter((target) => target.id === targetId) : targets.length === 1 ? targets : [];

    for (const target of candidatesForTarget) {
      if (requested.browserName !== undefined && requested.browserName !== 'furn-native-desktop') {
        continue;
      }
      if (requested.platformName !== undefined && requested.platformName !== target.platformName) {
        continue;
      }
      if (requested['furn:endpoint'] !== undefined && requested['furn:endpoint'] !== target.endpoint) {
        continue;
      }
      if (requested['furn:renderer'] !== undefined && requested['furn:renderer'] !== target.renderer) {
        continue;
      }

      let host: DesktopHostInfo;
      try {
        host = await withCommandTimeout((signal) => target.host.probe(signal), 10_000, `Probing target "${target.id}"`);
      } catch (error) {
        const webdriverError = toWebDriverError(error);
        throw new WebDriverError('session not created', webdriverError.message, webdriverError.data);
      }
      const clickMode = resolveClickMode(requestedClickMode, host, inputMode);
      return { clickMode, hostInfo: host, inputMode, launchMode, requested, target };
    }
  }

  throw new WebDriverError('session not created', 'No registered desktop target matched the requested capabilities.');
}

export function createReturnedCapabilities(
  matched: MatchedCapabilities,
  host: DesktopHostInfo,
  timeouts: Record<string, number | null>,
): Record<string, unknown> {
  return {
    browserName: 'furn-native-desktop',
    platformName: matched.target.platformName,
    setWindowRect: host.features.setWindowRect,
    timeouts,
    'furn:clickMode': matched.clickMode,
    'furn:endpoint': matched.target.endpoint,
    'furn:features': host.features,
    'furn:inputMode': matched.inputMode,
    'furn:launchMode': matched.launchMode,
    ...(matched.target.renderer ? { 'furn:renderer': matched.target.renderer } : {}),
    'furn:storybook': Boolean(matched.target.storyOrchestrator),
    'furn:target': matched.target.id,
  };
}

function validateCapabilityObject(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw invalidArgument(`"${name}" must be an object.`);
  }
  return value as Record<string, unknown>;
}

function validateCapabilityNames(capabilities: Record<string, unknown>): void {
  for (const name of Object.keys(capabilities)) {
    if (!standardCapabilities.has(name) && !name.includes(':')) {
      throw invalidArgument(`Extension capability "${name}" must contain a vendor prefix followed by ":".`);
    }
    if (name.startsWith('furn:') && !requestedFurnCapabilities.has(name)) {
      throw invalidArgument(`Capability "${name}" is not a "furn:" capability a request can set.`);
    }
  }
}

function validateOptionalText(capabilities: Record<string, unknown>, name: string): string | undefined {
  const value = capabilities[name];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string' || value.length === 0) {
    throw invalidArgument(`"${name}" must be a non-empty string.`);
  }
  return value;
}

function validateClickMode(requested: unknown): DesktopClickMode | 'auto' {
  const clickMode = requested ?? 'auto';
  if (clickMode !== 'auto' && clickMode !== 'physical' && clickMode !== 'accessibility') {
    throw invalidArgument('"furn:clickMode" must be "auto", "physical", or "accessibility".');
  }
  return clickMode;
}

function validateInputMode(requested: unknown): DesktopInputMode {
  const inputMode = requested ?? 'compatibility';
  if (!(desktopInputModes as readonly unknown[]).includes(inputMode)) {
    throw invalidArgument(`"furn:inputMode" must be one of: ${desktopInputModes.join(', ')}.`);
  }
  return inputMode as DesktopInputMode;
}

function validateLaunchMode(requested: unknown): 'attach' | 'launch' {
  const launchMode = requested ?? 'launch';
  if (launchMode !== 'attach' && launchMode !== 'launch') {
    throw invalidArgument('"furn:launchMode" must be "attach" or "launch".');
  }
  return launchMode;
}

/**
 * A strict input mode decides the click transport, so a conflicting request fails. It does not require the host to
 * click at all, because a session may only type or clear; a click the host cannot deliver is refused when it is sent.
 */
function resolveClickMode(clickMode: DesktopClickMode | 'auto', host: DesktopHostInfo, inputMode: DesktopInputMode): DesktopClickMode {
  if (inputMode !== 'compatibility') {
    const pinned: DesktopClickMode = inputMode === 'accessible' ? 'accessibility' : 'physical';
    if (clickMode !== 'auto' && clickMode !== pinned) {
      throw new WebDriverError('session not created', `"furn:clickMode" "${clickMode}" conflicts with "furn:inputMode" "${inputMode}".`);
    }
    return pinned;
  }
  if (clickMode === 'physical' && !host.features.physicalClick) {
    throw new WebDriverError('session not created', 'The target does not support physical click input.');
  }
  if (clickMode === 'accessibility' && !host.features.accessibilityClick) {
    throw new WebDriverError('session not created', 'The target does not support accessibility click input.');
  }
  if (clickMode === 'auto' && !host.features.physicalClick && !host.features.accessibilityClick) {
    throw new WebDriverError('session not created', 'The target does not support any click input mode.');
  }
  return clickMode === 'auto' ? (host.features.physicalClick ? 'physical' : 'accessibility') : clickMode;
}
