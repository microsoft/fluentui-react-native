/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Switch } from './switch';
import type { SwitchLayout } from './switch.types';

type StoryGroupProps = {
  children: ReactNode;
  label: string;
};

type StoryItemProps = {
  children: ReactNode;
  label: string;
};

const StoryGroup = ({ children, label }: StoryGroupProps) => (
  <View style={styles.group}>
    <Text style={styles.groupLabel}>{label}</Text>
    <View style={styles.row}>{children}</View>
  </View>
);

const StoryItem = ({ children, label }: StoryItemProps) => (
  <View style={styles.item}>
    {children}
    <Text style={styles.itemLabel}>{label}</Text>
  </View>
);

const layouts: readonly { label: string; value: SwitchLayout }[] = [
  { label: 'Switch', value: 'switch' },
  { label: 'Horizontal', value: 'horizontal' },
  { label: 'Vertical', value: 'vertical' },
];

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    label: 'Wi-Fi',
    labelAfter: false,
    labelBefore: true,
    layout: 'horizontal',
  },
  argTypes: {
    defaultChecked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    labelAfter: { control: 'boolean' },
    labelBefore: { control: 'boolean' },
    layout: { control: 'select', options: layouts.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Switch is an atomic toggle for binary settings that take effect immediately. Use it when the user expects direct on/off feedback rather than form submission.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Layout">
        {layouts.map(({ label, value }) => (
          <StoryItem key={value} label={label}>
            <Switch
              {...(value === 'switch' ? { accessibilityLabel: label } : { labelAfter: false })}
              defaultChecked={false}
              label={label}
              layout={value}
            />
          </StoryItem>
        ))}
      </StoryGroup>
      <StoryGroup label="Checked">
        <StoryItem label="Off">
          <Switch accessibilityLabel="Wi-Fi" defaultChecked={false} label="Wi-Fi" labelAfter={false} />
        </StoryItem>
        <StoryItem label="On">
          <Switch accessibilityLabel="Wi-Fi" defaultChecked label="Wi-Fi" labelAfter={false} />
        </StoryItem>
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A compact scan of the three layouts and the two checked states.',
      },
    },
  },
};

export const Layout: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Switch">
        <Switch accessibilityLabel="Airplane mode" defaultChecked={false} layout="switch" />
      </StoryGroup>
      <StoryGroup label="Horizontal">
        <Switch label="Wi-Fi" labelAfter={false} labelBefore layout="horizontal" />
      </StoryGroup>
      <StoryGroup label="Vertical">
        <Switch label="Bluetooth" layout="vertical" />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Switch supports a standalone control, a horizontal settings row, and a vertical label-above layout.',
      },
    },
  },
};

export const Checked: Story = {
  render: () => (
    <StoryGroup label="Checked">
      <StoryItem label="Off">
        <Switch accessibilityLabel="Notifications" defaultChecked={false} layout="switch" />
      </StoryItem>
      <StoryItem label="On">
        <Switch accessibilityLabel="Notifications" defaultChecked layout="switch" />
      </StoryItem>
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The checked axis drives the filled track, thumb position, and checked accessibility state. These instances start from defaultChecked and still toggle when pressed.',
      },
    },
  },
};

export const ExternallyDrivenChecked: Story = {
  render: () => {
    const Setting = () => {
      const [checked, setChecked] = useState(false);
      return (
        <StoryGroup label={checked ? 'Wi-Fi is on' : 'Wi-Fi is off'}>
          <Switch accessibilityLabel="Wi-Fi" checked={checked} layout="switch" onChange={setChecked} />
          <Text style={styles.caption}>The caller owns the value and updates it from onChange.</Text>
        </StoryGroup>
      );
    };
    return <Setting />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Supplying checked makes the caller the owner of the value. The switch reports every press and key activation through onChange and renders only what it is given.',
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <StoryGroup label="Accessibility">
      <StoryItem label="Standalone">
        <Switch accessibilityLabel="Wi-Fi" layout="switch" />
      </StoryItem>
      <StoryItem label="Labeled">
        <Switch label="Wi-Fi" labelAfter={false} labelBefore layout="horizontal" />
      </StoryItem>
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Standalone switches require an accessible name. Visible labels are linked to the switch element via aria-labelledby.',
      },
    },
  },
};

export const ConstrainedContent: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Wrapped">
        <View style={styles.constrained}>
          <Switch label="A very long switch label that wraps when the available width is narrow" labelAfter={false} layout="horizontal" />
        </View>
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Labels can wrap when the surrounding layout constrains their width.',
      },
    },
  },
};

const styles = StyleSheet.create({
  caption: {
    fontSize: 11,
  },
  constrained: {
    width: 160,
  },
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  item: {
    alignItems: 'center',
    gap: 4,
    minWidth: 96,
  },
  itemLabel: {
    fontSize: 11,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
