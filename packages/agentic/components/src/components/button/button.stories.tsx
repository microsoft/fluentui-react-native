/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';

import { Button } from './button';
import type { ButtonAppearance, ButtonShape, ButtonSize } from './button.types';

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

const appearances: readonly { label: string; value: ButtonAppearance }[] = [
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Outline', value: 'outline' },
  { label: 'Subtle', value: 'subtle' },
];

const sizes: readonly { label: string; value: ButtonSize }[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const shapes: readonly { label: string; value: ButtonShape }[] = [
  { label: 'Rounded', value: 'rounded' },
  { label: 'Square', value: 'square' },
  { label: 'Circle', value: 'circle' },
];

const addIcon = { fontSource: { codepoint: 0x2b, fontFamily: 'Arial' } } as const;
const regularStarIcon = { fontSource: { codepoint: 0x2606, fontFamily: 'Arial' } } as const;
const filledStarIcon = { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } } as const;

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: {
    appearance: 'secondary',
    content: 'Button',
    disabled: false,
    iconPosition: 'before',
    shape: 'rounded',
    size: 'medium',
    testID: 'agentic-storybook-button',
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
          'A Button triggers a single action or event. Use it for actions such as submitting, saving, or creating; use a link for navigation.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Appearance">
        {appearances.map(({ label, value }) => (
          <Button key={value} appearance={value} content={label} testID={`agentic-storybook-button-overview-${value}`} />
        ))}
      </StoryGroup>
      <StoryGroup label="Size">
        {sizes.map(({ label, value }) => (
          <Button key={value} content={label} size={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Content">
        <Button content="Text only" />
        <Button content="Icon and text" icon={addIcon} />
        <Button accessibilityLabel="Add item" icon={addIcon} />
      </StoryGroup>
      <StoryGroup label="Availability">
        <Button content="Enabled" />
        <Button content="Disabled" disabled />
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
        <Button key={value} appearance={value} content={label} icon={addIcon} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Secondary is the default. Use Primary for the highest-emphasis action, Outline for light containment, and Subtle for low-emphasis actions.',
      },
    },
  },
};

export const Size: Story = {
  render: () => (
    <View style={styles.story}>
      {sizes.map(({ label, value }) => (
        <StoryGroup key={value} label={label}>
          <Button content={label} size={value} />
          <Button content={`${label} with icon`} icon={addIcon} size={value} />
          <Button accessibilityLabel={`Add item (${label.toLowerCase()})`} icon={addIcon} size={value} />
        </StoryGroup>
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button supports Small, Medium, and Large sizes. Medium is the default.',
      },
    },
  },
};

export const Shape: Story = {
  render: () => (
    <StoryGroup label="Shape">
      {shapes.map(({ label, value }) =>
        value === 'rounded' ? (
          <Button key={value} content={label} shape={value} />
        ) : (
          <Button key={value} accessibilityLabel={`Add item (${label.toLowerCase()})`} icon={addIcon} shape={value} />
        ),
      )}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text buttons are rounded by default. Icon-only buttons are circular by default and can also be square.',
      },
    },
  },
};

export const Icon: Story = {
  render: () => (
    <StoryGroup label="Icon">
      <Button content="Before content" icon={addIcon} />
      <Button content="After content" icon={addIcon} iconPosition="after" />
      <Button accessibilityLabel="Add item" icon={addIcon} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The icon slot can appear before or after content. Icon-only buttons require an action-oriented accessibilityLabel and a visible tooltip in product UI.',
      },
    },
  },
};

export const Selected: Story = {
  render: () => (
    <StoryGroup label="Selection">
      <Button content="Not selected" icon={regularStarIcon} selected={false} selectedIcon={filledStarIcon} />
      <Button content="Selected" icon={regularStarIcon} selected selectedIcon={filledStarIcon} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Supplying selected enables toggle-button semantics. selectedIcon replaces icon in the selected state while the label layout remains stable.',
      },
    },
  },
};

export const ExternallyDrivenSelection: Story = {
  render: () => {
    const ToggleGroup = () => {
      const [selected, setSelected] = useState(false);
      return (
        <StoryGroup label={selected ? 'Selected' : 'Not selected'}>
          <Button
            content="Favorite"
            icon={regularStarIcon}
            onPress={() => setSelected(!selected)}
            selected={selected}
            selectedIcon={filledStarIcon}
          />
          <Button appearance="subtle" content="Reset" onPress={() => setSelected(false)} />
        </StoryGroup>
      );
    };
    return <ToggleGroup />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'A toggle button never changes its own state. The caller owns selected and updates it from onPress, which is why an external action such as Reset can change it just as easily.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <View style={styles.story}>
      {appearances.map(({ label, value }) => (
        <StoryGroup key={value} label={label}>
          <Button appearance={value} content="Enabled" />
          <Button appearance={value} content="Disabled" disabled />
        </StoryGroup>
      ))}
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled buttons are unavailable, expose disabled accessibility state, and do not receive focus.',
      },
    },
  },
};

export const WithLongText: Story = {
  render: () => (
    <StoryGroup label="Content width">
      <Button content="Short text" />
      <Button content="Long text wraps after it reaches the constrained width of the button" style={styles.longButton} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button content wraps when the root is constrained by its surrounding layout.',
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
