import type { DesktopEndpoint } from '../protocol/types.js';

export const desktopRequirements = [
  'accessibility-actions',
  'accessibility-click',
  'click',
  'element-screenshot',
  'focus',
  'keyboard',
  'perform-accessibility-action',
  'physical-click',
  'screenshot',
  'set-window-rect',
  'wheel',
] as const;

export type DesktopRequirement = (typeof desktopRequirements)[number];
export type DesktopInput = 'accessible' | 'physical' | 'both';
export type DesktopInputLane = Exclude<DesktopInput, 'both'>;
export const desktopInputLanes = ['accessible', 'physical'] as const satisfies readonly DesktopInputLane[];

/**
 * The input policy a Desktop Driver session enforces, fixed when the session is created (`furn:inputMode`). `accessible`
 * delivers only semantic input, `physical` clicks physically and clears with the keyboard, and `compatibility`, the
 * default, enforces nothing beyond the host's own masks.
 */
export const desktopInputModes = ['accessible', 'compatibility', 'physical'] as const;
export type DesktopInputMode = (typeof desktopInputModes)[number];

/**
 * How a session delivered input, as it records it when it dispatches. `unattributed-clear` is a clear whose host did not
 * say whether it set the value or typed, so it counts as possible keyboard input.
 */
export const desktopInputMechanisms = [
  'accessibility-action',
  'accessibility-click',
  'keyboard',
  'physical-click',
  'pointer',
  'semantic-clear',
  'unattributed-clear',
  'wheel',
] as const;
export type DesktopInputMechanism = (typeof desktopInputMechanisms)[number];

/** How many times a session delivered input by each mechanism. A mechanism it never used is absent. */
export type DesktopInputReceipts = Readonly<Partial<Record<DesktopInputMechanism, number>>>;

/** What `GET /session/:id/furn/input` returns: the session's policy and the input it delivered. */
export type DesktopSessionInput = {
  mode: DesktopInputMode;
  receipts: DesktopInputReceipts;
};

/**
 * Whether a session's input policy lets it deliver a mechanism. An accessible session delivers only semantic input; a
 * physical session clicks physically or semantically but clears only with the keyboard. A strict session never makes an
 * unattributed clear, because it always says how to clear.
 */
export function desktopInputModeAllows(mode: DesktopInputMode, mechanism: DesktopInputMechanism): boolean {
  switch (mode) {
    case 'accessible':
      return mechanism === 'accessibility-action' || mechanism === 'accessibility-click' || mechanism === 'semantic-clear';
    case 'physical':
      return mechanism !== 'semantic-clear' && mechanism !== 'unattributed-clear';
    default:
      return true;
  }
}

/**
 * The declarations that account for each mechanism. A semantic clear needs none: it is not physical input, and a case
 * that clears declares the keyboard its physical variant types with.
 */
const mechanismRequirements: Readonly<Record<DesktopInputMechanism, readonly DesktopRequirement[]>> = {
  'accessibility-action': ['perform-accessibility-action'],
  'accessibility-click': ['accessibility-click', 'click'],
  keyboard: ['keyboard'],
  'physical-click': ['physical-click', 'click'],
  pointer: ['physical-click'],
  'semantic-clear': [],
  'unattributed-clear': ['keyboard'],
  wheel: ['wheel'],
};

/** What one case delivered, judged against what it declared. */
export type DesktopInputComparison = {
  /** Mechanisms the case delivered that none of its declarations accounts for. Any entry fails the case. */
  undeclared: DesktopInputMechanism[];
  /** Transport requirements the case declared and never exercised. Reported, never failed. */
  unused: DesktopRequirement[];
};

/** Subtracts one receipt snapshot from a later one of the same session, for a runner that shares a session across cases. */
export function subtractDesktopInputReceipts(after: DesktopInputReceipts, before: DesktopInputReceipts): DesktopInputReceipts {
  const delta: Partial<Record<DesktopInputMechanism, number>> = {};
  for (const mechanism of desktopInputMechanisms) {
    const count = (after[mechanism] ?? 0) - (before[mechanism] ?? 0);
    if (count > 0) delta[mechanism] = count;
  }
  return delta;
}

/**
 * Compares the input a case delivered with its declaration. Receipts are the authority: a declaration only promises, so
 * a mechanism nothing declared fails the case, while a declared transport the case did not use is only reported. Pass the
 * session's click mode: under `auto` the host, not the case, chose how to click, so any click declaration accounts for
 * either click transport.
 */
export function compareDesktopInputReceipts(
  descriptor: Pick<DesktopCaseOptions, 'requires'> | undefined,
  receipts: unknown,
  clickMode?: 'accessibility' | 'auto' | 'physical',
): DesktopInputComparison {
  const delivered = validateDesktopInputReceipts(receipts);
  const used = desktopInputMechanisms.filter((mechanism) => delivered[mechanism] !== undefined);
  const declared = descriptor?.requires ?? [];
  const hostClicks = clickMode === 'auto' && declared.some((requirement) => clickRequirements.has(requirement));
  const accounts = (mechanism: DesktopInputMechanism): readonly DesktopRequirement[] =>
    hostClicks && clickMechanisms.has(mechanism)
      ? [...mechanismRequirements[mechanism], ...clickRequirements]
      : mechanismRequirements[mechanism];
  const undeclared = used.filter(
    (mechanism) => accounts(mechanism).length > 0 && !accounts(mechanism).some((requirement) => declared.includes(requirement)),
  );
  const unused = declared.filter(
    (requirement) => inputRequirements.has(requirement) && !used.some((mechanism) => accounts(mechanism).includes(requirement)),
  );
  return { undeclared, unused };
}

/** Names each undeclared mechanism with the requirements that would declare it, for the failure of a case that delivered it. */
export function describeUndeclaredDesktopInput(undeclared: readonly DesktopInputMechanism[]): string {
  const named = undeclared.map((mechanism) => `${mechanism} (declare ${mechanismRequirements[mechanism].join(' or ')})`);
  return `The test delivered input it does not declare: ${named.join(', ')}.`;
}

/** Checks a receipt report read from a driver, so a malformed one is an error rather than an empty record. */
export function validateDesktopInputReceipts(value: unknown, source = 'input receipts'): DesktopInputReceipts {
  const receipts = object(value, source);
  for (const [mechanism, count] of Object.entries(receipts)) {
    if (!(desktopInputMechanisms as readonly string[]).includes(mechanism))
      throw new TypeError(`${source} has unknown mechanism "${mechanism}".`);
    if (!Number.isSafeInteger(count) || (count as number) < 1) throw new TypeError(`${source}.${mechanism} must be a positive integer.`);
  }
  return receipts as DesktopInputReceipts;
}

/** Checks a session's input report, so a driver that omits its policy is never mistaken for one that enforces it. */
export function validateDesktopSessionInput(value: unknown, source = 'session input'): DesktopSessionInput {
  const report = object(value, source);
  exactKeys(report, ['mode', 'receipts'], source);
  if (!(desktopInputModes as readonly unknown[]).includes(report.mode))
    throw new TypeError(`${source}.mode must be one of: ${desktopInputModes.join(', ')}.`);
  return { mode: report.mode as DesktopInputMode, receipts: validateDesktopInputReceipts(report.receipts, `${source}.receipts`) };
}

/**
 * The input an accessible lane keeps from reaching the application. A host that reports any of these as anything other
 * than `false` cannot back the lane, because a case could then deliver physical input without anyone noticing.
 */
export const accessibleLaneMaskedFeatures = ['keyboard', 'physicalClick', 'wheel'] as const;
export type AccessibleLaneMaskedFeature = (typeof accessibleLaneMaskedFeatures)[number];

/** The masked features a host still offers. A missing report counts as unmasked, so the check fails closed. */
export function unmaskedAccessibleFeatures(features: unknown): readonly AccessibleLaneMaskedFeature[] {
  const reported = typeof features === 'object' && features !== null ? (features as Readonly<Record<string, unknown>>) : {};
  return accessibleLaneMaskedFeatures.filter((feature) => reported[feature] !== false);
}

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
const accessibleRequirements = new Set<DesktopRequirement>(['accessibility-click', 'perform-accessibility-action']);
/** Requirements that promise input, so receipts can show one went unused. */
const inputRequirements = new Set<DesktopRequirement>(['click', ...physicalRequirements, ...accessibleRequirements]);
const clickRequirements = new Set<DesktopRequirement>(['accessibility-click', 'click', 'physical-click']);
const clickMechanisms = new Set<DesktopInputMechanism>(['accessibility-click', 'physical-click']);
const endpoints = ['macos', 'windows', 'win32'] as const;
const requirementSet = new Set<string>(desktopRequirements);

/**
 * Derives a case's input lane from what it requires. A case that needs both transports runs only in the physical lane,
 * whose sessions also deliver declared accessible input, and must say so with an explicit `input: 'physical'`.
 */
export function resolveDesktopInput(input?: DesktopInput, requires: readonly DesktopRequirement[] = []): DesktopInput {
  const physical = requires.some((requirement) => physicalRequirements.has(requirement));
  const accessible = requires.some((requirement) => accessibleRequirements.has(requirement));
  if (physical && accessible) {
    if (input === 'physical') return input;
    throw new TypeError(
      'A desktop test that requires both physical and accessible input must declare input: "physical", whose sessions deliver both; otherwise split the case.',
    );
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

/**
 * Validates the options of a group. A group scopes the cases inside it, so it can narrow where they run and add what they
 * require, but a gap describes one case and cannot be declared on a group.
 */
export function validateDesktopGroupOptions(value: unknown, source = 'desktop group options'): ResolvedDesktopCaseOptions {
  const options = validateDesktopCaseOptions(value, source);
  if (options.unsupported || options.quarantine) {
    throw new TypeError(`${source} cannot declare unsupported or quarantine; declare the gap on the case.`);
  }
  return options;
}

/**
 * Composes the options of an enclosing group with those of a nested group or case. Requirements add up, platforms and
 * scope values intersect, and `input` can only narrow, so nothing inside a group can claim less than the group's own setup
 * needs. A combination that could never run is an error rather than a silent exclusion.
 */
export function mergeDesktopCaseOptions(
  parent: ResolvedDesktopCaseOptions | undefined,
  child: ResolvedDesktopCaseOptions,
  source = 'desktop test options',
): ResolvedDesktopCaseOptions {
  if (!parent) return child;
  const platforms = endpoints.filter(
    (endpoint) => matchesDesktopPlatforms(parent.platforms, endpoint) && matchesDesktopPlatforms(child.platforms, endpoint),
  );
  if (platforms.length === 0) throw new TypeError(`${source}.platforms do not overlap the enclosing group's, so it could never run.`);
  const scope = intersectScope(parent.scope, child.scope, source);
  const input = mergeDeclaredInput(parent, child, source);
  return validateDesktopCaseOptions(
    {
      ...(input ? { input } : {}),
      requires: [...new Set([...(parent.requires ?? []), ...(child.requires ?? [])])],
      ...(platforms.length < endpoints.length ? { platforms } : {}),
      ...(scope ? { scope } : {}),
      ...(child.unsupported ? { unsupported: child.unsupported } : {}),
      ...(child.quarantine ? { quarantine: child.quarantine } : {}),
    },
    source,
  );
}

function mergeDeclaredInput(
  parent: ResolvedDesktopCaseOptions,
  child: ResolvedDesktopCaseOptions,
  source: string,
): DesktopInput | undefined {
  // An explicit `both` narrows nothing, so it must not stop a nested case from deriving a transport.
  const enclosing = parent.inputSource === 'declared' && parent.input !== 'both' ? parent.input : undefined;
  if (child.inputSource !== 'declared') return enclosing;
  if (enclosing && child.input !== enclosing)
    throw new TypeError(`${source}.input "${child.input}" cannot change the enclosing group's "${enclosing}".`);
  return child.input;
}

function intersectScope(
  parent: DesktopCaseOptions['scope'],
  child: DesktopCaseOptions['scope'],
  source: string,
): Record<string, string[]> | undefined {
  if (!parent && !child) return undefined;
  const merged: Record<string, string[]> = {};
  for (const key of new Set([...Object.keys(parent ?? {}), ...Object.keys(child ?? {})])) {
    const left = parent?.[key];
    const right = child?.[key];
    const values = left && right ? left.filter((value) => right.includes(value)) : [...(left ?? right ?? [])];
    if (values.length === 0) throw new TypeError(`${source}.scope.${key} does not overlap the enclosing group's, so it could never run.`);
    merged[key] = values;
  }
  return merged;
}

export function matchesDesktopPlatforms(platforms: DesktopPlatforms | undefined, endpoint: DesktopEndpoint): boolean {
  if (platforms === undefined) return true;
  const negative = platforms[0].startsWith('!');
  const values = platforms.map((platform) => (negative ? platform.slice(1) : platform));
  return negative ? !values.includes(endpoint) : values.includes(endpoint);
}

/** Allowed values per scope key. */
export type DesktopScopeDomains = Readonly<Record<string, readonly string[]>>;
/** The one value a target holds for each scope key it supplies. */
export type DesktopScopeValues = Readonly<Record<string, string>>;

const builtInScopeDomains: DesktopScopeDomains = Object.freeze({ 'rn.renderer': Object.freeze(['fabric', 'paper']) });

/**
 * The built-in domains plus any custom ones. A consumer adds its own keys, such as a product flavor, but `rn.*` belongs to
 * the framework so a test written for `rn.renderer` means the same thing everywhere.
 */
export function resolveDesktopScopeDomains(custom?: unknown, source = 'testScopes'): DesktopScopeDomains {
  if (custom === undefined) return builtInScopeDomains;
  const resolved: Record<string, readonly string[]> = { ...builtInScopeDomains };
  for (const [key, values] of Object.entries(object(custom, source))) {
    if (key.startsWith('rn.')) throw new TypeError(`${source} cannot declare "${key}"; the rn.* scope keys are reserved.`);
    resolved[key] = Object.freeze([...scopeEntry(key, values, source)]);
  }
  return Object.freeze(resolved);
}

/** Checks that every key a target supplies is a known domain and that its value belongs to it. */
export function resolveDesktopScopeValues(supplied: unknown, domains: DesktopScopeDomains, source = 'testScope'): DesktopScopeValues {
  const resolved: Record<string, string> = {};
  for (const [key, value] of Object.entries(object(supplied, source))) {
    const domain = ownDomain(domains, key);
    if (!domain) throw new TypeError(`${source} uses unknown scope key "${key}".`);
    if (typeof value !== 'string' || !domain.includes(value)) throw new TypeError(`${source}.${key} must be one of: ${domain.join(', ')}.`);
    resolved[key] = value;
  }
  return Object.freeze(resolved);
}

/**
 * Values OR within a key and keys AND. An undeclared key or value, or a key the target does not supply, is a
 * configuration error rather than an exclusion, so a typo cannot silently drop a case. Every key is checked before the
 * result is returned.
 */
export function matchesDesktopScope(
  scope: DesktopCaseOptions['scope'],
  supplied: DesktopScopeValues,
  domains: DesktopScopeDomains,
  source = 'desktop test scope',
): boolean {
  let matches = true;
  for (const [key, values] of Object.entries(scope ?? {})) {
    const domain = ownDomain(domains, key);
    if (!domain) throw new TypeError(`${source} uses unknown scope key "${key}".`);
    const unknown = values.find((value) => !domain.includes(value));
    if (unknown !== undefined) throw new TypeError(`${source}.${key} uses "${unknown}", which is not one of: ${domain.join(', ')}.`);
    const actual = Object.hasOwn(supplied, key) ? supplied[key] : undefined;
    if (actual === undefined) throw new TypeError(`${source}.${key} is not supplied by this target.`);
    if (!values.includes(actual)) matches = false;
  }
  return matches;
}

function ownDomain(domains: DesktopScopeDomains, key: string): readonly string[] | undefined {
  return Object.hasOwn(domains, key) ? domains[key] : undefined;
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
  for (const [key, values] of Object.entries(object(value, source))) scopeEntry(key, values, source);
}

function scopeEntry(key: string, values: unknown, source: string): readonly string[] {
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
  return values as readonly string[];
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
