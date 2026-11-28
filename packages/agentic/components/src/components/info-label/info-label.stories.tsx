import { StyleSheet, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Text } from '../text/text';
import { InfoLabel } from './info-label';

const styles = StyleSheet.create({ scene: { width: 265, gap: 8 }, help: { maxWidth: 240 } });
const help = {
  triggerLabel: 'Explain retention period',
  surfaceLabel: 'Retention help',
  children: (
    <View style={styles.help}>
      <Text>Retention starts after the last edit and counts calendar days.</Text>
      <Button content="Read policy" testID="retention-policy" />
    </View>
  ),
};
const meta: Meta<typeof InfoLabel> = {
  title: 'Components/InfoLabel',
  component: InfoLabel,
  args: { content: 'Retention period' },
  argTypes: { size: { control: 'select', options: ['small', 'medium', 'large'] }, help: { control: false } },
};
export default meta;
type Story = WdioStory<StoryObj<typeof InfoLabel>>;
export const Default: Story = { render: (args) => <InfoLabel {...args} help={help} /> };
export const FormHelp: Story = {
  tags: ['flex-third-wave'],
  render: (args) => (
    <View style={styles.scene}>
      <InfoLabel {...args} content="Retention period for archived documents" size="large" required help={help} />
      <Input textInput={{ accessibilityLabel: 'Retention period', testID: 'retention-editor' }} />
      <InfoLabel content="Inherited policy" size="small" disabled help={{ ...help, triggerLabel: 'Explain inherited policy' }} />
    </View>
  ),
  wdio: [
    desktopIt('IFL-001 opens separately named help without renaming the editor', { requires: ['click'] }, async (context) => {
      const { browser, expect } = context;
      const { inWindowWith } = await import('../menu/menu.wdio.ts');
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await expect(await browser.$('~retention-editor')).toHaveAttribute('name', 'Retention period');
      await recordVisualReview(context, 'info-label');
      await (await browser.$('=Explain retention period')).click();
      await inWindowWith(context, 'retention-policy', async () => {
        await expect(await browser.$('~retention-policy')).toBeDisplayed();
        await recordVisualReview(context, 'info-label-open');
      });
    }),
  ],
};
