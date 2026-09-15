/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { Tab } from '../tab/tab';
import { TabList } from './tablist';
import type { TabKeyEvent, TabListProps } from './tablist.types';

const meta: Meta<typeof TabList> = {
  title: 'Components/TabList',
  component: TabList,
  args: {
    accessibilityLabel: 'Content sections',
    circularNavigation: true,
    disabled: false,
    orientation: 'horizontal',
    selectionFollowsFocus: true,
  },
  argTypes: {
    circularNavigation: { control: 'boolean' },
    disabled: { control: 'boolean' },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    selectionFollowsFocus: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Coordinates selection, accessibility set metadata, and roving keyboard focus for a bounded set of Tab children.',
      },
    },
  },
};

export default meta;

type Story = WdioStory<StoryObj<typeof TabList>>;

export const Default: Story = {
  args: {
    children: [
      <Tab controls="overview-panel" content="Overview" key="overview" value="overview" />,
      <Tab controls="activity-panel" content="Activity" key="activity" value="activity" />,
      <Tab controls="settings-panel" content="Settings" key="settings" value="settings" />,
    ],
    defaultSelectedValue: 'overview',
  },
};

function FocusManagementScene({ selectionFollowsFocus = true }: { selectionFollowsFocus?: boolean }) {
  const [selectedValue, setSelectedValue] = useState('focus-panel-one');
  const [selectionAtFocus, setSelectionAtFocus] = useState('none');
  const [ownerKey, setOwnerKey] = useState('none');
  const recordFocus = () => setSelectionAtFocus(selectedValue);
  const recordOwnerKey = (event: TabKeyEvent) => {
    const { key, ctrlKey, shiftKey } = event.nativeEvent ?? {};
    if (key === 'ArrowRight' && (ctrlKey || shiftKey)) {
      setOwnerKey(`${ctrlKey ? 'Control' : 'Shift'}+ArrowRight`);
    }
  };
  return (
    <View>
      <TabList
        accessibilityLabel="Focus navigation"
        selectedValue={selectedValue}
        onSelectionChange={setSelectedValue}
        onKeyDown={recordOwnerKey}
        selectionFollowsFocus={selectionFollowsFocus}
      >
        <Tab controls="focus-panel-one" content="One" onFocus={recordFocus} testID="focus-tab-one" />
        <Tab controls="focus-panel-disabled" content="Disabled" disabled testID="focus-tab-disabled" />
        <Tab controls="focus-panel-two" content="Two" onFocus={recordFocus} testID="focus-tab-two" />
      </TabList>
      <Text testID="focus-tab-selection">{selectedValue}</Text>
      <Text testID="focus-tab-selection-at-focus">{selectionAtFocus}</Text>
      <Text testID="focus-tab-owner-key">{ownerKey}</Text>
    </View>
  );
}

export const FocusManagement: Story = {
  render: () => <FocusManagementScene />,
  tags: ['desktop-focus'],
  wdio: {
    'commits selection before focus, skips disabled tabs, and supports wrap, Home, and End': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (await browser.$('~focus-tab-one')).click();
      await expectNativeState(browser, 'focus-tab-one', 'focused', true);
      await expect(await browser.$('~focus-tab-disabled')).not.toBeEnabled();
      for (const [key, id, value] of [
        ['\uE014', 'focus-tab-two', 'focus-panel-two'],
        ['\uE014', 'focus-tab-one', 'focus-panel-one'],
        ['\uE010', 'focus-tab-two', 'focus-panel-two'],
        ['\uE011', 'focus-tab-one', 'focus-panel-one'],
      ]) {
        await browser.keys(key);
        await expectNativeState(browser, id, 'focused', true);
        await expectNativeState(browser, id, 'selected', true);
        await expect(await browser.$('~focus-tab-selection')).toHaveText(value);
        await expect(await browser.$('~focus-tab-selection-at-focus')).toHaveText(value);
        await expectNativeState(browser, 'focus-tab-disabled', 'focused', false);
      }
    },
    'leaves modified navigation chords to their owner': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      for (const [modifier, name] of [
        ['\uE009', 'Control'],
        ['\uE008', 'Shift'],
      ]) {
        await (await browser.$('~focus-tab-one')).click();
        await expectNativeState(browser, 'focus-tab-one', 'focused', true);
        await browser.keys([modifier, '\uE014']);
        await expect(await browser.$('~focus-tab-owner-key')).toHaveText(`${name}+ArrowRight`);
        await expectNativeState(browser, 'focus-tab-one', 'selected', true);
        await expect(await browser.$('~focus-tab-selection')).toHaveText('focus-panel-one');
      }
    },
  },
};

export const ManualFocusManagement: Story = {
  render: () => <FocusManagementScene selectionFollowsFocus={false} />,
  tags: ['desktop-focus'],
  wdio: {
    'keeps manual selection independent until Enter activates the focused tab': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (await browser.$('~focus-tab-one')).click();
      await browser.keys('\uE014');
      await expectNativeState(browser, 'focus-tab-two', 'focused', true);
      await expectNativeState(browser, 'focus-tab-one', 'selected', true);
      await expectNativeState(browser, 'focus-tab-two', 'selected', false);
      await expect(await browser.$('~focus-tab-selection')).toHaveText('focus-panel-one');
      await browser.keys('\uE007');
      await expectNativeState(browser, 'focus-tab-two', 'selected', true);
      await expect(await browser.$('~focus-tab-selection')).toHaveText('focus-panel-two');
    },
  },
};

export const Controlled: Story = {
  render: (args: TabListProps) => {
    const ControlledExample = () => {
      const [selectedValue, setSelectedValue] = useState('overview');
      return (
        <View style={styles.story}>
          <TabList {...args} onSelectionChange={setSelectedValue} selectedValue={selectedValue}>
            <Tab controls="overview-panel" content="Overview" value="overview" />
            <Tab controls="activity-panel" content="Activity" value="activity" />
            <Tab controls="settings-panel" content="Settings" value="settings" />
          </TabList>
          <Text>{`Selected panel: ${selectedValue}`}</Text>
        </View>
      );
    };
    return <ControlledExample />;
  },
};

export const VerticalManualActivation: Story = {
  args: {
    children: [
      <Tab controls="profile-panel" content="Profile" key="profile" value="profile" />,
      <Tab controls="privacy-panel" content="Privacy" key="privacy" value="privacy" />,
      <Tab controls="notifications-panel" content="Notifications" key="notifications" value="notifications" />,
    ],
    defaultSelectedValue: 'profile',
    orientation: 'vertical',
    selectionFollowsFocus: false,
  },
};

export const WithDisabledTab: Story = {
  args: {
    children: [
      <Tab controls="overview-panel" content="Overview" key="overview" value="overview" />,
      <Tab controls="activity-panel" content="Activity" disabled key="activity" value="activity" />,
      <Tab controls="settings-panel" content="Settings" key="settings" value="settings" />,
    ],
    defaultSelectedValue: 'overview',
  },
};

const styles = StyleSheet.create({
  story: {
    alignItems: 'flex-start',
    gap: 12,
  },
});
