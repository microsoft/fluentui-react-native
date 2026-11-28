import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { Button } from '../button/button';
import { commandPressProps } from '../button/commandPress';
import { Input } from '../input/input';
import { Field } from './field';
import type { FieldBinding } from './field.types';

const styles = StyleSheet.create({ scene: { width: 330, gap: 12 } });
const editor = ({ label, size, disabled, invalid }: FieldBinding) => (
  <Input accessibilityLabel={label} size={size} disabled={disabled} error={invalid} textInput={{ testID: 'project-editor' }} />
);
const meta: Meta<typeof Field> = {
  title: 'Components/Field',
  component: Field,
  args: { label: 'Project code', helperText: 'Use the code on your invitation.' },
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    renderControl: { control: false },
  },
};
export default meta;
type Story = WdioStory<StoryObj<typeof Field>>;
export const Default: Story = { render: (args) => <Field {...args} renderControl={editor} /> };
export const Validation: Story = {
  tags: ['flex-third-wave'],
  render: function ValidationScene(args) {
    const [valid, setValid] = useState(false);
    return (
      <View style={styles.scene}>
        <Field
          {...args}
          required
          size="large"
          status={valid ? 'success' : 'error'}
          validationMessage={valid ? 'Ready to continue.' : 'Enter the four-digit project code from your latest invitation.'}
          renderControl={editor}
        />
        <Field
          label="Account name"
          orientation="horizontal"
          status="disabled"
          helperText="Managed by your organization."
          size="small"
          renderControl={({ label, size, disabled }) => <Input accessibilityLabel={label} size={size} disabled={disabled} />}
        />
        <Button {...commandPressProps(() => setValid(true), false)} content="Accept code" testID="accept-code" />
      </View>
    );
  },
  wdio: [
    desktopIt('FLD-002 replaces validation and retains the named editor and helper', { requires: ['click'] }, async (context) => {
      const { browser, expect } = context;
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await expect(await browser.$('=Enter the four-digit project code from your latest invitation.')).toBeDisplayed();
      await recordVisualReview(context, 'field');
      await (await browser.$('~accept-code')).click();
      await expect(await browser.$('=Ready to continue.')).toBeDisplayed();
      await expect(await browser.$('=Use the code on your invitation.')).toBeDisplayed();
      await expect(await browser.$('~project-editor')).toHaveAttribute('name', 'Project code');
    }),
    desktopIt(
      'FLD-001 preserves an edited value across a validation commit',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        await (await browser.$('~project-editor')).click();
        await (await browser.$('~project-editor')).addValue('123');
        await expect(await browser.$('~project-editor')).toHaveAttribute('value', '123');
        await (await browser.$('~accept-code')).click();
        await expect(await browser.$('~project-editor')).toHaveAttribute('value', '123');
      },
    ),
  ],
};
