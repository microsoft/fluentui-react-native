/**
 * Host-side desktop test service for the on-device Storybook controls.
 *
 * Starts the loopback run service, then executes each requested story through a normal
 * WebdriverIO run using the same `wdio.conf.ts` a developer runs by hand. The service selects an
 * allowlisted spec and an exact Mocha grep from the generated manifest; it never accepts a
 * command line or module path from the application.
 *
 * Usage:
 *   yarn desktop:generate           # refresh desktop-tests/generated
 *   yarn desktop:service            # prints the URL and per-boot token
 *
 * Export the printed values as DESKTOP_TEST_SERVICE_URL / DESKTOP_TEST_SERVICE_TOKEN before
 * starting Metro so the on-device controls can reach the service.
 */
import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DesktopTestService } from '@fluentui-react-native/desktop-driver/storybook';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(rootDir, '..');
const manifestPath = path.join(rootDir, 'generated', 'story-tests.manifest.json');

if (!fs.existsSync(manifestPath)) {
  process.stderr.write(`Missing ${manifestPath}. Run "yarn desktop:generate" first.\n`);
  process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

/** Yarn's executable name differs on Windows, and `spawn` without a shell does not resolve it. */
const yarnCommand = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';

/** Runs one story through WebdriverIO and reports whether it passed. */
function runStory(storyId, signal) {
  const entry = manifest.entries.find((candidate) => candidate.storyId === storyId);
  if (!entry) {
    return Promise.resolve({ ok: false, message: `Story "${storyId}" is not in the generated manifest` });
  }

  return new Promise((resolve) => {
    const child = spawn(yarnCommand, ['wdio', 'run', 'wdio.conf.ts', '--spec', entry.spec], {
      cwd: appDir,
      env: { ...process.env, DESKTOP_TEST_GREP: entry.grep },
      stdio: ['ignore', 'inherit', 'inherit'],
    });

    const onAbort = () => child.kill('SIGTERM');
    signal.addEventListener('abort', onAbort, { once: true });

    let settled = false;
    const finish = (result) => {
      if (settled) {
        return;
      }
      settled = true;
      signal.removeEventListener('abort', onAbort);
      resolve(result);
    };

    // Without an 'error' listener a spawn failure is an unhandled 'error' event that would kill
    // this service, and 'exit' would never fire, leaving the run reported as running forever.
    child.on('error', (error) => finish({ ok: false, message: `Failed to start WebdriverIO: ${error.message}` }));
    child.on('exit', (code) =>
      finish({ ok: code === 0, message: code === 0 ? undefined : `WebdriverIO exited with code ${String(code)}` }),
    );
  });
}

const service = new DesktopTestService({
  manifest,
  host: '127.0.0.1',
  port: Number(process.env.DESKTOP_TEST_SERVICE_PORT ?? 7017),
  execute: async (storyIds, progress, signal) => {
    const results = [];
    for (const storyId of storyIds) {
      if (signal.aborted) {
        break;
      }
      const startedAt = Date.now();
      const outcome = await runStory(storyId, signal);
      const result = {
        testId: storyId,
        storyId,
        title: storyId,
        status: outcome.ok ? 'passed' : 'failed',
        durationMs: Date.now() - startedAt,
        error: outcome.message ? { message: outcome.message } : undefined,
      };
      results.push(result);
      progress(result);
    }
    return results;
  },
});

const { url, token } = await service.start();

process.stdout.write(
  `Desktop test service listening.\n` +
    `  URL   : ${url}\n` +
    `  Token : ${token}\n\n` +
    `Start Metro with:\n` +
    `  DESKTOP_TEST_SERVICE_URL=${url} DESKTOP_TEST_SERVICE_TOKEN=${token} yarn start\n`,
);

const stop = () => {
  void service.stop().finally(() => process.exit(0));
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
