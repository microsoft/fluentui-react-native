import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { NodeDesktopCommandRunner as SharedRunner } from '@fluentui-react-native/desktop-test/commands';
import { NodeDesktopCommandRunner, type PreparedDesktopCommand } from './commandRunner.js';

describe('shared command output', () => {
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-command-output-'));
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  function command(source: string): PreparedDesktopCommand {
    return { command: process.execPath, args: ['-e', source], cwd: root, env: {}, label: 'fixture command' };
  }

  test('uses the neutral command runner rather than a Storybook lifecycle copy', () => {
    expect(NodeDesktopCommandRunner).toBe(SharedRunner);
  });

  test('retains attributed logs and forwards stderr without verbose', async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const runner = new NodeDesktopCommandRunner({
      output: {
        write: (text) => {
          stdout.push(String(text));
          return true;
        },
      },
      errorOutput: {
        write: (text) => {
          stderr.push(String(text));
          return true;
        },
      },
    });
    try {
      await runner.run(command("process.stdout.write('information\\n');process.stderr.write('diagnostic\\n');"));
    } finally {
      await runner.close();
    }
    expect(stderr.join('')).toContain('stderr: diagnostic');
    expect(stdout.join('')).not.toContain('stdout: information');
    const runs = path.join(root, 'artifacts', 'desktop-commands');
    const run = path.join(runs, fs.readdirSync(runs)[0]);
    const log = path.join(run, 'commands', fs.readdirSync(path.join(run, 'commands'))[0]);
    expect(fs.readFileSync(log, 'utf8')).toContain('[stdout] information');
    expect(fs.readFileSync(log, 'utf8')).toContain('[stderr] diagnostic');
    expect(JSON.parse(fs.readFileSync(path.join(run, 'run.json'), 'utf8')).status).toBe('passed');
  });

  test('keeps the original command failure in the shared result', async () => {
    const runner = new NodeDesktopCommandRunner({ output: { write: () => true }, errorOutput: { write: () => true } });
    try {
      await expect(runner.run(command('process.exitCode=7;'))).rejects.toThrow('exited with code 7');
    } finally {
      await runner.close();
    }
    const runs = path.join(root, 'artifacts', 'desktop-commands');
    const result = JSON.parse(fs.readFileSync(path.join(runs, fs.readdirSync(runs)[0], 'run.json'), 'utf8'));
    expect(result.status).toBe('failed');
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].error.message).toContain('exited with code 7');
  });
});
