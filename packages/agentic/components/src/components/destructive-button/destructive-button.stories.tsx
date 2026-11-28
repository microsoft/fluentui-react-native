import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Input } from '../input/input';
import { DestructiveButton } from './destructive-button';

const meta: Meta<typeof DestructiveButton> = {
  title: 'Components/DestructiveButton',
  component: DestructiveButton,
  args: { content: 'Remove saved item' },
  argTypes: {
    appearance: { control: 'select', options: ['subtle', 'primary'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    shape: { control: 'select', options: ['rounded', 'circular'] },
  },
  parameters: { docs: { description: { component: 'A danger-styled command with ordinary Button activation.' } } },
};
export default meta;

type Story = WdioStory<StoryObj<typeof DestructiveButton>>;

export const Default: Story = {};

function AppearanceScene() {
  const [presses, setPresses] = useState(0);
  const press = () => setPresses((count) => count + 1);
  return (
    <View style={{ gap: 8, alignItems: 'flex-start' }}>
      <Input accessibilityLabel="Before the danger command" testID="danger-before" />
      <DestructiveButton content="Remove saved item" onPress={press} testID="danger-subtle" />
      <DestructiveButton appearance="primary" content="Confirm removal" onPress={press} testID="danger-primary" />
      <DestructiveButton appearance="primary" content="Removal unavailable" onPress={press} disabled testID="danger-disabled" />
      <DestructiveButton
        shape="circular"
        accessibilityLabel="Remove by icon"
        leadingIcon={{ fontSource: { codepoint: 0xd7 } }}
        testID="danger-icon"
      />
      <StoryStatus testID="danger-presses">{`Commands: ${presses}`}</StoryStatus>
    </View>
  );
}

export const Appearances: Story = {
  tags: ['flex-first-wave'],
  render: () => <AppearanceScene />,
  parameters: {
    docs: { description: { story: 'Compare subtle and primary danger, the neutral disabled state and a named icon-only command.' } },
  },
  wdio: [
    desktopIt('DSB-002 DSB-004 exposes named danger commands and an unavailable command', async (context) => {
      const { browser, expect } = context;
      const icon = await browser.$('~danger-icon');
      expect(await icon.getTagName()).toBe('button');
      await expect(icon).toHaveAttribute('name', 'Remove by icon');
      await expect(await browser.$('~danger-subtle')).toHaveAttribute('name', 'Remove saved item');
      await expect(await browser.$('~danger-primary')).toHaveAttribute('name', 'Confirm removal');
      await expect(await browser.$('~danger-disabled')).toBeDisabled();
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'destructive-button-appearances');
    }),
    desktopIt('DSB-003 dispatches one action per danger command', { requires: ['click'] }, async ({ browser, expect }) => {
      const status = await browser.$('~danger-presses');
      await (await browser.$('~danger-subtle')).click();
      await expect(status).toHaveAttribute('name', 'Commands: 1');
      await (await browser.$('~danger-primary')).click();
      await expect(status).toHaveAttribute('name', 'Commands: 2');
    }),
    desktopIt(
      'DSB-002 DSB-003 focuses the command and delivers one Space activation',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        const { focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        await focusByTab(browser, 'danger-before', 'danger-subtle');
        await browser.keys('\uE00D');
        await expect(await browser.$('~danger-presses')).toHaveAttribute('name', 'Commands: 1');
      },
    ),
  ],
};
