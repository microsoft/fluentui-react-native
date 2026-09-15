import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Writable } from 'node:stream';

import { NodeDesktopCommandRunner, type PreparedDesktopCommand } from './commandRunner.js';

function capture() {
  const chunks: Buffer[] = [];
  return {
    write: jest.fn((chunk: string | Uint8Array) => {
      chunks.push(Buffer.from(chunk));
      return true;
    }),
    text: () => Buffer.concat(chunks).toString('utf8'),
  };
}

describe('ordered command output', () => {
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-command-output-'));
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  function command(source: string, label = 'fixture command'): PreparedDesktopCommand {
    return { command: process.execPath, args: ['-e', source], cwd: root, env: {}, label };
  }
  const mixedOutput = "process.stdout.write('out-1\\n'); process.stderr.write('err-1\\n'); process.stdout.write('out-2\\n');";

  test('writes both streams continuously to one log and suppresses successful command output', async () => {
    const output = capture();
    const errorOutput = capture();
    const runner = new NodeDesktopCommandRunner({ output, errorOutput, verbose: false });
    await runner.run(command(mixedOutput));
    const directory = path.join(root, 'artifacts/storybook-commands');
    const files = fs.readdirSync(directory);
    expect(files).toHaveLength(1);
    expect(fs.readFileSync(path.join(directory, files[0]), 'utf8')).toContain('out-1\nerr-1\nout-2\n');
    expect(output.text()).toContain('[storybook] OK fixture command');
    expect(output.text()).not.toContain('out-1\n');
    expect(errorOutput.text()).toBe('');
  });

  test('replays the complete ordered log to stderr on failure exactly once', async () => {
    const output = capture();
    const errorOutput = capture();
    const runner = new NodeDesktopCommandRunner({ output, errorOutput, verbose: false });
    await expect(runner.run(command(`${mixedOutput} process.exitCode = 7;`))).rejects.toThrow('exited with code 7');
    expect(errorOutput.text()).toContain('out-1\nerr-1\nout-2\n');
    expect(errorOutput.text()).toContain('[storybook] FAIL fixture command (exit 7; log:');
    expect(errorOutput.text().match(/\[storybook\] BEGIN/g)).toHaveLength(1);
    expect(output.text()).not.toContain('[storybook] OK');
  });

  test('verbose mode replays successful command output', async () => {
    const output = capture();
    const runner = new NodeDesktopCommandRunner({ output, errorOutput: capture(), verbose: true });
    await runner.run(command(mixedOutput));
    expect(output.text()).toContain('out-1\nerr-1\nout-2\n');
    expect(output.text()).toContain('[storybook] BEGIN fixture command');
    expect(output.text()).toContain('[storybook] END fixture command');
    expect(output.text()).toContain('[storybook] OK fixture command');
  });

  test('retains live logs and replays them when an owner stops a command after failure', async () => {
    const output = capture();
    const errorOutput = capture();
    const runner = new NodeDesktopCommandRunner({ output, errorOutput, verbose: false });
    const running = runner.start(command("process.stdout.write('live-log\\n'); setInterval(() => {}, 1000);"));
    try {
      const deadline = Date.now() + 5000;
      while (!fs.readFileSync(running.logPath!, 'utf8').includes('\nlive-log\n')) {
        if (Date.now() > deadline) throw new Error('The running command did not write its live output.');
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      expect(output.text()).not.toContain('live-log\n');
      await running.stop({ failed: true });
      expect(errorOutput.text()).toContain('\nlive-log\n');
      expect(errorOutput.text()).toContain('[storybook] FAIL fixture command (stopped; log:');
    } finally {
      await running.stop();
    }
  });

  test('does not interleave replay groups from concurrent commands', async () => {
    const chunks: Buffer[] = [];
    const errorOutput = new Writable({
      highWaterMark: 1,
      write(chunk, _encoding, callback) {
        setTimeout(() => {
          chunks.push(Buffer.from(chunk));
          callback();
        }, 1);
      },
    });
    const runner = new NodeDesktopCommandRunner({ output: capture(), errorOutput, verbose: false });
    await Promise.allSettled([
      runner.run(command("process.stdout.write('first-out\\n'); process.stderr.write('first-err\\n'); process.exitCode=1;", 'first')),
      runner.run(command("process.stdout.write('second-out\\n'); process.stderr.write('second-err\\n'); process.exitCode=1;", 'second')),
    ]);
    const log = Buffer.concat(chunks).toString('utf8');
    for (const [label, other] of [
      ['first', 'second'],
      ['second', 'first'],
    ]) {
      const group = log.slice(log.indexOf(`[storybook] BEGIN ${label}\n`), log.indexOf(`[storybook] END ${label}\n`));
      expect(group).toContain(`${label}-out\n${label}-err\n`);
      expect(group).not.toContain(`${other}-out\n`);
    }
    errorOutput.destroy();
  });

  test('reports process startup errors and keeps the command log', async () => {
    const errorOutput = capture();
    const runner = new NodeDesktopCommandRunner({ output: capture(), errorOutput, verbose: false });
    await expect(runner.run({ ...command(''), command: path.join(root, 'missing-executable') })).rejects.toThrow();
    expect(errorOutput.text()).toContain('[storybook] FAIL fixture command');
    expect(errorOutput.text()).toMatch(/ENOENT|not recognized|cannot find/i);
    expect(fs.readdirSync(path.join(root, 'artifacts/storybook-commands'))).toHaveLength(1);
  });
});
