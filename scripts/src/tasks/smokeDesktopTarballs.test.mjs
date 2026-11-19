import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const smoke = fileURLToPath(new URL('./smokeDesktopTarballs.mts', import.meta.url));

/** @param {import('node:test').TestContext} t */
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-smoke-fixture-'));
  t.after(() => fs.rmSync(root, { force: true, recursive: true, maxRetries: 5 }));
  const staging = path.join(root, 'staging');
  const pkg = path.join(staging, 'package');
  const packed = path.join(root, 'packed');
  fs.mkdirSync(pkg, { recursive: true });
  fs.mkdirSync(path.join(packed, '01'), { recursive: true });

  return {
    pack(extra = {}) {
      fs.writeFileSync(
        path.join(pkg, 'package.json'),
        JSON.stringify({
          name: '@fluentui-react-native/desktop-test',
          version: '0.4.0',
          type: 'module',
          exports: { '.': './index.js', './package.json': './package.json' },
          bin: './cli.cjs',
          scripts: { postinstall: 'node missing-install-hook.js' },
          ...extra,
        }),
      );
      fs.writeFileSync(path.join(pkg, 'index.js'), 'export const present = true;\n');
      fs.writeFileSync(
        path.join(pkg, 'cli.cjs'),
        "if (process.argv[2] !== '--help') process.exit(1); console.error('Usage: desktop-test');\n",
      );
      fs.writeFileSync(path.join(pkg, 'service.cjs'), "throw new Error('The service bootstrap is not a library');\n");
      const archive = path.join(packed, '01', 'fluentui-react-native-desktop-test-0.4.0.tgz');
      const result = spawnSync('tar', ['-czf', archive, 'package'], { cwd: staging, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
    },
    smoke() {
      return spawnSync(process.execPath, [smoke, packed], { encoding: 'utf8', timeout: 60_000 });
    },
  };
}

test('clean-installs the packed package without running install hooks and checks exports and CLI help', (t) => {
  const input = fixture(t);
  input.pack({ exports: { '.': './index.js', './package.json': './package.json', './service': './service.cjs' } });
  const result = input.smoke();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /desktop-test@0\.4\.0: 2 imports, 1 CLI help checks, service bootstrap resolved/);
});

test('fails when an exported entry point is missing from the installed tarball', (t) => {
  const input = fixture(t);
  input.pack({ exports: { '.': './index.js', './supervisor-connection': './missing.js' } });
  const result = input.smoke();
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stderr, /Import @fluentui-react-native\/desktop-test\/supervisor-connection/);
});
