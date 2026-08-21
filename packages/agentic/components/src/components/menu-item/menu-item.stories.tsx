/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { MenuItem } from './menu-item';

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

type Story = StoryObj<typeof MenuItem>;

export const Default: Story = {};

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
