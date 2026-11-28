import { View, Pressable } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { Persona } from './persona';

const meta: Meta<typeof Persona> = {
  title: 'Components/Persona',
  component: Persona,
  args: { name: 'Ana Patel', secondaryText: 'Engineering' },
};
export default meta;
type Story = WdioStory<StoryObj<typeof Persona>>;
export const Default: Story = {};
export const Identities: Story = {
  tags: ['flex-second-wave'],
  render: () => (
    <View style={{ width: 240, gap: 12 }}>
      <Persona
        name="Ana Patel"
        secondaryText="Engineering"
        tertiaryText="Dublin"
        quaternaryText="Office 200"
        presence={{ status: 'away', label: 'Away' }}
        testID="persona-ana"
      />
      <Persona
        name="Bo Graham"
        size={40}
        layout="beforeAvatar"
        alignment="center"
        secondaryText="Partner design and research"
        testID="persona-bo"
      />
      <Pressable accessible accessibilityRole="button" accessibilityLabel="Open Mira’s profile" testID="persona-profile">
        <Persona name="Mira" decorative layout="belowAvatar" testID="persona-mira" />
      </Pressable>
    </View>
  ),
  wdio: [
    desktopIt('PSN-003 names standalone identities and leaves a nested action in charge', async (context) => {
      const { browser, desktop, expect } = context;
      await expect(await browser.$('~persona-ana')).toHaveAttribute('name', 'Ana Patel, Engineering, Dublin, Office 200, Away');
      await expect(await browser.$('~persona-bo')).toHaveAttribute('name', 'Bo Graham, Partner design and research');
      await expect(await browser.$('~persona-profile')).toHaveAttribute('name', 'Open Mira’s profile');
      expect(await desktop.session.findElements('link text', 'Mira')).toHaveLength(0);
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'persona');
    }),
  ],
};
