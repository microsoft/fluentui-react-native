/**
 * Desktop story test for the Button interaction scenario.
 *
 * This is a shared spec: the same source runs unchanged on React Native Windows and React Native
 * macOS. It uses ordinary WebdriverIO (`$`, element commands, waits) plus the portable
 * `byTestId` selector and `browser.desktop` augmentation. It must never branch on the platform or
 * import a platform extension.
 *
 * The suite title carries the `[story:...]` tag so a run can select exactly these tests with a
 * Mocha grep; the generated manifest verifies the tag is present.
 *
 * Selecting a story does not remount it. The React Native renderer applies the new story context
 * with `setContext`, and the story component is rendered without a `key`, so re-selecting the
 * story that is already shown preserves its React state. Every assertion below is therefore
 * relative to the count observed at the start of the test rather than to a fresh zero.
 */

import { byTestId, story } from '@fluentui-react-native/desktop-driver';

const BUTTON = byTestId('agentic-storybook-button-interactive');
const DISABLED_BUTTON = byTestId('agentic-storybook-button-interactive-disabled');
const STATUS = byTestId('agentic-storybook-button-interactive-status');

/** Reads the press counter out of the status text, which reads `Not pressed` or `Pressed <n>`. */
async function readPressCount(): Promise<number> {
  const text = await (await $(STATUS)).getText();
  if (text === 'Not pressed') {
    return 0;
  }
  const match = /^Pressed (\d+)$/.exec(text);
  if (!match) {
    throw new Error(`Unexpected Button status text "${text}"`);
  }
  return Number(match[1]);
}

/** Waits for the status text to settle on an exact press count. */
async function expectPressCount(expected: number): Promise<void> {
  await browser.waitUntil(async () => (await readPressCount()) === expected, {
    timeout: 10000,
    timeoutMsg: `Expected the Button press count to reach ${expected}`,
  });
}

describe('[story:components-button--interaction] Button interaction', () => {
  before(async () => {
    await story.select('components-button--interaction');
    await (await $(STATUS)).waitForDisplayed({ timeout: 30000 });
  });

  it('reports the button as displayed, enabled, and labelled', async () => {
    const button = await $(BUTTON);

    await expect(button).toBeDisplayed();
    await expect(button).toBeEnabled();
    await expect(button).toHaveText('Press me');
  });

  it('invokes onPress once per press', async () => {
    const before = await readPressCount();

    await (await $(BUTTON)).click();

    await expectPressCount(before + 1);
  });

  it('counts repeated presses', async () => {
    const before = await readPressCount();
    const button = await $(BUTTON);

    await button.click();
    await button.click();
    await button.click();

    await expectPressCount(before + 3);
  });

  it('does not invoke onPress for a disabled button', async () => {
    const before = await readPressCount();
    const disabled = await $(DISABLED_BUTTON);

    await expect(disabled).toBeDisplayed();
    await expect(disabled).toBeDisabled();

    // Clicking a disabled control is allowed to fail at the driver level; either way the press
    // must not reach the handler, which is what an unchanged count proves.
    await disabled.click().catch(() => undefined);

    await expectPressCount(before);
  });

  it('moves focus to the button that was pressed', async () => {
    await (await $(BUTTON)).click();

    // WebdriverIO's own `isFocused()` evaluates a DOM script, so focus inspection is delivered
    // through the portable desktop augmentation instead.
    await expect(await browser.desktop.isFocused(BUTTON)).toBe(true);
  });
});
