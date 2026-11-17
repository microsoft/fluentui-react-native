import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver/native';
import {
  createMacOSPrivateStorage,
  createMacOSServiceVerifier,
  createWindowsPrivateStorage,
  createWindowsServiceVerifier,
  readConnectionDescriptor,
} from '@fluentui-react-native/desktop-driver/authority';
import type { PrivateStorage, VerifyDesktopService } from '@fluentui-react-native/desktop-driver/authority';
import { createDesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import type { DesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';

export const defaultRunnerDescriptor = 'runner-connection.json';
export const runnerBrokerUrlEnvironment = 'DESKTOP_WDIO_BROKER_URL';
export const runnerBrokerTokenEnvironment = 'DESKTOP_WDIO_BROKER_TOKEN';
export const runnerWorkerTokenEnvironment = 'DESKTOP_WDIO_WORKER_TOKEN';

export type DesktopRunnerConnection = { client: DesktopDriverClient; url: string };
export type DesktopRunnerBinding = { url: string; incarnation: string; targetId: string };
export type DesktopRunnerExpectation = Pick<DesktopRunnerBinding, 'url' | 'targetId'>;

/** Reuses the existing service and its workload claim. Verification precedes sending any descriptor credential. */
export async function connectDesktopRunner(options: {
  descriptor?: string;
  root?: string;
  expect?: DesktopRunnerExpectation;
  addSecret?: (secret: string) => void;
}): Promise<DesktopRunnerConnection> {
  try {
    const platform = process.platform === 'darwin' ? 'macos' : process.platform === 'win32' ? 'windows' : undefined;
    if (!platform) throw new Error();
    const artifact = await resolveNativeDesktopDriver({ buildPolicy: 'never', platform });
    const storage =
      platform === 'macos'
        ? await createMacOSPrivateStorage(...(options.root === undefined ? [] : [options.root]))
        : await createWindowsPrivateStorage({ artifact, ...(options.root === undefined ? {} : { root: options.root }) });
    const verify = platform === 'macos' ? createMacOSServiceVerifier({ artifact }) : createWindowsServiceVerifier({ artifact });
    return await connectVerifiedDesktopRunner({
      storage,
      verifyService: verify,
      descriptor: options.descriptor,
      expect: options.expect,
      addSecret: options.addSecret,
    });
  } catch {
    // Private storage and verification failures may contain descriptor credentials.
    throw new Error('Runner discovery failed. Verify the private descriptor, native helper, and service identity on macOS or Windows.');
  }
}

/** A managed run binds the runner record to the already verified driver listener and target before sending its grant. */
export async function connectVerifiedDesktopRunner(options: {
  storage: PrivateStorage;
  verifyService: VerifyDesktopService;
  descriptor?: string;
  binding?: DesktopRunnerBinding;
  expect?: DesktopRunnerExpectation;
  addSecret?: (secret: string) => void;
}): Promise<DesktopRunnerConnection> {
  try {
    const record = options.descriptor ?? defaultRunnerDescriptor;
    if (options.binding && options.expect) throw new Error();
    const contents = options.binding || options.expect ? await options.storage.read(record) : undefined;
    if ((options.binding || options.expect) && contents === undefined) throw new Error();
    const expected = options.binding ?? (options.expect && { ...options.expect, incarnation: JSON.parse(contents!).service.incarnation });
    const binding = expected ? { ...expected, digest: createHash('sha256').update(contents!, 'utf8').digest('hex') } : undefined;
    const descriptor = await readConnectionDescriptor(options.storage, record, options.verifyService, binding, options.addSecret);
    return { client: createDesktopDriverClient({ grant: descriptor.grant, url: descriptor.url }), url: descriptor.url };
  } catch {
    throw new Error('Runner discovery failed. Verify the private descriptor, native helper, and service identity on macOS or Windows.');
  }
}

export type DesktopRunnerBroker = {
  /** Private process transport, never WDIO configuration or capabilities. Register these values with the log redactor. */
  readonly environment: Readonly<Record<string, string>>;
  close(): Promise<void>;
};

export type DesktopRunnerWorker = {
  /** Private driver-only authority. Never place this value in generated files, capabilities, or logs. */
  readonly grant: string;
  readonly client: DesktopDriverClient;
  close(): Promise<void>;
};

export type DesktopRunnerReservation = {
  acquireWorker(): Promise<DesktopRunnerWorker>;
  close(): Promise<void>;
};

/**
 * Holds one target reservation until every child is drained. Trusted callers must delete each session and wait for its
 * worker to exit before closing that worker; closing the reservation also drains any outstanding descendants.
 */
export async function acquireDesktopRunnerReservation(options: {
  connection: DesktopRunnerConnection;
  targetId: string;
  preempt?: boolean;
  addSecret: (secret: string) => void;
  signal?: AbortSignal;
}): Promise<DesktopRunnerReservation> {
  const { connection, addSecret, signal } = options;
  const control = await delegate(connection.client, '/furn/grants/runner-connection', {}, connection.url, addSecret);
  let runner: DesktopDriverClient;
  try {
    runner = await delegate(
      control,
      '/furn/grants/runner',
      { target: options.targetId, handoff: options.preempt ? 'preempt' : 'busy' },
      connection.url,
      addSecret,
      signal,
    );
  } catch (error) {
    try {
      await control.revokeConnection();
    } catch (cleanup) {
      throw new AggregateError([error, cleanup], 'Runner acquisition and drain failed.');
    }
    throw error;
  }

  let active: DesktopRunnerWorker | undefined;
  let uncertain = false;
  let closed = false;
  let closing = false;
  let closePromise: Promise<void> | undefined;
  let pending: Promise<void> = Promise.resolve();
  const serialize = <T>(work: () => Promise<T>): Promise<T> => {
    const result = pending.then(work);
    pending = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  };
  return {
    acquireWorker: () =>
      serialize(async () => {
        if (closing || closed || uncertain) throw new Error('Desktop runner reservation is unavailable.');
        if (active) throw new Error('The previous worker has not drained.');
        let value: { token: string };
        let client: DesktopDriverClient;
        try {
          value = await runner.request<{ token: string }>('POST', '/furn/grants/connection', {});
          client = issuedClient(value, connection.url, addSecret);
          if (closing) throw new Error('Desktop runner reservation is closing.');
        } catch (error) {
          // A lost response may have issued an unknown child; only the parent drain can settle it.
          uncertain = true;
          throw error;
        }
        const worker: DesktopRunnerWorker = {
          grant: value.token,
          client,
          close: () =>
            serialize(async () => {
              if (closed || active !== worker) return;
              await client.revokeConnection();
              active = undefined;
            }),
        };
        active = worker;
        return worker;
      }),
    close: () => {
      closing = true;
      return (closePromise ??= serialize(async () => {
        if (closed) return;
        await control.revokeConnection();
        active = undefined;
        closed = true;
      }).catch((error: unknown) => {
        closePromise = undefined;
        throw error;
      }));
    },
  };
}

/**
 * The parent owns every grant even if the launcher, worker, hook, or an acquisition response is lost. Workers receive
 * only their own attenuated driver grant, and the launcher awaits its drain before scheduling the next worker.
 */
export async function createDesktopRunnerBroker(options: {
  connection: DesktopRunnerConnection;
  targetId: string;
  preempt?: boolean;
  addSecret: (secret: string) => void;
  signal?: AbortSignal;
}): Promise<DesktopRunnerBroker> {
  const { addSecret } = options;
  const reservation = await acquireDesktopRunnerReservation(options);
  try {
    const token = randomBytes(32).toString('base64url');
    addSecret(token);
    const digest = hash(token);
    const workers = new Map<string, DesktopRunnerWorker>();
    let closed = false;
    let port = 0;
    let pending: Promise<unknown> = Promise.resolve();
    const server = createServer((request, response) => {
      if (
        closed ||
        request.headers.origin !== undefined ||
        request.headers.host !== `127.0.0.1:${port}` ||
        typeof request.headers.authorization !== 'string' ||
        request.headers.authorization.length > 128 ||
        !request.headers.authorization.startsWith('Bearer ') ||
        !timingSafeEqual(hash(request.headers.authorization.slice(7)), digest)
      ) {
        answer(response, 401, { error: 'Desktop runner authority is unavailable.' });
        return;
      }
      const work = pending.catch(() => undefined).then(() => dispatch(request, response));
      pending = work.catch(() => {
        answer(response, 503, { error: 'Desktop runner worker drain is not confirmed.' });
      });
    });
    server.on('error', () => undefined);
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => {
        server.off('error', reject);
        resolve();
      });
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Desktop runner broker did not open a loopback listener.');
    port = address.port;
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- Private, bearer-authenticated loopback transport.
    const url = `http://127.0.0.1:${address.port}`;
    let closing: Promise<void> | undefined;
    let listenerClosed = false;
    return {
      environment: Object.freeze({ [runnerBrokerUrlEnvironment]: url, [runnerBrokerTokenEnvironment]: token }),
      close: () => {
        closed = true;
        return (closing ??= (async () => {
          try {
            await pending;
            await reservation.close();
          } finally {
            if (!listenerClosed) {
              await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
              listenerClosed = true;
            }
          }
        })().catch((error: unknown) => {
          closing = undefined;
          throw error;
        }));
      },
    };

    async function dispatch(request: IncomingMessage, response: ServerResponse): Promise<void> {
      if (closed) {
        answer(response, 401, { error: 'Desktop runner authority is unavailable.' });
        return;
      }
      const match = /^\/workers\/([0-9]{1,8}-[0-9]{1,8})$/.exec(request.url ?? '');
      if (!match || (request.method !== 'POST' && request.method !== 'DELETE')) {
        answer(response, 400, { error: 'Unsupported desktop runner worker request.' });
        return;
      }
      const id = match[1];
      if (request.method === 'POST') {
        if (workers.size) throw new Error('The previous worker has not drained.');
        const worker = await reservation.acquireWorker();
        workers.set(id, worker);
        answer(response, 200, { token: worker.grant });
      } else {
        const worker = workers.get(id);
        if (worker) {
          await worker.close();
          workers.delete(id);
        }
        answer(response, 200, null);
      }
    }
  } catch (error) {
    try {
      await reservation.close();
    } catch (cleanup) {
      throw new AggregateError([error, cleanup], 'Runner acquisition and drain failed.');
    }
    throw error;
  }
}

async function delegate(
  client: DesktopDriverClient,
  route: string,
  body: object,
  url: string,
  addSecret: (secret: string) => void,
  signal?: AbortSignal,
): Promise<DesktopDriverClient> {
  const value = await client.request<{ token: string }>('POST', route, body, signal);
  return issuedClient(value, url, addSecret);
}

function issuedClient(value: { token: string }, url: string, addSecret: (secret: string) => void): DesktopDriverClient {
  if (typeof value?.token !== 'string' || !/^fdg1\.[0-9a-f]{32}\.[A-Za-z0-9_-]{43}$/.test(value.token)) {
    throw new Error('The service did not issue runner authority.');
  }
  addSecret(value.token);
  return createDesktopDriverClient({ grant: value.token, url });
}

function hash(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

function answer(response: ServerResponse, status: number, value: unknown): void {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(status, { 'Content-Type': 'application/json', Connection: 'close' });
  response.end(JSON.stringify(value));
}

/** Launcher hooks only. The worker's grant is never put in the configuration object WDIO serializes. */
export async function requestDesktopRunnerWorker(
  method: 'POST' | 'DELETE',
  id: string,
  { url, token }: { url?: string; token?: string },
): Promise<string | undefined> {
  if (!url || !token || !/^[0-9]{1,8}-[0-9]{1,8}$/.test(id)) throw new Error('Desktop runner worker authority is unavailable.');
  let value: unknown;
  try {
    const response = await fetch(`${url}/workers/${id}`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      redirect: 'error',
    });
    if (!response.ok) throw new Error('Worker authority failed.');
    value = await response.json();
  } catch {
    throw new Error('Desktop runner worker authority or drain is not confirmed.');
  }
  if (method === 'DELETE') return undefined;
  if (typeof value !== 'object' || value === null || !('token' in value) || typeof value.token !== 'string') {
    throw new Error('Desktop runner worker authority is unavailable.');
  }
  return value.token;
}
