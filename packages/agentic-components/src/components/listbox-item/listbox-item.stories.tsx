/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewProps } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import { directComponent } from '@fluentui-react-native/framework-base';

import { ListboxItem } from './listbox-item';

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

const Avatar = directComponent<ViewProps>((props) => <View {...props} accessibilityHint="avatar" />);

const meta: Meta<typeof ListboxItem> = {
  title: 'Components/ListboxItem',
  component: ListboxItem,
  args: {
    content: 'Listbox item',
    secondaryContent: 'Secondary',
    secondaryContentPosition: 'right',
    variant: 'listItem',
  },
  parameters: {
    docs: {
      description: {
        component: 'ListboxItem is a selectable row for Dropdown-style overlays. It supports Right/Under secondary content, selected and multiselect visuals, and non-interactive section headers.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ListboxItem>;

export const Default: Story = {};

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
