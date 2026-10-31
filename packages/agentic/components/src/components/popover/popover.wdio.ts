import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';

type Context = Pick<WdioStoryContext, 'browser' | 'expect' | 'platform'>;

/**
 * Runs `inspect` where the popup content is reachable. macOS presents it in a separate owned window; the Windows
 * provider exposes owned popup content in the owner window's tree.
 */
export async function inPopupWindow<T>({ browser, platform }: Context, inspect: () => Promise<T>): Promise<T> {
  if (platform !== 'macos') {
    return inspect();
  }
  const owner = await browser.getWindowHandle();
  await browser.waitUntil(async () => (await browser.getWindowHandles()).length === 2, {
    timeout: 5000,
    timeoutMsg: 'Expected the presented Popover to own one popup window.',
  });
  const popup = (await browser.getWindowHandles()).find((handle) => handle !== owner);
  if (!popup) throw new Error('The presented Popover has no popup window.');
  await browser.switchToWindow(popup);
  try {
    return await inspect();
  } finally {
    await browser.switchToWindow(owner);
  }
}

/** Screen rectangle of the popup surface: the macOS popup window, or the Windows owned content element. */
export async function surfaceScreenRect(context: Context, testId: string) {
  const { browser, platform } = context;
  return inPopupWindow(context, async () =>
    platform === 'macos' ? browser.getWindowRect() : browser.getElementRect(await (await browser.$(`~${testId}`)).elementId),
  );
}

/** Screen rectangle of an owner-window element; macOS reports element bounds relative to the window. */
export async function ownerScreenRect({ browser, platform }: Context, testId: string) {
  const rect = await browser.getElementRect(await (await browser.$(`~${testId}`)).elementId);
  if (platform === 'macos') {
    const owner = await browser.getWindowRect();
    rect.x += owner.x;
    rect.y += owner.y;
  }
  return rect;
}

export async function expectClosed({ browser, expect }: Context, triggerId: string) {
  await browser.waitUntil(async () => (await (await browser.$(`~${triggerId}`)).getProperty('expanded')) === false, {
    timeout: 5000,
    timeoutMsg: `Expected ${triggerId} to report a collapsed popup.`,
  });
  // A dismissed popup must stay closed; a trigger press that reopened it would report expanded again.
  await browser.pause(500);
  expect(await (await browser.$(`~${triggerId}`)).getProperty('expanded')).toBe(false);
}
