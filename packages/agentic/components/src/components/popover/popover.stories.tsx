/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

import { Popover } from './popover';
import type { PopoverPosition } from './popover.types';

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

const positions: readonly { label: string; value: PopoverPosition }[] = [
  { label: 'Bottom', value: 'bottomLeftEdge' },
  { label: 'Top', value: 'topLeftEdge' },
  { label: 'Leading', value: 'leftTopEdge' },
  { label: 'Trailing', value: 'rightTopEdge' },
];

const triggerId = 'agentic-storybook-popover';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  args: {
    defaultOpen: false,
    position: 'bottomLeftEdge',
    surfaceAccessibilityLabel: 'Sync details',
    trigger: { children: <Text>Show details</Text>, testID: triggerId },
  },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' },
    focused: { control: 'boolean' },
    position: { control: 'select', options: positions.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Popover pairs a trigger with a floating surface that is a real platform popup window. The surface mounts only while the popover is open, so its content is created on open and torn down on dismissal. The trigger stays in the host window and owns activation and expanded announcement while the platform popup owns focus after opening.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'opens-from-the-trigger',
          title: 'Opens the floating surface from native trigger activation',
          platforms: ['macos', 'windows'],
          requires: ['accessibility-click'],
          steps: [
            { action: 'wait', target: { testId: 'agentic-storybook-popover' } },
            { expect: { state: 'role', target: { testId: 'agentic-storybook-popover' }, value: 'button' } },
            { expect: { state: 'expanded', target: { testId: 'agentic-storybook-popover' }, value: false } },
            { action: 'click', target: { testId: 'agentic-storybook-popover' } },
            { action: 'wait', until: { state: 'expanded', target: { testId: 'agentic-storybook-popover' }, value: true } },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
    docs: {
      description: {
        story: 'The default Popover renders a trigger and mounts placeholder surface content when it is opened.',
      },
    },
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Placement">
        {positions.map(({ label, value }) => (
          <Popover
            key={value}
            position={value}
            surfaceAccessibilityLabel={`${label} details`}
            trigger={{ children: <Text>{label}</Text> }}
          />
        ))}
      </StoryGroup>
      <StoryGroup label="State">
        <Popover surfaceAccessibilityLabel="Sync details" trigger={{ children: <Text>Closed</Text> }} />
        <Popover disabled surfaceAccessibilityLabel="Sync details" trigger={{ children: <Text>Disabled</Text> }} />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the placement axis and the trigger states.',
      },
    },
  },
};

export const Placement: Story = {
  render: () => (
    <StoryGroup label="Preferred edge">
      {positions.map(({ label, value }) => (
        <Popover key={value} position={value} surfaceAccessibilityLabel={`${label} details`} trigger={{ children: <Text>{label}</Text> }} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Placement is a preference, not a guarantee. The native surface owns the final position, and macOS collapses every alignment variant on one side to the same screen edge.',
      },
    },
  },
};

export const Content: Story = {
  render: () => (
    <View style={styles.story}>
      <Popover
        surfaceAccessibilityLabel="Sync details"
        trigger={{ children: <Text>Rich content</Text> }}
        content={{
          children: (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Last synced 5 minutes ago</Text>
              <Text style={styles.cardBody}>
                Surface content is arbitrary React Native content and is created only while the popover is open.
              </Text>
            </View>
          ),
          testID: 'custom-popover-content',
        }}
      />
      <Popover content={null} surfaceAccessibilityLabel="Empty surface" trigger={{ children: <Text>Empty surface</Text> }} />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The content slot accepts any View-compatible content. Passing null renders the surface with no content at all.',
      },
    },
  },
};

export const ExternallyDrivenOpenState: Story = {
  render: () => {
    const names = ['General', 'Advanced'];
    const Group = () => {
      const [open, setOpen] = useState<string | null>(null);
      return (
        <View style={styles.story}>
          {names.map((name) => (
            <Popover
              key={name}
              onOpenChange={(next) => setOpen(next ? name : null)}
              open={open === name}
              surfaceAccessibilityLabel={`${name} details`}
              trigger={{ children: <Text>{name}</Text> }}
            />
          ))}
        </View>
      );
    };
    return <Group />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Supplying open makes the caller the owner of the state. Trigger activation and native dismissal both report through onOpenChange, so one owner can keep at most a single popover open.',
      },
    },
  },
};

export const Accessibility: Story = {
  args: {
    focused: true,
    surfaceAccessibilityLabel: 'Sync details',
    trigger: { accessibilityLabel: 'Show sync details', children: <Text>Show details</Text> },
  },
  parameters: {
    docs: {
      description: {
        story:
          'The trigger and the surface are named separately: the trigger name comes from the trigger slot, and surfaceAccessibilityLabel names the surface. Use the focused prop to preview the trigger focus ring.',
      },
    },
  },
};

const styles = StyleSheet.create({
  card: {
    gap: 4,
    maxWidth: 240,
  },
  cardBody: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
