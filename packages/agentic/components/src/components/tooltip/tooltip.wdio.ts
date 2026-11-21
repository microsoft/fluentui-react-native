import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';

export async function checkHelpChanges({ desktop, browser, expect }: WdioStoryContext) {
  const { result: found } = await desktop.session.find({ automationId: 'wrapped-save' });
  expect(found.outcome).toBe('unique');
  const within = found.matches[0].ref;
  const update = await browser.$('~direct-tip');
  for (const [index, help] of ['Saves the current draft without publishing', 'Updated draft help', undefined].entries()) {
    if (index > 0) await update.click();
    await browser.waitUntil(
      async () => {
        const { result } = await desktop.session.observe({ within, format: 'nodes', facts: ['help'], view: 'all' });
        const anchor = result.nodes?.find((node) => node.automationId === 'wrapped-save');
        return anchor?.name === 'Save draft' && anchor.help === help;
      },
      { timeoutMsg: `Expected native trigger help at revision ${index}` },
    );
  }
}
