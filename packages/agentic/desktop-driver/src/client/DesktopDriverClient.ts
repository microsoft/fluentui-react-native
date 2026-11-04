import { randomUUID } from 'node:crypto';

import { WebDriverError } from '../protocol/errors.js';
import { webElementIdentifier } from '../protocol/constants.js';
import type { DesktopTreeNode, DesktopWindowEventLog } from '../host/types.js';
import type {
  ActInput,
  ActResult,
  CheckInput,
  CheckResult,
  FindInput,
  FindResult,
  JournalInput,
  JournalResult,
  ObserveInput,
  ObserveResult,
  OperationCatalog,
  OperationResponse,
} from '../operations/index.js';
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
  /**
   * The bearer token of a grant, for a service that requires one. It is sent on every request, so a client cannot reach
   * a protected service by accident without it. Never log it or persist it outside owner-validated private storage.
   */
  grant?: string;
  url: string;
};

export class DesktopDriverClient {
  private readonly fetch: typeof globalThis.fetch;
  readonly #grant?: string;
  private readonly url: string;

  constructor({ fetch = globalThis.fetch, grant, url }: DesktopDriverClientOptions) {
    this.fetch = fetch;
    this.#grant = grant;
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
    const headers: Record<string, string> = {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(this.#grant ? { Authorization: `Bearer ${this.#grant}` } : {}),
    };
    const response = await this.fetch(`${this.url}${path}`, {
      method,
      ...(this.#grant ? { redirect: 'error' as const } : {}),
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      ...(Object.keys(headers).length > 0 ? { headers } : {}),
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

  getWindowEvents(): Promise<DesktopWindowEventLog> {
    return this.command('GET', '/furn/window-events');
  }

  /** The agent operations this session offers, with the JSON Schema of each one's input and result. */
  operations(): Promise<OperationCatalog> {
    return this.command('GET', '/furn/ops');
  }

  /**
   * Runs one agent operation by name. Name your own `requestId` to find the call in the journal; otherwise the server
   * assigns one and returns it.
   */
  operation<Result = unknown>(name: string, input: object = {}, options: { requestId?: string } = {}): Promise<OperationResponse<Result>> {
    return this.command('POST', `/furn/ops/${encodeURIComponent(name)}`, {
      input,
      ...(options.requestId === undefined ? {} : { requestId: options.requestId }),
    });
  }

  /** Reads a bounded outline of the current window, or of the subtree under a reference an earlier call returned. */
  observe(input: ObserveInput = {}, options?: { requestId?: string }): Promise<OperationResponse<ObserveResult>> {
    return this.operation('observe', input, options);
  }

  /** Finds elements by role, name, automation id, or text, and says whether the match is unique. */
  find(input: FindInput, options?: { requestId?: string }): Promise<OperationResponse<FindResult>> {
    return this.operation('find', input, options);
  }

  /**
   * Clicks, activates, types into, or clears one element: one a `find` proved unique, citing that find's sample, or one
   * a selector proves unique now. Name a `requestId` to make a retry safe: repeating it returns the first outcome
   * instead of acting again.
   */
  act(input: ActInput, options?: { requestId?: string }): Promise<OperationResponse<ActResult>> {
    return this.operation('act', input, options);
  }

  /** Checks an element's state, name, value, or text, or how many elements a selector matches, optionally waiting. */
  check(input: CheckInput, options?: { requestId?: string }): Promise<OperationResponse<CheckResult>> {
    return this.operation('check', input, options);
  }

  /** Reads what the operation layer ran in this session: the operation, its outcome, and its timing. */
  journal(input: JournalInput = {}, options?: { requestId?: string }): Promise<OperationResponse<JournalResult>> {
    return this.operation('journal', input, options);
  }

  /** True when the target advertises a native window-event timeline for diagnostics. */
  recordsWindowEvents(): boolean {
    const features = this.capabilities['furn:features'];
    return typeof features === 'object' && features !== null && (features as { windowEvents?: unknown }).windowEvents === true;
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
