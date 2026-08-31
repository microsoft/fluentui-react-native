/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Skeleton } from './skeleton';

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

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: {
    style: {
      height: 16,
      width: 160,
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Skeleton is a non-interactive placeholder bar that mirrors the shape of loading content and animates a synchronized wave unless reduce motion is enabled.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    style: {
      height: 16,
      width: 160,
    },
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Text">
        <StoryItem label="Line">
          <Skeleton style={styles.line} />
        </StoryItem>
        <StoryItem label="Subtitle">
          <Skeleton style={styles.subtitle} />
        </StoryItem>
      </StoryGroup>
      <StoryGroup label="Shapes">
        <StoryItem label="Avatar">
          <Skeleton style={styles.avatar} />
        </StoryItem>
        <StoryItem label="Thumbnail">
          <Skeleton style={styles.thumbnail} />
        </StoryItem>
        <StoryItem label="Card">
          <Skeleton style={styles.card} />
        </StoryItem>
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common loading silhouettes sized to match text, avatars, thumbnails, and card blocks.',
      },
    },
  },
};

export const Line: Story = {
  args: {
    style: {
      height: 12,
      width: 176,
    },
  },
};

export const Avatar: Story = {
  args: {
    style: {
      borderRadius: 24,
      height: 48,
      width: 48,
    },
  },
};

export const Card: Story = {
  args: {
    style: {
      borderRadius: 12,
      height: 96,
      width: 224,
    },
  },
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  card: {
    borderRadius: 12,
    height: 96,
    width: 224,
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
    minWidth: 72,
  },
  itemLabel: {
    fontSize: 11,
  },
  line: {
    height: 12,
    width: 176,
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
  subtitle: {
    height: 12,
    width: 120,
  },
  thumbnail: {
    borderRadius: 10,
    height: 72,
    width: 120,
  },
});
