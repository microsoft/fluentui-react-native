/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { CheckboxIndicator } from './checkbox-indicator';
import type { CheckboxIndicatorStatus } from './checkbox-indicator.types';

type StoryItemProps = {
  children: ReactNode;
  label: string;
};

const StoryItem = ({ children, label }: StoryItemProps) => (
  <View style={styles.item}>
    {children}
    <Text style={styles.label}>{label}</Text>
  </View>
);

const statuses: readonly CheckboxIndicatorStatus[] = ['unchecked', 'checked', 'indeterminate'];

const meta: Meta<typeof CheckboxIndicator> = {
  title: 'Primitives/Checkbox Indicator',
  component: CheckboxIndicator,
  args: {
    iconColor: '#ffffff',
    iconSize: 16,
    status: 'checked',
  },
  argTypes: {
    iconColor: { control: 'color' },
    iconSize: { control: { type: 'number', min: 8, max: 32, step: 2 } },
    status: { control: 'select', options: statuses },
  },
  parameters: {
    docs: {
      description: {
        component:
          'CheckboxIndicator is an unstyled, decorative primitive that renders no glyph, a checkmark, or an indeterminate mark from its status.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof CheckboxIndicator>;

export const Default: Story = {
  render: ({ style, ...args }) => (
    <CheckboxIndicator {...args} style={[styles.indicator, args.status === 'unchecked' ? styles.unchecked : styles.active, style]} />
  ),
};

export const Overview: Story = {
  render: ({ iconColor, iconSize }) => (
    <View style={styles.row}>
      {statuses.map((status) => (
        <StoryItem key={status} label={status}>
          <CheckboxIndicator
            iconColor={iconColor}
            iconSize={iconSize}
            status={status}
            style={[styles.indicator, status === 'unchecked' ? styles.unchecked : styles.active]}
          />
        </StoryItem>
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The three status branches: empty, checked, and indeterminate.',
      },
    },
  },
};

export const Size: Story = {
  render: ({ iconColor }) => (
    <View style={styles.row}>
      {[12, 16, 20, 24].map((iconSize) => (
        <StoryItem key={iconSize} label={`${iconSize}`}>
          <CheckboxIndicator
            iconColor={iconColor}
            iconSize={iconSize}
            status="checked"
            style={[styles.indicator, styles.active, { height: iconSize + 8, width: iconSize + 8 }]}
          />
        </StoryItem>
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'iconSize controls the rendered glyph while the consuming component owns the indicator boundary.',
      },
    },
  },
};

export const CustomGlyphs: Story = {
  render: ({ iconColor, iconSize }) => (
    <View style={styles.row}>
      <StoryItem label="Checked">
        <CheckboxIndicator
          checkedIconSource={{ codepoint: 0x2605, fontFamily: 'Arial' }}
          iconColor={iconColor}
          iconSize={iconSize}
          status="checked"
          style={[styles.indicator, styles.active]}
        />
      </StoryItem>
      <StoryItem label="Indeterminate">
        <CheckboxIndicator
          iconColor={iconColor}
          iconSize={iconSize}
          indeterminateIconSource={{ codepoint: 0x2022, fontFamily: 'Arial' }}
          status="indeterminate"
          style={[styles.indicator, styles.active]}
        />
      </StoryItem>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Consumers can replace the checked and indeterminate font glyph sources.',
      },
    },
  },
};

const styles = StyleSheet.create({
  active: {
    backgroundColor: '#185abd',
    borderColor: '#185abd',
  },
  indicator: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  item: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  unchecked: {
    backgroundColor: 'transparent',
    borderColor: '#616161',
  },
});
