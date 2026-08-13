/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Tag } from './tag';
import type { TagAppearance, TagLayout, TagShape, TagSize } from './tag.types';

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

const appearances: readonly { label: string; value: TagAppearance }[] = [
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
];

const layouts: readonly { label: string; value: TagLayout }[] = [
  { label: 'Icon and text', value: 'iconAndText' },
  { label: 'Icon only', value: 'iconOnly' },
];

const sizes: readonly { label: string; value: TagSize }[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
];

const shapes: readonly { label: string; value: TagShape }[] = [
  { label: 'Rounded', value: 'rounded' },
  { label: 'Circular', value: 'circular' },
];

const leadingIcon = { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } } as const;
const dismissIcon = { fontSource: { codepoint: 0x2715, fontFamily: 'Arial' } } as const;

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
  args: {
    appearance: 'secondary',
    content: 'Tag text',
    dismiss: true,
    layout: 'iconAndText',
    shape: 'rounded',
    size: 'medium',
  },
  argTypes: {
    appearance: { control: 'select', options: appearances.map(({ value }) => value) },
    dismiss: { control: 'boolean' },
    layout: { control: 'select', options: layouts.map(({ value }) => value) },
    shape: { control: 'select', options: shapes.map(({ value }) => value) },
    size: { control: 'select', options: sizes.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Tag is a single dismissible label. Use it for filters, categories, or other content that is removed from the surface when activated.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tag>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Appearance">
        {appearances.map(({ label, value }) => (
          <Tag key={value} appearance={value} content={label} dismissIcon={dismissIcon} leadingIcon={leadingIcon} />
        ))}
      </StoryGroup>
      <StoryGroup label="Layout">
        <Tag content="Icon and text" dismissIcon={dismissIcon} leadingIcon={leadingIcon} />
        <Tag accessibilityLabel="Remove Engineering filter" dismissIcon={dismissIcon} layout="iconOnly" leadingIcon={leadingIcon} />
      </StoryGroup>
      <StoryGroup label="Size">
        {sizes.map(({ label, value }) => (
          <Tag key={value} content={label} dismissIcon={dismissIcon} leadingIcon={leadingIcon} size={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="State">
        <Tag content="Enabled" dismissIcon={dismissIcon} leadingIcon={leadingIcon} />
        <Tag content="Disabled" dismissIcon={dismissIcon} disabled leadingIcon={leadingIcon} />
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
        <Tag key={value} appearance={value} content={label} dismissIcon={dismissIcon} leadingIcon={leadingIcon} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Secondary is the default. Use Primary for the highest-emphasis tag surface.',
      },
    },
  },
};

export const Layout: Story = {
  render: () => (
    <StoryGroup label="Layout">
      <Tag content="Icon and text" dismissIcon={dismissIcon} leadingIcon={leadingIcon} />
      <Tag accessibilityLabel="Remove Engineering filter" dismissIcon={dismissIcon} layout="iconOnly" leadingIcon={leadingIcon} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon and text shows the label; Icon only removes the label and requires an action-oriented accessibility label.',
      },
    },
  },
};

export const Size: Story = {
  render: () => (
    <View style={styles.story}>
      {sizes.map(({ label, value }) => (
        <StoryGroup key={value} label={label}>
          <Tag content={label} dismissIcon={dismissIcon} leadingIcon={leadingIcon} size={value} />
          <Tag accessibilityLabel={`Remove ${label} filter`} dismissIcon={dismissIcon} layout="iconOnly" leadingIcon={leadingIcon} size={value} />
        </StoryGroup>
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tag supports Small and Medium sizes. Medium is the default.',
      },
    },
  },
};

export const Shape: Story = {
  render: () => (
    <StoryGroup label="Shape">
      {shapes.map(({ label, value }) => (
        <Tag key={value} content={label} dismissIcon={dismissIcon} leadingIcon={leadingIcon} shape={value} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Rounded is the default. Circular applies the pill radius even when the label is visible.',
      },
    },
  },
};

export const Dismiss: Story = {
  render: () => (
    <StoryGroup label="Dismiss">
      <Tag content="Dismiss on" dismissIcon={dismissIcon} leadingIcon={leadingIcon} />
      <Tag content="Dismiss off" dismiss={false} leadingIcon={leadingIcon} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dismiss toggles the trailing dismiss icon visibility while the whole surface remains the dismiss target.',
      },
    },
  },
};

export const Accessibility: Story = {
  render: () => (
    <StoryGroup label="Accessibility">
      <Tag accessibilityLabel="Remove Engineering filter" dismissIcon={dismissIcon} layout="iconOnly" leadingIcon={leadingIcon} />
      <Tag content="Engineering" dismissIcon={dismissIcon} leadingIcon={leadingIcon} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Icon-only tags need an action-oriented accessibilityLabel. Icon and text tags can use the visible label text as the accessible name.',
      },
    },
  },
};

export const ConstrainedText: Story = {
  render: () => (
    <StoryGroup label="Constrained text">
      <Tag content="Short label" dismissIcon={dismissIcon} leadingIcon={leadingIcon} />
      <Tag content="Long tag text wraps when the row constrains the width" dismissIcon={dismissIcon} leadingIcon={leadingIcon} style={styles.longTag} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tag content wraps when the surrounding layout constrains the width.',
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
