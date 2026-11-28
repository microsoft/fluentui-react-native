import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { TagPicker } from './tag-picker';

const options = [
  { value: 'red', label: 'Red', testID: 'tag-picker-red' },
  { value: 'green', label: 'Green', testID: 'tag-picker-green' },
  { value: 'blue', label: 'Blue', testID: 'tag-picker-blue' },
];
const meta: Meta<typeof TagPicker> = {
  title: 'Components/TagPicker',
  component: TagPicker,
  args: { accessibilityLabel: 'Project labels', options },
};
export default meta;
type Story = WdioStory<StoryObj<typeof TagPicker>>;
export const Default: Story = {
  tags: ['flex-fourth-wave'],
  render: (args) => (
    <TagPicker
      {...args}
      formatRemoveLabel={(option) => `Remove ${option.label}`}
      formatAddLabel={(option) => `Add ${option.label}`}
      defaultSelectedValues={['red']}
      triggerTestID="tag-picker-trigger"
      triggerLabel="Choose project labels"
      placeholder="Choose labels"
      style={{ width: 305 }}
    />
  ),
  wdio: [
    desktopIt('TGP-001 selects an additional option without closing the list', { requires: ['physical-click'] }, async (context) => {
      const { browser, expect } = context;
      const { inWindowWith } = await import('../menu/menu.wdio.ts');
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'tag-picker');
      await (await browser.$('~tag-picker-trigger')).click();
      await inWindowWith(context, 'tag-picker-green', async () => {
        await (await browser.$('~tag-picker-green')).click();
        await expect(await browser.$('~tag-picker-blue')).toBeDisplayed();
        await recordVisualReview(context, 'tag-picker-options');
      });
      await expect(await browser.$('=Remove Red')).toBeDisplayed();
      await expect(await browser.$('=Remove Green')).toBeDisplayed();
    }),
    desktopIt(
      'TGP-004 uses native macOS AddToSelection without replacing existing tags',
      { platforms: ['macos'], requires: ['accessibility-click', 'perform-accessibility-action'] },
      async (context) => {
        const { browser, expect } = context;
        const { inWindowWith } = await import('../menu/menu.wdio.ts');
        await (await browser.$('~tag-picker-trigger')).click();
        await inWindowWith(context, 'tag-picker-green', async () => {
          const option = await browser.$('~tag-picker-green');
          const names = (await option.getProperty('accessibilityActions')) as string[];
          const add = names.find((name) => name === 'AddToSelection' || name === 'Add Green');
          expect(add).toBeDefined();
          await option.desktopPerformAccessibilityAction(add!);
          await expect(await browser.$('~tag-picker-blue')).toBeDisplayed();
        });
        await expect(await browser.$('=Remove Red')).toBeDisplayed();
        await expect(await browser.$('=Remove Green')).toBeDisplayed();
      },
    ),
  ],
};
