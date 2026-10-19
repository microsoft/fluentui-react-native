/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { useFocusablePressable } from '@fluentui-react-native/framework-base';
import type { PointerFocusMode } from '@fluentui-react-native/framework-base';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { Callout } from './Callout';
import type { CalloutAnchor, CalloutHandle, CalloutDismissedEvent, CalloutPresentation, CalloutReadyEvent } from './Callout.types';
import { FocusZone } from '../focus-zone/FocusZone';
import type { FocusZoneCommands } from '../focus-zone/FocusZone.types';
import { useNativeViewTarget } from '../nativeTarget';

type ExampleProps = {
  anchorKind: CalloutAnchor['kind'];
  exercise?: 'commands' | 'focus';
  pointerFocus?: PointerFocusMode;
  tabNavigation?: 'dismiss' | 'continue';
};
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
      <View
        ref={anchor.ref}
        accessible
        accessibilityRole="text"
        accessibilityLabel="Anchor owner"
        collapsable={false}
        style={styles.anchor}
        testID="modern-callout-anchor"
      >
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

function EntryFocusExample({
  strategy,
  empty = false,
  container = false,
}: {
  strategy: 'first' | 'last';
  empty?: boolean;
  /** `deferred` makes the container focusable only after readiness and targets it from the next effect. */
  container?: boolean | 'deferred';
}) {
  const anchor = useNativeViewTarget();
  const content = useNativeViewTarget();
  const handle = React.useRef<CalloutHandle>(null);
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState('Closed');
  const [focused, setFocused] = React.useState('None');
  const [armed, setArmed] = React.useState<CalloutPresentation | null>(null);
  const enter = async ({ presentation }: CalloutReadyEvent) => {
    const api = handle.current;
    if (!api) throw new Error('Missing mounted Callout handle at readiness.');
    if (container === 'deferred') {
      setArmed(presentation);
      return;
    }
    const outcome = await api.requestFocus(presentation, container ? content.target : strategy);
    if (api.getPresentation() === presentation) setStatus(outcome.status);
  };
  React.useEffect(() => {
    const api = handle.current;
    if (!armed || !api || api.getPresentation() !== armed) return;
    void api.requestFocus(armed, content.target).then((outcome) => {
      if (api.getPresentation() === armed) setStatus(outcome.status);
    });
  }, [armed, content.target]);
  return (
    <View style={styles.story}>
      <View accessible accessibilityRole="text" accessibilityLabel={status} testID="entry-callout-status">
        <Text accessible={false}>{status}</Text>
      </View>
      <View accessible accessibilityRole="text" accessibilityLabel={focused} testID="entry-callout-focused">
        <Text accessible={false}>{focused}</Text>
      </View>
      <Pressable
        ref={anchor.ref}
        accessibilityRole="button"
        style={styles.button}
        testID="entry-callout-open"
        onPress={() => setOpen(true)}
      >
        <Text>Open entry-focus probe</Text>
      </Pressable>
      <Callout
        ref={handle}
        open={open}
        anchor={{ kind: 'view', target: anchor.target }}
        content={{
          ref: content.ref,
          focusable: container === true || armed !== null,
          onFocus: container ? () => setFocused('Container') : undefined,
          style: styles.content,
          testID: 'entry-callout-content',
        }}
        onReady={(event: CalloutReadyEvent) => {
          void enter(event);
        }}
        onDismissed={() => {
          setOpen(false);
          setArmed(null);
        }}
      >
        <Text>Only eligible descendants can receive entry focus.</Text>
        {!empty && (
          <>
            <Pressable disabled focusable={false} accessibilityRole="button">
              <Text>Disabled</Text>
            </Pressable>
            <Pressable focusable accessibilityRole="button" onFocus={() => setFocused('First')} testID="entry-callout-first">
              <Text>First</Text>
            </Pressable>
            <View>
              <Pressable focusable accessibilityRole="button" onFocus={() => setFocused('Last')} testID="entry-callout-last">
                <Text>Last</Text>
              </Pressable>
            </View>
          </>
        )}
      </Callout>
    </View>
  );
}

/** A flat nonmodal menu composed from the primitives: Callout presence, FocusZone entry and arrow navigation. */
function MenuCompositionExample({ pointerFocus, tabNavigation }: Pick<ExampleProps, 'pointerFocus' | 'tabNavigation'>) {
  const anchor = useNativeViewTarget();
  const commands = React.useRef<FocusZoneCommands>(null);
  const [open, setOpen] = React.useState(false);
  const [key, setKey] = React.useState(0);
  const [status, setStatus] = React.useState('Closed');
  const [focused, setFocused] = React.useState('None');
  // The pointer-focus mode decides whether pressing the trigger focuses it, and so where closing the menu returns
  // keyboard focus: the owner window regains the focus it retained while the menu was open.
  const [triggerProps, , { focusTarget, focusTargetRef }] = useFocusablePressable(
    {
      onPress: () => {
        setKey((value) => value + 1);
        setOpen(true);
        setStatus('Opening');
        setFocused('None');
      },
    },
    { pointerFocus },
  );
  const triggerRef = React.useCallback(
    (instance: React.ComponentRef<typeof View> | null) => {
      const detachFocus = focusTargetRef(instance);
      const detachAnchor = anchor.ref(instance);
      return () => {
        if (typeof detachFocus === 'function') detachFocus();
        if (typeof detachAnchor === 'function') detachAnchor();
      };
    },
    [anchor, focusTargetRef],
  );
  return (
    <View style={styles.story}>
      <View accessible accessibilityRole="text" accessibilityLabel={status} testID="modern-menu-status">
        <Text accessible={false}>{status}</Text>
      </View>
      <View accessible accessibilityRole="text" accessibilityLabel={focused} testID="modern-menu-focus">
        <Text accessible={false}>{focused}</Text>
      </View>
      <Pressable
        {...triggerProps}
        ref={triggerRef}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.button}
        testID="modern-menu-trigger"
      >
        <Text>Edit</Text>
      </Pressable>
      {tabNavigation && (
        <Pressable
          focusable
          accessibilityRole="button"
          style={styles.button}
          testID="modern-menu-after"
          onFocus={() => setFocused('After')}
        >
          <Text>After</Text>
        </Pressable>
      )}
      <Callout
        open={open}
        presentationKey={String(key)}
        tabNavigation={tabNavigation}
        anchor={{ kind: 'view', target: anchor.target }}
        placement={{ side: 'bottom', align: 'start', gap: 4 }}
        onReady={() => {
          setStatus('Ready');
          void commands.current?.requestFocus('first').then(({ status: outcome }) => setStatus(`Ready: ${outcome}`));
        }}
        onDismissed={({ reason }: CalloutDismissedEvent) => {
          setOpen(false);
          setStatus(`Dismissed: ${reason}`);
          // A programmatic close returns focus to the trigger; a native dismissal already restored the owner's focus.
          if (reason === 'programmatic') focusTarget.requestFocus('restore');
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
    'light-dismisses on an outside owner click and explicitly rearms': async ({ browser, expect, platform, skip }) => {
      if (!browser.capabilities['furn:features']?.physicalClick) {
        skip('Light dismissal requires physical owner input.');
        return;
      }
      const status = await browser.$('~modern-callout-status');
      const dismissal = await browser.$('~modern-callout-dismissal');
      // The App SDK notification itself has no cause; its unclassified path can win the outside-pointer race.
      const expected = platform === 'windows' ? /^Dismissed: (outside-pointer|native-light-dismiss)$/ : 'Dismissed: outside-pointer';
      for (let attempt = 0; attempt < 2; attempt++) {
        await expect(status).toHaveText('Ready');
        await expect(dismissal).toHaveText('Open');
        await status.click();
        await expect(dismissal).toHaveText(expected);
        // A latched presentation must not reopen merely because open remains true; readiness would reset the label.
        await browser.pause(500);
        await expect(dismissal).toHaveText(expected);
        await (await browser.$('~modern-callout-reopen')).click();
      }
      await expect(status).toHaveText('Ready');
      await expect(dismissal).toHaveText('Open');
    },
    'keeps the presentation open for pointer input on its view anchor': async ({ browser, expect, platform, skip }) => {
      if (platform !== 'macos') {
        skip('Windows owner-island pointer handling does not yet exclude the anchor (#4375).');
        return;
      }
      if (!browser.capabilities['furn:features']?.physicalClick) {
        skip('Anchor input requires physical owner input.');
        return;
      }
      await expect(await browser.$('~modern-callout-status')).toHaveText('Ready');
      const dismissal = await browser.$('~modern-callout-dismissal');
      await expect(dismissal).toHaveText('Open');
      await (await browser.$('~modern-callout-anchor')).click();
      await browser.pause(500);
      await expect(dismissal).toHaveText('Open');
      await (await browser.$('~modern-callout-status')).click();
      await expect(dismissal).toHaveText('Dismissed: outside-pointer');
    },
    'places content below the view anchor with the requested gap': async (context) => {
      const { expectCalloutPlacement } = await import('./placement.wdio.ts');
      await expectCalloutPlacement(context);
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
      await expect(dismissal).toHaveText('Dismissed: escape');
    },
  },
};
export const FirstFocusable: Story = {
  render: () => <EntryFocusExample strategy="first" />,
  tags: ['desktop-e2e'],
  wdio: {
    'confirms the first eligible content without a FocusZone': async ({ browser, expect, skip }) => {
      if (!browser.capabilities['furn:features']?.physicalClick) {
        skip('Entry focus requires physical owner activation.');
        return;
      }
      await (await browser.$('~entry-callout-open')).click();
      await expect(await browser.$('~entry-callout-status')).toHaveText('confirmed');
      await expect(await browser.$('~entry-callout-focused')).toHaveText('First');
    },
  },
};
export const LastFocusable: Story = {
  render: () => <EntryFocusExample strategy="last" />,
  tags: ['desktop-e2e'],
  wdio: {
    'confirms the last eligible nested content without a FocusZone': async ({ browser, expect, skip }) => {
      if (!browser.capabilities['furn:features']?.physicalClick) {
        skip('Entry focus requires physical owner activation.');
        return;
      }
      await (await browser.$('~entry-callout-open')).click();
      await expect(await browser.$('~entry-callout-status')).toHaveText('confirmed');
      await expect(await browser.$('~entry-callout-focused')).toHaveText('Last');
    },
  },
};
export const EmptyFocus: Story = {
  render: () => <EntryFocusExample strategy="first" empty />,
  tags: ['desktop-e2e'],
  wdio: {
    'reports missing eligible content instead of manufacturing focus confirmation': async ({ browser, expect, skip }) => {
      if (!browser.capabilities['furn:features']?.physicalClick) {
        skip('Entry focus requires physical owner activation.');
        return;
      }
      await (await browser.$('~entry-callout-open')).click();
      await expect(await browser.$('~entry-callout-status')).toHaveText('not-mounted');
      await expect(await browser.$('~entry-callout-focused')).toHaveText('None');
    },
  },
};
export const ContainerFocus: Story = {
  render: () => <EntryFocusExample strategy="first" empty container />,
  tags: ['desktop-e2e'],
  wdio: {
    'confirms an explicitly focusable empty content container': async ({ browser, expect, skip }) => {
      if (!browser.capabilities['furn:features']?.physicalClick) {
        skip('Container focus requires physical owner activation.');
        return;
      }
      await (await browser.$('~entry-callout-open')).click();
      await expect(await browser.$('~entry-callout-status')).toHaveText('confirmed');
      await expect(await browser.$('~entry-callout-focused')).toHaveText('Container');
    },
  },
};
export const DeferredContainerFocus: Story = {
  render: () => <EntryFocusExample strategy="first" empty container="deferred" />,
  tags: ['desktop-e2e'],
  wdio: {
    'orders a focus request after the content update committed before it': async ({ browser, expect, skip }) => {
      if (!browser.capabilities['furn:features']?.physicalClick) {
        skip('Container focus requires physical owner activation.');
        return;
      }
      await (await browser.$('~entry-callout-open')).click();
      await expect(await browser.$('~entry-callout-status')).toHaveText('confirmed');
      await expect(await browser.$('~entry-callout-focused')).toHaveText('Container');
    },
  },
};
export const LocalRectangle: Story = {
  args: { anchorKind: 'rect' },
  wdio: {
    'places content below the local rectangle with the requested gap': async (context) => {
      const { expectCalloutPlacement } = await import('./placement.wdio.ts');
      await expectCalloutPlacement(context, { x: 40, y: 30, height: 30 });
    },
  },
};
export const LocalPoint: Story = {
  args: { anchorKind: 'point' },
  wdio: {
    'places content below the local point with the requested gap': async (context) => {
      const { expectCalloutPlacement } = await import('./placement.wdio.ts');
      await expectCalloutPlacement(context, { x: 40, y: 60, height: 0 });
    },
  },
};
export const MenuComposition: Story = {
  render: ({ pointerFocus }) => <MenuCompositionExample pointerFocus={pointerFocus} />,
  args: { pointerFocus: 'platform' },
  argTypes: { pointerFocus: { control: 'select', options: ['platform', 'always', 'never'] } },
  tags: ['desktop-e2e'],
  wdio: {
    'enters a FocusZone, navigates by arrow, and follows the platform focus convention on Escape': async ({
      browser,
      expect,
      platform,
      skip,
    }) => {
      const { exerciseMenuComposition } = await import('./menuComposition.wdio.ts');
      // Windows and Win32 focus a pressed trigger, so closing the menu restores it. AppKit leaves keyboard focus where
      // it was on click, so macOS restores the owner window's previous first responder instead.
      await exerciseMenuComposition({ browser, expect, skip }, { restoresTrigger: platform !== 'macos' });
    },
  },
};
export const TabContinuation: Story = {
  render: () => <MenuCompositionExample pointerFocus="always" tabNavigation="continue" />,
  tags: ['desktop-e2e'],
  wdio: {
    'closes on Tab and continues past the anchor, and on Shift+Tab returns to it': async ({ browser, expect, platform, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (platform !== 'macos') {
        skip('Only macOS implements Tab exit; Windows keeps the cycle behavior (#4377).');
        return;
      }
      if (!features?.physicalClick || !features.keyboard || !features.focus) {
        skip('Tab exit requires physical owner input, keyboard input, and focus observation.');
        return;
      }
      const trigger = await browser.$('~modern-menu-trigger');
      const status = await browser.$('~modern-menu-status');
      await trigger.click();
      await expect(status).toHaveText('Ready: confirmed');
      await browser.keys('\uE004');
      await expect(status).toHaveText('Dismissed: tab-forward');
      await browser.waitUntil(async () => (await (await browser.$('~modern-menu-after')).getProperty('focused')) === true, {
        timeout: 5000,
        timeoutMsg: 'Expected Tab to continue to the view after the anchor.',
      });
      await trigger.click();
      await expect(status).toHaveText('Ready: confirmed');
      await browser.keys(['\uE008', '\uE004']);
      await expect(status).toHaveText('Dismissed: tab-backward');
      await browser.waitUntil(async () => (await trigger.getProperty('focused')) === true, {
        timeout: 5000,
        timeoutMsg: 'Expected Shift+Tab to focus the anchor.',
      });
    },
  },
};
export const TabDismissal: Story = {
  render: () => <MenuCompositionExample pointerFocus="always" tabNavigation="dismiss" />,
  tags: ['desktop-e2e'],
  wdio: {
    'closes on Tab and leaves the owner window its retained focus': async ({ browser, expect, platform, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (platform !== 'macos') {
        skip('Only macOS implements Tab exit; Windows keeps the cycle behavior (#4377).');
        return;
      }
      if (!features?.physicalClick || !features.keyboard || !features.focus) {
        skip('Tab exit requires physical owner input, keyboard input, and focus observation.');
        return;
      }
      const trigger = await browser.$('~modern-menu-trigger');
      const status = await browser.$('~modern-menu-status');
      await trigger.click();
      await expect(status).toHaveText('Ready: confirmed');
      await browser.keys('\uE004');
      await expect(status).toHaveText('Dismissed: tab-forward');
      await browser.waitUntil(async () => (await trigger.getProperty('focused')) === true, {
        timeout: 5000,
        timeoutMsg: 'Expected the owner window to keep the focused trigger.',
      });
      expect(await (await browser.$('~modern-menu-after')).getProperty('focused')).toBe(false);
    },
  },
};
export const MenuCompositionFocusingTrigger: Story = {
  render: ({ pointerFocus }) => <MenuCompositionExample pointerFocus={pointerFocus} />,
  args: { pointerFocus: 'always' },
  argTypes: MenuComposition.argTypes,
  tags: ['desktop-e2e'],
  wdio: {
    'restores keyboard focus to a trigger focused on press': async ({ browser, expect, skip }) => {
      const { exerciseMenuComposition } = await import('./menuComposition.wdio.ts');
      await exerciseMenuComposition({ browser, expect, skip }, { restoresTrigger: true });
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
