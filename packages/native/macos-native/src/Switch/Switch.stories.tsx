/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Native/macOS/Switch',
  component: Switch,
  args: {
    defaultValue: false,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        component: 'A thin wrapper around the AppKit `NSSwitch` toggle control.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.defaultValue ?? false);
    return <Switch {...args} value={value} onValueChange={setValue} />;
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: true,
    disabled: true,
  },
};
