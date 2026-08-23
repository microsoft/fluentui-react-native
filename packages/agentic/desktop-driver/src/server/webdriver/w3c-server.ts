/**
 * A small W3C WebDriver route host.
 *
 * The plan's preferred architecture hosts exactly one driver behind an owned, loopback-only
 * WebDriver process. This module is that host's HTTP layer: it owns routing, W3C envelopes, and
 * error shapes, and knows nothing about any particular backend. Keeping it here is what makes the
 * Appium base-driver embedding an implementation detail that can be swapped without touching a
 * single test.
 */

import * as http from 'node:http';

import { hostForUrl } from '../../net.ts';
import { isLoopbackHost } from '../../core/loopback.ts';

/** W3C error codes used by the hosted drivers. */
export type W3CErrorCode =
  | 'invalid session id'
  | 'invalid argument'
  | 'invalid selector'
  | 'no such element'
  | 'no such window'
  | 'stale element reference'
  | 'unknown command'
  | 'unknown error'
  | 'unsupported operation'
  | 'session not created';

const STATUS_BY_CODE: Readonly<Record<W3CErrorCode, number>> = {
  'invalid session id': 404,
  'invalid argument': 400,
  'invalid selector': 400,
  'no such element': 404,
  'no such window': 404,
  'stale element reference': 404,
  'unknown command': 404,
  'unknown error': 500,
  'unsupported operation': 500,
  'session not created': 500,
};

/** An error that serializes into the W3C error envelope. */
export class W3CError extends Error {
  readonly code: W3CErrorCode;

  constructor(code: W3CErrorCode, message: string) {
    super(message);
    this.name = 'W3CError';
    this.code = code;
  }
}

export interface RouteContext {
  params: Record<string, string>;
  body: unknown;
  query: URLSearchParams;
}

export type RouteHandler = (context: RouteContext) => unknown | Promise<unknown>;

export interface RouteDefinition {
  method: 'GET' | 'POST' | 'DELETE';
  /** Express-style path with `:name` parameters, for example `/session/:sessionId/element`. */
  path: string;
  handler: RouteHandler;
  /**
   * When true the handler's return value is sent verbatim instead of being wrapped in the W3C
   * `{ value }` envelope. Used by the health and Storybook-compatible routes.
   */
  raw?: boolean;
}

interface CompiledRoute extends RouteDefinition {
  pattern: RegExp;
  keys: string[];
}

function compile(route: RouteDefinition): CompiledRoute {
  const keys: string[] = [];
  const source = route.path
    .split('/')
    .map((segment) => {
      if (!segment.startsWith(':')) {
        return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      keys.push(segment.slice(1));
      return '([^/]+)';
    })
    .join('/');
  return { ...route, keys, pattern: new RegExp(`^${source}$`) };
}

export interface DispatchResult {
  status: number;
  payload: unknown;
}

/**
 * Routes one request without HTTP.
 *
 * The HTTP server delegates to this, and the contract tests drive it directly so the W3C
 * semantics stay covered in environments where binding a loopback socket is not permitted.
 */
export function createRouteDispatcher(
  routes: readonly RouteDefinition[],
): (method: string, url: string, body?: unknown) => Promise<DispatchResult> {
  const compiled = routes.map(compile);

  return async (method: string, url: string, body?: unknown): Promise<DispatchResult> => {
    try {
      const parsed = new URL(url, 'http://127.0.0.1');
      const pathname = parsed.pathname.replace(/\/+$/, '') || '/';

      const match = compiled
        .map((route) => ({ route, result: route.method === method ? route.pattern.exec(pathname) : null }))
        .find((entry) => entry.result !== null);

      if (!match || !match.result) {
        return {
          status: 404,
          payload: { value: { error: 'unknown command', message: `No route for ${method} ${pathname}`, stacktrace: '' } },
        };
      }

      const params: Record<string, string> = {};
      const values = match.result;
      for (const [index, key] of match.route.keys.entries()) {
        params[key] = decodeURIComponent(values[index + 1]);
      }

      const value = await match.route.handler({ params, body, query: parsed.searchParams });
      if (match.route.raw) {
        return { status: 200, payload: value ?? {} };
      }
      return { status: 200, payload: { value: value === undefined ? null : value } };
    } catch (error) {
      // Everything, including URL parsing and percent-decoding, answers with a W3C error
      // envelope. A rejection here would take down the host process.
      const w3c = error instanceof W3CError ? error : toW3CError(error);
      return {
        status: STATUS_BY_CODE[w3c.code],
        payload: { value: { error: w3c.code, message: w3c.message, stacktrace: w3c.stack ?? '' } },
      };
    }
  };
}

function toW3CError(error: unknown): W3CError {
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof URIError || error instanceof TypeError) {
    return new W3CError('invalid argument', message);
  }
  return new W3CError('unknown error', message);
}

export interface W3CServerOptions {
  host: string;
  port: number;
  routes: readonly RouteDefinition[];
  /** Maximum accepted request body size. Defaults to 8 MiB. */
  maxBodyBytes?: number;
}

export interface W3CServerHandle {
  url: string;
  port: number;
  close(): Promise<void>;
}

/** Starts the route host. Refuses to bind to anything other than loopback. */
export async function startW3CServer(options: W3CServerOptions): Promise<W3CServerHandle> {
  if (!isLoopbackHost(options.host)) {
    throw new Error(`Refusing to bind the desktop driver host to non-loopback address "${options.host}"`);
  }

  const routes = options.routes;
  const dispatch = createRouteDispatcher(routes);
  const maxBodyBytes = options.maxBodyBytes ?? 8 * 1024 * 1024;

  const server = http.createServer((request, response) => {
    handleRequest(dispatch, maxBodyBytes, request, response).catch(() => {
      // The dispatcher already converts every failure into a response; this is the last resort
      // so a socket-level error can never become an unhandled rejection that kills the host.
      if (!response.headersSent) {
        send(response, 500, { value: { error: 'unknown error', message: 'Driver host request failed', stacktrace: '' } });
        return;
      }
      response.end();
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen({ host: options.host, port: options.port }, resolve);
  });

  const address = server.address();
  const port = typeof address === 'object' && address !== null ? address.port : options.port;

  return {
    port,
    url: `http://${hostForUrl(options.host)}:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  };
}

async function handleRequest(
  dispatch: (method: string, url: string, body?: unknown) => Promise<DispatchResult>,
  maxBodyBytes: number,
  request: http.IncomingMessage,
  response: http.ServerResponse,
): Promise<void> {
  let body: unknown;
  try {
    body = await readBody(request, maxBodyBytes);
  } catch (error) {
    send(response, 400, { value: { error: 'invalid argument', message: (error as Error).message, stacktrace: '' } });
    return;
  }

  const result = await dispatch(request.method ?? 'GET', request.url ?? '/', body);
  send(response, result.status, result.payload);
}

function readBody(request: http.IncomingMessage, maxBodyBytes: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let overflow = false;
    request.on('data', (chunk: Buffer) => {
      if (overflow) {
        return;
      }
      size += chunk.length;
      if (size > maxBodyBytes) {
        overflow = true;
        chunks.length = 0;
        return;
      }
      chunks.push(chunk);
    });
    request.on('error', reject);
    request.on('end', () => {
      if (overflow) {
        reject(new Error('Request body exceeds the configured limit'));
        return;
      }
      if (chunks.length === 0) {
        resolve(undefined);
        return;
      }
      const text = Buffer.concat(chunks).toString('utf8');
      if (text.trim().length === 0) {
        resolve(undefined);
        return;
      }
      try {
        resolve(JSON.parse(text));
      } catch (error) {
        reject(new Error(`Request body is not valid JSON: ${(error as Error).message}`));
      }
    });
  });
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
