/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';

import type { Meta, StoryObj } from '@storybook/react-native';
import { directComponent } from '@fluentui-react-native/framework-base';

import type { IconElementProps } from '../icon/icon.types';
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

const StarGlyph = directComponent<IconElementProps>(({ color, height, width, ...props }) => (
  <Svg {...props} color={color} fill="currentColor" height={height} viewBox="0 0 24 24" width={width}>
    <Path d="M12 2 14.47 8.6 21.51 8.91 16 13.3 17.88 20.09 12 16.2 6.12 20.09 8 13.3 2.49 8.91 9.53 8.6Z" />
  </Svg>
));

const DotGlyph = directComponent<IconElementProps>(({ color, height, width, ...props }) => (
  <Svg {...props} color={color} fill="currentColor" height={height} viewBox="0 0 24 24" width={width}>
    <Circle cx="12" cy="12" r="5" />
  </Svg>
));

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
          checkedIconSource={StarGlyph}
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
          indeterminateIconSource={DotGlyph}
          status="indeterminate"
          style={[styles.indicator, styles.active]}
        />
      </StoryItem>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Consumers can replace the checked and indeterminate glyphs with their own SVG icon components.',
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
