/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { directComponent } from '@fluentui-react-native/framework-base';

import type { IconElementProps } from '../../primitives/icon/icon.types';

import { Input } from './input';
import { Button } from '../button/button';
import type { InputSize, InputVariant } from './input.types';

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

const sampleIcon = { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } } as const;

const SampleSvgIcon = directComponent<IconElementProps>(({ color, height, width, ...props }: IconElementProps) => (
  <View {...props} style={{ alignItems: 'center', height, justifyContent: 'center', width }}>
    <View style={{ backgroundColor: color, borderRadius: 9999, height: (height ?? 20) / 2, width: (width ?? 20) / 2 }} />
  </View>
));

const variants: readonly { label: string; value: InputVariant }[] = [
  { label: 'Outline', value: 'outline' },
  { label: 'Underline', value: 'underline' },
];

const sizes: readonly { label: string; value: InputSize }[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  args: {
    placeholder: 'Search files',
    size: 'medium',
    testID: 'agentic-storybook-input',
    variant: 'outline',
  },
  argTypes: {
    size: { control: 'select', options: sizes.map(({ value }) => value) },
    variant: { control: 'select', options: variants.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Input is a bare text entry control for short, single-line data. Use it with a label outside the component when you need a complete form field.',
      },
    },
  },
};

export default meta;

type Story = WdioStory<StoryObj<typeof Input>>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  wdio: {
    'accepts keyboard input and clears it': async ({ browser, expect, skip }) => {
      const features = browser.capabilities['furn:features'];
      if (!features) throw new Error('Desktop Driver did not provide feature capabilities.');
      if (!features.keyboard) {
        skip('This test requires keyboard input.');
        return;
      }
      const input = await browser.$('~agentic-storybook-input');
      expect(await input.getTagName()).toBe('textbox');
      await input.addValue('Ada');
      await expect(input).toHaveValue('Ada');
      await input.clearValue();
      await expect(input).toHaveValue('');
    },
  },
};

export const FocusManagement: Story = {
  tags: ['desktop-focus'],
  render: () => (
    <View style={styles.story}>
      <Input accessibilityLabel="Editable focus target" testID="focus-input" />
      <Input accessibilityLabel="Disabled focus target" disabled testID="focus-input-disabled" />
      <Button content="After the input" testID="focus-input-after" />
    </View>
  ),
  wdio: {
    'keeps editing keys in the TextInput and skips disabled fields on Tab': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      const input = await browser.$('~focus-input');
      await input.setValue('Ada');
      await expectNativeState(browser, 'focus-input', 'focused', true);
      await browser.keys('\uE012');
      await browser.keys('x');
      await expect(input).toHaveValue('Adxa');
      await expectNativeState(browser, 'focus-input', 'focused', true);
      await browser.keys('\uE004');
      await expectNativeState(browser, 'focus-input-after', 'focused', true);
      await expectNativeState(browser, 'focus-input-disabled', 'focused', false);
    },
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Variant">
        {variants.map(({ label, value }) => (
          <Input key={value} placeholder={label} variant={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Size">
        {sizes.map(({ label, value }) => (
          <Input key={value} placeholder={label} size={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Icons">
        <Input placeholder="Search" iconStart={sampleIcon} />
        <Input placeholder="Search" iconStart={sampleIcon} iconEnd1={sampleIcon} iconEnd2={sampleIcon} />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A quick scan of the main variant, size, and icon combinations.',
      },
    },
  },
};

export const Icons: Story = {
  render: () => (
    <StoryGroup label="Icons">
      <Input placeholder="Leading icon" iconStart={sampleIcon} />
      <Input placeholder="Trailing icons" iconEnd1={sampleIcon} iconEnd2={sampleIcon} />
      <Input placeholder="SVG icon" iconStart={{ svgSource: SampleSvgIcon }} />
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input accepts leading and trailing icon slots, including replacement icon renderers.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Unavailable',
  },
};

export const ReadOnly: Story = {
  args: {
    placeholder: 'Read only',
    readOnly: true,
    value: 'Value',
  },
};

export const Underline: Story = {
  args: {
    placeholder: 'Underline',
    variant: 'underline',
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
    alignItems: 'stretch',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  story: {
    alignItems: 'stretch',
    gap: 16,
    width: '100%',
  },
});
