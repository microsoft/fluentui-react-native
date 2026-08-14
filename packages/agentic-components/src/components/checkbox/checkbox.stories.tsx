/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Checkbox } from './checkbox';
import type { CheckboxStatus, CheckboxVariant } from './checkbox.types';

type StoryGroupProps = {
  children: ReactNode;
  label: string;
};

const StoryGroup = ({ children, label }: StoryGroupProps) => (
  <View style={styles.group}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.row}>{children}</View>
  </View>
);

const variants: readonly { label: string; value: CheckboxVariant }[] = [
  { label: 'Standard', value: 'standard' },
  { label: 'Circular', value: 'circular' },
];

const statuses: readonly { label: string; value: CheckboxStatus }[] = [
  { label: 'Unchecked', value: 'unchecked' },
  { label: 'Checked', value: 'checked' },
  { label: 'Indeterminate', value: 'indeterminate' },
];

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    label: 'Checkbox',
    secondaryText: 'Description',
    showLabel: true,
    showSecondaryText: false,
    status: 'unchecked',
    variant: 'standard',
  },
  argTypes: {
    showLabel: { control: 'boolean' },
    showSecondaryText: { control: 'boolean' },
    status: { control: 'select', options: statuses.map(({ value }) => value) },
    variant: { control: 'select', options: variants.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Checkbox is a tri-state selection control for explicit submission flows. Use Checkbox when options are independent or when a parent option needs an indeterminate mixed state.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Style">
        {variants.map(({ label, value }) => (
          <Checkbox key={value} label={label} variant={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Status">
        {statuses.map(({ label, value }) => (
          <Checkbox key={value} label={label} status={value} />
        ))}
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the style axis and the tri-state status axis.',
      },
    },
  },
};

export const SecondaryText: Story = {
  render: () => (
    <StoryGroup label="Secondary text">
      <Checkbox label="Label" secondaryText="Supporting context" showSecondaryText />
      <Checkbox label="Label" secondaryText="Supporting context" showSecondaryText status="checked" />
      <Checkbox label="Label" secondaryText="Supporting context" showSecondaryText status="indeterminate" />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Secondary text stays visually subordinate while still being announced as supporting context.',
      },
    },
  },
};

export const HiddenLabel: Story = {
  render: () => (
    <StoryGroup label="Label fallback">
      <Checkbox accessibilityLabel="Enable notifications" label="Hidden label" showLabel={false} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'When the visible label is hidden, the component still requires an accessible name.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <StoryGroup label="Disabled">
      <Checkbox disabled label="Disabled" />
      <Checkbox disabled label="Disabled" showSecondaryText secondaryText="Unavailable option" />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled checkboxes are unavailable, expose disabled accessibility state, and do not receive focus.',
      },
    },
  },
};

export const ConstrainedText: Story = {
  render: () => (
    <StoryGroup label="Constrained label">
      <Checkbox
        label="Long checkbox label that wraps inside constrained layouts without truncating"
        secondaryText="Secondary text can wrap too."
        showSecondaryText
        style={styles.constrained}
      />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Checkbox text wraps when constrained by surrounding layout.',
      },
    },
  },
};

const styles = StyleSheet.create({
  constrained: {
    width: 220,
  },
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 12,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
