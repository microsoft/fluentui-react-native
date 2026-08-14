/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Avatar } from './avatar';
import type { AvatarSize } from './avatar.types';

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

const imageDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  args: {
    accessibilityLabel: 'Lydia Mitchelson',
    size: 40,
  },
  argTypes: {
    activityRing: { control: 'boolean' },
    size: { control: 'select', options: [16, 20, 24, 28, 32, 40, 56, 120] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Avatar is a non-interactive identity marker for people, groups, bots, or entities. It supports image, icon, and initials display modes, eight sizes, and an optional active ring.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Image">
        <Avatar accessibilityLabel="Profile photo" image={{ source: { uri: imageDataUri } }} />
      </StoryGroup>
      <StoryGroup label="Icon">
        <Avatar accessibilityLabel="Contoso bot" icon={{ fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } }} />
      </StoryGroup>
      <StoryGroup label="Initials">
        <Avatar accessibilityLabel="Lydia Mitchelson" initials="LM" />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the three display modes.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <StoryGroup label="Sizes">
      {([16, 20, 24, 28, 32, 40, 56, 120] as readonly AvatarSize[]).map((size) => (
        <Avatar key={size} accessibilityLabel={`Avatar ${size}`} initials="LM" size={size} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The avatar uses a fixed numeric diameter across eight supported size stops.',
      },
    },
  },
};

export const ActivityRing: Story = {
  args: {
    activityRing: true,
    initials: 'LM',
  },
  parameters: {
    docs: {
      description: {
        story: 'The optional activity ring renders as an outline offset and width that scale with the avatar size.',
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
