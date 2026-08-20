/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Tab } from './tab';
import type { TabLayout } from './tab.types';

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

const regularStarIcon = { fontSource: { codepoint: 0x2606, fontFamily: 'Arial' } } as const;
const filledStarIcon = { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } } as const;
const settingsIcon = { fontSource: { codepoint: 0x2699, fontFamily: 'Arial' } } as const;

const layouts: readonly { label: string; value: TabLayout }[] = [
  { label: 'Icon and text', value: 'iconAndText' },
  { label: 'Icon only', value: 'iconOnly' },
];

const meta: Meta<typeof Tab> = {
  title: 'Components/Tab',
  component: Tab,
  args: {
    accessibilityLabel: 'Files',
    controls: 'files-panel',
    content: 'Files',
    disabled: false,
    layout: 'iconAndText',
    selected: false,
  },
  argTypes: {
    content: { control: 'text' },
    disabled: { control: 'boolean' },
    layout: { control: 'select', options: layouts.map(({ value }) => value) },
    selected: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A Tab switches between related content panels within a Tablist. Use the Selected axis for the active tab, and use icon-only layout only when the icon is already self-explanatory.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tab>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Layout">
        <Tab controls="files-panel" content="Files" icon={regularStarIcon} selectedIcon={filledStarIcon} />
        <Tab accessibilityLabel="Settings" controls="settings-panel" icon={settingsIcon} layout="iconOnly" />
      </StoryGroup>
      <StoryGroup label="Selected">
        <Tab controls="files-panel" content="Files" icon={regularStarIcon} selected={false} selectedIcon={filledStarIcon} />
        <Tab controls="files-panel" content="Files" icon={regularStarIcon} selected selectedIcon={filledStarIcon} />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the layout axis and the selected state swap.',
      },
    },
  },
};

export const IconAndText: Story = {
  render: () => <Tab controls="files-panel" content="Files" icon={regularStarIcon} selectedIcon={filledStarIcon} />,
  parameters: {
    docs: {
      description: {
        story: 'The default layout uses an icon, a stable ghost label, and the active selected swap when selected is true.',
      },
    },
  },
};

export const IconOnly: Story = {
  render: () => <Tab accessibilityLabel="Settings" controls="settings-panel" icon={settingsIcon} layout="iconOnly" />,
  parameters: {
    docs: {
      description: {
        story: 'Icon only layout removes the label, switches to the circular radius, and requires an accessibility label.',
      },
    },
  },
};

export const Selected: Story = {
  render: () => (
    <StoryGroup label="Selected">
      <Tab
        controls="files-panel"
        content="Files"
        icon={regularStarIcon}
        selected={false}
        selectedIcon={filledStarIcon}
        testID="agentic-storybook-tab-unselected"
      />
      <Tab
        controls="files-panel"
        content="Files"
        icon={regularStarIcon}
        selected
        selectedIcon={filledStarIcon}
        testID="agentic-storybook-tab-selected"
      />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Selected toggles the heavy background, semibold label weight, and filled icon.',
      },
    },
  },
};

export const Tablist: Story = {
  render: () => {
    const tabs = ['Files', 'Shared', 'Recent'];
    const Tablist = () => {
      const [active, setActive] = useState('Files');
      return (
        <StoryGroup label={`Active panel: ${active}`}>
          {tabs.map((name) => (
            <Tab
              key={name}
              content={name}
              controls={`${name.toLowerCase()}-panel`}
              onPress={() => setActive(name)}
              selected={active === name}
            />
          ))}
        </StoryGroup>
      );
    };
    return <Tablist />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'A tablist owns which tab is selected. Each tab renders the selected value it is given and reports presses through onPress, so the list is what moves selection between tabs.',
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => <Tab accessibilityLabel="Settings" controls="settings-panel" icon={settingsIcon} layout="iconOnly" />,
  parameters: {
    docs: {
      description: {
        story: 'Icon-only tabs need an action-oriented accessibility label that names the panel, not the icon.',
      },
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
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
