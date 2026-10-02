/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Pressable } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import type { FocusKeyboardEvent } from '@fluentui-react-native/framework-base';
import { Toolbar } from './toolbar';
import { ToolbarButton } from './toolbar-button';
import type { ToolbarDirection, ToolbarProps } from './toolbar.types';
import { Divider } from '../divider/divider';
import { Input } from '../input/input';
import { Button } from '../button/button';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';

const addIcon = { fontSource: { codepoint: 0x2b, fontFamily: 'Arial' } } as const;
const removeIcon = { fontSource: { codepoint: 0x2d, fontFamily: 'Arial' } } as const;
const pinIcon = { fontSource: { codepoint: 0x2a, fontFamily: 'Arial' } } as const;
const styles = StyleSheet.create({
  scene: { alignItems: 'flex-start', gap: 16 },
  pair: { alignItems: 'flex-start', gap: 8 },
  boundary: { width: 200, borderWidth: 1, borderColor: '#808080', padding: 8 },
});

const meta: Meta<typeof Toolbar> = {
  title: 'Components/Toolbar',
  component: Toolbar,
  args: { accessibilityLabel: 'Object actions', size: 'large', direction: 'ltr' },
  argTypes: {
    size: { control: 'select', options: ['small', 'large'] },
    direction: { control: 'select', options: ['ltr', 'rtl'] },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A bounded horizontal command scope. ToolbarButton reuses Button and keeps selection external; Divider separates commands. Editors and automatic overflow are excluded.',
      },
    },
  },
};
export default meta;
type Story = WdioStory<StoryObj<typeof Toolbar>>;

function CommandScene(props: Omit<ToolbarProps, 'children'>) {
  const [pinned, setPinned] = React.useState(false);
  const [count, setCount] = React.useState(0);
  return (
    <View style={styles.scene}>
      <Toolbar {...props}>
        <ToolbarButton value="add" accessibilityLabel="Add object" icon={addIcon} onPress={() => setCount((value) => value + 1)} />
        <ToolbarButton value="remove" accessibilityLabel="Remove object" icon={removeIcon} />
        <Divider vertical label={null} />
        <ToolbarButton
          value="pin"
          accessibilityLabel="Pin object"
          icon={pinIcon}
          selected={pinned}
          onPress={() => setPinned((value) => !value)}
        />
      </Toolbar>
      <StoryStatus testID="toolbar-command-status">{`Added ${count}; pinned ${pinned}`}</StoryStatus>
    </View>
  );
}

export const Default: Story = {
  render: (args: ToolbarProps) => <CommandScene {...args} />,
};
export const Overview: Story = {
  render: () => (
    <View style={styles.scene}>
      <Text>Large commands with application-owned selection</Text>
      <CommandScene accessibilityLabel="Large commands" size="large" />
      <Text>Small commands, right-to-left</Text>
      <CommandScene accessibilityLabel="Small commands" size="small" direction="rtl" />
    </View>
  ),
};
export const Sizes: Story = {
  render: () => (
    <View style={styles.scene}>
      {(['small', 'large'] as const).map((size) => (
        <View key={size} style={styles.pair}>
          <Text>{size}</Text>
          <CommandScene accessibilityLabel={`${size} commands`} size={size} />
        </View>
      ))}
    </View>
  ),
  parameters: { docs: { description: { story: 'Both supported sizes use their own token gap and inherited Button dimensions.' } } },
};
export const ControlledCommands: Story = {
  render: (args: ToolbarProps) => <CommandScene {...args} />,
  parameters: { docs: { description: { story: 'The application owns the pin state. Navigating the toolbar never selects a command.' } } },
};
export const ConstrainedWidth: Story = {
  render: () => (
    <View style={styles.boundary}>
      <Toolbar accessibilityLabel="Bounded object commands" size="small">
        <ToolbarButton value="add" accessibilityLabel="Add object" icon={addIcon} />
        <ToolbarButton value="remove" accessibilityLabel="Remove object" icon={removeIcon} />
        <Divider vertical label={null} />
        <ToolbarButton value="pin" accessibilityLabel="Pin object" icon={pinIcon} />
      </Toolbar>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The host supplies enough space for every command; there is no automatic clipping, hiding, scrolling, or overflow popup.',
      },
    },
  },
};

function FocusScene({ direction = 'ltr' }: { direction?: ToolbarDirection }) {
  const [count, setCount] = React.useState(0);
  const [selected, setSelected] = React.useState(false);
  const [ownerKey, setOwnerKey] = React.useState('none');
  return (
    <View style={styles.scene}>
      <Input accessibilityLabel="Keyboard entry" testID="toolbar-entry" placeholder="Tab into commands" />
      <Toolbar
        accessibilityLabel="Test commands"
        direction={direction}
        testID="toolbar-scope"
        onKeyDown={(event: FocusKeyboardEvent) => {
          if (event.nativeEvent.shiftKey && event.nativeEvent.key === 'ArrowRight') setOwnerKey('Shift+ArrowRight');
        }}
      >
        <ToolbarButton
          value="one"
          accessibilityLabel="Add object"
          icon={addIcon}
          testID="toolbar-one"
          onPress={() => setCount((value) => value + 1)}
        />
        <ToolbarButton value="disabled" accessibilityLabel="Unavailable remove" icon={removeIcon} disabled testID="toolbar-disabled" />
        <Divider vertical label={null} testID="toolbar-divider" />
        <ToolbarButton
          value="two"
          accessibilityLabel="Pin object"
          icon={pinIcon}
          selected={selected}
          testID="toolbar-two"
          onPress={() => {
            setCount((value) => value + 1);
            setSelected((value) => !value);
          }}
        />
      </Toolbar>
      <Button content="Following command" testID="toolbar-after" />
      <StoryStatus testID="toolbar-count">{String(count)}</StoryStatus>
      <StoryStatus testID="toolbar-selected">{String(selected)}</StoryStatus>
      <StoryStatus testID="toolbar-owner-key">{ownerKey}</StoryStatus>
    </View>
  );
}

export const FocusManagement: Story = {
  render: () => <FocusScene />,
  tags: ['desktop-focus'],
  wdio: {
    'keeps inactive pointer commands actionable without duplicate activation': async (context) => {
      const { requireDesktopFocus, expectWindowsPointerFocus, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await focusByTab(browser, 'toolbar-entry', 'toolbar-one');
      await (await browser.$('~toolbar-two')).click();
      await expectWindowsPointerFocus(context, 'toolbar-two');
      await expect(await browser.$('~toolbar-count')).toHaveText('1');
      await expect(await browser.$('~toolbar-selected')).toHaveText('true');
      await (await browser.$('~toolbar-one')).click();
      await expectWindowsPointerFocus(context, 'toolbar-one');
      await expect(await browser.$('~toolbar-count')).toHaveText('2');
    },
    'retains native keydown or keyup activation timing and suppresses held-key repeats': async (context) => {
      const { requireDesktopFocus, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect, platform } = context;
      await focusByTab(browser, 'toolbar-entry', 'toolbar-one');
      try {
        await browser.performActions([
          {
            type: 'key',
            id: 'toolbar-keyboard',
            actions: [
              { type: 'keyDown', value: '\uE00D' },
              { type: 'keyDown', value: '\uE00D' },
            ],
          },
        ]);
        await expect(await browser.$('~toolbar-count')).toHaveText(platform === 'macos' ? '1' : '0');
        await browser.performActions([{ type: 'key', id: 'toolbar-keyboard', actions: [{ type: 'keyUp', value: '\uE00D' }] }]);
        await expect(await browser.$('~toolbar-count')).toHaveText('1');
      } finally {
        await browser.releaseActions();
      }
    },
    'enters once, skips disabled and separators, wraps, and exits in both Tab directions': async (context) => {
      const { requireDesktopFocus, expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await focusByTab(browser, 'toolbar-entry', 'toolbar-one');
      for (const [key, id] of [
        ['\uE014', 'toolbar-two'],
        ['\uE014', 'toolbar-one'],
        ['\uE010', 'toolbar-two'],
        ['\uE011', 'toolbar-one'],
      ]) {
        await browser.keys(key);
        await expectNativeState(browser, id, 'focused', true);
        await expectNativeState(browser, 'toolbar-disabled', 'focused', false);
      }
      await browser.keys('\uE004');
      await expectNativeState(browser, 'toolbar-after', 'focused', true);
      try {
        await browser.keys(['\uE008', '\uE004']);
      } finally {
        await browser.keys('\uE000');
      }
      await expectNativeState(browser, 'toolbar-one', 'focused', true);
      try {
        await browser.keys(['\uE008', '\uE004']);
      } finally {
        await browser.keys('\uE000');
      }
      await expectNativeState(browser, 'toolbar-entry', 'focused', true);
      await expect(await browser.$('~toolbar-count')).toHaveText('0');
      await expect(await browser.$('~toolbar-selected')).toHaveText('false');
    },
    'keeps selection external and activates each command only once per Enter or Space': async (context) => {
      const { requireDesktopFocus, expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await focusByTab(browser, 'toolbar-entry', 'toolbar-one');
      await browser.keys('\uE014');
      await expectNativeState(browser, 'toolbar-two', 'focused', true);
      await expect(await browser.$('~toolbar-selected')).toHaveText('false');
      await browser.keys('\uE007');
      await expect(await browser.$('~toolbar-count')).toHaveText('1');
      await expect(await browser.$('~toolbar-selected')).toHaveText('true');
      await browser.keys(' ');
      await expect(await browser.$('~toolbar-count')).toHaveText('2');
      await expect(await browser.$('~toolbar-selected')).toHaveText('false');
    },
    'leaves modified arrows with their caller': async (context) => {
      const { requireDesktopFocus, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await focusByTab(browser, 'toolbar-entry', 'toolbar-one');
      try {
        await browser.keys(['\uE008', '\uE014']);
      } finally {
        await browser.keys('\uE000');
      }
      await expect(await browser.$('~toolbar-owner-key')).toHaveText('Shift+ArrowRight');
      await expect(await browser.$('~toolbar-count')).toHaveText('0');
      await expect(await browser.$('~toolbar-selected')).toHaveText('false');
    },
    'preserves the named native group and individually accessible commands': async ({ browser, expect }) => {
      const scope = await browser.$('~toolbar-scope');
      await expect(scope).toExist();
      await expect(scope).toHaveAttribute('name', 'Test commands');
      for (const id of ['toolbar-one', 'toolbar-two', 'toolbar-disabled']) {
        const command = await browser.$(`~${id}`);
        await expect(command).toExist();
        expect(await command.getTagName()).toBe('button');
      }
      await expect(await browser.$('~toolbar-divider')).toExist();
    },
    'requires native toolbar role projection independently of child discovery': async ({ browser, expect, platform, skip }) => {
      const role = await (await browser.$('~toolbar-scope')).getTagName();
      if (platform === 'macos' && role === 'unknown') {
        skip(
          'RNmacOS 0.81.9 Fabric exposes the toolbar role as AXUnknown. Named group/child discovery is tested separately; toolbar role acceptance remains blocked.',
        );
        return;
      }
      expect(role).toBe('toolbar');
    },
  },
};

export const RTL: Story = {
  render: () => <FocusScene direction="rtl" />,
  tags: ['desktop-focus'],
  wdio: {
    'uses Left to advance in RTL and retains logical Home/End destinations': async (context) => {
      const { requireDesktopFocus, expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser } = context;
      await focusByTab(browser, 'toolbar-entry', 'toolbar-one');
      for (const [key, id] of [
        ['\uE012', 'toolbar-two'],
        ['\uE012', 'toolbar-one'],
        ['\uE010', 'toolbar-two'],
        ['\uE011', 'toolbar-one'],
      ]) {
        await browser.keys(key);
        await expectNativeState(browser, id, 'focused', true);
      }
    },
  },
};

function DynamicScene() {
  const [disabled, setDisabled] = React.useState(false);
  const [removed, setRemoved] = React.useState(false);
  const [reversed, setReversed] = React.useState(false);
  const commands = [
    <ToolbarButton key="one" value="one" accessibilityLabel="Add object" icon={addIcon} testID="toolbar-dynamic-one" />,
    ...(!removed
      ? [
          <ToolbarButton
            key="two"
            value="two"
            accessibilityLabel="Pin object"
            icon={pinIcon}
            disabled={disabled}
            testID="toolbar-dynamic-two"
          />,
        ]
      : []),
  ];
  return (
    <View style={styles.scene}>
      <Input accessibilityLabel="Dynamic entry" testID="toolbar-dynamic-entry" />
      <Toolbar accessibilityLabel="Dynamic commands">{reversed ? [...commands].reverse() : commands}</Toolbar>
      <Button content="Disable second" testID="toolbar-disable" onPress={() => setDisabled((value) => !value)} />
      <Button content="Remove second" testID="toolbar-remove" onPress={() => setRemoved((value) => !value)} />
      <Button content="Reorder" onPress={() => setReversed((value) => !value)} />
    </View>
  );
}
export const DisabledAndDynamic: Story = {
  render: () => <DynamicScene />,
  tags: ['desktop-focus'],
  wdio: {
    'repairs entry after removal without stealing an external command focus': async (context) => {
      const { requireDesktopFocus, expectNativeState, expectWindowsPointerFocus, focusByTab } =
        await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await focusByTab(browser, 'toolbar-dynamic-entry', 'toolbar-dynamic-one');
      await browser.keys('\uE014');
      await expectNativeState(browser, 'toolbar-dynamic-two', 'focused', true);
      // Exit to external controls before changing membership.
      await browser.keys('\uE004');
      await expectNativeState(browser, 'toolbar-disable', 'focused', true);
      await browser.keys('\uE004');
      await expectNativeState(browser, 'toolbar-remove', 'focused', true);
      await browser.keys('\uE007');
      await expect(await browser.$('~toolbar-dynamic-two')).not.toExist();
      await expectNativeState(browser, 'toolbar-remove', 'focused', true);
      await focusByTab(browser, 'toolbar-dynamic-entry', 'toolbar-dynamic-one');
      await expectWindowsPointerFocus(context, 'toolbar-dynamic-one');
    },
  },
};

function RefScene() {
  const [attached, setAttached] = React.useState(false);
  const ref = React.useCallback((instance: React.ComponentRef<typeof Pressable> | null) => {
    setAttached(instance !== null);
    if (instance) return () => setAttached(false);
    return undefined;
  }, []);
  return (
    <View style={styles.scene}>
      <Toolbar accessibilityLabel="Ref command">
        <ToolbarButton value="one" accessibilityLabel="Add object" icon={addIcon} ref={ref} />
      </Toolbar>
      <StoryStatus testID="toolbar-ref-status">{attached ? 'attached' : 'detached'}</StoryStatus>
    </View>
  );
}
export const Refs: Story = {
  render: () => <RefScene />,
  parameters: {
    docs: {
      description: {
        story: 'The command callback ref receives the native Pressable and supplies React 19 cleanup; it is not the Toolbar View.',
      },
    },
  },
};
