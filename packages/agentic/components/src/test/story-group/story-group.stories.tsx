import { StyleSheet, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import { Button } from '../../components/button/button';
import { StoryGroup } from './story-group';

const meta: Meta<typeof StoryGroup> = {
  title: 'Test/StoryGroup',
  component: StoryGroup,
  args: {
    label: 'Actions',
    children: <Button>Example</Button>,
  },
};

export default meta;

type Story = StoryObj<typeof StoryGroup>;

export const Default: Story = {
  render: (args) => (
    <View style={styles.scene}>
      <StoryGroup {...args} contentStyle={styles.content} />
    </View>
  ),
};

const styles = StyleSheet.create({
  scene: { padding: 16 },
  content: { alignItems: 'flex-start' },
});
