import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { it } from 'node:test';

import { captureScript, runScript, runYarn } from './runScript.ts';

it('launches Yarn without relying on a shell-backed spawn', async () => {
  assert.equal(await runYarn('--version'), 0);
});

it('preserves a nonzero Yarn command exit status', async () => {
  assert.equal(await runYarn('node', '-e', 'process.exit(7)'), 7);
});

it('captures a package binary output and preserves argument boundaries', async () => {
  const pattern = 'test with spaces & (parentheses) "quotes"';
  const result = await captureScript('jest', ['--showConfig', '--testNamePattern', pattern]);
  assert.equal(result.code, 0);
  assert.equal(JSON.parse(result.stdout).globalConfig.testNamePattern, pattern);
});

it('checks markdown with native paths without shell interpretation', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'furn link check & '));
  try {
    const config = path.join(directory, 'config file.json');
    const markdown = path.join(directory, 'file (links).md');
    await writeFile(config, '{}');
    await writeFile(markdown, '[Local file](./target.md)\n');
    await writeFile(path.join(directory, 'target.md'), '# Target\n');
    assert.equal(await runScript('markdown-link-check', ['-c', config, markdown]), 0);
    await writeFile(markdown, '[Missing file](./missing.md)\n');
    assert.notEqual(await runScript('markdown-link-check', ['-c', config, markdown]), 0);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
