/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { Menu } from './menu';
import { MenuEntry } from './menu-entry';
import type { MenuActionEvent } from './menu-entry.types';
import type { MenuProps } from './menu.types';
import { MenuItem } from '../menu-item/menu-item';
import { Divider } from '../divider/divider';
import { Input } from '../input/input';
import { Button } from '../button/button';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';

const styles = StyleSheet.create({
  scene: { alignItems: 'flex-start', gap: 12, padding: 12 },
  trigger: { minHeight: 40, padding: 8 },
  constrained: { maxWidth: 240 },
});

function Scene(
  props: MenuProps & {
    choices?: boolean;
    nested?: boolean;
    moveFocus?: boolean;
    empty?: boolean;
    allDisabled?: boolean;
    dynamic?: boolean;
  },
) {
  const { choices, nested, moveFocus, empty, allDisabled, dynamic, ...menuProps } = props;
  const [count, setCount] = React.useState(0);
  const [tapCount, setTapCount] = React.useState(0);
  const [actionSource, setActionSource] = React.useState('none');
  const [checked, setChecked] = React.useState(false);
  const [choice, setChoice] = React.useState('one');
  const [showFirst, setShowFirst] = React.useState(true);
  const outside = React.useRef<View | null>(null);
  const observeTap = () => setTapCount((value: number) => value + 1);
  const invoke = (event?: MenuActionEvent) => {
    setCount((value: number) => value + 1);
    setActionSource(event === undefined ? 'eventless-ax' : 'original-native-event');
    if (moveFocus) outside.current?.focus();
  };
  return (
    <View style={styles.scene} testID="menu-story-root">
      <Input textInput={{ testID: 'menu-entry-editor' }} placeholder="Tab into menu" />
      <Menu
        {...menuProps}
        trigger={{
          testID: 'menu-trigger',
          accessibilityLabel: 'Document commands',
          style: styles.trigger,
          children: <Text>Commands</Text>,
          onAccessibilityTap: observeTap,
        }}
        content={
          props.content ?? {
            style: styles.constrained,
            children: empty ? null : (
              <>
                <MenuItem menuStyle="section-header" content="Document" secondaryContent={null} />
                {showFirst && (
                  <MenuEntry
                    itemId="alpha"
                    content="Alpha"
                    testID="menu-alpha"
                    disabled={allDisabled}
                    secondaryContent={null}
                    onAction={invoke}
                    onAccessibilityTap={observeTap}
                  />
                )}
                <MenuEntry itemId="disabled" content="Unavailable" testID="menu-disabled" disabled secondaryContent={null} />
                <Divider label={null} icon={null} />
                <MenuEntry
                  itemId="beta"
                  content="Beta"
                  testID="menu-beta"
                  disabled={allDisabled}
                  secondaryContent={null}
                  onAction={invoke}
                  onAccessibilityTap={observeTap}
                />
                <MenuEntry
                  itemId="april"
                  content="April"
                  testID="menu-april"
                  disabled={allDisabled}
                  secondaryContent={null}
                  onAction={invoke}
                  onAccessibilityTap={observeTap}
                />
                {choices && (
                  <>
                    <MenuEntry
                      itemId="markup"
                      content="Show markup"
                      checkable="checkbox"
                      selected={checked}
                      testID="menu-checkbox"
                      onAction={(event?: MenuActionEvent) => {
                        setChecked((value: boolean) => !value);
                        invoke(event);
                      }}
                      onAccessibilityTap={observeTap}
                      secondaryContent={null}
                    />
                    <MenuEntry
                      itemId="one"
                      content="One"
                      checkable="radio"
                      selectionGroup="number"
                      selected={choice === 'one'}
                      onAction={(event?: MenuActionEvent) => {
                        setChoice('one');
                        invoke(event);
                      }}
                      onAccessibilityTap={observeTap}
                      testID="menu-radio-one"
                      secondaryContent={null}
                    />
                    <MenuEntry
                      itemId="two"
                      content="Two"
                      checkable="radio"
                      selectionGroup="number"
                      selected={choice === 'two'}
                      onAction={(event?: MenuActionEvent) => {
                        setChoice('two');
                        invoke(event);
                      }}
                      onAccessibilityTap={observeTap}
                      testID="menu-radio-two"
                      secondaryContent={null}
                    />
                  </>
                )}
                {nested && (
                  <MenuEntry
                    itemId="export"
                    content="Export"
                    testID="menu-export"
                    secondaryContent={null}
                    submenu={{
                      surfaceAccessibilityLabel: 'Export formats',
                      content: {
                        children: (
                          <>
                            <MenuEntry itemId="pdf" content="PDF" testID="menu-pdf" onAction={invoke} secondaryContent={null} />
                            <MenuEntry
                              itemId="options"
                              content="Options"
                              testID="menu-options"
                              secondaryContent={null}
                              submenu={{
                                surfaceAccessibilityLabel: 'PDF options',
                                content: {
                                  children: (
                                    <MenuEntry
                                      itemId="compressed"
                                      content="Compressed"
                                      testID="menu-compressed"
                                      onAction={invoke}
                                      secondaryContent={null}
                                    />
                                  ),
                                },
                              }}
                            />
                          </>
                        ),
                      },
                    }}
                  />
                )}
              </>
            ),
          }
        }
      />
      <Button ref={outside} content="Outside destination" testID="menu-outside" />
      {dynamic && <Button content="Remove first entry" testID="menu-remove" onPress={() => setShowFirst(false)} />}
      <StoryStatus testID="menu-action-count">{String(count)}</StoryStatus>
      <StoryStatus testID="menu-ax-tap-count">{String(tapCount)}</StoryStatus>
      <StoryStatus testID="menu-action-source">{actionSource}</StoryStatus>
      <StoryStatus testID="menu-selection">{`${String(checked)}:${choice}`}</StoryStatus>
    </View>
  );
}

const meta: Meta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  args: { surfaceAccessibilityLabel: 'Document commands', defaultOpen: false },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' },
    content: { control: false },
    trigger: { control: false },
  },
  render: (args: MenuProps) => <Scene {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          'macOS-first action menu. Windows/Win32 are explicitly gated in runtime and must be excluded through app StorySettings.platformSettings.storyPatterns. Native family/hit-test compilation is not Menu qualification; Menu matches original-event hit identity to current row refs.',
      },
    },
  },
};
export default meta;
type Story = WdioStory<StoryObj<typeof Menu>>;

export const Default: Story = {
  tags: ['desktop-e2e', 'macos-only'],
  wdio: {
    'starts closed with a named trigger': async ({ browser, expect, platform }) => {
      if (platform !== 'macos') throw new Error('Menu platform discovery gate was not applied.');
      await expect(await browser.$('~menu-trigger')).toExist();
      await expect(await browser.$('~menu-action-count')).toHaveText('0');
    },
  },
};
export const Overview: Story = { render: (args: MenuProps) => <Scene {...args} choices nested /> };
export const CommandsAndCheckableChoices: Story = {
  render: (args: MenuProps) => <Scene {...args} choices />,
  wdio: {
    'invokes a checkbox command once without focus-following selection': async (context) => {
      const { openMenuByKeyboard, requireMenuPopup } = await import('./menu.wdio.ts');
      await openMenuByKeyboard(context);
      if (!(await requireMenuPopup(context, 'menu-checkbox'))) return;
      await (await context.browser.$('~menu-checkbox')).click();
      await context.expect(await context.browser.$('~menu-action-count')).toHaveText('1');
      await context.expect(await context.browser.$('~menu-selection')).toHaveText('true:one');
    },
  },
};
export const HeadersAndDisabledEntries: Story = {
  wdio: {
    'skips header separator and disabled entry': async (context) => {
      const { openMenuByKeyboard, requireMenuPopup, nativeMenuFocus } = await import('./menu.wdio.ts');
      await openMenuByKeyboard(context);
      if (!(await requireMenuPopup(context, 'menu-alpha'))) return;
      await nativeMenuFocus(context, 'menu-alpha');
      await context.browser.keys('\uE015');
      await nativeMenuFocus(context, 'menu-beta');
    },
  },
};
export const KeyboardAndTypeahead: Story = {
  tags: ['desktop-e2e', 'macos-only'],
  wdio: {
    'wraps vertical navigation and supports Home End and repeated prefix search': async (context) => {
      const { openMenuByKeyboard, requireMenuPopup, nativeMenuFocus } = await import('./menu.wdio.ts');
      await openMenuByKeyboard(context);
      if (!(await requireMenuPopup(context, 'menu-alpha'))) return;
      await nativeMenuFocus(context, 'menu-alpha');
      await context.browser.keys('\uE013');
      await nativeMenuFocus(context, 'menu-april');
      await context.browser.keys('\uE011');
      await nativeMenuFocus(context, 'menu-alpha');
      await context.browser.keys('a');
      await nativeMenuFocus(context, 'menu-april');
      await context.browser.keys('\uE010');
      await nativeMenuFocus(context, 'menu-april');
    },
  },
};
export const RTLSubmenus: Story = {
  render: (args: MenuProps) => <Scene {...args} nested />,
  parameters: {
    docs: {
      description: {
        story: 'Uses the actual I18nManager direction; this story never changes machine RTL settings. Root plus two descendant levels.',
      },
    },
  },
  wdio: {
    'opens two levels and closes only the current child with Escape': async (context) => {
      const { openMenuByKeyboard, requireMenuPopup, nativeMenuFocus } = await import('./menu.wdio.ts');
      await openMenuByKeyboard(context);
      if (!(await requireMenuPopup(context, 'menu-export'))) return;
      await context.browser.keys('\uE010');
      await nativeMenuFocus(context, 'menu-export');
      // Enter activation follows the same native path in either direction.
      await context.browser.keys('\uE007');
      if (!(await requireMenuPopup(context, 'menu-pdf'))) return;
      await nativeMenuFocus(context, 'menu-pdf');
      await context.browser.keys('\uE015');
      await context.browser.keys('\uE007');
      if (!(await requireMenuPopup(context, 'menu-compressed'))) return;
      await nativeMenuFocus(context, 'menu-compressed');
      await context.browser.keys('\uE00C');
      await nativeMenuFocus(context, 'menu-options');
    },
  },
};
export const HoverAndKeyboardSuppression: Story = {
  render: (args: MenuProps) => <Scene {...args} nested />,
  wdio: {
    'uses physical movement rather than a hover entry to change native focus': async (context) => {
      const { openMenuByKeyboard, requireMenuPopup, nativeMenuFocus } = await import('./menu.wdio.ts');
      await openMenuByKeyboard(context);
      if (!(await requireMenuPopup(context, 'menu-alpha'))) return;
      if (!context.browser.capabilities['furn:features']?.physicalClick) {
        context.skip('Native pointer movement qualification requires an interactive desktop.');
        return;
      }
      await context.browser.keys('\uE015');
      await nativeMenuFocus(context, 'menu-beta');
      const row = await context.browser.$('~menu-april');
      const rect = await context.browser.getElementRect(await row.elementId);
      await context.browser.performActions([
        {
          type: 'pointer',
          id: 'menu-mouse',
          parameters: { pointerType: 'mouse' },
          actions: [
            {
              type: 'pointerMove',
              origin: 'viewport',
              x: Math.round(rect.x + rect.width / 2),
              y: Math.round(rect.y + rect.height / 2),
              duration: 100,
            },
          ],
        },
      ]);
      try {
        await nativeMenuFocus(context, 'menu-april');
      } finally {
        await context.browser.releaseActions();
      }
    },
  },
};
export const TabExit: Story = {
  wdio: {
    'continues original Tab to the outside destination without trigger restoration': async (context) => {
      const { openMenuByKeyboard, requireMenuPopup, nativeMenuFocus } = await import('./menu.wdio.ts');
      await openMenuByKeyboard(context);
      if (!(await requireMenuPopup(context, 'menu-alpha'))) return;
      await context.browser.keys('\uE004');
      await nativeMenuFocus(context, 'menu-outside');
    },
    'continues ShiftTab to the preceding editor': async (context) => {
      const { openMenuByKeyboard, requireMenuPopup, nativeMenuFocus } = await import('./menu.wdio.ts');
      await openMenuByKeyboard(context);
      if (!(await requireMenuPopup(context, 'menu-alpha'))) return;
      try {
        await context.browser.keys(['\uE008', '\uE004']);
      } finally {
        await context.browser.keys('\uE000');
      }
      await nativeMenuFocus(context, 'menu-entry-editor');
    },
  },
};
export const NativeDismissAndGuardedReturn: Story = {
  wdio: {
    'returns to the root trigger on owned Escape': async (context) => {
      const { openMenuByKeyboard, requireMenuPopup, nativeMenuFocus } = await import('./menu.wdio.ts');
      await openMenuByKeyboard(context);
      if (!(await requireMenuPopup(context, 'menu-alpha'))) return;
      await context.browser.keys('\uE00C');
      await nativeMenuFocus(context, 'menu-trigger');
    },
    'preserves a same-window outside editor destination': async (context) => {
      const { openMenuByKeyboard, requireMenuPopup, nativeMenuFocus } = await import('./menu.wdio.ts');
      await openMenuByKeyboard(context);
      if (!(await requireMenuPopup(context, 'menu-alpha'))) return;
      await (await context.browser.$('~menu-entry-editor')).click();
      await nativeMenuFocus(context, 'menu-entry-editor');
    },
  },
};
export const ActionMovesFocus: Story = {
  render: (args: MenuProps) => <Scene {...args} moveFocus />,
  wdio: {
    'retains a caller-directed external focus destination after action close': async (context) => {
      const { openMenuByKeyboard, requireMenuPopup, nativeMenuFocus } = await import('./menu.wdio.ts');
      await openMenuByKeyboard(context);
      if (!(await requireMenuPopup(context, 'menu-alpha'))) return;
      await context.browser.keys('\uE007');
      await context.expect(await context.browser.$('~menu-action-count')).toHaveText('1');
      await nativeMenuFocus(context, 'menu-outside');
    },
  },
};
export const DynamicMembershipAndRefs: Story = {
  render: (args: MenuProps) => <Scene {...args} dynamic />,
  parameters: {
    docs: {
      description: {
        story: 'Removal updates logical membership without selection; current native owner decides whether repair may move focus.',
      },
    },
  },
};
export const EmptyAndAllDisabled: Story = {
  render: (args: MenuProps) => (
    <View style={styles.scene}>
      <Scene {...args} empty />
      <Scene {...args} allDisabled />
    </View>
  ),
  parameters: {
    docs: { description: { story: 'Named empty and disabled-only menus retain native Escape and Tab; no dummy focus target.' } },
  },
};
function Controlled(props: MenuProps) {
  const [open, setOpen] = React.useState(false);
  return <Scene {...props} open={open} onOpenChange={(next: boolean) => setOpen(next)} />;
}
export const ControlledOpenRequests: Story = { render: (args: MenuProps) => <Controlled {...args} /> };
export const AccessibilityActions: Story = {
  render: (args: MenuProps) => <Scene {...args} choices nested />,
  wdio: {
    'requires real AX custom-action invocation and checked expanded projection': async ({ skip }) => {
      skip('Driver named AX action dispatch/projection remains a native evidence gate; pointer invocation is not a replacement.');
    },
  },
};
export const EventlessAccessibilityActivation: Story = {
  render: (args: MenuProps) => <Scene {...args} choices nested />,
  parameters: {
    docs: {
      description: {
        story:
          'Real macOS Fabric AX activation calls commands with undefined before one tap observer and guarded close. Checkbox requests inversion; radio requests selection, both external. Source/tap counters distinguish genuine eventless invocation from original press/named events. Submenu activation opens only. Use VoiceOver/native AX activation, not synthesized presses.',
      },
    },
  },
  wdio: {
    'requires real eventless AX activation distinct from physical press or named custom action': async ({ skip }) => {
      skip(
        'Native Menu AX runtime remains unrun; the driver needs a genuine AX activation path. Direct JS tap simulation or pointer press cannot qualify eventless native delivery.',
      );
    },
  },
};
export const ConstrainedContent: Story = {
  args: {
    content: {
      style: styles.constrained,
      children: (
        <MenuEntry itemId="long" content="A long document command that must wrap without changing row identity" secondaryContent={null} />
      ),
    },
  },
};
export const PopupThemeAndModality: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Inherits the existing scene theme and input controller through Popover; no new scene or fabricated focus modality.',
      },
    },
  },
};
export const PlatformAdmission: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Only macOS discovery may include this module. Unit coverage verifies explicit Windows/Win32 use errors, not empty fallback views.',
      },
    },
  },
};
