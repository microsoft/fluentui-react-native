import type { FakeDesktopHost } from '../hosts/fake/FakeDesktopHost.js';
import type { DesktopStoryManifest, StoryOrchestrator, StoryReadyResult, StorySelectionRequest } from '../storybook.js';

export class FakeStoryOrchestrator implements StoryOrchestrator {
  readonly argUpdates: { args: Readonly<Record<string, unknown>>; storyId: string }[] = [];

  private readonly host: FakeDesktopHost;
  private readonly manifest: DesktopStoryManifest;
  private current: StoryReadyResult | null = null;
  private generation = 0;

  constructor(manifest: DesktopStoryManifest, host: FakeDesktopHost) {
    this.manifest = manifest;
    this.host = host;
  }

  async getCurrentStory(): Promise<StoryReadyResult | null> {
    return this.current;
  }

  async getManifest(): Promise<DesktopStoryManifest> {
    return this.manifest;
  }

  selectStory(request: StorySelectionRequest): Promise<StoryReadyResult> {
    return this.select(request);
  }

  resetStory(request: StorySelectionRequest): Promise<StoryReadyResult> {
    return this.select(request);
  }

  async updateArgs(storyId: string, args: Readonly<Record<string, unknown>>): Promise<void> {
    this.requireStory(storyId);
    this.argUpdates.push({ args, storyId });
  }

  private async select(request: StorySelectionRequest): Promise<StoryReadyResult> {
    this.requireStory(request.storyId);
    this.host.resetPreview();
    this.current = {
      previewGeneration: ++this.generation,
      runId: request.runId,
      storyId: request.storyId,
    };
    this.host.setElementName('story-root', JSON.stringify(this.current));
    return this.current;
  }

  private requireStory(storyId: string): void {
    if (!this.manifest.entries.some(({ id }) => id === storyId)) {
      throw new Error(`Story "${storyId}" is not present in the fake target manifest.`);
    }
  }
}
