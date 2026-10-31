import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';

export async function expectCalloutPlacement(
  { browser, expect, platform }: Pick<WdioStoryContext, 'browser' | 'expect' | 'platform'>,
  localAnchor?: { x: number; y: number; height: number },
): Promise<void> {
  await expect(await browser.$('~modern-callout-status')).toHaveText('Ready');
  const owner = await browser.getWindowHandle();
  const original = platform === 'macos' ? await browser.getWindowRect() : undefined;
  try {
    if (original) {
      // Placement flips to the opposite edge when the work area lacks room below the anchor, as it does for a low
      // owner window on a small runner display; the top of the screen leaves room for the preferred edge.
      await browser.setWindowRect(original.x, 0, original.width, original.height);
    }
    const anchor = await browser.getElementRect(await (await browser.$('~modern-callout-anchor')).elementId);
    if (platform === 'macos') {
      const frame = await browser.getWindowRect();
      anchor.x += frame.x;
      anchor.y += frame.y;
      await browser.waitUntil(async () => (await browser.getWindowHandles()).length === 2, { timeout: 5000 });
      const popup = (await browser.getWindowHandles()).find((handle) => handle !== owner);
      if (!popup) throw new Error('The ready Callout has no owned popup window.');
      await browser.switchToWindow(popup);
    }
    const expected = {
      x: anchor.x + (localAnchor?.x ?? 0),
      y: anchor.y + (localAnchor?.y ?? 0) + (localAnchor?.height ?? anchor.height) + 8,
    };
    const measure = async () =>
      platform === 'macos' ? browser.getWindowRect() : browser.getElementRect(await (await browser.$('~modern-callout-content')).elementId);
    let content = await measure();
    // The owned popup follows the owner move asynchronously; settle first so the assertions report the final rectangle.
    await browser
      .waitUntil(
        async () => {
          content = await measure();
          return Math.abs(content.x - expected.x) <= 1 && Math.abs(content.y - expected.y) <= 1;
        },
        { timeout: 5000 },
      )
      .catch((): void => undefined);
    expect(Math.abs(content.x - expected.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(content.y - expected.y)).toBeLessThanOrEqual(1);
  } finally {
    if (original) {
      await browser.switchToWindow(owner);
      await browser.setWindowRect(original.x, original.y, original.width, original.height);
    }
  }
}
