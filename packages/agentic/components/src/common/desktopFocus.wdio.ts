import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';

export function requireDesktopFocus({ browser, platform, skip }: Pick<WdioStoryContext, 'browser' | 'platform' | 'skip'>): boolean {
  if (platform !== 'windows' && platform !== 'win32') {
    skip('This case qualifies the Windows/Win32 focus contract; macOS has a separate native contract.');
    return false;
  }
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
