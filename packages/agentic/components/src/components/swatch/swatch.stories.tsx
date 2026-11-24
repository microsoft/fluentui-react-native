import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Swatch } from './swatch';

const meta: Meta<typeof Swatch> = {
  title: 'Components/Swatch',
  component: Swatch,
  args: { value: 'blue', sample: { kind: 'color', color: '#4278ba' }, accessibilityLabel: 'Blue' },
  argTypes: { sample: { control: false } },
};
export default meta;
type Story = WdioStory<StoryObj<typeof Swatch>>;
export const Default: Story = {};
function SampleOptions() {
  const [value, setValue] = useState('transparent');
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Swatch
          accessibilityLabel="Transparent"
          value="transparent"
          sample={{ kind: 'color', color: 'transparent' }}
          selected={value === 'transparent'}
          onSelect={setValue}
          testID="clear-swatch"
        />
        <Swatch
          accessibilityLabel="Dark blue"
          value="blue"
          sample={{ kind: 'color', color: '#163a7a' }}
          selected={value === 'blue'}
          shape="square"
          onSelect={setValue}
          testID="blue-swatch"
        />
        <Swatch
          accessibilityLabel="Pale blue"
          value="pale"
          sample={{ kind: 'color', color: '#deeffa' }}
          disabled
          testID="disabled-swatch"
        />
      </View>
      <StoryStatus testID="swatch-selection">{`Selected: ${value}`}</StoryStatus>
    </View>
  );
}
export const Samples: Story = {
  tags: ['flex-second-wave'],
  render: () => <SampleOptions />,
  wdio: [
    desktopIt('SWT-003 SWT-004 exposes named color samples independently of their pixels', async (context) => {
      await context.expect(await context.browser.$('~clear-swatch')).toHaveAttribute('name', 'Transparent');
      await context.expect(await context.browser.$('~disabled-swatch')).toBeDisabled();
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'swatch');
    }),
    desktopIt('SWT-002 reports the option to its owner', { requires: ['physical-click'] }, async ({ browser, expect }) => {
      await (await browser.$('~blue-swatch')).click();
      await expect(await browser.$('~swatch-selection')).toHaveAttribute('name', 'Selected: blue');
    }),
  ],
};
