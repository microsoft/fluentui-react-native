import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Input } from '../input/input';
import { List } from './list';

const styles = StyleSheet.create({ scene: { width: 280, gap: 8 } });
const entries = [
  { key: 'notes', label: 'Release notes', testID: 'file-notes' },
  { key: 'template', label: 'Template unavailable', disabled: true, testID: 'file-template' },
  { key: 'report', label: 'Reports', testID: 'file-reports' },
];
const meta: Meta<typeof List> = { title: 'Components/List', component: List, args: { items: entries, accessibilityLabel: 'Documents' } };
export default meta;
type Story = WdioStory<StoryObj<typeof List>>;
export const Default: Story = {};
export const ChoosingDocuments: Story = {
  tags: ['flex-fourth-wave'],
  render: function ChoosingDocumentsScene(args) {
    const [selection, setSelection] = useState<readonly string[]>([]);
    return (
      <View style={styles.scene}>
        <Input accessibilityLabel="Filter documents" textInput={{ testID: 'file-list-entry' }} />
        <List {...args} selectionMode="multiple" selectedKeys={selection} onSelectionChange={setSelection} />
        <StoryStatus testID="file-list-selection">{selection.join(',') || 'No files selected'}</StoryStatus>
      </View>
    );
  },
  wdio: [
    desktopIt(
      'LST-002 directional focus skips disabled rows without selecting them',
      { requires: ['physical-click', 'keyboard', 'focus'], platforms: ['!win32'] },
      async (context) => {
        const { browser, expect } = context;
        const { focusByTab, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
        const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
        await focusByTab(browser, 'file-list-entry', 'file-notes');
        await browser.keys('\uE015');
        await expectNativeState(browser, 'file-reports', 'focused', true);
        await expect(await browser.$('~file-list-selection')).toHaveAttribute('name', 'No files selected');
        await browser.keys('\uE00D');
        await expect(await browser.$('~file-list-selection')).toHaveAttribute('name', 'report');
        await recordVisualReview(context, 'list');
      },
    ),
  ],
};
