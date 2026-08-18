/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-native';

import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Native/macOS/SegmentedControl',
  component: SegmentedControl,
  args: {
    segments: [{ label: 'Day' }, { label: 'Week' }, { label: 'Month' }],
    selectedIndex: 0,
    trackingMode: 'selectOne',
    segmentStyle: 'automatic',
  },
  parameters: {
    docs: {
      description: {
        component: 'A thin wrapper around the AppKit `NSSegmentedControl` control.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  render: (args) => {
    const [selectedIndex, setSelectedIndex] = useState(args.selectedIndex ?? 0);
    return <SegmentedControl {...args} selectedIndex={selectedIndex} onChange={setSelectedIndex} style={{ width: 240 }} />;
  },
};

export const WithDisabledSegment: Story = {
  args: {
    segments: [{ label: 'Available' }, { label: 'Disabled', enabled: false }, { label: 'Available' }],
  },
};
