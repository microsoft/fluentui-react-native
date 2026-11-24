import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Input } from '../input/input';
import { SwatchPicker } from './swatch-picker';
import type { SwatchPickerItems } from './swatch-picker.types';

const styles = StyleSheet.create({ scene: { width: 210, gap: 8 }, grid: { width: 86 } });
const items = [
  { value: 'navy', accessibilityLabel: 'Navy', testID: 'finish-navy', sample: { kind: 'color', color: '#173b78' } },
  { value: 'clay', accessibilityLabel: 'Clay', testID: 'finish-clay', sample: { kind: 'color', color: '#b66142' } },
  { value: 'chalk', accessibilityLabel: 'Chalk', disabled: true, sample: { kind: 'color', color: '#d8d3c8' } },
  { value: 'pine', accessibilityLabel: 'Pine', testID: 'finish-pine', sample: { kind: 'color', color: '#286342' } },
  { value: 'lilac', accessibilityLabel: 'Lilac', testID: 'finish-lilac', sample: { kind: 'color', color: '#b994dd' } },
] as const satisfies SwatchPickerItems;
const meta: Meta<typeof SwatchPicker> = {
  title: 'Components/SwatchPicker',
  component: SwatchPicker,
  args: { accessibilityLabel: 'Product finish', items },
  argTypes: {
    layout: { control: 'select', options: ['row', 'grid'] },
    shape: { control: 'select', options: ['circular', 'square'] },
    value: { control: false },
  },
};
export default meta;
type Story = WdioStory<StoryObj<typeof SwatchPicker>>;
export const Default: Story = {};
export const WrappedFinishes: Story = {
  tags: ['flex-third-wave'],
  render: function FinishesScene(args) {
    const [selected, setSelected] = useState('navy');
    return (
      <View style={styles.scene}>
        <Input accessibilityLabel="Product" textInput={{ testID: 'finish-entry' }} />
        <SwatchPicker
          {...args}
          testID="finish-picker"
          layout="grid"
          style={styles.grid}
          size="large"
          shape="square"
          value={selected}
          onValueChange={setSelected}
        />
        <StoryStatus testID="finish-result">{selected}</StoryStatus>
      </View>
    );
  },
  wdio: [
    desktopIt('SWP-004 exposes named samples in one grid-shaped choice group', async (context) => {
      const { browser, expect } = context;
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await expect(await browser.$('~finish-picker')).toHaveAttribute('name', 'Product finish');
      await expect(await browser.$('~finish-pine')).toHaveAttribute('name', 'Pine');
      await recordVisualReview(context, 'swatch-picker');
    }),
    desktopIt(
      'SWP-002 Down reaches a measured row and chooses an eligible sample',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        const { expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        await focusByTab(browser, 'finish-entry', 'finish-navy');
        await browser.keys('\uE015');
        await expectNativeState(browser, 'finish-pine', 'focused', true);
        await expect(await browser.$('~finish-result')).toHaveAttribute('name', 'pine');
      },
    ),
  ],
};
