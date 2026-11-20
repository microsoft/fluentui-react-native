import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, type TestContext } from 'node:test';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('./cli.js', import.meta.url));

function fixture(t: TestContext) {
  const cwd = mkdtempSync(join(tmpdir(), 'extract-icons-'));
  t.after(() => rmSync(cwd, { force: true, recursive: true }));
  return {
    cwd,
    run: (...args: string[]) => spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' }),
    read: (path: string) => readFileSync(join(cwd, path), 'utf8'),
  };
}

test('accepts and deduplicates component, alias, and catalog names for the same icon', (t) => {
  const { run, read } = fixture(t);
  const result = run('-o', 'generated/icons.tsx', 'AccessTime20Regular', 'access_time_20_regular', 'AccessTimeRegular', 'Fps12020Regular');
  assert.equal(result.status, 0, result.stderr);
  const source = read('generated/icons.tsx');
  assert.match(source, /from "@fluentui\/react-native-icons\/utils"/);
  assert.match(source, /export const AccessTimeRegular = /);
  assert.equal([...source.matchAll(/export const AccessTime20Regular = /g)].length, 1);
  assert.match(source, /export const Fps12020Regular = /);
});

test('accepts a single JSON job alongside unrelated settings', (t) => {
  const { cwd, run, read } = fixture(t);
  writeFileSync(join(cwd, 'shared.json'), JSON.stringify({ other: true, extractIcons: { output: 'icons.tsx', icons: ['add_24_filled'] } }));
  const result = run('--config', 'shared.json');
  assert.equal(result.status, 0, result.stderr);
  assert.match(read('icons.tsx'), /export const Add24Filled = /);
});

test('loads a CommonJS config with multiple jobs relative to the config file', (t) => {
  const { cwd, run, read } = fixture(t);
  mkdirSync(join(cwd, 'config'));
  writeFileSync(
    join(cwd, 'config', 'shared.cjs'),
    `module.exports = {
      extractIcons: [
        { output: '../generated/common.tsx', icons: ['AccessTime20Regular'] },
        { output: 'actions.tsx', icons: ['add_24_filled'] },
      ],
    };`,
  );
  const result = run('--config', 'config/shared.cjs');
  assert.equal(result.status, 0, result.stderr);
  assert.match(read('generated/common.tsx'), /export const AccessTime20Regular = /);
  assert.doesNotMatch(read('generated/common.tsx'), /export const Add24Filled = /);
  assert.match(read('config/actions.tsx'), /export const Add24Filled = /);
});

test('loads a default-exported TypeScript config with Node require', (t) => {
  const { cwd, run, read } = fixture(t);
  writeFileSync(
    join(cwd, 'shared.ts'),
    `const icons: string[] = ['access_time_20_regular'];
    export default { extractIcons: { output: 'icons.tsx', icons } };`,
  );
  const result = run('-c', 'shared.ts');
  assert.equal(result.status, 0, result.stderr);
  assert.match(read('icons.tsx'), /export const AccessTime20Regular = /);
});

test('reports a missing icon before writing any file in the batch', (t) => {
  const { cwd, run } = fixture(t);
  writeFileSync(
    join(cwd, 'shared.json'),
    JSON.stringify({
      extractIcons: [
        { output: 'valid.tsx', icons: ['access_time_20_regular'] },
        { output: 'invalid.tsx', icons: ['NonexistentIcon24Regular'] },
      ],
    }),
  );
  const result = run('--config', 'shared.json');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Cannot generate .*invalid\.tsx: Unknown icon component "NonexistentIcon24Regular"/);
  assert.equal(existsSync(join(cwd, 'valid.tsx')), false);
  assert.equal(existsSync(join(cwd, 'invalid.tsx')), false);
});

test('rejects invalid arguments, unnamed settings, and output collisions', (t) => {
  const { cwd, run } = fixture(t);
  writeFileSync(join(cwd, 'missing.json'), '{"output":"icons.tsx","icons":["add_24_filled"]}');
  writeFileSync(
    join(cwd, 'duplicate.json'),
    JSON.stringify({
      extractIcons: [
        { output: 'icons.tsx', icons: ['add_24_filled'] },
        { output: './icons.tsx', icons: ['access_time_20_regular'] },
      ],
    }),
  );
  for (const [args, diagnostic] of [
    [['--output', 'icons.tsx', '../access_time_20_regular'], /without a path or extension/],
    [['--output', 'icons.tsx'], /non-empty array/],
    [['--output', 'icons.ts', 'access_time_20_regular'], /ending in .tsx/],
    [['--config', 'missing.json'], /"extractIcons" must contain/],
    [['--config', 'duplicate.json'], /Duplicate output path/],
    [['--config', 'missing.json', '--output', 'icons.tsx'], /cannot be combined/],
  ] as const) {
    const result = run(...args);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, diagnostic);
  }
  assert.equal(existsSync(join(cwd, 'icons.tsx')), false);
});
