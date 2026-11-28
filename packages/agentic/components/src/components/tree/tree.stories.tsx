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
      <Tree {...args} testID="tree-folders" selectionMode="multiple" defaultSelectedKeys={['icons']} />
    </View>
  ),
  wdio: [
    desktopIt(
      'TRE-003 Win32 expands the branch and cascades native mixed state',
      { platforms: ['win32'], requires: ['perform-accessibility-action'] },
      async (context) => {
        const { browser, expect } = context;
        const branch = await browser.$('~tree-design');
        expect(await branch.getTagName()).toBe('treeitem');
        expect(await branch.getProperty('expanded')).toBe(false);
        expect(await branch.getProperty('checked')).toBe('mixed');
        await branch.desktopPerformAccessibilityAction('Expand');
        const icons = await browser.$('~tree-icons');
        await icons.waitForExist();
        expect(await branch.getProperty('expanded')).toBe(true);
        expect(await icons.getProperty('checked')).toBe(true);
        const tokens = await browser.$('~tree-tokens');
        expect(await tokens.getProperty('checked')).toBe(false);
        await branch.desktopPerformAccessibilityAction('Toggle');
        await browser.waitUntil(async () => (await tokens.getProperty('checked')) === true);
        expect(await branch.getProperty('checked')).toBe(true);
        const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
        await recordVisualReview(context, 'tree-checked');
      },
    ),
    desktopIt(
      'TRI-004 Windows reports native level and sibling position',
      {
        platforms: ['windows', 'win32'],
        requires: ['perform-accessibility-action'],
        unsupported: {
          platforms: ['win32'],
          reason: 'Installed Office REX omits UIA Level on the branch; native hierarchy metadata remains gated under #4384.',
        },
      },
      async ({ browser, expect }) => {
        const branch = await browser.$('~tree-design');
        expect(await branch.getProperty('level')).toBe(1);
        await branch.desktopPerformAccessibilityAction('Expand');
        const icons = await browser.$('~tree-icons');
        await icons.waitForExist();
        expect(await icons.getProperty('level')).toBe(2);
        expect(await icons.getProperty('positionInSet')).toBe(1);
        expect(await icons.getProperty('sizeOfSet')).toBe(2);
      },
    ),
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
