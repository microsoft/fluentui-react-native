import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';
type Node = Awaited<ReturnType<WdioStoryContext['desktop']['session']['getTree']>>[number];

function find(nodes: readonly Node[], id: string): Node | undefined {
  for (const node of nodes) {
    if (node.testId === id) return node;
    const child = find(node.children, id);
    if (child) return child;
  }
  return undefined;
}

export async function requireMenuPopup(context: WdioStoryContext, id: string): Promise<boolean> {
  if (context.platform !== 'macos') throw new Error('Menu story discovery must exclude gated Windows/Win32 endpoints.');
  const features = context.browser.capabilities['furn:features'];
  if (!features?.keyboard || !features.focus) {
    context.skip('Menu qualification requires physical keys and native focus observation.');
    return false;
  }
  for (let attempt = 0; attempt < 40; attempt++) {
    if (context.signal.aborted) throw new Error('Menu popup observation was aborted.');
    if (find(await context.desktop.session.getTree(), id)) return true;
    await context.browser.pause(50);
  }
  context.skip(
    'Passive owned-popup lookup did not expose the ready row. Switching windows activates them and cannot prove Menu initial focus.',
  );
  return false;
}

export async function nativeMenuFocus(context: WdioStoryContext, id: string) {
  await context.browser.waitUntil(async () => (await (await context.browser.$(`~${id}`)).getProperty('focused')) === true, {
    timeout: 5000,
    interval: 50,
    timeoutMsg: `Menu native focus did not reach ${id}.`,
  });
}

export async function openMenuByKeyboard(context: WdioStoryContext) {
  const { focusByTab } = await import('../../common/desktopFocus.wdio.ts');
  await focusByTab(context.browser, 'menu-entry-editor', 'menu-trigger');
  await context.browser.keys('\uE007');
}
