import { useState } from 'react';
import { Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { CompoundButton } from './compound-button';

const meta: Meta<typeof CompoundButton> = {
  title: 'Components/CompoundButton',
  component: CompoundButton,
  args: { content: 'Archive files', secondaryContent: 'Keep a searchable copy' },
  argTypes: {
    appearance: { control: 'select', options: ['primary', 'secondary', 'outline', 'subtle'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
  parameters: { docs: { description: { component: 'One command with a visible supporting line.' } } },
};
export default meta;

type Story = StoryObj<typeof CompoundButton>;

export const Default: Story = {};

function ConstrainedExample() {
  const [height, setHeight] = useState<number>();
  return (
    <View style={{ width: 176 }}>
      <CompoundButton
        appearance="primary"
        content="Archive selected files"
        secondaryContent="Keep a searchable copy without showing it in this view"
        secondaryContentStyle={{ fontSize: 28, lineHeight: 36 }}
        style={{ alignSelf: 'stretch' }}
        onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
      />
      <Text>{height === undefined ? 'Waiting for layout' : `Measured height: ${Math.round(height)}; medium minimum: 60`}</Text>
    </View>
  );
}

export const Constrained: Story = {
  render: () => <ConstrainedExample />,
  parameters: { docs: { description: { story: 'Verify wrapping and growth beyond the minimum with enlarged supporting text.' } } },
};
