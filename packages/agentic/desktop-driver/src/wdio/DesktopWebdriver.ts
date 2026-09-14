import { attach, remote } from 'webdriverio';

import type { DesktopStoryRunResult, DesktopStoryTestResult } from '../authoring/results.js';
import type { DesktopStoryExpectation } from '../authoring/storyTests.js';
import { ArtifactManager } from '../artifacts/ArtifactManager.js';
import { createDesktopDriverClient, DesktopSessionClient } from '../client/DesktopDriverClient.js';
import type { DesktopClickMode, DesktopPlatformName } from '../protocol/types.js';
import { assertDesktopExpectation, runDesktopStoryTests } from '../runner/StoryTestRunner.js';
import type { DesktopStoryTestSelection } from '../runner/StoryTestRunner.js';
import type { DesktopStoryManifest, StoryReadyResult } from '../storybook.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace WebdriverIO {
    interface Capabilities {
      'furn:clickMode'?: 'accessibility' | 'auto' | 'physical';
      'furn:endpoint'?: 'macos' | 'win32' | 'windows';
      'furn:launchMode'?: 'attach' | 'launch';
      'furn:target'?: string;
    }

    interface Browser {
      desktopListStories(): Promise<DesktopStoryManifest>;
      desktopOpenStory(storyId: string, runId?: string): Promise<StoryReadyResult>;
      desktopResetStory(storyId: string, runId?: string): Promise<StoryReadyResult>;
      desktopExpect(expectation: DesktopStoryExpectation): Promise<void>;
      desktopRunStoryTests(options?: DesktopWebdriverRunOptions): Promise<DesktopStoryRunResult>;
    }
  }
}

export type DesktopWebdriverOptions = {
  clickMode?: DesktopClickMode;
  launchMode?: 'attach' | 'launch';
  logLevel?: 'debug' | 'error' | 'info' | 'silent' | 'trace' | 'warn';
  platformName: DesktopPlatformName;
  targetId: string;
  url: string;
};

export type DesktopWebdriverRunOptions = {
  artifactsRoot?: string;
  selection?: DesktopStoryTestSelection;
  signal?: AbortSignal;
  onTestResult?: (result: Readonly<DesktopStoryTestResult>) => void | Promise<void>;
};

export type DesktopWebdriverAttachment = {
  capabilities: NonNullable<Parameters<typeof attach>[0]['capabilities']>;
  sessionId: string;
  url: string;
};

export class DesktopWebdriverSession {
  readonly browser: WebdriverIO.Browser;
  readonly session: DesktopSessionClient;

  constructor(browser: WebdriverIO.Browser, session: DesktopSessionClient) {
    this.browser = browser;
    this.session = session;
  }

  listStories(): Promise<DesktopStoryManifest> {
    return this.session.getStoryManifest();
  }

  openStory(storyId: string, runId?: string): Promise<StoryReadyResult> {
    return this.session.selectStory(storyId, runId);
  }

  resetStory(storyId: string, runId?: string): Promise<StoryReadyResult> {
    return this.session.resetStory(storyId, runId);
  }

  expect(expectation: DesktopStoryExpectation): Promise<void> {
    return assertDesktopExpectation(this.session, expectation);
  }

  async runStoryTests(options: DesktopWebdriverRunOptions = {}): Promise<DesktopStoryRunResult> {
    const manifest = await this.session.getStoryManifest();
    const endpoint = this.session.capabilities['furn:endpoint'];
    const platformName = this.session.capabilities.platformName;
    const targetId = this.session.capabilities['furn:target'];
    if (
      (endpoint !== 'macos' && endpoint !== 'windows' && endpoint !== 'win32') ||
      (platformName !== 'macos' && platformName !== 'windows') ||
      typeof targetId !== 'string'
    ) {
      throw new Error('Desktop Driver returned incomplete platform capabilities.');
    }
    return runDesktopStoryTests({
      ...(options.artifactsRoot ? { artifacts: new ArtifactManager(options.artifactsRoot) } : {}),
      endpoint,
      manifest,
      onTestResult: options.onTestResult,
      platformName,
      selection: options.selection,
      session: this.session,
      signal: options.signal,
      targetId,
    });
  }

  async delete(): Promise<void> {
    await this.browser.deleteSession();
  }
}

export async function connectDesktopWebdriver(options: DesktopWebdriverOptions): Promise<DesktopWebdriverSession> {
  const capabilities = Object.assign(
    {
      browserName: 'furn-native-desktop',
      platformName: options.platformName,
    },
    {
      'furn:clickMode': options.clickMode ?? 'auto',
      'furn:launchMode': options.launchMode ?? 'launch',
      'furn:target': options.targetId,
    },
  );
  const browser = await remote({
    ...connectionOptions(options.url),
    capabilities,
    logLevel: options.logLevel ?? 'silent',
  });
  return bindDesktopCommands(browser, options.url);
}

/** The caller retains ownership of the existing session and must delete it after the worker exits. */
export async function attachDesktopWebdriver(options: DesktopWebdriverAttachment): Promise<DesktopWebdriverSession> {
  const browser = await attach({
    ...connectionOptions(options.url),
    capabilities: options.capabilities,
    sessionId: options.sessionId,
    options: { logLevel: 'silent' },
  });
  return bindDesktopCommands(browser, options.url);
}

function connectionOptions(address: string) {
  const url = new URL(address);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError('Desktop WebDriver requires an HTTP or HTTPS URL.');
  }
  return {
    hostname: url.hostname,
    path: url.pathname,
    port: Number(url.port || (url.protocol === 'https:' ? 443 : 80)),
    protocol: url.protocol === 'https:' ? ('https' as const) : ('http' as const),
  };
}

function bindDesktopCommands(browser: WebdriverIO.Browser, url: string): DesktopWebdriverSession {
  const client = createDesktopDriverClient({ url });
  const session = new DesktopSessionClient(client, browser.sessionId, Object.fromEntries(Object.entries(browser.capabilities)));
  const desktop = new DesktopWebdriverSession(browser, session);

  browser.addCommand('desktopListStories', () => desktop.listStories());
  browser.addCommand('desktopOpenStory', (storyId: string, runId?: string) => desktop.openStory(storyId, runId));
  browser.addCommand('desktopResetStory', (storyId: string, runId?: string) => desktop.resetStory(storyId, runId));
  browser.addCommand('desktopExpect', (expectation: DesktopStoryExpectation) => desktop.expect(expectation));
  browser.addCommand('desktopRunStoryTests', (runOptions?: DesktopWebdriverRunOptions) => desktop.runStoryTests(runOptions));

  return desktop;
}
