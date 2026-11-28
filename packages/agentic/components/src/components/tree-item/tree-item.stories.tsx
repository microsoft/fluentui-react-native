import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { Tree } from '../tree/tree';
import { TreeItem } from './tree-item';

const meta: Meta<typeof TreeItem> = { title: 'Components/TreeItem', component: TreeItem };
export default meta;
type Story = WdioStory<StoryObj<typeof TreeItem>>;
export const BranchAndLeaf: Story = {
  tags: ['flex-fourth-wave'],
  render: () => (
    <View style={{ width: 240 }}>
      <Tree
        accessibilityLabel="Workspace"
        selectionMode="single"
        defaultOpenItems={['folder']}
        defaultSelectedKeys={['readme']}
        items={[
          {
            key: 'folder',
            label: 'Documentation',
            testID: 'tree-item-folder',
            children: [
              { key: 'readme', label: 'Readme', testID: 'tree-item-readme' },
              { key: 'recipes', label: 'Recipes' },
            ],
          },
        ]}
        renderItem={(entry) => (entry.key === 'readme' ? { description: 'Project overview' } : {})}
      />
    </View>
  ),
  wdio: [
    desktopIt('TRI-004 exposes distinct native branch and selected leaf states', async (context) => {
      const { browser, expect } = context;
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      const branch = await browser.$('~tree-item-folder');
      const leaf = await browser.$('~tree-item-readme');
      await expect(branch).toHaveAttribute('name', 'Documentation');
      await expect(leaf).toHaveAttribute('name', 'Readme');
      expect(await branch.getProperty('expanded')).toBe(true);
      expect(await leaf.getProperty('selected')).toBe(true);
      await recordVisualReview(context, 'tree-item');
    }),
  ],
};
