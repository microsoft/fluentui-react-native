import { ArtifactManager } from '@fluentui-react-native/desktop-driver/artifacts';
import type { WdioStoryContext } from '@fluentui-react-native/storybook-desktop/testing';

export async function recordVisualReview({ desktop, signal }: Pick<WdioStoryContext, 'desktop' | 'signal'>, story: string): Promise<void> {
  const batch = process.env.FURN_STORYBOOK_VISUAL_REVIEW;
  if (!batch) return;
  if (!/^[a-z0-9-]{1,48}$/.test(batch)) throw new Error('Visual review requires a short, lowercase artifact label.');

  const image = await desktop.session.takeScreenshot({ signal });
  new ArtifactManager('artifacts/visual-review').writeScreenshot([batch, story], 'window', image);
}
