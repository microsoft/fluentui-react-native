import { inspect } from 'node:util';

import { attach, remote } from 'webdriverio';

import type { DesktopInputMode, DesktopSessionInput } from '../authoring/input.js';
import type { DesktopStoryRunResult, DesktopStoryTestResult } from '../authoring/results.js';
import type { DesktopStoryExpectation } from '../authoring/storyTests.js';
import type { DesktopHostFeatures } from '../host/types.js';
import { ArtifactManager } from '../artifacts/ArtifactManager.js';
import { createDesktopDriverClient, DesktopElementClient, DesktopSessionClient } from '../client/DesktopDriverClient.js';
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
      'furn:features'?: Readonly<DesktopHostFeatures>;
      'furn:inputMode'?: 'accessible' | 'compatibility' | 'physical';
      'furn:launchMode'?: 'attach' | 'launch';
      'furn:storybook'?: boolean;
      'furn:target'?: string;
    }

    interface Browser {
      /** The session's input policy and the input it has delivered so far, by mechanism. */
      desktopInput(): Promise<DesktopSessionInput>;
      desktopListStories(): Promise<DesktopStoryManifest>;
      desktopOpenStory(storyId: string, runId?: string): Promise<StoryReadyResult>;
      desktopResetStory(storyId: string, runId?: string): Promise<StoryReadyResult>;
      desktopExpect(expectation: DesktopStoryExpectation): Promise<void>;
      desktopRunStoryTests(options?: DesktopWebdriverRunOptions): Promise<DesktopStoryRunResult>;
    }

    interface Element {
      /**
       * Performs the one accessibility action the element publishes under this name, such as `increment`, without
       * moving the pointer or pressing a key. Declare `perform-accessibility-action` in a case that calls it.
       */
      desktopPerformAccessibilityAction(name: string): Promise<void>;
    }
  }
}

export type DesktopWebdriverOptions = {
  clickMode?: DesktopClickMode;
  /** Supervisor-provided credential. Never put it in capabilities, command lines, or logs. */
  grant?: string;
  /** The input the session may deliver. A strict mode pins the click mode. Defaults to `compatibility`. */
  inputMode?: DesktopInputMode;
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
  grant?: string;
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

  /** The session's input policy and what it has delivered so far. */
  input(): Promise<DesktopSessionInput> {
    return this.session.getInput();
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
      ...(options.inputMode === undefined ? {} : { 'furn:inputMode': options.inputMode }),
      'furn:launchMode': options.launchMode ?? 'launch',
      'furn:target': options.targetId,
    },
  );
  const browser = await remote({
    ...connectionOptions(options.url),
    ...(options.grant === undefined ? {} : desktopWebdriverGrantOptions(options.grant)),
    capabilities,
    logLevel: options.logLevel ?? 'silent',
  });
  return installDesktopWebdriverCommands(browser, options.url, { grant: options.grant });
}

// WebdriverIO applies these defaults in remote() but not attach(). Without an interval, waitUntil and the waitFor*
// commands stop after their first unsatisfied poll instead of honoring their timeout.
const attachedWaitDefaults = { waitforInterval: 100, waitforTimeout: 5_000 } as const;

/** The caller retains ownership of the existing session and must delete it after the worker exits. */
export async function attachDesktopWebdriver(options: DesktopWebdriverAttachment): Promise<DesktopWebdriverSession> {
  const browser = await attach({
    ...connectionOptions(options.url),
    capabilities: options.capabilities,
    sessionId: options.sessionId,
    options: {
      logLevel: 'silent',
      ...attachedWaitDefaults,
      ...(options.grant === undefined ? {} : desktopWebdriverGrantOptions(options.grant)),
    },
  });
  return installDesktopWebdriverCommands(browser, options.url, { grant: options.grant });
}

/** Transport-only configuration for a WDIO-managed session. The token stays out of serialized WDIO options. */
export function desktopWebdriverGrantOptions(grant: string): Pick<Parameters<typeof remote>[0], 'transformRequest'> {
  if (typeof grant !== 'string' || !/^fdg1\.[0-9a-f]{32}\.[A-Za-z0-9_-]{43}$/.test(grant)) {
    throw new TypeError('A valid Desktop Driver grant is required.');
  }
  return {
    transformRequest(request) {
      const headers = new Headers(request.headers);
      headers.set('Authorization', `Bearer ${grant}`);
      // WDIO errors retain request options. Standard inspection must not print the credential with those errors.
      Object.defineProperty(headers, inspect.custom, {
        value: () => {
          const redacted = new Headers(headers);
          redacted.set('Authorization', '[redacted]');
          return redacted;
        },
      });
      return { ...request, headers, redirect: 'error' };
    },
  };
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

const installedBrowsers = new WeakSet<WebdriverIO.Browser>();
const installedStoryBrowsers = new WeakSet<WebdriverIO.Browser>();
const boundSessions = new WeakMap<WebdriverIO.Browser, DesktopWebdriverSession>();

/** Bind a WDIO-managed browser without creating a competing remote session. */
export function installDesktopWebdriverCommands(
  browser: WebdriverIO.Browser,
  url: string,
  options: { grant?: string } = {},
): DesktopWebdriverSession {
  if (browser.capabilities.browserName !== 'furn-native-desktop') {
    throw new TypeError('Native desktop compatibility requires a Desktop Driver session.');
  }
  const client = createDesktopDriverClient({ grant: options.grant, url });
  const session = new DesktopSessionClient(client, browser.sessionId, Object.fromEntries(Object.entries(browser.capabilities)));
  const desktop = new DesktopWebdriverSession(browser, session);
  boundSessions.set(browser, desktop);

  if (!installedBrowsers.has(browser)) {
    // WDIO otherwise inherits the session-wide screenshot command on elements.
    browser.addCommand(
      'takeScreenshot',
      async function (this: WebdriverIO.Element) {
        return this.takeElementScreenshot(this.elementId);
      },
      { attachToElement: true },
    );
    browser.overwriteCommand(
      'isDisplayed',
      async function (this: WebdriverIO.Element) {
        const id = await nativeElementId(this);
        return id ? this.isElementDisplayed(id) : false;
      },
      { attachToElement: true },
    );
    browser.overwriteCommand(
      'isFocused',
      async function (this: WebdriverIO.Element) {
        const id = await nativeElementId(this);
        if (!id) return false;
        const focused = await this.getElementProperty(id, 'focused');
        if (typeof focused !== 'boolean') throw new Error('Desktop Driver did not report native focus as a boolean.');
        return focused;
      },
      { attachToElement: true },
    );
    browser.overwriteCommand(
      'setValue',
      async function (this: WebdriverIO.Element, originalCommand, value: string | number) {
        const inputMode = boundSessions.get(browser)!.session.capabilities['furn:inputMode'];
        if (inputMode === 'accessible') {
          throw new Error(`setValue would deliver keyboard input, which a session with input mode "${inputMode}" never delivers.`);
        }
        return originalCommand(value);
      },
      { attachToElement: true },
    );
    browser.addCommand(
      'desktopPerformAccessibilityAction',
      async function (this: WebdriverIO.Element, name: string) {
        const id = await nativeElementId(this);
        if (!id) throw new Error('The element was not found, so it has no accessibility action to perform.');
        await new DesktopElementClient(boundSessions.get(browser)!.session, id).performAccessibilityAction(name);
      },
      { attachToElement: true },
    );
    browser.addCommand('desktopExpect', (expectation: DesktopStoryExpectation) => boundSessions.get(browser)!.expect(expectation));
    browser.addCommand('desktopInput', () => boundSessions.get(browser)!.input());
    installedBrowsers.add(browser);
  }
  if (browser.capabilities['furn:storybook'] && !installedStoryBrowsers.has(browser)) {
    browser.addCommand('desktopListStories', () => boundSessions.get(browser)!.listStories());
    browser.addCommand('desktopOpenStory', (storyId: string, runId?: string) => boundSessions.get(browser)!.openStory(storyId, runId));
    browser.addCommand('desktopResetStory', (storyId: string, runId?: string) => boundSessions.get(browser)!.resetStory(storyId, runId));
    browser.addCommand('desktopRunStoryTests', (runOptions?: DesktopWebdriverRunOptions) =>
      boundSessions.get(browser)!.runStoryTests(runOptions),
    );
    installedStoryBrowsers.add(browser);
  }

  return desktop;
}

async function nativeElementId(element: WebdriverIO.Element): Promise<string | undefined> {
  // Like WDIO's native visibility path, retry the selector when the first lookup preceded the native render.
  if (!element.elementId) element.elementId = (await element.parent.$(element.selector).getElement()).elementId;
  return element.elementId;
}
