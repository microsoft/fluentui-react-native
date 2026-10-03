/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { Callout } from './Callout';
import type { CalloutAnchor, CalloutHandle, CalloutDismissedEvent } from './Callout.types';
import { useNativeViewTarget } from '../nativeTarget';

type ExampleProps = { anchorKind: CalloutAnchor['kind']; exerciseCommands?: boolean };
function Example({ anchorKind, exerciseCommands = false }: ExampleProps) {
  const anchor = useNativeViewTarget();
  const child = useNativeViewTarget();
  const handle = React.useRef<CalloutHandle>(null);
  const [open, setOpen] = React.useState(true);
  const [key, setKey] = React.useState(0);
  const [status, setStatus] = React.useState('Opening');
  const [focus, setFocus] = React.useState('No focus');
  const value: CalloutAnchor =
    anchorKind === 'view'
      ? { kind: 'view', target: anchor.target }
      : anchorKind === 'point'
        ? { kind: 'point', relativeTo: anchor.target, point: { x: 40, y: 60 } }
        : { kind: 'rect', relativeTo: anchor.target, rect: { x: 40, y: 30, width: 60, height: 30 } };
  const operation = async (name: 'close' | 'focus' | 'reposition') => {
    const api = handle.current;
    const presentation = api?.getPresentation();
    if (!api || !presentation) throw new Error('Callout is not ready.');
    const outcome =
      name === 'focus'
        ? await api.requestFocus(presentation, child.target)
        : name === 'close'
          ? await api.close(presentation)
          : await api.reposition(presentation);
    setStatus(`${name}: ${outcome.status}`);
  };
  const exercise = async () => {
    const api = handle.current;
    const presentation = api?.getPresentation();
    if (!api || !presentation) throw new Error('Callout is not ready.');
    const focused = await api.requestFocus(presentation, child.target);
    const positioned = await api.reposition(presentation);
    const closed = await api.close(presentation);
    setStatus(`${focused.status}/${positioned.status}/${closed.status}`);
  };
  return (
    <View style={styles.story}>
      <View accessible accessibilityRole="text" accessibilityLabel={status} testID="modern-callout-status">
        <Text accessible={false}>{status}</Text>
      </View>
      <View accessible accessibilityRole="text" accessibilityLabel={focus} testID="modern-callout-focus-status">
        <Text accessible={false}>{focus}</Text>
      </View>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          testID="modern-callout-reopen"
          onPress={() => {
            setKey((value) => value + 1);
            setOpen(true);
            setStatus('Opening');
          }}
        >
          <Text>Reopen</Text>
        </Pressable>
      </View>
      <View ref={anchor.ref} collapsable={false} style={styles.anchor} testID="modern-callout-anchor">
        <Text>Anchor owner</Text>
      </View>
      <Callout
        ref={handle}
        open={open}
        presentationKey={String(key)}
        anchor={value}
        placement={{ side: 'bottom', align: 'start', gap: 8 }}
        onReady={() => {
          setStatus('Ready');
          if (exerciseCommands && key > 0) void exercise();
        }}
        onDismissed={({ reason }: CalloutDismissedEvent) => setStatus(`Dismissed: ${reason}`)}
        content={{ style: styles.content, testID: 'modern-callout-content' }}
      >
        <Text>Native popup content</Text>
        <Pressable
          ref={child.ref}
          focusable
          accessibilityRole="button"
          testID="modern-callout-child"
          style={styles.button}
          onFocus={() => setFocus('Child focused')}
        >
          <Text>Focus target</Text>
        </Pressable>
        <View style={styles.row}>
          {(['focus', 'reposition', 'close'] as const).map((name) => (
            <Pressable
              key={name}
              accessibilityRole="button"
              style={styles.button}
              testID={`modern-callout-${name}`}
              onPress={() => {
                void operation(name);
              }}
            >
              <Text>{name}</Text>
            </Pressable>
          ))}
        </View>
      </Callout>
    </View>
  );
}
const meta: Meta<ExampleProps> = { title: 'Native/Modern Callout', render: (args) => <Example {...args} />, args: { anchorKind: 'view' } };
export default meta;
type Story = WdioStory<StoryObj<ExampleProps>>;
export const Default: Story = {};
export const NativeOperations: Story = {
  args: { exerciseCommands: true },
  tags: ['desktop-e2e'],
  wdio: {
    'readies, confirms descendant focus, closes, and explicitly rearms': async ({ browser, expect, skip }) => {
      if (!browser.capabilities['furn:features']?.physicalClick) {
        skip('Physical owner input unavailable.');
        return;
      }
      await expect(await browser.$('~modern-callout-status')).toHaveText('Ready');
      await (await browser.$('~modern-callout-reopen')).click();
      await expect(await browser.$('~modern-callout-status')).toHaveText('confirmed/confirmed/confirmed');
      await expect(await browser.$('~modern-callout-focus-status')).toHaveText('Child focused');
      await browser.waitUntil(async () => (await browser.getWindowHandles()).length === 1, { timeout: 5000 });
      await (await browser.$('~modern-callout-reopen')).click();
      await expect(await browser.$('~modern-callout-status')).toHaveText('confirmed/confirmed/confirmed');
      await browser.waitUntil(async () => (await browser.getWindowHandles()).length === 1, { timeout: 5000 });
    },
  },
};
export const LocalRectangle: Story = { args: { anchorKind: 'rect' } };
export const LocalPoint: Story = { args: { anchorKind: 'point' } };
const styles = StyleSheet.create({
  story: { padding: 24, gap: 16 },
  row: { flexDirection: 'row', gap: 8 },
  button: { padding: 10, borderWidth: 1, borderColor: '#808080' },
  anchor: { width: 280, height: 100, borderWidth: 1, borderColor: '#808080', padding: 10 },
  content: { width: 320, padding: 16, gap: 12, backgroundColor: '#ffffff' },
});
