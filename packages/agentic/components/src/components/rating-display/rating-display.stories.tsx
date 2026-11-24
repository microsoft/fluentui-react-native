import { Pressable, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
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

type Story = WdioStory<StoryObj<typeof RatingDisplay>>;

export const Default: Story = {};

export const Layouts: Story = {
  tags: ['flex-first-wave'],
  render: () => (
    <View style={{ alignItems: 'flex-start', gap: 8 }}>
      <RatingDisplay value={4.3} count={0} formatSummary={formatSummary} testID="rating-display-default" />
      <RatingDisplay value={4.3} count={21} layout="compact" size="large" formatSummary={formatSummary} testID="rating-display-compact" />
      <Pressable accessibilityRole="button" accessibilityLabel="Open rated product" testID="rating-display-owner">
        <RatingDisplay value={2.5} decorative testID="rating-display-decorative" />
      </Pressable>
    </View>
  ),
  parameters: { docs: { description: { story: 'Default rounds the star sequence but not the score; compact uses one star.' } } },
  wdio: [
    desktopIt('RTD-002 RTD-004 exposes one static summary per informative display', async (context) => {
      const { browser, desktop, expect } = context;
      const result = await browser.$('~rating-display-default');
      await expect(result).toHaveAttribute('name', '4.3 out of 5, 0 reviews');
      expect(['image', 'text']).toContain(await result.getTagName());
      await expect(await browser.$('~rating-display-compact')).toHaveAttribute('name', '4.3 out of 5, 21 reviews');
      await expect(await browser.$('~rating-display-owner')).toHaveAttribute('name', 'Open rated product');
      expect(await desktop.session.findElements('link text', '4.3')).toHaveLength(0);
      expect(await desktop.session.findElements('link text', '2.5')).toHaveLength(0);
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'rating-display-layouts');
    }),
    desktopIt(
      'RTD-004 publishes no press or range adjustment action on macOS',
      { requires: ['accessibility-actions'], platforms: ['macos'] },
      async ({ browser, expect }) => {
        const summary = await browser.$('~rating-display-default');
        const actions = (await summary.getProperty('accessibilityActions')) as string[];
        expect(actions.filter((action) => ['AXPress', 'AXIncrement', 'AXDecrement'].includes(action))).toHaveLength(0);
      },
    ),
  ],
};
