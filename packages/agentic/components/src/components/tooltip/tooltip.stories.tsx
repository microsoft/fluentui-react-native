/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

import { Tooltip } from './tooltip';
import type { TooltipPosition } from './tooltip.types';

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

// Flex prefers a label above the trigger and models four directions. The full directional-hint union stays available,
// and macOS collapses every hint on a side onto that screen edge.
const positions: readonly { label: string; value: TooltipPosition }[] = [
  { label: 'Above', value: 'topCenter' },
  { label: 'Below', value: 'bottomCenter' },
  { label: 'Leading', value: 'leftCenter' },
  { label: 'Trailing', value: 'rightCenter' },
];

// The desktop plan below is extracted statically from source, so it repeats this identifier as a literal.
const triggerId = 'agentic-storybook-tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: {
    content: 'Refresh the list from the server',
    defaultVisible: false,
    hideDelay: 0,
    position: 'topCenter',
    showDelay: 300,
    trigger: { accessibilityLabel: 'Refresh', children: <Text>Refresh</Text>, testID: triggerId },
  },
  argTypes: {
    content: { control: 'text' },
    defaultVisible: { control: 'boolean' },
    disabled: { control: 'boolean' },
    focused: { control: 'boolean' },
    hideDelay: { control: { type: 'number', min: 0, step: 50 } },
    position: { control: 'select', options: positions.map(({ value }) => value) },
    showDelay: { control: { type: 'number', min: 0, step: 50 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Tooltip pairs a trigger with a short label that describes it. The label is revealed by pointer entry after a delay and by keyboard focus immediately, and it is drawn in the same kind of platform popup window Popover uses, so it mounts on reveal and is torn down on hide. Trigger activation never reveals the label, which keeps the underlying control unambiguous.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'describes-the-trigger-without-a-disclosure',
          title: 'Keeps the trigger a plain enabled control and mounts no surface while hidden',
          platforms: ['macos', 'windows'],
          requires: ['accessibility-click'],
          steps: [
            { action: 'wait', target: { testId: 'agentic-storybook-tooltip' } },
            { expect: { state: 'role', target: { testId: 'agentic-storybook-tooltip' }, value: 'button' } },
            { expect: { state: 'enabled', target: { testId: 'agentic-storybook-tooltip' }, value: true } },
            { expect: { state: 'accessibleName', target: { testId: 'agentic-storybook-tooltip' }, value: 'Refresh' } },
            { expect: { state: 'exists', target: { testId: 'tooltip-surface-content' }, value: false } },
            { action: 'note', message: 'Activation is the underlying control action, so it must never reveal the label.' },
            { action: 'click', target: { testId: 'agentic-storybook-tooltip' } },
            { expect: { state: 'exists', target: { testId: 'tooltip-surface-content' }, value: false } },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
    docs: {
      description: {
        story: 'The default Tooltip renders only its trigger until the pointer rests on it or it receives keyboard focus.',
      },
    },
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Placement">
        {positions.map(({ label, value }) => (
          <Tooltip
            key={value}
            content={`Aligned ${label.toLowerCase()} the trigger`}
            position={value}
            trigger={{ children: <Text>{label}</Text> }}
          />
        ))}
      </StoryGroup>
      <StoryGroup label="State">
        <Tooltip content="Refresh the list from the server" trigger={{ children: <Text>Enabled</Text> }} />
        <Tooltip disabled content="This label never appears" trigger={{ children: <Text>Disabled</Text> }} />
        <Tooltip focused content="Refresh the list from the server" trigger={{ children: <Text>Focused</Text> }} />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the placement axis and the trigger states. Hover or tab to a trigger to reveal its label.',
      },
    },
  },
};

export const Placement: Story = {
  render: () => (
    <StoryGroup label="Preferred edge">
      {positions.map(({ label, value }) => (
        <Tooltip
          key={value}
          content={`Anchored ${label.toLowerCase()} the trigger`}
          position={value}
          trigger={{ children: <Text>{label}</Text> }}
        />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Placement is a preference, not a guarantee. The native surface owns the final position, and macOS collapses every alignment variant on one side onto the same screen edge, so a macOS label is edge-aligned rather than centered on its trigger.',
      },
    },
  },
};

export const Timing: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Pointer show delay">
        <Tooltip content="Revealed as soon as the pointer arrives" showDelay={0} trigger={{ children: <Text>0 ms</Text> }} />
        <Tooltip content="The documented default pointer delay" trigger={{ children: <Text>300 ms</Text> }} />
        <Tooltip content="A long delay for a dense layout" showDelay={800} trigger={{ children: <Text>800 ms</Text> }} />
      </StoryGroup>
      <StoryGroup label="Hide delay">
        <Tooltip content="Hidden the moment the pointer leaves" trigger={{ children: <Text>0 ms</Text> }} />
        <Tooltip content="Survives a short trip between adjacent triggers" hideDelay={600} trigger={{ children: <Text>600 ms</Text> }} />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The show delay applies only to the pointer path; keyboard focus always reveals the label immediately. The hide delay applies to every interaction-driven hide.',
      },
    },
  },
};

export const ExternallyDrivenVisibility: Story = {
  render: () => {
    const fields = ['General', 'Advanced'];
    const Group = () => {
      const [visible, setVisible] = useState<string | null>(null);
      return (
        <View style={styles.story}>
          <Text style={styles.caption}>{visible ? `${visible} is described` : 'No label is shown'}</Text>
          <View style={styles.row}>
            {fields.map((field) => (
              <Tooltip
                key={field}
                content={`${field} settings for this workspace`}
                onVisibleChange={(next) => setVisible(next ? field : null)}
                trigger={{ children: <Text>{field}</Text> }}
                visible={visible === field}
              />
            ))}
          </View>
        </View>
      );
    };
    return <Group />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Supplying visible makes the caller the owner of the value. Pointer entry, focus, trigger activation, and native dismissal all report through onVisibleChange, so one owner can keep at most a single label shown.',
      },
    },
  },
};

export const Accessibility: Story = {
  args: {
    content: 'Refreshes the list from the server',
    focused: true,
    trigger: { accessibilityLabel: 'Refresh', children: <Text>Refresh</Text> },
  },
  parameters: {
    docs: {
      description: {
        story:
          'The label text becomes the trigger description, which a screen reader announces after the trigger name and role, so the label should not repeat that name. The trigger name still comes from the trigger slot. Use the focused prop to preview the trigger focus ring; keyboard-revealed labels keep focus on the trigger on macOS only.',
      },
    },
  },
};

const styles = StyleSheet.create({
  caption: {
    fontSize: 12,
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
