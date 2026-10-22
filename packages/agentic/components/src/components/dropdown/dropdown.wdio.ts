import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';

type Context = Pick<WdioStoryContext, 'browser' | 'expect' | 'platform'>;

/** Tabs from the story's entry field to its trigger, presses Down, and waits for the open and the entry option's focus. */
export async function openDropdownFromKeyboard(context: Context, first: string): Promise<void> {
  const { focusByTab } = await import('../../common/desktopFocus.wdio.ts');
  const { browser, expect } = context;
  await focusByTab(browser, 'dropdown-entry', 'dropdown-trigger');
  await browser.keys('\uE015');
  await expect(await browser.$('~dropdown-reason')).toHaveText('Opened: trigger');
  await expect(await browser.$('~dropdown-focus')).toHaveText(first);
}
