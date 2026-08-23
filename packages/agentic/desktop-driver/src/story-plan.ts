/**
 * Serializable story-test plan schema.
 *
 * A plan crosses the device/host boundary, so it is deliberately small and closed: only the
 * listed actions exist, only a `testID` may address an element, and a linked spec is a relative
 * path that the generator resolves inside configured roots. Nothing here can express arbitrary
 * JavaScript.
 */

import { DesktopValidationError } from './errors.ts';
import { assertPortableTestId } from './selectors.ts';
import { STORY_PLAN_SCHEMA_VERSION } from './protocol/versions.ts';
import type { InlineStoryPlan, SpecStoryPlan, StoryPlan, StoryPlanStep, StoryStepProperty } from './types.ts';
import { expectEnum, isJsonSerializable, isNonEmptyString, isPlainObject, ValidationIssues } from './validate.ts';

const STEP_ACTIONS = [
  'expectVisible',
  'expectHidden',
  'expectEnabled',
  'expectDisabled',
  'press',
  'clearValue',
  'setValue',
  'scrollIntoView',
  'expect',
  'wait',
  'screenshot',
] as const;

const STEP_PROPERTIES: readonly StoryStepProperty[] = ['text', 'value', 'displayed', 'enabled', 'selected'];

const PLAN_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

function validateTarget(value: unknown, issues: ValidationIssues, path: string): void {
  if (!isPlainObject(value)) {
    issues.add(path, 'must be an object with a testId');
    return;
  }
  const keys = Object.keys(value);
  if (keys.length !== 1 || keys[0] !== 'testId') {
    issues.add(path, 'must contain exactly one property, "testId"; other selectors are not portable');
    return;
  }
  try {
    assertPortableTestId(value.testId as string);
  } catch (error) {
    issues.add(`${path}.testId`, error instanceof Error ? error.message : String(error));
  }
}

function validateStep(value: unknown, issues: ValidationIssues, path: string): void {
  if (!isPlainObject(value)) {
    issues.add(path, 'must be an object');
    return;
  }
  if (!expectEnum(issues, `${path}.action`, value.action, STEP_ACTIONS)) {
    return;
  }

  switch (value.action) {
    case 'wait':
      if (!Number.isInteger(value.milliseconds) || (value.milliseconds as number) <= 0 || (value.milliseconds as number) > 60_000) {
        issues.add(`${path}.milliseconds`, 'must be an integer between 1 and 60000');
      }
      return;
    case 'screenshot':
      if (!isNonEmptyString(value.name) || !/^[A-Za-z0-9._-]+$/.test(value.name)) {
        issues.add(`${path}.name`, 'must match /^[A-Za-z0-9._-]+$/');
      }
      return;
    case 'setValue':
      validateTarget(value.target, issues, `${path}.target`);
      if (typeof value.value !== 'string') {
        issues.add(`${path}.value`, 'must be a string');
      }
      return;
    case 'expect':
      validateTarget(value.target, issues, `${path}.target`);
      if (expectEnum(issues, `${path}.property`, value.property, STEP_PROPERTIES)) {
        const expectsBoolean = value.property !== 'text' && value.property !== 'value';
        if (expectsBoolean && typeof value.equals !== 'boolean') {
          issues.add(`${path}.equals`, `must be a boolean when property is "${String(value.property)}"`);
        }
        if (!expectsBoolean && typeof value.equals !== 'string') {
          issues.add(`${path}.equals`, `must be a string when property is "${String(value.property)}"`);
        }
      }
      return;
    default:
      validateTarget(value.target, issues, `${path}.target`);
      if ((value.action === 'expectVisible' || value.action === 'expectHidden') && value.timeout !== undefined) {
        if (!Number.isInteger(value.timeout) || (value.timeout as number) <= 0 || (value.timeout as number) > 120_000) {
          issues.add(`${path}.timeout`, 'must be an integer between 1 and 120000');
        }
      }
  }
}

/** Validates `parameters.desktopTest`. Returns the narrowed plan or throws with every issue. */
export function validateStoryPlan(value: unknown, context = 'desktopTest'): StoryPlan {
  const issues = new ValidationIssues();

  if (!isPlainObject(value)) {
    throw new DesktopValidationError(`Invalid ${context}`, ['must be an object']);
  }
  if (!isJsonSerializable(value)) {
    throw new DesktopValidationError(`Invalid ${context}`, ['must be JSON-serializable']);
  }
  if (value.version !== undefined && value.version !== STORY_PLAN_SCHEMA_VERSION) {
    issues.add('version', `must be ${STORY_PLAN_SCHEMA_VERSION}`);
  }
  if (!isNonEmptyString(value.id) || !PLAN_ID_PATTERN.test(value.id)) {
    issues.add('id', 'must be a non-empty kebab-case identifier matching /^[a-z0-9][a-z0-9-]*$/');
  }
  if (!expectEnum(issues, 'kind', value.kind, ['inline', 'spec'] as const)) {
    throw new DesktopValidationError(`Invalid ${context}`, issues.list());
  }

  if (value.kind === 'inline') {
    if (!Array.isArray(value.steps) || value.steps.length === 0) {
      issues.add('steps', 'must be a non-empty array');
    } else if (value.steps.length > 50) {
      issues.add('steps', 'must contain at most 50 steps');
    } else {
      value.steps.forEach((step, index) => validateStep(step, issues, `steps[${index}]`));
    }
  } else {
    if (!isNonEmptyString(value.spec)) {
      issues.add('spec', 'must be a non-empty relative path');
    } else if (!value.spec.startsWith('./') && !value.spec.startsWith('../')) {
      issues.add('spec', 'must be a relative path beginning with "./" or "../"');
    } else if (value.spec.includes('\0') || /[?*]/.test(value.spec)) {
      issues.add('spec', 'must not contain glob or null characters');
    }
  }

  if (issues.length > 0) {
    throw new DesktopValidationError(`Invalid ${context}`, issues.list());
  }

  return value as unknown as StoryPlan;
}

export function isInlinePlan(plan: StoryPlan): plan is InlineStoryPlan {
  return plan.kind === 'inline';
}

export function isSpecPlan(plan: StoryPlan): plan is SpecStoryPlan {
  return plan.kind === 'spec';
}

/** Returns the distinct `testID`s an inline plan touches, for documentation and doctor output. */
export function planTestIds(plan: InlineStoryPlan): readonly string[] {
  const ids = new Set<string>();
  for (const step of plan.steps as readonly StoryPlanStep[]) {
    if ('target' in step) {
      ids.add(step.target.testId);
    }
  }
  return [...ids];
}
