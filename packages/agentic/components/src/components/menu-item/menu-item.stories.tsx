/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AccessibilityActionEvent } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { FocusZone } from '@fluentui-react-native/native-core/legacy';

import { MenuItem } from './menu-item';
import { Input } from '../input/input';
import { Button } from '../button/button';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';

type StoryGroupProps = {
  children: ReactNode;
  label: string;
};

const StoryGroup = ({ children, label }: StoryGroupProps) => (
  <View style={styles.group}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.row}>{children}</View>
  </View>
);

const meta: Meta<typeof MenuItem> = {
  title: 'Components/MenuItem',
  component: MenuItem,
  args: {
    content: 'Menu item',
    secondaryContent: 'Secondary',
    secondaryContentPosition: 'right',
    selected: false,
    menuStyle: 'list-item',
    testID: 'agentic-storybook-menu-item',
  },
  argTypes: {
    secondaryContentPosition: { control: 'select', options: ['right', 'under'] },
    selected: { control: 'boolean' },
    menuStyle: { control: 'select', options: ['list-item', 'section-header'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'MenuItem is an interactive row inside a menu surface. It supports selected, checkmark, multiselect, icon, avatar, chevron, and secondary-content layouts.',
      },
    },
  },
};

export default meta;

type Story = WdioStory<StoryObj<typeof MenuItem>>;

export const Default: Story = {};

export const NativeIndicatorSemantics: Story = {
  render: () => {
    const Scene = () => {
      const [actions, setActions] = useState(0);
      const [presses, setPresses] = useState(0);
      const [lastAction, setLastAction] = useState('none');
      const recordAction = (event: AccessibilityActionEvent) => {
        setLastAction(event.nativeEvent.actionName);
        setActions((value) => value + 1);
      };
      return (
        <View style={styles.story}>
          <MenuItem content="Single choice off" hasCheckmark selected={false} testID="menu-item-native-single-off" />
          <MenuItem content="Single choice on" hasCheckmark selected testID="menu-item-native-single-on" />
          <MenuItem
            content="Multiple choice off"
            hasMultiselect
            selected={false}
            testID="menu-item-native-multi-off"
            onAccessibilityAction={recordAction}
            onPress={() => setPresses((value) => value + 1)}
          />
          <MenuItem content="Multiple choice on" hasMultiselect selected testID="menu-item-native-multi-on" />
          <MenuItem
            content="Disabled choice"
            hasMultiselect
            selected
            disabled
            testID="menu-item-native-disabled"
            onAccessibilityAction={recordAction}
            onPress={() => setPresses((value) => value + 1)}
          />
          <StoryStatus testID="menu-item-native-actions">{String(actions)}</StoryStatus>
          <StoryStatus testID="menu-item-native-presses">{String(presses)}</StoryStatus>
          <StoryStatus testID="menu-item-native-last-action">{lastAction}</StoryStatus>
        </View>
      );
    };
    return <Scene />;
  },
  wdio: {
    'MNI-003 Win32 exposes checked native indicator roles, names and availability': async ({ browser, expect, platform, skip }) => {
      if (platform !== 'win32') {
        skip('This case qualifies Win32 UI Automation indicator-state projection.');
        return;
      }
      for (const [id, name, checked] of [
        ['menu-item-native-single-off', 'Single choice off', false],
        ['menu-item-native-single-on', 'Single choice on', true],
        ['menu-item-native-multi-off', 'Multiple choice off', false],
        ['menu-item-native-multi-on', 'Multiple choice on', true],
        ['menu-item-native-disabled', 'Disabled choice', true],
      ] as const) {
        const row = await browser.$(`~${id}`);
        expect(await row.getTagName()).toBe('menuitem');
        expect(await row.getProperty('name')).toBe(name);
        expect(await row.getProperty('checked')).toBe(checked);
      }
      expect(await (await browser.$('~menu-item-native-single-off')).getProperty('selected')).toBe(false);
      expect(await (await browser.$('~menu-item-native-single-on')).getProperty('selected')).toBe(true);
      await expect(await browser.$('~menu-item-native-disabled')).toBeDisabled();
    },
    'MNI-003 Win32 Toggle forwards once without changing selection or pressing and disabled public activation rejects': async ({
      browser,
      expect,
      platform,
      skip,
    }) => {
      if (platform !== 'win32') {
        skip('This case qualifies Win32 UI Automation Toggle transport.');
        return;
      }
      const row = await browser.$('~menu-item-native-multi-off');
      const disabled = await browser.$('~menu-item-native-disabled');
      const actions = await browser.$('~menu-item-native-actions');
      const presses = await browser.$('~menu-item-native-presses');
      await expect(actions).toHaveAttribute('name', '0');
      await row.click();
      await expect(actions).toHaveAttribute('name', '1');
      await expect(await browser.$('~menu-item-native-last-action')).toHaveAttribute('name', 'Toggle');
      await expect(presses).toHaveAttribute('name', '0');
      expect(await row.getProperty('checked')).toBe(false);
      let rejection: unknown;
      try {
        await disabled.click();
      } catch (error) {
        rejection = error;
      }
      expect(rejection).toBeDefined();
      await expect(actions).toHaveAttribute('name', '1');
      await expect(presses).toHaveAttribute('name', '0');
      expect(await disabled.getProperty('checked')).toBe(true);
    },
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Style">
        <MenuItem content="List item" />
        <MenuItem content="Section header" menuStyle="section-header" />
      </StoryGroup>
      <StoryGroup label="Selection">
        <MenuItem content="Not selected" />
        <MenuItem content="Selected" selected />
        <MenuItem hasCheckmark content="Checked" selected />
        <MenuItem content="Multi-select" hasMultiselect selected />
      </StoryGroup>
      <StoryGroup label="Secondary content">
        <MenuItem content="Right" secondaryContent="Meta" secondaryContentPosition="right" />
        <MenuItem content="Under" secondaryContent="Description" secondaryContentPosition="under" />
      </StoryGroup>
    </View>
  ),
};

export const SectionHeader: Story = {
  args: {
    content: 'Group',
    menuStyle: 'section-header',
  },
};

export const Selected: Story = {
  args: {
    content: 'Favorite',
    selected: true,
  },
};

export const Checkmark: Story = {
  args: {
    hasCheckmark: true,
    content: 'Single select',
    selected: true,
  },
};

export const Multiselect: Story = {
  args: {
    content: 'Multi select',
    hasMultiselect: true,
    selected: true,
  },
};

export const ExternallyDrivenSelection: Story = {
  render: () => {
    const options = ['Compact', 'Comfortable', 'Spacious'];
    const Menu = () => {
      const [choice, setChoice] = useState('Comfortable');
      return (
        <StoryGroup label={`Density: ${choice}`}>
          {options.map((option) => (
            <MenuItem
              key={option}
              content={option}
              hasCheckmark
              onPress={() => setChoice(option)}
              secondaryContent={null}
              selected={choice === option}
            />
          ))}
        </StoryGroup>
      );
    };
    return <Menu />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'A menu owns which command is active. Each checkmark item renders the selected value it is given and reports presses through onPress, so the menu is what clears the previous choice.',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    content: 'Loading group',
    loading: true,
    menuStyle: 'section-header',
  },
};

function DisabledFocusableScene() {
  const [count, setCount] = useState(0);
  const [disabled, setDisabled] = useState(true);
  return (
    <View style={styles.story}>
      <Input accessibilityLabel="Menu focus entry" testID="disabled-menu-entry" />
      <FocusZone focusZoneDirection="vertical" isCircularNavigation>
        <MenuItem content="Before disabled command" secondaryContent={null} testID="disabled-menu-before" />
        <MenuItem
          content="Unavailable command"
          secondaryContent={null}
          disabled={disabled}
          disabledFocusable
          testID="disabled-menu-command"
          onPress={() => setCount((value) => value + 1)}
        />
        <MenuItem content="After disabled command" secondaryContent={null} testID="disabled-menu-after" />
      </FocusZone>
      <Button content="Toggle command availability" testID="disabled-menu-toggle" onPress={() => setDisabled((value) => !value)} />
      <StoryStatus testID="disabled-menu-count">{String(count)}</StoryStatus>
    </View>
  );
}

export const DisabledFocusable: Story = {
  render: () => <DisabledFocusableScene />,
  tags: ['desktop-focus'],
  parameters: {
    docs: { description: { story: 'An opted-in disabled row remains a focus stop, announces disabled, and cannot activate.' } },
  },
  wdio: {
    'exposes disabled native menu-item semantics': async ({ browser, expect }) => {
      const row = await browser.$('~disabled-menu-command');
      expect(await row.getTagName()).toBe('menuitem');
      await expect(row).toBeDisabled();
      await expect(await browser.$('~disabled-menu-count')).toHaveText('0');
    },
    'navigates onto a disabled row without activating it': async (context) => {
      const { requireDesktopFocus, expectNativeState, focusByTab, clickPhysical } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await focusByTab(browser, 'disabled-menu-entry', 'disabled-menu-before');
      await browser.keys('\uE015');
      await expectNativeState(browser, 'disabled-menu-command', 'focused', true);
      await expect(await browser.$('~disabled-menu-command')).toBeDisabled();
      await browser.keys('\uE007');
      await browser.keys('\uE00D');
      await clickPhysical(browser, 'disabled-menu-command');
      await expect(await browser.$('~disabled-menu-count')).toHaveText('0');
      await expectNativeState(browser, 'disabled-menu-command', 'focused', true);
      await browser.keys('\uE015');
      await expectNativeState(browser, 'disabled-menu-after', 'focused', true);
    },
    'updates native disabled state without replacing the command': async ({ browser, expect, skip }) => {
      if (!browser.capabilities['furn:features']?.physicalClick) {
        skip('Changing availability requires physical pointer input.');
        return;
      }
      const row = await browser.$('~disabled-menu-command');
      const { clickPhysical } = await import('../../common/desktopFocus.wdio.ts');
      await expect(row).toBeDisabled();
      await (await browser.$('~disabled-menu-toggle')).click();
      await expect(row).toBeEnabled();
      expect(await row.getTagName()).toBe('menuitem');
      await clickPhysical(browser, 'disabled-menu-command');
      await expect(await browser.$('~disabled-menu-count')).toHaveText('1');
      await (await browser.$('~disabled-menu-toggle')).click();
      await expect(row).toBeDisabled();
      await clickPhysical(browser, 'disabled-menu-command');
      await expect(await browser.$('~disabled-menu-count')).toHaveText('1');
    },
  },
};

const styles = StyleSheet.create({
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    flexWrap: 'wrap',
    gap: 12,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
