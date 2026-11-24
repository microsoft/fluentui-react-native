import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { DestructiveButton } from './destructive-button';

const meta: Meta<typeof DestructiveButton> = {
  title: 'Components/DestructiveButton',
  component: DestructiveButton,
  args: { content: 'Remove saved item' },
  argTypes: {
    appearance: { control: 'select', options: ['subtle', 'primary'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    shape: { control: 'select', options: ['rounded', 'circular'] },
  },
  parameters: { docs: { description: { component: 'A danger-styled command with ordinary Button activation.' } } },
};
export default meta;

type Story = StoryObj<typeof DestructiveButton>;

export const Default: Story = {};

export const Appearances: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <DestructiveButton content="Remove saved item" />
      <DestructiveButton appearance="primary" content="Confirm removal" />
      <DestructiveButton appearance="primary" content="Confirm removal" disabled />
      <DestructiveButton shape="circular" accessibilityLabel="Remove saved item" leadingIcon={{ fontSource: { codepoint: 0xd7 } }} />
    </View>
  ),
  parameters: {
    docs: { description: { story: 'Compare subtle and primary danger, the neutral disabled state and a named icon-only command.' } },
  },
};
