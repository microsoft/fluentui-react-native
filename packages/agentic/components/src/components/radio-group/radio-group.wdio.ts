import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';
import { requireDesktopFocus, expectNativeState, expectWindowsPointerFocus, focusByTab } from '../../common/desktopFocus.wdio.ts';

export async function runArrowNavigation(context: WdioStoryContext) {
  if (!requireDesktopFocus(context)) return;
  const { browser, expect, platform } = context;
  await focusByTab(browser, 'radio-group-entry', 'radio-group-one');
  for (const [key, id, answer] of [
    ['\uE014', 'radio-group-two', 'two'],
    ['\uE015', 'radio-group-three', 'three'],
    ['\uE014', 'radio-group-one', 'one'],
    ['\uE013', 'radio-group-three', 'three'],
    ['\uE012', 'radio-group-two', 'two'],
    ['\uE011', 'radio-group-one', 'one'],
    ['\uE010', 'radio-group-three', 'three'],
  ]) {
    await browser.keys(key);
    await expectNativeState(browser, id, 'focused', true);
    await expect(await browser.$('~radio-group-at-focus')).toHaveText(`${answer}:${answer}`);
    await expect(await browser.$('~radio-group-answer')).toHaveText(answer);
    if (platform !== 'macos') await expectNativeState(browser, id, 'checked', true);
    await expectNativeState(browser, 'radio-group-disabled', 'focused', false);
  }
  await expect(await browser.$('~radio-group-presses')).toHaveText('0');
  await expect(await browser.$('~radio-group-requests')).toHaveText('7');
  await browser.keys('\uE004');
  await expectNativeState(browser, 'radio-group-exit', 'focused', true);
}

export async function runModifiedNavigation(context: WdioStoryContext) {
  if (!requireDesktopFocus(context)) return;
  const { browser, expect } = context;
  await focusByTab(browser, 'radio-group-entry', 'radio-group-one');
  try {
    await browser.keys(['\uE008', '\uE014']);
  } finally {
    await browser.releaseActions();
  }
  await expect(await browser.$('~radio-group-owner-key')).toHaveText('Shift+ArrowRight');
  await expect(await browser.$('~radio-group-answer')).toHaveText('one');
  await expect(await browser.$('~radio-group-requests')).toHaveText('0');
}

export async function runNativeSelectionProjection(context: WdioStoryContext) {
  const { platform, skip, browser } = context;
  if (platform === 'macos') {
    skip(
      'RNmacOS 0.81.9 AX radio/radiogroup role and selected projection are unqualified; textual checked value is not a native state substitute.',
    );
    return;
  }
  if (!requireDesktopFocus(context)) return;
  await focusByTab(browser, 'radio-group-entry', 'radio-group-one');
  await expectNativeState(browser, 'radio-group-one', 'checked', true);
  await expectNativeState(browser, 'radio-group-one', 'selected', true);
  await browser.keys('\uE014');
  await expectNativeState(browser, 'radio-group-one', 'checked', false);
  await expectNativeState(browser, 'radio-group-one', 'selected', false);
  await expectNativeState(browser, 'radio-group-two', 'checked', true);
  await expectNativeState(browser, 'radio-group-two', 'selected', true);
}

export async function runPointerSelection(context: WdioStoryContext) {
  if (!requireDesktopFocus(context)) return;
  const { browser, expect } = context;
  await (await browser.$('~radio-group-entry')).click();
  await (await browser.$('~radio-group-two')).click();
  await expect(await browser.$('~radio-group-answer')).toHaveText('two');
  await expect(await browser.$('~radio-group-requests')).toHaveText('1');
  await expect(await browser.$('~radio-group-presses')).toHaveText('1');
  await expectWindowsPointerFocus(context, 'radio-group-two');
}
