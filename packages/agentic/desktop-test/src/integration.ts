import type { DesktopHost, DesktopTarget } from '@fluentui-react-native/desktop-driver';
import type { DesktopInputLane } from '@fluentui-react-native/desktop-driver/authoring';
import type { ResolvedDesktopReporterMode } from '@fluentui-react-native/desktop-driver/cli/reporter';
import type { DesktopAgentConnectionOptions } from './agentConnection.js';
import type { DesktopStage, ResolvedDesktopConfig, ResolvedDesktopTarget } from './config.js';
import type { DesktopSupervisor } from './supervisor.js';
import type { DesktopReportWriter } from './reporting/collector.js';

/**
 * Trusted, explicitly imported local code; never included in capabilities or persisted manifests.
 * The run takeover is transitional: future integrations contribute resources to the neutral supervisor.
 */
export type DesktopIntegration = {
  name: string;
  validate(): void;
  /**
   * Whether `run` serves `serve --agent`: it protects its driver with a grant authority, publishes one agent connection
   * from the process that listens, and reports the descriptor in its readiness record. `serve --agent` requires it.
   * Transitional capability flag, not proof of complete lifecycle or exclusive Storybook authority.
   */
  supportsAgent?: boolean;
  createTarget?(context: {
    target: ResolvedDesktopTarget;
    host: DesktopHost;
    reporter: DesktopReportWriter;
  }): Promise<Pick<DesktopTarget, 'storyOrchestrator' | 'storyRootTestId'>>;
  /** Transitional CLI lifecycle takeover; not the future resource-provider API. */
  run?(context: {
    config: ResolvedDesktopConfig;
    target: ResolvedDesktopTarget;
    supervisor: DesktopSupervisor;
    action: DesktopStage | 'test' | 'serve';
    suite?: string;
    /** Set only for `test`, when the run executes one input lane. The integration owns masking its own driver. */
    input?: DesktopInputLane;
    /** Set only for `serve --agent`, and only for an integration that `supportsAgent`. */
    agent?: Pick<DesktopAgentConnectionOptions, 'descriptor' | 'root'>;
    /**
     * Set only for `serve`. A ready `serve` writes no final output, so in `json` or `ndjson` mode the integration writes its
     * own readiness record to stdout in this format once its services are ready. Transitional presentation coupling.
     */
    reporterMode?: ResolvedDesktopReporterMode;
    /**
     * Set only for `serve`. Call once the readiness record is written. A `serve` that fails before then writes its final
     * summary instead, so structured output is never empty. Reports service readiness, not application/context readiness.
     */
    onReady?: () => void;
  }): Promise<void>;
};
