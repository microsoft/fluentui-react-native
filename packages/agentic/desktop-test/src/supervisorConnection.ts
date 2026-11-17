import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';

import { z } from 'zod';
import { readConnectionDescriptor } from '@fluentui-react-native/desktop-driver/authority';
import type {
  DesktopConnectionDescriptor,
  DesktopServiceIdentity,
  PrivateStorage,
  VerifyDesktopService,
} from '@fluentui-react-native/desktop-driver/authority';
import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import type { DesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';

import { DesktopWorkloadError, desktopWorkloadErrorCodes, desktopWorkloadInputSchema } from './control.js';
import type { DesktopWorkloadAttenuation, DesktopWorkloadInput, DesktopWorkloadResponse, DesktopWorkloadService } from './control.js';

export const defaultSupervisorDescriptor = 'supervisor-connection.json';

const incarnation = z.string().regex(/^inc_[0-9a-f]{24}$/);
const digest = z.string().regex(/^[0-9a-f]{64}$/);
const grant = z.string().regex(/^dmg1\.[A-Za-z0-9_-]{43}$/);
const principalGrant = z.string().regex(/^dmp1\.[A-Za-z0-9_-]{43}$/);
const connectionId = z.string().regex(/^dmc_[0-9a-f]{32}$/);
const portableRecord = z
  .string()
  .regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/)
  .refine((name) => !name.endsWith('.') && !/^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(name.split('.')[0]));
const identity = z
  .strictObject({
    platform: z.enum(['macos', 'windows']),
    pid: z.number().int().positive().max(0x7fffffff),
    startedAt: z.string().min(1).max(128),
    executablePath: z.string().min(1).max(4096),
    interactiveSession: z.string().min(1).max(128),
    incarnation,
  })
  .refine(
    (value) =>
      (value.platform === 'macos' ? path.posix.isAbsolute(value.executablePath) : path.win32.isAbsolute(value.executablePath)) &&
      !/\p{Cc}/u.test(value.executablePath),
  );
const loopback = z
  .string()
  .max(128)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' && url.hostname === '127.0.0.1' && !!url.port && value === url.origin;
    } catch {
      return false;
    }
  });
const supervisorDescriptor = z
  .strictObject({
    version: z.literal(1),
    incarnation,
    management: z.strictObject({ url: loopback, grant, service: identity }),
    driver: z.strictObject({
      record: portableRecord,
      digest,
      incarnation,
      targetId: z.string().min(1).max(200),
    }),
  })
  .refine((value) => value.management.service.incarnation === value.incarnation);
type SupervisorDescriptor = z.infer<typeof supervisorDescriptor>;

const maxBodyBytes = 16 * 1024;
const maxResponseBytes = 20 * 1024;
const maxRequests = 64;
const maxConnections = 128;
const transportTimeoutMs = 15_000;

export type DesktopSupervisorPublication = {
  readonly descriptor: string;
  /** Withdraws the exact descriptor before fencing, cancelling, and draining management work. */
  close(): Promise<void>;
};

export type DesktopSupervisorPublicationOptions = {
  service: DesktopWorkloadService;
  storage: PrivateStorage;
  descriptor?: string;
  /** The native helper's identity of the process that owns the management listener. */
  identity: Omit<DesktopServiceIdentity, 'incarnation'>;
  verifyService: VerifyDesktopService;
  driver: { record: string; incarnation: string; targetId: string; digest?: string };
  /** A trusted operator policy, applied to each connection in addition to the service's host policy. */
  attenuation?: DesktopWorkloadAttenuation;
  onFailure?: (error: Error) => void;
};

/**
 * Starts a separate loopback listener, verifies both live endpoints, then publishes one owner-only discovery root.
 * A failed publication closes the listener and drains the authority; no descriptor is published partially.
 */
export async function publishDesktopSupervisor(options: DesktopSupervisorPublicationOptions): Promise<DesktopSupervisorPublication> {
  const name = parseRecordName(options.descriptor ?? defaultSupervisorDescriptor);
  const driverRecord = parseRecordName(options.driver.record);
  if (name === driverRecord) throw new TypeError('Supervisor and driver descriptors must be distinct.');
  const listener = await listen(options.service, options.attenuation, options.onFailure);
  let contents = '';
  let publicationStarted = false;
  try {
    const driverContents = await options.storage.read(driverRecord);
    if (driverContents === undefined) throw discoveryError();
    const driverDigest = sha256(driverContents);
    if (options.driver.digest !== undefined && options.driver.digest !== driverDigest) throw discoveryError();
    const descriptor = parseDescriptor(
      JSON.stringify({
        version: 1,
        incarnation: options.service.incarnation,
        management: {
          url: listener.url,
          grant: options.service.credential,
          service: { ...options.identity, incarnation: options.service.incarnation },
        },
        driver: {
          record: driverRecord,
          digest: driverDigest,
          incarnation: options.driver.incarnation,
          targetId: options.driver.targetId,
        },
      }),
    );
    await verifyEndpoints(options.storage, descriptor, options.verifyService, (secret) => options.service.addSecret(secret));
    contents = JSON.stringify(descriptor);
    if ((await options.storage.read(name)) !== undefined) throw discoveryError();
    publicationStarted = true;
    await options.storage.publish(name, contents);
  } catch {
    let cleanupFailed = false;
    try {
      await listener.close();
    } catch {
      cleanupFailed = true;
    }
    if (publicationStarted || cleanupFailed) {
      throw new AggregateError(
        [discoveryError(), new Error('Desktop supervisor publication or listener cleanup is not confirmed.')],
        'Desktop supervisor publication did not settle.',
      );
    }
    throw discoveryError();
  }
  let closing: Promise<void> | undefined;
  return Object.freeze({
    descriptor: name,
    close: () =>
      (closing ??= (async () => {
        let withdrawn = true;
        try {
          await options.storage.remove(name, contents);
          if ((await options.storage.read(name)) === contents) withdrawn = false;
        } catch {
          withdrawn = false;
        }
        try {
          await listener.close();
        } catch {
          throw new Error('Desktop supervisor management cleanup is not confirmed.');
        }
        if (!withdrawn) throw new Error('Desktop supervisor descriptor withdrawal is not confirmed.');
      })()),
  });
}

export type DesktopSupervisorConnection = {
  readonly incarnation: string;
  readonly targetId: string;
  readonly driver: DesktopDriverClient;
  /** Re-verifies the bound discovery root and driver before a controller reconnects. */
  verifyDriver(): Promise<{ client: DesktopDriverClient; incarnation: string; principal: string }>;
  request(input: DesktopWorkloadInput, signal?: AbortSignal): Promise<DesktopWorkloadResponse>;
  /** Idempotent, drain-confirmed connection disposal; transport loss alone does not dispose it. */
  close(): Promise<void>;
};

export type DesktopSupervisorConnectionOptions = {
  storage: PrivateStorage;
  descriptor?: string;
  verifyService: VerifyDesktopService;
};

export type DesktopSupervisorConnector = {
  /** Concurrent and retried opens retain one connection ID and one verified supervisor incarnation. */
  connect(): Promise<DesktopSupervisorConnection>;
  /** Stops admission and disposes even an acquisition whose response was lost. */
  close(): Promise<void>;
};

/** A lost run-start response is ambiguous: query status by request ID rather than replaying the request. */
export class DesktopWorkloadTransportError extends Error {
  readonly code: 'unavailable' | 'ambiguous';

  constructor(code: 'unavailable' | 'ambiguous') {
    super(
      code === 'ambiguous'
        ? 'The workload admission response is unknown. Reconcile its request ID with status; do not replay it.'
        : 'The desktop supervisor connection is unavailable.',
    );
    this.name = 'DesktopWorkloadTransportError';
    this.code = code;
  }
}

/**
 * Verifies management identity and its authenticated incarnation before verifying the bound driver record.
 * The returned connection never exposes its management credentials or descriptor contents.
 */
export function createDesktopSupervisorConnector(options: DesktopSupervisorConnectionOptions): DesktopSupervisorConnector {
  const name = parseRecordName(options.descriptor ?? defaultSupervisorDescriptor);
  const id = `dmc_${randomBytes(16).toString('hex')}`;
  let loaded: Awaited<ReturnType<typeof readSupervisor>> | undefined;
  let opening: Promise<DesktopSupervisorConnection> | undefined;
  let connection: DesktopSupervisorConnection | undefined;
  let attempted = false;
  let uncertainOpening = false;
  let closing = false;
  let disposal: Promise<void> | undefined;

  return Object.freeze({
    connect(): Promise<DesktopSupervisorConnection> {
      if (closing) return Promise.reject(new DesktopWorkloadTransportError('unavailable'));
      if (connection) return Promise.resolve(connection);
      return (opening ??= (async () => {
        loaded ??= await readSupervisor(options.storage, name, options.verifyService);
        const verified = loaded;
        await verifyLive(options, name, verified);
        if (closing) throw new DesktopWorkloadTransportError('unavailable');
        attempted = true;
        let token: string;
        try {
          token = await openPrincipal(verified.descriptor, id);
        } catch (error) {
          if (error instanceof DesktopWorkloadError) throw error;
          uncertainOpening = true;
          const reloaded = await readSupervisor(options.storage, name, options.verifyService, verified.contents);
          await verifyLive(options, name, reloaded);
          token = await openPrincipal(reloaded.descriptor, id).catch((failure: unknown) => {
            if (failure instanceof DesktopWorkloadError) throw failure;
            throw new DesktopWorkloadTransportError('unavailable');
          });
        }
        connection = createConnection(options, name, verified, token, uncertainOpening ? id : undefined);
        if (closing) {
          await connection.close();
          throw new DesktopWorkloadTransportError('unavailable');
        }
        return connection;
      })().finally(() => {
        opening = undefined;
      }));
    },
    close(): Promise<void> {
      closing = true;
      return (disposal ??= (async () => {
        await opening?.catch(() => undefined);
        if (connection) {
          await connection.close();
        } else if (attempted && loaded) {
          await verifyLive(options, name, loaded);
          try {
            const answer = await sendJson(
              loaded.descriptor.management.url,
              '/connections',
              'DELETE',
              loaded.descriptor.management.grant,
              { id },
              135_000,
            );
            if (!z.strictObject({ disposed: z.literal(true) }).safeParse(answer).success) throw new Error();
          } catch (error) {
            if (error instanceof DesktopWorkloadError) throw error;
            throw new DesktopWorkloadTransportError('unavailable');
          }
        }
      })().catch((error: unknown) => {
        disposal = undefined;
        throw error;
      }));
    },
  });
}

export async function connectDesktopSupervisor(options: DesktopSupervisorConnectionOptions): Promise<DesktopSupervisorConnection> {
  const connector = createDesktopSupervisorConnector(options);
  try {
    return await connector.connect();
  } catch (error) {
    try {
      await connector.close();
    } catch {
      throw new Error('Desktop supervisor acquisition failed and cleanup is not confirmed.');
    }
    throw error;
  }
}

function createConnection(
  options: DesktopSupervisorConnectionOptions,
  name: string,
  loaded: Awaited<ReturnType<typeof readSupervisor>>,
  token: string,
  uncertainId?: string,
): DesktopSupervisorConnection {
  const driver = createDesktopDriverClient({ grant: loaded.driver.grant, url: loaded.driver.url });
  let disposed = false;
  let closing = false;
  let disposal: Promise<void> | undefined;
  return Object.freeze({
    incarnation: loaded.descriptor.incarnation,
    targetId: loaded.descriptor.driver.targetId,
    driver,
    async verifyDriver(): Promise<{ client: DesktopDriverClient; incarnation: string; principal: string }> {
      if (closing || disposed) throw new DesktopWorkloadTransportError('unavailable');
      try {
        await readSupervisor(options.storage, name, options.verifyService, loaded.contents);
        if (!driver.principalId) throw discoveryError();
        return { client: driver, incarnation: loaded.descriptor.driver.incarnation, principal: driver.principalId };
      } catch {
        throw new DesktopWorkloadTransportError('unavailable');
      }
    },
    async request(input: DesktopWorkloadInput, signal?: AbortSignal): Promise<DesktopWorkloadResponse> {
      if (closing || disposed) throw new DesktopWorkloadTransportError('unavailable');
      const parsed = desktopWorkloadInputSchema.safeParse(input);
      if (!parsed.success) throw new DesktopWorkloadError('invalid-request');
      if (signal?.aborted) throw new DesktopWorkloadTransportError('unavailable');
      await verifyLive(options, name, loaded);
      if (signal?.aborted) throw new DesktopWorkloadTransportError('unavailable');
      try {
        const answer = await sendJson(
          loaded.descriptor.management.url,
          '/workloads',
          'POST',
          token,
          parsed.data,
          (parsed.data.waitMs ?? 0) + transportTimeoutMs,
          signal,
        );
        return parseWorkloadResponse(parsed.data, answer);
      } catch (error) {
        if (error instanceof DesktopWorkloadError) throw error;
        throw new DesktopWorkloadTransportError(parsed.data.action === 'run' ? 'ambiguous' : 'unavailable');
      }
    },
    close(): Promise<void> {
      closing = true;
      if (disposed) return Promise.resolve();
      return (disposal ??= (async () => {
        await verifyLive(options, name, loaded);
        try {
          const answer = await sendJson(
            loaded.descriptor.management.url,
            uncertainId ? '/connections' : '/connection',
            'DELETE',
            uncertainId ? loaded.descriptor.management.grant : token,
            uncertainId ? { id: uncertainId } : undefined,
            135_000,
          );
          if (!z.strictObject({ disposed: z.literal(true) }).safeParse(answer).success) throw new Error();
          disposed = true;
        } catch (error) {
          if (error instanceof DesktopWorkloadError) throw error;
          throw new DesktopWorkloadTransportError('unavailable');
        }
      })().catch((error: unknown) => {
        disposal = undefined;
        throw error;
      }));
    },
  });
}

async function verifyLive(
  options: DesktopSupervisorConnectionOptions,
  name: string,
  loaded: { contents: string; descriptor: SupervisorDescriptor },
): Promise<void> {
  try {
    if ((await options.storage.read(name)) !== loaded.contents) throw discoveryError();
    if ((await options.verifyService(loaded.descriptor.management.service, loaded.descriptor.management.url)) !== true) {
      throw discoveryError();
    }
  } catch {
    throw new DesktopWorkloadTransportError('unavailable');
  }
}

type ConnectionRecord = { id: string; token: string; state: 'active' | 'disposing' | 'disposed'; disposal?: Promise<void> };

async function listen(
  service: DesktopWorkloadService,
  attenuation: DesktopWorkloadAttenuation | undefined,
  onFailure?: (error: Error) => void,
): Promise<{ url: string; close(): Promise<void> }> {
  const connections = new Map<string, ConnectionRecord>();
  const byToken = new Map<string, ConnectionRecord>();
  const abandoned = new Set<string>();
  let closing = false;
  let activeRequests = 0;
  let port = 0;
  const server = createServer((request, response) => {
    if (activeRequests >= maxRequests) {
      answerError(response, new DesktopWorkloadError('capacity'));
      return;
    }
    activeRequests++;
    void dispatch(request, response)
      .catch((error: unknown) =>
        answerError(response, error instanceof DesktopWorkloadError ? error : new DesktopWorkloadError('unavailable')),
      )
      .finally(() => activeRequests--);
  });
  server.requestTimeout = 15_000;
  server.headersTimeout = 15_000;
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });
  server.on('error', () => onFailure?.(new Error('Desktop workload listener failed.')));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Desktop workload listener did not open.');
  port = address.port;
  // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- The management listener is authenticated numeric loopback only.
  const url = `http://127.0.0.1:${port}`;
  let closePromise: Promise<void> | undefined;
  return {
    url,
    close: () => {
      closing = true;
      return (closePromise ??= (async () => {
        const stopped = new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
        try {
          await service.close();
        } finally {
          server.closeAllConnections();
          await stopped;
        }
      })());
    },
  };

  async function dispatch(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const header = request.headers.authorization;
    if (
      closing ||
      request.headers.origin !== undefined ||
      request.headers.host !== `127.0.0.1:${port}` ||
      typeof header !== 'string' ||
      header.length > 128 ||
      !header.startsWith('Bearer ')
    ) {
      answerError(response, new DesktopWorkloadError('unavailable'), 401);
      return;
    }
    const credential = header.slice(7);
    if (request.method === 'GET' && request.url === '/handshake') {
      if (!service.authenticate(credential)) throw new DesktopWorkloadError('unavailable');
      answer(response, 200, { schemaVersion: 1, incarnation: service.incarnation });
      return;
    }
    if (request.method === 'POST' && request.url === '/connections') {
      if (!service.authenticate(credential)) throw new DesktopWorkloadError('unavailable');
      const parsed = z.strictObject({ id: connectionId }).safeParse(await readBody(request));
      if (!parsed.success) throw new DesktopWorkloadError('invalid-request');
      if (abandoned.has(parsed.data.id)) throw new DesktopWorkloadError('unavailable');
      let connection = connections.get(parsed.data.id);
      if (connection && connection.state !== 'active') throw new DesktopWorkloadError('unavailable');
      if (!connection) {
        // Exhausting tombstones fences new IDs so even an unrecorded late request cannot recreate a principal.
        if (abandoned.size >= maxConnections) throw new DesktopWorkloadError('capacity');
        if (connections.size >= maxConnections) {
          for (const [id, entry] of connections) {
            if (entry.state === 'disposed') {
              connections.delete(id);
              byToken.delete(sha256(entry.token));
              break;
            }
          }
        }
        if (connections.size >= maxConnections) throw new DesktopWorkloadError('capacity');
        const token = service.connect(credential, attenuation);
        connection = { id: parsed.data.id, token, state: 'active' };
        connections.set(connection.id, connection);
        byToken.set(sha256(token), connection);
      }
      answer(response, 200, { token: connection.token });
      return;
    }
    if (request.method === 'DELETE' && request.url === '/connections') {
      if (!service.authenticate(credential)) throw new DesktopWorkloadError('unavailable');
      const parsed = z.strictObject({ id: connectionId }).safeParse(await readBody(request));
      if (!parsed.success) throw new DesktopWorkloadError('invalid-request');
      if (abandoned.size < maxConnections) abandoned.add(parsed.data.id);
      const connection = connections.get(parsed.data.id);
      if (connection) await disposeConnection(connection);
      answer(response, 200, { disposed: true });
      return;
    }
    if (request.method === 'DELETE' && request.url === '/connection') {
      const parsed = principalGrant.safeParse(credential);
      const connection = parsed.success ? byToken.get(sha256(parsed.data)) : undefined;
      if (!connection) throw new DesktopWorkloadError('unavailable');
      await disposeConnection(connection);
      answer(response, 200, { disposed: true });
      return;
    }
    if (request.method === 'POST' && request.url === '/workloads') {
      if (!principalGrant.safeParse(credential).success) throw new DesktopWorkloadError('unavailable');
      const input = await readBody(request);
      const controller = new AbortController();
      const disconnected = () => {
        if (!response.writableEnded) controller.abort();
      };
      response.once('close', disconnected);
      try {
        const result = await service.request(credential, input, controller.signal);
        answer(response, 200, result);
      } finally {
        response.off('close', disconnected);
      }
      return;
    }
    throw new DesktopWorkloadError('invalid-request');
  }

  async function disposeConnection(connection: ConnectionRecord): Promise<void> {
    if (connection.state === 'disposed') return;
    connection.state = 'disposing';
    await (connection.disposal ??= service.dispose(connection.token));
    connection.state = 'disposed';
  }
}

async function readBody(request: IncomingMessage): Promise<unknown> {
  if (request.headers['content-type'] !== 'application/json') throw new DesktopWorkloadError('invalid-request');
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    for await (const value of request) {
      const chunk = Buffer.isBuffer(value) ? value : Buffer.from(value);
      size += chunk.length;
      if (size > maxBodyBytes) throw new Error();
      chunks.push(chunk);
    }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
  } catch {
    throw new DesktopWorkloadError('invalid-request');
  }
}

function answer(response: ServerResponse, status: number, value: unknown): void {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Connection: 'close' });
  response.end(JSON.stringify(value));
}

function answerError(response: ServerResponse, error: DesktopWorkloadError, status?: number): void {
  const code = error.code;
  answer(response, status ?? (code === 'invalid-request' ? 400 : code === 'capacity' ? 429 : code === 'unavailable' ? 401 : 409), {
    error: { code },
  });
}

async function readSupervisor(
  storage: PrivateStorage,
  name: string,
  verify: VerifyDesktopService,
  expectedContents?: string,
): Promise<{ contents: string; descriptor: SupervisorDescriptor; driver: DesktopConnectionDescriptor }> {
  try {
    const contents = await storage.read(name);
    if (contents === undefined || (expectedContents !== undefined && contents !== expectedContents)) throw discoveryError();
    const descriptor = parseDescriptor(contents);
    if (descriptor.driver.record === name) throw discoveryError();
    const driver = await verifyEndpoints(storage, descriptor, verify);
    if ((await storage.read(name)) !== contents) throw discoveryError();
    return { contents, descriptor, driver };
  } catch {
    throw discoveryError();
  }
}

async function verifyEndpoints(
  storage: PrivateStorage,
  descriptor: SupervisorDescriptor,
  verify: VerifyDesktopService,
  addSecret?: (secret: string) => void,
): Promise<DesktopConnectionDescriptor> {
  if (typeof verify !== 'function' || (await verify(descriptor.management.service, descriptor.management.url)) !== true) {
    throw discoveryError();
  }
  const hello = await sendJson(descriptor.management.url, '/handshake', 'GET', descriptor.management.grant, undefined, transportTimeoutMs);
  if (!z.strictObject({ schemaVersion: z.literal(1), incarnation: z.literal(descriptor.incarnation) }).safeParse(hello).success) {
    throw discoveryError();
  }
  const driver = await readConnectionDescriptor(
    storage,
    descriptor.driver.record,
    verify,
    {
      digest: descriptor.driver.digest,
      incarnation: descriptor.driver.incarnation,
      targetId: descriptor.driver.targetId,
    },
    addSecret,
  );
  if (
    driver.service.platform !== descriptor.management.service.platform ||
    driver.service.interactiveSession !== descriptor.management.service.interactiveSession
  ) {
    throw discoveryError();
  }
  const current = await storage.read(descriptor.driver.record);
  if (current === undefined || sha256(current) !== descriptor.driver.digest) throw discoveryError();
  return driver;
}

async function openPrincipal(descriptor: SupervisorDescriptor, id: string): Promise<string> {
  const answer = await sendJson(descriptor.management.url, '/connections', 'POST', descriptor.management.grant, { id }, transportTimeoutMs);
  const parsed = z.strictObject({ token: principalGrant }).safeParse(answer);
  if (!parsed.success) throw new Error('Invalid supervisor connection response.');
  return parsed.data.token;
}

async function sendJson(
  url: string,
  route: string,
  method: 'GET' | 'POST' | 'DELETE',
  credential: string,
  body: unknown,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<unknown> {
  const timeout = AbortSignal.timeout(timeoutMs);
  const response = await fetch(`${url}${route}`, {
    method,
    headers: { Authorization: `Bearer ${credential}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    redirect: 'error',
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Empty desktop supervisor response.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > maxResponseBytes) throw new Error('Oversized desktop supervisor response.');
      chunks.push(next.value);
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
  if (!response.ok) {
    const error = z.strictObject({ error: z.strictObject({ code: z.enum(desktopWorkloadErrorCodes) }) }).safeParse(value);
    throw new DesktopWorkloadError(error.success ? error.data.error.code : 'unavailable');
  }
  return value;
}

function parseDescriptor(contents: string): SupervisorDescriptor {
  try {
    if (Buffer.byteLength(contents, 'utf8') > maxBodyBytes || Buffer.from(contents, 'utf8').toString('utf8') !== contents)
      throw new Error();
    return supervisorDescriptor.parse(JSON.parse(contents));
  } catch {
    throw new TypeError('Invalid desktop supervisor descriptor.');
  }
}

function parseRecordName(name: string): string {
  const result = portableRecord.safeParse(name);
  if (!result.success) throw new TypeError('Invalid desktop supervisor record name.');
  return result.data;
}

function sha256(contents: string): string {
  return createHash('sha256').update(contents, 'utf8').digest('hex');
}

function discoveryError(): Error {
  return new Error('Desktop supervisor discovery failed; verify private storage and both service identities.');
}

const status = z.enum(['passed', 'failed', 'skipped', 'unsupported', 'cancelled', 'not-run', 'incomplete']);
const boundedId = z.string().min(1).max(64);
const handle = z.string().regex(/^dwr_[0-9a-f]{32}$/);
const availability = z.enum(['available', 'busy', 'capacity', 'fenced', 'closing']);
const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const workloadRun = z.strictObject({
  handle,
  requestId: boundedId,
  workload: boundedId,
  lane: z.enum(['accessible', 'physical']),
  phase: z.enum(['queued', 'running', 'settled']),
  cancellation: z.enum(['none', 'requested']),
  outcome: z.enum(['pending', 'passed', 'failed', 'skipped', 'unsupported', 'cancelled', 'not-run', 'incomplete']),
  cleanup: z.enum(['pending', 'settled', 'failed']),
});
const responseSchema = z.union([
  z.strictObject({
    schemaVersion: z.literal(1),
    availability,
    catalog: z
      .array(
        z.strictObject({
          id: boundedId,
          kind: z.enum(['wdio', 'csf-wdio']),
          lanes: z.array(z.enum(['accessible', 'physical'])).max(2),
          unavailable: z.enum(['host-input', 'runner-unavailable']).optional(),
        }),
      )
      .max(64),
  }),
  z.strictObject({ schemaVersion: z.literal(1), availability, run: workloadRun.optional() }),
  z.strictObject({
    schemaVersion: z.literal(1),
    handle,
    terminal: z.boolean(),
    status,
    counts: z.strictObject({
      selected: count,
      executed: count,
      passed: count,
      failed: count,
      skipped: count,
      unsupported: count,
      declaredUnsupported: count,
      quarantined: count,
      incomplete: count,
      retries: count,
      flaky: count,
    }),
    lane: z
      .union([
        z.strictObject({
          input: z.literal('accessible'),
          source: z.enum(['option', 'environment', 'driver', 'management']),
          masking: z.enum(['host-masked', 'verified-masked']).optional(),
          policyEnforced: z.boolean(),
        }),
        z.strictObject({
          input: z.literal('physical'),
          source: z.enum(['option', 'environment', 'driver', 'management']),
          policyEnforced: z.boolean(),
        }),
      ])
      .optional(),
    excluded: z.strictObject({ platform: count, scope: count, input: count }).optional(),
  }),
  z.strictObject({
    schemaVersion: z.literal(1),
    handle,
    terminal: z.boolean(),
    status,
    items: z
      .array(
        z.strictObject({
          id: z.string().min(1).max(64),
          title: z.string().max(1024),
          status: status.optional(),
          gap: z.enum(['unsupported', 'quarantine']).optional(),
          message: z.string().max(1024).optional(),
        }),
      )
      .max(25),
    total: count,
    omissions: z.strictObject({ items: count, textBytes: count }),
    nextCursor: z.string().uuid().optional(),
  }),
  z.strictObject({
    schemaVersion: z.literal(1),
    handle,
    artifactId: z.string().uuid(),
    text: z.string().max(4096),
    omissions: z.strictObject({ bytes: count }),
  }),
]);

function parseWorkloadResponse(input: DesktopWorkloadInput, value: unknown): DesktopWorkloadResponse {
  const parsed = responseSchema.safeParse(value);
  if (!parsed.success) throw new Error('Invalid desktop workload response.');
  const answer = parsed.data;
  if (input.action === 'catalog' && 'catalog' in answer) return answer;
  if (input.action === 'status' && !input.handle && !input.requestId && 'availability' in answer && !('catalog' in answer) && !answer.run) {
    return answer;
  }
  if (['run', 'status', 'cancel'].includes(input.action) && 'run' in answer && answer.run) {
    if (input.handle && answer.run.handle !== input.handle) throw new Error('Mismatched desktop workload response.');
    if (input.requestId && answer.run.requestId !== input.requestId) throw new Error('Mismatched desktop workload response.');
    if (input.action === 'run' && (answer.run.workload !== input.workload || answer.run.lane !== input.lane))
      throw new Error('Mismatched desktop workload response.');
    return answer;
  }
  if (input.action === 'results' && 'handle' in answer && answer.handle === input.handle) {
    if ((input.category === 'status' && 'counts' in answer) || (input.category !== 'status' && 'items' in answer)) return answer;
  }
  if (input.action === 'artifact' && 'artifactId' in answer && answer.handle === input.handle && answer.artifactId === input.artifactId) {
    return answer;
  }
  throw new Error('Mismatched desktop workload response.');
}
