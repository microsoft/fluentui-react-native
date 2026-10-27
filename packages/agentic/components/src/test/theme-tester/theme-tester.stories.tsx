import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import { Button } from '../../components/button/button';
import { Text } from '../../components/text/text';
import { ThemeTester } from './theme-tester';

const meta: Meta<typeof ThemeTester> = {
  title: 'Test/ThemeTester',
  component: ThemeTester,
};

export default meta;

type Story = StoryObj<typeof ThemeTester>;

export const Default: Story = {
  render: () => (
    <ThemeTester>
      <Preview />
    </ThemeTester>
  ),
};

function Preview() {
  const [count, setCount] = React.useState(0);
  return (
    <View style={styles.preview}>
      <Text>Preview stays mounted: {count}</Text>
      <Button onPress={() => setCount((value) => value + 1)}>Increment</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: { alignItems: 'flex-start', gap: 12, padding: 16 },
});
