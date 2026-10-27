import type { Meta, StoryObj } from '@storybook/react-native';
import { StoryStatus } from './story-status';

const meta: Meta<typeof StoryStatus> = {
  title: 'Test/StoryStatus',
  component: StoryStatus,
  args: {
    children: 'Ready',
    testID: 'test-story-status',
  },
};

export default meta;

type Story = StoryObj<typeof StoryStatus>;

export const Default: Story = {};
