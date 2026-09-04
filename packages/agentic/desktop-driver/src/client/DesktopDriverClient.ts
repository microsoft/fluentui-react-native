import { randomUUID } from 'node:crypto';

import { WebDriverError } from '../protocol/errors.js';
import { webElementIdentifier } from '../protocol/constants.js';
import type { DesktopTreeNode } from '../host/types.js';
import type {
  NewSessionCapabilities,
  WebDriverActionSequence,
  WebDriverElement,
  WebDriverErrorResponse,
  WebDriverResponse,
  WebDriverTimeouts,
} from '../protocol/types.js';
import type { DesktopStoryManifest, StoryReadyResult } from '../storybook.js';

export type DesktopDriverClientOptions = {
  fetch?: typeof globalThis.fetch;
  url: string;
};

export class DesktopDriverClient {
  private readonly fetch: typeof globalThis.fetch;
  private readonly url: string;

  constructor({ fetch = globalThis.fetch, url }: DesktopDriverClientOptions) {
    this.fetch = fetch;
    this.url = url.replace(/\/$/, '');
  }

  status(): Promise<Record<string, unknown>> {
    return this.request('GET', '/status');
  }

  async newSession(capabilities: NewSessionCapabilities): Promise<DesktopSessionClient> {
    const value = await this.request<{ capabilities: Record<string, unknown>; sessionId: string }>('POST', '/session', {
      capabilities,
    });
    return new DesktopSessionClient(this, value.sessionId, value.capabilities);
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await this.fetch(`${this.url}${path}`, {
      method,
      ...(body === undefined
        ? {}
        : {
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
          }),
    });
    const payload = (await response.json()) as WebDriverResponse<T> | WebDriverErrorResponse;
    if (!response.ok) {
      const error = payload.value as WebDriverErrorResponse['value'];
      throw new WebDriverError(error.error as ConstructorParameters<typeof WebDriverError>[0], error.message, error.data);
    }
    return payload.value as T;
  }
}

export class DesktopSessionClient {
  private readonly driver: DesktopDriverClient;
  readonly id: string;
  readonly capabilities: Readonly<Record<string, unknown>>;

  constructor(driver: DesktopDriverClient, id: string, capabilities: Readonly<Record<string, unknown>>) {
    this.driver = driver;
    this.id = id;
    this.capabilities = capabilities;
  }

  delete(): Promise<null> {
    return this.command('DELETE', '');
  }

  getTimeouts(): Promise<WebDriverTimeouts> {
    return this.command('GET', '/timeouts');
  }

  setTimeouts(timeouts: Partial<WebDriverTimeouts>): Promise<null> {
    return this.command('POST', '/timeouts', timeouts);
  }

  getWindowHandle(): Promise<string> {
    return this.command('GET', '/window');
  }

  getWindowHandles(): Promise<string[]> {
    return this.command('GET', '/window/handles');
  }

  switchToWindow(handle: string): Promise<null> {
    return this.command('POST', '/window', { handle });
  }

  findElement(using: string, value: string): Promise<DesktopElementClient> {
    return this.command<WebDriverElement>('POST', '/element', { using, value }).then(
      (element) => new DesktopElementClient(this, element[webElementIdentifier]),
    );
  }

  findElements(using: string, value: string): Promise<DesktopElementClient[]> {
    return this.command<WebDriverElement[]>('POST', '/elements', { using, value }).then((elements) =>
      elements.map((element) => new DesktopElementClient(this, element[webElementIdentifier])),
    );
  }

  getActiveElement(): Promise<DesktopElementClient | null> {
    return this.command<WebDriverElement | null>('GET', '/element/active').then((element) =>
      element ? new DesktopElementClient(this, element[webElementIdentifier]) : null,
    );
  }

  performActions(actions: readonly WebDriverActionSequence[]): Promise<null> {
    return this.command('POST', '/actions', { actions });
  }

  releaseActions(): Promise<null> {
    return this.command('DELETE', '/actions');
  }

  takeScreenshot(): Promise<string> {
    return this.command('GET', '/screenshot');
  }

  getPageSource(): Promise<string> {
    return this.command('GET', '/source');
  }

  getTree(): Promise<DesktopTreeNode[]> {
    return this.command('GET', '/furn/tree');
  }

  getStoryManifest(): Promise<DesktopStoryManifest> {
    return this.command('GET', '/furn/manifest');
  }

  getCurrentStory(): Promise<StoryReadyResult | null> {
    return this.command('GET', '/furn/story');
  }

  selectStory(storyId: string, runId: string = randomUUID()): Promise<StoryReadyResult> {
    return this.command('POST', '/furn/story', { requestId: randomUUID(), runId, storyId });
  }

  resetStory(storyId: string, runId: string = randomUUID()): Promise<StoryReadyResult> {
    return this.command('POST', '/furn/story/reset', { requestId: randomUUID(), runId, storyId });
  }

  updateStoryArgs(storyId: string, args: Readonly<Record<string, unknown>>): Promise<null> {
    return this.command('POST', '/furn/story/args', { args, storyId });
  }

  command<T>(method: string, path: string, body?: unknown): Promise<T> {
    return this.driver.request(method, `/session/${this.id}${path}`, body);
  }
}

export class DesktopElementClient {
  private readonly session: DesktopSessionClient;
  readonly id: string;

  constructor(session: DesktopSessionClient, id: string) {
    this.session = session;
    this.id = id;
  }

  click(): Promise<null> {
    return this.command('POST', '/click', {});
  }

  focus(): Promise<null> {
    return this.command('POST', '/furn/focus', {});
  }

  clear(): Promise<null> {
    return this.command('POST', '/clear', {});
  }

  sendKeys(text: string): Promise<null> {
    return this.command('POST', '/value', { text });
  }

  getText(): Promise<string> {
    return this.command('GET', '/text');
  }

  getTagName(): Promise<string> {
    return this.command('GET', '/name');
  }

  isEnabled(): Promise<boolean> {
    return this.command('GET', '/enabled');
  }

  isDisplayed(): Promise<boolean> {
    return this.command('GET', '/displayed');
  }

  isSelected(): Promise<boolean> {
    return this.command('GET', '/selected');
  }

  getAttribute(name: string): Promise<unknown> {
    return this.command('GET', `/attribute/${encodeURIComponent(name)}`);
  }

  getProperty(name: string): Promise<unknown> {
    return this.command('GET', `/property/${encodeURIComponent(name)}`);
  }

  takeScreenshot(): Promise<string> {
    return this.command('GET', '/screenshot');
  }

  private command<T>(method: string, path: string, body?: unknown): Promise<T> {
    return this.session.command(method, `/element/${this.id}${path}`, body);
  }
}

export function createDesktopDriverClient(options: DesktopDriverClientOptions): DesktopDriverClient {
  return new DesktopDriverClient(options);
}
