/** @jsxImportSource @fluentui-react-native/framework-base */
import { useCallback, useState, type ReactNode } from 'react';
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

/**
 * Press-feedback scenario used by the desktop story tests.
 *
 * The counter is rendered as text so a native automation session can observe the result of a
 * press through the accessibility tree rather than through a screenshot.
 *
 * The pressable button carries an explicit `accessibilityLabel`. Verified against React Native
 * Windows 0.81: a Button whose label comes only from its `content` text is published to UI
 * Automation with an empty `Name`, so its accessible name is not portable and a shared desktop
 * spec cannot assert it without one.
 */
const InteractionDemo = () => {
  const [pressCount, setPressCount] = useState(0);
  const onPress = useCallback(() => setPressCount((count) => count + 1), []);

  return (
    <View style={styles.story}>
      <StoryGroup label="Press feedback">
        <Button accessibilityLabel="Press me" content="Press me" onPress={onPress} testID="agentic-storybook-button-interactive" />
        <Button
          accessibilityLabel="Unavailable"
          content="Unavailable"
          disabled
          onPress={onPress}
          testID="agentic-storybook-button-interactive-disabled"
        />
      </StoryGroup>
      <Text style={styles.status} testID="agentic-storybook-button-interactive-status">
        {pressCount === 0 ? 'Not pressed' : `Pressed ${pressCount}`}
      </Text>
    </View>
  );
};

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
    // React Native Windows publishes a Button whose label comes only from `content` with an empty
    // UI Automation `Name`, so the shared desktop plans below could not assert its text without
    // an explicit accessible name.
    accessibilityLabel: 'Button',
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
    selected: { control: 'boolean' },
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

export const Default: Story = {
  parameters: {
    // Desktop story test. `desktopTest` is a serializable plan read statically by
    // `@fluentui-react-native/desktop-driver`; the same plan runs unchanged on React Native
    // Windows and React Native macOS.
    desktopTest: {
      kind: 'inline',
      id: 'button-default',
      description: 'The default button renders, is enabled, and exposes its content as text.',
      steps: [
        { action: 'expectVisible', target: { testId: 'agentic-storybook-button' } },
        { action: 'expectEnabled', target: { testId: 'agentic-storybook-button' } },
        { action: 'expect', target: { testId: 'agentic-storybook-button' }, property: 'text', equals: 'Button' },
      ],
    },
  },
};

export const Interaction: Story = {
  render: () => <InteractionDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'An enabled button invokes onPress and a disabled button does not. This is the scenario the desktop story tests drive on Windows and macOS.',
      },
    },
    // This story needs sequencing and repeated presses, so it links a colocated WebdriverIO spec
    // instead of an inline plan. The spec is ordinary TypeScript and uses standard WebdriverIO.
    desktopTest: {
      kind: 'spec',
      id: 'button-interaction',
      description: 'Press feedback, repeated presses, disabled inertness, and focus after a press.',
      spec: './button.desktop.spec.ts',
    },
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Appearance">
        {appearances.map(({ label, value }) => (
          <Button key={value} appearance={value} content={label} />
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
  status: {
    fontSize: 14,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
