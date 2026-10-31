import { Command } from 'commander';
import { buildNativeDesktopDriver } from '@fluentui-react-native/desktop-driver';
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
    .option('--json', 'keep stdout machine-readable')
    .option('--paper', 'select macOS Paper (run prep after switching renderers)')
    .option('--verbose', 'show informational service output');
  for (const stage of ['prep', 'bundle', 'build', 'run'] as const) program.command(stage).action(() => execute(stage));
  program.command('build-driver').action(() => execute('build-driver'));
  program.command('serve').action(() => execute('serve'));
  program
    .command('test')
    .requiredOption('--suite <name>', 'configured suite')
    .option('--list', 'resolve exact spec groups without launching')
    .action((options: { suite: string; list?: boolean }) => execute('test', options));
  await program.parseAsync(argv);

  async function execute(
    action: DesktopStage | 'build-driver' | 'serve' | 'test',
    test?: { suite: string; list?: boolean },
  ): Promise<void> {
    const options = program.opts<{ config?: string; target: string; json?: boolean; paper?: boolean; verbose?: boolean }>();
    const config = await loadDesktopConfig(options.config);
    let target = config.targets[options.target];
    if (!target) throw new Error(`Unknown target "${options.target}".`);
    if (options.paper) target = selectDesktopRenderer(target, 'paper');
    const suite = test ? config.config.suites?.[test.suite] : undefined;
    if (test && !suite) throw new Error(`Unknown suite "${test.suite}".`);
    if (suite?.kind === 'wdio') {
      const specs = resolveDesktopSpecs(suite, target.endpoint, config.projectRoot);
      if (test?.list) {
        process.stdout.write(JSON.stringify({ endpoint: target.endpoint, specs }, null, 2) + '\n');
        return;
      }
    } else if (test?.list) throw new Error('--list currently requires a standalone WDIO suite.');
    const session = await createDesktopReportSession({
      ...config.reporting,
      kind: action === 'test' ? 'tests' : 'lifecycle',
      optional: suite?.kind === 'wdio' && suite.optional,
      context: { endpoint: target.endpoint, renderer: target.host.renderer },
      structured: options.json,
      verbose: options.verbose,
      onFatal: (error) => owner.services.fail(error),
    });
    const { reporter } = session;
    const owner = new DesktopSupervisor({ target, reporter, reportSession: session, integration: config.config.integration });
    session.onStop?.(() => owner.services.requestStop());
    const interrupt = () =>
      action === 'serve' ? owner.services.requestStop() : owner.services.fail(new Error('Desktop run interrupted.'));
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
          if (options.json)
            process.stdout.write(JSON.stringify({ url: owner.server.url, targetId: target.id, runId: reporter.runId }) + '\n');
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
    if (options.json && action !== 'serve')
      process.stdout.write(JSON.stringify(session.result ?? { runId: reporter.runId, delegated: true, exitCode: process.exitCode }) + '\n');
  }
}
