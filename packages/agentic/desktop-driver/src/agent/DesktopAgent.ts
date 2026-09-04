import type { DesktopArtifact, DesktopStoryRunResult } from '../authoring/results.js';
import type { DesktopStoryExpectation, DesktopStorySelector } from '../authoring/storyTests.js';
import { ArtifactManager } from '../artifacts/ArtifactManager.js';
import type { DesktopTreeNode } from '../host/types.js';
import { DesktopAssertionError, assertDesktopExpectation, findDesktopElement } from '../runner/StoryTestRunner.js';
import { WebDriverError } from '../protocol/errors.js';
import type { DesktopStoryManifestEntry } from '../storybook.js';
import { connectDesktopWebdriver } from '../wdio/DesktopWebdriver.js';
import type { DesktopWebdriverOptions, DesktopWebdriverSession } from '../wdio/DesktopWebdriver.js';

export type DesktopAgentOptions = DesktopWebdriverOptions & {
  artifactsRoot: string;
};

export type DesktopAgentStory = Pick<DesktopStoryManifestEntry, 'id' | 'name' | 'tags' | 'title'> & {
  tests: readonly { id: string; title: string }[];
};

export type DesktopAgentElement = {
  accessibleName: unknown;
  enabled: boolean;
  id: string;
  role: string;
  selected: boolean;
  text: string;
};

export type DesktopAgentCheckResult = {
  message?: string;
  passed: boolean;
};

export type DesktopAgentDescribeOptions = {
  depth?: number;
  maxNodes?: number;
  scope?: 'application' | 'story';
};

export class DesktopAgent {
  private readonly artifacts: ArtifactManager;
  private readonly desktop: DesktopWebdriverSession;
  private readonly captured: DesktopArtifact[] = [];

  constructor(desktop: DesktopWebdriverSession, artifacts: ArtifactManager) {
    this.desktop = desktop;
    this.artifacts = artifacts;
  }

  async listStories(): Promise<DesktopAgentStory[]> {
    const manifest = await this.desktop.listStories();
    return manifest.entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      tags: entry.tags,
      tests: (entry.tests?.tests ?? []).map((test) => ({ id: test.id, title: test.title ?? test.id })),
      title: entry.title,
    }));
  }

  async explainStory(storyId: string): Promise<DesktopAgentStory> {
    const story = (await this.listStories()).find(({ id }) => id === storyId);
    if (!story) {
      throw new Error(`Story "${storyId}" is not present in the active platform manifest.`);
    }
    return story;
  }

  openStory(storyId: string): Promise<{ previewGeneration: number; runId: string; storyId: string }> {
    return this.desktop.openStory(storyId);
  }

  async describe(options: DesktopAgentDescribeOptions = {}): Promise<DesktopTreeNode[]> {
    const depth = options.depth ?? 3;
    const maxNodes = options.maxNodes ?? 100;
    if (!Number.isInteger(depth) || depth < 0 || !Number.isInteger(maxNodes) || maxNodes < 1) {
      throw new TypeError('Agent tree depth must be non-negative and maxNodes must be positive.');
    }
    const roots = await this.desktop.session.getTree();
    const scoped =
      options.scope === 'story'
        ? roots.flatMap((root) =>
            findTreeNodes(root, (node) => node.testId === 'story-root' || (node.testId?.endsWith('-story-root') ?? false)),
          )
        : roots;
    let remaining = maxNodes;
    return scoped.flatMap((root) => {
      const projected = projectTree(root, depth, () => remaining-- > 0);
      return projected ? [projected] : [];
    });
  }

  async find(selector: DesktopStorySelector): Promise<DesktopAgentElement> {
    const element = await findDesktopElement(this.desktop.session, selector);
    return {
      accessibleName: await element.getAttribute('name'),
      enabled: await element.isEnabled(),
      id: element.id,
      role: await element.getTagName(),
      selected: await element.isSelected(),
      text: await element.getText(),
    };
  }

  async click(selector: DesktopStorySelector): Promise<void> {
    await (await findDesktopElement(this.desktop.session, selector)).click();
  }

  async type(selector: DesktopStorySelector, text: string): Promise<void> {
    await (await findDesktopElement(this.desktop.session, selector)).sendKeys(text);
  }

  async check(expectation: DesktopStoryExpectation): Promise<DesktopAgentCheckResult> {
    try {
      await assertDesktopExpectation(this.desktop.session, expectation);
      return { passed: true };
    } catch (error) {
      if (error instanceof DesktopAssertionError || (error instanceof WebDriverError && error.code === 'no such element')) {
        return { message: error.message, passed: false };
      }
      throw error;
    }
  }

  async screenshot(name: string): Promise<DesktopArtifact> {
    const artifact = this.artifacts.writeAgentScreenshot(name, await this.desktop.session.takeScreenshot());
    this.captured.push(artifact);
    return artifact;
  }

  runStoryTest(storyId: string, testId: string): Promise<DesktopStoryRunResult> {
    return this.desktop.runStoryTests({
      artifactsRoot: this.artifacts.root,
      selection: { story: storyId, test: testId },
    });
  }

  getArtifacts(): readonly DesktopArtifact[] {
    return [...this.captured];
  }

  delete(): Promise<void> {
    return this.desktop.delete();
  }
}

export async function connectDesktopAgent(options: DesktopAgentOptions): Promise<DesktopAgent> {
  const artifacts = new ArtifactManager(options.artifactsRoot);
  const desktop = await connectDesktopWebdriver(options);
  return new DesktopAgent(desktop, artifacts);
}

function findTreeNodes(node: DesktopTreeNode, predicate: (node: DesktopTreeNode) => boolean): DesktopTreeNode[] {
  return [...(predicate(node) ? [node] : []), ...node.children.flatMap((child) => findTreeNodes(child, predicate))];
}

function projectTree(node: DesktopTreeNode, depth: number, take: () => boolean): DesktopTreeNode | undefined {
  if (!take()) {
    return undefined;
  }
  return {
    ...node,
    children:
      depth === 0
        ? []
        : node.children.flatMap((child) => {
            const projected = projectTree(child, depth - 1, take);
            return projected ? [projected] : [];
          }),
  };
}
