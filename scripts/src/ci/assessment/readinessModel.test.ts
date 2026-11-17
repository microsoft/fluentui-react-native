import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import type { TestContext } from 'node:test';

import { discoverReadinessControls, readReadinessMapping, repositoryFile } from './readinessModel.ts';

function fixture(t: TestContext) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'furn-readiness-model-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const packagePath = 'packages/example';
  const component = `${packagePath}/src/components/sample`;
  const primitive = `${packagePath}/src/primitives/foundation`;
  function write(file: string, value: string | object) {
    const destination = path.join(root, file);
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(destination, typeof value === 'string' ? value : JSON.stringify(value));
  }
  write(`${packagePath}/package.json`, {
    name: '@example/controls',
    furn: { readiness: { contracts: ['src/components/*/SPEC.md', 'src/primitives/*/CONTRACT.md'] } },
  });
  write(
    `${component}/SPEC.md`,
    '# Sample\n\n**SAMPLE-001:** Accept the public default.\n  Preserve its continuation.\n\n- **SAMPLE-002:** Report activation once.\n',
  );
  write(`${component}/spec/source.json`, {
    schemaVersion: 2,
    component: 'sample',
    lifecycle: 'implemented',
    requirements: [{ id: 'SAMPLE-001' }, { id: 'SAMPLE-002' }],
    sources: [],
  });
  write(`${component}/sample.test.tsx`, 'describe("Sample", () => {});');
  write(`${component}/sample.types.test.ts`, 'type Sample = string;');
  write(`${component}/sample.stories.tsx`, 'export const Default = {};');
  write(`${primitive}/CONTRACT.md`, '# Foundation\n\nA local, unstyled primitive.\n\n- Keep child order.\n- Preserve caller styles.\n');
  const [control] = discoverReadinessControls(root);
  const reviewInputs: string[] = [];
  const mapping = {
    schemaVersion: 1,
    reviewedDigest: control.reviewDigest,
    reviewKind: 'agent-reviewed',
    reviewInputs,
    requirements: Object.fromEntries(
      control.requirements.map(({ id }) => [
        id,
        { checks: [{ id: id.toLowerCase(), description: `Verify ${id}.`, source: 'SPEC.md', evidence: 'unit', tests: [] }] },
      ]),
    ),
    limitations: ['Native and visual observations remain missing.'],
  };
  return { root, component, packagePath, write, mapping };
}

test('readiness inventory discovers paragraph and bullet requirements plus local primitive contracts', (t) => {
  const { root } = fixture(t);
  const [control, primitive] = discoverReadinessControls(root);
  assert.equal(control.kind, 'component');
  assert.deepEqual(
    control.requirements.map(({ id }) => id),
    ['SAMPLE-001', 'SAMPLE-002'],
  );
  assert.match(control.requirements[0].description, /Preserve its continuation/);
  assert.equal(control.unitFiles.length, 1);
  assert.equal(control.typeFiles.length, 1);
  assert.equal(primitive.kind, 'primitive');
  assert.deepEqual(
    primitive.requirements.map(({ id }) => id),
    ['LOCAL-001', 'LOCAL-002'],
  );
  assert.deepEqual(primitive.sources, []);
  assert.equal(primitive.mappingCurrent, false);
});

test('readiness discovery canonicalizes repository aliases before resolving the owning package', (t) => {
  const { root, packagePath } = fixture(t);
  const alias = `${root}-alias`;
  symlinkSync(root, alias, 'junction');
  t.after(() => unlinkSync(alias));
  assert.deepEqual(
    discoverReadinessControls(alias, path.join(root, packagePath)),
    discoverReadinessControls(root, path.join(root, packagePath)),
  );
});

test('readiness mappings retain uncovered clauses and invalidate on reviewed source or helper drift', (t) => {
  const { root, component, write, mapping } = fixture(t);
  write(`${component}/assessment.readiness.json`, mapping);
  let [control] = discoverReadinessControls(root);
  assert.equal(control.mappingCurrent, true);
  assert.deepEqual(control.mapping?.requirements['SAMPLE-001'].checks[0].tests, []);
  write('packages/example/src/shared/helper.ts', 'export const expected = true;');
  mapping.reviewInputs.push('packages/example/src/shared/helper.ts');
  write(`${component}/assessment.readiness.json`, mapping);
  [control] = discoverReadinessControls(root);
  mapping.reviewedDigest = control.reviewDigest;
  write(`${component}/assessment.readiness.json`, mapping);
  assert.equal(discoverReadinessControls(root)[0].mappingCurrent, true);
  write('packages/example/src/shared/helper.ts', 'export const expected = false;');
  assert.equal(discoverReadinessControls(root)[0].mappingCurrent, false);
  assert.equal(discoverReadinessControls(root)[0].contractDigest, control.contractDigest);
});

test('readiness rejects silently dropped requirements and nonnormative acceptance sources', (t) => {
  const { root, component, write, mapping } = fixture(t);
  delete mapping.requirements['SAMPLE-002'];
  write(`${component}/assessment.readiness.json`, mapping);
  assert.throws(() => discoverReadinessControls(root), /every contract requirement/);
  mapping.requirements['SAMPLE-002'] = mapping.requirements['SAMPLE-001'];
  mapping.requirements['SAMPLE-001'].checks[0].source = 'sample.test.tsx';
  write(`${component}/assessment.readiness.json`, mapping);
  assert.throws(() => discoverReadinessControls(root), /normative contract file/);
});

test('readiness fingerprints are stable across native checkout line endings', (t) => {
  const { root, component, write } = fixture(t);
  const before = discoverReadinessControls(root)[0];
  const original = readFileSync(path.join(root, component, 'SPEC.md'), 'utf8');
  write(`${component}/SPEC.md`, original.replaceAll('\n', '\r\n'));
  const after = discoverReadinessControls(root)[0];
  assert.equal(after.reviewDigest, before.reviewDigest);
  assert.equal(after.contractDigest, before.contractDigest);
});

test('readiness does not silently omit a new implementation without its contract', (t) => {
  const { root, packagePath, write } = fixture(t);
  write(`${packagePath}/src/components/uncontracted/control.ts`, 'export const control = true;');
  assert.throws(() => discoverReadinessControls(root), /Missing readiness contract/);
});

test('readiness does not mistake story-only directories for public controls', (t) => {
  const { root, packagePath, write } = fixture(t);
  write(`${packagePath}/src/components/examples/examples.stories.tsx`, 'export const Examples = {};');
  write(`${packagePath}/src/primitives/focus-zone/focus-zone.stories.tsx`, 'export const FocusScope = {};');
  assert.equal(discoverReadinessControls(root).length, 2);
});

test('readiness rejects unsupported evidence, contradictory shared checks and duplicate links', (t) => {
  const { mapping } = fixture(t);
  assert.throws(() => readReadinessMapping({ ...mapping, reviewKind: 'approved' }), /review kind/);
  const check = mapping.requirements['SAMPLE-001'].checks[0];
  assert.throws(
    () =>
      readReadinessMapping({
        ...mapping,
        requirements: {
          ...mapping.requirements,
          'SAMPLE-002': { checks: [{ ...check, description: 'Different semantics for the same check.' }] },
        },
      }),
    /identical definitions/,
  );
  assert.throws(
    () =>
      readReadinessMapping({
        ...mapping,
        requirements: {
          'SAMPLE-001': {
            checks: [{ ...check, tests: [{ kind: 'native', name: 'story::case', target: 'windows-fabric' }] }],
          },
        },
      }),
    /required evidence kind/,
  );
});

test('readiness stage rules reject lowered evidence thresholds and false qualification kinds', (t) => {
  const { mapping } = fixture(t);
  const check = mapping.requirements['SAMPLE-001'].checks[0];
  const parse = (changes: object) =>
    readReadinessMapping({
      ...mapping,
      requirements: { 'SAMPLE-001': { checks: [{ ...check, ...changes }] } },
    }).requirements['SAMPLE-001'].checks[0];
  for (const [evidence, expected] of [
    ['unit', 'preview'],
    ['type', 'preview'],
    ['native', 'beta'],
    ['visual', 'beta'],
    ['manual', 'stable'],
  ])
    assert.equal(parse({ evidence }).requiredFrom, expected);
  assert.equal(parse({ requiredFrom: 'stable' }).requiredFrom, 'stable');
  assert.throws(() => parse({ evidence: 'native', requiredFrom: 'preview' }), /cannot lower/);
  assert.throws(() => parse({ evidence: 'manual', requiredFrom: 'beta' }), /cannot lower/);
  assert.throws(() => parse({ qualification: 'screen-reader' }), /reviewed manual/);
  assert.throws(() => parse({ evidence: 'type', qualification: 'keyboard' }), /native or reviewed manual/);
  assert.throws(
    () => parse({ applicability: { 'win32-paper': { status: 'not-applicable', source: 'SPEC.md', reason: 'No obligation.' } } }),
    /platform-neutral/,
  );
  assert.throws(
    () => parse({ evidence: 'native', applicability: { 'win32-paper': { status: 'not-applicable', source: 'SPEC.md', reason: '' } } }),
    /reason/,
  );
  assert.throws(
    () =>
      parse({ evidence: 'native', applicability: { 'windows-paper': { status: 'unsupported', source: 'SPEC.md', reason: 'No host.' } } }),
    /applicability target/,
  );
});

test('readiness stage applicability must cite a normative contract rather than a passing test', (t) => {
  const { root, component, write, mapping } = fixture(t);
  const check = mapping.requirements['SAMPLE-001'].checks[0];
  write(`${component}/assessment.readiness.json`, {
    ...mapping,
    requirements: {
      ...mapping.requirements,
      'SAMPLE-001': {
        checks: [
          {
            ...check,
            evidence: 'native',
            applicability: {
              'win32-paper': { status: 'not-applicable', source: 'sample.test.tsx', reason: 'A mock is not contract authority.' },
            },
          },
        ],
      },
    },
  });
  assert.throws(() => discoverReadinessControls(root), /normative contract file/);
});

test('readiness guards review inputs and discovery against traversal and linked files', (t) => {
  const { root, packagePath, component, write, mapping } = fixture(t);
  assert.throws(() => repositoryFile(root, '../outside'), /repository-relative/);
  assert.throws(() => repositoryFile(root, 'C:/outside'), /repository-relative|ENOENT/);
  mapping.reviewInputs.push('../outside');
  write(`${component}/assessment.readiness.json`, mapping);
  assert.throws(() => discoverReadinessControls(root), /repository-relative/);
  write(`${packagePath}/package.json`, { furn: { readiness: { contracts: ['../outside/SPEC.md'] } } });
  assert.throws(() => discoverReadinessControls(root), /inside their package/);
  const outside = mkdtempSync(path.join(os.tmpdir(), 'furn-readiness-outside-'));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  writeFileSync(path.join(outside, 'input.json'), '{}');
  symlinkSync(outside, path.join(root, 'redirect'), 'junction');
  assert.throws(() => repositoryFile(root, 'redirect/input.json'), /outside the repository/);
  assert.equal(readFileSync(path.join(outside, 'input.json'), 'utf8'), '{}');
});
