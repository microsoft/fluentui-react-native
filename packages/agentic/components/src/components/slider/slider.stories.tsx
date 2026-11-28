import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { Input } from '../input/input';
import { Slider } from './slider';

const meta: Meta<typeof Slider> = { title: 'Components/Slider', component: Slider, args: { accessibilityLabel: 'Price range' } };
export default meta;
type Story = WdioStory<StoryObj<typeof Slider>>;
export const Default: Story = {
  render: ({ accessibilityLabel, disabled, orientation }) => (
    <Slider
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      orientation={orientation}
      defaultValue={30}
      style={{ width: 240 }}
    />
  ),
};
export const PriceRange: Story = {
  tags: ['flex-fourth-wave', 'mac-appkit-foundation'],
  render: () => (
    <View style={{ width: 254, gap: 8 }}>
      <Input accessibilityLabel="Filter products" textInput={{ testID: 'price-previous' }} />
      <Slider
        accessibilityLabel="Price range"
        mode="range"
        min={0}
        max={100}
        step={5}
        defaultValue={[25, 75]}
        thumbLabels={['Minimum price', 'Maximum price']}
        thumbTestIDs={['price-low', 'price-high']}
      />
    </View>
  ),
  wdio: [
    desktopIt(
      'SLD-004 UIA writes each named thumb and rejects crossing',
      { platforms: ['windows'], requires: ['set-range-value'] },
      async (context) => {
        const { browser, desktop, expect } = context;
        const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
        const lower = await desktop.session.findElement('accessibility id', 'price-low');
        const upper = await desktop.session.findElement('accessibility id', 'price-high');
        await expect(await browser.$('~price-low')).toHaveAttribute('name', 'Minimum price');
        await expect(await browser.$('~price-high')).toHaveAttribute('name', 'Maximum price');
        expect(await lower.getRangeValue()).toBe(25);
        expect(await upper.getRangeValue()).toBe(75);
        await lower.setRangeValue(60);
        await browser.waitUntil(async () => (await lower.getRangeValue()) === 60);
        expect(await upper.getRangeValue()).toBe(75);
        await upper.setRangeValue(90);
        await browser.waitUntil(async () => (await upper.getRangeValue()) === 90);
        await expect(lower.setRangeValue(95)).rejects.toThrow();
        await expect(upper.setRangeValue(55)).rejects.toThrow();
        expect(await lower.getRangeValue()).toBe(60);
        expect(await upper.getRangeValue()).toBe(90);
        await recordVisualReview(context, 'slider-range');
      },
    ),
    desktopIt(
      'SLD-002 tabs to and adjusts each Windows range thumb independently',
      { platforms: ['windows'], requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, desktop, expect }) => {
        const { expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        const lower = await desktop.session.findElement('accessibility id', 'price-low');
        const upper = await desktop.session.findElement('accessibility id', 'price-high');
        await focusByTab(browser, 'price-previous', 'price-low');
        await browser.keys('\uE014');
        await browser.waitUntil(async () => (await lower.getRangeValue()) === 30);
        await browser.keys('\uE004');
        await expectNativeState(browser, 'price-high', 'focused', true);
        await browser.keys('\uE014');
        await browser.waitUntil(async () => (await upper.getRangeValue()) === 80);
        expect(await lower.getRangeValue()).toBe(30);
      },
    ),
    desktopIt('SLD-004 exposes distinct lower and upper native range values', { platforms: ['macos'] }, async (context) => {
      const { browser, expect } = context;
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      const lower = await browser.$('~price-low');
      const upper = await browser.$('~price-high');
      await expect(lower).toHaveAttribute('name', 'Minimum price');
      await expect(upper).toHaveAttribute('name', 'Maximum price');
      expect(String(await lower.getProperty('value'))).toBe('25');
      expect(String(await upper.getProperty('value'))).toBe('75');
      await recordVisualReview(context, 'slider-range');
    }),
    desktopIt(
      'SLD-001 dragging the lower thumb moves only the lower native range value',
      { platforms: ['macos'], requires: ['physical-click'] },
      async ({ browser, expect }) => {
        await (await browser.$('~price-previous')).click();
        const lower = await browser.$('~price-low');
        const upper = await browser.$('~price-high');
        const low = await browser.getElementRect(await lower.elementId);
        const high = await browser.getElementRect(await upper.elementId);
        const start = Math.round(low.x + low.width / 2);
        const middle = Math.round((low.x + low.width / 2 + high.x + high.width / 2) / 2);
        const y = Math.round(low.y + low.height / 2);
        try {
          await browser.performActions([
            {
              type: 'pointer',
              id: 'price-thumb-drag',
              parameters: { pointerType: 'mouse' },
              actions: [
                { type: 'pointerMove', origin: 'viewport', x: start, y },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerMove', origin: 'viewport', x: middle, y, duration: 150 },
                { type: 'pointerUp', button: 0 },
              ],
            },
          ]);
        } finally {
          await browser.releaseActions();
        }
        await expect(lower).toHaveAttribute('value', '50');
        await expect(upper).toHaveAttribute('value', '75');
      },
    ),
    desktopIt(
      'SLD-002 tabs to each native thumb and steps the focused value',
      { platforms: ['macos'], requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        const { expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        await focusByTab(browser, 'price-previous', 'price-low');
        await browser.keys('\uE014');
        await expect(await browser.$('~price-low')).toHaveAttribute('value', '30');
        await browser.keys('\uE004');
        await expectNativeState(browser, 'price-high', 'focused', true);
        await browser.keys('\uE014');
        await expect(await browser.$('~price-high')).toHaveAttribute('value', '80');
      },
    ),
    desktopIt(
      'SLD-004 native accessibility increments only the upper target',
      { platforms: ['macos'], requires: ['accessibility-actions', 'perform-accessibility-action'] },
      async ({ browser, expect }) => {
        const upper = await browser.$('~price-high');
        expect(await upper.getProperty('accessibilityActions')).toContain('AXIncrement');
        await upper.desktopPerformAccessibilityAction('AXIncrement');
        await expect(upper).toHaveAttribute('value', '80');
        await expect(await browser.$('~price-low')).toHaveAttribute('value', '25');
      },
    ),
  ],
};
