import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { Input } from '../input/input';
import { Tree } from './tree';
import type { TreeNode } from './tree.types';

const items: readonly TreeNode[] = [
  {
    key: 'design',
    label: 'Design',
    testID: 'tree-design',
    children: [
      { key: 'icons', label: 'Icons', testID: 'tree-icons' },
      { key: 'tokens', label: 'Tokens', testID: 'tree-tokens' },
    ],
  },
  { key: 'tests', label: 'Tests', testID: 'tree-tests' },
];
const meta: Meta<typeof Tree> = { title: 'Components/Tree', component: Tree, args: { accessibilityLabel: 'Workspace files', items } };
export default meta;
type Story = WdioStory<StoryObj<typeof Tree>>;
export const Default: Story = {};
export const FolderExplorer: Story = {
  tags: ['flex-fourth-wave'],
  render: (args) => (
    <View style={{ width: 240, gap: 8 }}>
      <Input accessibilityLabel="Find files" textInput={{ testID: 'tree-entry' }} />
      <Tree {...args} selectionMode="multiple" defaultSelectedKeys={['icons']} />
    </View>
  ),
  wdio: [
    desktopIt(
      'TRE-002 expands a native focused branch without selecting it',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async (context) => {
        const { browser } = context;
        const { expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
        await focusByTab(browser, 'tree-entry', 'tree-design');
        await browser.keys('\uE014');
        await (await browser.$('~tree-icons')).waitForExist();
        await browser.keys('\uE014');
        await expectNativeState(browser, 'tree-icons', 'focused', true);
        await recordVisualReview(context, 'tree');
      },
    ),
  ],
};
