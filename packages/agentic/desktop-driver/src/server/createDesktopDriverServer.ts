import { Buffer } from 'node:buffer';
import { createServer } from 'node:http';
import type { IncomingMessage, Server, ServerResponse } from 'node:http';

import type { DesktopTarget, NativeElementSnapshot, NativeSelector, Rect } from '../host/types.js';
import { createInputState, parseActionSequences } from '../protocol/actions.js';
import { createReturnedCapabilities, matchCapabilities } from '../protocol/capabilities.js';
import { webElementIdentifier } from '../protocol/constants.js';
import { invalidArgument, toWebDriverError, WebDriverError } from '../protocol/errors.js';
import { withCommandTimeout } from '../protocol/timeouts.js';
import type { NewSessionRequest, WebDriverElement, WebDriverResponse } from '../protocol/types.js';
import { SessionManager } from './SessionManager.js';
import type { DesktopSession, ElementRecord } from './SessionManager.js';
import { TargetRegistry } from './TargetRegistry.js';

export type DesktopDriverServerOptions = {
  host?: string;
  maxBodyBytes?: number;
  port?: number;
  targets?: readonly DesktopTarget[];
};

export type DesktopDriverServer = {
  host: string;
  port: number;
  sessions: SessionManager;
  targets: TargetRegistry;
  url: string;
  close(): Promise<void>;
};

type RouteContext = {
  body: unknown;
  method: string;
  segments: string[];
};

export async function createDesktopDriverServer(options: DesktopDriverServerOptions = {}): Promise<DesktopDriverServer> {
  const host = options.host ?? '127.0.0.1';
  if (!isLoopbackHost(host)) {
    throw new Error(`Desktop Driver binds to loopback by default; "${host}" is not a supported loopback host.`);
  }

  const targets = new TargetRegistry(options.targets);
  const sessions = new SessionManager();
  let closing = false;
  const httpServer = createServer((request, response) => {
    if (closing) {
      const error = new WebDriverError('unknown error', 'Desktop Driver is shutting down.');
      writeJson(response, error.status, { value: error.toJSON() });
      return;
    }
    void handleRequest(request, response, sessions, targets, options.maxBodyBytes ?? 1024 * 1024);
  });
  const port = await listen(httpServer, host, options.port ?? 0);

  return {
    host,
    port,
    sessions,
    targets,
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- WebDriver is an intentionally loopback-only local protocol.
    url: `http://${formatHost(host)}:${port}`,
    async close() {
      closing = true;
      let sessionError: unknown;
      await closeServer(httpServer);
      try {
        await sessions.deleteAll();
      } catch (error) {
        sessionError = error;
      }
      const hosts = new Set(targets.list().map(({ host: targetHost }) => targetHost));
      const results = await Promise.allSettled(
        [...hosts].map((targetHost) => withCommandTimeout(() => targetHost.dispose(), 10_000, 'Disposing a desktop host')),
      );
      const hostErrors = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(({ reason }) => reason);
      if (sessionError || hostErrors.length > 0) {
        throw new AggregateError([...(sessionError ? [sessionError] : []), ...hostErrors], 'Desktop Driver cleanup failed.');
      }
    },
  };
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  sessions: SessionManager,
  targets: TargetRegistry,
  maxBodyBytes: number,
): Promise<void> {
  try {
    if (request.headers.origin) {
      throw new WebDriverError('unknown error', 'Browser-origin requests are not accepted by Desktop Driver.');
    }
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- This base URL only parses a loopback listener path.
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const method = request.method ?? 'GET';
    const body = method === 'GET' || method === 'DELETE' ? undefined : await readJsonBody(request, maxBodyBytes);
    const value = await route({ body, method, segments }, sessions, targets);
    writeJson(response, 200, { value });
  } catch (error) {
    const webdriverError = toWebDriverError(error);
    writeJson(response, webdriverError.status, { value: webdriverError.toJSON() });
  }
}

async function route(context: RouteContext, sessions: SessionManager, targets: TargetRegistry): Promise<unknown> {
  const { body, method, segments } = context;

  if (method === 'GET' && segments.length === 1 && segments[0] === 'status') {
    const targetInfo = await Promise.all(
      targets.list().map(async (target) => ({
        endpoint: target.endpoint,
        id: target.id,
        platformName: target.platformName,
        renderer: target.renderer,
        host: await withCommandTimeout(() => target.host.probe(), 10_000, `Probing target "${target.id}"`),
      })),
    );
    return { message: 'Desktop Driver is ready.', ready: true, targets: targetInfo };
  }

  if (method === 'POST' && segments.length === 1 && segments[0] === 'session') {
    const request = requireObject(body, 'New Session request') as NewSessionRequest;
    if (!request.capabilities) {
      throw invalidArgument('New Session requires "capabilities".');
    }
    const matched = await matchCapabilities(request.capabilities, targets.list());
    const hostInfo = await withCommandTimeout(() => matched.target.host.probe(), 10_000, `Probing target "${matched.target.id}"`);
    const launchMode = matched.requested['furn:launchMode'] ?? 'launch';
    if (launchMode !== 'attach' && launchMode !== 'launch') {
      throw invalidArgument('"furn:launchMode" must be "attach" or "launch".');
    }
    const session = await sessions.create(matched.target, hostInfo, matched.clickMode, launchMode);
    return {
      sessionId: session.id,
      capabilities: createReturnedCapabilities(matched, hostInfo, session.timeouts),
    };
  }

  if (segments[0] !== 'session' || !segments[1]) {
    throw new WebDriverError('unknown command', `No WebDriver command matches ${method} /${segments.join('/')}.`);
  }

  const session = sessions.get(segments[1]);
  const command = segments.slice(2);

  if (method === 'DELETE' && command.length === 0) {
    await sessions.delete(session.id);
    return null;
  }
  if (command[0] === 'timeouts') {
    return handleTimeouts(method, body, session);
  }
  if (command[0] === 'window') {
    return handleWindowCommand(method, command.slice(1), body, session);
  }
  if (method === 'POST' && (command[0] === 'element' || command[0] === 'elements') && command.length === 1) {
    return findElements(session, sessions, body, command[0] === 'element');
  }
  if (method === 'GET' && command[0] === 'element' && command[1] === 'active') {
    const active = await hostCommand(session, 'Reading the active element', () =>
      session.target.host.activeElement(session.currentWindowId),
    );
    return active ? toElementReference(sessions.registerElement(session, active)) : null;
  }
  if (command[0] === 'element' && command[1]) {
    return handleElementCommand(method, command.slice(1), body, session, sessions);
  }
  if (command[0] === 'actions') {
    if (method === 'POST') {
      const { actions, nextState } = parseActionSequences(requireObject(body, 'actions request').actions, session.inputState);
      await hostCommand(session, 'Performing input actions', () => session.target.host.performActions(actions));
      session.inputState = nextState;
      return null;
    }
    if (method === 'DELETE') {
      await hostCommand(session, 'Releasing input actions', () => session.target.host.releaseActions());
      session.inputState = createInputState();
      return null;
    }
  }
  if (method === 'GET' && command[0] === 'screenshot' && command.length === 1) {
    const image = await hostCommand(session, 'Capturing the current window', () =>
      session.target.host.captureWindow(session.currentWindowId),
    );
    return Buffer.from(image.data).toString('base64');
  }
  if (method === 'GET' && command[0] === 'source' && command.length === 1) {
    return hostCommand(session, 'Reading the accessibility source', () => session.target.host.source(session.currentWindowId));
  }
  if (command[0] === 'furn') {
    return handleStorybookCommand(method, command.slice(1), body, session, sessions);
  }

  if (isUnsupportedBrowserCommand(command)) {
    throw new WebDriverError('unsupported operation', `/${command.join('/')} is not supported for native desktop applications.`);
  }

  async function handleStorybookCommand(
    method: string,
    command: string[],
    body: unknown,
    session: DesktopSession,
    sessions: SessionManager,
  ): Promise<unknown> {
    const orchestrator = session.target.storyOrchestrator;
    if (!orchestrator) {
      throw new WebDriverError('unsupported operation', `Target "${session.target.id}" does not provide Storybook orchestration.`);
    }
    if (method === 'GET' && command[0] === 'manifest' && command.length === 1) {
      return withCommandTimeout(() => orchestrator.getManifest(), session.desktopTimeouts.nativeCommand, 'Reading the Storybook manifest');
    }
    if (method === 'GET' && command[0] === 'story' && command.length === 1) {
      return withCommandTimeout(
        () => orchestrator.getCurrentStory(),
        session.desktopTimeouts.nativeCommand,
        'Reading the current Storybook story',
      );
    }
    if (method === 'POST' && command[0] === 'story' && command.length === 1) {
      const request = parseStorySelection(body);
      const result = await withCommandTimeout(
        () => orchestrator.selectStory(request),
        session.desktopTimeouts.storyRender,
        `Selecting Storybook story "${request.storyId}"`,
      );
      await verifyStoryMarker(session, result);
      sessions.invalidatePreview(session);
      session.story = { runId: result.runId, storyId: result.storyId };
      return result;
    }
    if (method === 'POST' && command[0] === 'story' && command[1] === 'reset') {
      const request = parseStorySelection(body);
      const result = await withCommandTimeout(
        () => orchestrator.resetStory(request),
        session.desktopTimeouts.storyRender,
        `Resetting Storybook story "${request.storyId}"`,
      );
      await verifyStoryMarker(session, result);
      sessions.invalidatePreview(session);
      session.story = { runId: result.runId, storyId: result.storyId };
      return result;
    }

    async function verifyStoryMarker(
      session: DesktopSession,
      expected: { previewGeneration: number; runId: string; storyId: string },
    ): Promise<void> {
      const testId = session.target.storyRootTestId;
      if (!testId) {
        return;
      }
      const deadline = Date.now() + session.desktopTimeouts.storyRender;
      do {
        const matches = await hostCommand(session, 'Finding the native Storybook story marker', () =>
          session.target.host.find({ windowId: session.currentWindowId }, { strategy: 'accessibility id', value: testId }),
        );
        for (const marker of matches) {
          const value = marker.name ?? marker.value ?? marker.text;
          if (value && matchesStoryMarker(value, expected)) {
            return;
          }
        }
        await delay(25);
      } while (Date.now() <= deadline);
      throw new WebDriverError(
        'timeout',
        `The native Storybook marker did not confirm story "${expected.storyId}" run "${expected.runId}".`,
      );
    }

    function matchesStoryMarker(value: string, expected: { previewGeneration: number; runId: string; storyId: string }): boolean {
      try {
        const marker = JSON.parse(value) as Record<string, unknown>;
        return (
          marker.storyId === expected.storyId && marker.runId === expected.runId && marker.previewGeneration === expected.previewGeneration
        );
      } catch {
        return false;
      }
    }
    if (method === 'POST' && command[0] === 'story' && command[1] === 'args') {
      if (!orchestrator.updateArgs) {
        throw new WebDriverError('unsupported operation', 'This Storybook target does not support arg updates.');
      }
      const request = requireObject(body, 'Storybook args request');
      if (typeof request.storyId !== 'string') {
        throw invalidArgument('Storybook args request requires a string "storyId".');
      }
      const args = requireObject(request.args, 'Storybook args request "args"');
      await withCommandTimeout(
        () => orchestrator.updateArgs!(request.storyId as string, args),
        session.desktopTimeouts.storyRender,
        `Updating args for Storybook story "${request.storyId}"`,
      );
      return null;
    }
    throw new WebDriverError('unknown command', `Unknown Desktop Driver extension command "furn/${command.join('/')}".`);
  }

  function parseStorySelection(body: unknown): { requestId: string; runId: string; storyId: string } {
    const request = requireObject(body, 'Storybook selection request');
    for (const field of ['requestId', 'runId', 'storyId'] as const) {
      if (typeof request[field] !== 'string' || !request[field]) {
        throw invalidArgument(`Storybook selection request requires a non-empty string "${field}".`);
      }
    }
    return {
      requestId: request.requestId as string,
      runId: request.runId as string,
      storyId: request.storyId as string,
    };
  }
  throw new WebDriverError('unknown command', `No WebDriver command matches ${method} /session/${session.id}/${command.join('/')}.`);
}

function handleTimeouts(method: string, body: unknown, session: DesktopSession): unknown {
  if (method === 'GET') {
    return { ...session.timeouts };
  }
  if (method !== 'POST') {
    throw new WebDriverError('unknown method', `Method ${method} is not allowed for timeouts.`);
  }
  const updates = requireObject(body, 'timeouts');
  for (const name of ['implicit', 'pageLoad', 'script'] as const) {
    if (updates[name] !== undefined) {
      const value = updates[name];
      if (!Number.isInteger(value) || (value as number) < 0) {
        throw invalidArgument(`Timeout "${name}" must be a non-negative integer.`);
      }
      session.timeouts[name] = value as number;
    }
  }
  return null;
}

async function handleWindowCommand(method: string, command: string[], body: unknown, session: DesktopSession): Promise<unknown> {
  const host = session.target.host;
  if (command.length === 0 && method === 'GET') {
    ensureCurrentWindow(session);
    return session.currentWindowId;
  }
  if (command.length === 0 && method === 'POST') {
    const handle = requireObject(body, 'switch window request').handle;
    if (typeof handle !== 'string' || !session.windows.some(({ id }) => id === handle)) {
      throw new WebDriverError('no such window', `Window "${String(handle)}" does not exist in this session.`);
    }
    await hostCommand(session, `Activating window "${handle}"`, () => host.activate(handle));
    session.currentWindowId = handle;
    return null;
  }
  if (command.length === 0 && method === 'DELETE') {
    ensureCurrentWindow(session);
    await hostCommand(session, `Closing window "${session.currentWindowId}"`, () => host.closeWindow(session.currentWindowId));
    session.windows = await hostCommand(session, 'Reading application windows', () => host.windows(session.lease));
    session.currentWindowId = session.windows[0]?.id ?? '';
    return session.windows.map(({ id }) => id);
  }
  if (command[0] === 'handles' && command.length === 1 && method === 'GET') {
    session.windows = await hostCommand(session, 'Reading application windows', () => host.windows(session.lease));
    return session.windows.map(({ id }) => id);
  }
  if (command[0] === 'rect' && command.length === 1) {
    ensureCurrentWindow(session);
    if (method === 'GET') {
      return hostCommand(session, 'Reading the current window rectangle', () => host.getWindowRect(session.currentWindowId));
    }
    if (method === 'POST') {
      const rect = validatePartialRect(requireObject(body, 'window rectangle'));
      return hostCommand(session, 'Setting the current window rectangle', () => host.setWindowRect(session.currentWindowId, rect));
    }
  }
  throw new WebDriverError('unknown command', `Unknown window command "${command.join('/')}".`);
}

async function handleElementCommand(
  method: string,
  command: string[],
  body: unknown,
  session: DesktopSession,
  sessions: SessionManager,
): Promise<unknown> {
  const record = sessions.resolveElement(session, command[0]);
  const snapshot = await hostCommand(session, `Reading element "${record.id}"`, () => session.target.host.snapshot(record.nativeId));
  const operation = command.slice(1);

  if (operation[0] === 'shadow') {
    throw new WebDriverError('unsupported operation', 'Shadow roots are not supported for native desktop applications.');
  }
  if (method === 'POST' && (operation[0] === 'element' || operation[0] === 'elements') && operation.length === 1) {
    return findElements(session, sessions, body, operation[0] === 'element', record);
  }
  if (method === 'GET' && operation[0] === 'name') {
    return snapshot.role;
  }
  if (method === 'GET' && operation[0] === 'text') {
    return snapshot.text ?? snapshot.value ?? snapshot.name ?? '';
  }
  if (method === 'GET' && operation[0] === 'rect') {
    return snapshot.rect;
  }
  if (method === 'GET' && operation[0] === 'enabled') {
    return requireSupported(snapshot.enabled, 'enabled');
  }
  if (method === 'GET' && operation[0] === 'selected') {
    return requireSupported(snapshot.selected, 'selected');
  }
  if (method === 'GET' && operation[0] === 'displayed') {
    return requireSupported(snapshot.visible, 'displayed');
  }
  if (method === 'GET' && operation[0] === 'attribute' && operation[1]) {
    return getElementValue(snapshot, operation[1]);
  }
  if (method === 'GET' && operation[0] === 'property' && operation[1]) {
    return getElementValue(snapshot, operation[1]);
  }
  if (method === 'POST' && operation[0] === 'click') {
    if (!requireSupported(snapshot.enabled, 'enabled') || !requireSupported(snapshot.visible, 'visible')) {
      throw new WebDriverError('element not interactable', `Element "${record.id}" cannot be clicked.`);
    }
    await hostCommand(session, `Activating window "${snapshot.windowId}"`, () => session.target.host.activate(snapshot.windowId));
    if (session.clickMode !== 'accessibility') {
      const point = {
        x: snapshot.rect.x + snapshot.rect.width / 2,
        y: snapshot.rect.y + snapshot.rect.height / 2,
      };
      const hit = await hostCommand(session, `Hit testing element "${record.id}"`, () =>
        session.target.host.hitTest(snapshot.windowId, point.x, point.y),
      );
      if (hit && hit.id !== snapshot.id) {
        throw new WebDriverError('element click intercepted', `Element "${record.id}" is obscured by another native element.`);
      }
    }
    await hostCommand(session, `Clicking element "${record.id}"`, () => session.target.host.click(record.nativeId, session.clickMode));
    return null;
  }
  if (method === 'POST' && operation[0] === 'clear') {
    await hostCommand(session, `Clearing element "${record.id}"`, () => session.target.host.clear(record.nativeId));
    return null;
  }
  if (method === 'POST' && operation[0] === 'value') {
    const request = requireObject(body, 'send keys request');
    const text =
      typeof request.text === 'string'
        ? request.text
        : Array.isArray(request.value) && request.value.every((part) => typeof part === 'string')
          ? request.value.join('')
          : undefined;
    if (text === undefined) {
      throw invalidArgument('Send Keys requires a string "text" or string-array "value".');
    }
    await hostCommand(session, `Sending keys to element "${record.id}"`, () => session.target.host.sendKeys(record.nativeId, text));
    return null;
  }
  if (method === 'GET' && operation[0] === 'screenshot') {
    const image = await hostCommand(session, `Capturing element "${record.id}"`, () => session.target.host.captureElement(record.nativeId));
    return Buffer.from(image.data).toString('base64');
  }

  throw new WebDriverError('unknown command', `Unknown element command "${operation.join('/')}".`);
}

async function findElements(
  session: DesktopSession,
  sessions: SessionManager,
  body: unknown,
  single: boolean,
  rootElement?: ElementRecord,
): Promise<WebDriverElement | WebDriverElement[]> {
  const selector = parseSelector(body);
  const deadline = Date.now() + session.timeouts.implicit;
  let matches: NativeElementSnapshot[] = [];
  do {
    matches = await hostCommand(session, `Finding elements by ${selector.strategy}`, () =>
      session.target.host.find({ elementId: rootElement?.nativeId, windowId: session.currentWindowId }, selector),
    );
    if (matches.length > 0 || Date.now() >= deadline) {
      break;
    }
    await delay(25);
  } while (Date.now() <= deadline);

  if (single) {
    const match = matches[0];
    if (!match) {
      throw new WebDriverError('no such element', `No element matched ${selector.strategy} "${selector.value}".`);
    }
    return toElementReference(sessions.registerElement(session, match));
  }
  return matches.map((match) => toElementReference(sessions.registerElement(session, match)));
}

function parseSelector(body: unknown): NativeSelector {
  const request = requireObject(body, 'element lookup');
  const strategy = request.using;
  const value = request.value;
  if (strategy !== 'accessibility id' && strategy !== 'tag name' && strategy !== 'link text' && strategy !== 'partial link text') {
    throw new WebDriverError('invalid selector', `Locator strategy "${String(strategy)}" is not supported.`);
  }
  if (typeof value !== 'string') {
    throw invalidArgument('Element locator "value" must be a string.');
  }
  return { strategy, value };
}

function toElementReference(record: ElementRecord): WebDriverElement {
  return { [webElementIdentifier]: record.id };
}

function requireSupported<T>(value: { supported: true; value: T } | { supported: false; reason: string }, name: string): T {
  if (!value.supported) {
    const reason = 'reason' in value ? value.reason : 'not reported by the host';
    throw new WebDriverError('unsupported operation', `Element property "${name}" is unavailable: ${reason}`);
  }
  return value.value;
}

function getElementValue(snapshot: NativeElementSnapshot, name: string): unknown {
  switch (name) {
    case 'testID':
    case 'automationId':
      return snapshot.automationId ?? null;
    case 'name':
    case 'label':
      return snapshot.name ?? null;
    case 'role':
      return snapshot.role;
    case 'value':
      return snapshot.value ?? null;
    case 'focused':
      return requireSupported(snapshot.focused, 'focused');
    case 'enabled':
      return requireSupported(snapshot.enabled, 'enabled');
    case 'selected':
      return requireSupported(snapshot.selected, 'selected');
    default:
      return null;
  }
}

function validatePartialRect(value: Record<string, unknown>): Partial<Rect> {
  const result: Partial<Rect> = {};
  for (const name of ['x', 'y', 'width', 'height'] as const) {
    if (value[name] !== undefined) {
      if (typeof value[name] !== 'number' || !Number.isFinite(value[name])) {
        throw invalidArgument(`Window rectangle "${name}" must be a finite number.`);
      }
      if ((name === 'width' || name === 'height') && (value[name] as number) < 0) {
        throw invalidArgument(`Window rectangle "${name}" must not be negative.`);
      }
      result[name] = value[name] as number;
    }
  }
  return result;
}

function ensureCurrentWindow(session: DesktopSession): void {
  if (!session.currentWindowId || !session.windows.some(({ id }) => id === session.currentWindowId)) {
    throw new WebDriverError('no such window', 'The session does not have a current window.');
  }
}

function hostCommand<T>(session: DesktopSession, description: string, operation: () => Promise<T>): Promise<T> {
  return withCommandTimeout(operation, session.desktopTimeouts.nativeCommand, description);
}

function requireObject(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw invalidArgument(`${name} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function isUnsupportedBrowserCommand(command: readonly string[]): boolean {
  return ['url', 'back', 'forward', 'refresh', 'cookie', 'frame', 'alert', 'execute', 'print'].includes(command[0]);
}

async function readJsonBody(request: IncomingMessage, maxBytes: number): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBytes) {
      throw invalidArgument(`Request body exceeds the ${maxBytes}-byte limit.`);
    }
    chunks.push(buffer);
  }
  if (chunks.length === 0) {
    return {};
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw invalidArgument('Request body must contain valid JSON.');
  }
}

function writeJson(response: ServerResponse, status: number, body: WebDriverResponse): void {
  const json = JSON.stringify(body);
  response.writeHead(status, {
    'Cache-Control': 'no-cache',
    'Content-Length': Buffer.byteLength(json),
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(json);
}

function isLoopbackHost(host: string): boolean {
  return host === '127.0.0.1' || host === '::1' || host === 'localhost';
}

function formatHost(host: string): string {
  return host.includes(':') ? `[${host}]` : host;
}

function listen(server: Server, host: string, port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const onError = (error: Error) => reject(error);
    server.once('error', onError);
    server.listen(port, host, () => {
      server.off('error', onError);
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Desktop Driver did not receive a TCP address.'));
        return;
      }
      resolve(address.port);
    });
  });
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
