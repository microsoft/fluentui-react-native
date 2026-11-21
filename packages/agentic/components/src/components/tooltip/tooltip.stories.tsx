import { Pressable, Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { Button } from '../button/button';
import { Tooltip } from './tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: { content: 'Saves the current draft without publishing' },
  argTypes: { children: { control: false } },
};
export default meta;

export const NativeText: WdioStory<StoryObj<typeof Tooltip>> = {
  render: ({ content }) => (
    <View>
      <Button content="Save directly" tooltip={content} />
      <Tooltip content={content}>
        <Pressable accessible accessibilityRole="button" accessibilityLabel="Save draft" testID="wrapped-save">
          <Text>Save draft</Text>
        </Pressable>
      </Tooltip>
    </View>
  ),
  tags: ['desktop-e2e'],
  wdio: [
    desktopIt('preserves the wrapped native button and its name', async ({ browser, expect }) => {
      const trigger = await browser.$('~wrapped-save');
      await expect(trigger).toExist();
      expect(await trigger.getTagName()).toBe('button');
      expect(await trigger.getProperty('name')).toBe('Save draft');
    }),
  ],
};
