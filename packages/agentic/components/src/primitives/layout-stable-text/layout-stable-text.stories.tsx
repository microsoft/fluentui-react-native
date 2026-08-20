/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { LayoutStableText } from './layout-stable-text';

type StoryItemProps = {
  children: ReactNode;
  label: string;
};

const StoryItem = ({ children, label }: StoryItemProps) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.bounds}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  bounds: {
    alignSelf: 'flex-start',
    borderColor: '#d1d1d1',
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 4,
  },
  constrained: {
    borderColor: '#d1d1d1',
    borderWidth: 1,
    padding: 8,
    width: 180,
  },
  item: {
    alignItems: 'flex-start',
    gap: 4,
  },
  label: {
    color: '#616161',
    fontSize: 11,
  },
  large: {
    fontSize: 20,
  },
  regular: {
    fontSize: 14,
    fontWeight: '400',
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  semibold: {
    fontSize: 14,
    fontWeight: '600',
  },
  small: {
    fontSize: 12,
  },
  stableText: {
    alignSelf: 'flex-start',
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});

const meta: Meta<typeof LayoutStableText> = {
  title: 'Primitives/Layout Stable Text',
  component: LayoutStableText,
  parameters: {
    docs: {
      description: {
        component:
          'LayoutStableText is an unstyled primitive that reserves the largest text metrics with an inaccessible hidden element and overlays the visible state without layout shift.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof LayoutStableText>;

export const Default: Story = {
  render: () => (
    <LayoutStableText
      reserve={<Text style={styles.semibold}>Stable label</Text>}
      style={styles.stableText}
      visible={<Text style={styles.regular}>Stable label</Text>}
    />
  ),
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryItem label="Reserve semibold, show regular">
        <LayoutStableText
          reserve={<Text style={styles.semibold}>Stable label</Text>}
          visible={<Text style={styles.regular}>Stable label</Text>}
        />
      </StoryItem>
      <StoryItem label="Reserve large, show small">
        <LayoutStableText
          reserve={<Text style={styles.large}>Stable label</Text>}
          visible={<Text style={styles.small}>Stable label</Text>}
        />
      </StoryItem>
      <StoryItem label="Matching metrics">
        <LayoutStableText
          reserve={<Text style={styles.regular}>Stable label</Text>}
          visible={<Text style={styles.regular}>Stable label</Text>}
        />
      </StoryItem>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The hidden reserve element determines bounds while the visible element supplies the rendered state.',
      },
    },
  },
};

export const WeightReservation: Story = {
  render: () => (
    <View style={styles.row}>
      <StoryItem label="Plain regular">
        <Text style={styles.regular}>Toggle label</Text>
      </StoryItem>
      <StoryItem label="Regular with semibold reserve">
        <LayoutStableText
          reserve={<Text style={styles.semibold}>Toggle label</Text>}
          visible={<Text style={styles.regular}>Toggle label</Text>}
        />
      </StoryItem>
      <StoryItem label="Visible semibold">
        <LayoutStableText
          reserve={<Text style={styles.semibold}>Toggle label</Text>}
          visible={<Text style={styles.semibold}>Toggle label</Text>}
        />
      </StoryItem>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Regular and semibold visual states share the semibold width, preventing neighboring layout from moving.',
      },
    },
  },
};

export const ConstrainedContent: Story = {
  render: () => (
    <View style={styles.constrained}>
      <LayoutStableText
        reserve={
          <Text numberOfLines={2} style={styles.semibold}>
            A long label that wraps within constrained content
          </Text>
        }
        visible={
          <Text numberOfLines={2} style={styles.regular}>
            A long label that wraps within constrained content
          </Text>
        }
      />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The primitive preserves text wrapping and can shrink inside a constrained parent.',
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <LayoutStableText
      reserve={
        <Text accessibilityLabel="Hidden reserve label" style={styles.semibold}>
          Accessible label
        </Text>
      }
      visible={
        <Text accessibilityLabel="Accessible label" style={styles.regular}>
          Accessible label
        </Text>
      }
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Only the visible text remains in the accessibility tree; reserve text is always hidden.',
      },
    },
  },
};
