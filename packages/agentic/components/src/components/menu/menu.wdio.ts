import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';

type Context = Pick<WdioStoryContext, 'browser' | 'expect' | 'platform'>;

/**
 * Runs `inspect` in the window that contains `testId`. macOS presents each menu popup in its own owned window; the
 * Windows provider exposes owned popup content in the owner window's tree.
 */
export async function inWindowWith<T>({ browser, platform }: Context, testId: string, inspect: () => Promise<T>): Promise<T> {
  if (platform !== 'macos') {
    return inspect();
  }
  const owner = await browser.getWindowHandle();
  let found: string | undefined;
  await browser.waitUntil(
    async () => {
      for (const handle of await browser.getWindowHandles()) {
        await browser.switchToWindow(handle);
        if (await (await browser.$(`~${testId}`)).isExisting()) {
          found = handle;
          return true;
        }
      }
      await browser.switchToWindow(owner);
      return false;
    },
    { timeout: 5000, timeoutMsg: `Expected a window containing "${testId}".` },
  );
  try {
    return await inspect();
  } finally {
    if (found !== owner) {
      await browser.switchToWindow(owner);
    }
  }
}

/** Moves the physical pointer to the center of `testId` in whichever window shows it. */
export async function hover(context: Context, testId: string): Promise<void> {
  const { browser } = context;
  await inWindowWith(context, testId, async () => {
    // Windows exposes popup content in the owner tree shortly after the reported open.
    await (await browser.$(`~${testId}`)).waitForExist({ timeout: 5000, timeoutMsg: `Expected "${testId}" to exist.` });
    const elementId = await (await browser.$(`~${testId}`)).elementId;
    // An element origin resolves screen coordinates in any window; viewport coordinates use the owner window.
    const origin = { 'element-6066-11e4-a52e-4f735466cecf': elementId } as unknown as 'pointer';
    try {
      await browser.performActions([
        {
          type: 'pointer',
          id: 'menu-hover',
          parameters: { pointerType: 'mouse' },
          actions: [{ type: 'pointerMove', origin, x: 0, y: 0 }],
        },
      ]);
    } finally {
      await browser.releaseActions();
    }
  });
}

/** Waits until the trigger reports a collapsed menu and confirms it stays collapsed. */
export async function expectMenuClosed({ browser, expect }: Context, triggerId: string): Promise<void> {
  await browser.waitUntil(async () => (await (await browser.$(`~${triggerId}`)).getProperty('expanded')) === false, {
    timeout: 5000,
    timeoutMsg: `Expected ${triggerId} to report a collapsed menu.`,
  });
  await browser.pause(500);
  expect(await (await browser.$(`~${triggerId}`)).getProperty('expanded')).toBe(false);
}

/** The number of open popup windows besides the owner window (macOS only). */
export async function popupCount({ browser }: Context): Promise<number> {
  return (await browser.getWindowHandles()).length - 1;
}

/** Tabs from `entryId` to `triggerId`, presses Enter, and waits for the reported open and the first focused row. */
export async function openMenuFromKeyboard(
  context: Context,
  ids: { entry: string; trigger: string; reason: string; focus: string; first: string },
): Promise<void> {
  const { focusByTab } = await import('../../common/desktopFocus.wdio.ts');
  const { browser, expect } = context;
  await focusByTab(browser, ids.entry, ids.trigger);
  await browser.keys('\uE007');
  await expect(await browser.$(`~${ids.reason}`)).toHaveText('Opened: trigger');
  await expect(await browser.$(`~${ids.focus}`)).toHaveText(ids.first);
}
