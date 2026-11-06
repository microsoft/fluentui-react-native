import path from 'node:path';

import type { DesktopDriverServer, DesktopHost } from '@fluentui-react-native/desktop-driver';
import type { DesktopAgentConnectionOptions } from './agentConnection.js';
import { startDesktopService, startNativeDesktopService } from './driverService.js';
import type { DesktopService, DesktopServiceOptions } from './driverService.js';
import type { DesktopCommand, ResolvedDesktopTarget } from './config.js';
import type { DesktopIntegration } from './integration.js';
import { NodeDesktopCommandRunner, deadline } from './commands.js';
import type { PreparedDesktopCommand, RunningDesktopCommand } from './commands.js';
import { DesktopServiceScope } from './services.js';
import { createDesktopWorkloadClaim } from './ownership.js';
import type { DesktopWorkloadClaim } from './ownership.js';
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
  workload?: { kind: 'delegated'; claim: DesktopWorkloadClaim };
  hostFactory?: (target: ResolvedDesktopTarget) => Promise<DesktopHost>;
  lockDirectory?: string;
  /**
   * Protects the service with a grant authority and publishes one agent's connection descriptor once the target is
   * ready. Every route then requires a grant, so only clients given one, such as the Desktop Driver MCP adapter, connect.
   */
  agent?: DesktopAgentConnectionOptions;
  recovery?: DesktopServiceOptions['recovery'];
};

export class DesktopSupervisor {
  readonly reporter: DesktopReportWriter;
  readonly target: ResolvedDesktopTarget;
  readonly runner: NodeDesktopCommandRunner;
  readonly services: DesktopServiceScope;
  private serverValue?: DesktopService;
  private transport?: ReportTransport;
  private opened = false;
  private workloadClaim?: DesktopWorkloadClaim;
  private ownsWorkloadClaim = false;
  private resourceStartPromise?: Promise<void>;
  private closePromise?: Promise<void>;
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
    this.services = new DesktopServiceScope(this.runner, this.reporter, this.reporter.runId);
  }

  get server(): DesktopDriverServer {
    if (!this.serverValue) throw new Error('Desktop supervisor has not started.');
    return this.serverValue;
  }

  /** The record name of the published agent connection descriptor, once it is published. */
  get agentDescriptor(): string | undefined {
    return this.serverValue?.agentDescriptor;
  }

  async open(interactive = true): Promise<void> {
    if (this.closePromise) throw new Error('Desktop supervisor is closing.');
    if (this.opened) return;
    if (interactive) {
      if (this.options.workload?.kind === 'delegated') {
        this.workloadClaim = this.options.workload.claim;
      } else {
        this.workloadClaim = createDesktopWorkloadClaim({
          runId: this.reporter.runId,
          targetId: this.target.id,
          targetInstanceId: this.target.instanceId,
          directory: this.options.lockDirectory,
        });
        this.ownsWorkloadClaim = true;
      }
      this.services.setResourceObserver((resource) => this.workloadClaim?.updateResource(resource));
    }
    try {
      if (!this.options.reportSession) {
        if (!(this.reporter instanceof DesktopRunReporter)) throw new Error('A delegated supervisor requires its inherited reportSession.');
        this.transport = await startReportTransport(this.reporter, (error) => this.services.fail(error));
        Object.assign(this.environment, this.transport.environment);
      }
      this.opened = true;
    } catch (error) {
      try {
        if (this.ownsWorkloadClaim) this.workloadClaim?.release();
      } catch (cleanup) {
        throw new AggregateError([error, cleanup], 'Desktop supervisor opening and claim cleanup failed.');
      }
      this.workloadClaim = undefined;
      this.ownsWorkloadClaim = false;
      throw error;
    }
  }

  startResources(): Promise<void> {
    return (this.resourceStartPromise ??= (() => {
      const contributions = this.options.integration?.resources ?? [];
      const serviceIds = new Set(['webdriver', ...(this.target.services ?? []).map(({ id }) => id)]);
      for (const contribution of contributions) {
        if (serviceIds.has(contribution.id)) {
          throw new TypeError(`Resource contribution ID "${contribution.id}" conflicts with a configured service ID.`);
        }
      }
      return this.services.contribute(contributions, {
        targetId: this.target.id,
        targetInstanceId: this.target.instanceId,
      });
    })());
  }

  async start(): Promise<void> {
    if (this.serverValue || this.closePromise) throw new Error('Desktop supervisor may only be started once.');
    await this.open();
    try {
      await this.startConfiguredServices();
      const options: DesktopServiceOptions = {
        target: {
          endpoint: this.target.endpoint,
          id: this.target.id,
          platformName: this.target.endpoint === 'macos' ? 'macos' : 'windows',
          renderer: this.target.host.renderer,
          launchTimeoutMs: this.target.launchTimeoutMs,
          launchModes: this.target.host.ownership === 'external' ? ['attach'] : ['launch'],
        },
        agent: this.options.agent,
        recovery: this.options.recovery,
        signal: this.services.controller.signal,
        guard: (work) => this.services.guard(work),
        addSecret: (secret) => this.reporter.addSecret(secret),
        createTarget: (host) =>
          this.options.integration?.createTarget?.({ host, target: this.target, reporter: this.reporter }) ?? Promise.resolve(undefined),
      };
      let service: DesktopService | undefined;
      await this.services.contribute(
        [
          {
            id: 'webdriver',
            ownership: 'owned',
            prepare: () => ({
              identity: `driver-service:${this.target.id}:${this.target.instanceId}`,
              acquire: async () => {
                if (this.options.hostFactory) {
                  const host = await this.options.hostFactory(this.target);
                  service = await startDesktopService(host, options);
                } else {
                  service = await this.createService(options);
                }
              },
              dispose: async () => {
                await service?.close();
              },
            }),
          },
        ],
        { targetId: this.target.id, targetInstanceId: this.target.instanceId },
      );
      if (!service) throw new Error('WebDriver resource acquisition completed without a service.');
      this.serverValue = service;
      this.reporter.emit(
        { kind: 'service-ready', payload: { message: `WebDriver ${this.server.url}; target ${this.target.id}` } },
        'webdriver',
        { endpoint: this.target.endpoint, renderer: this.target.host.renderer },
      );
    } catch (error) {
      if (error instanceof AggregateError) this.ownershipUncertain = true;
      this.reporter.fail(error);
      try {
        await this.close();
      } catch (cleanup) {
        throw new AggregateError([error, cleanup], 'Desktop supervisor startup and cleanup failed.');
      }
      throw error;
    }
  }

  async startConfiguredServices(): Promise<void> {
    await this.startResources();
    for (const service of orderServices(this.target.services ?? [])) {
      this.services.start(service.id, this.prepare(service.command, service.id));
      if (service.readyUrl) await this.services.ready(service.id, service.readyUrl, this.target.launchTimeoutMs);
    }
  }

  private async createService(options: DesktopServiceOptions): Promise<DesktopService> {
    const requiredOS = this.target.endpoint === 'macos' ? 'darwin' : 'win32';
    if (process.platform !== requiredOS)
      throw new Error(`Endpoint ${this.target.endpoint} requires ${requiredOS}; native helpers cannot run on ${process.platform}.`);
    const application = await resolveDesktopApplication(this.target, this.services.controller.signal);
    if (application.leaseNonce) this.reporter.addSecret(application.leaseNonce);
    return startNativeDesktopService({
      ...options,
      application,
      nativeDriver: this.target.nativeDriver,
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
      await close('services', () => this.services.close());
      await close('commands', () => this.runner.close());
      if (this.transport) await close('reporting', () => this.transport!.close());
      if (this.ownsWorkloadClaim && this.workloadClaim && failures.length === 0 && !this.ownershipUncertain) {
        try {
          this.workloadClaim.release();
          this.workloadClaim = undefined;
          this.ownsWorkloadClaim = false;
        } catch (error) {
          failures.push(error);
          this.reporter.fail(error, 'cleanup', 'desktop-claim');
        }
      }
      if (failures.length) throw new AggregateError(failures, 'Desktop supervisor cleanup failed.');
    })());
  }
}

export function claimDesktopWorkload(runId: string, directory?: string): () => void {
  const claim = createDesktopWorkloadClaim({
    runId,
    targetId: 'unregistered',
    targetInstanceId: 'unregistered',
    directory,
  });
  return () => claim.release();
}

function orderServices<T extends { id: string; dependsOn?: readonly string[] }>(services: readonly T[]): readonly T[] {
  const byId = new Map(services.map((service) => [service.id, service]));
  const ordered: T[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string, ancestry: readonly string[]) => {
    if (visited.has(id)) return;
    if (visiting.has(id)) throw new TypeError(`Desktop service dependency cycle: ${[...ancestry, id].join(' -> ')}.`);
    const service = byId.get(id);
    if (!service) throw new TypeError(`Unknown desktop service "${id}".`);
    visiting.add(id);
    for (const dependency of service.dependsOn ?? []) visit(dependency, [...ancestry, id]);
    visiting.delete(id);
    visited.add(id);
    ordered.push(service);
  };
  for (const service of services) visit(service.id, []);
  return ordered;
}
