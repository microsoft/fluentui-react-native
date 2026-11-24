import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Text } from '../text/text';
import { Scrollbar } from './scrollbar';

const styles = StyleSheet.create({
  scene: { width: 240, gap: 8 },
  pane: { width: 220, height: 100 },
  row: { padding: 8 },
  horizontalContent: { width: 340 },
});
const rows = ['Overview', 'Importing files', 'Resolving conflicts', 'Privacy settings', 'Keyboard shortcuts', 'Support'];
const meta: Meta<typeof Scrollbar> = {
  title: 'Components/Scrollbar',
  component: Scrollbar,
  argTypes: { orientation: { control: 'select', options: ['vertical', 'horizontal'] }, scrollOwner: { control: false } },
};
export default meta;
type Story = WdioStory<StoryObj<typeof Scrollbar>>;
export const Default: Story = {
  render: (args) => (
    <Scrollbar
      {...args}
      scrollOwner={{
        children: rows.map((row) => (
          <Text style={styles.row} key={row}>
            {row}
          </Text>
        )),
      }}
      style={styles.pane}
    />
  ),
};
export const NativePanes: Story = {
  tags: ['flex-third-wave'],
  render: function NativePanesScene() {
    const [scrolled, setScrolled] = useState(false);
    return (
      <View style={styles.scene}>
        <Text>Document sections</Text>
        <Scrollbar
          style={styles.pane}
          scrollOwner={{
            testID: 'document-viewport',
            scrollEventThrottle: 16,
            onScroll: (event) => {
              if (event.nativeEvent.contentOffset.y > 0) setScrolled(true);
            },
            children: rows.map((row) => (
              <Text key={row} style={styles.row}>
                {row}
              </Text>
            )),
          }}
        />
        <StoryStatus testID="scroll-offset-state">{scrolled ? 'Viewport scrolled' : 'At top'}</StoryStatus>
        <Scrollbar
          orientation="horizontal"
          enabled={false}
          scrollOwner={{ children: <Text style={styles.horizontalContent}>This horizontally scrollable pane hides its indicator.</Text> }}
        />
      </View>
    );
  },
  wdio: [
    desktopIt('SCB-002 renders the bounded native scroll viewport', async (context) => {
      const { expect } = context;
      const { findDocumentViewport } = await import('./scrollbar.wdio.ts');
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      expect(await (await findDocumentViewport(context)).isDisplayed()).toBe(true);
      await recordVisualReview(context, 'scrollbar');
    }),
    desktopIt('SCB-003 physical wheel moves the real viewport', { requires: ['physical-click', 'wheel'] }, async (context) => {
      const { browser, expect } = context;
      const { findDocumentViewport } = await import('./scrollbar.wdio.ts');
      const viewport = await findDocumentViewport(context);
      await viewport.click();
      await browser.performActions([
        {
          id: 'scrollbar-wheel',
          type: 'wheel',
          actions: [
            {
              type: 'scroll',
              origin: { 'element-6066-11e4-a52e-4f735466cecf': viewport.id },
              duration: 0,
              x: 0,
              y: 0,
              deltaX: 0,
              deltaY: 120,
            },
          ],
        },
      ]);
      await expect(await browser.$('~scroll-offset-state')).toHaveAttribute('name', 'Viewport scrolled');
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'scrollbar-scrolled');
    }),
  ],
};
