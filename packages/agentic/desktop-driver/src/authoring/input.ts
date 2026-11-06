import type { DesktopEndpoint } from '../protocol/types.js';

export const desktopRequirements = [
  'accessibility-actions',
  'accessibility-click',
  'click',
  'element-screenshot',
  'focus',
  'keyboard',
  'physical-click',
  'screenshot',
  'set-window-rect',
  'wheel',
] as const;

export type DesktopRequirement = (typeof desktopRequirements)[number];
export type DesktopInput = 'accessible' | 'physical' | 'both';
export type DesktopInputLane = Exclude<DesktopInput, 'both'>;
export type DesktopPlatforms =
  | readonly [DesktopEndpoint, ...DesktopEndpoint[]]
  | readonly [`!${DesktopEndpoint}`, ...`!${DesktopEndpoint}`[]];

export type DesktopCaseOptions = {
  input?: DesktopInput;
  requires?: readonly DesktopRequirement[];
  platforms?: DesktopPlatforms;
  scope?: Readonly<Record<string, readonly [string, ...string[]]>>;
  unsupported?: { platforms: DesktopPlatforms; reason: string; issue?: string };
  quarantine?: {
    issue: string;
    reason: string;
    expires: string;
    platforms?: DesktopPlatforms;
    input?: DesktopInputLane;
  };
};

export type ResolvedDesktopCaseOptions = DesktopCaseOptions & {
  input: DesktopInput;
  inputSource: 'declared' | 'derived';
};

const physicalRequirements = new Set<DesktopRequirement>(['physical-click', 'keyboard', 'wheel']);
const accessibleRequirements = new Set<DesktopRequirement>(['accessibility-click']);
const endpoints = ['macos', 'windows', 'win32'] as const;
const requirementSet = new Set<string>(desktopRequirements);

export function resolveDesktopInput(input?: DesktopInput, requires: readonly DesktopRequirement[] = []): DesktopInput {
  const physical = requires.some((requirement) => physicalRequirements.has(requirement));
  const accessible = requires.some((requirement) => accessibleRequirements.has(requirement));
  if (physical && accessible) {
    throw new TypeError('A desktop test cannot require both physical and accessible input; split the case.');
  }
  const derived = physical ? 'physical' : accessible ? 'accessible' : 'both';
  if (input !== undefined && derived !== 'both' && input !== derived) {
    throw new TypeError(`input "${input}" cannot widen the modality derived from requires ("${derived}").`);
  }
  return input ?? derived;
}

export function validateDesktopCaseOptions(value: unknown, source = 'desktop test options'): ResolvedDesktopCaseOptions {
  const options = object(value, source);
  exactKeys(options, ['input', 'requires', 'platforms', 'scope', 'unsupported', 'quarantine'], source);
  if (options.input !== undefined && !['accessible', 'physical', 'both'].includes(options.input as string)) {
    throw new TypeError(`${source}.input must be accessible, physical, or both.`);
  }
  const requires: DesktopRequirement[] = [];
  if (options.requires !== undefined) {
    if (!Array.isArray(options.requires)) throw new TypeError(`${source}.requires must be an array.`);
    const seen = new Set<string>();
    for (const requirement of options.requires) {
      if (typeof requirement !== 'string' || !requirementSet.has(requirement)) {
        throw new TypeError(`${source}.requires contains an unsupported requirement.`);
      }
      if (seen.has(requirement)) throw new TypeError(`${source}.requires contains duplicate "${requirement}".`);
      seen.add(requirement);
      requires.push(requirement as DesktopRequirement);
    }
  }
  validatePlatforms(options.platforms, `${source}.platforms`);
  validateScope(options.scope, `${source}.scope`);
  if (options.unsupported !== undefined) {
    const unsupported = object(options.unsupported, `${source}.unsupported`);
    exactKeys(unsupported, ['platforms', 'reason', 'issue'], `${source}.unsupported`);
    validatePlatforms(unsupported.platforms, `${source}.unsupported.platforms`, true);
    nonEmptyString(unsupported.reason, `${source}.unsupported.reason`);
    if (unsupported.issue !== undefined) nonEmptyString(unsupported.issue, `${source}.unsupported.issue`);
  }
  if (options.quarantine !== undefined) {
    const quarantine = object(options.quarantine, `${source}.quarantine`);
    exactKeys(quarantine, ['issue', 'reason', 'expires', 'platforms', 'input'], `${source}.quarantine`);
    nonEmptyString(quarantine.issue, `${source}.quarantine.issue`);
    nonEmptyString(quarantine.reason, `${source}.quarantine.reason`);
    if (typeof quarantine.expires !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(quarantine.expires)) {
      throw new TypeError(`${source}.quarantine.expires must be an ISO date.`);
    }
    if (quarantine.input !== undefined && !['accessible', 'physical'].includes(quarantine.input as string)) {
      throw new TypeError(`${source}.quarantine.input must be accessible or physical.`);
    }
    validatePlatforms(quarantine.platforms, `${source}.quarantine.platforms`);
  }
  const resolvedInput = resolveDesktopInput(options.input as DesktopInput | undefined, requires);
  return {
    ...(options.input === undefined ? {} : { input: options.input as DesktopInput }),
    ...(options.requires === undefined ? {} : { requires }),
    ...(options.platforms === undefined ? {} : { platforms: options.platforms as DesktopPlatforms }),
    ...(options.scope === undefined ? {} : { scope: options.scope as DesktopCaseOptions['scope'] }),
    ...(options.unsupported === undefined ? {} : { unsupported: options.unsupported as DesktopCaseOptions['unsupported'] }),
    ...(options.quarantine === undefined ? {} : { quarantine: options.quarantine as DesktopCaseOptions['quarantine'] }),
    input: resolvedInput,
    inputSource: options.input === undefined ? 'derived' : 'declared',
  };
}

export function matchesDesktopPlatforms(platforms: DesktopPlatforms | undefined, endpoint: DesktopEndpoint): boolean {
  if (platforms === undefined) return true;
  const negative = platforms[0].startsWith('!');
  const values = platforms.map((platform) => (negative ? platform.slice(1) : platform));
  return negative ? !values.includes(endpoint) : values.includes(endpoint);
}

function validatePlatforms(value: unknown, source: string, required = false): void {
  if (value === undefined && !required) return;
  if (!Array.isArray(value) || value.length === 0) throw new TypeError(`${source} must be a non-empty platform list.`);
  const negative = typeof value[0] === 'string' && value[0].startsWith('!');
  const seen = new Set<string>();
  for (const entry of value) {
    if (typeof entry !== 'string') throw new TypeError(`${source} contains an unsupported platform.`);
    const platform = negative ? entry.slice(1) : entry;
    if (entry.startsWith('!') !== negative || !endpoints.includes(platform as (typeof endpoints)[number])) {
      throw new TypeError(`${source} must contain only known ${negative ? 'negated ' : ''}platforms.`);
    }
    if (seen.has(platform)) throw new TypeError(`${source} contains duplicate "${entry}".`);
    seen.add(platform);
  }
  if (negative && seen.size === endpoints.length) throw new TypeError(`${source} cannot exclude every platform.`);
}

function validateScope(value: unknown, source: string): void {
  if (value === undefined) return;
  const scope = object(value, source);
  for (const [key, values] of Object.entries(scope)) {
    if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(key)) throw new TypeError(`${source} contains invalid key "${key}".`);
    if (!Array.isArray(values) || values.length === 0) throw new TypeError(`${source}.${key} must be a non-empty value list.`);
    const seen = new Set<string>();
    for (const item of values) {
      if (typeof item !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(item)) {
        throw new TypeError(`${source}.${key} contains an invalid value.`);
      }
      if (seen.has(item)) throw new TypeError(`${source}.${key} contains duplicate "${item}".`);
      seen.add(item);
    }
  }
}

function object(value: unknown, source: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${source} must be an object.`);
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, allowed: readonly string[], source: string): void {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new TypeError(`${source} contains unknown field "${key}".`);
}

function nonEmptyString(value: unknown, source: string): void {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${source} must be a non-empty string.`);
}
