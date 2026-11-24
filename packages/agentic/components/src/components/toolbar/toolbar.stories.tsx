import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Button } from '../button/button';
import { commandPressProps } from '../button/commandPress';
import { Divider } from '../divider/divider';
import { Input } from '../input/input';
import { ToggleButton } from '../toggle-button/toggle-button';
import { Toolbar } from './toolbar';

const styles = StyleSheet.create({ scene: { width: 300, gap: 8 } });
const meta: Meta<typeof Toolbar> = {
  title: 'Components/Toolbar',
  component: Toolbar,
  args: { accessibilityLabel: 'Formatting' },
  argTypes: { size: { control: 'select', options: ['small', 'large'] }, children: { control: false } },
};
export default meta;
type Story = WdioStory<StoryObj<typeof Toolbar>>;
export const Default: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <ToggleButton key="bold" content="Bold" />
      <Divider />
      <Button key="link" content="Add link" />
    </Toolbar>
  ),
};
export const Formatting: Story = {
  tags: ['flex-third-wave'],
  render: function FormattingScene(args) {
    const [bold, setBold] = useState(false);
    const [commands, setCommands] = useState(0);
    return (
      <View style={styles.scene}>
        <Input accessibilityLabel="Document name" textInput={{ testID: 'toolbar-entry' }} />
        <Toolbar {...args} size="small" testID="formatting-toolbar">
          <Button key="link" content="Add link" testID="toolbar-link" {...commandPressProps(() => setCommands((n) => n + 1), false)} />
          <Divider />
          <Button key="paste" content="Paste" disabled />
          <ToggleButton key="bold" content="Bold" testID="toolbar-bold" selected={bold} onSelectedChange={setBold} />
        </Toolbar>
        <StoryStatus testID="toolbar-actions">{`Bold: ${bold}; links: ${commands}`}</StoryStatus>
        <Input accessibilityLabel="Document body" textInput={{ testID: 'toolbar-exit' }} />
      </View>
    );
  },
  wdio: [
    desktopIt('TLB-004 invokes a momentary command in the named toolbar', { requires: ['click'] }, async (context) => {
      const { browser, expect } = context;
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await expect(await browser.$('~formatting-toolbar')).toHaveAttribute('name', 'Formatting');
      await recordVisualReview(context, 'toolbar');
      await (await browser.$('~toolbar-link')).click();
      await expect(await browser.$('~toolbar-actions')).toHaveAttribute('name', 'Bold: false; links: 1');
    }),
    desktopIt(
      'TLB-002 arrows move focus without toggling or invoking a command',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        const { expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        await focusByTab(browser, 'toolbar-entry', 'toolbar-link');
        await browser.keys('\uE014');
        await expectNativeState(browser, 'toolbar-bold', 'focused', true);
        await expect(await browser.$('~toolbar-actions')).toHaveAttribute('name', 'Bold: false; links: 0');
        await browser.keys('\uE00D');
        await expect(await browser.$('~toolbar-actions')).toHaveAttribute('name', 'Bold: true; links: 0');
        await browser.keys('\uE004');
        await expectNativeState(browser, 'toolbar-exit', 'focused', true);
      },
    ),
  ],
};
