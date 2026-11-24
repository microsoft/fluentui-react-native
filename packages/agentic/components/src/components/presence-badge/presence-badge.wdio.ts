import type { DesktopTreeNode } from '@fluentui-react-native/desktop-driver';
import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';

function find(nodes: readonly DesktopTreeNode[], testId: string): DesktopTreeNode | undefined {
  for (const node of nodes) {
    if (node.testId === testId) return node;
    const child = find(node.children, testId);
    if (child) return child;
  }
  return undefined;
}

export async function expectNoAccessiblePresenceMark({ desktop, expect }: Pick<WdioStoryContext, 'desktop' | 'expect'>): Promise<void> {
  const tree = await desktop.session.getTree();
  expect(find(tree, 'presence-owner')).toBeDefined();
  expect(find(tree, 'passive-presence-mark')).toBeUndefined();
}
