import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, it } from 'node:test';

import {
  buildJestOptionTable,
  matchTestFiles,
  normalizeSelector,
  parseJestArgs,
  parseListedTests,
  type JestYargsOptions,
  type SelectorContext,
} from './jestSelection.ts';

// The parts of Jest's option definitions that decide how arguments are consumed, as Jest 29 declares them.
const options: JestYargsOptions = {
  bail: { alias: 'b', type: 'boolean' },
  cache: { type: 'boolean' },
  changedSince: { type: 'string' },
  findRelatedTests: { type: 'boolean' },
  listTests: { type: 'boolean' },
  maxWorkers: { alias: 'w', type: 'string' },
  onlyChanged: { alias: 'o', type: 'boolean' },
  reporters: { type: 'array' },
  testNamePattern: { alias: 't', type: 'string' },
  testPathPattern: { type: 'array' },
  updateSnapshot: { alias: 'u', type: 'boolean' },
  unknownKind: {},
};
const table = buildJestOptionTable(options);

const root = path.resolve('/repo/packages/agentic/components');
const context: SelectorContext = { root, repoRelativeRoot: 'packages/agentic/components', windows: false };
const testFile = (relative: string) => path.join(root, ...relative.split('/'));
const files = [
  'src/components/popover/popover.test.tsx',
  'src/components/popover/popover.types.test.ts',
  'src/components/menu/menu.test.tsx',
  'src/components/menu-item/menu-item.test.tsx',
  'src/components/menu-button/menu-button.test.tsx',
  'src/components/badge/badge.test.tsx',
  'src/components/divider/divider.test.tsx',
].map(testFile);

function relativeMatches(selectors: string[], selectorContext = context): string[] {
  const { matched } = matchTestFiles(files, selectors, selectorContext);
  return [...matched].map((file) => path.relative(root, file).split(path.sep).join('/'));
}

describe('buildJestOptionTable', () => {
  it('maps every spelling of an option to its canonical name and arity', () => {
    assert.deepEqual(table.get('o'), { name: 'onlyChanged', kind: 'boolean' });
    assert.deepEqual(table.get('onlyChanged'), { name: 'onlyChanged', kind: 'boolean' });
    assert.deepEqual(table.get('t'), { name: 'testNamePattern', kind: 'value' });
    assert.deepEqual(table.get('testPathPattern'), { name: 'testPathPattern', kind: 'array' });
    assert.deepEqual(table.get('unknownKind'), { name: 'unknownKind', kind: 'value' });
  });

  it('agrees with the option definitions of the installed Jest', () => {
    const jestRequire = createRequire(createRequire(import.meta.url).resolve('jest/package.json'));
    const installed = buildJestOptionTable((jestRequire('jest-cli') as { yargsOptions: JestYargsOptions }).yargsOptions);
    assert.deepEqual(installed.get('o'), { name: 'onlyChanged', kind: 'boolean' });
    assert.deepEqual(installed.get('t'), { name: 'testNamePattern', kind: 'value' });
    assert.deepEqual(installed.get('u'), { name: 'updateSnapshot', kind: 'boolean' });
    assert.equal(installed.get('findRelatedTests')?.kind, 'boolean');
    assert.equal(installed.get('changedSince')?.kind, 'value');
    assert.equal(installed.get('testPathPattern')?.kind, 'array');
  });
});

describe('parseJestArgs', () => {
  it('treats bare arguments as selectors', () => {
    assert.deepEqual(parseJestArgs(['popover', 'menu'], table), {
      selectors: ['popover', 'menu'],
      relatedFiles: undefined,
      changeSelection: [],
      passthrough: [],
    });
    assert.deepEqual(parseJestArgs([], table).selectors, []);
  });

  it('finds selectors after options that take no value', () => {
    const parsed = parseJestArgs(['-u', 'button', '--bail', 'badge'], table);
    assert.deepEqual(parsed.selectors, ['button', 'badge']);
    assert.deepEqual(parsed.passthrough, ['-u', '--bail']);
  });

  it('does not mistake option values for selectors', () => {
    assert.deepEqual(parseJestArgs(['-t', 'opens on press', 'popover'], table).passthrough, ['-t', 'opens on press']);
    assert.deepEqual(parseJestArgs(['-t', 'opens on press', 'popover'], table).selectors, ['popover']);
    assert.deepEqual(parseJestArgs(['popover', '--testNamePattern=opens'], table).passthrough, ['--testNamePattern=opens']);
    assert.deepEqual(parseJestArgs(['--maxWorkers', '2', 'menu'], table).selectors, ['menu']);
    assert.deepEqual(parseJestArgs(['-w', '2', 'menu'], table).selectors, ['menu']);
    assert.deepEqual(parseJestArgs(['--max-workers=2', 'menu'], table).selectors, ['menu']);
  });

  it('lets array options take every value up to the next option or the separator', () => {
    const parsed = parseJestArgs(['--reporters', 'default', 'summary', '--', 'menu', '-weird'], table);
    assert.deepEqual(parsed.passthrough, ['--reporters', 'default', 'summary']);
    assert.deepEqual(parsed.selectors, ['menu', '-weird']);
    assert.deepEqual(parseJestArgs(['--reporters', 'default', '--bail', 'menu'], table).selectors, ['menu']);
  });

  it('collects path patterns as selectors', () => {
    assert.deepEqual(parseJestArgs(['--testPathPattern=menu'], table).selectors, ['menu']);
    assert.deepEqual(parseJestArgs(['--testPathPattern', 'menu', 'badge', '--bail'], table).selectors, ['menu', 'badge']);
    assert.deepEqual(parseJestArgs(['--testPathPattern', 'menu', '--bail'], table).passthrough, ['--bail']);
  });

  it('selects by change with an option alias', () => {
    assert.deepEqual(parseJestArgs(['-o'], table), {
      selectors: [],
      relatedFiles: undefined,
      changeSelection: ['-o'],
      passthrough: [],
    });
    assert.deepEqual(parseJestArgs(['--onlyChanged'], table).changeSelection, ['--onlyChanged']);

    const narrowed = parseJestArgs(['-o', 'menu'], table);
    assert.deepEqual(narrowed.changeSelection, ['-o']);
    assert.deepEqual(narrowed.selectors, ['menu']);
  });

  it('selects by changes since a ref in any spelling', () => {
    assert.deepEqual(parseJestArgs(['--changedSince', 'origin/main', 'menu'], table).changeSelection, ['--changedSince', 'origin/main']);
    assert.deepEqual(parseJestArgs(['--changedSince=origin/main', 'menu'], table).selectors, ['menu']);
    assert.deepEqual(parseJestArgs(['--changed-since', 'origin/main'], table).changeSelection, ['--changed-since', 'origin/main']);
  });

  it('treats the arguments after --findRelatedTests as source files', () => {
    const parsed = parseJestArgs(['--findRelatedTests', 'src/a.ts', 'src/b.ts'], table);
    assert.deepEqual(parsed.selectors, []);
    assert.deepEqual(parsed.relatedFiles, ['src/a.ts', 'src/b.ts']);
    assert.deepEqual(parsed.changeSelection, ['--findRelatedTests', 'src/a.ts', 'src/b.ts']);
    assert.deepEqual(parseJestArgs(['--findRelatedTests'], table).relatedFiles, []);
    assert.deepEqual(parseJestArgs(['--findRelatedTests', 'src/a.ts', '--testPathPattern', 'menu'], table).selectors, ['menu']);
  });

  it('forwards negated options and never selects by them', () => {
    assert.deepEqual(parseJestArgs(['--no-cache', 'menu'], table), {
      selectors: ['menu'],
      relatedFiles: undefined,
      changeSelection: [],
      passthrough: ['--no-cache'],
    });
    assert.deepEqual(parseJestArgs(['--no-only-changed', 'menu'], table).changeSelection, []);
    assert.deepEqual(parseJestArgs(['--no-only-changed', 'menu'], table).passthrough, ['--no-only-changed']);
  });

  it('treats an option Jest does not declare as taking no value', () => {
    const parsed = parseJestArgs(['--someNewFlag', 'menu'], table);
    assert.deepEqual(parsed.selectors, ['menu']);
    assert.deepEqual(parsed.passthrough, ['--someNewFlag']);
  });

  it('knows only the leading selectors without Jest option definitions', () => {
    const parsed = parseJestArgs(['menu', 'badge', '-t', 'opens', 'popover'], undefined);
    assert.deepEqual(parsed.selectors, ['menu', 'badge']);
    assert.deepEqual(parsed.passthrough, ['-t', 'opens', 'popover']);
  });

  it('resolves the aliases of the installed Jest', () => {
    const jestRequire = createRequire(createRequire(import.meta.url).resolve('jest/package.json'));
    const installed = buildJestOptionTable((jestRequire('jest-cli') as { yargsOptions: JestYargsOptions }).yargsOptions);
    assert.deepEqual(parseJestArgs(['-o', 'menu'], installed).changeSelection, ['-o']);
    assert.deepEqual(parseJestArgs(['-u', '-t', 'opens', 'menu'], installed), {
      selectors: ['menu'],
      relatedFiles: undefined,
      changeSelection: [],
      passthrough: ['-u', '-t', 'opens'],
    });
  });
});

describe('normalizeSelector', () => {
  it('expresses paths relative to the package', () => {
    assert.equal(normalizeSelector(path.join(root, 'src', 'components', 'badge'), context), 'src/components/badge');
    assert.equal(normalizeSelector('./src/components/badge', context), 'src/components/badge');
    assert.equal(normalizeSelector('packages/agentic/components/src/components/badge', context), 'src/components/badge');
  });

  it('leaves patterns alone', () => {
    assert.equal(normalizeSelector('badge', context), 'badge');
    assert.equal(normalizeSelector('components/(badge|divider)/', context), 'components/(badge|divider)/');
    assert.equal(normalizeSelector('packages/other/src/badge', context), 'packages/other/src/badge');
  });

  it('reads backslashes as separators only on Windows', () => {
    assert.equal(normalizeSelector('.\\src\\badge', { ...context, windows: true }), 'src/badge');
    assert.equal(normalizeSelector('packages\\agentic\\components\\src', { ...context, windows: true }), 'src');
    assert.equal(normalizeSelector('badge\\.test', context), 'badge\\.test');
  });
});

describe('matchTestFiles', () => {
  it('matches case-insensitively by substring', () => {
    assert.deepEqual(relativeMatches(['Popover']), [
      'src/components/popover/popover.test.tsx',
      'src/components/popover/popover.types.test.ts',
    ]);
  });

  it('matches every component whose name contains the selector', () => {
    assert.deepEqual(relativeMatches(['menu']), [
      'src/components/menu/menu.test.tsx',
      'src/components/menu-item/menu-item.test.tsx',
      'src/components/menu-button/menu-button.test.tsx',
    ]);
    assert.deepEqual(relativeMatches(['src/components/menu/']), ['src/components/menu/menu.test.tsx']);
  });

  it('matches regular expressions', () => {
    assert.deepEqual(relativeMatches(['components/(badge|divider)/']), [
      'src/components/badge/badge.test.tsx',
      'src/components/divider/divider.test.tsx',
    ]);
  });

  it('takes the union of several selectors', () => {
    assert.deepEqual(relativeMatches(['badge', 'divider']), [
      'src/components/badge/badge.test.tsx',
      'src/components/divider/divider.test.tsx',
    ]);
  });

  it('accepts absolute and repository-relative paths', () => {
    assert.deepEqual(relativeMatches([testFile('src/components/badge/badge.test.tsx')]), ['src/components/badge/badge.test.tsx']);
    assert.deepEqual(relativeMatches(['packages/agentic/components/src/components/badge']), ['src/components/badge/badge.test.tsx']);
  });

  it('reports the selectors that match nothing', () => {
    const { matched, unmatched } = matchTestFiles(files, ['badge', 'popovr', 'divider('], context);
    assert.equal(matched.size, 1);
    assert.deepEqual(unmatched, ['popovr', 'divider(']);
  });

  it('falls back to literal text for an invalid regular expression', () => {
    const withParenthesis = [...files, testFile('src/odd/a(b.test.ts')];
    const { matched, unmatched } = matchTestFiles(withParenthesis, ['a(b'], context);
    assert.deepEqual(unmatched, []);
    assert.deepEqual([...matched], [testFile('src/odd/a(b.test.ts')]);
  });

  it('matches Windows-style selectors against portable paths', () => {
    assert.deepEqual(relativeMatches(['src\\components\\badge'], { ...context, windows: true }), ['src/components/badge/badge.test.tsx']);
  });
});

describe('parseListedTests', () => {
  it('reads the JSON array that jest --listTests --json prints', () => {
    assert.deepEqual(parseListedTests('["/a/one.test.ts","/a/two.test.ts"]\n'), ['/a/one.test.ts', '/a/two.test.ts']);
    assert.deepEqual(parseListedTests('[]\n'), []);
  });

  it('ignores output lines before the array', () => {
    assert.deepEqual(parseListedTests('warning: something\r\n["/a/one.test.ts"]\r\n'), ['/a/one.test.ts']);
  });

  it('rejects output that is not a list of paths', () => {
    assert.throws(() => parseListedTests(''), /Unexpected output/);
    assert.throws(() => parseListedTests('no list here\n'), /Unexpected output/);
    assert.throws(() => parseListedTests('[1,2]\n'), /Unexpected output/);
    assert.throws(() => parseListedTests('[not json\n'), SyntaxError);
  });
});
