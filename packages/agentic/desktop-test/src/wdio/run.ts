import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'import-meta-resolve';
import type { ResolvedDesktopConfig, DesktopWdioSuite } from '../config.js';
import { resolveDesktopSpecs } from '../config.js';
import type { DesktopSupervisor } from '../supervisor.js';
import type { DesktopWdioSettings } from './configuration.js';
import { wdioGroupId } from './identity.js';

export async function runDesktopWdioSuite(supervisor: DesktopSupervisor, config: ResolvedDesktopConfig, suiteName: string): Promise<void> {
  const suite = config.config.suites?.[suiteName];
  if (!suite || suite.kind !== 'wdio') throw new Error(`No standalone WDIO suite "${suiteName}" is configured.`);
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
    url: supervisor.server.url,
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
  // WDIO initializes its TypeScript loader before evaluating TypeScript configurations and their hooks.
  const configPath = supervisor.reporter.artifactPath('wdio.generated.mts');
  fs.writeFileSync(
    configPath,
    `import { createDesktopWdioConfiguration } from ${JSON.stringify(new URL('./configuration.js', import.meta.url).href)};\n` +
      `export const config = await createDesktopWdioConfiguration(${JSON.stringify(settings)});\n`,
    { mode: 0o600 },
  );
  const launcher = modulePath('@wdio/cli');
  await supervisor.worker(
    {
      command: process.execPath,
      args: [fileURLToPath(new URL('../../config/launcher.cjs', import.meta.url)), pathToFileURL(launcher).href, configPath],
      cwd: config.projectRoot,
      env: { E2ETEST_PLATFORM: supervisor.target.endpoint, NATIVE_TESTING: 'false' },
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
}

function suiteDeadline(suite: DesktopWdioSuite, groups: number): number {
  // A suite deadline bounds a wedged launcher; Jasmine still enforces its independent per-test timeout.
  return Math.min(2_147_483_647, Math.max(300_000, (suite.timeoutMs ?? 60_000) * 100 * groups * ((suite.specFileRetries ?? 0) + 1)));
}
