import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';

/**
 * Opens the menu by pointer, enters its FocusZone, navigates by arrow with wrapping, and closes it with Escape, twice.
 * `restoresTrigger` states whether the pressed trigger took keyboard focus, which decides whether the owner window
 * returns focus to it when the menu closes.
 */
export async function exerciseMenuComposition(
  { browser, expect, skip }: Pick<WdioStoryContext, 'browser' | 'expect' | 'skip'>,
  { restoresTrigger }: { restoresTrigger: boolean },
): Promise<void> {
  const features = browser.capabilities['furn:features'];
  if (!features?.physicalClick || !features.keyboard || !features.focus) {
    skip('Menu composition requires physical owner input, keyboard input, and focus observation.');
    return;
  }
  const trigger = await browser.$('~modern-menu-trigger');
  const status = await browser.$('~modern-menu-status');
  const focused = await browser.$('~modern-menu-focus');
  for (let attempt = 0; attempt < 2; attempt++) {
    await trigger.click();
    await expect(status).toHaveText('Ready: confirmed');
    await expect(focused).toHaveText('Cut');
    await browser.keys('\uE015');
    await expect(focused).toHaveText('Copy');
    await browser.keys('\uE013');
    await browser.keys('\uE013');
    await expect(focused).toHaveText('Paste');
    await browser.keys('\uE00C');
    await expect(status).toHaveText('Dismissed: escape');
    if (restoresTrigger) {
      await browser.waitUntil(async () => (await trigger.getProperty('focused')) === true, {
        timeout: 5000,
        timeoutMsg: 'Expected keyboard focus to return to the menu trigger.',
      });
    } else {
      expect(await trigger.getProperty('focused')).toBe(false);
    }
  }
}
