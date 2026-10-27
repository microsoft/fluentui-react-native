/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Button } from '../button/button';
import { Input } from '../input/input';
import type { ButtonAppearance, ButtonSize } from '../button/button.types';
import { Divider } from '../divider/divider';
import { MenuItem } from '../menu-item/menu-item';
import type { MenuItemProps } from '../menu-item/menu-item.types';
import type { MenuOpenChangeData } from '../menu/menu.types';
import { MenuButton } from './menu-button';

type SceneProps = { appearance?: ButtonAppearance; size?: ButtonSize; disabled?: boolean };

function NewScene({ appearance, size, disabled }: SceneProps) {
  const [reason, setReason] = React.useState('None');
  const [action, setAction] = React.useState('None');
  const [focus, setFocus] = React.useState('None');
  const row = (content: string): MenuItemProps => ({
    content,
    secondaryContent: null,
    icon: null,
    testID: `menu-button-${content.toLowerCase()}`,
    onFocus: () => setFocus(content),
    onPress: () => setAction(content),
  });
  return (
    <View style={styles.story}>
      <View style={styles.toolbar}>
        <Input accessibilityLabel="Menu button entry" testID="menu-button-entry" style={styles.entry} onFocus={() => setFocus('Entry')} />
        <MenuButton
          appearance={appearance}
          size={size}
          disabled={disabled}
          content="New"
          testID="menu-button-trigger"
          menu={{ testID: 'menu-button-menu' }}
          onFocus={() => setFocus('Trigger')}
          onOpenChange={(open: boolean, { reason: cause }: MenuOpenChangeData) => setReason(`${open ? 'Opened' : 'Closed'}: ${cause}`)}
        >
          <MenuItem {...row('Message')} />
          <MenuItem {...row('Event')} />
          <Divider label={null} />
          <MenuItem {...row('Folder')} />
        </MenuButton>
        <Button content="After" testID="menu-button-after" onFocus={() => setFocus('After')} />
      </View>
      <StoryStatus testID="menu-button-reason">{reason}</StoryStatus>
      <StoryStatus testID="menu-button-action">{action}</StoryStatus>
      <StoryStatus testID="menu-button-focus">{focus}</StoryStatus>
    </View>
  );
}

function VariantsScene() {
  const appearances: ButtonAppearance[] = ['primary', 'secondary', 'outline', 'subtle'];
  const sizes: ButtonSize[] = ['small', 'medium', 'large'];
  return (
    <View style={styles.story}>
      {sizes.map((size) => (
        <View key={size} style={styles.toolbar}>
          {appearances.map((appearance) => (
            <MenuButton key={appearance} appearance={appearance} size={size} content={`${appearance} ${size}`}>
              <MenuItem content="Action" secondaryContent={null} icon={null} />
            </MenuButton>
          ))}
          <MenuButton size={size} icon={{ fontSource: { codepoint: 0x002b } }} accessibilityLabel={`Add ${size}`}>
            <MenuItem content="Action" secondaryContent={null} icon={null} />
          </MenuButton>
        </View>
      ))}
    </View>
  );
}

const meta: Meta<SceneProps> = {
  title: 'Components/MenuButton',
  render: (args) => <NewScene {...args} />,
  args: { appearance: 'secondary', size: 'medium', disabled: false },
  argTypes: {
    appearance: { control: 'select', options: ['primary', 'secondary', 'outline', 'subtle'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'MenuButton is a Button-styled trigger with a down chevron that opens a menu of actions below it. Tab leaves the menu past the trigger.',
      },
    },
  },
};

export default meta;

type Story = WdioStory<StoryObj<SceneProps>>;
export const Default: Story = {
  tags: ['desktop-focus'],
  wdio: {
    'MNB-006 exposes a named, collapsed native button before input': async ({ browser, expect }) => {
      const trigger = await browser.$('~menu-button-trigger');
      expect(await trigger.getProperty('role')).toBe('button');
      expect(await trigger.getProperty('name')).toBe('New');
      expect(await trigger.getProperty('expanded')).toBe(false);
      await expect(trigger).toBeEnabled();
    },
    'opens on Down to the first row and on Up to the last row': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { inWindowWith } = await import('../menu/menu.wdio.ts');
      const { browser, expect } = context;
      await (await import('../../common/desktopFocus.wdio.ts')).focusByTab(context.browser, 'menu-button-entry', 'menu-button-trigger');
      expect(await (await browser.$('~menu-button-trigger')).getProperty('role')).toBe('button');
      await browser.keys('\uE015');
      await expect(await browser.$('~menu-button-focus')).toHaveText('Message');
      expect(await (await browser.$('~menu-button-trigger')).getProperty('expanded')).toBe(true);
      await browser.keys('\uE00C');
      await expect(await browser.$('~menu-button-reason')).toHaveText('Closed: dismiss');
      await expectNativeState(browser, 'menu-button-trigger', 'focused', true);
      await browser.keys('\uE013');
      await expect(await browser.$('~menu-button-focus')).toHaveText('Folder');
      await browser.keys('\uE007');
      await expect(await browser.$('~menu-button-action')).toHaveText('Folder');
      await expectNativeState(browser, 'menu-button-trigger', 'focused', true);
      await browser.keys('\uE015');
      await expect(await browser.$('~menu-button-focus')).toHaveText('Message');
      await inWindowWith(context, 'menu-button-menu', async () => {
        expect(await (await browser.$('~menu-button-menu')).getProperty('role')).toBe('menu');
        expect(await (await browser.$('~menu-button-menu')).getProperty('name')).toBe('New');
      });
    },
    'closes on Tab and moves focus past the trigger': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { expectMenuClosed } = await import('../menu/menu.wdio.ts');
      const { browser, expect } = context;
      await (await import('../../common/desktopFocus.wdio.ts')).focusByTab(context.browser, 'menu-button-entry', 'menu-button-trigger');
      await browser.keys('\uE007');
      await expect(await browser.$('~menu-button-focus')).toHaveText('Message');
      await browser.keys('\uE004');
      await expect(await browser.$('~menu-button-reason')).toHaveText('Closed: dismiss');
      // The Win32 host cannot continue Tab past its owner, so focus returns to the trigger there.
      await expectNativeState(browser, context.platform === 'win32' ? 'menu-button-trigger' : 'menu-button-after', 'focused', true);
      await expectMenuClosed(context, 'menu-button-trigger');
    },
    'closes on Shift+Tab and returns focus to the trigger': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (await import('../../common/desktopFocus.wdio.ts')).focusByTab(context.browser, 'menu-button-entry', 'menu-button-trigger');
      await browser.keys('\uE015');
      await expect(await browser.$('~menu-button-focus')).toHaveText('Message');
      await browser.keys(['\uE008', '\uE004']);
      await expect(await browser.$('~menu-button-reason')).toHaveText('Closed: dismiss');
      await expectNativeState(browser, 'menu-button-trigger', 'focused', true);
    },
    'toggles from the pointer without reopening': async (context) => {
      const { requireDesktopFocus } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { expectMenuClosed } = await import('../menu/menu.wdio.ts');
      const { browser, expect } = context;
      const trigger = await browser.$('~menu-button-trigger');
      await trigger.click();
      await expect(await browser.$('~menu-button-reason')).toHaveText('Opened: trigger');
      await trigger.click();
      await expect(await browser.$('~menu-button-reason')).toHaveText('Closed: trigger');
      await expectMenuClosed(context, 'menu-button-trigger');
    },
  },
};

export const Variants: Story = {
  render: () => <VariantsScene />,
  parameters: {
    docs: { description: { story: 'Every appearance and size, with a label and with only a leading icon.' } },
  },
};

export const AccessibleNames: Story = {
  render: () => (
    <View style={styles.story}>
      <MenuButton content={{ children: 'Create' }} testID="menu-button-slot-name">
        <MenuItem content="Message" />
      </MenuButton>
      <MenuButton content={0} testID="menu-button-numeric-name">
        <MenuItem content="Message" />
      </MenuButton>
      <MenuButton content="New" accessibilityLabel="Create document" testID="menu-button-explicit-name">
        <MenuItem content="Message" />
      </MenuButton>
      <MenuButton content="New" aria-label="More actions" testID="menu-button-alias-name">
        <MenuItem content="Message" />
      </MenuButton>
    </View>
  ),
  wdio: {
    'MNB-006 exposes slot, numeric and explicit native names without input': async ({ browser, expect }) => {
      expect(await (await browser.$('~menu-button-slot-name')).getProperty('name')).toBe('Create');
      expect(await (await browser.$('~menu-button-numeric-name')).getProperty('name')).toBe('0');
      expect(await (await browser.$('~menu-button-explicit-name')).getProperty('name')).toBe('Create document');
      expect(await (await browser.$('~menu-button-alias-name')).getProperty('name')).toBe('More actions');
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Plain labels name the native trigger directly. Explicit accessibility names override the visible label.',
      },
    },
  },
};

const styles = StyleSheet.create({
  story: {
    alignItems: 'flex-start',
    gap: 16,
    padding: 24,
  },
  // An empty text input has no intrinsic width on Win32.
  entry: {
    width: 160,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
