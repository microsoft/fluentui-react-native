import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { Label } from '../label/label';
import { Textarea } from './textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  args: { accessibilityLabel: 'Review comment', placeholder: 'Write a comment' },
};
export default meta;
type Story = WdioStory<StoryObj<typeof Textarea>>;
export const Default: Story = {};
export const Comments: Story = {
  tags: ['flex-second-wave'],
  render: () => (
    <View style={{ width: 240, gap: 6 }}>
      <Label content="Review comment" weight="strong" />
      <Textarea accessibilityLabel="Review comment" testID="comment-editor" defaultValue={'First line\nSecond line'} />
      <Textarea
        accessibilityLabel="Submitted comment"
        testID="comment-read-only"
        value={'Submitted\nNo more edits'}
        readOnly
        size="small"
      />
    </View>
  ),
  wdio: [
    desktopIt('TXA-004 exposes the original multiline value in the native preview', async (context) => {
      const { readEditorValue } = await import('./textarea.wdio.ts');
      context
        .expect(await readEditorValue(context.desktop, (node) => node.value === 'First line\nSecond line'))
        .toBe('First line\nSecond line');
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'textarea');
    }),
    desktopIt(
      'TXA-004 exposes the editor name on macOS Paper and Office Win32',
      { scope: { 'rn.renderer': ['paper'] } },
      async ({ browser, expect }) => {
        await expect(await browser.$('~comment-editor')).toHaveAttribute('name', 'Review comment');
      },
    ),
    desktopIt(
      'TXA-004 exposes the editor name on Fabric',
      {
        scope: { 'rn.renderer': ['fabric'] },
        unsupported: {
          platforms: ['macos'],
          reason: 'RNmacOS Fabric multiline hosts can lose their accessibility name and ID on remount.',
        },
      },
      async ({ browser, expect }) => {
        await expect(await browser.$('~comment-editor')).toHaveAttribute('name', 'Review comment');
      },
    ),
    desktopIt(
      'TXA-002 Return inserts a newline inside the editor',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, desktop, platform, expect }) => {
        const { readEditorValue } = await import('./textarea.wdio.ts');
        if (platform === 'macos') {
          const editors = await desktop.session.findElements('-furn:text', 'First line\nSecond line');
          expect(editors).toHaveLength(1);
          await editors[0].click();
        } else {
          await (await browser.$('~comment-editor')).click();
        }
        await browser.waitUntil(
          async () => (await readEditorValue(desktop, (node) => node.states.focused === true)) === 'First line\nSecond line',
          { timeout: 5000, timeoutMsg: 'The value-bearing multiline editor did not own native focus.' },
        );
        await browser.keys('\uE007');
        await browser.waitUntil(
          async () => {
            const value = await readEditorValue(desktop, (node) => node.states.focused === true);
            return value?.split('\n').length === 3 && value.replaceAll('\n', '') === 'First lineSecond line';
          },
          { timeout: 5000, timeoutMsg: 'Return did not insert exactly one newline in the native editor.' },
        );
      },
    ),
  ],
};
