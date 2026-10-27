import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import { SYSTEM_APPEARANCE } from './theme-selection';
import type { TestThemeSelection } from './theme-picker.types';
import { ThemePicker } from './theme-picker';

const meta: Meta<typeof ThemePicker> = {
  title: 'Test/ThemePicker',
  component: ThemePicker,
};

export default meta;

type Story = StoryObj<typeof ThemePicker>;

export const Default: Story = {
  render: () => {
    const [selection, setSelection] = React.useState<TestThemeSelection>({ source: 'inherit' });
    return (
      <View style={styles.scene}>
        <ThemePicker onSelectionChange={setSelection} selection={selection} />
      </View>
    );
  },
};

export const ExplicitFluent: Story = {
  render: () => (
    <View style={styles.scene}>
      <ThemePicker onSelectionChange={() => undefined} selection={{ source: 'fluent', appearance: SYSTEM_APPEARANCE }} />
    </View>
  ),
};

const styles = StyleSheet.create({
  scene: { padding: 16 },
});
