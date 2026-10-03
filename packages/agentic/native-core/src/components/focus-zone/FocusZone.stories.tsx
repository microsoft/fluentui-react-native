/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { FocusZone } from './FocusZone';
import type { FocusZoneCommands, FocusZoneProps } from './FocusZone.types';
import { useNativeViewTarget } from '../nativeTarget';

function Example(props: FocusZoneProps) {
  const commands = React.useRef<FocusZoneCommands>(null);
  const target = useNativeViewTarget();
  const [status, setStatus] = React.useState('Idle');
  const request = async (destination: 'default' | 'first' | 'last' | 'target') => {
    if (!commands.current) throw new Error('FocusZone commands are not attached.');
    const outcome = await commands.current.requestFocus(destination === 'target' ? target.target : destination);
    setStatus(outcome.status);
  };
  return (
    <View style={styles.story}>
      <View accessible accessibilityRole="text" accessibilityLabel={status} testID="modern-focus-status">
        <Text accessible={false}>{status}</Text>
      </View>
      <View style={styles.row}>
        {(['first', 'last', 'default', 'target'] as const).map((strategy) => (
          <Pressable
            key={strategy}
            accessibilityRole="button"
            testID={`modern-focus-request-${strategy}`}
            style={styles.button}
            onPress={() => {
              void request(strategy);
            }}
          >
            <Text>{strategy}</Text>
          </Pressable>
        ))}
      </View>
      <FocusZone
        {...props}
        commandsRef={commands}
        defaultTarget={target.target}
        accessible
        accessibilityRole="group"
        style={styles.row}
        testID="modern-focus-zone"
      >
        {[1, 2, 3].map((index) => (
          <Pressable
            key={index}
            focusable
            accessibilityRole="button"
            accessibilityLabel={`Item ${index}`}
            testID={`modern-focus-item-${index}`}
            ref={index === 2 ? target.ref : undefined}
            style={styles.button}
          >
            <Text>{index}</Text>
          </Pressable>
        ))}
      </FocusZone>
    </View>
  );
}
const meta: Meta<typeof FocusZone> = {
  title: 'Native/Modern FocusZone',
  component: FocusZone,
  render: (args) => <Example {...args} />,
};
export default meta;
type Story = WdioStory<StoryObj<typeof FocusZone>>;
export const Default: Story = {
  tags: ['desktop-e2e'],
  wdio: {
    'confirms native default, edge, and specific descendant requests': async ({ browser, expect, skip }) => {
      if (!browser.capabilities['furn:features']?.physicalClick) {
        skip('Native commands require physical input for their owner controls.');
        return;
      }
      for (const [strategy, item] of [
        ['first', 1],
        ['last', 3],
        ['default', 2],
        ['target', 2],
      ] as const) {
        await (await browser.$(`~modern-focus-request-${strategy}`)).click();
        await expect(await browser.$('~modern-focus-status')).toHaveText('confirmed');
        await browser.waitUntil(async () => (await (await browser.$(`~modern-focus-item-${item}`)).getProperty('focused')) === true, {
          timeout: 5000,
          timeoutMsg: `Expected actual focus on item ${item}.`,
        });
      }
    },
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  wdio: {
    'refuses a disabled-zone request': async ({ browser, expect, skip }) => {
      if (!browser.capabilities['furn:features']?.physicalClick) {
        skip('Physical input unavailable.');
        return;
      }
      await (await browser.$('~modern-focus-request-first')).click();
      await expect(await browser.$('~modern-focus-status')).toHaveText('not-focusable');
    },
  },
};
const styles = StyleSheet.create({
  story: { padding: 24, gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  button: { padding: 12, borderWidth: 1, borderColor: '#808080' },
});
