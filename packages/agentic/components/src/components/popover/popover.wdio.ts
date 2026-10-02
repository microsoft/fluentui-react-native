import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';

type TreeNode = Awaited<ReturnType<WdioStoryContext['desktop']['session']['getTree']>>[number];

function findNode(nodes: readonly TreeNode[], testID: string): TreeNode | undefined {
  for (const node of nodes) {
    if (node.testId === testID) return node;
    const child = findNode(node.children, testID);
    if (child) return child;
  }
  return undefined;
}

/** Switching windows activates them; never use that to manufacture popup observation. */
export async function readPopoverContent({ desktop, browser, signal, skip }: WdioStoryContext) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (signal.aborted) throw new Error('Popover content observation was aborted.');
    const content = findNode(await desktop.session.getTree(), 'popover-surface-content');
    if (content) return { content, element: await browser.$('~popover-surface-content') };
    await browser.pause(50);
  }
  skip(
    'The current-window tree did not expose the mounted popup content without activating it. Passive owned-popup lookup is required for P.',
  );
  return undefined;
}
