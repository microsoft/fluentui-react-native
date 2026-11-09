import { randomUUID } from 'node:crypto';

import { validateDesktopSessionInput } from '../authoring/input.js';
import type { DesktopSessionInput } from '../authoring/input.js';
import { WebDriverError } from '../protocol/errors.js';
import { webElementIdentifier } from '../protocol/constants.js';
import type { DesktopTreeNode, DesktopWindowEventLog } from '../host/types.js';
import type {
  ActInput,
  ActResult,
  ArtifactInput,
  ArtifactResult,
  CaptureInput,
  CaptureResult,
  CheckInput,
  CheckResult,
  FindInput,
  FindResult,
  JournalInput,
  JournalResult,
  ObserveDeltaInput,
  ObserveDeltaResult,
  ObserveInput,
  ObservePageInput,
  ObservePageResult,
  ObserveResult,
  OperationCatalog,
  OperationResponse,
  SequenceInput,
  SequenceResult,
  StoriesInput,
  StoriesResult,
  StoryInput,
  StoryResult,
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

/** Options for one operation call. */
export type OperationCallOptions = {
  /** Names the call in the journal and, for an operation that changes the application, makes a retry return the first outcome. */
  requestId?: string;
  /** Abandons the call. The service treats it as the caller leaving: work not yet dispatched is cancelled. */
  signal?: AbortSignal;
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

  /** Non-secret identity for connection bookkeeping; never authorizes a request. */
  get principalId(): string | undefined {
    return this.#grant?.split('.')[1];
  }

  /** Obtains a connection-local driver-only principal. Credentials remain private to the returned client. */
  async delegateConnection(): Promise<DesktopDriverClient> {
    const value = await this.request<{ token: string }>('POST', '/furn/grants/connection');
    if (typeof value?.token !== 'string' || !/^fdg1\.[0-9a-f]{32}\.[A-Za-z0-9_-]{43}$/.test(value.token)) {
      throw new Error('The service does not support connection authority.');
    }
    return new DesktopDriverClient({ fetch: this.fetch, grant: value.token, url: this.url });
  }

  /** Retryable terminal cleanup: revoked credentials authorize only their own child drain. */
  revokeConnection(): Promise<null> {
    return this.request('DELETE', '/furn/grants/current');
  }

  async newSession(capabilities: NewSessionCapabilities): Promise<DesktopSessionClient> {
    const value = await this.request<{ capabilities: Record<string, unknown>; sessionId: string }>('POST', '/session', {
      capabilities,
    });
    return new DesktopSessionClient(this, value.sessionId, value.capabilities);
  }

  async request<T>(method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    const headers: Record<string, string> = {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(this.#grant ? { Authorization: `Bearer ${this.#grant}` } : {}),
    };
    const response = await this.fetch(`${this.url}${path}`, {
      method,
      ...(this.#grant ? { redirect: 'error' as const } : {}),
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      ...(Object.keys(headers).length > 0 ? { headers } : {}),
      ...(signal ? { signal } : {}),
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

  /** The session's input policy, and how many times it has delivered input through each mechanism. */
  async getInput(): Promise<DesktopSessionInput> {
    return validateDesktopSessionInput(await this.command('GET', '/furn/input'));
  }

  /** The agent operations this session offers, with the JSON Schema of each one's input and result. */
  operations(): Promise<OperationCatalog> {
    return this.command('GET', '/furn/ops');
  }

  /**
   * Runs one agent operation by name. Name your own `requestId` to find the call in the journal; otherwise the server
   * assigns one and returns it.
   */
  operation<Result = unknown>(name: string, input: object = {}, options: OperationCallOptions = {}): Promise<OperationResponse<Result>> {
    return this.command(
      'POST',
      `/furn/ops/${encodeURIComponent(name)}`,
      { input, ...(options.requestId === undefined ? {} : { requestId: options.requestId }) },
      options.signal,
    );
  }

  /** Reads a bounded outline of the current window, or of the subtree under a reference an earlier call returned. */
  observe(input: ObserveInput = {}, options?: OperationCallOptions): Promise<OperationResponse<ObserveResult>> {
    return this.operation('observe', input, options);
  }

  /** Compares a fresh observation with a retained sample; incomplete samples never report removals. */
  observeDelta(input: ObserveDeltaInput, options?: OperationCallOptions): Promise<OperationResponse<ObserveDeltaResult>> {
    return this.operation('observeDelta', input, options);
  }

  /** Reads another page from an immutable observation or delta without sampling the application again. */
  observePage(input: ObservePageInput, options?: OperationCallOptions): Promise<OperationResponse<ObservePageResult>> {
    return this.operation('observePage', input, options);
  }

  /** Finds elements by role, name, automation id, or text, and says whether the match is unique. */
  find(input: FindInput, options?: OperationCallOptions): Promise<OperationResponse<FindResult>> {
    return this.operation('find', input, options);
  }

  /**
   * Clicks, activates, types into, or clears one element: one a `find` proved unique, citing that find's sample, or one
   * a selector proves unique now. Name a `requestId` to make a retry safe: repeating it returns the first outcome
   * instead of acting again.
   */
  act(input: ActInput, options?: OperationCallOptions): Promise<OperationResponse<ActResult>> {
    return this.operation('act', input, options);
  }

  /** Captures the window, or one element, as a PNG artifact with its provenance; the image comes inline only when asked. */
  capture(input: CaptureInput = {}, options?: OperationCallOptions): Promise<OperationResponse<CaptureResult>> {
    return this.operation('capture', input, options);
  }

  /** Reads a captured image in base64 pages. */
  artifact(input: ArtifactInput, options?: OperationCallOptions): Promise<OperationResponse<ArtifactResult>> {
    return this.operation('artifact', input, options);
  }

  /** Checks an element's state, name, value, or text, or how many elements a selector matches, optionally waiting. */
  check(input: CheckInput, options?: OperationCallOptions): Promise<OperationResponse<CheckResult>> {
    return this.operation('check', input, options);
  }

  /**
   * Runs act and check steps in order in one turn, stopping at the first that fails or does not pass, then optionally
   * observes. Steps that ran stay done.
   */
  sequence(input: SequenceInput, options?: OperationCallOptions): Promise<OperationResponse<SequenceResult>> {
    return this.operation('sequence', input, options);
  }

  /** Lists the target's Storybook stories and the story this session selected, checked against what is rendered. */
  stories(input: StoriesInput = {}, options?: OperationCallOptions): Promise<OperationResponse<StoriesResult>> {
    return this.operation('stories', input, options);
  }

  /**
   * Selects or resets a Storybook story and waits until it renders; earlier references into the preview expire. Name a
   * `requestId` to make a retry safe.
   */
  story(input: StoryInput, options?: OperationCallOptions): Promise<OperationResponse<StoryResult>> {
    return this.operation('story', input, options);
  }

  /** Reads what the operation layer ran in this session: the operation, its outcome, and its timing. */
  journal(input: JournalInput = {}, options?: OperationCallOptions): Promise<OperationResponse<JournalResult>> {
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

  command<T>(method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return this.driver.request(method, `/session/${this.id}${path}`, body, signal);
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

  /** Performs the one accessibility action the element publishes under this name, such as `increment`. */
  performAccessibilityAction(name: string): Promise<null> {
    return this.command('POST', '/furn/accessibility-action', { name });
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
