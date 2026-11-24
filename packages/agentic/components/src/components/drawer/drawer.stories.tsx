import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { useFocusTarget } from '@fluentui-react-native/framework-base';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Button } from '../button/button';
import { commandPressProps } from '../button/commandPress';
import { Text } from '../text/text';
import { Drawer } from './drawer';

const meta: Meta<typeof Drawer> = { title: 'Components/Drawer', component: Drawer, args: { title: 'Inspector', defaultOpen: true } };
export default meta;
type Story = WdioStory<StoryObj<typeof Drawer>>;
export const Default: Story = {
  render: (args) => (
    <Drawer {...args}>
      <Text>Inline property editor</Text>
    </Drawer>
  ),
};
function Inspector() {
  const [open, setOpen] = useState(true);
  const [actions, setActions] = useState(0);
  const edit = () => setActions((count) => count + 1);
  const main = useFocusTarget(true);
  return (
    <View style={{ width: 300, height: 140, flexDirection: 'row', gap: 6 }}>
      <View style={{ flex: 1 }}>
        <Button
          content="Edit page"
          testID="drawer-main"
          {...commandPressProps(edit, false)}
          ref={main.focusTargetRef}
          onFocus={main.onFocus}
          onBlur={main.onBlur}
        />
        <StoryStatus testID="drawer-actions">{`Page actions: ${actions}`}</StoryStatus>
      </View>
      <Drawer
        title="Inspector"
        closeLabel="Close inspector"
        closeTestID="drawer-close"
        size="custom"
        customSize={190}
        position="end"
        availableExtent={190}
        open={open}
        onOpenChange={setOpen}
        onCloseFocus={() => main.focusTarget.requestFocus('restore')}
      >
        <Text>Property values stay in the layout.</Text>
      </Drawer>
    </View>
  );
}
export const InlineInspector: Story = {
  tags: ['flex-second-wave'],
  render: () => <Inspector />,
  wdio: [
    desktopIt('DWR-003 keeps the page operable while the inspector is open', { requires: ['click'] }, async (context) => {
      const { browser, expect } = context;
      const close = await browser.$('~drawer-close');
      await expect(close).toHaveAttribute('name', 'Close inspector');
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'drawer');
      await (await browser.$('~drawer-main')).click();
      await expect(await browser.$('~drawer-actions')).toHaveAttribute('name', 'Page actions: 1');
      await close.click();
      await expect(await browser.$('~drawer-close')).not.toExist();
    }),
    desktopIt(
      'DWR-002 explicit close returns focus to the owner’s live target',
      { requires: ['physical-click', 'focus'], platforms: ['macos'] },
      async ({ browser }) => {
        const { expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
        await (await browser.$('~drawer-close')).click();
        await expectNativeState(browser, 'drawer-main', 'focused', true);
      },
    ),
  ],
};
