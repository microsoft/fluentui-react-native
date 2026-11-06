import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { formatDesktopStorybookError, writeDesktopStorybookFailure } from '../../config/diagnostics.cjs';
import { normalizeLegacyTestReporter } from './createDesktopStorybookCommand';

describe('pipeline failure diagnostics', () => {
  test('persists the selected endpoint and renderer in the canonical CLI report', () => {
    const root = fs.mkdtempSync(path.join(path.resolve(__dirname, '../..'), '.cli-report-context-'));
    const configPath = path.join(root, 'desktop.config.mts');
    fs.writeFileSync(
      configPath,
      `
      import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';
      import { storybook } from '@fluentui-react-native/storybook-desktop/config';
      export default defineDesktopConfig({
        schemaVersion: 1,
        projectRoot: new URL('.', import.meta.url),
        targets: { win32: { host: { kind: 'rex', renderer: 'paper', component: 'Fixture', windowTitle: 'Fixture' } } },
        suites: { stories: { kind: 'csf-wdio' } },
        integration: storybook({
          storyPackages: [],
          platformOptions: { win32: { bundle: { command: process.execPath, args: ['-e', ''] } } },
        }),
      });
      `,
    );
    try {
      const response = spawnSync(
        process.execPath,
        [path.resolve(__dirname, '../../config/cli.cjs'), '--config', configPath, 'bundle', '--win32'],
        {
          cwd: root,
          encoding: 'utf8',
          timeout: 20_000,
        },
      );
      if (response.status !== 0) throw new Error(response.stderr || response.stdout || String(response.error));
      const artifacts = path.join(root, 'artifacts', 'desktop');
      const runs = fs.readdirSync(artifacts);
      expect(runs).toHaveLength(1);
      expect(JSON.parse(fs.readFileSync(path.join(artifacts, runs[0], 'run.json'), 'utf8'))).toMatchObject({
        kind: 'lifecycle',
        status: 'passed',
        context: { endpoint: 'win32', renderer: 'paper' },
      });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test.each(['spec', 'tap', 'dot'])('normalizes the legacy test reporter alias: %s', (reporter) => {
    expect(normalizeLegacyTestReporter(['node', 'storybook', 'test', '--reporter', reporter])).toEqual({
      argv: ['node', 'storybook', 'test', '--test-reporter', reporter],
      deprecated: true,
    });
  });

  test('leaves global reporter modes and unrelated commands unchanged', () => {
    const argv = ['node', 'storybook', '--reporter', 'json', 'manifest', '--macos'];
    expect(normalizeLegacyTestReporter(argv)).toEqual({ argv, deprecated: false });
  });

  test('preserves aggregate errors, nested causes, stacks and non-Error throws without truncation', () => {
    const error = new AggregateError(
      [
        new Error('story navigation failed', { cause: new Error('preview did not mount') }),
        ...Array.from({ length: 120 }, (_, index) => new Error(`failed-test-${index}`)),
      ],
      'Smoke failed',
    );
    const diagnostic = formatDesktopStorybookError(error);
    expect(diagnostic).toContain('Smoke failed');
    expect(diagnostic).toContain('story navigation failed');
    expect(diagnostic).toContain('preview did not mount');
    expect(diagnostic).toContain('failed-test-119');
    expect(diagnostic).toContain('diagnostics.test');
    expect(diagnostic).not.toContain('\u001b[');
    expect(formatDesktopStorybookError('plain failure')).toBe('plain failure');
    const circular = new Error('circular');
    circular.cause = circular;
    expect(formatDesktopStorybookError(circular)).toContain('Circular');
  });

  test('labels failure output with the story and phase', () => {
    const output = { write: jest.fn() };
    writeDesktopStorybookFailure('navigation "components-button--default"', new Error('render failed'), output);
    expect(output.write).toHaveBeenCalledWith(expect.stringContaining('[storybook] FAIL navigation "components-button--default"'));
    expect(output.write).toHaveBeenCalledWith(expect.stringContaining('render failed'));
  });

  test.each(['cli.cjs', 'server-cli.cjs'])('%s prints nested failures to stderr and exits nonzero', async (entrypoint) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-cli-errors-'));
    const configPath = path.join(root, 'storybook.config.mjs');
    fs.writeFileSync(
      configPath,
      `
      throw new AggregateError([
        new Error('components-button--default navigation failed', { cause: new Error('preview did not mount') }),
        new Error('session cleanup failed'),
      ], 'Smoke failed');
    `,
    );
    try {
      const response = await new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve, reject) => {
        const args = ['--config', configPath, ...(entrypoint === 'cli.cjs' ? ['test', '--macos', '--list'] : ['--macos'])];
        const child = spawn(process.execPath, [path.resolve(__dirname, '../../config', entrypoint), ...args], {
          cwd: root,
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        const stdout: Buffer[] = [];
        const stderr: Buffer[] = [];
        child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
        child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
        child.once('error', reject);
        child.once('close', (code) =>
          resolve({ code, stdout: Buffer.concat(stdout).toString('utf8'), stderr: Buffer.concat(stderr).toString('utf8') }),
        );
      });
      expect(response.code).toBe(1);
      expect(response.stdout).toBe('');
      expect(response.stderr).toContain('[storybook] FAIL');
      expect(response.stderr).toContain('components-button--default navigation failed');
      expect(response.stderr).toContain('preview did not mount');
      expect(response.stderr).toContain('session cleanup failed');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test.each([
    ['usage', ['test', '--macos', '--reporter', 'json', '--unknown']],
    ['config', ['--reporter', 'json', '--config', 'missing-storybook.config.mjs', 'manifest', '--macos']],
  ])('emits one structured %s error without stderr', async (_kind, args) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-cli-structured-error-'));
    try {
      const response = await new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve, reject) => {
        const child = spawn(process.execPath, [path.resolve(__dirname, '../../config/cli.cjs'), ...args], {
          cwd: root,
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        const stdout: Buffer[] = [];
        const stderr: Buffer[] = [];
        child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
        child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
        child.once('error', reject);
        child.once('close', (code) =>
          resolve({ code, stdout: Buffer.concat(stdout).toString('utf8'), stderr: Buffer.concat(stderr).toString('utf8') }),
        );
      });
      expect(response.code).toBe(1);
      expect(response.stderr).toBe('');
      expect(JSON.parse(response.stdout)).toMatchObject({
        schemaVersion: 1,
        type: 'error',
        error: { code: _kind },
      });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
