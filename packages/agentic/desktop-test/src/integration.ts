import type { DesktopHost, DesktopTarget } from '@fluentui-react-native/desktop-driver';
import type { DesktopInputLane } from '@fluentui-react-native/desktop-driver/authoring';
import type { ResolvedDesktopReporterMode } from '@fluentui-react-native/desktop-driver/cli/reporter';
import type { DesktopAgentConnectionOptions } from './agentConnection.js';
import type { DesktopStage, ResolvedDesktopConfig, ResolvedDesktopTarget } from './config.js';
import type { DesktopSupervisor } from './supervisor.js';
import type { DesktopReportWriter } from './reporting/collector.js';
import type { DesktopResourceContribution } from './resources.js';

export type DesktopIntegrationAction = DesktopStage | 'test' | 'serve';

export type DesktopIntegrationRequest = {
  config: ResolvedDesktopConfig;
  target: ResolvedDesktopTarget;
  action: DesktopIntegrationAction;
  suite?: string;
  input?: DesktopInputLane;
  agent?: Pick<DesktopAgentConnectionOptions, 'descriptor' | 'root'>;
};

export type DesktopIntegrationWorkloadContext = DesktopIntegrationRequest & {
  supervisor: DesktopSupervisor;
  reporterMode?: ResolvedDesktopReporterMode;
  onReady?: () => void;
};

export type DesktopIntegrationPlan = {
  /** Resources are acquired and disposed by the neutral supervisor with its workload claim. */
  resources?: readonly DesktopResourceContribution[];
  /** The integration contributes the driver listener inside an owned child resource rather than the supervisor. */
  driver?: { kind: 'hosted' };
  /** A command-specific workload run inside the supervisor's scope; it cannot replace CLI supervision or reporting. */
  workload?: (context: DesktopIntegrationWorkloadContext) => Promise<void>;
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
