/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { FocusVisual, createFocusVisualProps_unstable } from './focus-visual';

const meta: Meta<typeof FocusVisual> = {
  title: 'Primitives/Focus Visual',
  component: FocusVisual,
  parameters: {
    docs: {
      description: {
        component:
          'FocusVisual is an unstyled structural primitive that keeps one or two decorative rings mounted and changes only opacity when visibility changes.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof FocusVisual>;

const FocusTarget = ({ dual, testID, visible = true }: { dual?: boolean; testID?: string; visible?: boolean }) => (
  <View style={styles.target}>
    <Text>Focus target</Text>
    <FocusVisual
      {...createFocusVisualProps_unstable({
        borderRadius: 6,
        innerColor: dual ? '#ffffff' : undefined,
        innerWidth: dual ? 1 : undefined,
        outerColor: '#000000',
        outerWidth: 2,
        visible,
      })}
      testID={testID}
    />
  </View>
);

export const Default: Story = {
  render: () => <FocusTarget testID="agentic-storybook-focus-visual" />,
};

export const DualRing: Story = {
  render: () => <FocusTarget dual />,
  parameters: {
    docs: {
      description: {
        story: 'Supplying inner ring values creates a persistent dual-ring visual.',
      },
    },
  },
};

export const Visibility: Story = {
  render: () => (
    <View style={styles.row}>
      <FocusTarget />
      <FocusTarget visible={false} />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Hidden rings stay mounted with zero opacity so focus changes never create native border visuals.',
      },
    },
  },
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  target: {
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 6,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 120,
    padding: 8,
    position: 'relative',
  },
});
