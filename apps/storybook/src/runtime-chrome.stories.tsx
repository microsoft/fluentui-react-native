import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-native';
import { Button, Text } from '@fluentui-react-native/components';
import { StoryStatus } from '@fluentui-react-native/components/test';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

function RuntimeChromeFixture() {
  const [count, setCount] = React.useState(0);

  return (
    <>
      <Text>Runtime chrome state fixture</Text>
      <Button content="Increment preview count" onPress={() => setCount((current) => current + 1)} testID="runtime-chrome-increment" />
      <StoryStatus testID="runtime-chrome-count">{String(count)}</StoryStatus>
    </>
  );
}

const meta = {
  title: 'Runtime/Chrome',
  component: RuntimeChromeFixture,
} satisfies Meta<typeof RuntimeChromeFixture>;

export default meta;

type Story = WdioStory<StoryObj<typeof meta>>;

export const Default: Story = {
  wdio: {
    'keeps preview state and Win32 chrome available across outer theme changes': async ({ browser, expect }) => {
      let failure: unknown;
      let didFail = false;

      try {
        await (await browser.$('~runtime-chrome-increment')).click();
        await expect(await browser.$('~runtime-chrome-count')).toHaveText('1');

        await (await browser.$('~agentic-storybook-theme-source-trigger')).click();
        await (await browser.$('~agentic-storybook-theme-source-fluent')).click();
        await (await browser.$('~agentic-storybook-theme-color-scheme-trigger')).click();
        await (await browser.$('~agentic-storybook-theme-color-scheme-dark')).click();

        await expect(await browser.$('~runtime-chrome-count')).toHaveText('1');
        await expect(await browser.$('~agentic-storybook-win32-sidebar-navigation-search')).toBeDisplayed();
        await expect(await browser.$('~agentic-storybook-win32-sidebar-resize')).toBeDisplayed();
        await expect(await browser.$('~agentic-storybook-win32-addons-panel-header')).toBeDisplayed();
        await expect(await browser.$('~agentic-storybook-win32-addons-resize')).toBeDisplayed();

        const search = await browser.$('~agentic-storybook-win32-sidebar-navigation-search');
        await search.setValue('Runtime Chrome');
        await expect(await browser.$('~agentic-storybook-win32-sidebar-navigation-search-result-runtime-chrome--default')).toBeDisplayed();
      } catch (error) {
        didFail = true;
        failure = error;
      }

      let cleanupFailure: unknown;
      let cleanupDidFail = false;
      try {
        const search = await browser.$('~agentic-storybook-win32-sidebar-navigation-search');
        await search.clearValue();
      } catch (error) {
        cleanupDidFail = true;
        cleanupFailure = error;
      }
      try {
        await (await browser.$('~agentic-storybook-theme-source-trigger')).click();
        await (await browser.$('~agentic-storybook-theme-source-inherit')).click();
      } catch (error) {
        cleanupDidFail = true;
        cleanupFailure ??= error;
      }

      if (didFail) {
        if (cleanupDidFail) {
          console.error('Failed to restore runtime chrome test state.', cleanupFailure);
        }
        throw failure;
      }
      if (cleanupDidFail) {
        throw cleanupFailure;
      }
    },
  },
};
