import type { ResolvedDesktopConfig, ResolvedDesktopTarget } from './config.js';
import { DesktopWorkloadService } from './control.js';
import type { DesktopWorkloadCatalogEntry, DesktopWorkloadLane } from './control.js';
import { createDesktopInputLane } from './reporting/lane.js';
import { createDesktopRunContext } from './runContext.js';
import { runDesktopWdioSuite } from './wdio/run.js';
import type { DesktopRunnerConnection } from './wdio/runnerConnection.js';
import type { DesktopIntegrationManagedWorkloadContext } from './integration.js';

export type ManagedDesktopWdioOptions = {
  config: ResolvedDesktopConfig;
  target: ResolvedDesktopTarget;
  hostSignal: AbortSignal;
  /** An accessible host has the physical input masks applied; an unmasked host is physical. */
  hostLane: DesktopWorkloadLane;
  /** Absent when the live host cannot publish an attach-only runner descriptor. */
  connectRunner?: (addSecret: (secret: string) => void) => Promise<DesktopRunnerConnection>;
  managedWorkload?: (context: DesktopIntegrationManagedWorkloadContext) => Promise<void>;
  addSecret?(secret: string): void;
};

/** Builds the management catalog only from trusted, explicitly opted-in suites and the live host's input policy. */
export function createManagedDesktopWdioService(options: ManagedDesktopWdioOptions): DesktopWorkloadService {
  const { config, target, hostSignal, hostLane, connectRunner } = options;
  if (hostLane !== 'accessible' && hostLane !== 'physical') throw new TypeError('Invalid desktop host input policy.');
  const catalog: DesktopWorkloadCatalogEntry[] = [];
  for (const [id, suite] of Object.entries(config.config.suites ?? {})) {
    if (!suite.agent) continue;
    const runnerAvailable =
      !!connectRunner &&
      (suite.kind === 'csf-wdio'
        ? !!options.managedWorkload
        : (target.host.ownership === 'external' || target.host.ownership === 'supervisor') && suite.framework === 'jasmine');
    const lanes = runnerAvailable
      ? suite.agent.lanes.filter(
          (lane) => hostLane === lane || (hostLane === 'physical' && lane === 'accessible' && suite.kind === 'csf-wdio'),
        )
      : [];
    catalog.push({
      id,
      kind: suite.kind,
      lanes,
      ...(lanes.length ? {} : { unavailable: runnerAvailable ? 'host-input' : 'runner-unavailable' }),
    });
  }
  const output = { write: () => true };
  return new DesktopWorkloadService({
    catalog,
    addSecret: options.addSecret,
    prepare: async ({ workload, storyId, lane, bindReporter, addSecret }) => {
      const suite = config.config.suites?.[workload];
      if (!suite || !connectRunner || (suite.kind === 'csf-wdio' && !options.managedWorkload))
        throw new Error('The declared desktop workload is unavailable.');
      const context = await createDesktopRunContext({
        target,
        hostSignal,
        reporting: {
          ...config.reporting,
          kind: 'tests',
          optional: suite.kind === 'wdio' && suite.optional,
          context: { endpoint: target.endpoint, renderer: target.host.renderer },
          lane: createDesktopInputLane(lane, 'management'),
          reporterMode: 'plain',
          output,
          errorOutput: output,
          summary: false,
        },
        bindReporter,
      });
      return {
        runId: context.reporter.runId,
        root: context.reporter.root,
        textArtifacts: config.reporting.junit === false ? [] : ['junit.xml'],
        run: (signal) =>
          context.run(signal, async (owner) => {
            const connection = await connectRunner(addSecret);
            if (suite.kind === 'csf-wdio') {
              await options.managedWorkload!({ workload, storyId, input: lane, supervisor: owner, connection, addSecret });
            } else {
              await runDesktopWdioSuite(owner, config, workload, lane, { connection });
            }
          }),
        finish: async (failure) => {
          await context.finish(failure);
        },
      };
    },
  });
}
