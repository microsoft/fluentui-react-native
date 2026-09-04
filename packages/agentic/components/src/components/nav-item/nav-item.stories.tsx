/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

import { Button } from '../button/button';

import { NavItem } from './nav-item';
import type { NavItemDensity, NavItemType } from './nav-item.types';

type StoryGroupProps = {
  children: ReactNode;
  label: string;
};

const StoryGroup = ({ children, label }: StoryGroupProps) => (
  <View style={styles.group}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.rail}>{children}</View>
  </View>
);

const densities: readonly { label: string; value: NavItemDensity }[] = [
  { label: 'Comfortable', value: 'comfortable' },
  { label: 'Compact', value: 'compact' },
];

const types: readonly { label: string; value: NavItemType }[] = [
  { label: 'Item', value: 'item' },
  { label: 'Category', value: 'category' },
];

const inboxIcon = { fontSource: { codepoint: 0x2709 } };

const meta: Meta<typeof NavItem> = {
  title: 'Components/NavItem',
  component: NavItem,
  args: {
    density: 'comfortable',
    disabled: false,
    label: 'Inbox',
    nesting: 'topLevel',
    selected: false,
    showLabel: true,
    testID: 'agentic-storybook-nav-item',
    type: 'item',
  },
  argTypes: {
    density: { control: 'select', options: densities.map(({ value }) => value) },
    disabled: { control: 'boolean' },
    nesting: { control: 'select', options: ['topLevel', 'subItem'] },
    selected: { control: 'boolean' },
    showLabel: { control: 'boolean' },
    type: { control: 'select', options: types.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'NavItem is a single navigation row shared by a full navigation surface and a simple navigation list. Selection and category expansion are externally driven so the surrounding navigation can own which destination is current and which category is open.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof NavItem>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'activates-destination-row',
          title: 'Publishes link semantics and activates through native press',
          steps: [
            { action: 'wait', target: { testId: 'agentic-storybook-nav-item' } },
            { expect: { state: 'role', target: { testId: 'agentic-storybook-nav-item' }, value: 'link' } },
            { expect: { state: 'selected', target: { testId: 'agentic-storybook-nav-item' }, value: false } },
            { action: 'click', target: { testId: 'agentic-storybook-nav-item' } },
            { expect: { state: 'selected', target: { testId: 'agentic-storybook-nav-item' }, value: false } },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Density">
        {densities.map(({ label, value }) => (
          <NavItem key={value} density={value} icon={inboxIcon} label={label} />
        ))}
      </StoryGroup>
      <StoryGroup label="Type">
        {types.map(({ label, value }) => (
          <NavItem key={value} icon={inboxIcon} label={label} type={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Selected">
        <NavItem icon={inboxIcon} label="Inbox" selected />
        <NavItem icon={inboxIcon} label="Drafts" />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the density axis, the row type axis, and the current-destination treatment.',
      },
    },
  },
};

export const Nesting: Story = {
  render: () => (
    <StoryGroup label="Category with sub items">
      <NavItem controls="mail-group" expanded icon={inboxIcon} label="Mail" type="category" />
      <NavItem label="Focused" nesting="subItem" selected />
      <NavItem label="Other" nesting="subItem" />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sub items are indented under their category. The category row publishes button semantics and its expanded state.',
      },
    },
  },
};

export const ExternallyDrivenSelection: Story = {
  render: () => {
    const NavList = () => {
      const destinations = ['Inbox', 'Drafts', 'Archive'];
      const [current, setCurrent] = useState('Inbox');
      const [expanded, setExpanded] = useState(true);

      return (
        <StoryGroup label="Owned by the caller">
          <NavItem
            controls="mail-group"
            expanded={expanded}
            icon={inboxIcon}
            label="Mail"
            onPress={() => setExpanded(!expanded)}
            type="category"
          />
          {expanded
            ? destinations.map((destination) => (
                <NavItem
                  key={destination}
                  label={destination}
                  nesting="subItem"
                  onPress={() => setCurrent(destination)}
                  selected={destination === current}
                />
              ))
            : null}
        </StoryGroup>
      );
    };
    return <NavList />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'NavItem never changes its own selected or expanded value. The caller owns both and updates them from onPress, which is how a future navigation surface will coordinate a list of rows.',
      },
    },
  },
};

export const TrailingContent: Story = {
  render: () => (
    <StoryGroup label="Trailing regions">
      <NavItem icon={inboxIcon} label="Inbox" trailingContent="12" />
      <NavItem icon={inboxIcon} label="Shared" trailingActions={{ children: <Button content="Pin" /> }} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A trailing string reports a count or status. Trailing actions stay visible instead of appearing on hover so they never become an invisible press target.',
      },
    },
  },
};

export const CollapsedRail: Story = {
  render: () => (
    <StoryGroup label="Collapsed rail">
      <NavItem accessibilityLabel="Inbox" icon={inboxIcon} selected showLabel={false} />
      <NavItem accessibilityLabel="Drafts" icon={inboxIcon} showLabel={false} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The collapsed rail row keeps only the leading visual and requires an accessibilityLabel for its accessible name.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <StoryGroup label="Disabled">
      <NavItem disabled icon={inboxIcon} label="Unavailable" />
      <NavItem disabled icon={inboxIcon} label="Unavailable current" selected />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled rows expose disabled accessibility state, do not receive focus, and mute the selected indicator.',
      },
    },
  },
};

export const ConstrainedContent: Story = {
  render: () => (
    <View style={styles.constrained}>
      <NavItem icon={inboxIcon} label="A destination name long enough to wrap inside a narrow navigation" trailingContent="99+" />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A long label wraps inside the row while the leading visual and the trailing string keep their space.',
      },
    },
  },
};

const styles = StyleSheet.create({
  constrained: {
    width: 220,
  },
  group: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  rail: {
    gap: 2,
    width: 260,
  },
  story: {
    gap: 16,
  },
});
