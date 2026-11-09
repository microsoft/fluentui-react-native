import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { NodeDesktopCommandRunner as SharedRunner } from '@fluentui-react-native/desktop-test/commands';
import { NodeDesktopCommandRunner, type PreparedDesktopCommand } from './commandRunner.js';

describe('shared command output', () => {
  // These cases check local console output; on a GitHub Actions runner the owned reporter would otherwise group it.
  const consoleEnvironment = ['GITHUB_ACTIONS', 'DESKTOP_REPORTER'] as const;
  let savedEnvironment: Partial<Record<(typeof consoleEnvironment)[number], string>>;
  let root: string;
  beforeEach(() => {
    savedEnvironment = {};
    for (const name of consoleEnvironment) {
      savedEnvironment[name] = process.env[name];
      delete process.env[name];
    }
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-command-output-'));
  });
  afterEach(() => {
    for (const name of consoleEnvironment) {
      if (savedEnvironment[name] === undefined) delete process.env[name];
      else process.env[name] = savedEnvironment[name];
    }
    fs.rmSync(root, { recursive: true, force: true });
  });

  function command(source: string): PreparedDesktopCommand {
    return { command: process.execPath, args: ['-e', source], cwd: root, env: {}, label: 'fixture command' };
  }

  test('uses the neutral command runner rather than a Storybook lifecycle copy', () => {
    expect(NodeDesktopCommandRunner).toBe(SharedRunner);
  });

  function collect(options: { verbose?: boolean } = {}) {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const runner = new NodeDesktopCommandRunner({
      ...options,
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
    return { runner, stdout: () => stdout.join(''), stderr: () => stderr.join('') };
  }

  function onlyRun() {
    const runs = path.join(root, 'artifacts', 'desktop-commands');
    return path.join(runs, fs.readdirSync(runs)[0]);
  }

  test('retains attributed logs and reports only the outcome of a passing command without verbose', async () => {
    const { runner, stdout, stderr } = collect();
    try {
      await runner.run(command("process.stdout.write('information\\n');process.stderr.write('diagnostic\\n');"));
    } finally {
      await runner.close();
    }
    expect(stdout()).toContain('✔ fixture command');
    expect(stdout()).not.toContain('information');
    expect(stderr()).not.toContain('diagnostic');
    const run = onlyRun();
    const log = path.join(run, 'commands', fs.readdirSync(path.join(run, 'commands'))[0]);
    expect(fs.readFileSync(log, 'utf8')).toContain('[stdout] information');
    expect(fs.readFileSync(log, 'utf8')).toContain('[stderr] diagnostic');
    expect(JSON.parse(fs.readFileSync(path.join(run, 'run.json'), 'utf8')).status).toBe('passed');
  });

  test('streams command output live under the command name with verbose', async () => {
    const { runner, stdout, stderr } = collect({ verbose: true });
    try {
      await runner.run(command("process.stdout.write('information\\n');process.stderr.write('diagnostic\\n');"));
    } finally {
      await runner.close();
    }
    expect(stdout()).toContain('[fixture command] stdout: information');
    expect(stderr()).toContain('[fixture command] stderr: diagnostic');
  });

  test('shows the end of the log under the header of a failed command', async () => {
    const { runner, stdout, stderr } = collect();
    try {
      await expect(runner.run(command("process.stderr.write('diagnostic\\n');process.exitCode=7;"))).rejects.toThrow('exited with code 7');
    } finally {
      await runner.close();
    }
    expect(stderr()).toContain('✖ fixture command');
    expect(stderr()).toContain('exit code 7');
    expect(stderr()).toContain('[stderr] diagnostic');
    expect(stderr()).toContain('Full log:');
    expect(stdout()).not.toContain('diagnostic');
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
