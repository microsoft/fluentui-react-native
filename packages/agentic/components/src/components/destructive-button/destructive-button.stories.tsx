/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

import { DestructiveButton } from './destructive-button';
import type { DestructiveButtonAppearance, DestructiveButtonShape, DestructiveButtonSize } from './destructive-button.types';

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

const appearances: readonly { label: string; value: DestructiveButtonAppearance }[] = [
  { label: 'Primary', value: 'primary' },
  { label: 'Subtle', value: 'subtle' },
];

const sizes: readonly { label: string; value: DestructiveButtonSize }[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const shapes: readonly { label: string; value: DestructiveButtonShape }[] = [
  { label: 'Rounded', value: 'rounded' },
  { label: 'Circle', value: 'circle' },
];

const deleteIcon = { fontSource: { codepoint: 0x2716, fontFamily: 'Arial' } } as const;

const meta: Meta<typeof DestructiveButton> = {
  title: 'Components/DestructiveButton',
  component: DestructiveButton,
  args: {
    appearance: 'primary',
    content: 'Delete',
    disabled: false,
    iconPosition: 'before',
    shape: 'rounded',
    size: 'medium',
    testID: 'agentic-storybook-destructive-button',
  },
  argTypes: {
    appearance: { control: 'select', options: appearances.map(({ value }) => value) },
    iconPosition: { control: 'select', options: ['before', 'after'] },
    shape: { control: 'select', options: shapes.map(({ value }) => value) },
    size: { control: 'select', options: sizes.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A DestructiveButton triggers an irreversible or high-consequence action such as deleting, removing, or permanently discarding content. Reserve it for the confirming action itself; use Button for the surrounding neutral actions.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DestructiveButton>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'pointer-focus',
          title: 'Responds to activation and receives focus',
          requires: ['element-screenshot', 'focus'],
          steps: [
            { action: 'wait', target: { testId: 'agentic-storybook-destructive-button' } },
            { expect: { state: 'role', target: { testId: 'agentic-storybook-destructive-button' }, value: 'button' } },
            { expect: { state: 'enabled', target: { testId: 'agentic-storybook-destructive-button' }, value: true } },
            { action: 'click', target: { testId: 'agentic-storybook-destructive-button' } },
            { expect: { state: 'focused', target: { testId: 'agentic-storybook-destructive-button' }, value: true } },
            { action: 'screenshot', name: 'destructive-button-focused', target: { testId: 'agentic-storybook-destructive-button' } },
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
          <DestructiveButton
            key={value}
            appearance={value}
            content={label}
            testID={`agentic-storybook-destructive-button-overview-${value}`}
          />
        ))}
      </StoryGroup>
      <StoryGroup label="Size">
        {sizes.map(({ label, value }) => (
          <DestructiveButton key={value} content={label} size={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Content">
        <DestructiveButton content="Delete" />
        <DestructiveButton content="Delete" icon={deleteIcon} />
        <DestructiveButton accessibilityLabel="Delete item" icon={deleteIcon} />
      </StoryGroup>
      <StoryGroup label="Availability">
        <DestructiveButton content="Enabled" />
        <DestructiveButton content="Disabled" disabled />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the main appearance, size, content, and availability variants.',
      },
    },
  },
};

export const Appearance: Story = {
  render: () => (
    <StoryGroup label="Appearance">
      {appearances.map(({ label, value }) => (
        <DestructiveButton key={value} appearance={value} content={label} icon={deleteIcon} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Primary is the default and carries the full danger fill for the confirming action. Subtle keeps danger foreground on a transparent backplate for destructive actions embedded in dense surfaces such as list rows.',
      },
    },
  },
};

export const Size: Story = {
  render: () => (
    <View style={styles.story}>
      {sizes.map(({ label, value }) => (
        <StoryGroup key={value} label={label}>
          <DestructiveButton content={label} size={value} />
          <DestructiveButton content={`${label} with icon`} icon={deleteIcon} size={value} />
          <DestructiveButton accessibilityLabel={`Delete item (${label.toLowerCase()})`} icon={deleteIcon} size={value} />
        </StoryGroup>
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'DestructiveButton supports Small, Medium, and Large sizes. Medium is the default.',
      },
    },
  },
};

export const Shape: Story = {
  render: () => (
    <StoryGroup label="Shape">
      {shapes.map(({ label, value }) =>
        value === 'rounded' ? (
          <DestructiveButton key={value} content={label} shape={value} />
        ) : (
          <DestructiveButton key={value} accessibilityLabel={`Delete item (${label.toLowerCase()})`} icon={deleteIcon} shape={value} />
        ),
      )}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Text buttons are rounded by default and icon-only buttons are circular by default. DestructiveButton has no square shape, so a destructive action can never be mistaken for a neutral square Button.',
      },
    },
  },
};

export const Icon: Story = {
  render: () => (
    <StoryGroup label="Icon">
      <DestructiveButton content="Before content" icon={deleteIcon} />
      <DestructiveButton content="After content" icon={deleteIcon} iconPosition="after" />
      <DestructiveButton accessibilityLabel="Delete item" icon={deleteIcon} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The icon slot can appear before or after content. An icon-only destructive button requires an accessibilityLabel that names the consequence, not just the glyph, and a visible tooltip in product UI.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <View style={styles.story}>
      {appearances.map(({ label, value }) => (
        <StoryGroup key={value} label={label}>
          <DestructiveButton appearance={value} content="Enabled" />
          <DestructiveButton appearance={value} content="Disabled" disabled />
        </StoryGroup>
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A disabled destructive button drops the danger palette entirely so an unavailable action never reads as an armed one. It exposes disabled accessibility state and does not receive focus.',
      },
    },
  },
};

export const InConfirmationDialog: Story = {
  render: () => (
    <View style={styles.dialog}>
      <Text style={styles.dialogTitle}>Delete 3 files?</Text>
      <Text style={styles.dialogBody}>These files will be permanently removed. This cannot be undone.</Text>
      <View style={styles.dialogActions}>
        <DestructiveButton content="Delete" />
        <DestructiveButton appearance="subtle" content="Cancel" />
      </View>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The canonical usage: a confirmation surface names the consequence, and exactly one destructive action confirms it. In product UI the cancel action is a neutral Button; it appears here as a subtle DestructiveButton only to keep this story to a single component.',
      },
    },
  },
};

export const WithLongText: Story = {
  render: () => (
    <StoryGroup label="Content width">
      <DestructiveButton content="Delete" />
      <DestructiveButton content="Delete every selected item and empty the recycle bin" style={styles.longButton} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'DestructiveButton content wraps when the root is constrained by its surrounding layout.',
      },
    },
  },
};

const styles = StyleSheet.create({
  dialog: {
    alignItems: 'flex-start',
    gap: 8,
    maxWidth: 360,
  },
  dialogActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
  },
  dialogBody: {
    fontSize: 14,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  longButton: {
    width: 280,
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
