/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { CompoundItemLayout } from './compound-item-layout';

type StoryGroupProps = {
  children: ReactNode;
  label: string;
};

const StoryGroup = ({ children, label }: StoryGroupProps) => (
  <View style={styles.group}>
    <Text style={styles.groupLabel}>{label}</Text>
    {children}
  </View>
);

const Leading = () => (
  <View style={styles.leading}>
    <Text style={styles.leadingText}>A</Text>
  </View>
);

const Trailing = () => <Text style={styles.trailingText}>⌘K</Text>;

const styles = StyleSheet.create({
  constrained: {
    width: 260,
  },
  constrainedLayout: {
    width: '100%',
  },
  contentColumn: {
    gap: 2,
  },
  group: {
    gap: 6,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  layout: {
    backgroundColor: '#f5f5f5',
    borderColor: '#d1d1d1',
    borderRadius: 6,
    borderWidth: 1,
    flexGrow: 0,
    minHeight: 44,
    padding: 8,
    width: 360,
  },
  leading: {
    alignItems: 'center',
    backgroundColor: '#dce9ff',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  leadingRegion: {
    marginRight: 10,
  },
  leadingText: {
    color: '#0f548c',
    fontWeight: '600',
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#616161',
    fontSize: 12,
  },
  story: {
    gap: 16,
  },
  trailingRegion: {
    marginLeft: 10,
  },
  trailingText: {
    color: '#616161',
    fontSize: 12,
  },
});

const meta: Meta<typeof CompoundItemLayout> = {
  title: 'Primitives/Compound Item Layout',
  component: CompoundItemLayout,
  args: {
    secondaryPosition: 'right',
  },
  argTypes: {
    secondaryPosition: { control: 'select', options: ['right', 'under'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'CompoundItemLayout is an unstyled structural primitive that arranges optional leading and trailing regions around required primary content and optional secondary content.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof CompoundItemLayout>;

export const Default: Story = {
  render: ({ secondaryPosition }) => (
    <CompoundItemLayout
      contentStyle={secondaryPosition === 'under' ? styles.contentColumn : undefined}
      leading={<Leading />}
      leadingStyle={styles.leadingRegion}
      primary={<Text style={styles.primaryText}>Primary content</Text>}
      secondary={<Text style={styles.secondaryText}>Secondary</Text>}
      secondaryPosition={secondaryPosition}
      style={styles.layout}
      trailing={<Trailing />}
      trailingStyle={styles.trailingRegion}
    />
  ),
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Primary only">
        <CompoundItemLayout primary={<Text style={styles.primaryText}>Primary content</Text>} style={styles.layout} />
      </StoryGroup>
      <StoryGroup label="All regions">
        <CompoundItemLayout
          leading={<Leading />}
          leadingStyle={styles.leadingRegion}
          primary={<Text style={styles.primaryText}>Primary content</Text>}
          secondary={<Text style={styles.secondaryText}>Secondary</Text>}
          style={styles.layout}
          trailing={<Trailing />}
          trailingStyle={styles.trailingRegion}
        />
      </StoryGroup>
      <StoryGroup label="Secondary under">
        <CompoundItemLayout
          contentStyle={styles.contentColumn}
          leading={<Leading />}
          leadingStyle={styles.leadingRegion}
          primary={<Text style={styles.primaryText}>Primary content</Text>}
          secondary={<Text style={styles.secondaryText}>Supporting content</Text>}
          secondaryPosition="under"
          style={styles.layout}
          trailing={<Trailing />}
          trailingStyle={styles.trailingRegion}
        />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Representative optional-region and secondary-position combinations.',
      },
    },
  },
};

export const SecondaryPosition: Story = {
  render: () => (
    <View style={styles.story}>
      {(['right', 'under'] as const).map((secondaryPosition) => (
        <StoryGroup key={secondaryPosition} label={secondaryPosition}>
          <CompoundItemLayout
            contentStyle={secondaryPosition === 'under' ? styles.contentColumn : undefined}
            leading={<Leading />}
            leadingStyle={styles.leadingRegion}
            primary={<Text style={styles.primaryText}>Primary content</Text>}
            secondary={<Text style={styles.secondaryText}>Secondary</Text>}
            secondaryPosition={secondaryPosition}
            style={styles.layout}
          />
        </StoryGroup>
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'secondaryPosition places secondary content at the row edge or directly below primary content.',
      },
    },
  },
};

export const ConstrainedContent: Story = {
  render: () => (
    <View style={styles.constrained}>
      <CompoundItemLayout
        leading={<Leading />}
        leadingStyle={styles.leadingRegion}
        primary={<Text style={styles.primaryText}>A long primary label that wraps inside a constrained item</Text>}
        secondary={<Text style={styles.secondaryText}>Metadata</Text>}
        secondaryPosition="under"
        style={[styles.layout, styles.constrainedLayout]}
        trailing={<Trailing />}
        trailingStyle={styles.trailingRegion}
      />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Flexible content regions shrink and wrap while fixed leading and trailing regions remain visible.',
      },
    },
  },
};
