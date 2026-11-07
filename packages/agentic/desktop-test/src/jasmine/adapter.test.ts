import { createDesktopJasmine } from './adapter.js';
import type { DesktopJasmineApi } from './adapter.js';
import { createDesktopJasmineRegistry, desktopSpecIdentifier, excludedSpecCounts } from './registry.js';
import { desktopTestSelectionEnvironment, serializeDesktopTestSelection } from './selection.js';

type DesktopBody = (done?: (error?: unknown) => void) => unknown;
type Registered = { kind: 'describe' | 'it' | 'xit'; name: string; path: string[]; body?: DesktopBody };

/** Registers what a Jasmine would, and hands back the metadata `it` and `xit` return. */
function fakeJasmine(options: { identify?: boolean } = {}) {
  const registered: Registered[] = [];
  const path: string[] = [];
  let next = 0;
  const spec = (kind: 'it' | 'xit', name: string, body?: DesktopBody) => {
    registered.push({ kind, name, path: [...path], body });
    return options.identify === false ? undefined : { id: `spec${next++}`, description: name };
  };
  const api: DesktopJasmineApi = {
    describe(name, body) {
      registered.push({ kind: 'describe', name, path: [...path] });
      path.push(name);
      try {
        body.call({});
      } finally {
        path.pop();
      }
    },
    it: (name, body) => spec('it', name, body),
    xit: (name) => spec('xit', name),
  };
  return { api, registered };
}

function laneEnvironment(lane?: 'accessible' | 'physical', extra: { testScopes?: unknown; values?: Record<string, string> } = {}) {
  return {
    [desktopTestSelectionEnvironment]: serializeDesktopTestSelection({
      endpoint: 'win32',
      ...(lane ? { lane } : {}),
      ...(extra.testScopes ? { testScopes: extra.testScopes } : {}),
      values: { 'rn.renderer': 'paper', ...extra.values },
    }),
  };
}

function setup(lane?: 'accessible' | 'physical', extra?: Parameters<typeof laneEnvironment>[1], options?: { identify?: boolean }) {
  const registry = createDesktopJasmineRegistry(laneEnvironment(lane, extra));
  const jasmine = fakeJasmine(options);
  return { registry, ...jasmine, ...createDesktopJasmine(jasmine.api, registry) };
}

const body = () => undefined;

describe('desktopIt without a selection', () => {
  test('registers an ordinary spec, so a runner that does not select keeps working', () => {
    const registry = createDesktopJasmineRegistry();
    const { api, registered } = fakeJasmine();
    const { desktopIt } = createDesktopJasmine(api, registry);
    desktopIt('plain', body);
    desktopIt('physical', { requires: ['keyboard'] }, body);

    expect(registered.map(({ kind, name }) => `${kind}:${name}`)).toEqual(['it:plain', 'it:physical']);
    expect(registry.errors).toEqual([]);
  });

  test('still rejects a declaration it cannot read', () => {
    const registry = createDesktopJasmineRegistry();
    const { api, registered } = fakeJasmine();
    const { desktopIt } = createDesktopJasmine(api, registry);
    desktopIt('bad', { requires: ['telepathy' as never] }, body);

    expect(registered).toHaveLength(1);
    expect(() => registered[0].body?.()).toThrow(/unsupported requirement/);
    expect(registry.entries.get('badspec0')).toEqual({ kind: 'invalid' });
  });
});

describe('desktopIt in a lane', () => {
  test('runs what the lane covers and replaces the rest with placeholders that are counted by reason', () => {
    const { desktopIt, registered, registry } = setup('accessible');
    desktopIt('both', body);
    desktopIt('accessible only', { requires: ['accessibility-click'] }, body);
    desktopIt('physical only', { requires: ['keyboard'] }, body);
    desktopIt('macOS only', { platforms: ['macos'] }, body);
    desktopIt('fabric only', { scope: { 'rn.renderer': ['fabric'] } }, body);

    expect(registered.map(({ kind, name }) => `${kind}:${name}`)).toEqual([
      'it:both',
      'it:accessible only',
      'xit:physical only',
      'xit:macOS only',
      'xit:fabric only',
    ]);
    expect(excludedSpecCounts(registry)).toEqual({ platform: 1, scope: 1, input: 1 });
    expect(registry.entries.get('physical onlyspec2')).toEqual({ kind: 'excluded', reason: 'input' });
  });

  test('a case is excluded once, for the first reason that applies', () => {
    const { desktopIt, registry } = setup('accessible');
    desktopIt('everything', { platforms: ['macos'], scope: { 'rn.renderer': ['fabric'] }, requires: ['keyboard'] }, body);

    expect(excludedSpecCounts(registry)).toEqual({ platform: 1, scope: 0, input: 0 });
  });

  test('a declared gap becomes a placeholder that carries its reason, not an excluded case', () => {
    const { desktopIt, registered, registry } = setup('physical');
    desktopIt('known gap', { unsupported: { platforms: ['win32'], reason: 'Not on win32 yet.' } }, body);
    desktopIt('known gap elsewhere', { unsupported: { platforms: ['macos'], reason: 'Not on macOS yet.' } }, body);

    expect(registered.map(({ kind }) => kind)).toEqual(['xit', 'it']);
    expect(registry.entries.get('known gapspec0')).toEqual({ kind: 'gap', gap: { kind: 'unsupported', reason: 'Not on win32 yet.' } });
    expect(excludedSpecCounts(registry)).toEqual({ platform: 0, scope: 0, input: 0 });
  });

  test('an expired quarantine fails that case instead of hiding it', () => {
    const { desktopIt, registered, registry } = setup('physical');
    desktopIt('stale', { quarantine: { issue: '#1', reason: 'Flaky.', expires: '2000-01-01' } }, body);

    expect(registered.map(({ kind }) => kind)).toEqual(['it']);
    expect(() => registered[0].body?.()).toThrow('Quarantine #1 expired on 2000-01-01.');
    expect(registry.entries.get('stalespec0')).toEqual({ kind: 'invalid' });
  });

  test('a custom scope key is checked against the domains the config declared', () => {
    const extra = { testScopes: { flavor: ['dev', 'prod'] }, values: { flavor: 'dev' } };
    const accepted = setup('physical', extra);
    accepted.desktopIt('dev only', { scope: { flavor: ['dev'] } }, body);
    accepted.desktopIt('prod only', { scope: { flavor: ['prod'] } }, body);
    expect(accepted.registered.map(({ kind }) => kind)).toEqual(['it', 'xit']);

    const unknown = setup('physical');
    unknown.desktopIt('typo', { scope: { flavour: ['dev'] } }, body);
    expect(() => unknown.registered[0].body?.()).toThrow(/unknown scope key "flavour"/);
  });

  test('records the spec by the identifier WDIO reports, and faults when Jasmine does not identify it', () => {
    expect(desktopSpecIdentifier({ description: 'a case', id: 'spec7' })).toBe('a casespec7');
    expect(desktopSpecIdentifier({ description: 'a case' })).toBeUndefined();

    const { desktopIt, registry } = setup('physical', undefined, { identify: false });
    desktopIt('anonymous', body);
    expect(registry.errors).toEqual([expect.stringContaining('did not identify the spec registered for "anonymous"')]);
  });
});

describe('desktopDescribe', () => {
  test('adds what a group requires to every case inside it, however deep', () => {
    const { desktopDescribe, desktopIt, registered } = setup('accessible');
    desktopDescribe('group', { requires: ['keyboard'] }, () => {
      desktopIt('inherits', body);
      desktopDescribe('nested', () => desktopIt('also inherits', body));
    });
    desktopIt('outside', body);

    expect(registered.filter(({ kind }) => kind !== 'describe').map(({ kind, name }) => `${kind}:${name}`)).toEqual([
      'xit:inherits',
      'xit:also inherits',
      'it:outside',
    ]);
  });

  test('narrows platforms to the overlap of the group and the case', () => {
    const { desktopDescribe, desktopIt, registered } = setup('physical');
    desktopDescribe('group', { platforms: ['!macos'] }, () => {
      desktopIt('keeps win32', { platforms: ['macos', 'win32'] }, body);
      desktopIt('loses win32', { platforms: ['macos', 'windows'] }, body);
    });

    expect(registered.filter(({ kind }) => kind !== 'describe').map(({ kind, name }) => `${kind}:${name}`)).toEqual([
      'it:keeps win32',
      'xit:loses win32',
    ]);
  });

  test('a case that could never run inside its group is a failing spec, not a silent exclusion', () => {
    const { desktopDescribe, desktopIt, registered } = setup('physical');
    desktopDescribe('group', { platforms: ['macos'] }, () => {
      desktopIt('never', { platforms: ['win32'] }, body);
    });

    const specs = registered.filter(({ kind }) => kind === 'it');
    expect(specs).toHaveLength(1);
    expect(() => specs[0].body?.()).toThrow(/do not overlap the enclosing group's, so it could never run/);
  });

  test('a group cannot declare a gap, so its body does not run and one spec reports why', () => {
    const { desktopDescribe, registered } = setup('physical');
    const inner = jest.fn();
    desktopDescribe('group', { unsupported: { platforms: ['win32'], reason: 'No.' } } as never, inner);

    expect(inner).not.toHaveBeenCalled();
    const specs = registered.filter(({ kind }) => kind === 'it');
    expect(specs).toHaveLength(1);
    expect(() => specs[0].body?.()).toThrow(/cannot declare unsupported or quarantine/);
  });

  test('a group that throws still releases its options for the next group', () => {
    const { desktopDescribe, desktopIt, registered, registry } = setup('accessible');
    expect(() =>
      desktopDescribe('throws', { requires: ['keyboard'] }, () => {
        throw new Error('boom');
      }),
    ).toThrow('boom');
    expect(registry.groups).toEqual([]);

    desktopIt('after', body);
    expect(registered.filter(({ kind }) => kind === 'it' || kind === 'xit').map(({ kind }) => kind)).toEqual(['it']);
  });
});
