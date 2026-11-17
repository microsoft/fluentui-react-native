import { randomUUID } from 'node:crypto';
import { Command, Option } from 'commander';
import { buildNativeDesktopDriver } from '@fluentui-react-native/desktop-driver';
import {
  desktopEventLevels,
  desktopReporterModes,
  formatDesktopReporterValue,
  formatDesktopReporterError,
  resolveDesktopEventLevel,
  resolveDesktopReporterMode,
  resolveDesktopReporterModeFromArgv,
  tolerateClosedDesktopStdout,
} from '@fluentui-react-native/desktop-driver/cli/reporter';
import type { ResolvedDesktopReporterMode } from '@fluentui-react-native/desktop-driver/cli/reporter';
import { desktopInputLanes } from '@fluentui-react-native/desktop-driver/authoring';
import { desktopStageCommands } from './adapters.js';
import { defaultAgentDescriptor } from './agentConnection.js';
import type { DesktopAgentConnectionOptions } from './agentConnection.js';
import { loadDesktopConfig, resolveDesktopSpecs, selectDesktopRenderer } from './config.js';
import type { DesktopStage } from './config.js';
import { acquireHostedDesktopDriver, desktopHostReady, formatDesktopHostReady, publishDesktopHostManagement } from './hostedDriver.js';
import { createDesktopInputLane, desktopInputEnvironment, requestedDesktopInputLane } from './reporting/lane.js';
import { createDesktopRunContext } from './runContext.js';
import { DesktopStopRequested } from './services.js';
import { defaultSupervisorDescriptor } from './supervisorConnection.js';
import { assertDesktopSuiteSupportsInput, runDesktopWdioSuite } from './wdio/run.js';
import { connectDesktopRunner, defaultRunnerDescriptor } from './wdio/runnerConnection.js';

type AgentFlags = {
  agent?: boolean;
  descriptor?: string;
  supervisorDescriptor?: string;
  root?: string;
  runnerDescriptor?: string;
  allowRunnerPreempt?: boolean;
  input?: string;
};
type TestFlags = {
  suite: string;
  list?: boolean;
  input?: string;
  attachAgent?: boolean;
  descriptor?: string;
  root?: string;
  preempt?: boolean;
};
type DesktopCliOptions = {
  config?: string;
  target: string;
  reporter?: string;
  json?: boolean;
  events?: 'milestones' | 'progress' | 'all';
  paper?: boolean;
  verbose?: boolean;
};
type DesktopCliAction = DesktopStage | 'build-driver' | 'serve' | 'test';

export async function runDesktopTestCli(argv = process.argv): Promise<void> {
  tolerateClosedDesktopStdout();
  const program = new Command('desktop-test')
    .description('Application-neutral native desktop lifecycle and WDIO suites')
    .option('--config <path>', 'desktop.config file')
    .requiredOption('--target <name>', 'registered target name')
    .addOption(new Option('--reporter <mode>', 'output format').choices([...desktopReporterModes]))
    .option('--json', 'alias for --reporter json')
    .addOption(new Option('--events <level>', 'NDJSON event detail').choices([...desktopEventLevels]))
    .option('--paper', 'select macOS Paper (run prep after switching renderers)')
    .option('--verbose', 'stream command output live, with start markers and log paths, instead of only the outcome of each step');
  let parseDiagnostics = '';
  program.exitOverride().configureOutput({
    writeErr: (message) => {
      parseDiagnostics += message;
    },
    writeOut: (message) => process.stdout.write(message),
  });
  for (const stage of ['prep', 'bundle', 'build', 'run'] as const) program.command(stage).action(() => execute(stage));
  program.command('build-driver').action(() => execute('build-driver'));
  program
    .command('serve')
    .option('--agent', 'require a grant on every route and publish one agent connection descriptor')
    .option('--descriptor <name>', `agent connection descriptor record name (default ${defaultAgentDescriptor})`)
    .option('--supervisor-descriptor <name>', `workload supervisor descriptor record (default ${defaultSupervisorDescriptor})`)
    .option('--root <path>', 'private storage root for the agent descriptor; defaults to the platform location')
    .option('--runner-descriptor <name>', `attach-only runner descriptor record (default ${defaultRunnerDescriptor})`)
    .option('--allow-runner-preempt', 'explicitly grant the attach-only runner operator authority to preempt an existing controller')
    .addOption(new Option('--input <lane>', 'apply the host input mask for managed workloads').choices([...desktopInputLanes]))
    .action((options: AgentFlags) => execute('serve', undefined, options));
  program
    .command('test')
    .requiredOption('--suite <name>', 'configured suite')
    .option('--list', 'resolve exact spec groups without launching')
    .option('--attach-agent', 'reuse a protected attach-only service without a second workload claim')
    .option('--descriptor <name>', `existing runner descriptor (default ${defaultRunnerDescriptor}); requires --attach-agent`)
    .option('--root <path>', 'existing descriptor private storage root; requires --attach-agent')
    .option('--preempt', 'request operator-authorized preemption instead of the default busy result; requires --attach-agent')
    .addOption(
      new Option(
        '--input <lane>',
        `run one input lane: accessible (keyboard, physical click and wheel masked) or physical; falls back to ${desktopInputEnvironment}`,
      ).choices([...desktopInputLanes]),
    )
    .action((options: TestFlags) => execute('test', options));
  let reporterMode: ResolvedDesktopReporterMode = 'plain';
  let reporterResolutionError: unknown;
  const execute = (action: DesktopCliAction, test?: TestFlags, agentFlags?: AgentFlags) =>
    executeDesktopTestAction({
      action,
      test,
      agentFlags,
      options: program.opts<DesktopCliOptions>(),
      onReporterMode: (mode) => {
        reporterMode = mode;
      },
    });
  try {
    reporterMode = resolveDesktopReporterModeFromArgv(argv, { environment: process.env.DESKTOP_REPORTER });
  } catch (error) {
    reporterResolutionError = error;
    try {
      reporterMode = resolveDesktopReporterMode({ environment: process.env.DESKTOP_REPORTER });
    } catch {
      reporterMode = 'plain';
    }
  }
  try {
    await program.parseAsync(argv);
  } catch (error) {
    const commandError = reporterResolutionError ?? error;
    if (error && typeof error === 'object' && 'exitCode' in error && error.exitCode === 0) return;
    if (reporterMode === 'json' || reporterMode === 'ndjson') {
      process.stdout.write(formatDesktopReporterError(reporterMode, commandError));
    } else {
      process.stderr.write(parseDiagnostics || `${commandError instanceof Error ? commandError.message : String(commandError)}\n`);
    }
    process.exitCode = 1;
    return;
  }
}

/** Executes a resolved CLI action independently of Commander parsing and presentation of parse errors. */
export async function executeDesktopTestAction({
  action,
  test,
  agentFlags = {},
  options,
  onReporterMode,
}: {
  action: DesktopCliAction;
  test?: TestFlags;
  agentFlags?: AgentFlags;
  options: DesktopCliOptions;
  onReporterMode?(mode: ResolvedDesktopReporterMode): void;
}): Promise<void> {
  let config: Awaited<ReturnType<typeof loadDesktopConfig>>;
  try {
    config = await loadDesktopConfig(options.config);
  } catch (error) {
    throw Object.assign(error instanceof Error ? error : new Error(String(error)), { code: 'config' });
  }
  const reporterMode = resolveDesktopReporterMode({
    flag: options.json ? 'json' : options.reporter,
    environment: process.env.DESKTOP_REPORTER,
    configured: config.reporting.reporter ?? config.reporting.console,
  });
  onReporterMode?.(reporterMode);
  const requestedEventLevel = options.events ?? (process.env.DESKTOP_EVENTS || undefined) ?? config.reporting.events;
  if (requestedEventLevel && reporterMode !== 'ndjson')
    throw Object.assign(new TypeError('--events requires --reporter ndjson.'), { code: 'config' });
  const eventLevel = resolveDesktopEventLevel({
    flag: options.events,
    environment: process.env.DESKTOP_EVENTS,
    configured: config.reporting.events,
  });
  let target = config.targets[options.target];
  if (!target) throw Object.assign(new Error(`Unknown target "${options.target}".`), { code: 'unknown-target' });
  if (options.paper) target = selectDesktopRenderer(target, 'paper');
  const suite = test ? config.config.suites?.[test.suite] : undefined;
  if (test && !suite) throw Object.assign(new Error(`Unknown suite "${test.suite}".`), { code: 'config' });
  if (test && !test.attachAgent && (test.descriptor !== undefined || test.root !== undefined || test.preempt)) {
    throw Object.assign(new TypeError('--descriptor, --root and --preempt require --attach-agent.'), { code: 'config' });
  }
  if (
    test?.attachAgent &&
    ((suite?.kind === 'wdio' &&
      ((target.host.ownership !== 'external' && target.host.ownership !== 'supervisor') || config.config.integration)) ||
      (suite?.kind === 'csf-wdio' && !config.config.integration))
  ) {
    throw Object.assign(new TypeError('--attach-agent requires a supported attached suite and an attach-only service.'), {
      code: 'config',
    });
  }
  if (test?.list && test.input !== undefined) {
    throw Object.assign(new TypeError('--list resolves spec files, which do not depend on the input lane; omit --input.'), {
      code: 'config',
    });
  }
  if (suite?.kind === 'wdio') {
    const specs = resolveDesktopSpecs(suite, target.endpoint, config.projectRoot);
    if (test?.list) {
      process.stdout.write(
        formatDesktopReporterValue(
          reporterMode,
          { endpoint: target.endpoint, specs },
          reporterMode === 'plain' || reporterMode === 'github-actions',
        ),
      );
      return;
    }
  } else if (test?.list) throw Object.assign(new Error('--list currently requires a standalone WDIO suite.'), { code: 'config' });
  // The test environment fallback never selects a long-lived host's input policy implicitly.
  const requestedLane = test
    ? requestedDesktopInputLane({ flag: test.input, environment: process.env[desktopInputEnvironment] })
    : action === 'serve' && agentFlags.input !== undefined
      ? requestedDesktopInputLane({ flag: agentFlags.input })
      : undefined;
  const input = requestedLane?.input;
  if (suite?.kind === 'wdio') assertDesktopSuiteSupportsInput(test!.suite, suite, input);
  if (
    !agentFlags.agent &&
    (agentFlags.descriptor !== undefined ||
      agentFlags.supervisorDescriptor !== undefined ||
      agentFlags.root !== undefined ||
      agentFlags.runnerDescriptor !== undefined ||
      agentFlags.allowRunnerPreempt)
  )
    throw Object.assign(new TypeError('Descriptor and runner publication options require --agent.'), { code: 'config' });
  const agent: DesktopAgentConnectionOptions | undefined = agentFlags.agent
    ? {
        ...(agentFlags.descriptor === undefined ? {} : { descriptor: agentFlags.descriptor }),
        ...(agentFlags.root === undefined ? {} : { root: agentFlags.root }),
        ...(agentFlags.runnerDescriptor === undefined && !agentFlags.allowRunnerPreempt
          ? {}
          : { runner: { descriptor: agentFlags.runnerDescriptor, allowPreempt: agentFlags.allowRunnerPreempt } }),
      }
    : undefined;
  const integrationPlan =
    action !== 'build-driver' && suite?.kind !== 'wdio'
      ? config.config.integration?.contribute?.({
          config,
          target,
          action,
          ...(test?.suite ? { suite: test.suite } : {}),
          ...(input ? { input } : {}),
          ...(agent ? { agent } : {}),
        })
      : undefined;
  if (
    config.config.integration &&
    action === 'serve' &&
    (integrationPlan?.driver?.kind !== 'hosted' || typeof integrationPlan.driver.acquire !== 'function')
  ) {
    throw Object.assign(new TypeError(`serve requires integration "${config.config.integration.name}" to contribute a hosted driver.`), {
      code: 'config',
    });
  }
  let ready = false;
  const markReady = () => {
    ready = true;
  };
  const execution = await createDesktopRunContext({
    target,
    reporting: {
      ...config.reporting,
      kind: action === 'test' ? 'tests' : 'lifecycle',
      optional: suite?.kind === 'wdio' && suite.optional,
      context: { endpoint: target.endpoint, renderer: target.host.renderer },
      // The supervisor starts the driver, and starts it masked for an accessible lane.
      ...(requestedLane
        ? { lane: createDesktopInputLane(requestedLane.input, requestedLane.source, test?.attachAgent ? undefined : 'host-masked') }
        : {}),
      reporterMode,
      eventLevel,
      suppressFinalOutput: action === 'serve' ? () => ready : false,
      verbose: options.verbose,
    },
    independent: false,
    claim: !test?.attachAgent && ['test', 'serve', 'run'].includes(action),
    interrupts: true,
    strictCleanup: false,
    supervisor: {
      integration: config.config.integration,
      ...(integrationPlan ? { integrationPlan } : {}),
      ...(agent ? { agent } : {}),
      ...(input ? { input } : {}),
    },
  });
  const { reporter, supervisor: owner } = execution;
  let failure: unknown;
  try {
    if (!test?.attachAgent && !integrationPlan?.workload && !integrationPlan?.driver && (action === 'test' || action === 'serve')) {
      await owner.open(!execution.delegated);
      await owner.start();
    }
    await execution.run(undefined, async () => {
      if (action === 'build-driver') {
        const artifact = await buildNativeDesktopDriver({
          platform: target.endpoint,
          cacheRoot: target.nativeDriver?.cacheRoot,
          signal: owner.services.controller.signal,
        });
        reporter.emit({
          kind: 'diagnostic',
          payload: { level: 'info', message: `Verified helper ${artifact.artifactId} at ${artifact.executablePath}` },
        });
      } else if (test?.attachAgent && suite?.kind === 'wdio') {
        const connection = await connectDesktopRunner({
          descriptor: test.descriptor,
          root: test.root,
          addSecret: (secret) => reporter.addSecret(secret),
        });
        await runDesktopWdioSuite(owner, config, test.suite, input, { connection, preempt: test.preempt });
      } else if (test?.attachAgent && suite?.kind === 'csf-wdio') {
        if (!integrationPlan?.attachedWorkload) throw new Error('The imported integration does not support attached story suites.');
        await owner.services.guard(
          integrationPlan.attachedWorkload({
            workload: test.suite,
            supervisor: owner,
            input,
            descriptor: test.descriptor,
            root: test.root,
            preempt: test.preempt,
          }),
        );
      } else if (action === 'serve' && integrationPlan?.driver) {
        await owner.startConfiguredServices();
        const readiness = await acquireHostedDesktopDriver({
          supervisor: owner,
          request: {
            config,
            target,
            action,
            ...(input ? { input } : {}),
            ...(agent ? { agent } : {}),
          },
          driver: integrationPlan.driver,
          supervisorDescriptor: agentFlags.supervisorDescriptor,
          managedWorkload: integrationPlan.managedWorkload,
        });
        process.stdout.write(formatDesktopHostReady(reporterMode, readiness));
        markReady();
        await owner.services.waitForStop();
      } else if (integrationPlan?.workload) {
        await owner.startResources();
        if (action === 'test' || action === 'serve') await owner.startConfiguredServices();
        owner.services.controller.signal.throwIfAborted();
        const run = owner.services.guard(
          Promise.resolve(
            integrationPlan.workload({
              config,
              target,
              supervisor: owner,
              action,
              ...(test?.suite ? { suite: test.suite } : {}),
              ...(input ? { input } : {}),
              ...(agent ? { agent } : {}),
            }),
          ),
        );
        await run;
      } else if (action !== 'test' && action !== 'serve') {
        for (const command of desktopStageCommands(target, action)) {
          await owner.services.guard(
            owner.runner.run(owner.prepare(command, `${action} ${target.endpoint}`), { signal: owner.services.controller.signal }),
          );
        }
      } else {
        if (action === 'serve') {
          let supervisorDescriptor: string | undefined;
          if (agentFlags.agent) {
            const driverDescriptor = owner.agentDescriptor;
            if (!driverDescriptor) throw new Error('The protected desktop service did not publish its agent descriptor.');
            supervisorDescriptor = await publishDesktopHostManagement({
              supervisor: owner,
              config,
              target,
              input,
              driver: {
                record: driverDescriptor,
                url: owner.server.url,
                ...(owner.runnerDescriptor ? { runnerRecord: owner.runnerDescriptor } : {}),
              },
              root: agentFlags.root,
              descriptor: agentFlags.supervisorDescriptor,
            });
          }
          process.stdout.write(
            formatDesktopHostReady(
              reporterMode,
              desktopHostReady({
                supervisor: owner,
                url: owner.server.url,
                agentDescriptor: owner.agentDescriptor,
                runnerDescriptor: owner.runnerDescriptor,
                supervisorDescriptor,
              }),
            ),
          );
          markReady();
          await owner.services.waitForStop();
        } else if (suite?.kind === 'wdio') await runDesktopWdioSuite(owner, config, test!.suite, input);
        else throw new Error('The imported integration does not implement this suite.');
      }
    });
  } catch (error) {
    if (!(error instanceof DesktopStopRequested)) {
      failure = error;
      reporter.fail(error);
    } else if (action !== 'serve') {
      // An interrupted one-shot action did not finish: leave its scope open so the run reports incomplete, not passed.
      reporter.emit(
        { kind: 'scope-start', payload: { label: `${action} ${target.endpoint} (interrupted)`, category: 'phase' } },
        `interrupted-${randomUUID()}`,
      );
    }
  } finally {
    process.exitCode = await execution.finish(failure);
    if (execution.delegated && action !== 'serve' && (reporterMode === 'json' || reporterMode === 'ndjson')) {
      process.stdout.write(
        formatDesktopReporterValue(reporterMode, { runId: reporter.runId, delegated: true, exitCode: process.exitCode }),
      );
    }
  }
}
