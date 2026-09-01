/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Text } from './text';

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  override: {
    color: '#b10e1c',
    fontSize: 20,
  },
  constrained: {
    maxWidth: 240,
  },
});

const meta = {
  title: 'Components/Text',
  component: Text,
  args: {
    children: 'Theme-aware functional body text',
    testID: 'text-default',
  },
  parameters: {
    docs: {
      description: {
        component: 'A React Native Text primitive with theme-aware functional body typography and native prop behavior.',
      },
    },
  },
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Text reads body typography and the primary foreground color from the nearest theme.',
      },
    },
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.stack}>
      <Text>Default functional body text</Text>
      <Text style={styles.override}>Caller styles override theme defaults</Text>
      <Text>
        Raw strings inherit from their nearest native text parent.{' '}
        <Text style={{ fontWeight: '700' }}>Nested Text reapplies defaults.</Text>
      </Text>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Caller styles follow theme defaults, while each nested Agentic Text starts a new default boundary.',
      },
    },
  },
};

export const NativeBehavior: Story = {
  render: () => (
    <View style={styles.stack}>
      <Text selectable>Selectable text delegates to the React Native Text implementation.</Text>
      <Text numberOfLines={1} style={styles.constrained}>
        Number-of-lines behavior also remains native and truncates this deliberately long sentence.
      </Text>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Selection and truncation are delegated to the platform Text implementation.',
      },
    },
  },
};
