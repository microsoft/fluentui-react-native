import { createHash } from 'node:crypto';

import { DesktopSessionClient } from '@fluentui-react-native/desktop-driver/client';
import type { DesktopDriverClient, OperationCallOptions } from '@fluentui-react-native/desktop-driver/client';
import type { ArtifactResult, OperationResponse } from '@fluentui-react-native/desktop-driver/operations';

import type { ConnectDesktopDriver, DesktopDriverConnection } from './connection.js';

/** A failure the adapter itself reports, with a machine reason as the service's own errors carry. */
export class AdapterError extends Error {
  readonly reason: string;

  constructor(reason: string, message: string) {
    super(message);
    this.name = 'AdapterError';
    this.reason = reason;
  }
}

export type TargetSummary = {
  endpoint?: string;
  id: string;
  launchModes?: ('launch' | 'attach')[];
  platformName?: string;
  quarantined?: true;
  renderer?: string;
};

export type OperationSummary = { available: boolean; name: string; unavailableReason?: string };

export type SessionSummary = { clickMode?: string; id: string; operations: OperationSummary[]; target: string };

export type SessionResponse<Result> = { response: OperationResponse<Result>; session: string };

export type OpenSessionRequest = { clickMode?: 'accessibility' | 'auto' | 'physical'; launch: boolean; target: string };

type OpenSession = { connection: DesktopDriverConnection; session: DesktopSessionClient; target: string };

const deleteTimeoutMs = 10_000;
const artifactPageBytes = 1024 * 1024;
/** The service never keeps a larger capture; a larger claim is a fault, not something to buffer. */
const maxArtifactBytes = 16 * 1024 * 1024;

/**
 * Serializes one MCP connection's client lifetime. Transport failure retains cleanup responsibility; only verified
 * replacement or an authoritative rejection invalidates it. No failed mutation or ambiguous acquisition is replayed.
 */
export class DesktopController {
  readonly #connect: ConnectDesktopDriver;
  #connection?: DesktopDriverConnection;
  #binding?: { root: DesktopDriverConnection; child: DesktopDriverConnection };
  #open?: OpenSession;
  #uncertain?: DesktopDriverConnection;
  #pending: Promise<unknown> = Promise.resolve();
  #disposed = false;
  #disposing?: Promise<void>;
  readonly #disconnected = new AbortController();

  constructor(connect: ConnectDesktopDriver) {
    this.#connect = connect;
  }

  status(): Promise<{ session?: SessionSummary; sessionState?: 'uncertain'; targets: TargetSummary[] }> {
    return this.enqueue(async () => {
      const { client } = await this.connection();
      const status = await this.guard(() => client.status());
      const targets = Array.isArray(status.targets) ? status.targets.map(summarizeTarget) : [];
      const session = this.#open ? await this.describe(this.#open) : undefined;
      return { ...(session ? { session } : {}), ...(this.#uncertain ? { sessionState: 'uncertain' as const } : {}), targets };
    });
  }

  open(request: OpenSessionRequest): Promise<SessionSummary> {
    return this.enqueue(async () => {
      const connection = await this.connection();
      if (this.#disposed) throw new AdapterError('connection-closed', 'The MCP connection is closed.');
      this.assertCertain();
      if (this.#open) {
        throw new AdapterError('session-open', 'A session is already open. Close it first.');
      }
      // A lost response can hide a successful acquisition. Retain the fence until a definitive response or replacement.
      this.#uncertain = connection;
      let session: DesktopSessionClient;
      try {
        session = await this.guard(() =>
          connection.client.newSession({
            alwaysMatch: {
              'furn:launchMode': request.launch ? 'launch' : 'attach',
              'furn:target': request.target,
              ...(request.clickMode === undefined ? {} : { 'furn:clickMode': request.clickMode }),
            },
          }),
        );
      } catch (error) {
        if (isWebDriverError(error)) this.#uncertain = undefined;
        throw error;
      }
      this.#uncertain = undefined;
      this.#open = { connection, session, target: request.target };
      if (this.#disposed) {
        await this.closeSession();
        throw new AdapterError('connection-closed', 'The MCP connection is closed.');
      }
      return this.describe(this.#open);
    });
  }

  close(): Promise<{ closed?: string }> {
    return this.enqueue(async () => {
      if (!this.#open && !this.#uncertain) return {};
      await this.connection();
      this.assertCertain();
      return this.closeSession();
    });
  }

  private async closeSession(): Promise<{ closed?: string }> {
    const open = this.#open;
    if (!open) {
      return {};
    }
    try {
      await this.guard(() => open.session.delete());
    } catch (error) {
      if (!isWebDriverError(error) || error.code !== 'invalid session id') throw error;
    }
    this.#open = undefined;
    return { closed: open.session.id };
  }

  /** Runs one operation in the open session, and names the session so a later reference can be tied to it. */
  run<Result>(name: string, input: object, options: OperationCallOptions = {}): Promise<SessionResponse<Result>> {
    return this.enqueue(async () => {
      if (this.#open || this.#uncertain) await this.connection();
      this.assertCertain();
      return this.runOperation<Result>(name, input, options);
    });
  }

  private async runOperation<Result>(name: string, input: object, options: OperationCallOptions): Promise<SessionResponse<Result>> {
    const open = this.#open;
    if (!open) {
      throw new AdapterError('no-session', 'No session is open. Open one with desktop_session first.');
    }
    const signal = AbortSignal.any([this.#disconnected.signal, ...(options.signal ? [options.signal] : [])]);
    const response = await this.guard(() => open.session.operation<Result>(name, input, { ...options, signal }), signal);
    return { response, session: open.session.id };
  }

  /**
   * Reads a whole captured image by paging through `artifact`. Artifact ids restart in every session, so a reference
   * from a closed session is refused rather than read from whichever session is open now.
   */
  readArtifact(session: string, artifact: string, signal?: AbortSignal): Promise<{ data: Buffer; mimeType: string }> {
    return this.enqueue(async () => {
      if (this.#open || this.#uncertain) await this.connection();
      this.assertCertain();
      return this.readArtifactPages(session, artifact, signal);
    });
  }

  private async readArtifactPages(session: string, artifact: string, signal?: AbortSignal): Promise<{ data: Buffer; mimeType: string }> {
    if (this.#open?.session.id !== session) {
      throw new AdapterError('artifact-expired', 'That capture belongs to a session that is no longer open.');
    }
    const pages: Buffer[] = [];
    let offset: number | undefined = 0;
    let first: ArtifactResult | undefined;
    let total = 0;
    while (offset !== undefined) {
      const { response } = await this.runOperation<ArtifactResult>('artifact', { artifact, length: artifactPageBytes, offset }, { signal });
      const page = response.result;
      first ??= page;
      if (page.sha256 !== first.sha256 || page.bytes > maxArtifactBytes) {
        throw new AdapterError('artifact-changed', 'The capture changed while it was being read.');
      }
      const bytes = Buffer.from(page.data, 'base64');
      total += bytes.byteLength;
      if (total > page.bytes || (page.next !== undefined && page.next <= offset)) {
        throw new AdapterError('artifact-changed', 'The capture changed while it was being read.');
      }
      pages.push(bytes);
      offset = page.next;
    }
    const data = Buffer.concat(pages);
    if (!first || data.byteLength !== first.bytes || createHash('sha256').update(data).digest('hex') !== first.sha256) {
      throw new AdapterError('artifact-changed', 'The capture did not match its recorded digest.');
    }
    return { data, mimeType: first.mimeType };
  }

  get session(): string | undefined {
    return this.#open?.session.id;
  }

  /** Stops admissions immediately. Late acquisitions still run their cleanup after the bounded close wait expires. */
  dispose(): Promise<void> {
    this.#disposed = true;
    this.#disconnected.abort();
    return (this.#disposing ??= (async () => {
      const cleanup = this.#pending.then(async () => {
        if (this.#binding) {
          await this.#binding.child.client.revokeConnection();
          this.#open = undefined;
          this.#uncertain = undefined;
          this.#binding = undefined;
        }
      });
      this.#pending = cleanup.catch(() => {
        console.error('desktop-driver-mcp: session cleanup is incomplete; the service must drain or expire the session.');
      });
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          this.#pending,
          new Promise<void>((resolve) => {
            timer = setTimeout(() => {
              console.error('desktop-driver-mcp: session cleanup is still pending; the service must drain or expire the session.');
              resolve();
            }, deleteTimeoutMs);
            timer.unref();
          }),
        ]);
      } finally {
        if (timer) clearTimeout(timer);
        if (this.#binding) this.#disposing = undefined;
      }
    })());
  }

  private async connection(): Promise<DesktopDriverConnection> {
    if (this.#connection) return this.#connection;
    let connection: DesktopDriverConnection;
    try {
      connection = await this.#connect();
    } catch {
      // Discovery failures can contain descriptor credentials; neither protocol output nor diagnostics may echo them.
      console.error('desktop-driver-mcp: connecting failed; verify private discovery and the service identity.');
      throw new AdapterError('service-unavailable', 'The Desktop Driver service is not available. Ask the operator to start it.');
    }
    const binding = this.#binding;
    if (binding && binding.root.incarnation === connection.incarnation && binding.root.principal === connection.principal) {
      connection = binding.child;
    } else {
      if (binding && binding.root.incarnation === connection.incarnation) {
        await this.guard(() => binding.child.client.revokeConnection());
        this.#open = undefined;
        this.#uncertain = undefined;
      }
      const root = connection;
      let child: DesktopDriverClient;
      try {
        child = await this.guard(() => root.client.delegateConnection());
      } catch (error) {
        if (isWebDriverError(error) && ['unknown command', 'unsupported operation'].includes(error.code)) {
          throw new AdapterError('connection-authority-unsupported', 'The service does not support isolated connection authority.');
        }
        throw error;
      }
      const principal = child.principalId;
      if (!principal) throw new AdapterError('service-unavailable', 'The service does not support isolated connection authority.');
      connection = { client: child, incarnation: root.incarnation, principal };
      this.#binding = { child: connection, root };
    }
    const previous = this.#open?.connection ?? this.#uncertain;
    if (previous && previous.incarnation !== connection.incarnation) {
      this.#open = undefined;
      this.#uncertain = undefined;
    } else if (previous && previous.principal !== connection.principal) {
      // A new grant on the same live service does not prove that the old grant's session has ended.
      if (this.#open) {
        try {
          await this.closeSession();
        } catch (error) {
          if (this.#open) throw error;
        }
      }
      if (this.#uncertain) {
        try {
          await this.guard(() => previous.client.status());
        } catch (error) {
          if (this.#uncertain) throw error;
        }
      }
      this.assertCertain();
    } else if (this.#open) {
      // Rebind only to the same verified service and principal. A subsequent command still validates session liveness.
      this.#open = {
        ...this.#open,
        connection,
        session: new DesktopSessionClient(connection.client, this.#open.session.id, this.#open.session.capabilities),
      };
    }
    this.#connection = connection;
    return connection;
  }

  private enqueue<T>(work: () => Promise<T>): Promise<T> {
    const result = this.#pending.then(() => {
      if (this.#disposed) throw new AdapterError('connection-closed', 'The MCP connection is closed.');
      return work();
    });
    this.#pending = result.catch(() => undefined);
    return result;
  }

  private assertCertain(): void {
    if (this.#uncertain) {
      throw new AdapterError(
        'session-uncertain',
        'A session acquisition lost its response. Ask the operator to revoke the old grant or restart the service before opening another.',
      );
    }
  }

  private async describe(open: OpenSession): Promise<SessionSummary> {
    const catalog = await this.guard(() => open.session.operations());
    const operations = catalog.operations.map(({ available, name, unavailableReason }) => ({
      available,
      name,
      ...(unavailableReason === undefined ? {} : { unavailableReason }),
    }));
    const clickMode = open.session.capabilities['furn:clickMode'];
    return {
      ...(typeof clickMode === 'string' ? { clickMode } : {}),
      id: open.session.id,
      operations,
      target: open.target,
    };
  }

  /** Transport errors retain ownership; authoritative invalidation never permits replaying a failed operation. */
  private async guard<T>(call: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    try {
      return await call();
    } catch (error) {
      if (signal?.aborted) {
        throw new AdapterError('cancelled', 'The call was cancelled.');
      }
      if (isWebDriverError(error)) {
        if (error.code === 'invalid session id') {
          this.#open = undefined;
        }
        if (error.code === 'unauthorized') {
          this.#open = undefined;
          this.#uncertain = undefined;
          this.#connection = undefined;
          throw new AdapterError(
            'service-unavailable',
            'The Desktop Driver authority is no longer valid. Reconnect before opening a session.',
          );
        }
        throw error;
      }
      this.#connection = undefined;
      throw new AdapterError('service-unavailable', 'The Desktop Driver service stopped answering. Recheck status before continuing.');
    }
  }
}

export function isWebDriverError(error: unknown): error is Error & { code: string; data?: Record<string, unknown> } {
  return error instanceof Error && error.name === 'WebDriverError' && typeof (error as { code?: unknown }).code === 'string';
}

function summarizeTarget(target: Record<string, unknown>): TargetSummary {
  const text = (value: unknown) => (typeof value === 'string' ? value : undefined);
  const summary: TargetSummary = { id: String(target.id) };
  for (const key of ['endpoint', 'platformName', 'renderer'] as const) {
    const value = text(target[key]);
    if (value !== undefined) {
      summary[key] = value;
    }
  }
  if (target.quarantine !== undefined) {
    summary.quarantined = true;
  }
  if (Array.isArray(target.launchModes)) {
    summary.launchModes = target.launchModes.filter((mode): mode is 'launch' | 'attach' => mode === 'launch' || mode === 'attach');
  }
  return summary;
}
