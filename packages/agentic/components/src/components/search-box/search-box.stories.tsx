import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { SearchBox } from './search-box';

const styles = StyleSheet.create({ scene: { width: 290, gap: 8 } });
const meta: Meta<typeof SearchBox> = {
  title: 'Components/SearchBox',
  component: SearchBox,
  args: { accessibilityLabel: 'Search projects', clearLabel: 'Clear search', placeholder: 'Search projects' },
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    variant: { control: 'select', options: ['outline', 'underline'] },
    value: { control: false },
  },
};
export default meta;
type Story = WdioStory<StoryObj<typeof SearchBox>>;
export const Default: Story = {};
export const ProjectSearch: Story = {
  tags: ['flex-third-wave'],
  render: function ProjectSearchScene(args) {
    const [query, setQuery] = useState('budget');
    const [submitted, setSubmitted] = useState<string>();
    const [clears, setClears] = useState(0);
    return (
      <View style={styles.scene}>
        <SearchBox
          {...args}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (!text) setClears((n) => n + 1);
          }}
          onSubmitQuery={setSubmitted}
          textInput={{ testID: 'project-search' }}
        />
        <SearchBox accessibilityLabel="Archived projects" clearLabel="Clear archive search" defaultValue="archive" disabled size="small" />
        <StoryStatus testID="search-count">{`Clear requests: ${clears}`}</StoryStatus>
        <StoryStatus testID="search-submit">{submitted === undefined ? 'Not submitted' : `Submitted: ${submitted}`}</StoryStatus>
      </View>
    );
  },
  wdio: [
    desktopIt('SRB-001 clears through the separate named action without submitting', { requires: ['click'] }, async (context) => {
      const { browser, expect } = context;
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await expect(await browser.$('~project-search')).toHaveAttribute('name', 'Search projects');
      await recordVisualReview(context, 'search-box');
      await (await browser.$('=Clear search')).click();
      await expect(await browser.$('~search-count')).toHaveAttribute('name', 'Clear requests: 1');
      await expect(await browser.$('~search-submit')).toHaveAttribute('name', 'Not submitted');
    }),
    desktopIt(
      'SRB-002 the clear action returns focus to the actual editor',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        const { expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
        await (await browser.$('~project-search')).click();
        await browser.keys('\uE004');
        await browser.waitUntil(async () => (await (await browser.$('=Clear search')).getProperty('focused')) === true);
        await browser.keys('\uE007');
        await expect(await browser.$('~search-count')).toHaveAttribute('name', 'Clear requests: 1');
        await expectNativeState(browser, 'project-search', 'focused', true);
      },
    ),
    desktopIt(
      'SRB-002 Escape clears a nonempty macOS editor without losing focus',
      { requires: ['physical-click', 'keyboard', 'focus'], platforms: ['macos'] },
      async ({ browser, expect }) => {
        const { expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
        await (await browser.$('~project-search')).click();
        await browser.keys('\uE00C');
        await expect(await browser.$('~search-count')).toHaveAttribute('name', 'Clear requests: 1');
        await expectNativeState(browser, 'project-search', 'focused', true);
      },
    ),
  ],
};
