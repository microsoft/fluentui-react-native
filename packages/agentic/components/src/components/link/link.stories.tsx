/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

import { Link } from './link';
import type { LinkTypeSet } from './link.types';

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

const typeSets: readonly { label: string; value: LinkTypeSet }[] = [
  { label: 'Functional', value: 'functional' },
  { label: 'Content', value: 'content' },
];

const openInNewIcon = { fontSource: { codepoint: 0x2197, fontFamily: 'Arial' } } as const;

const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  args: {
    content: 'Open the invoice',
    disabled: false,
    inline: false,
    testID: 'agentic-storybook-link',
    typeSet: 'functional',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    inline: { control: 'boolean' },
    typeSet: { control: 'select', options: typeSets.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A Link takes the user somewhere else. Use it for navigation and use a button for actions. Because the label reads at body-text color, the underline is the affordance.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Link>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'link-role-and-focus',
          title: 'Exposes the link role and takes focus',
          requires: ['element-screenshot', 'focus'],
          steps: [
            { action: 'wait', target: { testId: 'agentic-storybook-link' } },
            { expect: { state: 'role', target: { testId: 'agentic-storybook-link' }, value: 'link' } },
            { expect: { state: 'enabled', target: { testId: 'agentic-storybook-link' }, value: true } },
            { action: 'click', target: { testId: 'agentic-storybook-link' } },
            { expect: { state: 'focused', target: { testId: 'agentic-storybook-link' }, value: true } },
            { action: 'screenshot', name: 'link-focused', target: { testId: 'agentic-storybook-link' } },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Type set">
        {typeSets.map(({ label, value }) => (
          <Link key={value} content={label} typeSet={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Trailing icon">
        <Link content="Open the report" icon={openInNewIcon} />
      </StoryGroup>
      <StoryGroup label="State">
        <Link content="Enabled" />
        <Link content="Unavailable" disabled />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the type sets, the trailing glyph, and availability.',
      },
    },
  },
};

export const TypeSet: Story = {
  render: () => (
    <StoryGroup label="Type set">
      {typeSets.map(({ label, value }) => (
        <Link key={value} content={label} typeSet={value} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Functional is the default and matches product UI type. Content matches editorial type. Neither Windows nor macOS draws a dotted underline, so the two type sets differ only in typography today.',
      },
    },
  },
};

export const Inline: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Inline">
        <Text style={styles.paragraph}>
          Read the <Link content="privacy statement" inline /> before continuing.
        </Text>
      </StoryGroup>
      <StoryGroup label="Standalone">
        <Link content="Privacy statement" />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'An inline link stays underlined and inherits the surrounding typography. A standalone link supplies its own typography and reveals the underline on press or focus.',
      },
    },
  },
};

export const TrailingIcon: Story = {
  render: () => (
    <StoryGroup label="Trailing icon">
      <Link content="Open the report" icon={openInNewIcon} />
      <Link content="Open the report" />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use the trailing glyph to warn that activation leaves the current surface. The glyph is never separately accessible.',
      },
    },
  },
};

export const Navigation: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Platform navigation">
        <Link content="Open example.com" onNavigationError={(error) => console.warn(String(error))} url="https://example.com" />
      </StoryGroup>
      <StoryGroup label="Delegated navigation">
        <Link content="Open settings" onPress={() => undefined} />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Setting a url opens it through the platform linking module after onPress runs. Omit url and handle onPress yourself when the host owns routing.',
      },
    },
  },
};

export const State: Story = {
  render: () => (
    <StoryGroup label="State">
      <Link content="Enabled" />
      <Link content="Unavailable" disabled />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A disabled link leaves the tab order, reports its disabled state, and cannot navigate.',
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
  paragraph: {
    maxWidth: 320,
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
