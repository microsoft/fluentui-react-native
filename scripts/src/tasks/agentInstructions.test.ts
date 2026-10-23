import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';

import { checkAgentInstructions, collectAnchors, extractPrerequisites, parseFrontmatter, slugify } from './agentInstructions.ts';

const roots: string[] = [];

function reference(id: string, kind: string, body: string, owner = 'packages/demo'): string {
  return `---\nid: ${id}\nkind: ${kind}\nowner_paths:\n  - ${owner}\n---\n\n${body}`;
}

const ROOT =
  '# Root\n\nRead the [index](references/agents/README.md) and follow R-DEMO-001.\n\n| Task | Skill |\n| --- | --- |\n| Demo work | [demo-skill](.github/skills/demo-skill/SKILL.md) |\n';

const VALID: Record<string, string> = {
  'packages/demo/index.ts': 'export {};\n',
  'packages/demo/SPEC.md': '# Demo\n\nSee [policy](AGENTS.md#focus-policy).\n',
  'packages/demo/AGENTS.md': '# Demo\n\n## Focus policy\n\n- **R-DEMO-001:** Keep focus visible.\n',
  'AGENTS.md': ROOT,
  'references/agents/README.md': reference(
    'index',
    'index',
    '# Index\n\n| ID | Document |\n| --- | --- |\n| `demo.guide` | [Guide](demo/guide.md) |\n',
    'references/agents',
  ),
  'references/agents/demo/guide.md': reference('demo.guide', 'instruction-reference', '# Guide\n\nUse `packages/demo/index.ts`.\n'),
  '.github/skills/demo-skill/SKILL.md': '---\nname: demo-skill\ndescription: Demonstrates a skill.\nlicense: MIT\n---\n\n# Demo skill\n',
  '.github/skills/demo-skill/references/old.md': reference(
    'compat.demo.old',
    'compatibility-reference',
    '# Moved\n\nSee [guide](../../../../references/agents/demo/guide.md).\n',
  ),
  'references/agents/evals/cases/demo-case.json': JSON.stringify({
    schema_version: 1,
    case_id: 'demo-case',
    split: 'development',
    task_mode: 'review',
    prompt: 'Review the demo.',
    expected: {
      skills: ['demo-skill'],
      classification: { implementation_model: 'none', public_compatibility: [], native_platforms: [] },
      required_reads: ['references/agents/demo/guide.md'],
      forbidden_actions: ['edit-files'],
    },
    assertions: [
      { id: 'keeps-focus', description: 'Keeps focus visible.', rule_ids: ['R-DEMO-001'], source_refs: ['packages/demo/index.ts'] },
    ],
  }),
};

function fixture(overrides: Record<string, string | undefined> = {}): string {
  const root = mkdtempSync(path.join(tmpdir(), 'agent-instructions-'));
  roots.push(root);
  for (const [file, content] of Object.entries({ ...VALID, ...overrides })) {
    if (content === undefined) {
      continue;
    }
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), content);
  }
  return root;
}

function messages(overrides: Record<string, string | undefined>): string[] {
  return checkAgentInstructions(fixture(overrides)).issues.map((issue) => `${issue.file}: ${issue.message}`);
}

function assertIssue(overrides: Record<string, string | undefined>, pattern: RegExp) {
  const found = messages(overrides);
  assert.ok(
    found.some((message) => pattern.test(message)),
    `expected ${pattern} in:\n${found.join('\n')}`,
  );
}

const GUIDED_PACKAGE: Record<string, string> = {
  'references/agents/README.md': reference(
    'index',
    'index',
    '# Index\n\n| ID | Document |\n| --- | --- |\n| `demo.repo-guide` | [Guide](demo/guide.md) |\n',
    'references/agents',
  ),
  'references/agents/demo/guide.md': reference('demo.repo-guide', 'instruction-reference', '# Guide\n'),
  'references/agents/repository/package-guidance-packages.json': JSON.stringify({
    schema_version: 1,
    packages: ['packages/demo'],
  }),
  'packages/demo/package.json': JSON.stringify({ name: '@scope/demo' }),
  'packages/demo/AGENTS.md':
    '# Demo package\n\n## Focus policy\n\nSee [index](references/README.md).\n\n- **R-DEMO-001:** Keep its guidance local.\n',
  'packages/demo/README.md': '# Demo package\n\nSee [agents](AGENTS.md) and [index](references/README.md).\n',
  'packages/demo/references/README.md': reference(
    'demo.index',
    'index',
    '# References\n\n| ID | Document | Read when |\n| --- | --- | --- |\n| `demo.guide` | [Guide](guide.md) | Configuring it |\n',
    'packages/demo/references',
  ),
  'packages/demo/references/guide.md': reference(
    'demo.guide',
    'instruction-reference',
    '# Guide\n\nSee `references/guide.md` and follow R-DEMO-001.\n',
    'packages/demo',
  ),
  '.github/skills/demo-skill/SKILL.md':
    '---\nname: demo-skill\ndescription: Demonstrates a skill.\nlicense: MIT\n---\n\nRead [the package guide](../../../packages/demo/references/guide.md).\n',
};

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe('agent instruction helpers', () => {
  it('creates GitHub-style anchors', () => {
    assert.equal(slugify('4. Native obligations'), '4-native-obligations');
    assert.equal(slugify('`includesGeneratedCode` is not Windows-scoped'), 'includesgeneratedcode-is-not-windows-scoped');
    assert.equal(slugify('Use <code>x</code> and <<b>b>bold</b>'), 'use-x-and-bold');
    assert.deepEqual([...collectAnchors('# A\n## A\n```\n# ignored\n```\n<a id="custom"></a>\n')], ['a', 'a-1', 'custom']);
  });

  it('parses only the standardized frontmatter', () => {
    assert.deepEqual(parseFrontmatter(reference('a.b', 'index', 'body')), {
      id: 'a.b',
      kind: 'index',
      ownerPaths: ['packages/demo'],
      bodyStart: 6,
    });
    assert.match(String(parseFrontmatter('# No frontmatter')), /missing frontmatter/);
    assert.match(String(parseFrontmatter('---\nid: a\nkind: index\nowner_paths:\n  - x\ntitle: extra\n---\n')), /no other keys/);
    assert.match(String(parseFrontmatter('---\nkind: index\nid: a\nowner_paths:\n  - x\n---\n')), /in that order/);
  });

  it('detects explicit prerequisites', () => {
    const text =
      '# A\n\nRead [common](common.md) first. Then see [other](other.md).\n\n- Work starts with [x](x.md), then [y](y.md).\n\n## Read first\n\n1. [Package](pkg.md)\n';
    assert.deepEqual(
      extractPrerequisites(text).map((link) => link.target),
      ['common.md', 'x.md', 'pkg.md'],
    );
  });
});

describe('checkAgentInstructions', () => {
  it('accepts a valid repository', () => {
    assert.deepEqual(messages({}), []);
  });

  it('rejects invalid frontmatter values', () => {
    assertIssue({ 'references/agents/demo/guide.md': reference('Demo_Guide', 'instruction-reference', '# G\n') }, /invalid id/);
    assertIssue({ 'references/agents/demo/guide.md': reference('demo.guide', 'notes', '# G\n') }, /unknown kind/);
    assertIssue(
      { 'references/agents/demo/guide.md': reference('demo.guide', 'instruction-reference', '# G\n', 'packages/missing') },
      /owner path/,
    );
    assertIssue({ 'references/agents/demo/other.md': reference('demo.guide', 'instruction-reference', '# O\n') }, /duplicate id/);
    assertIssue({ '.github/skills/demo-skill/references/plain.md': '# Plain\n' }, /missing frontmatter/);
  });

  it('requires indexed references', () => {
    assertIssue({ 'references/agents/demo/new.md': reference('demo.new', 'instruction-reference', '# New\n') }, /not linked from/);
    assertIssue({ 'references/agents/README.md': undefined }, /references\/agents\/README\.md: missing reference index/);
  });

  it('rejects broken links, case mismatches, missing anchors, and missing code paths', () => {
    assertIssue({ 'AGENTS.md': `${ROOT}\n[Missing](missing.md)\n` }, /broken link: missing\.md/);
    assertIssue({ 'AGENTS.md': `${ROOT}\n[Case](references/agents/README.MD)\n` }, /broken link/);
    assertIssue({ 'AGENTS.md': `${ROOT}\n[Anchor](packages/demo/AGENTS.md#absent)\n` }, /missing anchor/);
    assertIssue({ 'AGENTS.md': `${ROOT}\nRun \`packages/demo/missing.ts\`.\n` }, /code span does not exist/);
  });

  it('protects inbound anchors into instruction files', () => {
    assertIssue(
      { 'packages/demo/AGENTS.md': '# Demo\n\n- **R-DEMO-001:** Keep focus visible.\n' },
      /SPEC\.md: missing anchor in instruction file/,
    );
  });

  it('requires rule IDs to be defined exactly once', () => {
    assertIssue({ 'AGENTS.md': `${ROOT}\nFollow R-DEMO-002.\n` }, /undefined rule ID R-DEMO-002/);
    assertIssue({ 'AGENTS.md': `${ROOT}\n- **R-DEMO-001:** Duplicate.\n` }, /already defined/);
  });

  it('rejects compatibility redirects without a live target', () => {
    assertIssue(
      {
        '.github/skills/demo-skill/references/older.md': reference(
          'compat.demo.older',
          'compatibility-reference',
          '# Moved\n\n[Old](old.md)\n',
        ),
      },
      /only to another compatibility reference/,
    );
  });

  it('validates skill metadata', () => {
    assertIssue({ '.github/skills/demo-skill/SKILL.md': '---\nname: other\ndescription: Text.\n---\n' }, /must match its directory/);
    assertIssue({ '.github/skills/demo-skill/SKILL.md': `---\nname: demo-skill\ndescription: ${'word '.repeat(61)}\n---\n` }, /61 words/);
  });

  it('validates guided package entry points, indexes, package-relative paths, and skill targets', () => {
    const root = fixture(GUIDED_PACKAGE);
    assert.deepEqual(
      checkAgentInstructions(root).issues.map((issue) => `${issue.file}: ${issue.message}`),
      [],
    );
  });

  it('rejects package guidance links that escape the package, including sibling dependencies', () => {
    assertIssue(
      {
        ...GUIDED_PACKAGE,
        'packages/demo/references/guide.md': reference(
          'demo.guide',
          'instruction-reference',
          '# Guide\n\n[Other](../../other/README.md)\n',
          'packages/demo',
        ),
      },
      /package guidance link escapes its package/,
    );
  });

  it('requires package references to have package-prefixed IDs and be listed in their index', () => {
    assertIssue(
      {
        ...GUIDED_PACKAGE,
        'packages/demo/references/guide.md': reference('other.guide', 'instruction-reference', '# Guide\n', 'packages/demo'),
      },
      /ID must start with "demo\."/,
    );
    assertIssue(
      {
        ...GUIDED_PACKAGE,
        'packages/demo/references/README.md': reference('demo.index', 'index', '# References\n', 'packages/demo/references'),
      },
      /not linked from packages\/demo\/references\/README\.md/,
    );
    assertIssue(
      {
        ...GUIDED_PACKAGE,
        'packages/demo/references/guide.md': reference(
          'demo.guide',
          'instruction-reference',
          '# Guide\n\nSee `references/agents/README.md`.\n',
          'packages/demo',
        ),
      },
      /path in code span does not exist: references\/agents\/README\.md/,
    );
    assertIssue(
      {
        ...GUIDED_PACKAGE,
        'packages/demo/references/guide.md': reference(
          'demo.guide',
          'instruction-reference',
          '# Guide\n\nSee `@scope/demo/references/missing.md`.\n',
          'packages/demo',
        ),
      },
      /package guide path does not exist: @scope\/demo\/references\/missing\.md/,
    );
  });

  it('requires package README and AGENTS entry points to link to each other and the index', () => {
    assertIssue({ ...GUIDED_PACKAGE, 'packages/demo/README.md': '# Demo\n' }, /must link to packages\/demo\/AGENTS\.md/);
    assertIssue({ ...GUIDED_PACKAGE, 'packages/demo/AGENTS.md': '# Demo\n' }, /must link to packages\/demo\/references\/README\.md/);
  });

  it('allows skills to link only to package entry points or indexed guidance', () => {
    assertIssue(
      {
        ...GUIDED_PACKAGE,
        '.github/skills/demo-skill/SKILL.md':
          '---\nname: demo-skill\ndescription: Demonstrates a skill.\n---\n\n[Source](../../../packages/demo/src/index.ts)\n',
      },
      /skill links to non-guidance package file/,
    );
    assertIssue(
      {
        ...GUIDED_PACKAGE,
        '.github/skills/demo-skill/SKILL.md': '---\nname: demo-skill\ndescription: a: b\n---\n',
      },
      /colon-space must be quoted/,
    );
  });

  it('validates only source paths in app agent maps', () => {
    const valid = {
      'apps/demo/config.ts': '',
      'apps/demo/generated.ts': '',
      'apps/demo/agent-map.yaml':
        'sources:\n  config: config.ts\n  generated:\n    path: generated.ts\nservices:\n  driver:\n    command: yarn storybook driver --macos\n',
    };
    assert.deepEqual(messages(valid), []);
    assertIssue(
      {
        ...valid,
        'apps/demo/agent-map.yaml': 'sources:\n  config: missing.ts\nservices:\n  driver:\n    command: yarn storybook driver --macos\n',
      },
      /source path does not exist or is ignored by Git: missing\.ts/,
    );
  });

  it('exempts declared generated sources but not their directories', () => {
    const map = (directory: string) =>
      `sources:\n  config: config.ts\n  requires:\n    path: ${directory}/requires.ts\n    policy: generated-do-not-edit\n`;
    const app = { 'apps/demo/config.ts': '', 'apps/demo/src/app.ts': '' };
    assert.deepEqual(messages({ ...app, 'apps/demo/agent-map.yaml': map('src') }), []);
    assertIssue({ ...app, 'apps/demo/agent-map.yaml': map('missing') }, /generated source directory does not exist: missing/);
  });

  it('checks agent map sources against Git rather than ignored local output', () => {
    const root = fixture({
      'apps/demo/.gitignore': 'built.ts\n',
      'apps/demo/built.ts': '',
      'apps/demo/agent-map.yaml': 'sources:\n  built: built.ts\n',
    });
    execFileSync('git', ['init', '-q'], { cwd: root });
    const found = checkAgentInstructions(root).issues.map((issue) => `${issue.file}: ${issue.message}`);
    assert.ok(
      found.some((message) => /source path does not exist or is ignored by Git: built\.ts/.test(message)),
      found.join('\n'),
    );
  });

  it('rejects prerequisite cycles and deep chains', () => {
    const doc = (id: string, body: string) => reference(id, 'instruction-reference', body);
    const index = reference(
      'index',
      'index',
      '# Index\n\n| ID | Document |\n| --- | --- |\n| `demo.guide` | [Guide](demo/guide.md) |\n| `demo.a` | [A](demo/a.md) |\n| `demo.b` | [B](demo/b.md) |\n| `demo.c` | [C](demo/c.md) |\n| `demo.d` | [D](demo/d.md) |\n',
      'references/agents',
    );
    assertIssue(
      {
        'references/agents/README.md': index,
        'references/agents/demo/a.md': doc('demo.a', '# A\n\nRead [B](b.md) first.\n'),
        'references/agents/demo/b.md': doc('demo.b', '# B\n\nRead [A](a.md) first.\n'),
        'references/agents/demo/c.md': doc('demo.c', '# C\n'),
        'references/agents/demo/d.md': doc('demo.d', '# D\n'),
      },
      /prerequisite cycle: .*a\.md -> .*b\.md -> .*a\.md|prerequisite cycle: .*b\.md -> .*a\.md -> .*b\.md/,
    );
    assertIssue(
      {
        'references/agents/README.md': index,
        'references/agents/demo/a.md': doc('demo.a', '# A\n\nRead [B](b.md) first.\n'),
        'references/agents/demo/b.md': doc('demo.b', '# B\n\nRead [C](c.md) first.\n'),
        'references/agents/demo/c.md': doc('demo.c', '# C\n\nRead [D](d.md) first.\n'),
        'references/agents/demo/d.md': doc('demo.d', '# D\n\nRead [guide](guide.md) first.\n'),
      },
      /prerequisite chain is 4 reads deep/,
    );
  });

  it('keeps compatibility references terminal', () => {
    assertIssue(
      { 'packages/demo/README.md': '# Demo\n\n[Old](../../.github/skills/demo-skill/references/old.md)\n' },
      /links to compatibility reference/,
    );
  });

  it('requires single, consistent, complete skill routing', () => {
    assertIssue(
      { 'AGENTS.md': '# Root\n\n| Task | Skill |\n| --- | --- |\n| Demo work | none |\n' },
      /must link exactly one skill; found 0/,
    );
    assertIssue({ 'AGENTS.md': '# Root\n' }, /not routed from the root AGENTS\.md routing table/);
    assertIssue(
      {
        '.github/skills/other-skill/SKILL.md': '---\nname: other-skill\ndescription: Another skill.\n---\n',
        'AGENTS.md': `${ROOT}| Other work | [other-skill](.github/skills/other-skill/SKILL.md) |\n`,
        'packages/demo/AGENTS.md':
          '# Demo\n\n## Focus policy\n\n- **R-DEMO-001:** Keep focus visible.\n\n| Task | Workflow |\n| --- | --- |\n| Demo work | [other](../../.github/skills/other-skill/SKILL.md) |\n',
      },
      /task "demo work" routes to/,
    );
  });

  it('validates evaluation cases', () => {
    const base = JSON.parse(VALID['references/agents/evals/cases/demo-case.json']);
    const write = (value: object) => ({ 'references/agents/evals/cases/demo-case.json': JSON.stringify(value) });
    assertIssue(write({ ...base, case_id: 'other' }), /must match the file name/);
    assertIssue(write({ ...base, expected: { ...base.expected, skills: ['missing-skill'] } }), /unknown skill/);
    assertIssue(write({ ...base, expected: { ...base.expected, required_reads: ['missing.md'] } }), /path does not exist/);
    assertIssue(write({ ...base, assertions: [{ ...base.assertions[0], rule_ids: ['R-DEMO-404'] }] }), /undefined rule/);
    assertIssue(write({ ...base, assertions: [{ id: 'empty', description: 'No evidence.', rule_ids: [], source_refs: [] }] }), /must cite/);
    assertIssue(write({ ...base, split: 'training' }), /split must be/);
  });
});
