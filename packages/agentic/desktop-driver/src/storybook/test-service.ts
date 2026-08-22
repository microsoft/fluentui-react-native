/**
 * The loopback desktop test service.
 *
 * The on-device Storybook UI cannot execute a test runner or native automation, so it sends an
 * allowlisted run request here and receives progress events. The service binds to loopback only,
 * mints a per-boot token, validates every story id against the generated manifest, and never
 * accepts a command line or module path from the application.
 */

import * as crypto from 'node:crypto';
import * as http from 'node:http';

import { DesktopCancelledError, DesktopDriverError } from '../errors.ts';
import { hostForUrl } from '../net.ts';
import { DESKTOP_PROTOCOL_VERSION } from '../protocol.ts';
import type { DesktopRunExecutor, DesktopRunRequest } from '../server/coordinator.ts';
import type { DesktopServiceRunStatus, DesktopTestResult, StoryTestManifest } from '../types.ts';

export interface DesktopTestServiceOptions {
  manifest: StoryTestManifest;
  execute: DesktopRunExecutor;
  host?: string;
  port?: number;
  /** Overrides the generated per-boot token. Only used by tests. */
  token?: string;
  /** Maximum time to await cancelled runners during shutdown. Defaults to 10000. */
  shutdownTimeoutMs?: number;
}

interface RunRecord {
  status: DesktopServiceRunStatus;
  controller: AbortController;
  subscribers: Set<http.ServerResponse>;
  completion?: Promise<void>;
}

const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', 'localhost']);

export class DesktopTestService {
  private readonly manifest: StoryTestManifest;
  private readonly execute: DesktopRunExecutor;
  private readonly host: string;
  private readonly requestedPort: number;
  readonly token: string;
  private readonly shutdownTimeoutMs: number;

  private server?: http.Server;
  private boundPort = 0;
  private readonly runs = new Map<string, RunRecord>();
  private activeRunId?: string;

  constructor(options: DesktopTestServiceOptions) {
    this.manifest = options.manifest;
    this.execute = options.execute;
    this.host = options.host ?? '127.0.0.1';
    this.requestedPort = options.port ?? 7017;
    this.token = options.token ?? crypto.randomBytes(24).toString('base64url');
    this.shutdownTimeoutMs = options.shutdownTimeoutMs ?? 10_000;

    if (!LOOPBACK_HOSTS.has(this.host)) {
      throw new DesktopDriverError(`The desktop test service refuses to bind to non-loopback address "${this.host}"`, {
        kind: 'configuration',
      });
    }
  }

  get url(): string {
    return `http://${hostForUrl(this.host)}:${this.boundPort}`;
  }

  async start(): Promise<{ url: string; token: string }> {
    const server = http.createServer((request, response) => {
      void this.handle(request, response);
    });
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen({ host: this.host, port: this.requestedPort }, resolve);
    });
    const address = server.address();
    this.boundPort = typeof address === 'object' && address !== null ? address.port : this.requestedPort;
    this.server = server;
    return { url: this.url, token: this.token };
  }

  async stop(): Promise<void> {
    const completions: Promise<void>[] = [];
    for (const run of this.runs.values()) {
      run.controller.abort();
      if (run.completion) {
        completions.push(run.completion);
      }
      for (const subscriber of run.subscribers) {
        subscriber.end();
      }
    }
    let shutdownFailure: unknown;
    if (completions.length > 0) {
      try {
        await withTimeout(Promise.allSettled(completions), this.shutdownTimeoutMs);
      } catch (error) {
        shutdownFailure = error;
      }
    }
    const server = this.server;
    this.server = undefined;
    if (!server) {
      if (shutdownFailure) {
        throw shutdownFailure;
      }
      return;
    }
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
    if (shutdownFailure) {
      throw shutdownFailure;
    }
  }

  private authorized(request: http.IncomingMessage): boolean {
    const header = request.headers.authorization ?? '';
    const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
    return secretsMatch(provided, this.token);
  }

  private async handle(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
    try {
      await this.route(request, response);
    } catch (error) {
      // A malformed path or body must answer with a status, not reject: an unhandled rejection
      // would terminate the service, and this handler is reachable before authentication.
      if (!response.headersSent) {
        send(response, 400, { error: error instanceof Error ? error.message : String(error) });
        return;
      }
      response.end();
    }
  }

  private async route(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const pathname = url.pathname.replace(/\/+$/, '') || '/';

    if (request.method === 'GET' && pathname === '/v1/health') {
      // Liveness is unauthenticated so the app can discover the service before it has a token.
      send(response, 200, { status: 'ok', protocolVersion: DESKTOP_PROTOCOL_VERSION, manifestDigest: this.manifest.digest });
      return;
    }

    if (!this.authorized(request)) {
      send(response, 401, { error: 'unauthorized' });
      return;
    }

    if (request.method === 'GET' && pathname === '/v1/stories') {
      send(response, 200, {
        protocolVersion: DESKTOP_PROTOCOL_VERSION,
        digest: this.manifest.digest,
        stories: this.manifest.entries.map((entry) => ({
          storyId: entry.storyId,
          title: entry.title,
          name: entry.name,
          kind: entry.plan.kind,
          planId: entry.plan.id,
          description: entry.plan.description,
        })),
      });
      return;
    }

    if (request.method === 'POST' && pathname === '/v1/runs') {
      await this.startRun(request, response);
      return;
    }

    const statusMatch = /^\/v1\/runs\/([^/]+)$/.exec(pathname);
    if (request.method === 'GET' && statusMatch) {
      const run = this.runs.get(decodeURIComponent(statusMatch[1]));
      send(response, run ? 200 : 404, run ? run.status : { error: 'unknown run' });
      return;
    }

    const eventsMatch = /^\/v1\/runs\/([^/]+)\/events$/.exec(pathname);
    if (request.method === 'GET' && eventsMatch) {
      this.subscribe(decodeURIComponent(eventsMatch[1]), response);
      return;
    }

    const cancelMatch = /^\/v1\/runs\/([^/]+)\/cancel$/.exec(pathname);
    if (request.method === 'POST' && cancelMatch) {
      const run = this.runs.get(decodeURIComponent(cancelMatch[1]));
      if (!run) {
        send(response, 404, { error: 'unknown run' });
        return;
      }
      run.controller.abort();
      send(response, 202, { runId: run.status.runId, state: 'cancelled' });
      return;
    }

    send(response, 404, { error: `no route for ${request.method} ${pathname}` });
  }

  private async startRun(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
    // The slot is reserved before the first await. Reading the body is asynchronous, so a
    // check-then-await guard would let two requests (a double tap on "Run current test") both
    // start a run against the same single desktop.
    if (this.activeRunId !== undefined) {
      send(response, 409, { error: 'a run is already in progress for this application session' });
      return;
    }
    const runId = crypto.randomUUID();
    this.activeRunId = runId;

    try {
      let payload: DesktopRunRequest;
      try {
        payload = (await readJson(request)) as DesktopRunRequest;
      } catch (error) {
        send(response, 400, { error: (error as Error).message });
        return;
      }

      if (payload?.protocolVersion !== DESKTOP_PROTOCOL_VERSION) {
        send(response, 400, { error: `protocolVersion must be ${DESKTOP_PROTOCOL_VERSION}` });
        return;
      }

      const known = new Set(this.manifest.entries.map((entry) => entry.storyId));
      let storyIds: string[];
      if (payload.mode === 'all') {
        storyIds = [...known];
      } else {
        const requested = payload.storyIds ?? [];
        const unknown = requested.filter((storyId) => !known.has(storyId));
        if (requested.length === 0 || unknown.length > 0) {
          send(response, 400, { error: `unknown or missing story ids: ${unknown.join(', ') || '(none supplied)'}` });
          return;
        }
        storyIds = [...requested];
      }

      const record: RunRecord = {
        controller: new AbortController(),
        subscribers: new Set(),
        status: {
          runId,
          protocolVersion: DESKTOP_PROTOCOL_VERSION,
          state: 'running',
          requestedStoryIds: storyIds,
          startedAt: new Date().toISOString(),
          results: [],
        },
      };
      this.runs.set(runId, record);

      send(response, 202, record.status);
      record.completion = this.runInBackground(record, storyIds);
    } finally {
      // The slot stays reserved only for a run that actually started.
      if (!this.runs.has(runId)) {
        this.activeRunId = undefined;
      }
    }
  }

  private async runInBackground(record: RunRecord, storyIds: readonly string[]): Promise<void> {
    const results: DesktopTestResult[] = [];
    const publish = (event: Record<string, unknown>): void => {
      const payload = `data: ${JSON.stringify(event)}\n\n`;
      for (const subscriber of record.subscribers) {
        subscriber.write(payload);
      }
    };

    try {
      const finalResults = await this.execute(
        storyIds,
        (result) => {
          results.push(result);
          record.status = { ...record.status, results: [...results] };
          publish({ type: 'testResult', result });
        },
        record.controller.signal,
      );
      const merged = finalResults.length > 0 ? finalResults : results;
      record.status = {
        ...record.status,
        state: merged.some((result) => result.status === 'failed' || result.status === 'infrastructureError') ? 'failed' : 'passed',
        finishedAt: new Date().toISOString(),
        results: merged,
      };
    } catch (error) {
      const cancelled = error instanceof DesktopCancelledError || record.controller.signal.aborted;
      record.status = {
        ...record.status,
        state: cancelled ? 'cancelled' : 'error',
        finishedAt: new Date().toISOString(),
        results,
        message: error instanceof Error ? error.message : String(error),
      };
    }

    publish({ type: 'runFinished', status: record.status });
    for (const subscriber of record.subscribers) {
      subscriber.end();
    }
    record.subscribers.clear();
    if (this.activeRunId === record.status.runId) {
      this.activeRunId = undefined;
    }
  }

  private subscribe(runId: string, response: http.ServerResponse): void {
    const run = this.runs.get(runId);
    if (!run) {
      send(response, 404, { error: 'unknown run' });
      return;
    }
    response.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-store',
      connection: 'keep-alive',
    });
    response.write(`data: ${JSON.stringify({ type: 'runStatus', status: run.status })}\n\n`);

    if (run.status.state === 'running') {
      run.subscribers.add(response);
      response.on('close', () => run.subscribers.delete(response));
      return;
    }
    response.end();
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new DesktopDriverError(`Desktop test service shutdown exceeded ${timeoutMs}ms while awaiting active runners`, {
          kind: 'lifecycle',
        }),
      );
    }, timeoutMs);
    timer.unref();
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Constant-time secret comparison.
 *
 * Compares fixed-size digests: `crypto.timingSafeEqual` requires equal byte lengths, and two
 * strings of equal character length can still differ in bytes, which would throw rather than
 * return false. This is reachable before authentication, so it must never throw.
 */
export function secretsMatch(provided: string, expected: string): boolean {
  return crypto.timingSafeEqual(sha256(provided), sha256(expected));
}

function sha256(value: string): Buffer {
  return crypto.createHash('sha256').update(value, 'utf8').digest();
}

async function readJson(request: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    size += (chunk as Buffer).length;
    if (size > 64 * 1024) {
      throw new Error('request body is too large');
    }
    chunks.push(chunk as Buffer);
  }
  if (chunks.length === 0) {
    throw new Error('request body is required');
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function send(response: http.ServerResponse, status: number, payload: unknown): void {
  const text = JSON.stringify(payload);
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(text),
    'cache-control': 'no-store',
  });
  response.end(text);
}
