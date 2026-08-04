import type { Meta, StoryObj } from '@storybook/react-native';
import { Button } from './button';

/**
 * Storybook stories for the {@link Button} component. These are loaded by the storybook app in
 * `packages/agentic-components/storybook` via its `.storybook/main` stories glob.
 */
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: {
    content: 'Button',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    content: 'Disabled',
    disabled: true,
  },
};

export const Primary: Story = {
  args: {
    appearance: 'primary',
    content: 'Primary',
  },
};

export const Selected: Story = {
  args: {
    content: 'Selected',
    selected: true,
  },
};

export const IconOnly: Story = {
  args: {
    accessibilityLabel: 'Confirm',
    content: null,
    icon: { fontSource: { codepoint: 0x2713 } },
  },
};
