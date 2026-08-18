/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { DisclosureGroup } from './DisclosureGroup';

const meta: Meta<typeof DisclosureGroup> = {
  title: 'Native/macOS/DisclosureGroup',
  component: DisclosureGroup,
  args: {
    label: 'Advanced settings',
    defaultExpanded: false,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        component: "A thin container wrapper around SwiftUI's `DisclosureGroup`.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DisclosureGroup>;

export const Default: Story = {
  render: (args) => {
    const [expanded, setExpanded] = useState(args.expanded ?? args.defaultExpanded ?? false);

    return (
      <DisclosureGroup {...args} expanded={expanded} onExpandedChange={setExpanded} style={styles.group}>
        <View style={styles.content}>
          <Text>Notifications</Text>
          <Text>Automatic updates</Text>
          <Text>Usage diagnostics</Text>
        </View>
      </DisclosureGroup>
    );
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.overview}>
      <DisclosureGroup label="Collapsed" style={styles.group}>
        <View style={styles.content}>
          <Text>This content starts collapsed.</Text>
        </View>
      </DisclosureGroup>
      <DisclosureGroup defaultExpanded label="Expanded" style={styles.group}>
        <View style={styles.content}>
          <Text>This content starts expanded.</Text>
        </View>
      </DisclosureGroup>
      <DisclosureGroup disabled label="Disabled" style={styles.group}>
        <View style={styles.content}>
          <Text>This content cannot be revealed.</Text>
        </View>
      </DisclosureGroup>
    </View>
  ),
};

const styles = StyleSheet.create({
  content: {
    gap: 6,
    height: 76,
    paddingStart: 20,
    paddingTop: 8,
    width: 280,
  },
  group: {
    height: 112,
    width: 320,
  },
  overview: {
    gap: 12,
  },
});
