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
import type { InputProps } from './input.types';
import { useInput_unstable } from './useInput';
import { useInputStyles_unstable } from './useInputStyles';
import { renderInput_unstable } from './renderInput';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';

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
    'takes native focus from a physical pointer click': async (context) => {
      const { requireDesktopFocus, expectNativeState, expectWindowsPointerFocus } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser } = context;
      await (await browser.$('~focus-input-after')).click();
      await expectWindowsPointerFocus(context, 'focus-input-after');
      await (await browser.$('~focus-input')).click();
      await expectWindowsPointerFocus(context, 'focus-input');
      await expectNativeState(browser, 'focus-input-after', 'focused', false);
    },
  },
};

function FocusTreatmentProbe(props: InputProps) {
  const state = useInput_unstable(props);
  useInputStyles_unstable(state);
  return (
    <View>
      {renderInput_unstable(state)}
      <StoryStatus testID={`${props.testID}-indicator`}>{String(state.focusVisible)}</StoryStatus>
    </View>
  );
}

export const FocusTreatment: Story = {
  tags: ['desktop-focus'],
  render: () => (
    <View style={styles.story}>
      <Input accessibilityLabel="Focus treatment entry" testID="focus-field-entry" />
      {(['outline', 'underline'] as const).map((variant) => (
        <View key={variant} style={styles.row}>
          <FocusTreatmentProbe variant={variant} accessibilityLabel={variant} testID={`focus-field-${variant}`} />
          <FocusTreatmentProbe variant={variant} error accessibilityLabel={`${variant} error`} testID={`focus-field-${variant}-error`} />
          <FocusTreatmentProbe
            variant={variant}
            readOnly
            value="Read only"
            accessibilityLabel={`${variant} read only`}
            testID={`focus-field-${variant}-readonly`}
          />
        </View>
      ))}
      <Input disabled accessibilityLabel="Disabled field" testID="focus-field-disabled" />
      <Button content="After fields" testID="focus-field-after" />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Keyboard focus uses one outline ring or an additive underline; error and read-only boundaries remain visible.',
      },
    },
  },
  wdio: {
    'retains native editor focus and geometry through every focus-treatment variant': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (await browser.$('~focus-field-entry')).click();
      await expectNativeState(browser, 'focus-field-entry', 'focused', true);
      for (const variant of ['outline', 'underline']) {
        for (const suffix of ['', '-error', '-readonly']) {
          const id = `focus-field-${variant}${suffix}`;
          const field = await browser.$(`~${id}`);
          const before = await browser.getElementRect(await field.elementId);
          await browser.keys('\uE004');
          await expectNativeState(browser, id, 'focused', true);
          await expect(await browser.$(`~${id}-indicator`)).toHaveText('true');
          if (suffix === '-readonly') {
            expect(await field.getTagName()).toBe('textbox');
            await expect(field).toBeEnabled();
            await browser.keys('x');
            await expect(field).toHaveValue('Read only');
            await expectNativeState(browser, id, 'focused', true);
          }
          const after = await browser.getElementRect(await field.elementId);
          expect({ width: after.width, height: after.height }).toEqual({ width: before.width, height: before.height });
        }
      }
      await browser.keys('\uE004');
      await expectNativeState(browser, 'focus-field-after', 'focused', true);
      await expectNativeState(browser, 'focus-field-disabled', 'focused', false);
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
