/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, Text } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { VisualEffectView } from './index';

const meta: Meta<typeof VisualEffectView> = {
  title: 'Native/macOS/VisualEffectView',
  component: VisualEffectView,
  args: {
    material: 'sidebar',
    blendingMode: 'behindWindow',
    state: 'followsWindowActiveState',
  },
  parameters: {
    docs: {
      description: {
        component:
          'A thin wrapper around the AppKit `NSVisualEffectView` control, re-exported from `@fluentui-react-native/vibrancy-view` (which already implements this control natively).',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof VisualEffectView>;

export const Default: Story = {
  render: (args) => (
    <VisualEffectView {...args} style={styles.container}>
      <Text>Vibrancy material behind this text</Text>
    </VisualEffectView>
  ),
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: 120,
    justifyContent: 'center',
    width: 240,
  },
});
