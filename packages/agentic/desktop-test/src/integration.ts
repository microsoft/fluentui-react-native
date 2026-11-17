import type { DesktopHost, DesktopTarget } from '@fluentui-react-native/desktop-driver';
import type { DesktopInputLane } from '@fluentui-react-native/desktop-driver/authoring';
import type { DesktopAgentConnectionOptions } from './agentConnection.js';
import type { DesktopStage, ResolvedDesktopConfig, ResolvedDesktopTarget } from './config.js';
import type { DesktopSupervisor } from './supervisor.js';
import type { DesktopReportWriter } from './reporting/collector.js';
import type { DesktopResourceContribution, DesktopResourceServiceReadyRecord } from './resources.js';
import type { DesktopRunnerConnection } from './wdio/runnerConnection.js';

export type DesktopIntegrationAction = DesktopStage | 'test' | 'serve';

export type DesktopIntegrationRequest = {
  config: ResolvedDesktopConfig;
  target: ResolvedDesktopTarget;
  action: DesktopIntegrationAction;
  suite?: string;
  input?: DesktopInputLane;
  agent?: Pick<DesktopAgentConnectionOptions, 'descriptor' | 'root' | 'runner'>;
};

export type DesktopIntegrationWorkloadContext = DesktopIntegrationRequest & {
  supervisor: DesktopSupervisor;
};

export type DesktopIntegrationReadinessValue =
  | string
  | number
  | boolean
  | null
  | readonly DesktopIntegrationReadinessValue[]
  | { readonly [key: string]: DesktopIntegrationReadinessValue };

export type DesktopHostedDriverReady = {
  targetId: string;
  url: string;
  agentDescriptor?: string;
  runnerDescriptor?: string;
  root?: string;
  /** Correlated receipt from the owned process that hosts the driver. */
  serviceReady: DesktopResourceServiceReadyRecord;
  /** Public, non-secret integration details, kept separate from supervisor-owned identity fields. */
  integration?: { name: string; details: DesktopIntegrationReadinessValue };
};

export type DesktopHostedDriverContribution = {
  kind: 'hosted';
  /** Starts resources in the supplied supervisor scope and returns only after their correlated readiness. */
  acquire(context: DesktopIntegrationWorkloadContext): Promise<DesktopHostedDriverReady>;
};

export type DesktopIntegrationManagedWorkloadContext = {
  workload: string;
  storyId?: string;
  input: DesktopInputLane;
  supervisor: DesktopSupervisor;
  connection: DesktopRunnerConnection;
  addSecret(secret: string): void;
};

export type DesktopIntegrationAttachedWorkloadContext = {
  workload: string;
  input?: DesktopInputLane;
  supervisor: DesktopSupervisor;
  descriptor?: string;
  root?: string;
  preempt?: boolean;
};

export type DesktopIntegrationPlan = {
  /** Resources are acquired and disposed by the neutral supervisor with its workload claim. */
  resources?: readonly DesktopResourceContribution[];
  /** The integration hosts the driver in resources owned by the neutral supervisor. */
  driver?: DesktopHostedDriverContribution;
  /** A command-specific workload run inside the supervisor's scope; it cannot replace CLI supervision or reporting. */
  workload?: (context: DesktopIntegrationWorkloadContext) => Promise<void>;
  /** Executes a declared story suite against the already-hosted driver, inside a separate borrowed run scope. */
  managedWorkload?: (context: DesktopIntegrationManagedWorkloadContext) => Promise<void>;
  /** Discovers and borrows an existing hosted driver for a standalone CLI run. */
  attachedWorkload?: (context: DesktopIntegrationAttachedWorkloadContext) => Promise<void>;
};

/**
 * Trusted, explicitly imported local code. Integrations contribute resources and a bounded workload to the neutral
 * supervisor; they do not take over CLI lifecycle, readiness presentation, cancellation, or cleanup.
 */
export type DesktopIntegration = {
  name: string;
  validate(): void;
  createTarget?(context: {
    target: ResolvedDesktopTarget;
    host: DesktopHost;
    reporter: DesktopReportWriter;
  }): Promise<Pick<DesktopTarget, 'storyOrchestrator' | 'storyRootTestId'>>;
  /** Builds a side-effect-free plan for one selected command. */
  contribute?(request: DesktopIntegrationRequest): DesktopIntegrationPlan;
};
