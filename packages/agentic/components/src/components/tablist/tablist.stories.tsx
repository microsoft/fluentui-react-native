/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Tab } from '../tab/tab';
import { TabList } from './tablist';

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

type Story = StoryObj<typeof TabList>;

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

export const Controlled: Story = {
  render: (args) => {
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
