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

export type MatchedCapabilities = {
  clickMode: DesktopClickMode;
  hostInfo: DesktopHostInfo;
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
    const launchMode = validateLaunchMode(requested['furn:launchMode']);
    const targetId = requested['furn:target'];
    const candidatesForTarget =
      typeof targetId === 'string' ? targets.filter((target) => target.id === targetId) : targets.length === 1 ? targets : [];

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
      const clickMode = resolveClickMode(requestedClickMode, host);
      return { clickMode, hostInfo: host, launchMode, requested, target };
    }
  }

  throw new WebDriverError('session not created', 'No registered desktop target matched the requested capabilities.');
}

export function createReturnedCapabilities(
  matched: MatchedCapabilities,
  host: DesktopHostInfo,
  timeouts: Record<string, number>,
): Record<string, unknown> {
  return {
    browserName: 'furn-native-desktop',
    platformName: matched.target.platformName,
    setWindowRect: host.features.setWindowRect,
    timeouts,
    'furn:clickMode': matched.clickMode,
    'furn:endpoint': matched.target.endpoint,
    'furn:features': host.features,
    'furn:renderer': matched.target.renderer,
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
  }
}

function validateClickMode(requested: unknown): DesktopClickMode | 'auto' {
  const clickMode = requested ?? 'auto';
  if (clickMode !== 'auto' && clickMode !== 'physical' && clickMode !== 'accessibility') {
    throw invalidArgument('"furn:clickMode" must be "auto", "physical", or "accessibility".');
  }
  return clickMode;
}

function validateLaunchMode(requested: unknown): 'attach' | 'launch' {
  const launchMode = requested ?? 'launch';
  if (launchMode !== 'attach' && launchMode !== 'launch') {
    throw invalidArgument('"furn:launchMode" must be "attach" or "launch".');
  }
  return launchMode;
}

function resolveClickMode(clickMode: DesktopClickMode | 'auto', host: DesktopHostInfo): DesktopClickMode {
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
