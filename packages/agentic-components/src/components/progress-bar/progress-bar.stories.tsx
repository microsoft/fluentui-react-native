/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { ProgressBar } from './progress-bar';

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

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  args: {
    label: 'Uploading photos',
    progress: 42,
    showValueText: true,
    status: 'neutral',
    type: 'determinate',
  },
  argTypes: {
    progress: { control: { type: 'number', min: 0, max: 100, step: 1 } },
    showValidationIcon: { control: 'boolean' },
    showValueText: { control: 'boolean' },
    status: { control: 'select', options: ['neutral', 'error', 'success'] },
    type: { control: 'select', options: ['determinate', 'indeterminate', 'static'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'ProgressBar communicates measured progress, continuous work in flight, or a snapshot value. Prefer Determinate when a percentage is known, use Indeterminate only while the total is unknown, and use Static for a non-animating snapshot.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Type">
        <ProgressBar label="Determinate" progress={72} type="determinate" />
        <ProgressBar label="Indeterminate" type="indeterminate" />
        <ProgressBar label="Static" progress={66} type="static" valueText="240 GB of 500 GB used" />
      </StoryGroup>
      <StoryGroup label="Status">
        <ProgressBar label="Neutral" progress={42} status="neutral" />
        <ProgressBar label="Error" progress={80} showValidationIcon status="error" valueText="Upload failed" />
        <ProgressBar label="Success" progress={100} showValidationIcon status="success" valueText="Complete" />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the main type and status variants.',
      },
    },
  },
};

export const ValueText: Story = {
  render: () => (
    <StoryGroup label="Value text">
      <ProgressBar label="Uploading photos" progress={12} valueText="12 of 30 files" />
      <ProgressBar label="Storage used" progress={48} type="static" valueText="240 GB of 500 GB used" />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use Value text for fractions, units, or short failure reasons rather than a raw percentage.',
      },
    },
  },
};

export const ValidationIcon: Story = {
  render: () => (
    <StoryGroup label="Validation icon">
      <ProgressBar label="Upload failed" progress={80} showValidationIcon status="error" valueText="Upload failed" />
      <ProgressBar label="Upload complete" progress={100} showValidationIcon status="success" valueText="Complete" />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error and Success statuses can surface a 16px validation icon in the header.',
      },
    },
  },
};

export const ConstrainedLayout: Story = {
  render: () => (
    <View style={styles.constrained}>
      <ProgressBar label="Uploading photos from yesterday and today" progress={58} valueText="58%" />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ProgressBar stretches to the available width, and the label is allowed to shrink and wrap when space is tight.',
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
    width: '100%',
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
