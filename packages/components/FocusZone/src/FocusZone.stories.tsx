/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { FocusZone } from './FocusZone';
import type { FocusZoneDirection, FocusZoneProps, FocusZoneTabNavigation } from './FocusZone.types';

const directions: readonly FocusZoneDirection[] = ['bidirectional', 'horizontal', 'vertical', 'none'];
const tabNavigationModes: readonly FocusZoneTabNavigation[] = ['None', 'NavigateWrap', 'NavigateStopAtEnds', 'Normal'];

type FocusZoneExampleProps = FocusZoneProps & {
  defaultToCenter?: boolean;
  columns?: number;
  itemCount?: number;
};

const FocusZoneExample = ({ columns = 3, defaultToCenter = false, itemCount = 9, ...props }: FocusZoneExampleProps) => {
  const beforeRef = React.useRef<View>(null);
  const afterRef = React.useRef<View>(null);
  const focusZoneRef = React.useRef<View>(null);
  const centerRef = React.useRef<View>(null);
  const itemRefs = React.useRef<(View | null)[]>([]);
  const [focusedItem, setFocusedItem] = React.useState('Outside before');
  const items = Array.from({ length: itemCount }, (_, index) => index + 1);
  const centerIndex = Math.floor(itemCount / 2);

  return (
    <View style={styles.story}>
      <Pressable
        accessibilityRole="button"
        focusable
        onFocus={() => setFocusedItem('Outside before')}
        onPress={() => beforeRef.current?.focus()}
        ref={beforeRef}
        style={({ pressed }) => [styles.outsideButton, pressed && styles.pressed]}
        testID="focus-zone-before"
      >
        <Text>Outside before</Text>
      </Pressable>
      <FocusZone
        {...props}
        componentRef={focusZoneRef}
        defaultTabbableElement={defaultToCenter ? centerRef : undefined}
        style={styles.focusZone}
        testID="focus-zone-root"
      >
        <View style={styles.grid}>
          {items.map((item, index) => (
            <Pressable
              accessibilityLabel={`Item ${item}`}
              accessibilityRole="button"
              focusable
              key={item}
              onFocus={() => setFocusedItem(`Item ${item}`)}
              onPress={() => itemRefs.current[index]?.focus()}
              ref={(view) => {
                itemRefs.current[index] = view;
                if (index === centerIndex) {
                  centerRef.current = view;
                }
              }}
              style={({ pressed }) => [
                styles.item,
                { flexBasis: `${100 / columns - 3}%` },
                focusedItem === `Item ${item}` && styles.focused,
                pressed && styles.pressed,
              ]}
              testID={`focus-zone-item-${item}`}
            >
              <Text style={styles.itemText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </FocusZone>
      <Pressable
        accessibilityRole="button"
        focusable
        onFocus={() => setFocusedItem('Outside after')}
        onPress={() => afterRef.current?.focus()}
        ref={afterRef}
        style={({ pressed }) => [styles.outsideButton, pressed && styles.pressed]}
        testID="focus-zone-after"
      >
        <Text>Outside after</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => focusZoneRef.current?.focus()}
        style={({ pressed }) => [styles.focusButton, pressed && styles.pressed]}
      >
        <Text style={styles.focusButtonText}>Focus the zone</Text>
      </Pressable>
      <Text accessibilityLiveRegion="polite" style={styles.status} testID="focus-zone-status">
        Focused: {focusedItem}
      </Text>
    </View>
  );
};

const meta: Meta<typeof FocusZone> = {
  title: 'Primitives/FocusZone',
  component: FocusZone,
  args: {
    disabled: false,
    focusZoneDirection: 'bidirectional',
    isCircularNavigation: false,
    navigationOrderInRenderOrder: false,
    tabKeyNavigation: 'None',
    use2DNavigation: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    focusZoneDirection: { control: 'select', options: directions },
    isCircularNavigation: { control: 'boolean' },
    navigationOrderInRenderOrder: { control: 'boolean' },
    tabKeyNavigation: { control: 'select', options: tabNavigationModes },
    use2DNavigation: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'FocusZone is an unstyled native primitive that coordinates directional and Tab keyboard navigation among focusable descendants.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof FocusZone>;

export const Default: Story = {
  render: (args) => <FocusZoneExample {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Focus an item, then use the arrow keys to move through the two-dimensional grid.',
      },
    },
  },
};

export const CircularNavigation: Story = {
  args: {
    focusZoneDirection: 'horizontal',
    isCircularNavigation: true,
  },
  render: (args) => <FocusZoneExample {...args} columns={5} itemCount={5} />,
  parameters: {
    docs: {
      description: {
        story: 'Horizontal arrow navigation wraps from the first and last items.',
      },
    },
  },
};

export const TwoDimensionalNavigation: Story = {
  args: {
    use2DNavigation: true,
  },
  render: (args) => <FocusZoneExample {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Geometric navigation moves vertically between rows and horizontally within each row.',
      },
    },
  },
};

export const DefaultTabbableElement: Story = {
  render: (args) => <FocusZoneExample {...args} defaultToCenter />,
  parameters: {
    docs: {
      description: {
        story: 'The Focus the zone action sends focus to the center item through defaultTabbableElement.',
      },
    },
  },
};

export const TabNavigation: Story = {
  args: {
    focusZoneDirection: 'horizontal',
    tabKeyNavigation: 'NavigateWrap',
  },
  render: (args) => <FocusZoneExample {...args} columns={5} itemCount={5} />,
  parameters: {
    docs: {
      description: {
        story: 'Tab and Shift+Tab move within the zone and wrap at its ends.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <FocusZoneExample {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'A disabled FocusZone leaves keyboard navigation to the platform responder chain.',
      },
    },
  },
};

const styles = StyleSheet.create({
  focusButton: {
    backgroundColor: '#0f6cbd',
    borderRadius: 4,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  focusButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  focused: {
    borderColor: '#0f6cbd',
    borderWidth: 3,
  },
  focusZone: {
    marginVertical: 12,
    width: 360,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  item: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderColor: '#d1d1d1',
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 64,
  },
  itemText: {
    color: '#242424',
    fontSize: 16,
    fontWeight: '600',
  },
  outsideButton: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d1d1',
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  status: {
    color: '#616161',
    marginTop: 12,
  },
  story: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 420,
    padding: 24,
    width: 520,
  },
});
