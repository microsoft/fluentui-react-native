/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Button } from './Button';
import type { ButtonBezelStyle } from './Button.types';

const meta: Meta<typeof Button> = {
  title: 'Native/macOS/Button',
  component: Button,
  args: {
    title: 'Button',
    bezelStyle: 'rounded',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        component: 'A thin wrapper around the AppKit `NSButton` control, configured as a momentary push button.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: (args) => {
    const [count, setCount] = useState(0);
    return (
      <View style={styles.row}>
        <Button {...args} onPress={() => setCount((c) => c + 1)} />
        <Text>Clicked {count} times</Text>
      </View>
    );
  },
};

const bezelStyles: readonly ButtonBezelStyle[] = ['rounded', 'regularSquare', 'texturedRounded', 'roundRect', 'recessed', 'help', 'glass'];

export const BezelStyles: Story = {
  render: (args) => (
    <View style={styles.grid}>
      {bezelStyles.map((bezelStyle) => (
        <Button key={bezelStyle} {...args} bezelStyle={bezelStyle} title={bezelStyle} />
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: "The 'glass' bezel style requires macOS 26 (Tahoe) and falls back to the default rounded bezel on older OS versions.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
