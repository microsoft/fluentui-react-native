import type { WdioStory, WdioStoryContext } from './index.js';

const story: WdioStory = {
  wdio: async ({ browser, desktop, expect, signal, skip }) => {
    signal.throwIfAborted();
    const button = await browser.$('~button');
    await expect(button).toBeEnabled();
    await desktop.expect({ state: 'enabled', target: { testId: 'button' }, value: true });
    if (await button.isSelected()) {
      skip('This scenario needs an unselected button.');
    }
    // @ts-expect-error Native state names remain checked.
    await desktop.expect({ state: 'invented', target: { testId: 'button' }, value: true });
    // @ts-expect-error Browser methods are WebdriverIO methods, not arbitrary properties.
    await browser.inventedCommand();
  },
};

const named: WdioStory = {
  wdio: {
    'platform-aware test': async ({ browser, expect, platform, skip }) => {
      const endpoint: 'macos' | 'windows' | 'win32' = platform;
      const features = browser.capabilities['furn:features'];
      if (features) {
        // @ts-expect-error Native feature flags remain booleans rather than untyped vendor data.
        const invalidFeature: string = features.physicalClick;
        expect(invalidFeature).toBeDefined();
      }
      if (endpoint === 'win32') {
        skip('Paper-only example');
        return;
      }
      await expect(await browser.$('~button')).toBeEnabled();
      // @ts-expect-error The platform is a desktop endpoint, not an arbitrary OS.
      const invalidPlatform: WdioStoryContext['platform'] = 'android';
      expect(invalidPlatform).toBeDefined();
    },
  },
};

const wrapped: WdioStory<{ args: { disabled: boolean }; wdio?: unknown }> = {
  args: { disabled: false },
  wdio: async ({ browser }) => {
    await browser.$('~button');
    // @ts-expect-error Wrapping existing story annotations retains the WebdriverIO callback type.
    await browser.inventedCommand();
  },
};

const invalidArgs: WdioStory<{ args: { disabled: boolean } }> = {
  // @ts-expect-error Wrapping a story preserves its argument contract.
  args: { disabled: 'false' },
};

test('exposes a type-only inline callback contract', () => {
  expect(typeof story.wdio).toBe('function');
  expect(typeof wrapped.wdio).toBe('function');
  expect(typeof named.wdio).toBe('object');
  expect(invalidArgs.args).toBeDefined();
});
