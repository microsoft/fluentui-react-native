import { Pressable, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
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

type Story = StoryObj<typeof AvatarGroup>;

export const Default: Story = {};

export const Density: Story = {
  render: () => (
    <View style={{ alignItems: 'flex-start', gap: 12 }}>
      <AvatarGroup members={members} accessibilityLabel="Reviewers" size={16} />
      <AvatarGroup members={members} accessibilityLabel="Reviewers" size={120} />
    </View>
  ),
  parameters: { docs: { description: { story: 'Check overflow typography against the smallest and largest avatars.' } } },
};

export const Overflow: Story = {
  render: () => (
    <View style={{ alignItems: 'flex-start', gap: 12 }}>
      <AvatarGroup members={members.slice(0, 5)} accessibilityLabel="Reviewers" size={24} />
      <AvatarGroup
        members={members}
        accessibilityLabel="Reviewers"
        size={24}
        formatOverflow={(count) => ({ text: `+${count}`, accessibilityLabel: `${count} more reviewers` })}
      />
      <Pressable accessibilityRole="button" accessibilityLabel="Open reviewer roster">
        <AvatarGroup members={members} decorative size={24} />
      </Pressable>
    </View>
  ),
  parameters: {
    docs: { description: { story: 'Compare all five members, four plus overflow, and a decorative group within one action.' } },
  },
};
