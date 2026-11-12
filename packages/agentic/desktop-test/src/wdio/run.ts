import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'import-meta-resolve';
import type { DesktopInputLane } from '@fluentui-react-native/desktop-driver/authoring';
import type { ResolvedDesktopConfig, DesktopWdioSuite } from '../config.js';
import { resolveDesktopSpecs, resolveDesktopTestScope } from '../config.js';
import { desktopTestSelectionEnvironment, serializeDesktopTestSelection } from '../jasmine/selection.js';
import type { DesktopSupervisor } from '../supervisor.js';
import type { DesktopWdioSettings } from './configuration.js';
import { wdioGroupId } from './identity.js';
import { createDesktopRunnerBroker } from './runnerConnection.js';
import type { DesktopRunnerConnection } from './runnerConnection.js';

const desktopWdioSettingsEnvironment = 'DESKTOP_WDIO_SETTINGS';

// WDIO loads this configuration in the launcher and in every worker. It is constant: the run's settings and the
// configuration module travel as data in a JSON file named by the environment, so nothing is spliced into code that runs.
const generatedConfiguration = `import fs from 'node:fs';
const settingsPath = process.env.DESKTOP_WDIO_SETTINGS;
if (!settingsPath) throw new Error('DESKTOP_WDIO_SETTINGS must name the desktop WDIO settings file.');
const { configurationModule, settings } = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const { createDesktopWdioConfiguration } = await import(configurationModule);
export const config = await createDesktopWdioConfiguration(settings);
`;

/** A lane selects tests through the Jasmine adapter, so a suite on another framework cannot honor one. */
export function assertDesktopSuiteSupportsInput(suiteName: string, suite: DesktopWdioSuite, input: DesktopInputLane | undefined): void {
  if (input && suite.framework !== 'jasmine') {
    throw Object.assign(new TypeError(`--input ${input} requires a jasmine suite; "${suiteName}" uses ${suite.framework}.`), {
      code: 'config',
    });
  }
}

export async function runDesktopWdioSuite(
  supervisor: DesktopSupervisor,
  config: ResolvedDesktopConfig,
  suiteName: string,
  input?: DesktopInputLane,
  attached?: { connection: DesktopRunnerConnection; preempt?: boolean },
): Promise<void> {
  const suite = config.config.suites?.[suiteName];
  if (!suite || suite.kind !== 'wdio') throw new Error(`No standalone WDIO suite "${suiteName}" is configured.`);
  assertDesktopSuiteSupportsInput(suiteName, suite, input);
  if (attached && supervisor.target.host.ownership !== 'external') {
    throw new Error('An existing agent service can run only an external, attach-only target.');
  }
  const specs = resolveDesktopSpecs(suite, supervisor.target.endpoint, config.projectRoot);
  const workIds: string[] = [];
  for (const selected of specs) {
    const files = typeof selected === 'string' ? [selected] : selected;
    const workId = wdioGroupId(files);
    workIds.push(workId);
    supervisor.reporter.emit({ kind: 'work-selected', payload: { workId, label: files.join(' + ') } });
  }
  await supervisor.reporter.flush();
  const parent = pathToFileURL(path.join(config.projectRoot, 'package.json')).href;
  const modulePath = (name: string) => {
    try {
      return fileURLToPath(resolve(name, parent));
    } catch (error) {
      throw new Error(`The suite workspace must install ${name}; desktop-test does not install test frameworks into applications.`, {
        cause: error,
      });
    }
  };
  modulePath('@wdio/local-runner');
  modulePath(`@wdio/${suite.framework}-framework`);
  const settings: DesktopWdioSettings = {
    url: attached?.connection.url ?? supervisor.server.url,
    targetId: supervisor.target.id,
    endpoint: supervisor.target.endpoint,
    renderer: supervisor.target.host.renderer,
    ownership: supervisor.target.host.ownership ?? 'session',
    specs,
    framework: suite.framework,
    reporter: fileURLToPath(new URL('./reporter.js', import.meta.url)),
    rootDir: config.projectRoot,
    hooks: suite.hooks ? path.resolve(path.dirname(config.configPath), suite.hooks) : undefined,
    specFileRetries: suite.specFileRetries ?? 0,
    bail: suite.bail ?? 1,
    timeoutMs: suite.timeoutMs ?? 60_000,
    launchTimeoutMs: supervisor.target.launchTimeoutMs ?? 180_000,
    readiness: suite.readiness ?? supervisor.target.readiness,
  };
  const settingsPath = supervisor.reporter.artifactPath('wdio.settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify({ configurationModule: new URL('./configuration.js', import.meta.url).href, settings }), {
    mode: 0o600,
  });
  // WDIO initializes its TypeScript loader before evaluating TypeScript configurations and their hooks.
  const configPath = supervisor.reporter.artifactPath('wdio.generated.mts');
  fs.writeFileSync(configPath, generatedConfiguration, { mode: 0o600 });
  const launcher = modulePath('@wdio/cli');
  // The selection travels as data in the environment: a worker parses it, and nothing is spliced into code that runs.
  const selection = serializeDesktopTestSelection({
    endpoint: supervisor.target.endpoint,
    ...(input ? { lane: input } : {}),
    testScopes: config.config.testScopes,
    values: resolveDesktopTestScope(config.testScopes, supervisor.target),
  });
  const broker = attached
    ? await createDesktopRunnerBroker({
        ...attached,
        targetId: supervisor.target.id,
        addSecret: (secret) => supervisor.reporter.addSecret(secret),
        signal: supervisor.services.controller.signal,
      })
    : undefined;
  let failure: unknown;
  try {
    await supervisor.worker(
      {
        command: process.execPath,
        args: [fileURLToPath(new URL('../../config/launcher.cjs', import.meta.url)), pathToFileURL(launcher).href, configPath],
        cwd: config.projectRoot,
        env: {
          E2ETEST_PLATFORM: supervisor.target.endpoint,
          NATIVE_TESTING: 'false',
          [desktopTestSelectionEnvironment]: selection,
          [desktopWdioSettingsEnvironment]: settingsPath,
          ...broker?.environment,
        },
        label: `WDIO ${suiteName} (${supervisor.target.endpoint})`,
      },
      suiteDeadline(suite, specs.length),
      async (code) => {
        await supervisor.reporter.assertSuccessful(workIds, suite.optional);
        if (code !== 0)
          throw new Error(
            `WDIO suite "${suiteName}" exited with code ${code} without a corresponding engine failure; see the retained worker log.`,
          );
      },
    );
  } catch (error) {
    failure = error;
  }
  try {
    await broker?.close();
  } catch (cleanup) {
    throw new AggregateError(failure === undefined ? [cleanup] : [failure, cleanup], 'WDIO runner cleanup failed.');
  }
  if (failure !== undefined) throw failure;
}

function suiteDeadline(suite: DesktopWdioSuite, groups: number): number {
  // A suite deadline bounds a wedged launcher; Jasmine still enforces its independent per-test timeout.
  if (suite.suiteTimeoutMs !== undefined) return suite.suiteTimeoutMs;
  return Math.min(2_147_483_647, Math.max(300_000, (suite.timeoutMs ?? 60_000) * 100 * groups * ((suite.specFileRetries ?? 0) + 1)));
}
