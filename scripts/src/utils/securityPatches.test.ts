import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { it } from 'node:test';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';

const store = fileURLToPath(new URL('../../../node_modules/.store/', import.meta.url));

function installedPackage(name: string, version: string, patched = true) {
  const candidates = fs
    .readdirSync(store)
    .filter((entry) => entry.startsWith(`${name}-${patched ? 'patch' : 'npm'}-`))
    .map((entry) => path.join(store, entry, 'package'))
    .filter((root) => JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version === version);
  assert.equal(candidates.length, 1, `Expected one installed ${name}@${version} (${patched ? 'patched' : 'npm'})`);
  const root = candidates[0];
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const require = createRequire(path.join(root, 'package.json'));
  return { root, manifest, require, module: require(root) };
}

it('deepmerge cannot poison a result through either input or nested placeholders', () => {
  const { root, require } = installedPackage('deepmerge', '4.3.1');
  for (const entry of ['dist/cjs.js', 'dist/umd.js']) {
    const merge = require(path.join(root, entry));
    const payload = JSON.parse('{"__proto__":{"isAdmin":true},"constructor":{"prototype":{"isAdmin":true}},"safe":1}');
    for (const target of [Object.create(null), payload, { session: null }, { session: undefined }]) {
      for (const result of [merge(target, payload), merge(payload, target), merge(target, { session: payload })]) {
        assert.equal(Object.getPrototypeOf(result), Object.prototype);
        assert.equal(result.isAdmin, undefined);
        if (result.session) {
          assert.equal(Object.getPrototypeOf(result.session), Object.prototype);
          assert.equal(result.session.isAdmin, undefined);
        }
      }
    }
    const symbol = Symbol('safe');
    assert.deepEqual(merge({ a: [1], nested: { x: 1 }, [symbol]: 1 }, { a: [2], nested: { y: 2 } }), {
      a: [1, 2],
      nested: { x: 1, y: 2 },
      [symbol]: 1,
    });
    assert.equal(Object.getOwnPropertyDescriptor(Object.prototype, 'isAdmin'), undefined);
  }
});

it('Joi multiple-email splitting is bounded and preserves separator behavior', () => {
  const { module: Joi } = installedPackage('joi', '17.13.9', false);
  const spaces = ' '.repeat(100_000);
  for (const separator of [undefined, ';', ', ']) {
    const schema = Joi.string().email({ multiple: true, separator });
    const start = performance.now();
    assert.equal(schema.validate(spaces).error.details[0].type, 'string.email');
    assert.ok(performance.now() - start < 1000, '100 KB of whitespace must not block for seconds');
  }
  assert.equal(Joi.string().email({ multiple: true }).validate('a@example.com , b@example.org').error, undefined);
  assert.equal(Joi.string().email({ multiple: true, separator: ';' }).validate('a@example.com ; b@example.org').error, undefined);
  assert.equal(Joi.string().email().validate('a@example.com').error, undefined);
});

for (const version of ['9.0.9', '10.2.6']) {
  it(`minimatch ${version} bounds optimization expansion in CommonJS and ESM`, async () => {
    const { root, manifest, module } = installedPackage('minimatch', version);
    const esm = await import(pathToFileURL(path.resolve(root, manifest.exports['.'].import.default)).href);
    for (const { Minimatch } of [module, esm]) {
      const start = performance.now();
      const matcher = new Minimatch(Array(30).fill('**/../a/b').join('/'), { optimizationLevel: 2, braceExpandMax: 64 });
      assert.equal(matcher.set.length, 64);
      assert.ok(performance.now() - start < 1000, 'Pattern expansion must remain bounded');
      const small = new Minimatch('**/../a/b/**/../c/d', { optimizationLevel: 2 });
      assert.equal(small.set.length, 4);
      assert.equal(small.match('../a/b/../c/d'), true);
      assert.equal(small.match('x/a/b/y/c/d'), true);
      const large = new Minimatch('{x,*}/{0..999}', { optimizationLevel: 2 });
      assert.equal(large.set.length, 2000);
      assert.equal(large.match('y/999'), true);
      assert.equal(large.match('.y/5'), false);
    }
  });
}

it('minimatch 3 retains its callable API and has no affected optimization phase', () => {
  const { module: minimatch } = installedPackage('minimatch', '3.1.5', false);
  assert.equal(typeof minimatch, 'function');
  assert.equal(minimatch('src/test.ts', '**/*.ts'), true);
  assert.equal(minimatch.Minimatch.prototype.firstPhasePreProcess, undefined);
  assert.equal(minimatch.Minimatch.prototype.secondPhasePreProcess, undefined);
});

it('glob stops filesystem traversal after abort in CommonJS and ESM', async (t) => {
  const { root, manifest, module } = installedPackage('glob', '13.0.6');
  const esm = await import(pathToFileURL(path.resolve(root, manifest.exports['.'].import.default)).href);
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-glob-security-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  for (let i = 0; i < 10; i++) {
    fs.mkdirSync(path.join(cwd, String(i), 'nested'), { recursive: true });
    fs.writeFileSync(path.join(cwd, String(i), 'nested', 'file'), '');
  }
  for (const glob of [module, esm]) {
    const controller = new AbortController();
    const reason = new Error('test abort');
    let reads = 0;
    const countedFs = {
      ...fs,
      readdir(...args: Parameters<typeof fs.readdir>) {
        if (++reads === 1) controller.abort(reason);
        return fs.readdir(...args);
      },
    };
    await assert.rejects(glob.glob('**', { cwd, signal: controller.signal, fs: countedFs }), reason);
    const readsAtReject = reads;
    await setTimeout(100);
    assert.equal(reads, readsAtReject);
    assert.equal(reads, 1);
    const syncController = new AbortController();
    let syncReads = 0;
    const syncFs = {
      ...fs,
      readdirSync(...args: Parameters<typeof fs.readdirSync>) {
        if (++syncReads === 1) syncController.abort(reason);
        return fs.readdirSync(...args);
      },
    };
    const abortedStream = glob.globStreamSync('**', { cwd, signal: syncController.signal, fs: syncFs });
    await new Promise<void>((resolve, reject) => {
      abortedStream.on('error', (error: unknown) => {
        if (error === reason) resolve();
        else reject(error);
      });
      abortedStream.on('end', () => reject(new Error('Aborted stream must emit an error')));
      abortedStream.resume();
    });
    assert.equal(syncReads, 1);
    const expected = new Set(glob.globSync('**', { cwd }));
    const stream = glob.globStream('**', { cwd });
    await setTimeout(50);
    const actual = [];
    for await (const entry of stream) actual.push(entry);
    assert.deepEqual(new Set(actual), expected);
  }
});
