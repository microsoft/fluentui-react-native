import type { DesktopTreeNode } from '@fluentui-react-native/desktop-driver';
import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';

function findNode(nodes: readonly DesktopTreeNode[], matches: (node: DesktopTreeNode) => boolean): DesktopTreeNode | undefined {
  for (const node of nodes) {
    if (matches(node)) return node;
    const child = findNode(node.children, matches);
    if (child) return child;
  }
  return undefined;
}

export async function readEditorValue(
  desktop: WdioStoryContext['desktop'],
  match: (node: DesktopTreeNode) => boolean,
): Promise<string | undefined> {
  const tree = await desktop.session.getTree();
  const preview = findNode(tree, (node) => node.testId === 'agentic-storybook-story-root');
  if (!preview) return undefined;
  const editor = findNode(
    [preview],
    (node) =>
      (node.role === 'textbox' || node.role === 'document') &&
      node.value !== undefined &&
      match({ ...node, value: node.value.replaceAll('\r\n', '\n') }),
  );
  return editor?.value?.replaceAll('\r\n', '\n');
}
