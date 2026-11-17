import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';

import { createSkillDistribution, SKILL_EXPORTS, writeSkillDistribution } from './skillDistribution.ts';

const roots: string[] = [];
const shared = '---\nid: portable.shared\nkind: instruction-reference\nowner_paths:\n  - .github/skills\n---\n\n# Shared\n';
const config = {
  schema_version: 1,
  package: 'packages/agentic/skills',
  skills: ['furn-one', 'furn-two'],
  references: ['references/agents/shared.md'],
  host_obligations: ['R-REPO-003'],
  packages: [{ workspace: 'packages/demo', purpose: 'Demo components', entry_points: ['.'], targets: ['macos'] }],
};

function fixture(overrides: Record<string, string> = {}): string {
  const root = mkdtempSync(path.join(tmpdir(), 'skill-distribution-'));
  roots.push(root);
  const files: Record<string, string> = {
    [SKILL_EXPORTS]: JSON.stringify(config),
    LICENSE: 'MIT\n',
    'AGENTS.md': 'Follow R-REPO-003.\n',
    'packages/agentic/skills/package.json': JSON.stringify({
      name: '@fluentui-react-native/skills',
      version: '0.1.0',
      description: 'Skills',
    }),
    'packages/demo/package.json': JSON.stringify({ name: '@scope/demo', version: '1.2.3', exports: { '.': './index.js' } }),
    'references/agents/shared.md': shared,
    ...Object.fromEntries(
      config.skills.map((name) => [
        `.github/skills/${name}/SKILL.md`,
        `---\nname: ${name}\ndescription: Use for demo work.\n---\n\n# Demo\n\nRead [shared](../../../references/agents/shared.md#shared) first.\n`,
      ]),
    ),
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

test('exports one shared reference with rebased links, catalog versions, and content provenance', () => {
  const root = fixture();
  const result = createSkillDistribution(root);
  assert.deepEqual(result, createSkillDistribution(root));
  assert.equal([...result.files.keys()].filter((file) => file.endsWith('/shared.md')).length, 1);
  for (const name of config.skills) {
    assert.ok(result.files.get(`skills/${name}/SKILL.md`)?.includes('../../references/shared/shared.md#shared'));
  }
  assert.equal(JSON.parse(result.files.get('catalog/packages.json')!).packages[0].version, '1.2.3');
  const provenance = JSON.parse(result.files.get('provenance.json')!);
  assert.equal(provenance.source_commit, null);
  assert.equal(provenance.files.find((file: { id?: string }) => file.id === 'portable.shared').path, 'references/shared/shared.md');
  writeFileSync(path.join(root, 'references/agents/shared.md'), `${shared}\nChanged guidance.\n`);
  assert.notEqual(createSkillDistribution(root).files.get('provenance.json'), result.files.get('provenance.json'));
});

test('rejects unlisted reference dependencies and broken fragments instead of copying a transitive graph', () => {
  assert.throws(
    () => createSkillDistribution(fixture({ 'references/agents/shared.md': `${shared}\n[Policy](../../AGENTS.md)\n` })),
    /Unbundled reference/,
  );
  assert.throws(
    () => createSkillDistribution(fixture({ 'references/agents/shared.md': shared.replace('# Shared', '# Renamed') })),
    /Missing exported anchor/,
  );
});

test('keeps fenced examples and external links unchanged and rejects missing rule definitions', () => {
  const text = `${shared}\n[Web](https://example.com)\n\n\`\`\`md\n[example](unbundled.md)\n\`\`\`\n`;
  const result = createSkillDistribution(fixture({ 'references/agents/shared.md': text }));
  assert.equal(result.files.get('references/shared/shared.md'), text);
  assert.throws(
    () => createSkillDistribution(fixture({ 'references/agents/shared.md': `${shared}\nFollow R-SECRET-001.\n` })),
    /Unbundled rule/,
  );
});

test('rebases reference-style links and rejects prerequisite cycles in the exported subset', () => {
  const source = '.github/skills/furn-one/SKILL.md';
  const text =
    '---\nname: furn-one\ndescription: Use for demo work.\n---\n\n[Shared][context]\n\n[context]: ../../../references/agents/shared.md#shared\n';
  const result = createSkillDistribution(fixture({ [source]: text }));
  assert.ok(result.files.get('skills/furn-one/SKILL.md')?.includes('[context]: ../../references/shared/shared.md#shared'));
  assert.throws(
    () => createSkillDistribution(fixture({ 'references/agents/shared.md': `${shared}\nRead [itself](shared.md) first.\n` })),
    /prerequisite cycle/,
  );
});

test('checks metadata and the host obligations removed from portable workflows', () => {
  assert.throws(() => createSkillDistribution(fixture({ 'AGENTS.md': '# No release safeguard\n' })), /required obligation/);
  assert.throws(
    () => createSkillDistribution(fixture({ [SKILL_EXPORTS]: JSON.stringify({ ...config, skills: ['furn-one', 'furn-one'] }) })),
    /Duplicate distribution/,
  );
  assert.throws(
    () =>
      createSkillDistribution(
        fixture({
          '.github/skills/furn-one/SKILL.md': `---\nname: furn-one\ndescription: ${'word '.repeat(61)}\n---\n`,
        }),
      ),
    /description exceeds/,
  );
});

test('detects stale and extra generated files and regenerates only the owned payload', () => {
  const root = fixture();
  const result = writeSkillDistribution(root);
  const output = path.join(root, result.packagePath);
  assert.doesNotThrow(() => writeSkillDistribution(root, true));
  writeFileSync(path.join(output, 'references/shared/old.md'), '# Removed\n');
  writeFileSync(path.join(output, 'skills/furn-one/SKILL.md'), 'stale');
  writeFileSync(path.join(output, 'README.md'), 'keep authored docs');
  assert.throws(() => writeSkillDistribution(root, true), /Stale skill distribution/);
  writeSkillDistribution(root);
  assert.doesNotThrow(() => writeSkillDistribution(root, true));
  assert.equal(readFileSync(path.join(output, 'README.md'), 'utf8'), 'keep authored docs');
});

test('rejects catalog entries that advertise a nonexistent public entry point', () => {
  assert.throws(
    () => createSkillDistribution(fixture({ 'packages/demo/package.json': JSON.stringify({ name: '@scope/demo', version: '1.0.0' }) })),
    /Invalid catalog capabilities/,
  );
});
