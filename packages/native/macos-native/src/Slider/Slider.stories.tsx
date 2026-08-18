/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
  title: 'Native/macOS/Slider',
  component: Slider,
  args: {
    defaultValue: 50,
    minimumValue: 0,
    maximumValue: 100,
    continuous: true,
  },
  parameters: {
    docs: {
      description: {
        component: 'A thin wrapper around the AppKit `NSSlider` control.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.defaultValue ?? 0);
    return (
      <View style={styles.row}>
        <Slider {...args} style={styles.slider} value={value} onValueChange={setValue} />
        <Text>{Math.round(value)}</Text>
      </View>
    );
  },
};

export const WithTickMarks: Story = {
  args: {
    numberOfTickMarks: 6,
  },
  render: (args) => {
    const [value, setValue] = useState(args.defaultValue ?? 0);
    return <Slider {...args} style={styles.slider} value={value} onValueChange={setValue} />;
  },
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  slider: {
    width: 200,
  },
});
