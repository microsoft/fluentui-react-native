import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { MessageBar } from './message-bar';

const meta: Meta<typeof MessageBar> = {
  title: 'Components/MessageBar',
  component: MessageBar,
  args: { content: 'A new version is available.', announce: false },
};
export default meta;
type Story = WdioStory<StoryObj<typeof MessageBar>>;
export const Default: Story = {};
function StatusExamples() {
  const [dismissed, setDismissed] = useState(0);
  return (
    <View style={{ width: 280, gap: 6 }}>
      <MessageBar announce={false} content="Settings are available." />
      <MessageBar announce={false} status="success" content="Changes saved." />
      <MessageBar announce={false} status="warning" content="Check sharing." />
      <MessageBar
        announce={false}
        status="error"
        title="Sync failed"
        content="No connection."
        messageTestID="message-bar-feedback"
        dismissLabel="Dismiss sync feedback"
        dismissTestID="message-bar-close"
        onDismiss={() => setDismissed((count) => count + 1)}
      />
      <StoryStatus testID="message-bar-count">{`Dismiss requests: ${dismissed}`}</StoryStatus>
    </View>
  );
}
export const Statuses: Story = {
  tags: ['flex-second-wave'],
  render: () => <StatusExamples />,
  wdio: [
    desktopIt('MSB-002 shows the four statuses with independently named text', async (context) => {
      await context.expect(await context.browser.$('~message-bar-feedback')).toHaveAttribute('name', 'Sync failed. No connection.');
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'message-bar');
    }),
    desktopIt('MSB-001 dismissal requests once without owning presence', { requires: ['click'] }, async ({ browser, expect }) => {
      await (await browser.$('~message-bar-close')).click();
      await expect(await browser.$('~message-bar-count')).toHaveAttribute('name', 'Dismiss requests: 1');
      await expect(await browser.$('~message-bar-feedback')).toExist();
    }),
  ],
};
