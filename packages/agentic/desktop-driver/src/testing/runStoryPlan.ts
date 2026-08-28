import type { DesktopElementClient, DesktopSessionClient } from '../client/DesktopDriverClient.js';
import type { DesktopStorySelector, DesktopStoryStep, DesktopStoryTests } from '../authoring/storyTests.js';

export async function runDesktopStoryTest(session: DesktopSessionClient, plan: DesktopStoryTests, testId: string): Promise<void> {
  const test = plan.tests.find(({ id }) => id === testId);
  if (!test) {
    throw new Error(`Desktop story test "${testId}" does not exist.`);
  }
  for (const step of test.steps) {
    await runStep(session, step);
  }
}

async function runStep(session: DesktopSessionClient, step: DesktopStoryStep): Promise<void> {
  if ('expect' in step) {
    throw new Error('Desktop story assertions are implemented in the sanctioned WebdriverIO authoring phase.');
  }
  switch (step.action) {
    case 'click':
      await (await find(session, step.target)).click();
      return;
    case 'clear':
      await (await find(session, step.target)).clear();
      return;
    case 'type':
      await (await find(session, step.target)).sendKeys(step.text);
      return;
    case 'screenshot':
      if (step.target) {
        await (await find(session, step.target)).takeScreenshot();
      } else {
        await session.takeScreenshot();
      }
      return;
    case 'wait': {
      const timeoutMs = step.timeoutMs ?? 1000;
      if (!step.target) {
        await delay(timeoutMs);
        return;
      }
      const deadline = Date.now() + timeoutMs;
      let lastError: unknown;
      do {
        try {
          await find(session, step.target);
          return;
        } catch (error) {
          lastError = error;
        }
        await delay(Math.min(25, Math.max(1, deadline - Date.now())));
      } while (Date.now() < deadline);
      throw new Error(`Timed out waiting for a desktop story target: ${(lastError as Error)?.message ?? 'not found'}`);
    }
    case 'keys':
    case 'doubleClick':
      throw new Error(`Desktop story action "${step.action}" is implemented in the sanctioned WebdriverIO authoring phase.`);
  }

  function delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}

async function find(session: DesktopSessionClient, selector: DesktopStorySelector): Promise<DesktopElementClient> {
  if ('testId' in selector) {
    return session.findElement('accessibility id', selector.testId);
  }
  if ('role' in selector) {
    const candidates = await session.findElements('tag name', selector.role);
    if (!selector.name) {
      if (!candidates[0]) {
        throw new Error(`No element matched role "${selector.role}".`);
      }
      return candidates[0];
    }
    for (const candidate of candidates) {
      if ((await candidate.getAttribute('name')) === selector.name) {
        return candidate;
      }
    }
    throw new Error(`No element matched role "${selector.role}" and name "${selector.name}".`);
  }
  if ('accessibleName' in selector) {
    return session.findElement('link text', selector.accessibleName);
  }
  return session.findElement('link text', selector.text);
}
