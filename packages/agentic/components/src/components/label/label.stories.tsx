import { useCallback, useRef } from 'react';
import { TextInput, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { Label } from './label';

const meta: Meta<typeof Label> = { title: 'Components/Label', component: Label, args: { content: 'Project code', required: true } };
export default meta;
type Story = WdioStory<StoryObj<typeof Label>>;
export const Default: Story = {};

function Example() {
  const ref = useRef<TextInput>(null);
  const focus = useCallback(() => ref.current?.focus(), []);
  const fieldName = 'Project code';
  return (
    <View style={{ width: 220, gap: 6 }}>
      <Label
        content={fieldName}
        weight="strong"
        required
        labelID="project-code-label"
        target={{ kind: 'editor', focus }}
        testID="label-caption"
      />
      <TextInput ref={ref} accessibilityLabel={fieldName} style={{ minHeight: 28, borderWidth: 1 }} testID="label-editor" />
      <Label content="Unavailable label" size="small" required disabled />
      <Label content="An example label that can wrap within the available width" size="large" />
    </View>
  );
}

export const Form: Story = {
  tags: ['flex-second-wave'],
  render: () => <Example />,
  wdio: [
    desktopIt('LBL-003 exposes the fallback name on the real text editor', async (context) => {
      const { browser, expect } = context;
      const editor = await browser.$('~label-editor');
      const label = await browser.$('~label-caption');
      await expect(label).toHaveAttribute('name', 'Project code');
      await expect(editor).toHaveAttribute('name', await label.getAttribute('name'));
      expect(await editor.getTagName()).toBe('textbox');
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'label');
    }),
    desktopIt(
      'LBL-004 pointer activation delegates focus to the actual editor',
      { requires: ['physical-click', 'focus'], platforms: ['macos'] },
      async ({ browser }) => {
        const { expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
        await (await browser.$('~label-caption')).click();
        await expectNativeState(browser, 'label-editor', 'focused', true);
      },
    ),
  ],
};
