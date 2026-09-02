/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

import { Input } from '../input/input';
import { Label } from './label';
import type { LabelSize, LabelWeight } from './label.types';

type StoryGroupProps = {
  children: ReactNode;
  label: string;
};

const StoryGroup = ({ children, label }: StoryGroupProps) => (
  <View style={styles.group}>
    <Text style={styles.groupLabel}>{label}</Text>
    <View style={styles.row}>{children}</View>
  </View>
);

const weights: readonly { label: string; value: LabelWeight }[] = [
  { label: 'Regular', value: 'regular' },
  { label: 'Strong', value: 'strong' },
];

const sizes: readonly { label: string; value: LabelSize }[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  args: {
    content: 'Display name',
    disabled: false,
    required: false,
    size: 'medium',
    testID: 'agentic-storybook-label',
    weight: 'regular',
  },
  argTypes: {
    content: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    requiredIndicator: { control: false },
    size: { control: 'select', options: sizes.map(({ value }) => value) },
    weight: { control: 'select', options: weights.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Label names an associated form control. It is non-interactive, offers Regular and Strong emphasis across three sizes, and can show a decorative required indicator. Associate it with a control by giving the label a nativeID and pointing the control at it with accessibilityLabelledBy.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'reads-as-a-single-text-element',
          title: 'Exposes the label as one non-focusable text element',
          steps: [
            { action: 'wait', target: { testId: 'agentic-storybook-label' } },
            { expect: { state: 'role', target: { testId: 'agentic-storybook-label' }, value: 'text' } },
            { expect: { state: 'accessibleName', target: { testId: 'agentic-storybook-label' }, value: 'Display name' } },
            { expect: { state: 'enabled', target: { testId: 'agentic-storybook-label' }, value: true } },
          ],
        },
        {
          id: 'keeps-the-required-indicator-decorative',
          title: 'Shows the required indicator without announcing it',
          steps: [
            { action: 'setArgs', args: { required: true } },
            { action: 'wait', target: { testId: 'agentic-storybook-label' } },
            { expect: { state: 'accessibleName', target: { testId: 'agentic-storybook-label' }, value: 'Display name' } },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Weight">
        {weights.map(({ label, value }) => (
          <Label key={value} content={label} weight={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Size">
        {sizes.map(({ label, value }) => (
          <Label key={value} content={label} size={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Required">
        <Label content="Optional" />
        <Label content="Required" required />
      </StoryGroup>
      <StoryGroup label="Disabled">
        <Label content="Rest" required />
        <Label content="Disabled" disabled required />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the weight, size, required, and disabled variants.',
      },
    },
  },
};

export const Weight: Story = {
  render: () => (
    <StoryGroup label="Weight">
      {weights.map(({ label, value }) => (
        <Label key={value} content={label} weight={value} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Regular is the default and reads at the same rank as surrounding content. Strong adds semibold emphasis.',
      },
    },
  },
};

export const Size: Story = {
  render: () => (
    <StoryGroup label="Size">
      {sizes.map(({ label, value }) => (
        <Label key={value} content={label} size={value} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Small, Medium, and Large change typography only. Match the size of the associated control.',
      },
    },
  },
};

export const Required: Story = {
  render: () => (
    <StoryGroup label="Required">
      <Label content="Optional" />
      <Label content="Required" required />
      <Label content="Custom indicator" required requiredIndicator="(required)" />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The indicator is decorative and stays out of the accessibility tree, so the associated control still has to report that it is required.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <StoryGroup label="Disabled">
      <Label content="Rest" required />
      <Label content="Disabled" disabled required />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled mirrors the associated control and changes foreground color only. The indicator loses its danger color.',
      },
    },
  },
};

export const AssociatedControl: Story = {
  render: () => (
    <View style={styles.field}>
      <Label content="Display name" nativeID="agentic-storybook-label-field" required />
      <Input placeholder="Ada Lovelace" textInput={{ accessibilityLabelledBy: 'agentic-storybook-label-field' }} />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Give the label a nativeID and point the control at it with accessibilityLabelledBy to associate the two.',
      },
    },
  },
};

const styles = StyleSheet.create({
  field: {
    alignItems: 'flex-start',
    gap: 4,
  },
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
