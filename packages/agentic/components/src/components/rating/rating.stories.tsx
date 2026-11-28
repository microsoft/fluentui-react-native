import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { Rating } from './rating';

const formatValue = (value: number | null, max: number): string => (value == null ? 'No rating' : `${value} of ${max}`);
const meta: Meta<typeof Rating> = { title: 'Components/Rating', component: Rating, args: { accessibilityLabel: 'Quality' } };
export default meta;
type Story = WdioStory<StoryObj<typeof Rating>>;
export const Default: Story = { render: (args) => <Rating {...args} formatValue={formatValue} /> };
export const Qualities: Story = {
  tags: ['flex-fourth-wave', 'mac-appkit-foundation'],
  render: (args) => (
    <View style={{ gap: 8 }}>
      <Rating {...args} formatValue={formatValue} defaultValue={3.5} targetTestID="quality-score" />
      <Rating accessibilityLabel="Unrated quality" formatValue={formatValue} targetTestID="quality-unrated" />
    </View>
  ),
  wdio: [
    desktopIt(
      'RTG-004 UIA writes nonadjacent fractions and distinguishes unset from zero',
      { platforms: ['windows'], requires: ['set-range-value'] },
      async (context) => {
        const { browser, desktop, expect } = context;
        const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
        const score = await desktop.session.findElement('accessibility id', 'quality-score');
        const unrated = await desktop.session.findElement('accessibility id', 'quality-unrated');
        await expect(await browser.$('~quality-score')).toHaveAttribute('name', 'Quality');
        expect(await score.getRangeValue()).toBe(3.5);
        expect(await unrated.getRangeValue()).toBeNull();
        await recordVisualReview(context, 'rating-fraction-and-unset');
        await score.setRangeValue(1.5);
        await browser.waitUntil(async () => (await score.getRangeValue()) === 1.5);
        await unrated.setRangeValue(0);
        await browser.waitUntil(async () => (await unrated.getRangeValue()) === 0);
        await unrated.setRangeValue(4.5);
        await browser.waitUntil(async () => (await unrated.getRangeValue()) === 4.5);
      },
    ),
    desktopIt(
      'RTG-004 exposes a committed fractional value independently of the star artwork',
      { platforms: ['macos'] },
      async (context) => {
        const { browser, expect } = context;
        const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
        const score = await browser.$('~quality-score');
        await expect(score).toHaveAttribute('name', 'Quality');
        expect(String(await score.getProperty('value'))).toBe('3.5');
        await expect(await browser.$('~quality-unrated')).toHaveAttribute('name', 'Unrated quality');
        await recordVisualReview(context, 'rating');
      },
    ),
    desktopIt(
      'RTG-004 native accessibility chooses the first fraction from unset',
      { platforms: ['macos'], requires: ['accessibility-actions', 'perform-accessibility-action'] },
      async ({ browser, expect }) => {
        const target = await browser.$('~quality-unrated');
        expect(await target.getProperty('accessibilityActions')).toContain('AXIncrement');
        await target.desktopPerformAccessibilityAction('AXIncrement');
        await expect(target).toHaveAttribute('value', '0.5');
      },
    ),
  ],
};
