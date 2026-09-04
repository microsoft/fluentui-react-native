import type { WebDriverActionSequence } from '../protocol/types.js';
import { createInputState, parseActionSequences } from '../protocol/actions.js';

export const desktopStoryPlatforms = ['macos', 'windows', 'win32'] as const;
export const desktopStoryCapabilities = [
  'accessibility-click',
  'element-screenshot',
  'focus',
  'keyboard',
  'physical-click',
  'screenshot',
  'wheel',
] as const;

export type DesktopStoryPlatform = (typeof desktopStoryPlatforms)[number];
export type DesktopStoryCapability = (typeof desktopStoryCapabilities)[number];

export type DesktopStorySelector = { testId: string } | { role: string; name?: string } | { accessibleName: string } | { text: string };

export type DesktopStoryState =
  | 'accessibleName'
  | 'checked'
  | 'count'
  | 'displayed'
  | 'enabled'
  | 'expanded'
  | 'exists'
  | 'focused'
  | 'role'
  | 'selected'
  | 'text'
  | 'value';

export type DesktopStoryExpectation = {
  state: DesktopStoryState;
  target: DesktopStorySelector;
  value?: boolean | number | string;
};

export type DesktopStoryStep =
  | { action: 'actions'; sequences: readonly WebDriverActionSequence[] }
  | { action: 'clear' | 'click' | 'doubleClick' | 'focus'; target: DesktopStorySelector }
  | { action: 'keys'; value: readonly string[] }
  | { action: 'note'; message: string }
  | { action: 'pause'; durationMs: number }
  | { action: 'screenshot'; name: string; target?: DesktopStorySelector }
  | { action: 'scroll'; deltaX?: number; deltaY: number; target?: DesktopStorySelector }
  | { action: 'setArgs'; args: Readonly<Record<string, unknown>> }
  | { action: 'source'; name: string }
  | { action: 'type'; target: DesktopStorySelector; text: string }
  | { action: 'wait'; target?: DesktopStorySelector; timeoutMs?: number; until?: DesktopStoryExpectation }
  | { expect: DesktopStoryExpectation };

export type DesktopStoryQuarantine = {
  expires: string;
  issue: string;
  owner: string;
  reason?: string;
};

export type DesktopStoryTestVariant = {
  requires?: readonly DesktopStoryCapability[];
  steps: readonly DesktopStoryStep[];
};

export type DesktopStoryTest = {
  id: string;
  platformVariants?: Partial<Record<DesktopStoryPlatform, DesktopStoryTestVariant>>;
  platforms?: readonly DesktopStoryPlatform[];
  quarantine?: DesktopStoryQuarantine;
  requires?: readonly DesktopStoryCapability[];
  steps: readonly DesktopStoryStep[];
  title?: string;
};

export type DesktopStoryTests = {
  portable?: boolean;
  supportedPlatforms?: readonly DesktopStoryPlatform[];
  tests: readonly DesktopStoryTest[];
  traversePlatforms?: readonly DesktopStoryPlatform[];
  version: 1;
};

export const desktopBy = {
  accessibleName: (accessibleName: string): DesktopStorySelector => ({ accessibleName }),
  role: (role: string, name?: string): DesktopStorySelector => ({ role, ...(name ? { name } : {}) }),
  testId: (testId: string): DesktopStorySelector => ({ testId }),
  text: (text: string): DesktopStorySelector => ({ text }),
};

export function defineDesktopStoryTests(plan: DesktopStoryTests): DesktopStoryTests {
  return validateDesktopStoryTests(plan);
}

export function validateDesktopStoryTests(value: unknown, source = 'desktopDriver'): DesktopStoryTests {
  const plan = requireObject(value, source);
  requireExactKeys(plan, ['portable', 'supportedPlatforms', 'tests', 'traversePlatforms', 'version'], source);
  if (plan.version !== 1) {
    throw new TypeError(`${source}.version must be 1.`);
  }
  if (plan.portable !== undefined && typeof plan.portable !== 'boolean') {
    throw new TypeError(`${source}.portable must be a boolean when provided.`);
  }
  validateEnumArray(plan.supportedPlatforms, desktopStoryPlatforms, `${source}.supportedPlatforms`);
  validateEnumArray(plan.traversePlatforms, desktopStoryPlatforms, `${source}.traversePlatforms`, true);
  if (!Array.isArray(plan.tests)) {
    throw new TypeError(`${source}.tests must be an array.`);
  }

  const ids = new Set<string>();
  const supportedPlatforms = (plan.supportedPlatforms as readonly DesktopStoryPlatform[] | undefined) ?? desktopStoryPlatforms;
  const traversePlatforms = (plan.traversePlatforms as readonly DesktopStoryPlatform[] | undefined) ?? supportedPlatforms;
  assertSubset(traversePlatforms, supportedPlatforms, `${source}.traversePlatforms`, `${source}.supportedPlatforms`);
  for (const [index, testValue] of plan.tests.entries()) {
    const test = validateTest(testValue, `${source}.tests[${index}]`, ids);
    const testPlatforms = (test.platforms as readonly DesktopStoryPlatform[] | undefined) ?? supportedPlatforms;
    assertSubset(testPlatforms, supportedPlatforms, `${source}.tests[${index}].platforms`, `${source}.supportedPlatforms`);
    if (test.platformVariants !== undefined) {
      const variants = test.platformVariants as Record<string, unknown>;
      const variantPlatforms = Object.keys(variants) as DesktopStoryPlatform[];
      assertSubset(variantPlatforms, testPlatforms, `${source}.tests[${index}].platformVariants`, `${source}.tests[${index}].platforms`);
    }
  }
  assertJsonValue(value, source);
  return value as DesktopStoryTests;
}

export function resolveDesktopStoryTests(plan: DesktopStoryTests, platform: DesktopStoryPlatform): DesktopStoryTests | undefined {
  if (plan.supportedPlatforms && !plan.supportedPlatforms.includes(platform)) {
    return undefined;
  }

  const tests = plan.tests
    .filter((test) => !test.platforms || test.platforms.includes(platform))
    .map((test) => {
      const { platformVariants, platforms: _platforms, ...base } = test;
      const variant = platformVariants?.[platform];
      if (!variant) {
        return base;
      }
      const { requires: _requires, steps: _steps, ...identity } = base;
      return {
        ...identity,
        ...(variant.requires ? { requires: variant.requires } : {}),
        steps: variant.steps,
      };
    });

  return {
    ...plan,
    tests,
  };
}

function validateTest(value: unknown, source: string, ids: Set<string>): Record<string, unknown> {
  const test = requireObject(value, source);
  requireExactKeys(test, ['id', 'platformVariants', 'platforms', 'quarantine', 'requires', 'steps', 'title'], source);
  if (typeof test.id !== 'string' || !test.id) {
    throw new TypeError(`${source}.id must be a non-empty string.`);
  }
  if (ids.has(test.id)) {
    throw new TypeError(`${source} contains duplicate test id "${test.id}".`);
  }
  ids.add(test.id);
  if (test.title !== undefined && (typeof test.title !== 'string' || !test.title)) {
    throw new TypeError(`${source}.title must be a non-empty string when provided.`);
  }
  validateEnumArray(test.platforms, desktopStoryPlatforms, `${source}.platforms`);
  validateEnumArray(test.requires, desktopStoryCapabilities, `${source}.requires`);
  validateSteps(test.steps, `${source}.steps`);
  validatePlatformVariants(test.platformVariants, `${source}.platformVariants`);
  validateQuarantine(test.quarantine, `${source}.quarantine`);
  return test;
}

function validateStep(value: unknown, source: string): void {
  const step = requireObject(value, source);
  if ('expect' in step) {
    requireExactKeys(step, ['expect'], source);
    validateExpectation(step.expect, `${source}.expect`);
    return;
  }
  if (typeof step.action !== 'string') {
    throw new TypeError(`${source}.action must be a supported action string.`);
  }
  switch (step.action) {
    case 'actions':
      requireExactKeys(step, ['action', 'sequences'], source);
      if (!Array.isArray(step.sequences) || step.sequences.length === 0) {
        throw new TypeError(`${source}.sequences must be a non-empty array.`);
      }
      try {
        parseActionSequences(step.sequences, createInputState());
      } catch (error) {
        throw new TypeError(`${source}.sequences are invalid: ${(error as Error).message}`, { cause: error });
      }
      return;
    case 'clear':
    case 'click':
    case 'doubleClick':
    case 'focus':
      requireExactKeys(step, ['action', 'target'], source);
      validateSelector(step.target, `${source}.target`);
      return;
    case 'keys':
      requireExactKeys(step, ['action', 'value'], source);
      if (!Array.isArray(step.value) || !step.value.every((key) => typeof key === 'string' && key.length > 0)) {
        throw new TypeError(`${source}.value must be a non-empty string array.`);
      }
      return;
    case 'note':
      requireExactKeys(step, ['action', 'message'], source);
      requireNonEmptyString(step.message, `${source}.message`);
      return;
    case 'pause':
      requireExactKeys(step, ['action', 'durationMs'], source);
      if (!Number.isInteger(step.durationMs) || (step.durationMs as number) < 0) {
        throw new TypeError(`${source}.durationMs must be a non-negative integer.`);
      }
      return;
    case 'screenshot':
      requireExactKeys(step, ['action', 'name', 'target'], source);
      requireNonEmptyString(step.name, `${source}.name`);
      if (step.target !== undefined) {
        validateSelector(step.target, `${source}.target`);
      }
      return;
    case 'scroll':
      requireExactKeys(step, ['action', 'deltaX', 'deltaY', 'target'], source);
      requireFiniteNumber(step.deltaY, `${source}.deltaY`);
      if (step.deltaX !== undefined) {
        requireFiniteNumber(step.deltaX, `${source}.deltaX`);
      }
      if (step.target !== undefined) {
        validateSelector(step.target, `${source}.target`);
      }
      return;
    case 'setArgs':
      requireExactKeys(step, ['action', 'args'], source);
      requireObject(step.args, `${source}.args`);
      return;
    case 'source':
      requireExactKeys(step, ['action', 'name'], source);
      requireNonEmptyString(step.name, `${source}.name`);
      return;
    case 'type':
      requireExactKeys(step, ['action', 'target', 'text'], source);
      validateSelector(step.target, `${source}.target`);
      if (typeof step.text !== 'string') {
        throw new TypeError(`${source}.text must be a string.`);
      }
      return;
    case 'wait':
      requireExactKeys(step, ['action', 'target', 'timeoutMs', 'until'], source);
      if (step.target !== undefined) {
        validateSelector(step.target, `${source}.target`);
      }
      if (step.until !== undefined) {
        validateExpectation(step.until, `${source}.until`);
      }
      if (step.target === undefined && step.until === undefined) {
        throw new TypeError(`${source} requires "target" or "until".`);
      }
      if (step.timeoutMs !== undefined && (!Number.isInteger(step.timeoutMs) || (step.timeoutMs as number) < 0)) {
        throw new TypeError(`${source}.timeoutMs must be a non-negative integer.`);
      }
      return;
    default:
      throw new TypeError(`${source}.action "${step.action}" is not supported.`);
  }
}

function validateExpectation(value: unknown, source: string): void {
  const expectation = requireObject(value, source);
  requireExactKeys(expectation, ['state', 'target', 'value'], source);
  if (
    typeof expectation.state !== 'string' ||
    !(
      [
        'accessibleName',
        'checked',
        'count',
        'displayed',
        'enabled',
        'expanded',
        'exists',
        'focused',
        'role',
        'selected',
        'text',
        'value',
      ] as const
    ).includes(expectation.state as DesktopStoryState)
  ) {
    throw new TypeError(`${source}.state is not supported.`);
  }
  validateSelector(expectation.target, `${source}.target`);
  if (expectation.value !== undefined && !['boolean', 'number', 'string'].includes(typeof expectation.value)) {
    throw new TypeError(`${source}.value must be a boolean, number, or string.`);
  }
  if (typeof expectation.value === 'number' && !Number.isFinite(expectation.value)) {
    throw new TypeError(`${source}.value must be finite.`);
  }
  if (expectation.state === 'count' && typeof expectation.value !== 'number') {
    throw new TypeError(`${source}.value must be a number for a count assertion.`);
  }
  if (
    (expectation.state === 'accessibleName' ||
      expectation.state === 'role' ||
      expectation.state === 'text' ||
      expectation.state === 'value') &&
    typeof expectation.value !== 'string'
  ) {
    throw new TypeError(`${source}.value must be a string for a ${expectation.state} assertion.`);
  }
  if (
    (expectation.state === 'checked' ||
      expectation.state === 'displayed' ||
      expectation.state === 'enabled' ||
      expectation.state === 'expanded' ||
      expectation.state === 'exists' ||
      expectation.state === 'focused' ||
      expectation.state === 'selected') &&
    expectation.value !== undefined &&
    typeof expectation.value !== 'boolean' &&
    !(expectation.state === 'checked' && expectation.value === 'mixed')
  ) {
    throw new TypeError(`${source}.value must be a boolean for a ${expectation.state} assertion.`);
  }
}

function validateSelector(value: unknown, source: string): void {
  const selector = requireObject(value, source);
  const selectorKeys = ['accessibleName', 'role', 'testId', 'text'].filter((key) => selector[key] !== undefined);
  if (selectorKeys.length !== 1) {
    throw new TypeError(`${source} must define exactly one selector strategy.`);
  }
  const strategy = selectorKeys[0];
  requireNonEmptyString(selector[strategy], `${source}.${strategy}`);
  if (strategy === 'role') {
    requireExactKeys(selector, ['name', 'role'], source);
    if (selector.name !== undefined) {
      requireNonEmptyString(selector.name, `${source}.name`);
    }
  } else {
    requireExactKeys(selector, [strategy], source);
  }
}

function validateEnumArray<T extends string>(value: unknown, allowed: readonly T[], source: string, allowEmpty = false): void {
  if (value === undefined) {
    return;
  }
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string' && allowed.includes(item as T))) {
    throw new TypeError(`${source} contains an unsupported value.`);
  }
  if (!allowEmpty && value.length === 0) {
    throw new TypeError(`${source} must not be empty.`);
  }
  if (new Set(value).size !== value.length) {
    throw new TypeError(`${source} must not contain duplicate values.`);
  }
}

function validateSteps(value: unknown, source: string): void {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError(`${source} must be a non-empty array.`);
  }
  for (const [index, step] of value.entries()) {
    validateStep(step, `${source}[${index}]`);
  }
}

function validatePlatformVariants(value: unknown, source: string): void {
  if (value === undefined) {
    return;
  }
  const variants = requireObject(value, source);
  requireExactKeys(variants, desktopStoryPlatforms, source);
  if (Object.keys(variants).length === 0) {
    throw new TypeError(`${source} must not be empty.`);
  }
  for (const [platform, variantValue] of Object.entries(variants)) {
    const variant = requireObject(variantValue, `${source}.${platform}`);
    requireExactKeys(variant, ['requires', 'steps'], `${source}.${platform}`);
    validateEnumArray(variant.requires, desktopStoryCapabilities, `${source}.${platform}.requires`);
    validateSteps(variant.steps, `${source}.${platform}.steps`);
  }
}

function validateQuarantine(value: unknown, source: string): void {
  if (value === undefined) {
    return;
  }
  const quarantine = requireObject(value, source);
  requireExactKeys(quarantine, ['expires', 'issue', 'owner', 'reason'], source);
  requireNonEmptyString(quarantine.owner, `${source}.owner`);
  requireNonEmptyString(quarantine.issue, `${source}.issue`);
  requireNonEmptyString(quarantine.expires, `${source}.expires`);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(quarantine.expires as string);
  const date = match && new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (!match || !date || date.toISOString().slice(0, 10) !== quarantine.expires) {
    throw new TypeError(`${source}.expires must be a valid YYYY-MM-DD date.`);
  }
  if (quarantine.reason !== undefined) {
    requireNonEmptyString(quarantine.reason, `${source}.reason`);
  }
}

function assertSubset(values: readonly string[], allowed: readonly string[], source: string, allowedSource: string): void {
  const unsupported = values.find((value) => !allowed.includes(value));
  if (unsupported) {
    throw new TypeError(`${source} contains "${unsupported}", which is not included by ${allowedSource}.`);
  }
}

function requireExactKeys(value: Record<string, unknown>, allowed: readonly string[], source: string): void {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    throw new TypeError(`${source} contains unknown field "${unknown[0]}".`);
  }
}

function requireNonEmptyString(value: unknown, source: string): asserts value is string {
  if (typeof value !== 'string' || !value) {
    throw new TypeError(`${source} must be a non-empty string.`);
  }
}

function requireFiniteNumber(value: unknown, source: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${source} must be a finite number.`);
  }
}

function requireObject(value: unknown, source: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${source} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function assertJsonValue(value: unknown, source: string): void {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${source} must contain only finite numbers.`);
    }
    return;
  }
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertJsonValue(item, `${source}[${index}]`));
    return;
  }
  if (typeof value === 'object') {
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      assertJsonValue(item, `${source}.${key}`);
    }
    return;
  }
  throw new TypeError(`${source} must contain only JSON-serializable values.`);
}
