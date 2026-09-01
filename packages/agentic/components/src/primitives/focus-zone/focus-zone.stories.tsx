/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';
import { FocusZone } from '@fluentui-react-native/focus-zone';
import type { FocusZoneDirection, FocusZoneProps, FocusZoneTabNavigation } from '@fluentui-react-native/focus-zone';
import type { Meta, StoryObj } from '@storybook/react-native';

import { Button } from '../../components/button/button';

const defaultTabbableNativeID = 'focus-zone-default-item';
const directions: readonly FocusZoneDirection[] = ['bidirectional', 'horizontal', 'vertical', 'none'];
const tabNavigationModes: readonly FocusZoneTabNavigation[] = ['None', 'NavigateWrap', 'NavigateStopAtEnds', 'Normal'];

const styles = StyleSheet.create({
  focusButton: {
    marginTop: 16,
  },
  focusZone: {
    marginVertical: 12,
  },
  grid: {
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
  },
  item: {
    height: 64,
    margin: 4,
    width: 104,
  },
  outsideButton: {
    marginVertical: 4,
  },
  status: {
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

type FocusZoneExampleProps = FocusZoneProps & {
  columns?: number;
  defaultToCenter?: boolean;
  itemCount?: number;
};

const FocusZoneExample = ({ columns = 3, defaultToCenter = false, itemCount = 9, ...props }: FocusZoneExampleProps) => {
  const focusZoneRef = React.useRef<View>(null);
  const [focusedItem, setFocusedItem] = React.useState('Outside before');
  const items = Array.from({ length: itemCount }, (_, index) => index + 1);
  const centerIndex = Math.floor(itemCount / 2);
  const rows = Array.from({ length: Math.ceil(itemCount / columns) }, (_, rowIndex) =>
    items.slice(rowIndex * columns, (rowIndex + 1) * columns),
  );

  return (
    <View style={styles.story} testID="focus-zone-story">
      <Button
        content="Outside before"
        onFocus={() => setFocusedItem('Outside before')}
        style={styles.outsideButton}
        testID="focus-zone-before"
      />
      <FocusZone
        {...props}
        componentRef={focusZoneRef}
        defaultTabbableElement={defaultToCenter ? defaultTabbableNativeID : undefined}
        style={styles.focusZone}
        testID="focus-zone-root"
      >
        <View style={styles.grid}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((item) => {
                const index = item - 1;
                return (
                  <Button
                    accessibilityLabel={`Item ${item}`}
                    content={String(item)}
                    key={item}
                    nativeID={index === centerIndex ? defaultTabbableNativeID : undefined}
                    onFocus={() => setFocusedItem(`Item ${item}`)}
                    style={styles.item}
                    testID={`focus-zone-item-${item}`}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </FocusZone>
      <Button
        content="Outside after"
        onFocus={() => setFocusedItem('Outside after')}
        style={styles.outsideButton}
        testID="focus-zone-after"
      />
      <Button content="Focus the zone" onPress={() => focusZoneRef.current?.focus()} style={styles.focusButton} />
      <Text accessibilityLiveRegion="polite" style={styles.status} testID="focus-zone-status">
        Focused: {focusedItem}
      </Text>
    </View>
  );
};

const meta: Meta<typeof FocusZone> = {
  title: 'Native/FocusZone',
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
  tags: ['desktop-e2e'],
  render: (args) => <FocusZoneExample {...args} />,
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'linear-navigation-and-tab-exit',
          title: 'Performs linear navigation and exits on Tab',
          platforms: ['windows'],
          requires: ['focus', 'keyboard'],
          steps: [
            { action: 'click', target: { testId: 'focus-zone-item-1' } },
            { expect: { state: 'focused', target: { testId: 'focus-zone-item-1' }, value: true } },
            { action: 'keys', value: ['\uE014'] },
            { expect: { state: 'focused', target: { testId: 'focus-zone-item-2' }, value: true } },
            { action: 'keys', value: ['\uE015'] },
            { expect: { state: 'focused', target: { testId: 'focus-zone-item-3' }, value: true } },
            { action: 'keys', value: ['\uE004'] },
            { expect: { state: 'focused', target: { testId: 'focus-zone-after' }, value: true } },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
    docs: {
      description: {
        story: 'Focus an item, then use the arrow keys to move through the grid and Tab to leave the zone.',
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
  tags: ['desktop-e2e'],
  args: {
    use2DNavigation: true,
  },
  render: (args) => <FocusZoneExample {...args} />,
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'geometric-navigation',
          title: 'Performs geometric two-dimensional navigation',
          platforms: ['windows'],
          requires: ['focus', 'keyboard'],
          steps: [
            { action: 'click', target: { testId: 'focus-zone-item-1' } },
            { expect: { state: 'focused', target: { testId: 'focus-zone-item-1' }, value: true } },
            { action: 'keys', value: ['\uE015'] },
            { expect: { state: 'focused', target: { testId: 'focus-zone-item-4' }, value: true } },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
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
