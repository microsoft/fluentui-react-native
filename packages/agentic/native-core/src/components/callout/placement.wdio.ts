import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';

export async function expectCalloutPlacement(
  { browser, expect, platform }: Pick<WdioStoryContext, 'browser' | 'expect' | 'platform'>,
  localAnchor?: { x: number; y: number; height: number },
): Promise<void> {
  await expect(await browser.$('~modern-callout-status')).toHaveText('Ready');
  const anchor = await browser.getElementRect(await (await browser.$('~modern-callout-anchor')).elementId);
  const owner = await browser.getWindowHandle();
  if (platform === 'macos') {
    const frame = await browser.getWindowRect();
    anchor.x += frame.x;
    anchor.y += frame.y;
  }
  try {
    if (platform === 'macos') {
      await browser.waitUntil(async () => (await browser.getWindowHandles()).length === 2, { timeout: 5000 });
      const popup = (await browser.getWindowHandles()).find((handle) => handle !== owner);
      if (!popup) throw new Error('The ready Callout has no owned popup window.');
      await browser.switchToWindow(popup);
    }
    const content =
      platform === 'macos'
        ? await browser.getWindowRect()
        : await browser.getElementRect(await (await browser.$('~modern-callout-content')).elementId);
    expect(Math.abs(content.x - (anchor.x + (localAnchor?.x ?? 0)))).toBeLessThanOrEqual(1);
    expect(Math.abs(content.y - (anchor.y + (localAnchor?.y ?? 0) + (localAnchor?.height ?? anchor.height) + 8))).toBeLessThanOrEqual(1);
  } finally {
    if (platform === 'macos') await browser.switchToWindow(owner);
  }
}
