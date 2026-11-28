import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { MenuItem } from '../menu-item/menu-item';
import { SplitButton } from './split-button';

const meta: Meta<typeof SplitButton> = {
  title: 'Components/SplitButton',
  component: SplitButton,
  args: { content: 'Export', menuLabel: 'Other formats', onPress: () => undefined, children: null },
};
export default meta;
type Story = WdioStory<StoryObj<typeof SplitButton>>;
export const Default: Story = {
  args: { children: <MenuItem content="Export PDF" secondaryContent={null} icon={null} /> },
};
function ExportOptions() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  return (
    <View style={{ alignItems: 'flex-start', gap: 8 }}>
      <SplitButton
        content="Export"
        menuLabel="Other formats"
        primaryTestID="split-default"
        menuTriggerTestID="split-more"
        appearance="primary"
        size="small"
        onPress={() => setCount((previous) => previous + 1)}
        onOpenChange={setOpen}
      >
        <MenuItem content="Export PDF" secondaryContent={null} icon={null} testID="split-pdf" />
      </SplitButton>
      <SplitButton content="Save" menuLabel="Save options" appearance="outline" shape="circular" onPress={() => undefined}>
        <MenuItem content="Save a copy" secondaryContent={null} icon={null} />
      </SplitButton>
      <StoryStatus testID="split-count">{`Default: ${count}; Menu: ${open ? 'open' : 'closed'}`}</StoryStatus>
    </View>
  );
}
export const SeparateTargets: Story = {
  tags: ['flex-second-wave'],
  render: () => <ExportOptions />,
  wdio: [
    desktopIt('SPB-001 SPB-003 exposes adjacent named targets', async (context) => {
      await context.expect(await context.browser.$('~split-default')).toHaveAttribute('name', 'Export');
      await context.expect(await context.browser.$('~split-more')).toHaveAttribute('name', 'Other formats');
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'split-button');
    }),
    desktopIt('SPB-002 activates the primary separately from menu presence', { requires: ['click'] }, async ({ browser, expect }) => {
      await (await browser.$('~split-default')).click();
      const count = await browser.$('~split-count');
      await expect(count).toHaveAttribute('name', 'Default: 1; Menu: closed');
      await (await browser.$('~split-more')).click();
      await expect(count).toHaveAttribute('name', 'Default: 1; Menu: open');
    }),
  ],
};
