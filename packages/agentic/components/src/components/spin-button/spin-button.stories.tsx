import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { SpinButton } from './spin-button';

const parse = (text: string): number | null => (text.trim() && Number.isFinite(Number(text)) ? Number(text) : null);
const meta: Meta<typeof SpinButton> = {
  title: 'Components/SpinButton',
  component: SpinButton,
  args: { accessibilityLabel: 'Quantity', incrementLabel: 'Increase quantity', decrementLabel: 'Decrease quantity', defaultValue: 3 },
};
export default meta;
type Story = WdioStory<StoryObj<typeof SpinButton>>;
export const Default: Story = {
  tags: ['flex-fourth-wave', 'mac-appkit-foundation'],
  render: (args) => (
    <SpinButton {...args} min={0} max={10} format={String} parse={parse} editorTestID="quantity-editor" style={{ width: 155 }} />
  ),
  wdio: [
    desktopIt(
      'SPBNU-001 steps the real native editor',
      { platforms: ['macos'], requires: ['physical-click', 'keyboard', 'focus'] },
      async (context) => {
        const { browser, expect } = context;
        const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
        await (await browser.$('~quantity-editor')).click();
        await browser.keys('\uE013');
        await expect(await browser.$('~quantity-editor')).toHaveAttribute('value', '4');
        await recordVisualReview(context, 'spin-button');
      },
    ),
    desktopIt(
      'SPBNU-004 dispatches native adjustment on the value-bearing editor',
      { platforms: ['macos'], requires: ['accessibility-actions', 'perform-accessibility-action'] },
      async ({ browser, expect }) => {
        const editor = await browser.$('~quantity-editor');
        expect(await editor.getProperty('accessibilityActions')).toContain('AXIncrement');
        await editor.desktopPerformAccessibilityAction('AXIncrement');
        await expect(editor).toHaveAttribute('value', '4');
      },
    ),
  ],
};
