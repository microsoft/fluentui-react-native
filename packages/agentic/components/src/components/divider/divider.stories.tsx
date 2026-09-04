/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

import { Divider } from './divider';
import type { DividerLayout } from './divider.types';

type StoryGroupProps = {
  children: ReactNode;
  label: string;
};

const StoryGroup = ({ children, label }: StoryGroupProps) => (
  <View style={styles.group}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.stack}>{children}</View>
  </View>
);

const starIcon = { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } } as const;

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  args: {
    accessibilityLabel: 'Text',
    layout: 'center',
    testID: 'agentic-storybook-divider',
    vertical: false,
  },
  argTypes: {
    layout: { control: 'select', options: ['center', 'start', 'end'] satisfies DividerLayout[] },
    vertical: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Divider separates content groups with a non-interactive separator line and optional icon-and-label content. Use it for section boundaries that need explicit visual reinforcement.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  args: {
    label: 'Text',
  },
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'accessibility-contract',
          title: 'Exposes non-interactive separator semantics',
          steps: [
            { action: 'wait', target: { testId: 'agentic-storybook-divider' } },
            { expect: { state: 'role', target: { testId: 'agentic-storybook-divider' }, value: 'separator' } },
            { expect: { state: 'accessibleName', target: { testId: 'agentic-storybook-divider' }, value: 'Text' } },
            { expect: { state: 'displayed', target: { testId: 'agentic-storybook-divider' }, value: true } },
          ],
          platformVariants: {
            windows: {
              steps: [
                { action: 'wait', target: { testId: 'agentic-storybook-divider' } },
                { expect: { state: 'role', target: { testId: 'agentic-storybook-divider' }, value: 'group' } },
                { expect: { state: 'accessibleName', target: { testId: 'agentic-storybook-divider' }, value: 'Text' } },
                { expect: { state: 'displayed', target: { testId: 'agentic-storybook-divider' }, value: true } },
              ],
            },
            win32: {
              steps: [
                { action: 'wait', target: { testId: 'agentic-storybook-divider' } },
                { expect: { state: 'role', target: { testId: 'agentic-storybook-divider' }, value: 'separator' } },
                { expect: { state: 'accessibleName', target: { testId: 'agentic-storybook-divider' }, value: 'Text' } },
                { expect: { state: 'displayed', target: { testId: 'agentic-storybook-divider' }, value: true } },
              ],
            },
          },
        },
      ],
    } satisfies DesktopStoryTests,
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Horizontal">
        <Divider label="Center" />
        <Divider layout="start" label="Start" />
        <Divider layout="end" label="End" />
      </StoryGroup>
      <StoryGroup label="Vertical">
        <View style={styles.verticalRow}>
          <View style={styles.verticalCell}>
            <Divider label="Side A" />
          </View>
          <Divider label="Side A" vertical />
          <View style={styles.verticalCell}>
            <Divider label="Side B" />
          </View>
        </View>
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the layout positions and both orientations.',
      },
    },
  },
};

export const Layout: Story = {
  render: () => (
    <StoryGroup label="Layout">
      <Divider layout="center" label="Center" />
      <Divider layout="start" label="Start" />
      <Divider layout="end" label="End" />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Center is the default. Start and End reserve a small stub on the leading or trailing side.',
      },
    },
  },
};

export const Orientation: Story = {
  render: () => (
    <View style={styles.orientationGrid}>
      <View style={styles.orientationItem}>
        <Text style={styles.caption}>Horizontal</Text>
        <Divider label="Section" />
      </View>
      <View style={styles.orientationItem}>
        <Text style={styles.caption}>Vertical</Text>
        <View style={styles.verticalDemo}>
          <Divider label="Section" vertical />
        </View>
      </View>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Vertical dividers switch the root to a column layout and keep the label and icon horizontal.',
      },
    },
  },
};

export const Icon: Story = {
  render: () => (
    <StoryGroup label="Icon">
      <Divider icon={starIcon} label="With icon" />
      <Divider icon={starIcon} label={null} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The icon slot is optional, defaults hidden, and shares the same 20px neutral styling as the label.',
      },
    },
  },
};

const styles = StyleSheet.create({
  caption: {
    fontSize: 11,
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
  orientationGrid: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  orientationItem: {
    alignItems: 'flex-start',
    gap: 8,
    width: 220,
  },
  stack: {
    alignItems: 'stretch',
    gap: 12,
    width: 280,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
  verticalCell: {
    alignItems: 'center',
    width: 72,
  },
  verticalDemo: {
    alignItems: 'stretch',
    flexDirection: 'row',
    height: 160,
    width: 220,
  },
  verticalRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 12,
  },
});
