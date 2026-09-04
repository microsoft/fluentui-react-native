/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

import { Avatar } from '../avatar/avatar';
import { AvatarGroup } from './avatar-group';
import type { AvatarGroupLayout, AvatarGroupSize } from './avatar-group.types';

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

const members: readonly { initials: string; name: string }[] = [
  { initials: 'LM', name: 'Lydia Mitchelson' },
  { initials: 'RK', name: 'Rahul Kapoor' },
  { initials: 'AC', name: 'Amanda Cruz' },
];

const layouts: readonly { label: string; value: AvatarGroupLayout }[] = [
  { label: 'Spread', value: 'spread' },
  { label: 'Stack', value: 'stack' },
];

const sizes: readonly AvatarGroupSize[] = [16, 20, 24, 28, 32, 40, 56, 120];

const renderMembers = (size: AvatarGroupSize, count = members.length) =>
  members.slice(0, count).map(({ initials, name }) => <Avatar key={initials} accessibilityLabel={name} initials={initials} size={size} />);

const meta: Meta<typeof AvatarGroup> = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  args: {
    accessibilityLabel: 'Document collaborators',
    layout: 'spread',
    overflowCount: 0,
    size: 40,
    testID: 'agentic-storybook-avatar-group',
  },
  argTypes: {
    layout: { control: 'select', options: layouts.map(({ value }) => value) },
    overflowCount: { control: { type: 'number', min: 0, step: 1 } },
    size: { control: 'select', options: sizes },
  },
  parameters: {
    docs: {
      description: {
        component:
          'AvatarGroup lays a small set of Avatar items out in a single row, either spread apart or stacked with a separation ring, and appends an optional `+N` indicator for the members it does not show. It is non-interactive, and it announces the cohort once when it carries an accessible name.',
      },
    },
  },
  render: (args) => <AvatarGroup {...args}>{renderMembers(args.size ?? 40)}</AvatarGroup>,
};

export default meta;

type Story = StoryObj<typeof AvatarGroup>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'named-group',
          title: 'Announces the labeled cohort as a single element',
          steps: [
            { action: 'wait', target: { testId: 'agentic-storybook-avatar-group' } },
            { expect: { state: 'displayed', target: { testId: 'agentic-storybook-avatar-group' }, value: true } },
            {
              expect: {
                state: 'accessibleName',
                target: { testId: 'agentic-storybook-avatar-group' },
                value: 'Document collaborators',
              },
            },
            { action: 'screenshot', name: 'avatar-group-default', target: { testId: 'agentic-storybook-avatar-group' } },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Spread">
        <AvatarGroup accessibilityLabel="Spread collaborators">{renderMembers(40)}</AvatarGroup>
      </StoryGroup>
      <StoryGroup label="Stack">
        <AvatarGroup accessibilityLabel="Stacked collaborators" layout="stack">
          {renderMembers(40)}
        </AvatarGroup>
      </StoryGroup>
      <StoryGroup label="Overflow">
        <AvatarGroup accessibilityLabel="Collaborators, 6 more hidden" layout="stack" overflowCount={6}>
          {renderMembers(40)}
        </AvatarGroup>
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the two layouts and the overflow indicator.',
      },
    },
  },
};

export const Layouts: Story = {
  render: () => (
    <View style={styles.story}>
      {layouts.map(({ label, value }) => (
        <StoryGroup key={value} label={label}>
          <AvatarGroup accessibilityLabel={`${label} collaborators`} layout={value}>
            {renderMembers(40)}
          </AvatarGroup>
        </StoryGroup>
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spread separates the items with a size-scaled gap; stack overlaps them and paints a separation ring between them.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <View style={styles.story}>
      {layouts.map(({ label, value }) => (
        <StoryGroup key={value} label={label}>
          {sizes.map((size) => (
            <AvatarGroup key={size} accessibilityLabel={`${label} collaborators ${size}`} layout={value} size={size}>
              {renderMembers(size, 2)}
            </AvatarGroup>
          ))}
        </StoryGroup>
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The group resolves its gap, overlap, and ring from its own size, so each child Avatar needs the same size.',
      },
    },
  },
};

export const Overflow: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Counts">
        {[1, 9, 42, 250].map((overflowCount) => (
          <AvatarGroup
            key={overflowCount}
            accessibilityLabel={`Collaborators, ${overflowCount} more hidden`}
            layout="stack"
            overflowCount={overflowCount}
          >
            {renderMembers(40, 2)}
          </AvatarGroup>
        ))}
      </StoryGroup>
      <StoryGroup label="Hidden">
        <AvatarGroup accessibilityLabel="Collaborators" overflow={null} overflowCount={6}>
          {renderMembers(40, 2)}
        </AvatarGroup>
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The indicator saturates at `+99`, and passing `overflow={null}` suppresses it even when the count is positive.',
      },
    },
  },
};

const styles = StyleSheet.create({
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
