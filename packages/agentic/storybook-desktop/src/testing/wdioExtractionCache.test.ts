import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { WdioExtractionCache } from './wdioExtractionCache.js';

let root: string;
let sourceFile: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-extraction-cache-'));
  sourceFile = path.join(root, 'fixture.stories.ts');
});

afterEach(() => fs.rmSync(root, { force: true, recursive: true }));

test('shares the complete export map within its owner, never across independently owned runs', () => {
  fs.writeFileSync(sourceFile, `export const First = { wdio: () => 'first' }; export const Second = { wdio: () => 'second' };`);
  const cache = new WdioExtractionCache();
  const initial = cache.read(sourceFile);
  expect([...initial.tests.keys()]).toEqual(['First', 'Second']);
  const reused = cache.read(sourceFile);
  expect(reused.cacheHit).toBe(true);
  expect(reused.tests.get('Second')).toEqual(initial.tests.get('Second'));
  expect(new WdioExtractionCache().read(sourceFile).cacheHit).toBe(false);
});

test('rechecks source content despite unchanged size and mtime and rejects newly invalid descriptors', () => {
  const cache = new WdioExtractionCache();
  fs.writeFileSync(sourceFile, `export const First = { wdio: () => 'first' };`);
  fs.utimesSync(sourceFile, 1_700_000_000, 1_700_000_000);
  const initial = cache.read(sourceFile);
  const stat = fs.statSync(sourceFile);
  fs.writeFileSync(sourceFile, `export const First = { wdio: () => 'other' };`);
  fs.utimesSync(sourceFile, stat.atime, stat.mtime);
  expect(fs.statSync(sourceFile).mtimeMs).toBe(stat.mtimeMs);
  const edited = cache.read(sourceFile);
  expect(edited.cacheHit).toBe(false);
  expect(edited.tests.get('First')!.digest).not.toBe(initial.tests.get('First')!.digest);
  fs.writeFileSync(
    sourceFile,
    `import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
     export const First = { wdio: [desktopIt('case', { input: 'invalid' }, () => {})] };`,
  );
  expect(() => cache.read(sourceFile)).toThrow(/input/);
});

test('identical content in different source locations retains location-specific helper resolution', () => {
  fs.mkdirSync(path.join(root, 'other'));
  const otherSource = path.join(root, 'other', 'fixture.stories.ts');
  const source = `export const First = { wdio: async () => { await import('./helper.ts'); } };`;
  fs.writeFileSync(path.join(root, 'helper.ts'), 'export const value = 1;');
  fs.writeFileSync(path.join(root, 'other', 'helper.ts'), 'export const value = 2;');
  fs.writeFileSync(sourceFile, source);
  fs.writeFileSync(otherSource, source);
  const cache = new WdioExtractionCache();
  const first = cache.read(sourceFile);
  const other = cache.read(otherSource);
  expect(other.cacheHit).toBe(false);
  expect(other.tests.get('First')!.tests[0].code).not.toBe(first.tests.get('First')!.tests[0].code);
});
