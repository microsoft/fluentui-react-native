import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { Select } from './select';

const options = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'ja', label: 'Japanese unavailable', disabled: true },
];
const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  args: { accessibilityLabel: 'Document language', options, defaultValue: 'fr' },
};
export default meta;
type Story = WdioStory<StoryObj<typeof Select>>;
export const Default: Story = {
  tags: ['flex-fourth-wave', 'mac-appkit-foundation'],
  render: (args) => <Select {...args} pickerTestID="language-picker" style={{ width: 220 }} />,
  wdio: [
    desktopIt('SEL-004 reads the committed option on the native picker', { platforms: ['macos'] }, async (context) => {
      const { browser, expect } = context;
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      const picker = await browser.$('~language-picker');
      await expect(picker).toHaveAttribute('name', 'Document language');
      await expect(picker).toHaveAttribute('value', 'French');
      await recordVisualReview(context, 'select');
    }),
    desktopIt(
      'SEL-003 native dismissal preserves the committed option',
      { requires: ['physical-click', 'keyboard'], platforms: ['macos'] },
      async ({ browser, expect }) => {
        const picker = await browser.$('~language-picker');
        await picker.click();
        await browser.keys('\uE00C');
        await expect(picker).toHaveAttribute('value', 'French');
      },
    ),
  ],
};
export const Unselected: Story = {
  render: (args) => <Select {...args} value={null} placeholder="Choose a language" style={{ width: 220 }} />,
};
