import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Input } from '../input/input';
import { RadioGroup } from './radio-group';

const styles = StyleSheet.create({ scene: { width: 265, gap: 8 } });
const options = [
  { value: 'standard', label: 'Standard', testID: 'delivery-standard' },
  { value: 'pickup', label: 'Pickup unavailable', disabled: true },
  { value: 'express', label: 'Express', testID: 'delivery-express' },
];
const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: { label: 'Delivery speed', options },
  argTypes: { orientation: { control: 'select', options: ['vertical', 'horizontal'] }, value: { control: false } },
};
export default meta;
type Story = WdioStory<StoryObj<typeof RadioGroup>>;
export const Default: Story = {};
export const Delivery: Story = {
  tags: ['flex-third-wave'],
  render: function DeliveryScene(args) {
    const [value, setValue] = useState('standard');
    const [changes, setChanges] = useState(0);
    return (
      <View style={styles.scene}>
        <Input accessibilityLabel="Delivery address" textInput={{ testID: 'delivery-entry' }} />
        <RadioGroup
          {...args}
          testID="delivery-group"
          required
          value={value}
          onValueChange={(next) => {
            setValue(next);
            setChanges((count) => count + 1);
          }}
        />
        <StoryStatus testID="delivery-selection">{`${value}; ${changes}`}</StoryStatus>
        <Input accessibilityLabel="Delivery note" textInput={{ testID: 'delivery-exit' }} />
      </View>
    );
  },
  wdio: [
    desktopIt('RDG-003 exposes independently named group choices', async (context) => {
      const { browser, expect } = context;
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await expect(await browser.$('~delivery-group')).toHaveAttribute('name', 'Delivery speed');
      await expect(await browser.$('~delivery-express')).toHaveAttribute('name', 'Express');
      await recordVisualReview(context, 'radio-group');
    }),
    desktopIt(
      'RDG-002 Tab enters one option and arrows skip the disabled choice',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        const { expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        await focusByTab(browser, 'delivery-entry', 'delivery-standard');
        await browser.keys('\uE015');
        await expectNativeState(browser, 'delivery-express', 'focused', true);
        await expect(await browser.$('~delivery-selection')).toHaveAttribute('name', 'express; 1');
        await browser.keys('\uE004');
        await expectNativeState(browser, 'delivery-exit', 'focused', true);
      },
    ),
  ],
};
