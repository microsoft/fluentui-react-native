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
} from '@fluentui-react-native/desktop-driver/cli/reporter';
import type { ResolvedDesktopReporterMode } from '@fluentui-react-native/desktop-driver/cli/reporter';
import { desktopStageCommands } from './adapters.js';
import { loadDesktopConfig, resolveDesktopSpecs, selectDesktopRenderer } from './config.js';
import type { DesktopStage } from './config.js';
import { createDesktopReportSession } from './reporting/session.js';
import { DesktopStopRequested } from './services.js';
import { DesktopSupervisor } from './supervisor.js';
import { runDesktopWdioSuite } from './wdio/run.js';

export async function runDesktopTestCli(argv = process.argv): Promise<void> {
  const program = new Command('desktop-test')
    .description('Application-neutral native desktop lifecycle and WDIO suites')
    .option('--config <path>', 'desktop.config file')
    .requiredOption('--target <name>', 'registered target name')
    .addOption(new Option('--reporter <mode>', 'output format').choices([...desktopReporterModes]))
    .option('--json', 'alias for --reporter json')
    .addOption(new Option('--events <level>', 'NDJSON event detail').choices([...desktopEventLevels]))
    .option('--paper', 'select macOS Paper (run prep after switching renderers)')
    .option('--verbose', 'show informational service output');
  let parseDiagnostics = '';
  program.exitOverride().configureOutput({
    writeErr: (message) => {
      parseDiagnostics += message;
    },
    writeOut: (message) => process.stdout.write(message),
  });
  for (const stage of ['prep', 'bundle', 'build', 'run'] as const) program.command(stage).action(() => execute(stage));
  program.command('build-driver').action(() => execute('build-driver'));
  program.command('serve').action(() => execute('serve'));
  program
    .command('test')
    .requiredOption('--suite <name>', 'configured suite')
    .option('--list', 'resolve exact spec groups without launching')
    .action((options: { suite: string; list?: boolean }) => execute('test', options));
  let reporterMode: ResolvedDesktopReporterMode = 'plain';
  let reporterResolutionError: unknown;
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

  async function execute(
    action: DesktopStage | 'build-driver' | 'serve' | 'test',
    test?: { suite: string; list?: boolean },
  ): Promise<void> {
    const options = program.opts<{
      config?: string;
      target: string;
      reporter?: string;
      json?: boolean;
      events?: 'milestones' | 'progress' | 'all';
      paper?: boolean;
      verbose?: boolean;
    }>();
    let config: Awaited<ReturnType<typeof loadDesktopConfig>>;
    try {
      config = await loadDesktopConfig(options.config);
    } catch (error) {
      throw Object.assign(error instanceof Error ? error : new Error(String(error)), { code: 'config' });
    }
    reporterMode = resolveDesktopReporterMode({
      flag: options.json ? 'json' : options.reporter,
      environment: process.env.DESKTOP_REPORTER,
      configured: config.reporting.reporter ?? config.reporting.console,
    });
    const requestedEventLevel = options.events ?? process.env.DESKTOP_EVENTS ?? config.reporting.events;
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
    const session = await createDesktopReportSession({
      ...config.reporting,
      kind: action === 'test' ? 'tests' : 'lifecycle',
      optional: suite?.kind === 'wdio' && suite.optional,
      context: { endpoint: target.endpoint, renderer: target.host.renderer },
      reporterMode,
      eventLevel,
      suppressFinalOutput: action === 'serve',
      verbose: options.verbose,
      onFatal: (error) => owner.services.fail(error),
    });
    const { reporter } = session;
    const owner = new DesktopSupervisor({ target, reporter, reportSession: session, integration: config.config.integration });
    session.onStop?.(() => owner.services.requestStop());
    const interrupt = () => owner.services.requestStop();
    process.once('SIGINT', interrupt);
    process.once('SIGTERM', interrupt);
    let failure: unknown;
    try {
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
      } else if (config.config.integration?.run && suite?.kind !== 'wdio') {
        await owner.open(['test', 'serve', 'run'].includes(action));
        if (action === 'test' || action === 'serve') await owner.startConfiguredServices();
        await owner.services.guard(config.config.integration.run({ config, target, supervisor: owner, action, suite: test?.suite }));
      } else if (action !== 'test' && action !== 'serve') {
        await owner.open(action === 'run');
        for (const command of desktopStageCommands(target, action)) {
          await owner.services.guard(owner.runner.run(owner.prepare(command, `${action} ${target.endpoint}`)));
        }
      } else {
        await owner.start();
        if (action === 'serve') {
          if (reporterMode === 'json' || reporterMode === 'ndjson')
            process.stdout.write(
              formatDesktopReporterValue(reporterMode, { url: owner.server.url, targetId: target.id, runId: reporter.runId }),
            );
          await owner.services.guard(new Promise<never>(() => undefined));
        } else if (suite?.kind === 'wdio') await runDesktopWdioSuite(owner, config, test!.suite);
        else throw new Error('The imported integration does not implement this suite.');
      }
    } catch (error) {
      if (!(error instanceof DesktopStopRequested)) {
        failure = error;
        reporter.fail(error);
      }
    } finally {
      process.off('SIGINT', interrupt);
      process.off('SIGTERM', interrupt);
      try {
        await owner.close();
      } catch (error) {
        reporter.fail(error, 'cleanup');
        failure = failure === undefined ? error : new AggregateError([failure, error], 'Desktop execution and cleanup failed.');
      }
    }
    process.exitCode = await session.close(failure);
    if (session.delegated && action !== 'serve' && (reporterMode === 'json' || reporterMode === 'ndjson')) {
      process.stdout.write(
        formatDesktopReporterValue(reporterMode, { runId: reporter.runId, delegated: true, exitCode: process.exitCode }),
      );
    }
  }
}
