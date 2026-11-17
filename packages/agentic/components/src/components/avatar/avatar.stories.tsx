/** @jsxImportSource @fluentui-react-native/framework-base */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { Avatar } from './avatar';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import type { AvatarProps, AvatarSize } from './avatar.types';

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

const avatarSizes = [16, 20, 24, 28, 32, 40, 56, 120] as const satisfies readonly AvatarSize[];
const ringStates = [false, true] as const;
const ringToggleCount = avatarSizes.length * ringStates.length;

type RuntimeRingToggleProps = {
  activityRing: boolean;
  onToggled: () => void;
  size: AvatarSize;
};

/** Mounts with the opposite ring state and flips it once after native layout, so each cell exercises a runtime toggle. */
const RuntimeRingToggle = ({ activityRing, onToggled, size }: RuntimeRingToggleProps) => {
  const [current, setCurrent] = useState(!activityRing);
  const toggled = useRef(false);
  const reported = useRef(false);
  const onLayout = useCallback(() => {
    if (toggled.current) return;
    toggled.current = true;
    setCurrent(activityRing);
  }, [activityRing]);
  useEffect(() => {
    if (toggled.current && !reported.current && current === activityRing) {
      reported.current = true;
      onToggled();
    }
  }, [activityRing, current, onToggled]);
  const state = activityRing ? 'on' : 'off';
  return (
    <Avatar
      accessibilityLabel={`Avatar ${size}, activity ring ${state}`}
      activityRing={current}
      initials="LM"
      onLayout={onLayout}
      size={size}
      testID={`agentic-storybook-avatar-ring-${size}-${state}`}
    />
  );
};

const ActivityRingToggleScene = () => {
  const [count, setCount] = useState(0);
  const onToggled = useCallback(() => setCount((value) => value + 1), []);
  return (
    <View style={styles.story}>
      {ringStates.map((activityRing) => (
        <StoryGroup key={String(activityRing)} label={`Activity ring ${activityRing ? 'on' : 'off'}`}>
          {avatarSizes.map((size) => (
            <RuntimeRingToggle key={size} activityRing={activityRing} onToggled={onToggled} size={size} />
          ))}
        </StoryGroup>
      ))}
      <StoryStatus testID="agentic-storybook-avatar-ring-toggles">{`Runtime ring toggles: ${count} of ${ringToggleCount}`}</StoryStatus>
    </View>
  );
};

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

type Story = WdioStory<StoryObj<typeof Avatar>>;

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
  render: (args: AvatarProps) => (
    <View style={styles.story}>
      <Avatar {...args} testID="agentic-storybook-avatar-activity-ring" />
      <StoryStatus testID="agentic-storybook-avatar-ring-state">{`Activity ring ${args.activityRing ? 'on' : 'off'}, size ${args.size}`}</StoryStatus>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The activity ring uses a persistent decorative border with a gap and stroke that scale with the avatar size.',
      },
    },
  },
  wdio: [
    desktopIt('AVT-004 exposes the informative identity as a named native image', async ({ browser, expect }) => {
      const avatar = await browser.$('~agentic-storybook-avatar-activity-ring');
      await expect(avatar).toExist();
      expect(await avatar.getTagName()).toBe('image');
      expect(await avatar.getProperty('name')).toBe('Lydia Mitchelson');
    }),
  ],
};

export const ActivityRingToggle: Story = {
  render: () => <ActivityRingToggleScene />,
  parameters: {
    docs: {
      description: {
        story:
          'Each avatar mounts with the opposite activity ring state and toggles it once after native layout, at every size, without changing its bounds.',
      },
    },
  },
  wdio: [
    desktopIt('AVT-006 toggles the activity ring at every size without crashing or changing avatar bounds', async ({ browser, expect }) => {
      const assert: typeof import('node:assert') = (await import('node:assert')).default;
      await expect(await browser.$('~agentic-storybook-avatar-ring-toggles')).toHaveText('Runtime ring toggles: 16 of 16');
      for (const size of [16, 20, 24, 28, 32, 40, 56, 120]) {
        for (const state of ['off', 'on']) {
          const avatar = await browser.$(`~agentic-storybook-avatar-ring-${size}-${state}`);
          await expect(avatar).toExist();
          const bounds = await browser.getElementRect(await avatar.elementId);
          assert(
            Math.abs(bounds.width - size) <= 1 && Math.abs(bounds.height - size) <= 1,
            `The activity ring must not resize the ${size} avatar (${state}).`,
          );
        }
      }
    }),
  ],
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
