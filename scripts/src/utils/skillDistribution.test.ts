import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';

import { checkSkillAdapters, createSkillDistribution, SKILL_PACKAGE, writeSkillDistribution } from './skillDistribution.ts';

const roots: string[] = [];
const shared = '---\nid: portable.shared\nkind: instruction-reference\nowner_paths:\n  - packages/agentic/skills\n---\n\n# Shared\n';
const sharedPath = `${SKILL_PACKAGE}/references/shared/portable/shared.md`;
const catalogPath = `${SKILL_PACKAGE}/catalog/packages.json`;
const names = ['furn-one', 'furn-two'];
const catalog = {
  schema_version: 1,
  packages: [
    {
      name: '@scope/demo',
      purpose: 'Demo components',
      entry_points: ['.'],
      integration_targets: ['macos'],
      reference_paths: ['references/guide.md'],
    },
  ],
};
const skill = (name: string) =>
  `---\nname: ${name}\ndescription: Use for demo work.\n---\n\n# Demo\n\nRead [shared](../../references/shared/portable/shared.md#shared) first.\n`;

function fixture(overrides: Record<string, string> = {}): string {
  const root = mkdtempSync(path.join(tmpdir(), 'skill-distribution-'));
  roots.push(root);
  const files: Record<string, string> = {
    [catalogPath]: JSON.stringify(catalog),
    LICENSE: 'MIT\n',
    'AGENTS.md': 'Follow R-REPO-003 and R-VALID-003.\n',
    'references/agents/repository/package-guidance-packages.json': JSON.stringify({ packages: ['packages/demo'] }),
    [`${SKILL_PACKAGE}/package.json`]: JSON.stringify({ name: '@fluentui-react-native/skills', version: '0.1.0', description: 'Skills' }),
    'packages/demo/package.json': JSON.stringify({ name: '@scope/demo', version: '1.2.3', exports: { '.': './index.js' } }),
    'packages/demo/references/guide.md': '# API guidance\n',
    [sharedPath]: shared,
    ...Object.fromEntries(names.map((name) => [`${SKILL_PACKAGE}/skills/${name}/SKILL.md`, skill(name)])),
    ...overrides,
  };
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  }
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

test('publishes canonical bytes unchanged and derives only metadata and root discovery adapters', () => {
  const root = fixture();
  const result = createSkillDistribution(root);
  assert.deepEqual(result, createSkillDistribution(root));
  assert.equal(result.files.get('references/shared/portable/shared.md'), shared);
  assert.equal([...result.files.keys()].filter((file) => file.endsWith('/shared.md')).length, 1);
  for (const name of names) {
    assert.equal(result.files.get(`skills/${name}/SKILL.md`), skill(name));
    assert.ok(result.adapters.get(`.github/skills/${name}/SKILL.md`)?.includes(`${SKILL_PACKAGE}/skills/${name}/SKILL.md`));
  }
  const provenance = JSON.parse(result.files.get('provenance.json')!);
  assert.equal(provenance.source_commit, null);
  assert.equal(provenance.packages[0].version, '1.2.3');
  const reference = provenance.files.find((file: { id?: string }) => file.id === 'portable.shared');
  assert.equal(reference.source, sharedPath);
  assert.equal(reference.sha256, reference.source_sha256);
  writeFileSync(path.join(root, sharedPath), `${shared}\nChanged guidance.\n`);
  assert.notEqual(createSkillDistribution(root).files.get('provenance.json'), result.files.get('provenance.json'));
});

test('rejects escaping, unbundled, and broken-fragment resource links directly in public source', () => {
  assert.throws(
    () => createSkillDistribution(fixture({ [sharedPath]: `${shared}\n[Policy](../../../../../../AGENTS.md)\n` })),
    /escapes package/,
  );
  assert.throws(
    () => createSkillDistribution(fixture({ [sharedPath]: `${shared}\n[Unbundled](../../maintainer.md)\n` })),
    /Unbundled reference/,
  );
  assert.throws(() => createSkillDistribution(fixture({ [sharedPath]: shared.replace('# Shared', '# Renamed') })), /Missing public anchor/);
  assert.throws(
    () => createSkillDistribution(fixture({ [sharedPath]: `${shared}\nRead \`references/agents/private.md\`.\n` })),
    /Repository-only prerequisite/,
  );
  assert.throws(
    () => createSkillDistribution(fixture({ [sharedPath]: `${shared}\nRead \`../../../../../../README.md\`.\n` })),
    /escapes package/,
  );
  assert.throws(
    () => createSkillDistribution(fixture({ [sharedPath]: `${shared}\n<img src="../../../../../../private.png">\n` })),
    /escapes package/,
  );
  assert.throws(
    () => createSkillDistribution(fixture({ [sharedPath]: `${shared}\n[Local machine](file:///private/guide.md)\n` })),
    /Unsupported public resource scheme/,
  );
  assert.throws(
    () =>
      createSkillDistribution(
        fixture({ [sharedPath]: `${shared}\n[Encoded absolute](%2F../../../references/shared/portable/shared.md)\n` }),
      ),
    /Absolute public resource link/,
  );
});

test('requires explicit package documentation dependencies and validates their ownership', () => {
  assert.doesNotThrow(() => createSkillDistribution(fixture({ [sharedPath]: `${shared}\nRead \`@scope/demo/references/guide.md\`.\n` })));
  assert.throws(
    () => createSkillDistribution(fixture({ [sharedPath]: `${shared}\nRead \`@scope/demo/references/private.md\`.\n` })),
    /Undeclared documentation dependency/,
  );
  const privateCatalog = { ...catalog, packages: [{ ...catalog.packages[0], reference_paths: ['references/remaining-work.md'] }] };
  assert.throws(
    () => createSkillDistribution(fixture({ [catalogPath]: JSON.stringify(privateCatalog) })),
    /Repository-only or invalid documentation/,
  );
});

test('rejects symlinked public resources rather than treating repository realpaths as package content', () => {
  const root = fixture();
  const outside = fixture();
  symlinkSync(
    path.join(outside, 'packages/demo'),
    path.join(root, SKILL_PACKAGE, 'references/shared/escape'),
    process.platform === 'win32' ? 'junction' : 'dir',
  );
  assert.throws(() => createSkillDistribution(root), /Symlink in public source/);
});

test('allows identified historical evidence but not repository prerequisites or missing rule definitions', () => {
  const evidence = shared.replace('kind: instruction-reference', 'kind: evidence-reference');
  assert.doesNotThrow(() =>
    createSkillDistribution(fixture({ [sharedPath]: `${evidence}\nObserved source: \`packages/demo/src/old.ts\` at revision 123.\n` })),
  );
  assert.throws(
    () => createSkillDistribution(fixture({ [sharedPath]: `${evidence}\nRead [repo policy](../../../../../../AGENTS.md).\n` })),
    /escapes package/,
  );
  assert.throws(() => createSkillDistribution(fixture({ [sharedPath]: `${shared}\nFollow R-SECRET-001.\n` })), /Unbundled rule/);
});

test('preserves reference-style links and rejects prerequisite cycles without rewriting the files', () => {
  const source = `${SKILL_PACKAGE}/skills/furn-one/SKILL.md`;
  const text =
    '---\nname: furn-one\ndescription: Use for demo work.\n---\n\n[Shared][context]\n\n[context]: ../../references/shared/portable/shared.md#shared\n';
  assert.equal(createSkillDistribution(fixture({ [source]: text })).files.get('skills/furn-one/SKILL.md'), text);
  assert.throws(
    () => createSkillDistribution(fixture({ [sharedPath]: `${shared}\nRead [itself](shared.md) first.\n` })),
    /prerequisite cycle/,
  );
});

test('checks metadata and retains the host obligations removed from portable workflows', () => {
  assert.throws(() => createSkillDistribution(fixture({ 'AGENTS.md': '# No release safeguard\n' })), /required obligation/);
  assert.throws(
    () =>
      createSkillDistribution(
        fixture({ [`${SKILL_PACKAGE}/skills/furn-one/SKILL.md`]: `---\nname: furn-one\ndescription: ${'word '.repeat(61)}\n---\n` }),
      ),
    /description exceeds/,
  );
});

test('repairs derived adapters and metadata but never deletes or rewrites canonical knowledge', () => {
  const root = fixture();
  const result = writeSkillDistribution(root);
  assert.doesNotThrow(() => writeSkillDistribution(root, true));
  assert.doesNotThrow(() => checkSkillAdapters(root, result));
  writeFileSync(path.join(root, '.github/skills/furn-one/SKILL.md'), 'stale adapter');
  assert.throws(() => checkSkillAdapters(root), /Stale skill discovery adapter/);
  assert.throws(() => writeSkillDistribution(root, true), /Stale skill metadata or adapter/);
  const extra = path.join(root, SKILL_PACKAGE, 'references/shared/new.md');
  writeFileSync(extra, shared.replace('portable.shared', 'portable.another'));
  writeFileSync(path.join(root, sharedPath), `${shared}\nCanonical author edit.\n`);
  writeSkillDistribution(root);
  assert.equal(readFileSync(path.join(root, sharedPath), 'utf8'), `${shared}\nCanonical author edit.\n`);
  assert.ok(readFileSync(extra, 'utf8').includes('portable.another'));
  assert.doesNotThrow(() => writeSkillDistribution(root, true));
});

test('rejects catalog entries that advertise a nonexistent public entry point', () => {
  assert.throws(
    () => createSkillDistribution(fixture({ 'packages/demo/package.json': JSON.stringify({ name: '@scope/demo', version: '1.0.0' }) })),
    /Invalid catalog capabilities/,
  );
});
