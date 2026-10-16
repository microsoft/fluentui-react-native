import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const packageRoot = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'));
const entrypoints = [
  ['.', 'index'],
  ['./legacy', 'legacy/index'],
  ['./macos', 'macos/index'],
  ['./windows', 'windows/index'],
  ['./win', 'win/index'],
  ['./win32', 'win32/index'],
];

test('declares exactly the six public entrypoints and package metadata', () => {
  assert.equal(manifest.name, '@fluentui-react-native/native-core');
  assert.deepEqual(Object.keys(manifest.exports), [...entrypoints.map(([entrypoint]) => entrypoint), './package.json']);
  assert.equal(manifest.exports['./package.json'], './package.json');
  assert.equal(manifest.main, 'lib/index.js');
  assert.equal(manifest.module, 'lib/index.js');
  assert.equal(manifest.types, 'lib/index.d.ts');
});

test('the root entrypoint does not expose or initialize legacy components', async () => {
  const root = await import('@fluentui-react-native/native-core');
  assert.ok(!('Callout' in root));
  assert.ok(!('FocusZone' in root));
  assert.ok(!('calloutName' in root));
  assert.ok(!('focusZoneName' in root));
});

for (const [entrypoint, path] of entrypoints) {
  test(`${entrypoint} has distinct source, JavaScript, and declaration targets`, async () => {
    const expected = {
      types: `./lib/${path}.d.ts`,
      'react-native': `./src/${path}.ts`,
      import: `./lib/${path}.js`,
      default: `./src/${path}.ts`,
    };
    assert.deepEqual(manifest.exports[entrypoint], expected);
    assert.deepEqual(Object.keys(manifest.exports[entrypoint]), Object.keys(expected));
    await Promise.all(Object.values(expected).map((target) => access(new URL(target, packageRoot))));
  });
}

for (const condition of ['import', 'react-native', 'types']) {
  test(`${condition} resolution selects the correct public entrypoints`, () => {
    const specifiers = entrypoints.map(([entrypoint]) => manifest.name + (entrypoint === '.' ? '' : entrypoint.slice(1)));
    const script = `console.log(JSON.stringify(${JSON.stringify(specifiers)}.map((specifier) => import.meta.resolve(specifier))))`;
    const args = condition === 'import' ? [] : [`--conditions=${condition}`];
    const result = spawnSync(process.execPath, [...args, '--input-type=module', '--eval', script], {
      cwd: fileURLToPath(packageRoot),
      encoding: 'utf8',
    });

    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(
      JSON.parse(result.stdout),
      entrypoints.map(([entrypoint]) => new URL(manifest.exports[entrypoint][condition], packageRoot).href),
    );
  });
}
