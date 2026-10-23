import type { DesktopHost, DesktopTarget } from '@fluentui-react-native/desktop-driver';
import type { DesktopStage, ResolvedDesktopConfig, ResolvedDesktopTarget } from './config.js';
import type { DesktopSupervisor } from './supervisor.js';
import type { DesktopReportWriter } from './reporting/collector.js';

/** Trusted, explicitly imported local code; never included in capabilities or persisted manifests. */
export type DesktopIntegration = {
  name: string;
  validate(): void;
  createTarget?(context: {
    target: ResolvedDesktopTarget;
    host: DesktopHost;
    reporter: DesktopReportWriter;
  }): Promise<Pick<DesktopTarget, 'storyOrchestrator' | 'storyRootTestId'>>;
  run?(context: {
    config: ResolvedDesktopConfig;
    target: ResolvedDesktopTarget;
    supervisor: DesktopSupervisor;
    action: DesktopStage | 'test' | 'serve';
    suite?: string;
  }): Promise<void>;
};
