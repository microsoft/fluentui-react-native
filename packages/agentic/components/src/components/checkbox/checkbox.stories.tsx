/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

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
    accessibilityLabel: 'Checkbox',
    label: 'Checkbox',
    secondaryText: 'Description',
    showLabel: true,
    showSecondaryText: false,
    defaultStatus: 'unchecked',
    testID: 'agentic-storybook-checkbox',
    variant: 'standard',
  },
  argTypes: {
    showLabel: { control: 'boolean' },
    showSecondaryText: { control: 'boolean' },
    defaultStatus: { control: 'select', options: statuses.map(({ value }) => value) },
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

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'accessibility-contract',
          title: 'Exposes checkbox semantics',
          steps: [
            { action: 'wait', target: { testId: 'agentic-storybook-checkbox' } },
            { expect: { state: 'role', target: { testId: 'agentic-storybook-checkbox' }, value: 'checkbox' } },
            { expect: { state: 'accessibleName', target: { testId: 'agentic-storybook-checkbox' }, value: 'Checkbox' } },
            { expect: { state: 'checked', target: { testId: 'agentic-storybook-checkbox' }, value: false } },
            { expect: { state: 'enabled', target: { testId: 'agentic-storybook-checkbox' }, value: true } },
          ],
        },
        {
          id: 'toggles-checked-state',
          title: 'Toggles through native activation',
          requires: ['physical-click'],
          steps: [
            { action: 'click', target: { testId: 'agentic-storybook-checkbox' } },
            {
              action: 'wait',
              until: { state: 'checked', target: { testId: 'agentic-storybook-checkbox' }, value: true },
            },
          ],
        },
        {
          id: 'focus-survival',
          title: 'Survives programmatic focus without a delayed native crash',
          requires: ['focus'],
          steps: [
            { action: 'focus', target: { testId: 'agentic-storybook-checkbox' } },
            { action: 'pause', durationMs: 3000 },
            { expect: { state: 'exists', target: { testId: 'agentic-storybook-checkbox' }, value: true } },
            { expect: { state: 'focused', target: { testId: 'agentic-storybook-checkbox' }, value: true } },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
  },
};

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
          <Checkbox key={value} label={label} defaultStatus={value} />
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
      <Checkbox label="Label" secondaryText="Supporting context" showSecondaryText defaultStatus="checked" />
      <Checkbox label="Label" secondaryText="Supporting context" showSecondaryText defaultStatus="indeterminate" />
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

export const ExternallyDrivenStatus: Story = {
  render: () => {
    const SelectAll = () => {
      const [statuses, setStatuses] = useState<readonly CheckboxStatus[]>(['unchecked', 'checked']);
      const allChecked = statuses.every((status) => status === 'checked');
      const parentStatus: CheckboxStatus = allChecked ? 'checked' : statuses.some((s) => s === 'checked') ? 'indeterminate' : 'unchecked';
      return (
        <StoryGroup label="Select all">
          <Checkbox
            label="All options"
            onStatusChange={() => setStatuses(statuses.map(() => (allChecked ? 'unchecked' : 'checked')))}
            status={parentStatus}
          />
          {statuses.map((status, index) => (
            <Checkbox
              key={index}
              label={`Option ${index + 1}`}
              onStatusChange={(next) => setStatuses(statuses.map((current, i) => (i === index ? next : current)))}
              status={status}
            />
          ))}
        </StoryGroup>
      );
    };
    return <SelectAll />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'A parent checkbox owns the status of its children. Every checkbox is externally driven and reports presses through onStatusChange, which is how the parent resolves its own indeterminate state.',
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
