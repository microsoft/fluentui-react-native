/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import { useReducedMotion } from '@fluentui-react-native/framework-base';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Spinner } from './spinner';
import type { SpinnerSize } from './spinner.types';

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

const sizes: readonly { label: string; value: SpinnerSize }[] = [
  { label: 'X-Tiny', value: 'x-tiny' },
  { label: 'Tiny', value: 'tiny' },
  { label: 'X-Small', value: 'x-small' },
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
  { label: 'X-Large', value: 'x-large' },
  { label: 'Huge', value: 'huge' },
];

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  args: {
    accessibilityLabel: 'Loading',
    size: 'medium',
  },
  argTypes: {
    size: { control: 'select', options: sizes.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Spinner is an atomic, non-interactive indeterminate progress indicator. Use it when work is in progress and the incoming layout is not known in advance.',
      },
    },
  },
};

export default meta;

type Story = WdioStory<StoryObj<typeof Spinner>>;

export const Default: Story = {};

function MotionExample() {
  const reduceMotion = useReducedMotion();
  return (
    <View style={styles.story}>
      <Spinner accessibilityLabel="Loading animation example" size="huge" testID="spinner-motion" />
      <StoryStatus testID="spinner-motion-preference">
        {reduceMotion === undefined ? 'Motion preference pending' : reduceMotion ? 'Reduced motion enabled' : 'Motion enabled'}
      </StoryStatus>
    </View>
  );
}

export const Motion: Story = {
  render: () => <MotionExample />,
  parameters: {
    docs: {
      description: {
        story:
          'The arc rotates unless the native reduced-motion preference is enabled. The status reports that preference without changing it.',
      },
    },
  },
  wdio: {
    'renders changing native pixels unless reduced motion is enabled': async ({ browser, expect, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.elementScreenshot) {
        skip('This test requires native element screenshots.');
        return;
      }
      const preference = await browser.$('~spinner-motion-preference');
      await browser.waitUntil(async () => ['Motion enabled', 'Reduced motion enabled'].includes(await preference.getText()));
      const spinner = await browser.$('~spinner-motion');
      await expect(spinner).toExist();
      expect(await browser.isElementDisplayed(await spinner.elementId)).toBe(true);
      const frames = new Set<string>();
      for (let index = 0; index < 5; index++) {
        frames.add(await browser.takeElementScreenshot(await spinner.elementId));
        await browser.pause(117);
      }
      if ((await preference.getText()) === 'Motion enabled') {
        expect(frames.size).toBeGreaterThan(1);
      } else {
        expect(frames.size).toBe(1);
      }
    },
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Size">
        {sizes.map(({ label, value }) => (
          <StoryItem key={value} label={label}>
            <Spinner accessibilityLabel={`Loading ${label.toLowerCase()}`} size={value} />
          </StoryItem>
        ))}
      </StoryGroup>
      <StoryGroup label="Inline usage">
        <View style={styles.inlineRow}>
          <Spinner accessibilityLabel="Loading messages" size="small" />
          <Text style={styles.inlineText}>Loading messages</Text>
        </View>
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the size axis and the recommended inline composition with adjacent status text.',
      },
    },
  },
};

export const Size: Story = {
  render: () => (
    <StoryGroup label="Size">
      {sizes.map(({ label, value }) => (
        <StoryItem key={value} label={label}>
          <Spinner accessibilityLabel={`Loading ${label.toLowerCase()}`} size={value} />
        </StoryItem>
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spinner sizes step from 16px inline usage through 44px focal use.',
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <StoryGroup label="Accessibility">
      <Spinner accessibilityLabel="Loading profile" size="medium" />
      <Text style={styles.caption}>Use an explicit label such as “Loading profile”.</Text>
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spinner needs an accessible name when exposed directly. Provide a concise label that names the work in progress.',
      },
    },
  },
};

const styles = StyleSheet.create({
  caption: {
    fontSize: 11,
    fontWeight: '600',
  },
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  inlineRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  inlineText: {
    fontSize: 12,
  },
  item: {
    alignItems: 'center',
    gap: 4,
    minWidth: 56,
  },
  itemLabel: {
    fontSize: 11,
  },
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
