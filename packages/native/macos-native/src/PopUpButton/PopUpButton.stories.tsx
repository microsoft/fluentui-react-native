/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { PopUpButton } from './PopUpButton';

const meta: Meta<typeof PopUpButton> = {
  title: 'Native/macOS/PopUpButton',
  component: PopUpButton,
  args: {
    items: [{ title: 'Small' }, { title: 'Medium' }, { title: 'Large' }],
    selectedIndex: 0,
    pullsDown: false,
  },
  parameters: {
    docs: {
      description: {
        component: 'A thin wrapper around the AppKit `NSPopUpButton` control — a native "select"/dropdown menu.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof PopUpButton>;

export const Default: Story = {
  render: (args) => {
    const [selectedIndex, setSelectedIndex] = useState(args.selectedIndex ?? 0);
    return (
      <View style={styles.row}>
        <PopUpButton {...args} selectedIndex={selectedIndex} onChange={setSelectedIndex} style={styles.button} />
        <Text>Selected: {args.items[selectedIndex]?.title}</Text>
      </View>
    );
  },
};

export const PullDownMenu: Story = {
  args: {
    items: [{ title: 'New' }, { title: 'Open…' }, { title: 'Save' }],
    pullsDown: true,
  },
};

const styles = StyleSheet.create({
  button: {
    width: 140,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
