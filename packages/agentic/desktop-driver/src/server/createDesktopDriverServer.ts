import { Buffer } from 'node:buffer';
import { createServer } from 'node:http';
import type { IncomingMessage, Server, ServerResponse } from 'node:http';

import type {
  DesktopTarget,
  DesktopTreeNode,
  NativeAccessibilityAction,
  NativeActionSequence,
  NativeElementSnapshot,
  NativeSelector,
  Rect,
} from '../host/types.js';
import { DesktopAuthority, grantAllowsTarget } from '../authority/grants.js';
import type { DesktopGrant } from '../authority/grants.js';
import type { PrivateStorage } from '../authority/privateStorage.js';
import type { ContentPolicy } from '../operations/runtime.js';
import { createInputState, parseActionSequences } from '../protocol/actions.js';
import { createReturnedCapabilities, matchCapabilities } from '../protocol/capabilities.js';
import { webElementIdentifier } from '../protocol/constants.js';
import { invalidArgument, toWebDriverError, WebDriverError } from '../protocol/errors.js';
import { withCommandTimeout } from '../protocol/timeouts.js';
import type { NewSessionRequest, WebDriverActionSequence, WebDriverElement, WebDriverResponse } from '../protocol/types.js';
import { SessionManager } from './SessionManager.js';
import type { DesktopSession, ElementRecord, MutationOptions, RecoverTargetRequest, RecoverTargetResult } from './SessionManager.js';
import {
  actionMechanisms,
  assertInputAllowed,
  clickMechanism,
  deliverClear,
  deliverInput,
  describeSessionInput,
  strictClearMechanism,
} from './sessionInput.js';
import { SettlementJournal } from './settlementJournal.js';
import type { ProbeApplication } from './settlementJournal.js';
import { createOperationRuntime, handleOperationRoute, requestBodyLimit } from './sessionOperations.js';
import { assertStoryContext, changeStory, readCurrentStory } from './sessionStories.js';
import { TargetRegistry } from './TargetRegistry.js';

export type DesktopDriverServerOptions = {
  /**
   * Makes this a protected service. Every request, including ordinary WebDriver routes and `/status`, must carry a grant
   * from this authority as `Authorization: Bearer <token>`. A session belongs to the grant that created it, and a grant
   * can open only the targets it names. Without an authority the service keeps its documented loopback model, so one
   * service never serves both modes.
   */
  authority?: DesktopAuthority;
  host?: string;
  /**
   * How long, in milliseconds, a grant's session may go without a request before the service closes it as DELETE would.
   * The clock runs only while none of the session's requests is queued or running, and every request for the session
   * renews it. Defaults to ten minutes; 0 disables expiry. Only a protected service, one with an `authority`, accepts it.
   */
  idleSessionTimeoutMs?: number;
  maxBodyBytes?: number;
  /** Policy for the agent operations (`furn/ops`), which the server operator controls rather than the caller. */
  operations?: {
    /**
     * Whether operations may read what applications display (values, text, help). `deny` withholds it for every
     * session. Element names and automation ids stay readable. Defaults to `allow`.
     */
    content?: ContentPolicy;
  };
  port?: number;
  /**
   * Durable settlement state, supplied by the trusted supervisor. Each mutation is recorded in `storage` before it is
   * dispatched and each quarantine when it is raised, so a restarted service still refuses a target whose mutation
   * never settled. The storage must belong to this one service configuration. `probeApplication` lifts a quarantine
   * once the exact application incarnation it was raised against has exited; without it only the operator can.
   */
  recovery?: {
    probeApplication?: ProbeApplication;
    storage: PrivateStorage;
  };
  targets?: readonly DesktopTarget[];
};

export type DesktopDriverServer = {
  host: string;
  port: number;
  sessions: SessionManager;
  targets: TargetRegistry;
  url: string;
  close(): Promise<void>;
  /**
   * Lifts a target's quarantine. For the trusted operator only: no grant or WebDriver route can reach it. The request
   * names the quarantine the operator inspected in `/status`, and `application-exited` requires the probe to prove the
   * recorded application incarnation has exited.
   */
  recoverTarget(targetId: string, request: RecoverTargetRequest): Promise<RecoverTargetResult>;
};

type RouteContext = {
  authority?: DesktopAuthority;
  body: unknown;
  contentPolicy: ContentPolicy;
  /** The authenticated caller on a protected service. */
  grant?: DesktopGrant;
  method: string;
  segments: string[];
  /** Aborts when the client disconnects before the response is complete. */
  signal: AbortSignal;
};

type RequestSettings = {
  authority?: DesktopAuthority;
  contentPolicy: ContentPolicy;
  maxBodyBytes: number;
};

export async function createDesktopDriverServer(options: DesktopDriverServerOptions = {}): Promise<DesktopDriverServer> {
  const host = options.host ?? '127.0.0.1';
  if (!isLoopbackHost(host)) {
    throw new Error(`Desktop Driver binds to loopback by default; "${host}" is not a supported loopback host.`);
  }

  if (options.authority !== undefined && !(options.authority instanceof DesktopAuthority)) {
    throw new TypeError('The authority option must be a DesktopAuthority; a missing authority is undefined, never null.');
  }
  const targets = new TargetRegistry(options.targets);
  options.authority?.assertTargetsRegistered(new Set(targets.list().map(({ id }) => id)));
  const sessions = new SessionManager({
    idleTimeoutMs: resolveIdleSessionTimeout(options),
    ...(options.recovery ? { journal: new SettlementJournal(options.recovery.storage) } : {}),
    ...(options.recovery?.probeApplication ? { probeApplication: options.recovery.probeApplication } : {}),
    redactSessionIds: options.authority !== undefined,
  });
  // A target recorded as quarantined must refuse from the first request, so a journal that cannot be read stops startup.
  await Promise.all(targets.list().map(({ id }) => sessions.loadTarget(id)));
  let closing = false;
  let listenerClosePromise: Promise<void> | undefined;
  let cleanupQueue: Promise<void> = Promise.resolve();
  const httpServer = createServer((request, response) => {
    if (closing) {
      const error = new WebDriverError('unknown error', 'Desktop Driver is shutting down.');
      writeJson(response, error.status, { value: error.toJSON() });
      return;
    }
    void handleRequest(request, response, sessions, targets, {
      authority: options.authority,
      contentPolicy: options.operations?.content ?? 'allow',
      maxBodyBytes: options.maxBodyBytes ?? 1024 * 1024,
    });
  });
  const port = await listen(httpServer, host, options.port ?? 0);
  // A revoked grant leaves its sessions unreachable, so they are closed rather than holding their targets. A session that
  // fails to close stays tracked, and service shutdown retries it and reports the failure.
  const stopDrainingRevokedGrants = options.authority?.onRevoke((grant) => sessions.deleteOwnedBy(grant.id));

  return {
    host,
    port,
    sessions,
    targets,
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- WebDriver is an intentionally loopback-only local protocol.
    url: `http://${formatHost(host)}:${port}`,
    close() {
      closing = true;
      stopDrainingRevokedGrants?.();
      sessions.beginClose();
      const attempt = cleanupQueue.then(runCleanup, runCleanup);
      cleanupQueue = attempt.then(
        () => undefined,
        () => undefined,
      );
      return attempt;
    },
    recoverTarget(targetId, request) {
      if (!targets.list().some(({ id }) => id === targetId)) {
        return Promise.reject(new Error(`Target "${targetId}" is not registered.`));
      }
      return sessions.recoverTarget(targetId, request);
    },
  };

  async function runCleanup(): Promise<void> {
    let sessionError: unknown;
    listenerClosePromise ??= httpServer.listening ? closeServer(httpServer) : Promise.resolve();
    await listenerClosePromise;
    await sessions.waitForCreates();
    try {
      await sessions.deleteAll();
    } catch (error) {
      sessionError = error;
    }
    const hosts = new Set(targets.list().map(({ host: targetHost }) => targetHost));
    const results = await Promise.allSettled(
      [...hosts].map((targetHost) => withCommandTimeout((signal) => targetHost.dispose(signal), 10_000, 'Disposing a desktop host')),
    );
    const hostErrors = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(({ reason }) => reason);
    if (sessionError || hostErrors.length > 0) {
      throw new AggregateError([...(sessionError ? [sessionError] : []), ...hostErrors], 'Desktop Driver cleanup failed.');
    }
  }
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  sessions: SessionManager,
  targets: TargetRegistry,
  settings: RequestSettings,
): Promise<void> {
  const disconnected = new AbortController();
  response.once('close', () => {
    if (!response.writableFinished) {
      disconnected.abort();
    }
  });
  try {
    if (request.headers.origin) {
      throw new WebDriverError('unknown error', 'Browser-origin requests are not accepted by Desktop Driver.');
    }
    // Authentication precedes everything that reads or parses the request, so an unauthenticated caller reaches no route
    // logic, learns nothing about sessions or targets, and cannot make the service buffer a body.
    const grant = authenticateRequest(request, settings.authority);
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- This base URL only parses a loopback listener path.
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const method = request.method ?? 'GET';
    const sessionId = segments[0] === 'session' ? segments[1] : undefined;
    if (sessionId) {
      // Checked before the command queues, so a caller never waits in, or delays, another grant's session queue.
      sessions.getFor(sessionId, grant?.id);
    }
    const body =
      method === 'GET' || method === 'DELETE' ? undefined : await readJsonBody(request, requestBodyLimit(segments, settings.maxBodyBytes));
    const operation = () => {
      // Session requests may wait in a queue after their initial authentication. Revalidate before allowing
      // a queued request to run under a grant that has since been revoked.
      authenticateRequest(request, settings.authority);
      return route(
        {
          authority: settings.authority,
          body,
          contentPolicy: settings.contentPolicy,
          grant,
          method,
          segments,
          signal: disconnected.signal,
        },
        sessions,
        targets,
      );
    };
    const value = sessionId ? await sessions.runCommand(sessionId, operation) : await operation();
    writeJson(response, 200, { value });
  } catch (error) {
    const webdriverError = toWebDriverError(error);
    writeJson(response, webdriverError.status, { value: webdriverError.toJSON() }, errorHeaders(webdriverError));
  }
}

const defaultIdleSessionTimeoutMs = 10 * 60 * 1000;
// The largest delay a Node timer honors; a larger value would fire at once.
const maxIdleSessionTimeoutMs = 2_147_483_647;

function resolveIdleSessionTimeout(options: DesktopDriverServerOptions): number {
  const value = options.idleSessionTimeoutMs;
  if (value === undefined) {
    return options.authority ? defaultIdleSessionTimeoutMs : 0;
  }
  if (!options.authority) {
    throw new TypeError('The idleSessionTimeoutMs option applies only to a protected service, which needs an authority.');
  }
  if (!Number.isSafeInteger(value) || value < 0 || value > maxIdleSessionTimeoutMs) {
    throw new RangeError(`The idleSessionTimeoutMs option must be an integer from 0 to ${maxIdleSessionTimeoutMs}.`);
  }
  return value;
}

/** Returns the caller's grant on a protected service, and undefined on a service that does not authenticate. */
function authenticateRequest(request: IncomingMessage, authority: DesktopAuthority | undefined): DesktopGrant | undefined {
  if (!authority) {
    return undefined;
  }
  const cleanup = request.method === 'DELETE' && request.url === '/furn/grants/current';
  const grant =
    authority.authenticate(request.headers.authorization) ??
    (cleanup ? authority.authenticateRevocation(request.headers.authorization) : undefined);
  if (!grant || !grant.scopes.includes('driver-control')) {
    // A missing, malformed, revoked, and wrong-secret grant are indistinguishable, and the stack trace stays server-side.
    const error = new WebDriverError('unauthorized', 'A valid Desktop Driver grant is required.');
    error.stack = '';
    throw error;
  }
  return grant;
}

function errorHeaders(error: WebDriverError): Record<string, string> | undefined {
  // The connection closes after a rejection so an unauthenticated caller cannot hold it open and keep streaming a body.
  return error.code === 'unauthorized' ? { Connection: 'close', 'WWW-Authenticate': 'Bearer realm="furn-desktop-driver"' } : undefined;
}

/** The targets a caller may open: every registered target for the legacy service, and the grant's targets otherwise. */
function visibleTargets(context: Pick<RouteContext, 'grant'>, targets: TargetRegistry): readonly DesktopTarget[] {
  const { grant } = context;
  return grant ? targets.list().filter(({ id }) => grantAllowsTarget(grant, id)) : targets.list();
}

async function route(context: RouteContext, sessions: SessionManager, targets: TargetRegistry): Promise<unknown> {
  const { body, method, segments } = context;

  if (segments.length === 3 && segments[0] === 'furn' && segments[1] === 'grants' && context.authority && context.grant) {
    if (method === 'POST' && segments[2] === 'connection') {
      if (Object.keys(requireObject(body, 'Connection delegation')).length !== 0)
        throw invalidArgument('Connection delegation accepts no input.');
      const child = context.authority.delegate(context.grant.id, {
        label: context.grant.label,
        scopes: ['driver-control'],
        targets: context.grant.targets,
      });
      return { token: child.token };
    }
    if (method === 'DELETE' && segments[2] === 'current') {
      if (!context.grant.parentId) {
        const error = new WebDriverError('unauthorized', 'Only a connection child can revoke itself.');
        error.stack = '';
        throw error;
      }
      await context.authority.revokeAndDrain(context.grant.id);
      return null;
    }
  }

  if (method === 'GET' && segments.length === 1 && segments[0] === 'status') {
    const targetInfo = await Promise.all(
      visibleTargets(context, targets).map(async (target) => {
        const quarantine = sessions.getQuarantine(target.id);
        return {
          endpoint: target.endpoint,
          id: target.id,
          launchModes: target.launchModes ?? ['launch', 'attach'],
          platformName: target.platformName,
          renderer: target.renderer,
          host: await withCommandTimeout((signal) => target.host.probe(signal), 10_000, `Probing target "${target.id}"`),
          ...(quarantine ? { quarantine: sessions.describeQuarantine(quarantine) } : {}),
        };
      }),
    );
    return {
      message: 'Desktop Driver is ready.',
      ready: true,
      // A client that remembers the incarnation can tell a restarted service from the one it was using.
      ...(context.authority ? { service: { incarnation: context.authority.incarnation } } : {}),
      targets: targetInfo,
    };
  }

  if (method === 'POST' && segments.length === 1 && segments[0] === 'session') {
    const request = requireObject(body, 'New Session request') as NewSessionRequest;
    if (!request.capabilities) {
      throw invalidArgument('New Session requires "capabilities".');
    }
    // A target outside the grant matches as if it were not registered, so a grant cannot discover what it may not use.
    const matched = await matchCapabilities(request.capabilities, visibleTargets(context, targets));
    try {
      const owner = context.grant ? { grantId: context.grant.id, label: context.grant.label } : undefined;
      const session = await sessions.create(
        matched.target,
        matched.hostInfo,
        matched.clickMode,
        matched.launchMode,
        owner,
        matched.inputMode,
      );
      return {
        sessionId: session.id,
        capabilities: createReturnedCapabilities(matched, matched.hostInfo, session.timeouts),
      };
    } catch (error) {
      const webdriverError = toWebDriverError(error);
      if (webdriverError.code === 'session not created') {
        throw webdriverError;
      }
      throw new WebDriverError('session not created', webdriverError.message, webdriverError.data);
    }
  }

  if (segments[0] !== 'session' || !segments[1]) {
    throw new WebDriverError('unknown command', `No WebDriver command matches ${method} /${segments.join('/')}.`);
  }

  const session = sessions.getFor(segments[1], context.grant?.id);
  const command = segments.slice(2);

  if (method === 'DELETE' && command.length === 0) {
    await sessions.delete(session.id);
    return null;
  }
  sessions.assertActive(session);
  if (command[0] === 'timeouts') {
    return handleTimeouts(method, body, session);
  }
  if (command[0] === 'window') {
    return handleWindowCommand(method, command.slice(1), body, session, sessions);
  }
  if (method === 'POST' && (command[0] === 'element' || command[0] === 'elements') && command.length === 1) {
    return findElements(session, sessions, body, command[0] === 'element');
  }
  if (method === 'GET' && command[0] === 'element' && command[1] === 'active') {
    const active = await hostCommand(session, 'Reading the active element', (signal) =>
      session.target.host.activeElement(session.currentWindowId, signal),
    );
    return active ? toElementReference(sessions.registerElement(session, active)) : null;
  }
  if (command[0] === 'element' && command[1]) {
    return handleElementCommand(method, command.slice(1), body, session, sessions);
  }
  if (command[0] === 'actions') {
    if (method === 'POST') {
      const { actions, nextState } = parseActionSequences(requireObject(body, 'actions request').actions, session.inputState);
      const resolvedActions = await resolveActionOrigins(actions, session, sessions);
      const mechanisms = actionMechanisms(resolvedActions);
      for (const mechanism of mechanisms) {
        assertInputAllowed(session, mechanism, 'Performing input actions');
      }
      await sessions.runInputCommand(async () => {
        sessions.assertMutable(session);
        session.inputState = nextState;
        try {
          await mutationCommand(sessions, session, 'Performing input actions', (signal) =>
            deliverInput(session, mechanisms, () => session.target.host.performActions(resolvedActions, signal)),
          );
        } catch (error) {
          await mutationCommand(
            sessions,
            session,
            'Releasing failed input actions',
            (signal) => session.target.host.releaseActions(signal),
            { recovery: true },
          ).catch(() => undefined);
          session.inputState = createInputState();
          throw error;
        }
      });
      return null;
    }
    if (method === 'DELETE') {
      await sessions.runInputCommand(() =>
        mutationCommand(sessions, session, 'Releasing input actions', (signal) => session.target.host.releaseActions(signal), {
          recovery: true,
        }),
      );
      session.inputState = createInputState();
      return null;
    }
  }
  if (method === 'GET' && command[0] === 'screenshot' && command.length === 1) {
    const image = await hostCommand(session, 'Capturing the current window', (signal) =>
      session.target.host.captureWindow(session.currentWindowId, signal),
    );
    return Buffer.from(image.data).toString('base64');
  }
  if (method === 'GET' && command[0] === 'source' && command.length === 1) {
    return hostCommand(session, 'Reading the accessibility source', (signal) =>
      session.target.host.source(session.currentWindowId, signal),
    );
  }
  if (command[0] === 'furn') {
    if (method === 'GET' && command[1] === 'input' && command.length === 2) {
      return describeSessionInput(session);
    }
    if (method === 'GET' && command[1] === 'tree' && command.length === 2) {
      const snapshots = await hostCommand(session, 'Reading the compact accessibility tree', (signal) =>
        session.target.host.tree(session.currentWindowId, signal),
      );
      return buildDesktopTree(snapshots);
    }
    if (method === 'GET' && command[1] === 'window-events' && command.length === 2) {
      const windowEvents = session.target.host.windowEvents?.bind(session.target.host);
      if (!windowEvents) {
        throw new WebDriverError('unsupported operation', `Target "${session.target.id}" does not record native window events.`);
      }
      return hostCommand(session, 'Reading native window events', (signal) => windowEvents(session.lease, signal));
    }
    if (command[1] === 'ops') {
      const runtime = createOperationRuntime(session, sessions, { contentPolicy: context.contentPolicy, signal: context.signal });
      return handleOperationRoute(method, command.slice(2), body, runtime);
    }
    return handleStorybookCommand(method, command.slice(1), body, session, sessions);
  }

  function buildDesktopTree(snapshots: readonly NativeElementSnapshot[]): DesktopTreeNode[] {
    const children = new Map<string | undefined, NativeElementSnapshot[]>();
    for (const snapshot of snapshots) {
      const siblings = children.get(snapshot.parentId) ?? [];
      siblings.push(snapshot);
      children.set(snapshot.parentId, siblings);
    }
    const build = (snapshot: NativeElementSnapshot): DesktopTreeNode => ({
      children: (children.get(snapshot.id) ?? []).map(build),
      ...(snapshot.name ? { name: snapshot.name } : {}),
      rect: snapshot.rect,
      role: snapshot.role,
      states: {
        ...(snapshot.checked.supported ? { checked: snapshot.checked.value } : {}),
        ...(snapshot.enabled.supported ? { enabled: snapshot.enabled.value } : {}),
        ...(snapshot.expanded.supported ? { expanded: snapshot.expanded.value } : {}),
        ...(snapshot.focused.supported ? { focused: snapshot.focused.value } : {}),
        ...(snapshot.required?.supported ? { required: snapshot.required.value } : {}),
        ...(snapshot.selected.supported ? { selected: snapshot.selected.value } : {}),
        ...(snapshot.visible.supported ? { visible: snapshot.visible.value } : {}),
      },
      ...(snapshot.automationId ? { testId: snapshot.automationId } : {}),
      ...(snapshot.text ? { text: snapshot.text } : {}),
      ...(snapshot.value !== undefined ? { value: snapshot.value } : {}),
    });
    return (children.get(undefined) ?? []).map(build);
  }

  async function resolveActionOrigins(
    actions: readonly WebDriverActionSequence[],
    session: DesktopSession,
    sessions: SessionManager,
  ): Promise<NativeActionSequence[]> {
    const resolved: NativeActionSequence[] = [];
    for (const sequence of actions) {
      const resolvedSequence: NativeActionSequence = { ...sequence, actions: [] };
      for (const action of sequence.actions) {
        const origin = action.origin;
        if (!origin || origin === 'viewport' || origin === 'pointer') {
          resolvedSequence.actions.push(action);
          continue;
        }
        const elementId = typeof origin === 'object' ? origin[webElementIdentifier] : undefined;
        if (typeof elementId !== 'string') {
          throw invalidArgument('Action element origin is missing a valid WebDriver element reference.');
        }
        const record = sessions.resolveElement(session, elementId);
        if (record.scope === 'preview') {
          await assertStoryContext(session, sessions);
          sessions.resolveElement(session, elementId);
        }
        await hostCommand(session, `Resolving action origin element "${elementId}"`, (signal) =>
          session.target.host.snapshot(record.nativeId, signal),
        );
        resolvedSequence.actions.push({
          ...action,
          origin: { elementId: record.nativeId },
        });
      }
      resolved.push(resolvedSequence);
    }
    return resolved;
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
      return withCommandTimeout(
        (signal) => orchestrator.getManifest({ lifetimeId: session.id, signal }),
        session.desktopTimeouts.nativeCommand,
        'Reading the Storybook manifest',
        { signal: session.commandAbortController.signal },
      );
    }
    if (method === 'GET' && command[0] === 'story' && command.length === 1) {
      const current = await readCurrentStory(session, sessions, session.commandAbortController.signal);
      return current.story?.verification === 'unconfirmed' ? null : session.story;
    }
    if (method === 'POST' && command[0] === 'story' && command.length === 1) {
      sessions.assertMutable(session);
      return (await changeStory(session, sessions, 'select', parseStorySelection(body))).result;
    }
    if (method === 'POST' && command[0] === 'story' && command[1] === 'reset') {
      sessions.assertMutable(session);
      return (await changeStory(session, sessions, 'reset', parseStorySelection(body))).result;
    }
    if (method === 'POST' && command[0] === 'story' && command[1] === 'args') {
      if (context.authority) {
        throw new WebDriverError('unsupported operation', 'Storybook args updates are not supported on protected services.', {
          reason: 'story-args-unsupported',
        });
      }
      sessions.assertMutable(session);
      if (!orchestrator.updateArgs) {
        throw new WebDriverError('unsupported operation', 'This Storybook target does not support arg updates.');
      }
      const request = requireObject(body, 'Storybook args request');
      if (typeof request.storyId !== 'string') {
        throw invalidArgument('Storybook args request requires a string "storyId".');
      }
      const args = requireObject(request.args, 'Storybook args request "args"');
      sessions.invalidatePreview(session);
      session.story = null;
      await withCommandTimeout(
        (signal) => orchestrator.updateArgs!(request.storyId as string, args, { lifetimeId: session.id, signal }),
        session.desktopTimeouts.storyRender,
        `Updating args for Storybook story "${request.storyId}"`,
        { signal: session.commandAbortController.signal },
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

async function handleWindowCommand(
  method: string,
  command: string[],
  body: unknown,
  session: DesktopSession,
  sessions: SessionManager,
): Promise<unknown> {
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
    await sessions.runInputCommand(() =>
      mutationCommand(sessions, session, `Activating window "${handle}"`, (signal) => host.activate(handle, signal)),
    );
    session.currentWindowId = handle;
    return null;
  }
  if (command.length === 0 && method === 'DELETE') {
    ensureCurrentWindow(session);
    await sessions.runInputCommand(() =>
      mutationCommand(sessions, session, `Closing window "${session.currentWindowId}"`, (signal) =>
        host.closeWindow(session.currentWindowId, signal),
      ),
    );
    session.windows = await hostCommand(session, 'Reading application windows', (signal) => host.windows(session.lease, signal));
    session.currentWindowId = session.windows[0]?.id ?? '';
    return session.windows.map(({ id }) => id);
  }
  if (command[0] === 'handles' && command.length === 1 && method === 'GET') {
    session.windows = await hostCommand(session, 'Reading application windows', (signal) => host.windows(session.lease, signal));
    return session.windows.map(({ id }) => id);
  }
  if (command[0] === 'rect' && command.length === 1) {
    ensureCurrentWindow(session);
    if (method === 'GET') {
      return hostCommand(session, 'Reading the current window rectangle', (signal) => host.getWindowRect(session.currentWindowId, signal));
    }
    if (method === 'POST') {
      const rect = validatePartialRect(requireObject(body, 'window rectangle'));
      return mutationCommand(sessions, session, 'Setting the current window rectangle', (signal) =>
        host.setWindowRect(session.currentWindowId, rect, signal),
      );
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
  const operation = command.slice(1);
  if (record.scope === 'preview' && isElementMutation(method, operation)) {
    await assertStoryContext(session, sessions);
    sessions.resolveElement(session, command[0]);
  }
  const snapshot = await hostCommand(session, `Reading element "${record.id}"`, (signal) =>
    session.target.host.snapshot(record.nativeId, signal),
  );

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
  if (method === 'GET' && (operation[0] === 'attribute' || operation[0] === 'property') && operation[1] === 'accessibilityActions') {
    const accessibilityActions = session.target.host.accessibilityActions?.bind(session.target.host);
    if (!accessibilityActions) {
      throw new WebDriverError('unsupported operation', `Target "${session.target.id}" does not list accessibility actions.`);
    }
    return hostCommand(session, `Reading accessibility actions of element "${record.id}"`, (signal) =>
      accessibilityActions(record.nativeId, signal),
    );
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
    const mechanism = clickMechanism(session.clickMode);
    // Checked before the window is activated, so a refused click changes nothing.
    assertInputAllowed(session, mechanism, `Clicking element "${record.id}"`);
    await sessions.runInputCommand(async () => {
      if (session.clickMode !== 'accessibility') {
        await mutationCommand(sessions, session, `Activating window "${snapshot.windowId}"`, (signal) =>
          session.target.host.activate(snapshot.windowId, signal),
        );
        const point = {
          x: snapshot.rect.x + snapshot.rect.width / 2,
          y: snapshot.rect.y + snapshot.rect.height / 2,
        };
        const hit = await hostCommand(session, `Hit testing element "${record.id}"`, (signal) =>
          session.target.host.hitTest(snapshot.windowId, point.x, point.y, signal),
        );
        if (hit && !(await isElementOrDescendant(session, snapshot.id, hit))) {
          throw new WebDriverError(
            'element click intercepted',
            `Element "${record.id}" is obscured by another native element: ${hit.role} "${hit.name ?? ''}" (${hit.id}).`,
          );
        }
      }
      await mutationCommand(sessions, session, `Clicking element "${record.id}"`, (signal) =>
        deliverInput(session, [mechanism], () => session.target.host.click(record.nativeId, session.clickMode, signal)),
      );
    });
    return null;
  }
  if (method === 'POST' && operation[0] === 'clear') {
    const description = `Clearing element "${record.id}"`;
    const requested = strictClearMechanism(session, description);
    await sessions.runInputCommand(() =>
      mutationCommand(sessions, session, description, (signal) =>
        deliverClear(session, requested, description, (mechanism) => session.target.host.clear(record.nativeId, signal, mechanism)),
      ),
    );
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
    assertInputAllowed(session, 'keyboard', `Sending keys to element "${record.id}"`);
    await sessions.runInputCommand(() =>
      mutationCommand(sessions, session, `Sending keys to element "${record.id}"`, (signal) =>
        deliverInput(session, ['keyboard'], () => session.target.host.sendKeys(record.nativeId, text, signal)),
      ),
    );
    return null;
  }
  if (method === 'POST' && operation[0] === 'furn' && operation[1] === 'accessibility-action' && operation.length === 2) {
    return performNamedAccessibilityAction(body, record, session, sessions);
  }
  if (method === 'GET' && operation[0] === 'screenshot') {
    const image = await hostCommand(session, `Capturing element "${record.id}"`, (signal) =>
      session.target.host.captureElement(record.nativeId, signal),
    );
    return Buffer.from(image.data).toString('base64');
  }

  throw new WebDriverError('unknown command', `Unknown element command "${operation.join('/')}".`);
}

/** Element commands that change the application, so a preview element may only receive them in the story it was found in. */
function isElementMutation(method: string, operation: string[]): boolean {
  if (method !== 'POST') {
    return false;
  }
  return ['click', 'clear', 'value'].includes(operation[0]) || (operation[0] === 'furn' && operation[1] === 'accessibility-action');
}

/**
 * Performs the one accessibility action an element publishes under a name, such as a custom `Toggle`. The action is
 * listed and performed in the same input turn, and a name the element publishes twice names neither action.
 */
async function performNamedAccessibilityAction(
  body: unknown,
  record: ElementRecord,
  session: DesktopSession,
  sessions: SessionManager,
): Promise<null> {
  const request = requireObject(body, 'accessibility action request');
  if (typeof request.name !== 'string' || request.name.length === 0) {
    throw invalidArgument('An accessibility action request requires a non-empty string "name".');
  }
  const name = request.name;
  const host = session.target.host;
  const list = host.listAccessibilityActions?.bind(host);
  const perform = host.performAccessibilityAction?.bind(host);
  if (!list || !perform || session.hostInfo.features.performAccessibilityAction !== true) {
    throw new WebDriverError('unsupported operation', `Target "${session.target.id}" does not perform accessibility actions.`);
  }
  const description = `Performing an accessibility action on element "${record.id}"`;
  assertInputAllowed(session, 'accessibility-action', description);
  await sessions.runInputCommand(async () => {
    const actions: NativeAccessibilityAction[] = await hostCommand(
      session,
      `Listing the accessibility actions of element "${record.id}"`,
      (signal) => list(record.nativeId, signal),
    );
    const matches = actions.filter((action) => action.name === name);
    if (matches.length !== 1) {
      throw new WebDriverError(
        'element not interactable',
        matches.length === 0
          ? `Element "${record.id}" publishes no accessibility action by that name.`
          : `Element "${record.id}" publishes ${matches.length} accessibility actions by that name, so the name names none of them.`,
        { reason: matches.length === 0 ? 'action-not-published' : 'action-not-unique' },
      );
    }
    const [{ key }] = matches;
    await mutationCommand(sessions, session, description, (signal) =>
      deliverInput(session, ['accessibility-action'], () => perform(record.nativeId, key, signal)),
    );
  });
  return null;
}

async function isElementOrDescendant(session: DesktopSession, targetNativeId: string, hit: NativeElementSnapshot): Promise<boolean> {
  let current: NativeElementSnapshot | undefined = hit;
  for (let depth = 0; current && depth < 100; depth += 1) {
    if (current.id === targetNativeId) {
      return true;
    }
    current = current.parentId
      ? await hostCommand(session, 'Resolving the hit-test ancestor', (signal) =>
          session.target.host.snapshot(current!.parentId!, signal),
        ).catch(() => undefined)
      : undefined;
  }
  return false;
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
    matches = await hostCommand(session, `Finding elements by ${selector.strategy}`, (signal) =>
      session.target.host.find({ elementId: rootElement?.nativeId, windowId: session.currentWindowId }, selector, signal),
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
  if (
    strategy !== '-furn:text' &&
    strategy !== 'accessibility id' &&
    strategy !== 'tag name' &&
    strategy !== 'link text' &&
    strategy !== 'partial link text'
  ) {
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
    case 'helpText':
      return requireSupported(
        snapshot.helpText ?? { supported: false, reason: 'The provider does not expose accessibility help text.' },
        'helpText',
      );
    case 'value':
      return snapshot.value ?? null;
    case 'focused':
      return requireSupported(snapshot.focused, 'focused');
    case 'enabled':
      return requireSupported(snapshot.enabled, 'enabled');
    case 'checked':
      return requireSupported(snapshot.checked, 'checked');
    case 'expanded':
      return requireSupported(snapshot.expanded, 'expanded');
    case 'required':
      return requireSupported(
        snapshot.required ?? { supported: false, reason: 'The provider does not expose required-form state.' },
        'required',
      );
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

function hostCommand<T>(session: DesktopSession, description: string, operation: (signal: AbortSignal) => Promise<T>): Promise<T> {
  return withCommandTimeout(operation, session.desktopTimeouts.nativeCommand, description, {
    signal: session.commandAbortController.signal,
  });
}

/** Runs a mutating host command behind the target quarantine guard and settles its failure into a disposition. */
function mutationCommand<T>(
  sessions: SessionManager,
  session: DesktopSession,
  description: string,
  operation: (signal: AbortSignal) => Promise<T>,
  options?: MutationOptions,
): Promise<T> {
  return sessions.runMutation(session, description, () => hostCommand(session, description, operation), options);
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

function writeJson(response: ServerResponse, status: number, body: WebDriverResponse, headers?: Record<string, string>): void {
  const json = JSON.stringify(body);
  response.writeHead(status, {
    'Cache-Control': 'no-cache',
    'Content-Length': Buffer.byteLength(json),
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
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
