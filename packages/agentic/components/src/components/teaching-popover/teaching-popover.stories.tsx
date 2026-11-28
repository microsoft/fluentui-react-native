import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { TeachingPopover } from './teaching-popover';

const steps = [
  { key: 'find', title: 'Find your tools', body: 'Open the toolbar to see the available commands.' },
  { key: 'pin', title: 'Pin your tools', body: 'Keep the commands you use most nearby.' },
];
const meta: Meta<typeof TeachingPopover> = {
  title: 'Components/TeachingPopover',
  component: TeachingPopover,
  args: {
    title: 'Toolbar tour',
    trigger: { content: 'Show tips', testID: 'teaching-trigger' },
    steps,
    nextLabel: 'Next',
    backLabel: 'Back',
    closeLabel: 'Close tips',
    surface: { testID: 'teaching-surface' },
  },
};
export default meta;
type Story = WdioStory<StoryObj<typeof TeachingPopover>>;
export const Default: Story = {};
export const Lesson: Story = {
  tags: ['flex-second-wave'],
  render: (args) => (
    <TeachingPopover
      {...args}
      primaryAction={{ label: 'Done', onPress: () => undefined }}
      onFinish={() => undefined}
      formatStep={(position, total) => `${position} of ${total}`}
    />
  ),
  wdio: [
    desktopIt('TCP-001 advances the same nonmodal lesson without reactivating the trigger', { requires: ['click'] }, async (context) => {
      const { browser, expect } = context;
      const { inWindowWith } = await import('../menu/menu.wdio.ts');
      await (await browser.$('~teaching-trigger')).click();
      await inWindowWith(context, 'teaching-surface', async () => {
        await expect(await browser.$('~teaching-surface')).toHaveAttribute('name', 'Find your tools');
        const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
        await recordVisualReview(context, 'teaching-popover');
        await (await browser.$('=Next')).click();
        await expect(await browser.$('~teaching-surface')).toHaveAttribute('name', 'Pin your tools');
      });
    }),
    desktopIt(
      'TCP-004 keeps the advancing target and restores focus after Back disappears',
      { requires: ['physical-click', 'keyboard', 'focus'], platforms: ['macos'] },
      async (context) => {
        const { browser } = context;
        const { inWindowWith } = await import('../menu/menu.wdio.ts');
        await (await browser.$('~teaching-trigger')).click();
        await inWindowWith(context, 'teaching-surface', async () => {
          await browser.waitUntil(async () => (await (await browser.$('=Close tips')).getProperty('focused')) === true);
          await browser.keys('\uE004');
          await browser.waitUntil(async () => (await (await browser.$('=Next')).getProperty('focused')) === true);
          await browser.keys('\uE00D');
          await browser.waitUntil(async () => (await (await browser.$('=Done')).getProperty('focused')) === true);
          await browser.keys(['\uE008', '\uE004']);
          await browser.waitUntil(async () => (await (await browser.$('=Back')).getProperty('focused')) === true);
          await browser.keys('\uE00D');
          await browser.waitUntil(async () => (await (await browser.$('=Next')).getProperty('focused')) === true);
        });
      },
    ),
  ],
};
