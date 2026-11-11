import type { DesktopStoryManifest, DesktopStoryManifestEntry } from '@fluentui-react-native/desktop-driver';
import { resolveDesktopScopeDomains, validateDesktopCaseOptions } from '@fluentui-react-native/desktop-driver/authoring';

import {
  csfTestId,
  decideWdioSelection,
  describeWdioExclusions,
  listWdioSelection,
  plannedWdioWork,
  type WdioSelection,
} from './selection.js';

type DeclaredCase = readonly [name: string, options: unknown];

function declared(id: string, cases: readonly DeclaredCase[], tags: string[] = ['story']): DesktopStoryManifestEntry {
  return {
    id,
    name: id,
    packageName: 'components',
    sourcePath: `${id}.stories.tsx`,
    tags,
    title: id,
    wdio: {
      digest: 'digest',
      exportName: 'Default',
      testNames: cases.map(([name]) => name),
      cases: cases.map(([name, options]) => ({ name, options: validateDesktopCaseOptions(options) })),
    },
  };
}

function legacy(id: string, testNames?: string[]): DesktopStoryManifestEntry {
  return {
    id,
    name: id,
    packageName: 'components',
    sourcePath: `${id}.stories.tsx`,
    tags: ['story'],
    title: id,
    wdio: { digest: 'legacy', exportName: 'Default', ...(testNames ? { testNames } : {}) },
  };
}

function manifestOf(...entries: DesktopStoryManifestEntry[]): DesktopStoryManifest {
  return { endpoint: 'win32', entries, platformManifestDigest: 'digest', portablePlanDigest: 'digest', schemaVersion: 1 };
}

const selectedNames = (selection: WdioSelection, id = 'button') => [...(selection.selected.get(id)?.keys() ?? [])];

const button = declared('button', [
  ['adaptive', { requires: ['click'] }],
  ['accessible', { requires: ['accessibility-click'] }],
  ['win32-only', { platforms: ['win32'] }],
]);

describe('WDIO selection', () => {
  test('orders stories by code point, so every machine builds the same shards', () => {
    const manifest = manifestOf(...['z', 'é', 'b', 'B', 'a', 'Z'].map((id) => legacy(id)));
    const { stories } = decideWdioSelection(manifest, {}, { platform: 'win32' });
    expect(stories.map(({ id }) => id)).toEqual(['B', 'Z', 'a', 'b', 'z', 'é']);
  });

  test('selects by input lane and target platform', () => {
    const manifest = manifestOf(button);
    expect(selectedNames(decideWdioSelection(manifest, { input: 'accessible' }, { platform: 'win32' }))).toEqual([
      'adaptive',
      'accessible',
      'win32-only',
    ]);
    expect(selectedNames(decideWdioSelection(manifest, {}, { platform: 'macos' }))).toEqual(['adaptive', 'accessible']);
    expect(selectedNames(decideWdioSelection(manifest, { input: 'physical' }, { platform: 'win32' }))).toEqual(['adaptive', 'win32-only']);
  });

  test('records every decision with its first exclusion reason', () => {
    const selection = decideWdioSelection(manifestOf(button), { input: 'physical' }, { platform: 'macos' });
    expect(selection.decisions.map(({ name, excluded }) => [name, excluded])).toEqual([
      ['adaptive', undefined],
      ['accessible', 'input'],
      ['win32-only', 'platform'],
    ]);
    expect(selection.excluded).toEqual({ platform: 1, scope: 0, input: 1 });
  });

  test('counts exclusions only among the cases the user filters selected', () => {
    const manifest = manifestOf(button, declared('other', [['unrelated', { platforms: ['win32'] }]]));
    const byTest = decideWdioSelection(manifest, { input: 'physical', test: 'accessible' }, { platform: 'macos' });
    expect(byTest.stories).toEqual([]);
    expect(byTest.excluded).toEqual({ platform: 0, scope: 0, input: 1 });
    const byStory = decideWdioSelection(manifest, { input: 'physical', story: 'button', test: 'win32-only' }, { platform: 'macos' });
    expect(byStory.excluded).toEqual({ platform: 1, scope: 0, input: 0 });
    expect(describeWdioExclusions(byStory)).toBe(' (excluded 1 by platform, 0 by scope, 0 by input)');
    expect(describeWdioExclusions(decideWdioSelection(manifest, {}, { platform: 'win32' }))).toBe('');
  });

  test('excludes by platform, then scope, then input', () => {
    const layered = manifestOf(
      declared('layered', [['all', { platforms: ['win32'], scope: { 'rn.renderer': ['paper'] }, requires: ['keyboard'] }]]),
    );
    const decide = (platform: 'macos' | 'win32', renderer: string) =>
      decideWdioSelection(
        layered,
        { input: 'accessible' },
        { platform, scope: { domains: resolveDesktopScopeDomains(), values: { 'rn.renderer': renderer } } },
      );
    expect(decide('macos', 'fabric').excluded).toEqual({ platform: 1, scope: 0, input: 0 });
    expect(decide('win32', 'fabric').excluded).toEqual({ platform: 0, scope: 1, input: 0 });
    expect(decide('win32', 'paper').excluded).toEqual({ platform: 0, scope: 0, input: 1 });
  });

  test('scopes cases by a value the target holds, including custom domains', () => {
    const domains = resolveDesktopScopeDomains({ 'product.flavor': ['alpha', 'beta'] });
    const scoped = manifestOf(
      declared('scoped', [
        ['paper-only', { scope: { 'rn.renderer': ['paper'] } }],
        ['beta-only', { scope: { 'product.flavor': ['beta'] } }],
        ['both-keys', { scope: { 'rn.renderer': ['paper', 'fabric'], 'product.flavor': ['alpha'] } }],
      ]),
    );
    const values = (renderer: string, flavor: string) => ({ domains, values: { 'rn.renderer': renderer, 'product.flavor': flavor } });
    expect(selectedNames(decideWdioSelection(scoped, {}, { platform: 'win32', scope: values('paper', 'beta') }), 'scoped')).toEqual([
      'paper-only',
      'beta-only',
    ]);
    expect(selectedNames(decideWdioSelection(scoped, {}, { platform: 'win32', scope: values('fabric', 'alpha') }), 'scoped')).toEqual([
      'both-keys',
    ]);
  });

  test('treats a scope key the target does not supply as a configuration error rather than an exclusion', () => {
    const scoped = manifestOf(declared('scoped', [['paper-only', { scope: { 'rn.renderer': ['paper'] } }]]));
    expect(() => decideWdioSelection(scoped, {}, { platform: 'win32' })).toThrow('is not supplied by this target');
    const custom = manifestOf(declared('scoped', [['flavored', { scope: { 'product.flavor': ['beta'] } }]]));
    expect(() =>
      decideWdioSelection(custom, {}, { platform: 'win32', scope: { domains: resolveDesktopScopeDomains(), values: {} } }),
    ).toThrow('unknown scope key "product.flavor"');
    const outside = manifestOf(declared('scoped', [['bogus', { scope: { 'rn.renderer': ['bogus'] } }]]));
    expect(() =>
      decideWdioSelection(
        outside,
        {},
        { platform: 'win32', scope: { domains: resolveDesktopScopeDomains(), values: { 'rn.renderer': 'paper' } } },
      ),
    ).toThrow('is not one of: fabric, paper');
  });

  test('does not evaluate the scope of a case another platform already excluded', () => {
    const scoped = manifestOf(declared('scoped', [['win32-paper', { platforms: ['win32'], scope: { 'rn.renderer': ['paper'] } }]]));
    expect(decideWdioSelection(scoped, {}, { platform: 'macos' }).excluded).toEqual({ platform: 1, scope: 0, input: 0 });
  });

  test('filters by story glob and tag and orders stories by id', () => {
    const manifest = manifestOf(
      declared('zeta', [['a', {}]], ['wide']),
      declared('alpha', [['a', {}]], ['wide']),
      declared('middle', [['a', {}]], ['narrow']),
    );
    expect(decideWdioSelection(manifest, {}, { platform: 'win32' }).stories.map(({ id }) => id)).toEqual(['alpha', 'middle', 'zeta']);
    expect(decideWdioSelection(manifest, { tag: 'wide' }, { platform: 'win32' }).stories.map(({ id }) => id)).toEqual(['alpha', 'zeta']);
    expect(decideWdioSelection(manifest, { story: 'm*' }, { platform: 'win32' }).stories.map(({ id }) => id)).toEqual(['middle']);
  });

  describe('legacy callbacks', () => {
    test('run in compatibility mode when a name matches the test filter', () => {
      const manifest = manifestOf(legacy('plain'), legacy('named', ['first', 'second']), declared('button', [['a', {}]]));
      expect(decideWdioSelection(manifest, {}, { platform: 'win32' }).stories.map(({ id }) => id)).toEqual(['button', 'named', 'plain']);
      expect(decideWdioSelection(manifest, { test: 'sec*' }, { platform: 'win32' }).stories.map(({ id }) => id)).toEqual(['named']);
      expect(decideWdioSelection(manifest, { test: 'nothing' }, { platform: 'win32' }).stories).toEqual([]);
    });

    test('are rejected together in a lane so one pass migrates them', () => {
      const manifest = manifestOf(legacy('b-legacy'), legacy('a-legacy', ['first']), declared('button', [['a', {}]]));
      expect(() => decideWdioSelection(manifest, { input: 'physical' }, { platform: 'win32' })).toThrow(
        'Input lane "physical" cannot run legacy wdio callbacks; declare them with desktopIt: a-legacy, b-legacy.',
      );
    });

    test('are ignored in a lane when the test filter names nothing they define, and summarized past ten', () => {
      const many = Array.from({ length: 12 }, (_, index) => legacy(`legacy-${String(index).padStart(2, '0')}`));
      expect(() => decideWdioSelection(manifestOf(...many), { input: 'accessible' }, { platform: 'win32' })).toThrow(
        /legacy-00, legacy-01.*legacy-09, and 2 more\.$/,
      );
      expect(decideWdioSelection(manifestOf(...many), { input: 'accessible', test: 'absent' }, { platform: 'win32' }).stories).toEqual([]);
    });
  });

  describe('declared gaps', () => {
    const gapped = manifestOf(
      declared('gapped', [
        ['unsupported', { unsupported: { platforms: ['win32'], reason: 'No host support.' } }],
        ['quarantined', { quarantine: { issue: '#9', reason: 'flaky', expires: '2026-01-01' } }],
        ['physical-quarantine', { quarantine: { issue: '#10', reason: 'drifts', expires: '2026-01-01', input: 'physical' } }],
      ]),
    );
    const before = Date.parse('2025-12-31T00:00:00Z');

    test('are resolved at selection time for the cases that run', () => {
      const win32 = decideWdioSelection(gapped, { input: 'physical' }, { platform: 'win32', now: before });
      expect([...win32.selected.get('gapped')!.values()].map(({ name, gap }) => [name, gap])).toEqual([
        ['unsupported', { kind: 'unsupported', reason: 'No host support.' }],
        ['quarantined', { kind: 'quarantine', reason: '#9: flaky' }],
        ['physical-quarantine', { kind: 'quarantine', reason: '#10: drifts' }],
      ]);
      const macos = decideWdioSelection(gapped, { input: 'accessible' }, { platform: 'macos', now: before });
      expect([...macos.selected.get('gapped')!.values()].map(({ name, gap }) => [name, gap?.kind])).toEqual([
        ['unsupported', undefined],
        ['quarantined', 'quarantine'],
        ['physical-quarantine', undefined],
      ]);
    });

    test('stop the run before anything executes once a quarantine expires', () => {
      expect(() => decideWdioSelection(gapped, {}, { platform: 'win32', now: Date.parse('2026-06-01T00:00:00Z') })).toThrow(
        'Quarantine #9 expired on 2026-01-01.',
      );
    });

    test('are not evaluated for a case the lane already excluded', () => {
      const excludedByLane = manifestOf(
        declared('gapped', [
          ['accessible', { requires: ['accessibility-click'], quarantine: { issue: '#9', reason: 'old', expires: '2020-01-01' } }],
        ]),
      );
      expect(decideWdioSelection(excludedByLane, { input: 'physical' }, { platform: 'win32' }).excluded.input).toBe(1);
    });
  });

  test('plans the work each selected case announces, legacy included', () => {
    const manifest = manifestOf(
      declared('button', [
        ['adaptive', {}],
        ['physical', { requires: ['keyboard'] }],
      ]),
      legacy('named', ['x', 'y']),
    );
    const planned = plannedWdioWork(decideWdioSelection(manifest, {}, { platform: 'win32' }), {});
    expect(planned).toEqual([
      { workId: csfTestId('button', 'adaptive'), label: 'button / adaptive' },
      { workId: csfTestId('button', 'physical'), label: 'button / physical' },
      { workId: csfTestId('named', 'x'), label: 'named / x' },
      { workId: csfTestId('named', 'y'), label: 'named / y' },
    ]);
    const filtered = plannedWdioWork(decideWdioSelection(manifest, { test: 'y' }, { platform: 'win32' }), { test: 'y' });
    expect(filtered.map(({ label }) => label)).toEqual(['named / y']);
    const lane = plannedWdioWork(decideWdioSelection(manifestOf(manifest.entries[0]), { input: 'accessible' }, { platform: 'win32' }), {});
    expect(lane.map(({ label }) => label)).toEqual(['button / adaptive']);
  });

  test('names a legacy callback without a declared name "default"', () => {
    const planned = plannedWdioWork(decideWdioSelection(manifestOf(legacy('plain')), {}, { platform: 'win32' }), {});
    expect(planned).toEqual([{ workId: csfTestId('plain', 'default'), label: 'plain / default' }]);
    expect(csfTestId('plain')).toBe(csfTestId('plain', 'default'));
  });

  describe('listing', () => {
    const listed = manifestOf(
      declared('button', [
        ['adaptive', { requires: ['click'] }],
        ['physical', { requires: ['keyboard'], platforms: ['win32'] }],
        ['accessible', { requires: ['accessibility-click'], unsupported: { platforms: ['win32'], reason: 'No host support.' } }],
      ]),
      legacy('named', ['first', 'second']),
      legacy('plain'),
      declared('only-physical', [['physical', { requires: ['keyboard'] }]]),
    );

    test('shows the selected cases with their gaps and the excluded cases with their first reason', () => {
      const selection = decideWdioSelection(listed, { input: 'accessible', story: 'button' }, { platform: 'win32' });
      expect(selection.stories.map(({ id }) => id)).toEqual(['button']);
      expect(listWdioSelection(selection, {})).toEqual([
        {
          id: 'button',
          sourcePath: 'button.stories.tsx',
          tests: [
            { name: 'adaptive', input: 'both', inputSource: 'derived', requires: ['click'] },
            {
              name: 'accessible',
              input: 'accessible',
              inputSource: 'derived',
              requires: ['accessibility-click'],
              gap: { kind: 'unsupported', reason: 'No host support.' },
            },
          ],
          excluded: [
            { name: 'physical', input: 'physical', inputSource: 'derived', requires: ['keyboard'], platforms: ['win32'], reason: 'input' },
          ],
        },
      ]);
    });

    test('lists a legacy callback by its names, or alone when it names none', () => {
      const selection = decideWdioSelection(listed, { story: '{named,plain}', test: 'sec*' }, { platform: 'macos' });
      expect(listWdioSelection(selection, { test: 'sec*' })).toEqual([{ id: 'named', sourcePath: 'named.stories.tsx', tests: ['second'] }]);
      expect(listWdioSelection(decideWdioSelection(listed, { story: 'plain' }, { platform: 'macos' }), {})).toEqual([
        { id: 'plain', sourcePath: 'plain.stories.tsx' },
      ]);
    });

    test('omits excluded when every matching case runs', () => {
      const [story] = listWdioSelection(decideWdioSelection(listed, { story: 'only-physical' }, { platform: 'win32' }), {});
      expect(story).toEqual({
        id: 'only-physical',
        sourcePath: 'only-physical.stories.tsx',
        tests: [{ name: 'physical', input: 'physical', inputSource: 'derived', requires: ['keyboard'] }],
      });
    });
  });
});
