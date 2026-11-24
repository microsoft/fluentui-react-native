import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { RatingDisplay } from './rating-display';

function formatSummary(value: number, max: number, count?: number) {
  return `${value} out of ${max}${count === undefined ? '' : `, ${count} reviews`}`;
}

const meta: Meta<typeof RatingDisplay> = {
  title: 'Components/RatingDisplay',
  component: RatingDisplay,
  args: { value: 4.3, max: 5, count: 0, formatSummary },
  argTypes: {
    layout: { control: 'select', options: ['default', 'compact'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    formatSummary: { control: false },
  },
  parameters: { docs: { description: { component: 'Read-only rating artwork with an exact value and one accessible summary.' } } },
};
export default meta;

type Story = StoryObj<typeof RatingDisplay>;

export const Default: Story = {};

export const Layouts: Story = {
  render: () => (
    <View style={{ alignItems: 'flex-start' }}>
      <RatingDisplay value={4.3} count={0} formatSummary={formatSummary} />
      <RatingDisplay value={4.3} count={21} layout="compact" size="large" formatSummary={formatSummary} />
    </View>
  ),
  parameters: { docs: { description: { story: 'Default rounds the star sequence but not the score; compact uses one star.' } } },
};
