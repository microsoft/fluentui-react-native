/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { Text } from './text';

const styles = StyleSheet.create({
  nativeFrame: {
    width: 180,
  },
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

type Story = WdioStory<StoryObj<typeof meta>>;

export const NativeSemantics: Story = {
  render: () => (
    <View style={styles.nativeFrame}>
      <Text testID="text-native-heading" accessible accessibilityRole="header" accessibilityLabel="Account settings" numberOfLines={1}>
        Account settings with deliberately long visible text
      </Text>
    </View>
  ),
  wdio: [
    desktopIt('TXT-003 forwards an explicit readable native name under a constrained width', async ({ browser, expect }) => {
      const text = await browser.$('~text-native-heading');
      await expect(text).toExist();
      expect(await text.getProperty('name')).toBe('Account settings');
      const bounds = await browser.getElementRect(await text.elementId);
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.width).toBeLessThanOrEqual(181);
      expect(bounds.height).toBeGreaterThan(0);
    }),
  ],
};

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
