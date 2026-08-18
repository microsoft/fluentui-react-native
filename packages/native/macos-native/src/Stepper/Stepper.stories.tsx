/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Stepper } from './Stepper';

const meta: Meta<typeof Stepper> = {
  title: 'Native/macOS/Stepper',
  component: Stepper,
  args: {
    defaultValue: 0,
    minimumValue: 0,
    maximumValue: 10,
    increment: 1,
  },
  parameters: {
    docs: {
      description: {
        component: 'A thin wrapper around the AppKit `NSStepper` increment/decrement control.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Stepper>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.defaultValue ?? 0);
    return (
      <View style={styles.row}>
        <Stepper {...args} value={value} onValueChange={setValue} />
        <Text>{value}</Text>
      </View>
    );
  },
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
