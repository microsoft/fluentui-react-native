import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Input } from '../input/input';
import { Link } from './link';

const styles = StyleSheet.create({ scene: { width: 215, gap: 8 } });
const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  args: { content: 'Team settings' },
  argTypes: { typography: { control: 'select', options: ['functional', 'content'] }, onNavigate: { control: false } },
};
export default meta;
type Story = WdioStory<StoryObj<typeof Link>>;
export const Default: Story = { render: ({ url: _url, ...args }) => <Link {...args} onNavigate={() => undefined} /> };
export const Destinations: Story = {
  tags: ['flex-third-wave'],
  render: function DestinationsScene() {
    const [count, setCount] = useState(0);
    return (
      <View style={styles.scene}>
        <Input accessibilityLabel="Search settings" textInput={{ testID: 'link-entry-editor' }} />
        <Link content="Account and notification settings for your team" testID="settings-link" onNavigate={() => setCount((n) => n + 1)} />
        <Link content="Team administration" disabled typography="content" onNavigate={() => setCount((n) => n + 1)} />
        <StoryStatus testID="link-count">{`Navigations: ${count}`}</StoryStatus>
      </View>
    );
  },
  wdio: [
    desktopIt('LNK-002 navigates once from a named link', { requires: ['click'] }, async (context) => {
      const { browser, expect } = context;
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await expect(await browser.$('~settings-link')).toHaveAttribute('name', 'Account and notification settings for your team');
      await recordVisualReview(context, 'link');
      const link = await context.desktop.session.findElement('accessibility id', 'settings-link');
      await link.click();
      await expect(await browser.$('~link-count')).toHaveAttribute('name', 'Navigations: 1');
    }),
    desktopIt(
      'LNK-002 Enter activates the focused link without Space activation',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        const { focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        await focusByTab(browser, 'link-entry-editor', 'settings-link');
        await browser.keys('\uE00D');
        await expect(await browser.$('~link-count')).toHaveAttribute('name', 'Navigations: 0');
        await browser.keys('\uE007');
        await expect(await browser.$('~link-count')).toHaveAttribute('name', 'Navigations: 1');
      },
    ),
  ],
};
