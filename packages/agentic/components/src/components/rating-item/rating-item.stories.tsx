import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { RatingItem } from './rating-item';
import type { RatingItemFill, RatingItemSize } from './rating-item.types';

const meta: Meta<typeof RatingItem> = {
  title: 'Components/RatingItem',
  component: RatingItem,
  args: { fill: 'half', size: 'medium' },
  argTypes: {
    fill: { control: 'select', options: ['empty', 'half', 'full'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
  parameters: { docs: { description: { component: 'Internal decorative star used within a rating owner.' } } },
};
export default meta;

export const Default: StoryObj<typeof RatingItem> = {};

const sizes: RatingItemSize[] = ['small', 'medium', 'large'];
const fills: RatingItemFill[] = ['full', 'half', 'empty'];

export const SizesAndDirections: StoryObj<typeof RatingItem> = {
  render: () => (
    <View style={{ alignItems: 'flex-start' }}>
      {(['ltr', 'rtl'] as const).flatMap((direction) =>
        sizes.map((size) => (
          <View key={`${direction}-${size}`} style={{ direction, flexDirection: 'row' }}>
            {fills.map((fill) => (
              <RatingItem key={fill} fill={fill} size={size} />
            ))}
          </View>
        )),
      )}
    </View>
  ),
  parameters: { docs: { description: { story: 'Compare aligned empty, half and full artwork at each size in LTR and RTL.' } } },
};
