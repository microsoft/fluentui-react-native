/** @jsxImportSource @fluentui-react-native/framework-base */
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { ProgressIndicator } from './ProgressIndicator';

const meta: Meta<typeof ProgressIndicator> = {
  title: 'Native/macOS/ProgressIndicator',
  component: ProgressIndicator,
  args: {
    indicatorStyle: 'bar',
    indeterminate: false,
    value: 40,
    minValue: 0,
    maxValue: 100,
    animating: true,
  },
  parameters: {
    docs: {
      description: {
        component: 'A thin wrapper around the AppKit `NSProgressIndicator` control (determinate bar or indeterminate spinner).',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ProgressIndicator>;

export const DeterminateBar: Story = {
  render: (args) => <ProgressIndicator {...args} style={{ width: 200 }} />,
};

export const IndeterminateSpinner: Story = {
  args: {
    indicatorStyle: 'spinner',
    indeterminate: true,
    animating: true,
  },
  render: (args) => (
    <View style={{ height: 32, width: 32 }}>
      <ProgressIndicator {...args} />
    </View>
  ),
};
