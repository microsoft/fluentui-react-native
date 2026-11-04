import { createHash } from 'node:crypto';

import type { DesktopDriverClient, DesktopSessionClient, OperationCallOptions } from '@fluentui-react-native/desktop-driver/client';
import type { ArtifactResult, OperationResponse } from '@fluentui-react-native/desktop-driver/operations';

import type { ConnectDesktopDriver } from './connection.js';

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
  platformName?: string;
  quarantined?: true;
  renderer?: string;
};

export type OperationSummary = { available: boolean; name: string; unavailableReason?: string };

export type SessionSummary = { clickMode?: string; id: string; operations: OperationSummary[]; target: string };

export type SessionResponse<Result> = { response: OperationResponse<Result>; session: string };

export type OpenSessionRequest = { clickMode?: 'accessibility' | 'auto' | 'physical'; launch: boolean; target: string };

type OpenSession = { session: DesktopSessionClient; target: string };

const deleteTimeoutMs = 10_000;
const artifactPageBytes = 1024 * 1024;
/** The service never keeps a larger capture; a larger claim is a fault, not something to buffer. */
const maxArtifactBytes = 16 * 1024 * 1024;

/**
 * One MCP connection's control of the driver: a lazily connected client and at most one open session. A lost service
 * forgets both, so the next call reconnects through the descriptor, and references never cross to a new service.
 */
export class DesktopController {
  readonly #connect: ConnectDesktopDriver;
  #client?: Promise<DesktopDriverClient>;
  #open?: OpenSession;

  constructor(connect: ConnectDesktopDriver) {
    this.#connect = connect;
  }

  async status(): Promise<{ session?: SessionSummary; targets: TargetSummary[] }> {
    const client = await this.client();
    const status = await this.guard(() => client.status());
    const targets = Array.isArray(status.targets) ? status.targets.map(summarizeTarget) : [];
    const session = this.#open ? await this.describe(this.#open) : undefined;
    return { ...(session ? { session } : {}), targets };
  }

  async open(request: OpenSessionRequest): Promise<SessionSummary> {
    if (this.#open) {
      throw new AdapterError('session-open', `A session on "${this.#open.target}" is already open. Close it first.`);
    }
    const client = await this.client();
    const session = await this.guard(() =>
      client.newSession({
        alwaysMatch: {
          'furn:launchMode': request.launch ? 'launch' : 'attach',
          'furn:target': request.target,
          ...(request.clickMode === undefined ? {} : { 'furn:clickMode': request.clickMode }),
        },
      }),
    );
    this.#open = { session, target: request.target };
    return this.describe(this.#open);
  }

  async close(): Promise<{ closed?: string }> {
    const open = this.#open;
    if (!open) {
      return {};
    }
    this.#open = undefined;
    await this.guard(() => open.session.delete());
    return { closed: open.session.id };
  }

  /** Runs one operation in the open session, and names the session so a later reference can be tied to it. */
  async run<Result>(name: string, input: object, options: OperationCallOptions = {}): Promise<SessionResponse<Result>> {
    const open = this.#open;
    if (!open) {
      throw new AdapterError('no-session', 'No session is open. Open one with desktop_session first.');
    }
    const response = await this.guard(() => open.session.operation<Result>(name, input, options), options.signal);
    return { response, session: open.session.id };
  }

  /**
   * Reads a whole captured image by paging through `artifact`. Artifact ids restart in every session, so a reference
   * from a closed session is refused rather than read from whichever session is open now.
   */
  async readArtifact(session: string, artifact: string, signal?: AbortSignal): Promise<{ data: Buffer; mimeType: string }> {
    if (this.#open?.session.id !== session) {
      throw new AdapterError('artifact-expired', 'That capture belongs to a session that is no longer open.');
    }
    const pages: Buffer[] = [];
    let offset: number | undefined = 0;
    let first: ArtifactResult | undefined;
    let total = 0;
    while (offset !== undefined) {
      const { response } = await this.run<ArtifactResult>('artifact', { artifact, length: artifactPageBytes, offset }, { signal });
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

  /** Ends the open session, best effort, when the MCP client goes away. */
  async dispose(): Promise<void> {
    const open = this.#open;
    this.#open = undefined;
    if (open) {
      await Promise.race([open.session.delete().catch(() => null), new Promise((resolve) => setTimeout(resolve, deleteTimeoutMs).unref())]);
    }
  }

  private client(): Promise<DesktopDriverClient> {
    if (!this.#client) {
      const attempt = this.#connect();
      this.#client = attempt;
      attempt.catch(() => {
        if (this.#client === attempt) {
          this.#client = undefined;
        }
      });
    }
    return this.#client.catch((error: unknown) => {
      // The cause can name machine-local paths; the operator reads it on stderr, the model reads a fixed message.
      console.error(`desktop-driver-mcp: connecting failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new AdapterError('service-unavailable', 'The Desktop Driver service is not available. Ask the operator to start it.');
    });
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

  /** Forgets what a failure proved gone: the session after `invalid session id`, and everything after a lost service. */
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
        throw error;
      }
      this.#open = undefined;
      this.#client = undefined;
      throw new AdapterError('service-unavailable', 'The Desktop Driver service stopped answering. Open a new session.');
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
  return summary;
}
