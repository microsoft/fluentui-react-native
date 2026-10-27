import { StyleSheet, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import { Button } from '../../components/button/button';
import { StoryItem } from './story-item';

const meta: Meta<typeof StoryItem> = {
  title: 'Test/StoryItem',
  component: StoryItem,
  args: {
    label: 'Sample',
    children: <Button>Example</Button>,
  },
};

export default meta;

type Story = StoryObj<typeof StoryItem>;

export const Default: Story = {
  render: (args) => (
    <View style={styles.scene}>
      <StoryItem {...args} />
    </View>
  ),
};

const styles = StyleSheet.create({
  scene: { padding: 16 },
});
