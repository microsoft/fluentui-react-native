import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { formatDesktopStorybookError, writeDesktopStorybookFailure } from '../../config/diagnostics.cjs';

describe('pipeline failure diagnostics', () => {
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
});
