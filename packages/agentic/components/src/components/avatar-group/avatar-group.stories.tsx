import { Pressable, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { AvatarGroup } from './avatar-group';

const members = ['Ada', 'Bo', 'Cara', 'Di', 'Eli', 'Flo', 'Gus'].map((name) => ({
  key: name,
  name,
  avatar: { initials: name.slice(0, 2).toUpperCase() },
}));

const meta: Meta<typeof AvatarGroup> = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  args: { members, accessibilityLabel: 'Reviewers' },
  argTypes: {
    size: { control: 'select', options: [16, 20, 24, 28, 32, 40, 56, 120] },
    members: { control: false },
    formatOverflow: { control: false },
  },
  parameters: { docs: { description: { component: 'A spread row with up to five identity markers and a passive overflow count.' } } },
};
export default meta;

type Story = WdioStory<StoryObj<typeof AvatarGroup>>;

export const Default: Story = {};

export const Density: Story = {
  tags: ['flex-first-wave'],
  render: () => (
    <View style={{ alignItems: 'flex-start', gap: 12 }}>
      <AvatarGroup members={members} accessibilityLabel="Compact reviewers" size={16} testID="reviewer-density-small" />
      <AvatarGroup members={members} accessibilityLabel="Large reviewers" size={120} testID="reviewer-density-large" />
    </View>
  ),
  parameters: { docs: { description: { story: 'Check overflow typography against the smallest and largest avatars.' } } },
  wdio: [
    desktopIt('AVG-002 lays out compact and large spread groups', async (context) => {
      const { browser, expect } = context;
      const small = await browser.$('~reviewer-density-small');
      const large = await browser.$('~reviewer-density-large');
      const smallRect = await browser.getElementRect(await small.elementId);
      const largeRect = await browser.getElementRect(await large.elementId);
      expect(smallRect.height).toBeGreaterThan(0);
      expect(largeRect.height).toBeGreaterThan(smallRect.height);
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'avatar-group-density');
    }),
  ],
};

export const Overflow: Story = {
  tags: ['flex-first-wave'],
  render: () => (
    <View style={{ alignItems: 'flex-start', gap: 12 }}>
      <AvatarGroup members={members.slice(0, 5)} accessibilityLabel="Reviewers" size={24} testID="reviewers-five" />
      <AvatarGroup
        members={members}
        accessibilityLabel="Reviewers"
        size={24}
        formatOverflow={(count) => ({ text: `+${count}`, accessibilityLabel: `${count} more reviewers` })}
        testID="reviewers-overflow"
      />
      <Pressable accessibilityRole="button" accessibilityLabel="Open reviewer roster" testID="reviewers-roster">
        <AvatarGroup members={members} accessibilityLabel="Duplicate reviewer summary" decorative size={24} />
      </Pressable>
    </View>
  ),
  parameters: {
    docs: { description: { story: 'Compare all five members, four plus overflow, and a decorative group within one action.' } },
  },
  wdio: [
    desktopIt('AVG-001 AVG-004 names visible members and overflow without exposing a nested duplicate', async (context) => {
      const { browser, desktop, expect } = context;
      await expect(await browser.$('~reviewers-five')).toHaveAttribute('name', 'Reviewers, Ada, Bo, Cara, Di, Eli');
      await expect(await browser.$('~reviewers-overflow')).toHaveAttribute('name', 'Reviewers, Ada, Bo, Cara, Di, 3 more reviewers');
      await expect(await browser.$('~reviewers-roster')).toHaveAttribute('name', 'Open reviewer roster');
      expect(await desktop.session.findElements('link text', 'Duplicate reviewer summary, Ada, Bo, Cara, Di, +3')).toHaveLength(0);
      expect(await desktop.session.findElements('link text', 'Ada')).toHaveLength(0);
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'avatar-group-overflow');
    }),
  ],
};
