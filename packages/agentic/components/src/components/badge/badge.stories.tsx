/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Badge } from './badge';
import type { BadgeAppearance, BadgeColor, BadgeLayout, BadgeShape, BadgeSize } from './badge.types';

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

const badgeLeadingIcon = { fontSource: { codepoint: 0x2022, fontFamily: 'Arial' } } as const;
const badgeTrailingIcon = { fontSource: { codepoint: 0x2713, fontFamily: 'Arial' } } as const;

const appearances: readonly { label: string; value: BadgeAppearance }[] = [
  { label: 'Tint', value: 'tint' },
  { label: 'Outline', value: 'outline' },
];

const colors: readonly { label: string; value: BadgeColor }[] = [
  { label: 'Brand', value: 'brand' },
  { label: 'Danger', value: 'danger' },
  { label: 'Success', value: 'success' },
  { label: 'Warning', value: 'warning' },
  { label: 'Informative', value: 'informative' },
];

const sizes: readonly { label: string; value: BadgeSize }[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
];

const shapes: readonly { label: string; value: BadgeShape }[] = [
  { label: 'Circular', value: 'circular' },
  { label: 'Rounded', value: 'rounded' },
];

const layouts: readonly { label: string; value: BadgeLayout }[] = [
  { label: 'Icon and text', value: 'iconAndText' },
  { label: 'Icon only', value: 'iconOnly' },
];

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  args: {
    appearance: 'tint',
    color: 'brand',
    content: 'Badge',
    layout: 'iconAndText',
    leadingIcon: badgeLeadingIcon,
    leadingIconVisible: true,
    shape: 'circular',
    size: 'medium',
    trailingIconVisible: false,
  },
  argTypes: {
    appearance: { control: 'select', options: appearances.map(({ value }) => value) },
    color: { control: 'select', options: colors.map(({ value }) => value) },
    content: { control: 'text' },
    layout: { control: 'select', options: layouts.map(({ value }) => value) },
    leadingIcon: { control: false },
    leadingIconVisible: { control: 'boolean' },
    shape: { control: 'select', options: shapes.map(({ value }) => value) },
    size: { control: 'select', options: sizes.map(({ value }) => value) },
    trailingIcon: { control: false },
    trailingIconVisible: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Badge is a non-interactive indicator for counts, statuses, and categories. It uses tint or outline styling, semantic color tokens, and optional leading and trailing icons.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Appearance">
        {appearances.map(({ label, value }) => (
          <Badge key={value} appearance={value} content={label} leadingIcon={badgeLeadingIcon} />
        ))}
      </StoryGroup>
      <StoryGroup label="Color">
        {colors.map(({ label, value }) => (
          <Badge key={value} color={value} content={label} leadingIcon={badgeLeadingIcon} />
        ))}
      </StoryGroup>
      <StoryGroup label="Size">
        {sizes.map(({ label, value }) => (
          <Badge key={value} content={label} leadingIcon={badgeLeadingIcon} size={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Layout">
        <Badge content="Icon and text" leadingIcon={badgeLeadingIcon} trailingIcon={badgeTrailingIcon} trailingIconVisible />
        <Badge accessibilityLabel="Verified" layout="iconOnly" leadingIcon={badgeLeadingIcon} />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the appearance, color, size, and layout variants.',
      },
    },
  },
};

export const Appearance: Story = {
  render: () => (
    <StoryGroup label="Appearance">
      {appearances.map(({ label, value }) => (
        <Badge key={value} appearance={value} content={label} leadingIcon={badgeLeadingIcon} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tint is the default. Outline trades fill for a semantic stroke.',
      },
    },
  },
};

export const Color: Story = {
  render: () => (
    <StoryGroup label="Color">
      {colors.map(({ label, value }) => (
        <Badge key={value} color={value} content={label} leadingIcon={badgeLeadingIcon} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Brand, Danger, Success, Warning, and Informative map to semantic Fluent color families.',
      },
    },
  },
};

export const Size: Story = {
  render: () => (
    <StoryGroup label="Size">
      {sizes.map(({ label, value }) => (
        <Badge key={value} content={label} leadingIcon={badgeLeadingIcon} size={value} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Small and Medium change height, icon size, and typography scale.',
      },
    },
  },
};

export const Shape: Story = {
  render: () => (
    <StoryGroup label="Shape">
      {shapes.map(({ label, value }) => (
        <Badge key={value} content={label} leadingIcon={badgeLeadingIcon} shape={value} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Circular reads as a true badge; Rounded softens the corners for rectangular contexts.',
      },
    },
  },
};

export const Layout: Story = {
  render: () => (
    <StoryGroup label="Layout">
      <Badge content="Icon and text" leadingIcon={badgeLeadingIcon} trailingIcon={badgeTrailingIcon} trailingIconVisible />
      <Badge accessibilityLabel="Verified" layout="iconOnly" leadingIcon={badgeLeadingIcon} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon and text shows the label and optional icons. Icon only hides the label and needs an accessibility label.',
      },
    },
  },
};

export const IconVisibility: Story = {
  render: () => (
    <StoryGroup label="Icon visibility">
      <Badge content="Both" leadingIcon={badgeLeadingIcon} trailingIcon={badgeTrailingIcon} trailingIconVisible />
      <Badge content="Leading only" leadingIcon={badgeLeadingIcon} />
      <Badge
        content="Trailing only"
        leadingIcon={badgeLeadingIcon}
        trailingIcon={badgeTrailingIcon}
        leadingIconVisible={false}
        trailingIconVisible
      />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Leading and trailing icon visibility is controlled independently in Icon and text layout.',
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
