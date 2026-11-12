/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AccessibilityActionEvent, ViewProps } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { directComponent } from '@fluentui-react-native/framework-base';

import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { ListboxItem } from './listbox-item';
import { Input } from '../input/input';
import { Button } from '../button/button';

type StoryGroupProps = {
  children: ReactNode;
  label: string;
};

const StoryGroup = ({ children, label }: StoryGroupProps) => (
  <View style={styles.group}>
    <Text style={styles.groupLabel}>{label}</Text>
    <View style={styles.row}>{children}</View>
  </View>
);

const Avatar = directComponent<ViewProps>((props: ViewProps) => <View {...props} accessibilityHint="avatar" />);

const NativeToggleActionFixture = () => {
  const [actions, setActions] = useState<string[]>([]);
  const [presses, setPresses] = useState(0);
  const [disabledActions, setDisabledActions] = useState(0);
  const [disabledPresses, setDisabledPresses] = useState(0);
  return (
    <View style={styles.story}>
      <ListboxItem
        content="Controlled selected option"
        selected
        onAccessibilityAction={(event: AccessibilityActionEvent) => {
          const actionName = event.nativeEvent.actionName;
          setActions((previous) => [...previous, actionName]);
        }}
        onPress={() => setPresses((previous) => previous + 1)}
        testID="listbox-toggle-option"
      />
      <StoryStatus testID="listbox-toggle-actions">{`${actions.length}:${actions.join(',') || 'none'}`}</StoryStatus>
      <StoryStatus testID="listbox-toggle-presses">{String(presses)}</StoryStatus>
      <ListboxItem
        content="Disabled controlled selected option"
        selected
        disabled
        onAccessibilityAction={() => setDisabledActions((previous) => previous + 1)}
        onPress={() => setDisabledPresses((previous) => previous + 1)}
        testID="listbox-toggle-disabled"
      />
      <StoryStatus testID="listbox-toggle-disabled-actions">{String(disabledActions)}</StoryStatus>
      <StoryStatus testID="listbox-toggle-disabled-presses">{String(disabledPresses)}</StoryStatus>
    </View>
  );
};

const meta: Meta<typeof ListboxItem> = {
  title: 'Components/ListboxItem',
  component: ListboxItem,
  args: {
    content: 'Listbox item',
    secondaryContent: 'Secondary',
    secondaryContentPosition: 'right',
    testID: 'agentic-storybook-listbox-item',
    variant: 'listItem',
  },
  parameters: {
    docs: {
      description: {
        component:
          'ListboxItem is a selectable row for Dropdown-style overlays. It supports Right/Under secondary content, selected and multiselect visuals, and non-interactive section headers.',
      },
    },
  },
};

export default meta;

type Story = WdioStory<StoryObj<typeof ListboxItem>>;

export const Default: Story = {};

function StandaloneKeyboardScene() {
  const [presses, setPresses] = useState(0);
  return (
    <View style={styles.story}>
      <Input accessibilityLabel="Option entry" testID="listbox-keyboard-entry" />
      <ListboxItem
        content="Standalone option"
        selected={false}
        secondaryContent={null}
        testID="listbox-keyboard-option"
        onPress={() => setPresses((value) => value + 1)}
      />
      <ListboxItem content="Section" variant="sectionHeader" testID="listbox-keyboard-header" />
      <ListboxItem content="Unavailable option" disabled testID="listbox-keyboard-disabled" />
      <Button content="After option" testID="listbox-keyboard-after" />
      <StoryStatus testID="listbox-keyboard-presses">{String(presses)}</StoryStatus>
    </View>
  );
}

export const StandaloneKeyboard: Story = {
  render: () => <StandaloneKeyboardScene />,
  tags: ['desktop-focus'],
  wdio: [
    desktopIt(
      'LBI-003 LBI-005 activates a standalone row once per key and skips headers and disabled rows in both Tab directions',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        const { expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        await focusByTab(browser, 'listbox-keyboard-entry', 'listbox-keyboard-option');
        const option = await browser.$('~listbox-keyboard-option');
        expect(await option.getTagName()).toBe('button');
        expect(await option.getProperty('name')).toBe('Standalone option');
        await browser.keys('\uE007');
        await expect(await browser.$('~listbox-keyboard-presses')).toHaveText('1');
        await browser.keys('\uE00D');
        await expect(await browser.$('~listbox-keyboard-presses')).toHaveText('2');
        await expectNativeState(browser, 'listbox-keyboard-option', 'focused', true);
        await browser.keys('\uE004');
        await expectNativeState(browser, 'listbox-keyboard-after', 'focused', true);
        await browser.keys(['\uE008', '\uE004']);
        await expectNativeState(browser, 'listbox-keyboard-option', 'focused', true);
        await expect(await browser.$('~listbox-keyboard-presses')).toHaveText('2');
      },
    ),
  ],
};

export const NativeSelection: Story = {
  render: () => (
    <View style={styles.story}>
      <ListboxItem content="Unselected option" selected={false} testID="listbox-fix-unselected" />
      <ListboxItem content="Selected option" selected testID="listbox-fix-selected" />
      <ListboxItem content="Disabled selected option" selected disabled testID="listbox-fix-disabled" />
    </View>
  ),
  wdio: [
    desktopIt('LBI-005 standalone unselected exposes an enabled native button', async ({ browser, expect }) => {
      const option = await browser.$('~listbox-fix-unselected');
      expect(await option.getTagName()).toBe('button');
      await expect(option).toBeEnabled();
    }),
    desktopIt('LBI-005 standalone selected exposes an enabled native button', async ({ browser, expect }) => {
      const option = await browser.$('~listbox-fix-selected');
      expect(await option.getTagName()).toBe('button');
      await expect(option).toBeEnabled();
    }),
    desktopIt('LBI-005 standalone disabled selection exposes a disabled native button', async ({ browser, expect }) => {
      const option = await browser.$('~listbox-fix-disabled');
      expect(await option.getTagName()).toBe('button');
      await expect(option).toBeDisabled();
    }),
    desktopIt(
      'LBI-005 Windows native checked projection reflects standalone selection including disabled',
      {
        unsupported: {
          platforms: ['macos'],
          reason:
            'Native checked projection is unsupported for the retained macOS AXButton role (C-A11Y-005); shared role and enabled-state checks run separately.',
        },
      },
      async ({ browser, expect }) => {
        expect(await (await browser.$('~listbox-fix-unselected')).getProperty('checked')).toBe(false);
        expect(await (await browser.$('~listbox-fix-selected')).getProperty('checked')).toBe(true);
        expect(await (await browser.$('~listbox-fix-disabled')).getProperty('checked')).toBe(true);
      },
    ),
  ],
};

export const NativeToggleActions: Story = {
  render: () => <NativeToggleActionFixture />,
  parameters: {
    docs: {
      description: {
        story:
          'Native accessibility activation records the original action and press callbacks separately. The owner deliberately keeps selection fixed; disabled activation must not call either handler.',
      },
    },
  },
  wdio: [
    desktopIt(
      'LBI-005 Win32 native Toggle forwards once without a press or controlled selection change',
      { requires: ['accessibility-click'], platforms: ['win32'] },
      async ({ browser, expect }) => {
        expect(browser.capabilities['furn:clickMode']).toBe('accessibility');
        const option = await browser.$('~listbox-toggle-option');
        const actions = await browser.$('~listbox-toggle-actions');
        const presses = await browser.$('~listbox-toggle-presses');
        expect(await option.getProperty('checked')).toBe(true);
        await expect(actions).toHaveAttribute('name', '0:none');
        await expect(presses).toHaveAttribute('name', '0');
        await option.click();
        await expect(actions).toHaveAttribute('name', '1:Toggle');
        expect(await option.getProperty('checked')).toBe(true);
        await expect(presses).toHaveAttribute('name', '0');
        await expect(actions).toHaveAttribute('name', '1:Toggle');
      },
    ),
    desktopIt(
      'LBI-003 LBI-005 Win32 disabled native activation has no callbacks or selection change',
      { requires: ['accessibility-click'], platforms: ['win32'] },
      async ({ browser, expect }) => {
        expect(browser.capabilities['furn:clickMode']).toBe('accessibility');
        const option = await browser.$('~listbox-toggle-disabled');
        const actions = await browser.$('~listbox-toggle-disabled-actions');
        const presses = await browser.$('~listbox-toggle-disabled-presses');
        await expect(option).toBeDisabled();
        expect(await option.getProperty('checked')).toBe(true);
        await expect(actions).toHaveAttribute('name', '0');
        await expect(presses).toHaveAttribute('name', '0');
        // The public protocol command avoids WDIO's DOM-based element-error recovery.
        await expect(browser.elementClick(await option.elementId)).rejects.toThrow('cannot be clicked');
        expect(await option.getProperty('checked')).toBe(true);
        await expect(actions).toHaveAttribute('name', '0');
        await expect(presses).toHaveAttribute('name', '0');
      },
    ),
  ],
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Style">
        <ListboxItem content="Option" />
        <ListboxItem content="Selected" selected />
        <ListboxItem content="Section header" variant="sectionHeader" />
      </StoryGroup>
      <StoryGroup label="Layout">
        <ListboxItem content="Right secondary" secondaryContent="Metadata" />
        <ListboxItem content="Under secondary" secondaryContent="Longer metadata line" secondaryContentPosition="under" />
      </StoryGroup>
      <StoryGroup label="Indicators">
        <ListboxItem content="Chevron" chevron />
        <ListboxItem content="Checkmark" checkmark selected />
        <ListboxItem content="Multiselect" multiselect selected />
      </StoryGroup>
      <StoryGroup label="Custom">
        <ListboxItem content="Avatar" avatar={{ as: Avatar }} />
        <ListboxItem content="Icon swap" selected />
      </StoryGroup>
    </View>
  ),
};

export const ExternallyDrivenSelection: Story = {
  render: () => {
    const options = ['Ascending', 'Descending'];
    const Listbox = () => {
      const [choice, setChoice] = useState('Ascending');
      return (
        <StoryGroup label={`Sort: ${choice}`}>
          {options.map((option) => (
            <ListboxItem
              key={option}
              content={option}
              onPress={() => setChoice(option)}
              secondaryContent={null}
              selected={choice === option}
            />
          ))}
        </StoryGroup>
      );
    };
    return <Listbox />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'A single-selection listbox owns the chosen value. Each option renders the selected value it is given and reports presses through onPress, so the listbox is what clears the previous choice.',
      },
    },
  },
};

const styles = StyleSheet.create({
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    alignItems: 'flex-start',
    gap: 8,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
