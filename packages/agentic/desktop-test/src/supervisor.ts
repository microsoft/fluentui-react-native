import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';

import { createDesktopDriverServer, NativeDesktopHost, resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver';
import type {
  DesktopDriverServer,
  DesktopHost,
  DesktopTarget,
  NativeDesktopHostOptions,
  NativeDriverArtifact,
} from '@fluentui-react-native/desktop-driver';
import { DesktopAuthority } from '@fluentui-react-native/desktop-driver/authority';
import { publishDesktopAgent } from './agentConnection.js';
import type { DesktopAgentConnectionOptions, DesktopAgentPublication } from './agentConnection.js';
import type { DesktopCommand, ResolvedDesktopTarget } from './config.js';
import type { DesktopIntegration } from './integration.js';
import { NodeDesktopCommandRunner, deadline } from './commands.js';
import type { PreparedDesktopCommand, RunningDesktopCommand } from './commands.js';
import { DesktopServiceScope } from './services.js';
import { resolveDesktopApplication } from './adapters.js';
import { DesktopRunReporter } from './reporting/collector.js';
import type { DesktopReportWriter } from './reporting/collector.js';
import type { DesktopReportSession } from './reporting/session.js';
import { startReportTransport } from './reporting/transport.js';
import type { ReportTransport } from './reporting/transport.js';

export type DesktopSupervisorOptions = {
  target: ResolvedDesktopTarget;
  reporter: DesktopReportWriter;
  reportSession?: DesktopReportSession;
  integration?: DesktopIntegration;
  hostFactory?: (target: ResolvedDesktopTarget) => Promise<DesktopHost>;
  lockDirectory?: string;
  /**
   * Protects the service with a grant authority and publishes one agent's connection descriptor once the target is
   * ready. Every route then requires a grant, so only clients given one, such as the Desktop Driver MCP adapter, connect.
   */
  agent?: DesktopAgentConnectionOptions;
};

export class DesktopSupervisor {
  readonly reporter: DesktopReportWriter;
  readonly target: ResolvedDesktopTarget;
  readonly runner: NodeDesktopCommandRunner;
  readonly services: DesktopServiceScope;
  private serverValue?: DesktopDriverServer;
  private transport?: ReportTransport;
  private opened = false;
  private releaseClaim?: () => void;
  private closePromise?: Promise<void>;
  private artifact?: NativeDriverArtifact;
  private authority?: DesktopAuthority;
  private agentPublication?: DesktopAgentPublication;
  private ownershipUncertain = false;
  private readonly environment: Record<string, string> = {};
  private readonly workers = new Set<RunningDesktopCommand>();
  private readonly options: DesktopSupervisorOptions;

  constructor(options: DesktopSupervisorOptions) {
    this.options = options;
    this.target = options.target;
    this.reporter = options.reporter;
    Object.assign(this.environment, options.reportSession?.environment);
    this.runner = new NodeDesktopCommandRunner({ reporter: this.reporter, environment: this.environment });
    this.services = new DesktopServiceScope(this.runner, this.reporter);
  }

  get server(): DesktopDriverServer {
    if (!this.serverValue) throw new Error('Desktop supervisor has not started.');
    return this.serverValue;
  }

  /** The record name of the published agent connection descriptor, once it is published. */
  get agentDescriptor(): string | undefined {
    return this.agentPublication?.descriptor;
  }

  async open(interactive = true): Promise<void> {
    if (this.closePromise) throw new Error('Desktop supervisor is closing.');
    if (this.opened) return;
    if (interactive && !this.options.reportSession?.delegated)
      this.releaseClaim = claimDesktopWorkload(this.reporter.runId, this.options.lockDirectory);
    try {
      if (!this.options.reportSession) {
        if (!(this.reporter instanceof DesktopRunReporter)) throw new Error('A delegated supervisor requires its inherited reportSession.');
        this.transport = await startReportTransport(this.reporter, (error) => this.services.fail(error));
        Object.assign(this.environment, this.transport.environment);
      }
      this.opened = true;
    } catch (error) {
      this.releaseClaim?.();
      this.releaseClaim = undefined;
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this.serverValue || this.closePromise) throw new Error('Desktop supervisor may only be started once.');
    await this.open();
    try {
      await this.startConfiguredServices();
      const host = this.options.hostFactory ? await this.options.hostFactory(this.target) : await this.createHost();
      try {
        const extension = await this.options.integration?.createTarget?.({ host, target: this.target, reporter: this.reporter });
        if (this.options.agent) this.authority = new DesktopAuthority();
        this.serverValue = await createDesktopDriverServer({
          ...(this.authority ? { authority: this.authority } : {}),
          targets: [
            {
              endpoint: this.target.endpoint,
              id: this.target.id,
              platformName: this.target.endpoint === 'macos' ? 'macos' : 'windows',
              renderer: this.target.host.renderer,
              launchTimeoutMs: this.target.launchTimeoutMs,
              launchModes: this.target.host.ownership === 'external' ? ['attach'] : ['launch'],
              host,
              ...extension,
            },
          ],
        });
        await host.probe(this.services.controller.signal);
      } catch (error) {
        if (!this.serverValue) {
          try {
            await host.dispose();
          } catch (cleanup) {
            this.ownershipUncertain = true;
            throw new AggregateError([error, cleanup], 'Desktop target startup and disposal failed.');
          }
        }
        throw error;
      }
      this.reporter.emit(
        { kind: 'service-ready', payload: { message: `WebDriver ${this.server.url}; target ${this.target.id}` } },
        'webdriver',
        { endpoint: this.target.endpoint, renderer: this.target.host.renderer },
      );
      if (this.options.agent) await this.publishAgentConnection(this.options.agent);
    } catch (error) {
      this.reporter.fail(error);
      try {
        await this.close();
      } catch (cleanup) {
        throw new AggregateError([error, cleanup], 'Desktop supervisor startup and cleanup failed.');
      }
      throw error;
    }
  }

  private async publishAgentConnection(options: DesktopAgentConnectionOptions): Promise<void> {
    this.agentPublication = await publishDesktopAgent({
      authority: this.authority!,
      connection: options,
      target: this.target,
      url: this.server.url,
      ...(this.artifact ? { artifact: this.artifact } : {}),
      addSecret: (secret) => this.reporter.addSecret(secret),
      signal: this.services.controller.signal,
      guard: (work) => this.services.guard(work),
    });
    this.reporter.emit({
      kind: 'diagnostic',
      payload: { level: 'info', message: `Published agent connection ${this.agentPublication.descriptor} for target ${this.target.id}` },
    });
  }

  async startConfiguredServices(): Promise<void> {
    for (const service of this.target.services ?? []) {
      this.services.start(service.id, this.prepare(service.command, service.id));
      if (service.readyUrl) await this.services.ready(service.id, service.readyUrl, this.target.launchTimeoutMs);
    }
  }

  private async createHost(): Promise<DesktopHost> {
    const requiredOS = this.target.endpoint === 'macos' ? 'darwin' : 'win32';
    if (process.platform !== requiredOS)
      throw new Error(`Endpoint ${this.target.endpoint} requires ${requiredOS}; native helpers cannot run on ${process.platform}.`);
    const application = await resolveDesktopApplication(this.target, this.services.controller.signal);
    if (application.leaseNonce) this.reporter.addSecret(application.leaseNonce);
    const artifact = await resolveNativeDesktopDriver({
      ...this.target.nativeDriver,
      platform: this.target.endpoint,
      buildPolicy: 'never',
      signal: this.services.controller.signal,
    });
    this.artifact = artifact;
    return new NativeDesktopHost({
      application,
      artifact,
      endpoint: this.target.endpoint,
      onStderr: (text) =>
        this.reporter.emit({ kind: 'output', payload: { stream: 'stderr', text } }, 'native-helper', {
          service: 'native-helper',
          endpoint: this.target.endpoint,
        }),
      onFailure: (error) => this.services.fail(error),
    });
  }

  prepare(command: DesktopCommand, label?: string): PreparedDesktopCommand {
    return {
      ...command,
      args: command.args ?? [],
      cwd: path.resolve(this.target.projectRoot, command.cwd ?? '.'),
      env: {
        ...(this.target.endpoint === 'macos' && this.target.host.renderer
          ? { RCT_NEW_ARCH_ENABLED: this.target.host.renderer === 'paper' ? '0' : '1' }
          : {}),
        ...command.env,
      },
      label,
      context: { endpoint: this.target.endpoint, renderer: this.target.host.renderer },
    };
  }

  async worker(command: PreparedDesktopCommand, timeoutMs: number, verify?: (code: number) => Promise<void>): Promise<number> {
    const worker = this.runner.start({ ...command, category: 'worker' });
    this.workers.add(worker);
    let failure: unknown;
    let code = 1;
    try {
      code = await this.services.guard(deadline(worker.completed, timeoutMs, command.label ?? 'Desktop worker'));
      await verify?.(code);
    } catch (error) {
      failure = error;
    }
    try {
      await worker.stop({ failed: failure !== undefined || code !== 0 });
    } catch (error) {
      throw new AggregateError(failure === undefined ? [error] : [failure, error], 'Desktop worker and cleanup failed.');
    } finally {
      this.workers.delete(worker);
    }
    if (failure !== undefined) throw failure;
    return code;
  }

  close(): Promise<void> {
    return (this.closePromise ??= (async () => {
      const failures: unknown[] = [];
      const close = async (label: string, operation: () => Promise<void>) => {
        try {
          await operation();
        } catch (error) {
          failures.push(error);
          this.reporter.fail(error, 'cleanup', label);
        }
      };
      for (const worker of this.workers) await close('worker', () => worker.stop({ failed: true }));
      this.workers.clear();
      const publication = this.agentPublication;
      this.agentPublication = undefined;
      if (publication) await close('agent-descriptor', () => publication.withdraw());
      if (this.serverValue) await close('webdriver', () => deadline(this.serverValue!.close(), 30_000, 'Closing desktop sessions'));
      await close('services', () => this.services.close());
      await close('commands', () => this.runner.close());
      if (this.transport) await close('reporting', () => this.transport!.close());
      if (this.releaseClaim && failures.length === 0 && !this.ownershipUncertain) {
        try {
          this.releaseClaim();
        } catch (error) {
          failures.push(error);
          this.reporter.fail(error, 'cleanup', 'desktop-claim');
        }
      }
      if (failures.length) throw new AggregateError(failures, 'Desktop supervisor cleanup failed.');
    })());
  }
}

export type DesktopServiceOptions = {
  target: Omit<DesktopTarget, 'host'>;
  port?: number;
  host?: string;
  /**
   * Protects the service with a grant authority and publishes one agent's connection descriptor once it listens. Every
   * route then requires a grant. Closing the service withdraws the descriptor and revokes the grant before the listener.
   */
  agent?: DesktopAgentConnectionOptions;
  /** Receives secrets the service issues, such as the agent grant, so reporters redact them. */
  addSecret?: (secret: string) => void;
  signal?: AbortSignal;
};

/** Transitional composition for Storybook's channel child; lifecycle policy remains owned by desktop-test. */
export async function startNativeDesktopService(options: NativeDesktopHostOptions & DesktopServiceOptions): Promise<DesktopDriverServer> {
  return startDesktopService(new NativeDesktopHost(options), options, options.artifact);
}

/** Serves one target on the given host, and disposes the host if the service cannot start. */
export async function startDesktopService(
  desktopHost: DesktopHost,
  options: DesktopServiceOptions,
  artifact?: NativeDriverArtifact,
): Promise<DesktopDriverServer> {
  const authority = options.agent ? new DesktopAuthority() : undefined;
  let server: DesktopDriverServer;
  try {
    server = await createDesktopDriverServer({
      ...(authority ? { authority } : {}),
      host: options.host,
      port: options.port,
      targets: [{ ...options.target, host: desktopHost }],
    });
  } catch (error) {
    try {
      await desktopHost.dispose();
    } catch (cleanup) {
      throw new AggregateError([error, cleanup], 'Native listener startup and disposal failed.');
    }
    throw error;
  }
  if (!options.agent) return server;
  let publication: DesktopAgentPublication;
  try {
    publication = await publishDesktopAgent({
      authority: authority!,
      connection: options.agent,
      target: { endpoint: options.target.endpoint, id: options.target.id },
      url: server.url,
      ...(artifact ? { artifact } : {}),
      ...(options.addSecret ? { addSecret: options.addSecret } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
    });
  } catch (error) {
    try {
      await server.close();
    } catch (cleanup) {
      throw new AggregateError([error, cleanup], 'Agent publication and service cleanup failed.');
    }
    throw error;
  }
  let closing: Promise<void> | undefined;
  return {
    ...server,
    close: () =>
      (closing ??= (async () => {
        const failures: unknown[] = [];
        for (const step of [() => publication.withdraw(), () => server.close()]) {
          try {
            await step();
          } catch (error) {
            failures.push(error);
          }
        }
        if (failures.length === 1) throw failures[0];
        if (failures.length) throw new AggregateError(failures, 'Agent withdrawal and service close failed.');
      })()),
  };
}

export function claimDesktopWorkload(runId: string, directory?: string): () => void {
  const user = createHash('sha256').update(os.homedir()).digest('hex').slice(0, 16);
  const root = directory ?? path.join(os.tmpdir(), `furn-desktop-workload-${user}`);
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  const file = path.join(root, 'interactive.lock');
  const contents = JSON.stringify({ schemaVersion: 1, processId: process.pid, runId });
  try {
    fs.writeFileSync(file, contents, { flag: 'wx', mode: 0o600 });
  } catch (error) {
    throw new Error(
      `Another desktop workload holds ${file}. Do not run parallel physical-input suites. After a crash or failed cleanup, verify the recorded owner and its resources have stopped before removing its claim.`,
      { cause: error },
    );
  }
  return () => {
    if (fs.readFileSync(file, 'utf8') !== contents) throw new Error('Desktop claim ownership changed; refusing to remove another owner.');
    fs.unlinkSync(file);
  };
}
