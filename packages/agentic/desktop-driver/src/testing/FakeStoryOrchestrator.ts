import type { FakeDesktopHost } from '../hosts/fake/FakeDesktopHost.js';
import type {
  DesktopStoryManifest,
  StoryOrchestrator,
  StoryProviderContext,
  StoryReadyResult,
  StorySelectionRequest,
} from '../storybook.js';

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

  async getCurrentStory(context?: StoryProviderContext): Promise<StoryReadyResult | null> {
    context?.signal.throwIfAborted();
    return this.current;
  }

  async getManifest(context?: StoryProviderContext): Promise<DesktopStoryManifest> {
    context?.signal.throwIfAborted();
    return this.manifest;
  }

  selectStory(request: StorySelectionRequest, context?: StoryProviderContext): Promise<StoryReadyResult> {
    context?.signal.throwIfAborted();
    return this.select(request);
  }

  resetStory(request: StorySelectionRequest, context?: StoryProviderContext): Promise<StoryReadyResult> {
    context?.signal.throwIfAborted();
    return this.select(request);
  }

  async updateArgs(storyId: string, args: Readonly<Record<string, unknown>>, context?: StoryProviderContext): Promise<void> {
    context?.signal.throwIfAborted();
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
