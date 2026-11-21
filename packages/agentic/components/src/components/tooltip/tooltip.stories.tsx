import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Tooltip } from './tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: { content: 'Saves the current draft without publishing' },
  argTypes: { children: { control: false } },
};
export default meta;

function NativeTextScene({ content }: { content: string }) {
  const [revision, setRevision] = useState(0);
  const [presses, setPresses] = useState(0);
  const tip = [content, 'Updated draft help', ''][revision % 3];
  return (
    <View>
      <Input accessibilityLabel="Keyboard entry" testID="tooltip-entry" />
      <Tooltip content={tip}>
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel="Save draft"
          testID="wrapped-save"
          onPress={() => setPresses((count) => count + 1)}
        >
          <Text>Save draft</Text>
        </Pressable>
      </Tooltip>
      <Button content="Change tip" testID="direct-tip" tooltip={tip || undefined} onPress={() => setRevision((value) => value + 1)} />
      <StoryStatus testID="tooltip-presses">{String(presses)}</StoryStatus>
    </View>
  );
}

export const NativeText: WdioStory<StoryObj<typeof Tooltip>> = {
  render: ({ content }) => <NativeTextScene content={content} />,
  tags: ['desktop-e2e'],
  wdio: [
    desktopIt('preserves the wrapped native button and its name', async ({ browser, expect }) => {
      const trigger = await browser.$('~wrapped-save');
      await expect(trigger).toExist();
      expect(await trigger.getTagName()).toBe('button');
      expect(await trigger.getProperty('name')).toBe('Save draft');
      await expect(await browser.$('~direct-tip')).toHaveAttribute('name', 'Change tip');
    }),
    desktopIt(
      'TIP-003 Escape preserves trigger focus and Tab continues without activation',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        const { focusByTab, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
        await focusByTab(browser, 'tooltip-entry', 'wrapped-save');
        await browser.keys('\uE00C');
        await expectNativeState(browser, 'wrapped-save', 'focused', true);
        await browser.keys('\uE004');
        await expectNativeState(browser, 'direct-tip', 'focused', true);
        const count = await browser.$('~tooltip-presses');
        await expect(count).toHaveAttribute('name', '0');
        await (await browser.$('~wrapped-save')).click();
        await expect(count).toHaveAttribute('name', '1');
      },
    ),
    desktopIt(
      'TIP-004 updates and clears native AX help without changing the trigger name',
      { platforms: ['macos'], requires: ['click'] },
      async (context) => {
        const { checkHelpChanges } = await import('./tooltip.wdio.ts');
        await checkHelpChanges(context);
      },
    ),
  ],
};
