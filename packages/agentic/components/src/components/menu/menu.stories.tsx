/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Divider } from '../divider/divider';
import { Input } from '../input/input';
import { MenuItem } from '../menu-item/menu-item';
import type { MenuItemProps } from '../menu-item/menu-item.types';
import { Menu } from './menu';
import type { MenuAlign, MenuOpenChangeData, MenuPlacement } from './menu.types';

type SceneProps = { placement?: MenuPlacement; align?: MenuAlign; disabledFocusable?: boolean; submenuOpenOnHover?: boolean };

/** A command row with a test identity and no secondary text or leading icon. */
function rowProps(content: string, setFocus: (label: string) => void, props?: MenuItemProps): MenuItemProps {
  return {
    content,
    secondaryContent: null,
    icon: null,
    testID: `menu-${content.toLowerCase()}`,
    onFocus: () => setFocus(content),
    ...props,
  };
}

function EditScene({ placement, align, disabledFocusable, submenuOpenOnHover }: SceneProps) {
  const [reason, setReason] = React.useState('None');
  const [action, setAction] = React.useState('None');
  const [focus, setFocus] = React.useState('None');
  const run = (label: string) => () => setAction(label);
  const onOpenChange = (open: boolean, { reason: cause }: MenuOpenChangeData) => {
    setReason(`${open ? 'Opened' : 'Closed'}: ${cause}`);
    if (open) setFocus('None');
  };
  return (
    <View style={styles.story}>
      <Input accessibilityLabel="Menu entry" testID="menu-entry" />
      <Menu
        placement={placement}
        align={align}
        disabledFocusable={disabledFocusable}
        submenuOpenOnHover={submenuOpenOnHover}
        onOpenChange={onOpenChange}
        trigger={{ content: 'Edit', testID: 'menu-trigger' }}
        surface={{ testID: 'menu-surface' }}
      >
        <MenuItem {...rowProps('Cut', setFocus, { onPress: run('Cut') })} />
        <MenuItem {...rowProps('Copy', setFocus, { onPress: run('Copy') })} />
        <MenuItem {...rowProps('Paste', setFocus, { disabled: true, onPress: run('Paste') })} />
        <Divider label={null} />
        <MenuItem
          {...rowProps('Share', setFocus, {
            submenu: {
              testID: 'menu-share-surface',
              children: (
                <>
                  <MenuItem {...rowProps('Email', setFocus, { onPress: run('Email') })} />
                  <MenuItem
                    {...rowProps('More', setFocus, {
                      submenu: {
                        testID: 'menu-more-surface',
                        children: (
                          <>
                            <MenuItem {...rowProps('Print', setFocus, { onPress: run('Print') })} />
                            <MenuItem {...rowProps('Export', setFocus, { onPress: run('Export') })} />
                          </>
                        ),
                      },
                    })}
                  />
                </>
              ),
            },
          })}
        />
        <MenuItem {...rowProps('Delete', setFocus, { onPress: run('Delete') })} />
      </Menu>
      <StoryStatus testID="menu-reason">{reason}</StoryStatus>
      <StoryStatus testID="menu-action">{action}</StoryStatus>
      <StoryStatus testID="menu-focus">{focus}</StoryStatus>
    </View>
  );
}

const meta: Meta<SceneProps> = {
  title: 'Components/Menu',
  render: (args) => <EditScene {...args} />,
  args: { placement: 'bottom', align: 'center', submenuOpenOnHover: true },
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'start', 'end'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    disabledFocusable: { control: 'boolean' },
    submenuOpenOnHover: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Menu presents commands in a nonmodal native popup anchored to its trigger, with up to two levels of submenus. Rows run their command and close the menu.',
      },
    },
  },
};

export default meta;

type Story = WdioStory<StoryObj<SceneProps>>;

export const Default: Story = {
  tags: ['desktop-focus'],
  wdio: {
    'opens from the keyboard on the first row and closes on activation': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (
        await import('./menu.wdio.ts')
      ).openMenuFromKeyboard(context, {
        entry: 'menu-entry',
        trigger: 'menu-trigger',
        reason: 'menu-reason',
        focus: 'menu-focus',
        first: 'Cut',
      });
      expect(await (await browser.$('~menu-trigger')).getProperty('expanded')).toBe(true);
      await browser.keys('\uE015');
      await expect(await browser.$('~menu-focus')).toHaveText('Copy');
      // The disabled Paste row is a focus stop by default on Windows and Win32, but not on macOS.
      const pasteStops = context.platform !== 'macos';
      if (pasteStops) {
        await browser.keys('\uE015');
        await expect(await browser.$('~menu-focus')).toHaveText('Paste');
      }
      await browser.keys('\uE015');
      await expect(await browser.$('~menu-focus')).toHaveText('Share');
      await browser.keys('\uE013');
      if (pasteStops) {
        await expect(await browser.$('~menu-focus')).toHaveText('Paste');
        await browser.keys('\uE013');
      }
      await expect(await browser.$('~menu-focus')).toHaveText('Copy');
      await browser.keys('\uE007');
      await expect(await browser.$('~menu-action')).toHaveText('Copy');
      await expect(await browser.$('~menu-reason')).toHaveText('Closed: action');
      await expectNativeState(browser, 'menu-trigger', 'focused', true);
    },
    'navigates with Home, End, and type-ahead': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (
        await import('./menu.wdio.ts')
      ).openMenuFromKeyboard(context, {
        entry: 'menu-entry',
        trigger: 'menu-trigger',
        reason: 'menu-reason',
        focus: 'menu-focus',
        first: 'Cut',
      });
      await browser.keys('\uE010');
      await expect(await browser.$('~menu-focus')).toHaveText('Delete');
      await browser.keys('\uE011');
      await expect(await browser.$('~menu-focus')).toHaveText('Cut');
      await browser.keys('d');
      await expect(await browser.$('~menu-focus')).toHaveText('Delete');
      await browser.keys('c');
      await expect(await browser.$('~menu-focus')).toHaveText('Cut');
      await browser.keys('c');
      await expect(await browser.$('~menu-focus')).toHaveText('Copy');
      await browser.keys('\uE00C');
      await expect(await browser.$('~menu-reason')).toHaveText('Closed: dismiss');
      await expectNativeState(browser, 'menu-trigger', 'focused', true);
    },
    'opens and closes two submenu levels with arrows and Escape': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (
        await import('./menu.wdio.ts')
      ).openMenuFromKeyboard(context, {
        entry: 'menu-entry',
        trigger: 'menu-trigger',
        reason: 'menu-reason',
        focus: 'menu-focus',
        first: 'Cut',
      });
      await browser.keys('s');
      await expect(await browser.$('~menu-focus')).toHaveText('Share');
      await browser.keys('\uE014');
      await expect(await browser.$('~menu-focus')).toHaveText('Email');
      await browser.keys('\uE015');
      await expect(await browser.$('~menu-focus')).toHaveText('More');
      await browser.keys('\uE014');
      await expect(await browser.$('~menu-focus')).toHaveText('Print');
      // A restored row was already its popup's first responder, so its focus is observed through the next arrow key.
      await browser.keys('\uE012');
      await browser.keys('\uE013');
      await expect(await browser.$('~menu-focus')).toHaveText('Email');
      await browser.keys('\uE00C');
      await browser.keys('\uE015');
      await expect(await browser.$('~menu-focus')).toHaveText('Delete');
      expect(await (await browser.$('~menu-reason')).getText()).toBe('Opened: trigger');
      await browser.keys('\uE00C');
      await expect(await browser.$('~menu-reason')).toHaveText('Closed: dismiss');
      await expectNativeState(browser, 'menu-trigger', 'focused', true);
    },
    'closes the whole menu on Tab from a submenu and returns to the trigger': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { expectMenuClosed } = await import('./menu.wdio.ts');
      const { browser, expect } = context;
      await (
        await import('./menu.wdio.ts')
      ).openMenuFromKeyboard(context, {
        entry: 'menu-entry',
        trigger: 'menu-trigger',
        reason: 'menu-reason',
        focus: 'menu-focus',
        first: 'Cut',
      });
      await browser.keys('s');
      await browser.keys('\uE014');
      await expect(await browser.$('~menu-focus')).toHaveText('Email');
      await browser.keys('\uE004');
      await expect(await browser.$('~menu-reason')).toHaveText('Closed: dismiss');
      await expectMenuClosed(context, 'menu-trigger');
      await expectNativeState(browser, 'menu-trigger', 'focused', true);
    },
    'exposes named menu surfaces and submenu expanded state': async (context) => {
      const { requireDesktopFocus } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { expectMenuClosed, inWindowWith } = await import('./menu.wdio.ts');
      const { browser, expect } = context;
      await (
        await import('./menu.wdio.ts')
      ).openMenuFromKeyboard(context, {
        entry: 'menu-entry',
        trigger: 'menu-trigger',
        reason: 'menu-reason',
        focus: 'menu-focus',
        first: 'Cut',
      });
      await browser.keys('s');
      await browser.keys('\uE014');
      await expect(await browser.$('~menu-focus')).toHaveText('Email');
      // Inspecting another window moves key status, so semantics are read after the keyboard steps.
      expect(await (await browser.$('~menu-trigger')).getProperty('expanded')).toBe(true);
      await inWindowWith(context, 'menu-surface', async () => {
        const surface = await browser.$('~menu-surface');
        expect(await surface.getProperty('role')).toBe('menu');
        expect(await surface.getProperty('name')).toBe('Edit');
        expect(await (await browser.$('~menu-share')).getProperty('expanded')).toBe(true);
        expect(await (await browser.$('~menu-paste')).getProperty('enabled')).toBe(false);
      });
      await inWindowWith(context, 'menu-share-surface', async () => {
        const surface = await browser.$('~menu-share-surface');
        expect(await surface.getProperty('role')).toBe('menu');
        expect(await surface.getProperty('name')).toBe('Share');
      });
      await (await browser.$('~menu-trigger')).click();
      await expectMenuClosed(context, 'menu-trigger');
    },
    'opens from the pointer without a focused row and enters on Down': async (context) => {
      const { requireDesktopFocus } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { expectMenuClosed } = await import('./menu.wdio.ts');
      const { browser, expect } = context;
      await (await browser.$('~menu-trigger')).click();
      await expect(await browser.$('~menu-reason')).toHaveText('Opened: trigger');
      await browser.pause(300);
      expect(await (await browser.$('~menu-focus')).getText()).toBe('None');
      await browser.keys('\uE015');
      await expect(await browser.$('~menu-focus')).toHaveText('Cut');
      await (await browser.$('~menu-trigger')).click();
      await expect(await browser.$('~menu-reason')).toHaveText('Closed: trigger');
      await expectMenuClosed(context, 'menu-trigger');
    },
    'opens submenus on hover and closes the family when a nested row runs': async (context) => {
      const { requireDesktopFocus } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { expectMenuClosed, hover, inWindowWith } = await import('./menu.wdio.ts');
      const { browser, expect } = context;
      await (await browser.$('~menu-trigger')).click();
      await expect(await browser.$('~menu-reason')).toHaveText('Opened: trigger');
      await hover(context, 'menu-share');
      await hover(context, 'menu-more');
      await inWindowWith(context, 'menu-export', async () => {
        await (await browser.$('~menu-export')).click();
      });
      await expect(await browser.$('~menu-action')).toHaveText('Export');
      await expect(await browser.$('~menu-reason')).toHaveText('Closed: action');
      await expectMenuClosed(context, 'menu-trigger');
    },
  },
};

export const DisabledFocusable: Story = {
  args: { disabledFocusable: true },
  tags: ['desktop-focus'],
  parameters: {
    docs: { description: { story: 'Disabled rows stay discoverable as focus stops and refuse activation.' } },
  },
  wdio: {
    'keeps a disabled row focusable without running it': async (context) => {
      const { requireDesktopFocus } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (
        await import('./menu.wdio.ts')
      ).openMenuFromKeyboard(context, {
        entry: 'menu-entry',
        trigger: 'menu-trigger',
        reason: 'menu-reason',
        focus: 'menu-focus',
        first: 'Cut',
      });
      await browser.keys('\uE015');
      await browser.keys('\uE015');
      await expect(await browser.$('~menu-focus')).toHaveText('Paste');
      await browser.keys('\uE007');
      await browser.pause(300);
      expect(await (await browser.$('~menu-action')).getText()).toBe('None');
      expect(await (await browser.$('~menu-reason')).getText()).toBe('Opened: trigger');
      await browser.keys('\uE00C');
      await expect(await browser.$('~menu-reason')).toHaveText('Closed: dismiss');
    },
  },
};

const styles = StyleSheet.create({
  story: {
    alignItems: 'flex-start',
    gap: 16,
    padding: 24,
  },
});
