/**
 * Inline story-plan execution.
 *
 * Runs a validated plan against an ordinary WebdriverIO session. The executor only understands
 * the closed action set from `story-plan.ts`; there is no path from a plan to arbitrary code.
 */

import { DesktopDriverError } from '../errors.ts';
import { byTestId } from '../selectors.ts';
import type { InlineStoryPlan, PortableCommand, StoryPlanStep } from '../types.ts';
import type { DesktopBrowserLike } from './commands.ts';

export interface StoryPlanRunContext {
  browser: DesktopBrowserLike;
  /** Default wait applied to visibility assertions that do not specify one. */
  defaultTimeout?: number;
  /** Overrides session-reported support for focused executor tests. */
  portableCommands?: readonly PortableCommand[];
}

/** Executes every step in order, failing on the first mismatch with a step-qualified message. */
export async function runInlineStoryPlan(plan: InlineStoryPlan, context: StoryPlanRunContext): Promise<void> {
  const timeout = context.defaultTimeout ?? 30_000;
  const reportedCommands = context.portableCommands ?? (await context.browser.desktop?.getSessionInfo())?.portableCommands;
  if (!reportedCommands) {
    throw new DesktopDriverError('Story plans require the desktop driver command augmentation', { kind: 'capability' });
  }
  const supportedCommands = new Set(reportedCommands);

  for (const [index, step] of plan.steps.entries()) {
    try {
      assertStepSupported(step, supportedCommands);
      await runStep(step, context.browser, timeout);
    } catch (error) {
      throw new DesktopDriverError(`Story plan "${plan.id}" failed at step ${index + 1} (${step.action}): ${(error as Error).message}`, {
        kind: error instanceof DesktopDriverError ? error.kind : 'lifecycle',
        cause: error,
        detail: { planId: plan.id, stepIndex: index, action: step.action },
      });
    }
  }
}

function assertStepSupported(step: StoryPlanStep, supportedCommands: ReadonlySet<PortableCommand>): void {
  const required: readonly PortableCommand[] =
    step.action === 'expectVisible' || step.action === 'expectHidden'
      ? ['findElement', 'waitForDisplayed']
      : step.action === 'expectEnabled' || step.action === 'expectDisabled'
        ? ['findElement', 'isEnabled']
        : step.action === 'press'
          ? ['findElement', 'waitForDisplayed', 'click']
          : step.action === 'clearValue'
            ? ['findElement', 'clearValue']
            : step.action === 'setValue'
              ? ['findElement', 'setValue']
              : step.action === 'scrollIntoView'
                ? ['scrollIntoView']
                : step.action === 'screenshot'
                  ? ['getPageSource', 'takeScreenshot']
                  : step.action === 'expect'
                    ? [
                        'findElement',
                        step.property === 'text'
                          ? 'getText'
                          : step.property === 'value'
                            ? 'getValue'
                            : step.property === 'displayed'
                              ? 'isDisplayed'
                              : step.property === 'enabled'
                                ? 'isEnabled'
                                : 'isSelected',
                      ]
                    : [];
  const missing = required.filter((command) => !supportedCommands.has(command));
  if (missing.length > 0) {
    throw new DesktopDriverError(`The connected backend does not support ${missing.join(', ')} required by "${step.action}"`, {
      kind: 'capability',
      detail: { action: step.action, missing },
    });
  }
}

async function runStep(step: StoryPlanStep, browser: DesktopBrowserLike, defaultTimeout: number): Promise<void> {
  if (step.action === 'wait') {
    await new Promise((resolve) => setTimeout(resolve, step.milliseconds));
    return;
  }

  if (step.action === 'screenshot') {
    await browser.desktop!.captureArtifacts(step.name);
    return;
  }

  const element = await browser.$(byTestId(step.target.testId));

  switch (step.action) {
    case 'expectVisible': {
      const displayed = await element.waitForDisplayed({ timeout: step.timeout ?? defaultTimeout });
      if (!displayed) {
        throw new Error(`Expected "${step.target.testId}" to be displayed`);
      }
      return;
    }
    case 'expectHidden': {
      const hidden = await element.waitForDisplayed({ timeout: step.timeout ?? defaultTimeout, reverse: true });
      if (!hidden) {
        throw new Error(`Expected "${step.target.testId}" to be hidden`);
      }
      return;
    }
    case 'expectEnabled':
      await assertBoolean(await element.isEnabled(), true, `"${step.target.testId}".isEnabled()`);
      return;
    case 'expectDisabled':
      await assertBoolean(await element.isEnabled(), false, `"${step.target.testId}".isEnabled()`);
      return;
    case 'press':
      await element.waitForDisplayed({ timeout: defaultTimeout });
      await element.click();
      return;
    case 'clearValue':
      await element.clearValue();
      return;
    case 'setValue':
      await element.setValue(step.value);
      return;
    case 'scrollIntoView':
      await browser.desktop!.scrollIntoView(byTestId(step.target.testId));
      return;
    case 'expect':
      await assertProperty(element, step.property, step.equals, step.target.testId);
      return;
    default: {
      const unexpected = step as { action: string };
      throw new Error(`Unknown story plan action "${unexpected.action}"`);
    }
  }
}

async function assertBoolean(actual: boolean, expected: boolean, description: string): Promise<void> {
  if (actual !== expected) {
    throw new Error(`Expected ${description} to be ${expected}, got ${actual}`);
  }
}

async function assertProperty(
  element: Awaited<ReturnType<DesktopBrowserLike['$']>>,
  property: 'text' | 'value' | 'displayed' | 'enabled' | 'selected',
  expected: string | boolean,
  testId: string,
): Promise<void> {
  switch (property) {
    case 'text': {
      const actual = await element.getText();
      if (actual !== expected) {
        throw new Error(`Expected "${testId}" text to be "${String(expected)}", got "${actual}"`);
      }
      return;
    }
    case 'value': {
      const actual = (await element.getAttribute('value')) ?? '';
      if (actual !== expected) {
        throw new Error(`Expected "${testId}" value to be "${String(expected)}", got "${actual}"`);
      }
      return;
    }
    case 'displayed':
      await assertBoolean(await element.isDisplayed(), expected as boolean, `"${testId}".isDisplayed()`);
      return;
    case 'enabled':
      await assertBoolean(await element.isEnabled(), expected as boolean, `"${testId}".isEnabled()`);
      return;
    case 'selected':
    default:
      await assertBoolean(await element.isSelected(), expected as boolean, `"${testId}".isSelected()`);
  }
}
