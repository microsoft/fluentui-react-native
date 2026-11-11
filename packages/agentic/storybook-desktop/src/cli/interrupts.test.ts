import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

jest.setTimeout(30_000);

// Constant config: the stage command ignores SIGTERM, so only the CLI's second-interrupt escalation can stop it before the
// runner's 10-second graceful-stop deadline. Paths are derived at runtime, never spliced into the source (R-SCAN-002).
const config = `
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const fixture = "process.on('SIGTERM', () => {}); require('node:fs').writeFileSync(process.argv[1], String(process.pid)); setInterval(() => {}, 1000);";
export default {
  projectRoot,
  getStorybookConfig: () => ({}),
  getPlatformOptions: () => ({}),
  getStoryPackages: () => [],
  getCommandPlan: () => ({ command: process.execPath, args: ['-e', fixture, path.join(projectRoot, 'stage.pid')] }),
  getSmokeOptions: () => false,
  getNativeDriverOptions: () => undefined,
  resolvePackage: () => projectRoot,
};
`;

const posixTest = process.platform === 'win32' ? test.skip : test;

describe('storybook CLI interrupts', () => {
  posixTest.each([
    ['SIGINT', 'SIGINT'],
    ['SIGHUP', 'SIGTERM'],
  ] as const)(
    'keeps handling interrupts during cleanup: %s then %s force-stops the stage and reports the run incomplete',
    async (first, second) => {
      const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-cli-interrupts-')));
      const configPath = path.join(root, 'storybook.config.mjs');
      const markerPath = path.join(root, 'stage.pid');
      fs.writeFileSync(configPath, config);
      let stagePid: number | undefined;
      const child = spawn(
        process.execPath,
        [path.resolve(__dirname, '../../config/cli.cjs'), '--config', configPath, 'bundle', '--macos'],
        {
          cwd: root,
          env: { ...process.env, DESKTOP_REPORTER: 'plain' },
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );
      const output: Buffer[] = [];
      child.stdout.on('data', (chunk: Buffer) => output.push(chunk));
      child.stderr.on('data', (chunk: Buffer) => output.push(chunk));
      const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) =>
        child.once('exit', (code, signal) => resolve({ code, signal })),
      );
      try {
        await waitUntil(() => fs.existsSync(markerPath) && fs.readFileSync(markerPath, 'utf8').length > 0);
        stagePid = Number(fs.readFileSync(markerPath, 'utf8'));
        child.kill(first);
        // The stage ignores the graceful stop, so cleanup is still waiting on it when the second interrupt arrives.
        await new Promise((resolve) => setTimeout(resolve, 500));
        expect(isAlive(stagePid)).toBe(true);
        const escalated = Date.now();
        child.kill(second);
        const result = await exited;
        const text = Buffer.concat(output).toString('utf8');
        expect(result).toEqual({ code: 1, signal: null });
        expect(text).toContain('force-stopping owned commands');
        expect(text).toContain('[desktop] INCOMPLETE: lifecycle');
        expect(Date.now() - escalated).toBeLessThan(8_000);
        await waitUntil(() => !isAlive(stagePid!));
      } finally {
        if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
        if (stagePid && isAlive(stagePid)) process.kill(stagePid, 'SIGKILL');
        fs.rmSync(root, { force: true, recursive: true, maxRetries: 20, retryDelay: 100 });
      }
    },
  );
});

function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

async function waitUntil(condition: () => boolean, timeoutMs = 15_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error('Timed out waiting for the condition.');
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}
