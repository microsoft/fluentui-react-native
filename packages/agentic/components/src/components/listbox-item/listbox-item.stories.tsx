/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewProps } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
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

const Avatar = directComponent<ViewProps>((props: ViewProps) => <View {...props} accessibilityHint="avatar" />);

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

export const NativeSelection: Story = {
  render: () => (
    <View style={styles.story}>
      <ListboxItem content="Unselected option" selected={false} testID="listbox-fix-unselected" />
      <ListboxItem content="Selected option" selected testID="listbox-fix-selected" />
      <ListboxItem content="Disabled selected option" selected disabled testID="listbox-fix-disabled" />
    </View>
  ),
  wdio: {
    'LBI-005 standalone unselected exposes native checked false': async ({ browser, expect }) => {
      const option = await browser.$('~listbox-fix-unselected');
      expect(await option.getTagName()).toBe('button');
      await expect(option).toBeEnabled();
      expect(await option.getProperty('checked')).toBe(false);
    },
    'LBI-005 standalone selected exposes native checked true': async ({ browser, expect }) => {
      const option = await browser.$('~listbox-fix-selected');
      expect(await option.getTagName()).toBe('button');
      await expect(option).toBeEnabled();
      expect(await option.getProperty('checked')).toBe(true);
    },
    'LBI-005 standalone disabled retains native checked true': async ({ browser, expect }) => {
      const option = await browser.$('~listbox-fix-disabled');
      expect(await option.getTagName()).toBe('button');
      await expect(option).toBeDisabled();
      expect(await option.getProperty('checked')).toBe(true);
    },
  },
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
