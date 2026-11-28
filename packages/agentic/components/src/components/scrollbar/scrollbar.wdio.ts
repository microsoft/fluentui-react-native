import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';

export async function findDocumentViewport({ browser, desktop, platform }: Pick<WdioStoryContext, 'browser' | 'desktop' | 'platform'>) {
  const [identified] = await desktop.session.findElements('accessibility id', 'document-viewport');
  if (identified) return identified;
  if (platform !== 'macos') throw new Error('The ScrollView automation ID was not projected.');

  // AppKit can expose the backed scroll area without the RN wrapper's ID.
  const areas = await desktop.session.findElements('tag name', 'scrollarea');
  const measured = await Promise.all(areas.map(async (area) => ({ area, rect: await browser.getElementRect(area.id) })));
  const matches = measured.filter(({ rect }) => Math.abs(rect.width - 220) <= 1 && Math.abs(rect.height - 100) <= 1);
  if (matches.length !== 1) throw new Error(`Expected one bounded native document viewport, found ${matches.length}.`);
  return matches[0].area;
}
