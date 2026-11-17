import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, test } from 'node:test';

import { installSuite } from './install.mjs';

const roots = [];
const hash = (text) => createHash('sha256').update(text).digest('hex');
const skill =
  '# Author\n\nRead [context](../../references/shared/context.md) and [catalog](../../catalog/packages.json).\n\n[extra][context-ref]\n[context-ref]: ../../references/shared/context.md\n\n```md\n[example](../../references/example.md)\n```\n';

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'furn-skills-'));
  roots.push(root);
  const source = path.join(root, 'suite');
  const project = path.join(root, 'consumer');
  mkdirSync(project);
  const files = {
    'skills/furn-author/SKILL.md': skill,
    'references/shared/context.md': '# Shared\n',
    'catalog/packages.json': '{"packages":[]}\n',
  };
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(source, file)), { recursive: true });
    writeFileSync(path.join(source, file), text);
  }
  writeFileSync(
    path.join(source, 'provenance.json'),
    JSON.stringify({
      schema_version: 1,
      package: '@fluentui-react-native/skills',
      version: '0.1.0',
      files: Object.entries(files).map(([file, text]) => ({ path: file, sha256: hash(text) })),
    }),
  );
  return { root, source, project };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

test('materializes the suite for each client with readable shared links and no symlinks', () => {
  for (const client of ['copilot', 'codex', 'claude']) {
    const { source, project } = fixture();
    const { directory, skills } = installSuite(source, project, client);
    assert.equal(skills, 1);
    assert.equal(path.basename(directory), client === 'claude' ? '.claude' : '.agents');
    const entry = path.join(directory, 'skills/furn-author/SKILL.md');
    const text = readFileSync(entry, 'utf8');
    assert.ok(text.includes('../../furn/references/shared/context.md'));
    assert.ok(text.includes('[context-ref]: ../../furn/references/shared/context.md'));
    assert.ok(text.includes('[example](../../references/example.md)'));
    assert.equal(readFileSync(path.resolve(path.dirname(entry), '../../furn/references/shared/context.md'), 'utf8'), '# Shared\n');
    assert.ok(existsSync(path.resolve(path.dirname(entry), '../../furn/catalog/packages.json')));
    assert.doesNotThrow(() => installSuite(source, project, client));
  }
});

test('preflights all collisions before creating any other output', () => {
  const { source, project } = fixture();
  const collision = path.join(project, '.agents/furn/catalog/packages.json');
  mkdirSync(path.dirname(collision), { recursive: true });
  writeFileSync(collision, 'owned by another tool');
  assert.throws(() => installSuite(source, project, 'codex'), /unmanaged or modified/);
  assert.equal(existsSync(path.join(project, '.agents/skills/furn-author/SKILL.md')), false);
  assert.equal(readFileSync(collision, 'utf8'), 'owned by another tool');
});

test('updates unchanged owned files but refuses user edits and preserves unrelated files', () => {
  const { source, project } = fixture();
  const { directory } = installSuite(source, project, 'copilot');
  const unrelated = path.join(directory, 'skills/other.md');
  writeFileSync(unrelated, 'keep');
  const recordPath = path.join(source, 'provenance.json');
  const record = JSON.parse(readFileSync(recordPath, 'utf8'));
  const changed = '# Updated shared guidance\n';
  writeFileSync(path.join(source, 'references/shared/context.md'), changed);
  record.files.find((entry) => entry.path === 'references/shared/context.md').sha256 = hash(changed);
  writeFileSync(recordPath, JSON.stringify(record));
  installSuite(source, project, 'codex');
  assert.equal(readFileSync(path.join(directory, 'furn/references/shared/context.md'), 'utf8'), changed);
  assert.equal(readFileSync(unrelated, 'utf8'), 'keep');
  writeFileSync(path.join(directory, 'skills/furn-author/SKILL.md'), 'local customization');
  assert.throws(() => installSuite(source, project, 'copilot'), /unmanaged or modified/);
});

test('rejects modified source payloads and symlinked destinations', () => {
  const { root, source, project } = fixture();
  writeFileSync(path.join(source, 'references/shared/context.md'), 'tampered');
  assert.throws(() => installSuite(source, project, 'claude'), /checksum mismatch/);
  assert.equal(existsSync(path.join(project, '.claude')), false);
  const second = fixture();
  symlinkSync(second.project, path.join(project, '.agents'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => installSuite(second.source, project, 'codex'), /symlinked/);
  assert.equal(existsSync(path.join(second.project, 'skills')), false);
  assert.ok(existsSync(root));
});

test('executes the CLI through package-manager symlink paths', () => {
  const { root } = fixture();
  const link = path.join(root, 'bin-directory');
  symlinkSync(fileURLToPath(new URL('./', import.meta.url)), link, process.platform === 'win32' ? 'junction' : 'dir');
  const output = execFileSync(process.execPath, [path.join(link, 'install.mjs'), '--help'], { encoding: 'utf8' });
  assert.match(output, /Usage: furn-skills --client/);
});
