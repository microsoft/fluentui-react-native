import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { desktopWebdriverGrantOptions, installDesktopWebdriverCommands } from '@fluentui-react-native/desktop-driver/wdio';
import type { DesktopEndpoint, DesktopRenderer } from '@fluentui-react-native/desktop-driver';
import { resolveDesktopClickMode } from '@fluentui-react-native/desktop-driver/authoring';
import type { DesktopReadiness } from '../config.js';
import { desktopJasmineRegistry } from '../jasmine/registry.js';
import { desktopTestSelectionFromEnvironment } from '../jasmine/selection.js';
import { currentDesktopJasmineEnvironment, selectDesktopSpecs } from '../jasmine/specSelection.js';
import { connectReportProducer } from '../reporting/transport.js';
import { DesktopReportedError, serializeReportError } from '../reporting/protocol.js';
import {
  requestDesktopRunnerWorker,
  runnerBrokerTokenEnvironment,
  runnerBrokerUrlEnvironment,
  runnerWorkerTokenEnvironment,
} from './runnerConnection.js';

export type DesktopWdioSettings = {
  url: string;
  targetId: string;
  endpoint: DesktopEndpoint;
  renderer?: DesktopRenderer;
  ownership: 'session' | 'supervisor' | 'external';
  specs: (string | string[])[];
  framework: string;
  reporter: string;
  hooks?: string;
  rootDir: string;
  specFileRetries: number;
  bail: number;
  timeoutMs: number;
  launchTimeoutMs: number;
  readiness?: DesktopReadiness;
  scopedRunner?: boolean;
};

type Hook = (...args: unknown[]) => unknown;
const hookNames = [
  'onPrepare',
  'onComplete',
  'onWorkerStart',
  'onWorkerEnd',
  'beforeSession',
  'afterSession',
  'before',
  'after',
  'beforeSuite',
  'afterSuite',
  'beforeTest',
  'afterTest',
  'beforeHook',
  'afterHook',
  'beforeCommand',
  'afterCommand',
] as const;

export async function createDesktopWdioConfiguration(settings: DesktopWdioSettings) {
  const broker = { url: process.env[runnerBrokerUrlEnvironment], token: process.env[runnerBrokerTokenEnvironment] };
  const grant = process.env[runnerWorkerTokenEnvironment];
  for (const name of [runnerBrokerUrlEnvironment, runnerBrokerTokenEnvironment, runnerWorkerTokenEnvironment]) delete process.env[name];
  let runnerEnvironment: Record<string, string | undefined> | undefined;
  let hooks: Partial<Record<(typeof hookNames)[number], Hook>> = {};
  if (settings.hooks) {
    const loaded: unknown = await import(pathToFileURL(settings.hooks).href);
    const value = loaded && typeof loaded === 'object' && 'default' in loaded ? loaded.default : loaded;
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Desktop hooks must export a hook object.');
    for (const [key, callback] of Object.entries(value)) {
      if (!hookNames.some((name) => name === key) || typeof callback !== 'function')
        throw new TypeError(`Unsupported desktop hook "${key}".`);
    }
    hooks = value;
  }
  const address = new URL(settings.url);
  const readiness = settings.readiness;
  // The launcher read the selection too, so a malformed one fails the run before any worker starts.
  const selection = desktopTestSelectionFromEnvironment();
  const configuration = {
    ...hooks,
    runner: 'local',
    runnerEnv: {
      [runnerBrokerUrlEnvironment]: undefined,
      [runnerBrokerTokenEnvironment]: undefined,
      [runnerWorkerTokenEnvironment]: undefined,
    },
    framework: settings.framework,
    rootDir: settings.rootDir,
    specs: settings.specs,
    maxInstances: 1,
    bail: settings.bail,
    specFileRetries: settings.specFileRetries,
    logLevel: 'error',
    ...(grant ? desktopWebdriverGrantOptions(grant) : {}),
    // The framework adapters report a spec file that fails to import only as a warning and then run zero tests; keep that one visible.
    logLevels: { '@wdio/jasmine-framework': 'warn', '@wdio/mocha-framework': 'warn' },
    hostname: address.hostname,
    port: Number(address.port),
    path: address.pathname,
    protocol: address.protocol.slice(0, -1),
    connectionRetryCount: 0,
    connectionRetryTimeout: Math.min(settings.launchTimeoutMs + 15_000, 2_147_483_647),
    waitforTimeout: 20_000,
    waitforInterval: 100,
    reporterSyncTimeout: 10_000,
    jasmineOpts: { defaultTimeoutInterval: settings.timeoutMs },
    reporters: [
      [
        settings.reporter,
        { specFileRetries: settings.specFileRetries, desktopContext: { endpoint: settings.endpoint, renderer: settings.renderer } },
      ],
    ],
    capabilities: [
      {
        browserName: 'furn-native-desktop',
        platformName: settings.endpoint === 'macos' ? 'macos' : 'windows',
        'furn:target': settings.targetId,
        'furn:launchMode': settings.ownership === 'external' ? 'attach' : 'launch',
        'furn:clickMode': resolveDesktopClickMode(undefined, 'auto', selection?.lane),
        // A lane's session refuses input its lane never delivers; without one, every mechanism stays available.
        'furn:inputMode': selection?.lane ?? 'compatibility',
      },
    ],
    onPrepare: async (config: { runnerEnv: Record<string, string | undefined> }, ...args: unknown[]) => {
      runnerEnvironment = config.runnerEnv;
      await hooks.onPrepare?.(config, ...args);
    },
    onWorkerStart: async (id: string, ...args: unknown[]) => {
      if (runnerEnvironment) delete runnerEnvironment[runnerWorkerTokenEnvironment];
      await hooks.onWorkerStart?.(id, ...args);
      if (settings.scopedRunner) {
        if (!runnerEnvironment) throw new Error('The WDIO launcher worker environment is unavailable.');
        runnerEnvironment[runnerWorkerTokenEnvironment] = await requestDesktopRunnerWorker('POST', id, broker);
      }
    },
    onWorkerEnd: async (id: string, ...args: unknown[]) => {
      if (runnerEnvironment) delete runnerEnvironment[runnerWorkerTokenEnvironment];
      if (settings.scopedRunner) await requestDesktopRunnerWorker('DELETE', id, broker);
      await hooks.onWorkerEnd?.(id, ...args);
    },
    beforeSession: async (...args: unknown[]) => {
      if (settings.scopedRunner && !grant) throw new Error('The WDIO worker has no scoped Desktop Driver authority.');
      process.env.E2ETEST_PLATFORM = settings.endpoint;
      await hooks.beforeSession?.(...args);
    },
    before: async (capabilities: unknown, specs: unknown, browser: WebdriverIO.Browser) => {
      installDesktopWebdriverCommands(browser, settings.url, { grant });
      // Before the application is touched: a lane that cannot vouch for its tests must stop here.
      if (settings.framework === 'jasmine') {
        selectDesktopSpecs(
          desktopJasmineRegistry(),
          currentDesktopJasmineEnvironment(),
          browser.capabilities['furn:features'],
          browser.capabilities['furn:inputMode'],
        );
      }
      if ((await browser.getWindowHandles()).length === 0) throw new Error('Native application did not expose a window.');
      if (readiness?.testId) {
        await browser.$(`~${readiness.testId}`).waitForDisplayed({
          timeout: readiness.timeoutMs ?? settings.launchTimeoutMs,
          timeoutMsg: `Native readiness marker "${readiness.testId}" was not displayed.`,
        });
      }
      await hooks.before?.(capabilities, specs, browser);
    },
  };
  for (const name of hookNames) {
    const hook = configuration[name] as Hook | undefined;
    if (!hook) continue;
    const guarded: Hook = async (...args) => {
      try {
        return await hook(...args);
      } catch (error) {
        const failure = { failureId: randomUUID(), kind: 'infrastructure' as const, error: serializeReportError(error) };
        const producer = await connectReportProducer(`wdio-hook-${randomUUID()}`);
        producer.emit({ kind: 'service-failed', payload: { failure } }, `hook:${name}`, {
          endpoint: settings.endpoint,
          renderer: settings.renderer,
        });
        await producer.finish('failed');
        throw new DesktopReportedError(failure);
      }
    };
    Object.assign(configuration, { [name]: guarded });
  }
  return configuration;
}
