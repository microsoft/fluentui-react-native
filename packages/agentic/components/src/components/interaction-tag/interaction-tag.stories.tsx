import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { InteractionTag } from './interaction-tag';

const meta: Meta<typeof InteractionTag> = {
  title: 'Components/InteractionTag',
  component: InteractionTag,
  args: { content: 'Lin', dismissLabel: 'Remove Lin', onPress: () => undefined, onDismiss: () => undefined },
};
export default meta;
type Story = WdioStory<StoryObj<typeof InteractionTag>>;
export const Default: Story = {};
function Actions() {
  const [presses, setPresses] = useState(0);
  const [removes, setRemoves] = useState(0);
  return (
    <View style={{ alignItems: 'flex-start', gap: 8 }}>
      <InteractionTag
        content="Lin"
        dismissLabel="Remove Lin"
        primaryTestID="tag-open"
        dismissTestID="tag-remove"
        avatar={{ initials: 'L' }}
        onPress={() => setPresses((count) => count + 1)}
        onDismiss={() => setRemoves((count) => count + 1)}
      />
      <InteractionTag
        content="Review"
        dismissLabel="Remove review"
        size="small"
        appearance="primary"
        shape="circular"
        onPress={() => undefined}
        onDismiss={() => undefined}
      />
      <StoryStatus testID="interaction-tag-counts">{`Opened: ${presses}; Removed: ${removes}`}</StoryStatus>
    </View>
  );
}
export const IndependentActions: Story = {
  tags: ['flex-second-wave'],
  render: () => <Actions />,
  wdio: [
    desktopIt('ITG-001 presents two named sibling controls', async (context) => {
      await context.expect(await context.browser.$('~tag-open')).toHaveAttribute('name', 'Lin');
      await context.expect(await context.browser.$('~tag-remove')).toHaveAttribute('name', 'Remove Lin');
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'interaction-tag');
    }),
    desktopIt('ITG-002 dispatches each action without invoking its sibling', { requires: ['click'] }, async ({ browser, expect }) => {
      const status = await browser.$('~interaction-tag-counts');
      await (await browser.$('~tag-remove')).click();
      await expect(status).toHaveAttribute('name', 'Opened: 0; Removed: 1');
      await (await browser.$('~tag-open')).click();
      await expect(status).toHaveAttribute('name', 'Opened: 1; Removed: 1');
    }),
  ],
};
