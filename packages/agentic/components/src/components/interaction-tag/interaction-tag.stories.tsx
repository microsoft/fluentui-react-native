/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

import { InteractionTag } from './interaction-tag';
import type { InteractionTagAppearance, InteractionTagLayout, InteractionTagShape, InteractionTagSize } from './interaction-tag.types';

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

const appearances: readonly { label: string; value: InteractionTagAppearance }[] = [
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
];

const layouts: readonly { label: string; value: InteractionTagLayout }[] = [
  { label: 'Icon and text', value: 'iconAndText' },
  { label: 'Icon only', value: 'iconOnly' },
];

const sizes: readonly { label: string; value: InteractionTagSize }[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
];

const shapes: readonly { label: string; value: InteractionTagShape }[] = [
  { label: 'Rounded', value: 'rounded' },
  { label: 'Circular', value: 'circular' },
];

const leadingIcon = { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } } as const;
const dismissIcon = { fontSource: { codepoint: 0x2715, fontFamily: 'Arial' } } as const;

const dismiss = { accessibilityLabel: 'Remove Engineering' } as const;

const meta: Meta<typeof InteractionTag> = {
  title: 'Components/InteractionTag',
  component: InteractionTag,
  args: {
    appearance: 'secondary',
    content: 'Engineering',
    dismiss: { accessibilityLabel: 'Remove Engineering', testID: 'agentic-storybook-interaction-tag-dismiss' },
    layout: 'iconAndText',
    primaryAction: { testID: 'agentic-storybook-interaction-tag-primary' },
    shape: 'rounded',
    size: 'medium',
    testID: 'agentic-storybook-interaction-tag',
  },
  argTypes: {
    appearance: { control: 'select', options: appearances.map(({ value }) => value) },
    disabled: { control: 'boolean' },
    layout: { control: 'select', options: layouts.map(({ value }) => value) },
    shape: { control: 'select', options: shapes.map(({ value }) => value) },
    size: { control: 'select', options: sizes.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'InteractionTag is a tag with two separate actions: a primary action that opens the thing the tag names, and a dismiss action that removes it. Each action is its own hit target and its own tab stop.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof InteractionTag>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'independent-regions',
          title: 'Exposes two independently focusable button regions',
          requires: ['element-screenshot', 'focus'],
          steps: [
            { action: 'wait', target: { testId: 'agentic-storybook-interaction-tag' } },
            { expect: { state: 'role', target: { testId: 'agentic-storybook-interaction-tag-primary' }, value: 'button' } },
            { expect: { state: 'role', target: { testId: 'agentic-storybook-interaction-tag-dismiss' }, value: 'button' } },
            { expect: { state: 'enabled', target: { testId: 'agentic-storybook-interaction-tag-primary' }, value: true } },
            { expect: { state: 'enabled', target: { testId: 'agentic-storybook-interaction-tag-dismiss' }, value: true } },
            { action: 'click', target: { testId: 'agentic-storybook-interaction-tag-primary' } },
            { expect: { state: 'focused', target: { testId: 'agentic-storybook-interaction-tag-primary' }, value: true } },
            { expect: { state: 'focused', target: { testId: 'agentic-storybook-interaction-tag-dismiss' }, value: false } },
            {
              action: 'screenshot',
              name: 'interaction-tag-primary-focused',
              target: { testId: 'agentic-storybook-interaction-tag' },
            },
            { action: 'click', target: { testId: 'agentic-storybook-interaction-tag-dismiss' } },
            { expect: { state: 'focused', target: { testId: 'agentic-storybook-interaction-tag-dismiss' }, value: true } },
            { expect: { state: 'focused', target: { testId: 'agentic-storybook-interaction-tag-primary' }, value: false } },
            {
              action: 'screenshot',
              name: 'interaction-tag-dismiss-focused',
              target: { testId: 'agentic-storybook-interaction-tag' },
            },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Appearance">
        {appearances.map(({ label, value }) => (
          <InteractionTag key={value} appearance={value} content={label} dismiss={dismiss} leadingIcon={leadingIcon} />
        ))}
      </StoryGroup>
      <StoryGroup label="Layout">
        <InteractionTag content="Icon and text" dismiss={dismiss} leadingIcon={leadingIcon} />
        <InteractionTag
          dismiss={dismiss}
          layout="iconOnly"
          leadingIcon={leadingIcon}
          primaryAction={{ accessibilityLabel: 'Open Engineering' }}
        />
      </StoryGroup>
      <StoryGroup label="Size">
        {sizes.map(({ label, value }) => (
          <InteractionTag key={value} content={label} dismiss={dismiss} leadingIcon={leadingIcon} size={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="State">
        <InteractionTag content="Enabled" dismiss={dismiss} leadingIcon={leadingIcon} />
        <InteractionTag content="Disabled" disabled dismiss={dismiss} leadingIcon={leadingIcon} />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the main appearance, layout, size, and availability variants.',
      },
    },
  },
};

export const Appearance: Story = {
  render: () => (
    <StoryGroup label="Appearance">
      {appearances.map(({ label, value }) => (
        <InteractionTag key={value} appearance={value} content={label} dismiss={dismiss} dismissIcon={dismissIcon} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Secondary is the default. Primary is the highest-emphasis surface and takes a lighter divider.',
      },
    },
  },
};

export const Layout: Story = {
  render: () => (
    <StoryGroup label="Layout">
      <InteractionTag content="Icon and text" dismiss={dismiss} leadingIcon={leadingIcon} />
      <InteractionTag
        dismiss={dismiss}
        layout="iconOnly"
        leadingIcon={leadingIcon}
        primaryAction={{ accessibilityLabel: 'Open Engineering' }}
      />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon only drops the content and always uses the circular radius, so the primary action needs its own name.',
      },
    },
  },
};

export const Size: Story = {
  render: () => (
    <View style={styles.story}>
      {sizes.map(({ label, value }) => (
        <StoryGroup key={value} label={label}>
          <InteractionTag content={label} dismiss={dismiss} leadingIcon={leadingIcon} size={value} />
          <InteractionTag
            dismiss={dismiss}
            layout="iconOnly"
            leadingIcon={leadingIcon}
            primaryAction={{ accessibilityLabel: `Open ${label}` }}
            size={value}
          />
        </StoryGroup>
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Small and Medium sizes. Medium is the default, and the dismiss action stays at or above a 24 pixel target box.',
      },
    },
  },
};

export const Shape: Story = {
  render: () => (
    <StoryGroup label="Shape">
      {shapes.map(({ label, value }) => (
        <InteractionTag key={value} content={label} dismiss={dismiss} leadingIcon={leadingIcon} shape={value} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Each action rounds only its outer edge and stays square against the divider.',
      },
    },
  },
};

export const LeadingContent: Story = {
  render: () => (
    <StoryGroup label="Leading content">
      <InteractionTag content="No leading content" dismiss={dismiss} />
      <InteractionTag content="Leading icon" dismiss={dismiss} leadingIcon={leadingIcon} />
      <InteractionTag avatar={{ initials: 'CE' }} content="Cameron Evans" dismiss={{ accessibilityLabel: 'Remove Cameron Evans' }} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Leading content is an icon or an avatar, never both. Use an avatar for a person and an icon for a category.',
      },
    },
  },
};

export const Dismissing: Story = {
  render: function DismissingStory() {
    const [tags, setTags] = useState(['Design', 'Engineering', 'Research']);

    return (
      <StoryGroup label="Dismissing">
        {tags.map((tag) => (
          <InteractionTag
            key={tag}
            content={tag}
            dismiss={{
              accessibilityLabel: `Remove ${tag}`,
              onPress: () => setTags((current) => current.filter((entry) => entry !== tag)),
            }}
            leadingIcon={leadingIcon}
          />
        ))}
        {tags.length === 0 ? <Text style={styles.label}>All tags removed.</Text> : null}
      </StoryGroup>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'The component never removes itself. The dismiss action reports onPress and the caller drops the tag from its own data.',
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <StoryGroup label="Accessibility">
      <InteractionTag content="Engineering" dismiss={dismiss} leadingIcon={leadingIcon} />
      <InteractionTag
        dismiss={dismiss}
        layout="iconOnly"
        leadingIcon={leadingIcon}
        primaryAction={{ accessibilityLabel: 'Open Engineering' }}
      />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The dismiss action always needs an accessibilityLabel naming the tag it removes. An icon-only primary action needs one too.',
      },
    },
  },
};

export const ConstrainedText: Story = {
  render: () => (
    <StoryGroup label="Constrained text">
      <InteractionTag content="Short label" dismiss={dismiss} leadingIcon={leadingIcon} />
      <InteractionTag
        content="Long tag text shrinks before the dismiss action does"
        dismiss={dismiss}
        leadingIcon={leadingIcon}
        style={styles.longTag}
      />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The primary action shrinks when the surrounding layout constrains the width; the dismiss action keeps its target box.',
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
  longTag: {
    width: 220,
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
