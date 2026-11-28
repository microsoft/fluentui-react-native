import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Button } from '../button/button';
import { Input } from '../input/input';
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

export const SizesAndDirections: WdioStory<StoryObj<typeof RatingItem>> = {
  tags: ['flex-first-wave'],
  render: () => (
    <View style={{ alignItems: 'flex-start', gap: 4 }}>
      <Input accessibilityLabel="Before the ratings" testID="rating-item-before" />
      {(['ltr', 'rtl'] as const).flatMap((direction) =>
        sizes.map((size) => (
          <View key={`${direction}-${size}`} style={{ direction, flexDirection: 'row' }}>
            {fills.map((fill) => (
              <RatingItem key={fill} fill={fill} size={size} />
            ))}
          </View>
        )),
      )}
      <Button content="After the ratings" testID="rating-item-after" />
      <StoryStatus testID="rating-item-directions">First three rows LTR, last three RTL</StoryStatus>
    </View>
  ),
  parameters: { docs: { description: { story: 'Compare aligned empty, half and full artwork at each size in LTR and RTL.' } } },
  wdio: [
    desktopIt('RTI-002 renders the sized LTR and RTL visual fixture', async (context) => {
      await context
        .expect(await context.browser.$('~rating-item-directions'))
        .toHaveAttribute('name', 'First three rows LTR, last three RTL');
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'rating-item-directions');
    }),
    desktopIt('RTI-004 tab skips the passive stars', { requires: ['physical-click', 'keyboard', 'focus'] }, async ({ browser }) => {
      const { focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      await focusByTab(browser, 'rating-item-before', 'rating-item-after');
    }),
  ],
};
