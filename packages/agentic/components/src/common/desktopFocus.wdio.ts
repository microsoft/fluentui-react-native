import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';

export function requireDesktopFocus({ browser, skip }: Pick<WdioStoryContext, 'browser' | 'skip'>): boolean {
  const features = browser.capabilities['furn:features'];
  if (!features) {
    throw new Error('Desktop Driver did not provide feature capabilities.');
  }
  if (!features.physicalClick || !features.keyboard || !features.focus) {
    skip('Native focus qualification requires physical pointer input, keyboard input, and focus observation.');
    return false;
  }
  return true;
}

/** Click-to-focus is Windows-specific; ordinary AppKit controls need not take focus on click. */
export async function expectWindowsPointerFocus(
  { browser, platform }: Pick<WdioStoryContext, 'browser' | 'platform'>,
  testId: string,
): Promise<void> {
  if (platform === 'windows' || platform === 'win32') {
    await expectNativeState(browser, testId, 'focused', true);
  }
}

export async function focusByTab(browser: WdioStoryContext['browser'], entryId: string, targetId: string): Promise<void> {
  await (await browser.$(`~${entryId}`)).click();
  await expectNativeState(browser, entryId, 'focused', true);
  await browser.keys('\uE004');
  await expectNativeState(browser, targetId, 'focused', true);
}

export async function clickPhysical(browser: WdioStoryContext['browser'], testId: string): Promise<void> {
  const element = await browser.$(`~${testId}`);
  const rect = await browser.getElementRect(await element.elementId);
  try {
    await browser.performActions([
      {
        type: 'pointer',
        id: 'physical-click',
        parameters: { pointerType: 'mouse' },
        actions: [
          { type: 'pointerMove', origin: 'viewport', x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
  } finally {
    await browser.releaseActions();
  }
}

export async function expectNativeState(
  browser: WdioStoryContext['browser'],
  testId: string,
  property: 'focused' | 'selected' | 'checked',
  value: boolean,
): Promise<void> {
  await browser.waitUntil(async () => (await (await browser.$(`~${testId}`)).getProperty(property)) === value, {
    timeout: 5000,
    interval: 50,
    timeoutMsg: `Expected native ${property}=${value} on "${testId}".`,
  });
}
