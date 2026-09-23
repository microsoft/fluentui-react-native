/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LayoutRectangle } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { LayoutStableText } from './layout-stable-text';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';

type StoryItemProps = {
  children: ReactNode;
  label: string;
};

const StoryItem = ({ children, label }: StoryItemProps) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.bounds}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  bounds: {
    alignSelf: 'flex-start',
    borderColor: '#d1d1d1',
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 4,
  },
  constrained: {
    borderColor: '#d1d1d1',
    borderWidth: 1,
    padding: 8,
    width: 180,
  },
  item: {
    alignItems: 'flex-start',
    gap: 4,
  },
  label: {
    color: '#616161',
    fontSize: 11,
  },
  large: {
    fontSize: 20,
  },
  regular: {
    fontSize: 14,
    fontWeight: '400',
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  semibold: {
    fontSize: 14,
    fontWeight: '600',
  },
  small: {
    fontSize: 12,
  },
  stableText: {
    alignSelf: 'flex-start',
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});

const meta: Meta<typeof LayoutStableText> = {
  title: 'Primitives/Layout Stable Text',
  component: LayoutStableText,
  parameters: {
    docs: {
      description: {
        component:
          'LayoutStableText is an unstyled primitive that reserves the largest text metrics with an inaccessible hidden element and overlays the visible state without layout shift.',
      },
    },
  },
};

export default meta;

type Story = WdioStory<StoryObj<typeof LayoutStableText>>;

export const Default: Story = {
  render: () => (
    <LayoutStableText
      reserve={<Text style={styles.semibold}>Stable label</Text>}
      style={styles.stableText}
      visible={<Text style={styles.regular}>Stable label</Text>}
    />
  ),
};

function AlignmentMeasurement() {
  const [reserve, setReserve] = useState<LayoutRectangle>();
  const [visible, setVisible] = useState<LayoutRectangle>();
  return (
    <View>
      <View
        accessible
        role="group"
        style={styles.stableText}
        testID="layout-stable-text-large-reserve"
        onLayout={(event) => setReserve(event.nativeEvent.layout)}
      >
        <LayoutStableText
          reserve={<Text style={styles.large}>Stable label</Text>}
          visible={
            <Text
              accessible
              style={styles.small}
              testID="layout-stable-text-small-visible"
              onLayout={(event) => setVisible(event.nativeEvent.layout)}
            >
              Stable label
            </Text>
          }
        />
      </View>
      <StoryStatus testID="layout-stable-text-native-metrics">
        {reserve && visible ? JSON.stringify({ reserve, visible }) : 'Waiting for native layout'}
      </StoryStatus>
    </View>
  );
}

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryItem label="Reserve semibold, show regular">
        <LayoutStableText
          reserve={<Text style={styles.semibold}>Stable label</Text>}
          visible={<Text style={styles.regular}>Stable label</Text>}
        />
      </StoryItem>
      <StoryItem label="Reserve large, show small">
        <AlignmentMeasurement />
      </StoryItem>
      <StoryItem label="Matching metrics">
        <LayoutStableText
          reserve={<Text style={styles.regular}>Stable label</Text>}
          visible={<Text style={styles.regular}>Stable label</Text>}
        />
      </StoryItem>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The hidden reserve element determines bounds while the visible element supplies the rendered state.',
      },
    },
  },
  wdio: {
    'centers the intrinsic smaller line inside its larger reserve': async ({ browser, expect, platform }) => {
      const assert: typeof import('node:assert') = (await import('node:assert')).default;
      if (platform === 'macos') {
        // Fabric paragraphs do not expose their testID to AX; use their native onLayout measurements.
        const status = await browser.$('~layout-stable-text-native-metrics');
        await browser.waitUntil(async () => (await status.getText()).startsWith('{'));
        const metrics: { reserve: LayoutRectangle; visible: LayoutRectangle } = JSON.parse(await status.getText());
        assert(
          metrics.visible.height > 0 && metrics.visible.height < metrics.reserve.height,
          'Visible text must retain its intrinsic height.',
        );
        assert(
          Math.abs(metrics.visible.y + metrics.visible.height / 2 - metrics.reserve.height / 2) <= 1,
          'Visible text must be vertically centered within one layout pixel.',
        );
        assert(
          Math.abs(metrics.visible.x) <= 1 && metrics.visible.width <= metrics.reserve.width + 1,
          'Visible text must retain leading alignment and fit the reserved width.',
        );
        return;
      }
      const reserve = await browser.$('~layout-stable-text-large-reserve');
      const visible = await browser.$('~layout-stable-text-small-visible');
      await expect(reserve).toExist();
      await expect(visible).toExist();
      const reservedBounds = await browser.getElementRect(await reserve.elementId);
      const visibleBounds = await browser.getElementRect(await visible.elementId);

      assert(
        visibleBounds.height > 0 && visibleBounds.height < reservedBounds.height,
        'Visible text must keep its smaller intrinsic height.',
      );
      const reservedCenter = reservedBounds.y + reservedBounds.height / 2;
      const visibleCenter = visibleBounds.y + visibleBounds.height / 2;
      assert(Math.abs(reservedCenter - visibleCenter) <= 1, 'Visible text must be vertically centered within one layout pixel.');
    },
  },
};

export const WeightReservation: Story = {
  render: () => (
    <View style={styles.row}>
      <StoryItem label="Plain regular">
        <Text style={styles.regular}>Toggle label</Text>
      </StoryItem>
      <StoryItem label="Regular with semibold reserve">
        <LayoutStableText
          reserve={<Text style={styles.semibold}>Toggle label</Text>}
          visible={<Text style={styles.regular}>Toggle label</Text>}
        />
      </StoryItem>
      <StoryItem label="Visible semibold">
        <LayoutStableText
          reserve={<Text style={styles.semibold}>Toggle label</Text>}
          visible={<Text style={styles.semibold}>Toggle label</Text>}
        />
      </StoryItem>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Regular and semibold visual states share the semibold width, preventing neighboring layout from moving.',
      },
    },
  },
};

export const ConstrainedContent: Story = {
  render: () => (
    <View style={styles.constrained}>
      <LayoutStableText
        reserve={
          <Text numberOfLines={2} style={styles.semibold}>
            A long label that wraps within constrained content
          </Text>
        }
        visible={
          <Text numberOfLines={2} style={styles.regular}>
            A long label that wraps within constrained content
          </Text>
        }
      />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The primitive preserves text wrapping and can shrink inside a constrained parent.',
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <LayoutStableText
      reserve={
        <Text accessibilityLabel="Hidden reserve label" style={styles.semibold}>
          Accessible label
        </Text>
      }
      visible={
        <Text accessibilityLabel="Accessible label" style={styles.regular}>
          Accessible label
        </Text>
      }
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Only the visible text remains in the accessibility tree; reserve text is always hidden.',
      },
    },
  },
};
