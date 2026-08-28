export type DesktopStorySelector = { testId: string } | { role: string; name?: string } | { accessibleName: string } | { text: string };

export type DesktopStoryCapability =
  | 'accessibility-click'
  | 'element-screenshot'
  | 'focus'
  | 'keyboard'
  | 'physical-click'
  | 'screenshot'
  | 'wheel';

export type DesktopStoryStep =
  | { action: 'clear' | 'click' | 'doubleClick'; target: DesktopStorySelector }
  | { action: 'keys'; value: readonly string[] }
  | { action: 'screenshot'; name: string; target?: DesktopStorySelector }
  | { action: 'type'; target: DesktopStorySelector; text: string }
  | { action: 'wait'; target?: DesktopStorySelector; timeoutMs?: number }
  | { expect: { target: DesktopStorySelector; state: string; value?: unknown } };

export type DesktopStoryTest = {
  id: string;
  title?: string;
  platforms?: readonly ('macos' | 'windows' | 'win32')[];
  requires?: readonly DesktopStoryCapability[];
  steps: readonly DesktopStoryStep[];
};

export type DesktopStoryTests = {
  version: 1;
  portable?: boolean;
  tests: readonly DesktopStoryTest[];
};

export function validateDesktopStoryTests(value: unknown, source = 'desktopDriver'): DesktopStoryTests {
  const plan = requireObject(value, source);
  if (plan.version !== 1) {
    throw new TypeError(`${source}.version must be 1.`);
  }
  if (plan.portable !== undefined && typeof plan.portable !== 'boolean') {
    throw new TypeError(`${source}.portable must be a boolean when provided.`);
  }
  if (!Array.isArray(plan.tests)) {
    throw new TypeError(`${source}.tests must be an array.`);
  }

  const ids = new Set<string>();
  for (const [index, value] of plan.tests.entries()) {
    const test = requireObject(value, `${source}.tests[${index}]`);
    if (typeof test.id !== 'string' || !test.id) {
      throw new TypeError(`${source}.tests[${index}].id must be a non-empty string.`);
    }
    if (ids.has(test.id)) {
      throw new TypeError(`${source} contains duplicate test id "${test.id}".`);
    }
    ids.add(test.id);
    if (!Array.isArray(test.steps)) {
      throw new TypeError(`${source}.tests[${index}].steps must be an array.`);
    }
    assertJsonValue(test, `${source}.tests[${index}]`);
  }
  return value as DesktopStoryTests;
}

function requireObject(value: unknown, source: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${source} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function assertJsonValue(value: unknown, source: string): void {
  if (value === null || ['boolean', 'number', 'string'].includes(typeof value)) {
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
