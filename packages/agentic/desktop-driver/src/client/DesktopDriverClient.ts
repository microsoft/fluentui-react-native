import { randomUUID } from 'node:crypto';

import { validateDesktopSessionInput } from '../authoring/input.js';
import type { DesktopSessionInput } from '../authoring/input.js';
import { WebDriverError } from '../protocol/errors.js';
import type { WebDriverErrorCode } from '../protocol/errors.js';
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
import type { NewSessionCapabilities, WebDriverActionSequence, WebDriverElement, WebDriverTimeouts } from '../protocol/types.js';
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

/** Options for one session or element call that is not an agent operation. */
export type DesktopClientCallOptions = {
  /** Abandons the call: the request is aborted and the caller sees the abort, not a transport failure. */
  signal?: AbortSignal;
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

  async newSession(capabilities: NewSessionCapabilities, options: DesktopClientCallOptions = {}): Promise<DesktopSessionClient> {
    const value = await this.request<{ capabilities: Record<string, unknown>; sessionId: string }>(
      'POST',
      '/session',
      { capabilities },
      options.signal,
    );
    return new DesktopSessionClient(this, value.sessionId, value.capabilities);
  }

  async request<T>(method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    const headers: Record<string, string> = {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(this.#grant ? { Authorization: `Bearer ${this.#grant}` } : {}),
    };
    let status: number;
    let ok: boolean;
    let text: string;
    try {
      const response = await this.fetch(`${this.url}${path}`, {
        method,
        ...(this.#grant ? { redirect: 'error' as const } : {}),
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        ...(Object.keys(headers).length > 0 ? { headers } : {}),
        ...(signal ? { signal } : {}),
      });
      status = response.status;
      ok = response.ok;
      text = await response.text();
    } catch (error) {
      // A caller who cancelled gets its own abort back, not a transport failure.
      if (signal?.aborted || (typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError')) {
        throw error;
      }
      const reason = error instanceof Error && error.message ? `: ${error.message}` : '';
      throw new DesktopDriverClientError('transport', `The Desktop Driver service could not be reached for ${method}${reason}.`, {
        cause: error,
      });
    }
    return readResponse<T>(method, ok, status, text);
  }
}

/** Why a request produced no WebDriver answer: the service was unreachable, or what it sent was not a WebDriver response. */
export type DesktopDriverClientErrorReason = 'invalid-response' | 'transport';

/**
 * A failure of the client's own transport, as opposed to a WebDriver error the service reported. The message never holds
 * the response body or the request values; `cause` keeps the underlying error for diagnosis.
 */
export class DesktopDriverClientError extends Error {
  readonly reason: DesktopDriverClientErrorReason;
  /** The HTTP status of an `invalid-response`. A `transport` failure never received one. */
  readonly status?: number;

  constructor(reason: DesktopDriverClientErrorReason, message: string, options: { cause?: unknown; status?: number } = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'DesktopDriverClientError';
    this.reason = reason;
    if (options.status !== undefined) this.status = options.status;
  }
}

function readResponse<T>(method: string, ok: boolean, status: number, text: string): T {
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch (error) {
    throw new DesktopDriverClientError(
      'invalid-response',
      `The Desktop Driver service answered ${method} with HTTP ${status} and a body that is not JSON.`,
      {
        cause: error,
        status,
      },
    );
  }
  if (!isRecord(payload) || !('value' in payload)) {
    throw new DesktopDriverClientError(
      'invalid-response',
      `The Desktop Driver service answered ${method} with HTTP ${status} and no WebDriver value.`,
      { status },
    );
  }
  const value = payload.value;
  if (ok) {
    return value as T;
  }
  if (!isRecord(value) || typeof value.error !== 'string' || typeof value.message !== 'string') {
    throw new DesktopDriverClientError(
      'invalid-response',
      `The Desktop Driver service answered ${method} with HTTP ${status} and a malformed error.`,
      { status },
    );
  }
  const data = isRecord(value.data) ? value.data : undefined;
  const error = new WebDriverError(value.error as WebDriverErrorCode, value.message, data);
  // A code this client does not know still has to classify, so it becomes an unknown error that keeps the code.
  throw error.status === undefined ? new WebDriverError('unknown error', value.message, { ...data, code: value.error }) : error;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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

  /** A client for another session on the same service and credential, such as the one a WebdriverIO reload created. */
  rebind(id: string, capabilities: Readonly<Record<string, unknown>>): DesktopSessionClient {
    return new DesktopSessionClient(this.driver, id, capabilities);
  }

  delete(options?: DesktopClientCallOptions): Promise<null> {
    return this.command('DELETE', '', undefined, options?.signal);
  }

  getTimeouts(options?: DesktopClientCallOptions): Promise<WebDriverTimeouts> {
    return this.command('GET', '/timeouts', undefined, options?.signal);
  }

  setTimeouts(timeouts: Partial<WebDriverTimeouts>, options?: DesktopClientCallOptions): Promise<null> {
    return this.command('POST', '/timeouts', timeouts, options?.signal);
  }

  getWindowHandle(options?: DesktopClientCallOptions): Promise<string> {
    return this.command('GET', '/window', undefined, options?.signal);
  }

  getWindowHandles(options?: DesktopClientCallOptions): Promise<string[]> {
    return this.command('GET', '/window/handles', undefined, options?.signal);
  }

  switchToWindow(handle: string, options?: DesktopClientCallOptions): Promise<null> {
    return this.command('POST', '/window', { handle }, options?.signal);
  }

  async findElement(using: string, value: string, options?: DesktopClientCallOptions): Promise<DesktopElementClient> {
    return this.elementFrom(await this.command<WebDriverElement>('POST', '/element', { using, value }, options?.signal));
  }

  async findElements(using: string, value: string, options?: DesktopClientCallOptions): Promise<DesktopElementClient[]> {
    const elements = await this.command<unknown>('POST', '/elements', { using, value }, options?.signal);
    if (!Array.isArray(elements)) {
      throw malformedElementList();
    }
    return elements.map((element) => this.elementFrom(element));
  }

  async getActiveElement(options?: DesktopClientCallOptions): Promise<DesktopElementClient | null> {
    const element = await this.command<unknown>('GET', '/element/active', undefined, options?.signal);
    return element ? this.elementFrom(element) : null;
  }

  performActions(actions: readonly WebDriverActionSequence[], options?: DesktopClientCallOptions): Promise<null> {
    return this.command('POST', '/actions', { actions }, options?.signal);
  }

  releaseActions(options?: DesktopClientCallOptions): Promise<null> {
    return this.command('DELETE', '/actions', undefined, options?.signal);
  }

  takeScreenshot(options?: DesktopClientCallOptions): Promise<string> {
    return this.command('GET', '/screenshot', undefined, options?.signal);
  }

  getPageSource(options?: DesktopClientCallOptions): Promise<string> {
    return this.command('GET', '/source', undefined, options?.signal);
  }

  getTree(options?: DesktopClientCallOptions): Promise<DesktopTreeNode[]> {
    return this.command('GET', '/furn/tree', undefined, options?.signal);
  }

  getWindowEvents(options?: DesktopClientCallOptions): Promise<DesktopWindowEventLog> {
    return this.command('GET', '/furn/window-events', undefined, options?.signal);
  }

  /** The session's input policy, and how many times it has delivered input through each mechanism. */
  async getInput(options?: DesktopClientCallOptions): Promise<DesktopSessionInput> {
    return validateDesktopSessionInput(await this.command('GET', '/furn/input', undefined, options?.signal));
  }

  /** The agent operations this session offers, with the JSON Schema of each one's input and result. */
  operations(options?: DesktopClientCallOptions): Promise<OperationCatalog> {
    return this.command('GET', '/furn/ops', undefined, options?.signal);
  }

  private elementFrom(value: unknown): DesktopElementClient {
    const id = isRecord(value) ? value[webElementIdentifier] : undefined;
    if (typeof id !== 'string') {
      throw new DesktopDriverClientError('invalid-response', 'The Desktop Driver service returned an element reference that is not valid.');
    }
    return new DesktopElementClient(this, id);
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

  getStoryManifest(options?: DesktopClientCallOptions): Promise<DesktopStoryManifest> {
    return this.command('GET', '/furn/manifest', undefined, options?.signal);
  }

  getCurrentStory(options?: DesktopClientCallOptions): Promise<StoryReadyResult | null> {
    return this.command('GET', '/furn/story', undefined, options?.signal);
  }

  selectStory(storyId: string, runId: string = randomUUID(), options?: DesktopClientCallOptions): Promise<StoryReadyResult> {
    return this.command('POST', '/furn/story', { requestId: randomUUID(), runId, storyId }, options?.signal);
  }

  resetStory(storyId: string, runId: string = randomUUID(), options?: DesktopClientCallOptions): Promise<StoryReadyResult> {
    return this.command('POST', '/furn/story/reset', { requestId: randomUUID(), runId, storyId }, options?.signal);
  }

  updateStoryArgs(storyId: string, args: Readonly<Record<string, unknown>>, options?: DesktopClientCallOptions): Promise<null> {
    return this.command('POST', '/furn/story/args', { args, storyId }, options?.signal);
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

  click(options?: DesktopClientCallOptions): Promise<null> {
    return this.command('POST', '/click', {}, options);
  }

  clear(options?: DesktopClientCallOptions): Promise<null> {
    return this.command('POST', '/clear', {}, options);
  }

  sendKeys(text: string, options?: DesktopClientCallOptions): Promise<null> {
    return this.command('POST', '/value', { text }, options);
  }

  /** Performs the one accessibility action the element publishes under this name, such as `increment`. */
  performAccessibilityAction(name: string, options?: DesktopClientCallOptions): Promise<null> {
    return this.command('POST', '/furn/accessibility-action', { name }, options);
  }

  getText(options?: DesktopClientCallOptions): Promise<string> {
    return this.command('GET', '/text', undefined, options);
  }

  getTagName(options?: DesktopClientCallOptions): Promise<string> {
    return this.command('GET', '/name', undefined, options);
  }

  isEnabled(options?: DesktopClientCallOptions): Promise<boolean> {
    return this.command('GET', '/enabled', undefined, options);
  }

  isDisplayed(options?: DesktopClientCallOptions): Promise<boolean> {
    return this.command('GET', '/displayed', undefined, options);
  }

  isSelected(options?: DesktopClientCallOptions): Promise<boolean> {
    return this.command('GET', '/selected', undefined, options);
  }

  getAttribute(name: string, options?: DesktopClientCallOptions): Promise<unknown> {
    return this.command('GET', `/attribute/${encodeURIComponent(name)}`, undefined, options);
  }

  getProperty(name: string, options?: DesktopClientCallOptions): Promise<unknown> {
    return this.command('GET', `/property/${encodeURIComponent(name)}`, undefined, options);
  }

  takeScreenshot(options?: DesktopClientCallOptions): Promise<string> {
    return this.command('GET', '/screenshot', undefined, options);
  }

  private command<T>(method: string, path: string, body?: unknown, options?: DesktopClientCallOptions): Promise<T> {
    return this.session.command(method, `/element/${this.id}${path}`, body, options?.signal);
  }
}

function malformedElementList(): DesktopDriverClientError {
  return new DesktopDriverClientError('invalid-response', 'The Desktop Driver service returned an element list that is not valid.');
}

export function createDesktopDriverClient(options: DesktopDriverClientOptions): DesktopDriverClient {
  return new DesktopDriverClient(options);
}
