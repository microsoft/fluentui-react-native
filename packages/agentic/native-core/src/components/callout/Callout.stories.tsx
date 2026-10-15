/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { Callout } from './Callout';
import type { CalloutAnchor, CalloutHandle, CalloutDismissedEvent } from './Callout.types';
import { FocusZone } from '../focus-zone/FocusZone';
import type { FocusZoneCommands } from '../focus-zone/FocusZone.types';
import { useNativeViewTarget } from '../nativeTarget';

type ExampleProps = { anchorKind: CalloutAnchor['kind']; exercise?: 'commands' | 'focus' };
function Example({ anchorKind, exercise }: ExampleProps) {
  const anchor = useNativeViewTarget();
  const child = useNativeViewTarget();
  const handle = React.useRef<CalloutHandle>(null);
  const [open, setOpen] = React.useState(true);
  const [key, setKey] = React.useState(0);
  const [status, setStatus] = React.useState('Opening');
  const [operations, setOperations] = React.useState('Idle');
  const [focus, setFocus] = React.useState('No focus');
  // Dismissal is reported separately because renderers may deliver it before or after an operation settles.
  const [dismissal, setDismissal] = React.useState('Open');
  const value: CalloutAnchor =
    anchorKind === 'view'
      ? { kind: 'view', target: anchor.target }
      : anchorKind === 'point'
        ? { kind: 'point', relativeTo: anchor.target, point: { x: 40, y: 60 } }
        : { kind: 'rect', relativeTo: anchor.target, rect: { x: 40, y: 30, width: 60, height: 30 } };
  const current = () => {
    const api = handle.current;
    const presentation = api?.getPresentation();
    if (!api || !presentation) throw new Error('Callout is not ready.');
    return { api, presentation };
  };
  const operation = async (name: 'close' | 'focus' | 'reposition') => {
    const { api, presentation } = current();
    const outcome =
      name === 'focus'
        ? await api.requestFocus(presentation, child.target)
        : name === 'close'
          ? await api.close(presentation)
          : await api.reposition(presentation);
    setOperations(`${name}: ${outcome.status}`);
  };
  const runCommands = async () => {
    const { api, presentation } = current();
    const focused = await api.requestFocus(presentation, child.target);
    const positioned = await api.reposition(presentation);
    const closed = await api.close(presentation);
    setOperations(`${focused.status}/${positioned.status}/${closed.status}`);
  };
  return (
    <View style={styles.story}>
      <View accessible accessibilityRole="text" accessibilityLabel={status} testID="modern-callout-status">
        <Text accessible={false}>{status}</Text>
      </View>
      <View accessible accessibilityRole="text" accessibilityLabel={operations} testID="modern-callout-operations">
        <Text accessible={false}>{operations}</Text>
      </View>
      <View accessible accessibilityRole="text" accessibilityLabel={focus} testID="modern-callout-focus-status">
        <Text accessible={false}>{focus}</Text>
      </View>
      <View accessible accessibilityRole="text" accessibilityLabel={dismissal} testID="modern-callout-dismissal">
        <Text accessible={false}>{dismissal}</Text>
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
            setDismissal('Open');
            setOperations('Idle');
            setFocus('No focus');
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
          // A native reopen of a latched presentation would report readiness again and clear the dismissal label.
          setDismissal('Open');
          if (key === 0) return;
          if (exercise === 'commands') void runCommands();
          else if (exercise === 'focus') void operation('focus');
        }}
        onDismissed={({ reason }: CalloutDismissedEvent) => setDismissal(`Dismissed: ${reason}`)}
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

const menuItems = ['Cut', 'Copy', 'Paste'] as const;

/** A flat nonmodal menu composed from the primitives: Callout presence, FocusZone entry and arrow navigation. */
function MenuCompositionExample() {
  const trigger = React.useRef<React.ComponentRef<typeof View>>(null);
  const anchor = useNativeViewTarget();
  const commands = React.useRef<FocusZoneCommands>(null);
  const [open, setOpen] = React.useState(false);
  const [key, setKey] = React.useState(0);
  const [status, setStatus] = React.useState('Closed');
  const [focused, setFocused] = React.useState('None');
  return (
    <View style={styles.story}>
      <View accessible accessibilityRole="text" accessibilityLabel={status} testID="modern-menu-status">
        <Text accessible={false}>{status}</Text>
      </View>
      <View accessible accessibilityRole="text" accessibilityLabel={focused} testID="modern-menu-focus">
        <Text accessible={false}>{focused}</Text>
      </View>
      <Pressable
        ref={(instance) => {
          trigger.current = instance;
          const detach = anchor.ref(instance);
          return () => {
            trigger.current = null;
            if (typeof detach === 'function') detach();
          };
        }}
        focusable
        accessibilityRole="button"
        style={styles.button}
        testID="modern-menu-trigger"
        onPress={() => {
          setKey((value) => value + 1);
          setOpen(true);
          setStatus('Opening');
          setFocused('None');
        }}
      >
        <Text>Edit</Text>
      </Pressable>
      <Callout
        open={open}
        presentationKey={String(key)}
        anchor={{ kind: 'view', target: anchor.target }}
        placement={{ side: 'bottom', align: 'start', gap: 4 }}
        onReady={() => {
          setStatus('Ready');
          void commands.current?.requestFocus('first').then(({ status: outcome }) => setStatus(`Ready: ${outcome}`));
        }}
        onDismissed={({ reason }: CalloutDismissedEvent) => {
          setOpen(false);
          setStatus(`Dismissed: ${reason}`);
          // A menu returns focus to its trigger; the native close already restored keyboard input to the owner.
          if (reason !== 'native-light-dismiss') trigger.current?.focus();
        }}
        content={{ style: styles.menu, testID: 'modern-menu-content' }}
      >
        <FocusZone commandsRef={commands} direction="vertical" arrowBoundary="wrap" accessibilityRole="menu" testID="modern-menu-zone">
          {menuItems.map((label) => (
            <Pressable
              key={label}
              focusable
              accessibilityRole="menuitem"
              accessibilityLabel={label}
              style={styles.menuItem}
              testID={`modern-menu-item-${label}`}
              onFocus={() => setFocused(label)}
            >
              <Text>{label}</Text>
            </Pressable>
          ))}
        </FocusZone>
      </Callout>
    </View>
  );
}
const meta: Meta<ExampleProps> = { title: 'Native/Modern Callout', render: (args) => <Example {...args} />, args: { anchorKind: 'view' } };
export default meta;
type Story = WdioStory<StoryObj<ExampleProps>>;
export const Default: Story = {
  tags: ['desktop-e2e'],
  wdio: {
    'light-dismisses on an outside owner click and explicitly rearms': async ({ browser, expect, skip }) => {
      if (!browser.capabilities['furn:features']?.physicalClick) {
        skip('Light dismissal requires physical owner input.');
        return;
      }
      const status = await browser.$('~modern-callout-status');
      const dismissal = await browser.$('~modern-callout-dismissal');
      for (let attempt = 0; attempt < 2; attempt++) {
        await expect(status).toHaveText('Ready');
        await expect(dismissal).toHaveText('Open');
        await status.click();
        await expect(dismissal).toHaveText('Dismissed: native-light-dismiss');
        // A latched presentation must not reopen merely because open remains true; readiness would reset the label.
        await browser.pause(500);
        await expect(dismissal).toHaveText('Dismissed: native-light-dismiss');
        await (await browser.$('~modern-callout-reopen')).click();
      }
      await expect(status).toHaveText('Ready');
      await expect(dismissal).toHaveText('Open');
    },
    'places content below the view anchor with the requested gap': async ({ browser, expect, platform, skip }) => {
      if (platform !== 'windows') {
        skip('Only the Windows provider exposes owned popup content in the owner window accessibility tree.');
        return;
      }
      await expect(await browser.$('~modern-callout-status')).toHaveText('Ready');
      const anchor = await browser.getElementRect(await (await browser.$('~modern-callout-anchor')).elementId);
      const content = await browser.getElementRect(await (await browser.$('~modern-callout-content')).elementId);
      expect(Math.abs(content.x - anchor.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(content.y - (anchor.y + anchor.height + 8))).toBeLessThanOrEqual(1);
    },
  },
};
export const NativeOperations: Story = {
  args: { exercise: 'commands' },
  tags: ['desktop-e2e'],
  wdio: {
    'readies, confirms descendant focus, closes, and explicitly rearms': async ({ browser, expect, platform, skip }) => {
      if (!browser.capabilities['furn:features']?.physicalClick) {
        skip('Physical owner input unavailable.');
        return;
      }
      const status = await browser.$('~modern-callout-status');
      const operations = await browser.$('~modern-callout-operations');
      await expect(status).toHaveText('Ready');
      for (let attempt = 0; attempt < 2; attempt++) {
        await (await browser.$('~modern-callout-reopen')).click();
        await expect(operations).toHaveText('confirmed/confirmed/confirmed');
        await expect(await browser.$('~modern-callout-dismissal')).toHaveText('Dismissed: programmatic');
        await expect(await browser.$('~modern-callout-focus-status')).toHaveText('Child focused');
        // Windows popups are owned tool windows that the driver does not enumerate as top-level windows.
        if (platform === 'macos') await browser.waitUntil(async () => (await browser.getWindowHandles()).length === 1, { timeout: 5000 });
      }
    },
  },
};
export const KeyboardDismissal: Story = {
  args: { exercise: 'focus' },
  wdio: {
    'dismisses focused content on Escape': async ({ browser, expect, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features?.physicalClick || !features.keyboard) {
        skip('Escape dismissal requires physical owner and keyboard input.');
        return;
      }
      const status = await browser.$('~modern-callout-status');
      await expect(status).toHaveText('Ready');
      await (await browser.$('~modern-callout-reopen')).click();
      await expect(await browser.$('~modern-callout-operations')).toHaveText('focus: confirmed');
      await expect(await browser.$('~modern-callout-focus-status')).toHaveText('Child focused');
      const dismissal = await browser.$('~modern-callout-dismissal');
      await expect(dismissal).toHaveText('Open');
      await browser.keys('\uE00C');
      await expect(dismissal).toHaveText('Dismissed: native-light-dismiss');
    },
  },
};
export const LocalRectangle: Story = {
  args: { anchorKind: 'rect' },
  wdio: {
    'places content below the local rectangle with the requested gap': async ({ browser, expect, platform, skip }) => {
      if (platform !== 'windows') {
        skip('Only the Windows provider exposes owned popup content in the owner window accessibility tree.');
        return;
      }
      await expect(await browser.$('~modern-callout-status')).toHaveText('Ready');
      const anchor = await browser.getElementRect(await (await browser.$('~modern-callout-anchor')).elementId);
      const content = await browser.getElementRect(await (await browser.$('~modern-callout-content')).elementId);
      expect(Math.abs(content.x - (anchor.x + 40))).toBeLessThanOrEqual(1);
      expect(Math.abs(content.y - (anchor.y + 30 + 30 + 8))).toBeLessThanOrEqual(1);
    },
  },
};
export const LocalPoint: Story = {
  args: { anchorKind: 'point' },
  wdio: {
    'places content below the local point with the requested gap': async ({ browser, expect, platform, skip }) => {
      if (platform !== 'windows') {
        skip('Only the Windows provider exposes owned popup content in the owner window accessibility tree.');
        return;
      }
      await expect(await browser.$('~modern-callout-status')).toHaveText('Ready');
      const anchor = await browser.getElementRect(await (await browser.$('~modern-callout-anchor')).elementId);
      const content = await browser.getElementRect(await (await browser.$('~modern-callout-content')).elementId);
      expect(Math.abs(content.x - (anchor.x + 40))).toBeLessThanOrEqual(1);
      expect(Math.abs(content.y - (anchor.y + 60 + 8))).toBeLessThanOrEqual(1);
    },
  },
};
export const MenuComposition: Story = {
  render: () => <MenuCompositionExample />,
  tags: ['desktop-e2e'],
  wdio: {
    'enters a FocusZone, navigates by arrow, and restores the trigger on Escape': async ({ browser, expect, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features?.physicalClick || !features.keyboard) {
        skip('Menu composition requires physical owner and keyboard input.');
        return;
      }
      const trigger = await browser.$('~modern-menu-trigger');
      const status = await browser.$('~modern-menu-status');
      const focused = await browser.$('~modern-menu-focus');
      for (let attempt = 0; attempt < 2; attempt++) {
        await trigger.click();
        await expect(status).toHaveText('Ready: confirmed');
        await expect(focused).toHaveText('Cut');
        await browser.keys('\uE015');
        await expect(focused).toHaveText('Copy');
        await browser.keys('\uE013');
        await browser.keys('\uE013');
        await expect(focused).toHaveText('Paste');
        await browser.keys('\uE00C');
        await expect(status).toHaveText('Dismissed: native-light-dismiss');
        await browser.waitUntil(async () => (await trigger.getProperty('focused')) === true, {
          timeout: 5000,
          timeoutMsg: 'Expected keyboard focus to return to the menu trigger.',
        });
      }
    },
  },
};
const styles = StyleSheet.create({
  story: { padding: 24, gap: 16 },
  row: { flexDirection: 'row', gap: 8 },
  button: { padding: 10, borderWidth: 1, borderColor: '#808080' },
  anchor: { width: 280, height: 100, borderWidth: 1, borderColor: '#808080', padding: 10 },
  content: { width: 320, padding: 16, gap: 12, backgroundColor: '#ffffff' },
  menu: { width: 200, paddingVertical: 4, backgroundColor: '#ffffff' },
  menuItem: { paddingHorizontal: 12, paddingVertical: 8 },
});
