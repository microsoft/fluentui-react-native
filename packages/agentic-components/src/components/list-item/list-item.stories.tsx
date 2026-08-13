/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Button } from '../button/button';
import { ListItem } from './list-item';
import type { ListItemSecondaryContentPosition, ListItemSelectionMode, ListItemSize } from './list-item.types';

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

const sizes: readonly { label: string; value: ListItemSize }[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const selectionModes: readonly { label: string; value: ListItemSelectionMode }[] = [
  { label: 'None', value: 'none' },
  { label: 'Single', value: 'single' },
  { label: 'Multiple', value: 'multiple' },
];

const positions: readonly { label: string; value: ListItemSecondaryContentPosition }[] = [
  { label: 'Right', value: 'right' },
  { label: 'Under', value: 'under' },
];

const regularStarIcon = { fontSource: { codepoint: 0x2606, fontFamily: 'Arial' } } as const;
const filledStarIcon = { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } } as const;
const folderIcon = { fontSource: { codepoint: 0x1f5c1, fontFamily: 'Arial' } } as const;

const meta: Meta<typeof ListItem> = {
  title: 'Components/ListItem',
  component: ListItem,
  args: {
    content: 'List item',
    disabled: false,
    secondaryContent: 'Secondary',
    secondaryContentPosition: 'right',
    selected: false,
    selectionMode: 'none',
    size: 'medium',
  },
  argTypes: {
    secondaryContentPosition: { control: 'select', options: positions.map(({ value }) => value) },
    selected: { control: 'boolean' },
    selectionMode: { control: 'select', options: selectionModes.map(({ value }) => value) },
    size: { control: 'select', options: sizes.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'ListItem is one row in a List. It owns its row anatomy, selection presentation, and row-level visual states while the parent List owns collection navigation.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ListItem>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Size">
        {sizes.map(({ label, value }) => (
          <ListItem key={value} content={label} size={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Selection mode">
        {selectionModes.map(({ label, value }) => (
          <ListItem key={value} content={label} selectionMode={value} selected={value !== 'none'} />
        ))}
      </StoryGroup>
      <StoryGroup label="Secondary position">
        {positions.map(({ label, value }) => (
          <ListItem key={value} content={label} secondaryContent="Metadata" secondaryContentPosition={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Leading content">
        <ListItem content="Icon row" icon={folderIcon} />
        <ListItem content="Avatar row" avatar={{ children: <View style={styles.avatar}><Text style={styles.avatarLabel}>A</Text></View> }} />
      </StoryGroup>
      <StoryGroup label="Selection">
        <ListItem content="Not selected" icon={regularStarIcon} selected={false} selectedIcon={filledStarIcon} selectionMode="single" />
        <ListItem content="Selected" icon={regularStarIcon} selected selectedIcon={filledStarIcon} selectionMode="single" />
      </StoryGroup>
      <StoryGroup label="Trailing actions">
        <ListItem
          content="With actions"
          trailing={{
            children: (
              <>
                <Button accessibilityLabel="Edit" content="Edit" />
                <Button accessibilityLabel="More options" content="More" />
              </>
            ),
          }}
        />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the main size, selection, leading content, and trailing action axes.',
      },
    },
  },
};

export const SecondaryPosition: Story = {
  render: () => (
    <StoryGroup label="Secondary position">
      {positions.map(({ label, value }) => (
        <ListItem key={value} content={label} secondaryContent="Secondary content" secondaryContentPosition={value} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Right keeps the row compact. Under stacks longer supporting content below the label.',
      },
    },
  },
};

export const SelectionMode: Story = {
  render: () => (
    <StoryGroup label="Selection mode">
      {selectionModes.map(({ label, value }) => (
        <ListItem key={value} content={label} selected={value !== 'none'} selectionMode={value} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Selection mode controls whether the row renders the presentational selection indicator.',
      },
    },
  },
};

export const Selected: Story = {
  render: () => (
    <StoryGroup label="Selected">
      <ListItem content="Not selected" icon={regularStarIcon} selected={false} selectedIcon={filledStarIcon} selectionMode="single" />
      <ListItem content="Selected" icon={regularStarIcon} selected selectedIcon={filledStarIcon} selectionMode="single" />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Selected swaps the primary label to semibold and can swap the leading icon when a filled variant is provided.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <StoryGroup label="Disabled">
      <ListItem content="Enabled" />
      <ListItem content="Disabled" disabled />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled rows are unavailable and do not receive focus.',
      },
    },
  },
};

export const ConstrainedContent: Story = {
  render: () => (
    <StoryGroup label="Constrained content">
      <ListItem content="Short" secondaryContent="Metadata" />
      <ListItem content="A longer label that can flex and wrap when the row is constrained" secondaryContent="Long metadata that should stay aligned" style={styles.constrained} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ListItem content and secondary content can still reflow when the row is constrained by its parent.',
      },
    },
  },
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#d0d0d0',
    borderRadius: 9999,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  constrained: {
    width: 320,
  },
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
    gap: 8,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
