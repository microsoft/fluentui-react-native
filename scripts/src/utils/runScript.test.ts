import assert from 'node:assert/strict';
import { it } from 'node:test';

import { captureScript, runYarn } from './runScript.ts';

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
