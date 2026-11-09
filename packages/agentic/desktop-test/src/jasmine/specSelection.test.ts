import { createDesktopJasmine } from './adapter.js';
import type { DesktopJasmineApi } from './adapter.js';
import { createDesktopJasmineRegistry } from './registry.js';
import { desktopTestSelectionEnvironment, serializeDesktopTestSelection } from './selection.js';
import { selectDesktopSpecs } from './specSelection.js';
import type { DesktopJasmineEnvironment } from './specSelection.js';

type Node = { id?: string; description: string; children?: Node[] };
type SpecFilter = (spec: unknown) => boolean;

const masked = { keyboard: false, physicalClick: false, wheel: false };
const body = () => undefined;

/** A Jasmine-shaped suite tree that the adapter registers into, and the environment that exposes it. */
function setup(lane?: 'accessible' | 'physical', configured?: SpecFilter) {
  const registry = createDesktopJasmineRegistry({
    [desktopTestSelectionEnvironment]: serializeDesktopTestSelection({
      endpoint: 'win32',
      ...(lane ? { lane } : {}),
      values: { 'rn.renderer': 'paper' },
    }),
  });
  const root: Node = { description: 'top suite', children: [] };
  const stack = [root];
  let next = 0;
  const add = (description: string) => {
    const spec = { id: `spec${next++}`, description };
    stack.at(-1)!.children!.push(spec);
    return spec;
  };
  const api: DesktopJasmineApi = {
    describe(description, suiteBody) {
      const suite: Node = { description, children: [] };
      stack.at(-1)!.children!.push(suite);
      stack.push(suite);
      try {
        suiteBody.call({});
      } finally {
        stack.pop();
      }
    },
    it: (description) => add(description),
    xit: (description) => add(description),
  };
  let specFilter = configured;
  const configure = jest.fn((configuration: { specFilter: SpecFilter }) => {
    specFilter = configuration.specFilter;
  });
  const environment: DesktopJasmineEnvironment = { configuration: () => ({ specFilter }), configure, topSuite: () => root };
  const spec = (description: string) => {
    const found = root.children!.flatMap((child) => (child.children ?? [child]) as Node[]).find((node) => node.description === description);
    if (!found) throw new Error(`No spec named ${description}.`);
    return found;
  };
  return {
    registry,
    environment,
    configure,
    api,
    spec,
    runs: (description: string) => specFilter?.(spec(description)) ?? true,
    ...createDesktopJasmine(api, registry),
  };
}

describe('selectDesktopSpecs preflight', () => {
  test('excludes a spec the host cannot support, so its hooks never run, and leaves the rest', () => {
    const { desktopIt, environment, registry, runs } = setup('physical');
    desktopIt('needs keyboard', { requires: ['keyboard'] }, body);
    desktopIt('needs click', { requires: ['physical-click'] }, body);
    desktopIt('needs nothing', body);

    selectDesktopSpecs(registry, environment, { keyboard: false, physicalClick: true }, 'physical');

    expect([runs('needs keyboard'), runs('needs click'), runs('needs nothing')]).toEqual([false, true, true]);
    expect(registry.entries.get('needs keyboardspec0')).toMatchObject({ kind: 'run', missing: ['keyboard'] });
    expect(registry.entries.get('needs clickspec1')).not.toHaveProperty('missing');
  });

  test('keeps the filter the user already configured', () => {
    const { desktopIt, environment, registry, runs } = setup('physical', (spec) => (spec as Node).description !== 'user filtered');
    desktopIt('user filtered', body);
    desktopIt('needs keyboard', { requires: ['keyboard'] }, body);
    desktopIt('kept', body);

    selectDesktopSpecs(registry, environment, { keyboard: false }, 'physical');

    expect([runs('user filtered'), runs('needs keyboard'), runs('kept')]).toEqual([false, false, true]);
  });

  test('does not touch the filter when the host meets every requirement', () => {
    const { configure, desktopIt, environment, registry } = setup('physical');
    desktopIt('needs keyboard', { requires: ['keyboard'] }, body);

    selectDesktopSpecs(registry, environment, { keyboard: true }, 'physical');

    expect(configure).not.toHaveBeenCalled();
  });

  test('judges a click requirement by what the lane clicks with', () => {
    const physical = setup('physical');
    physical.desktopIt('clicks', { requires: ['click'] }, body);
    selectDesktopSpecs(physical.registry, physical.environment, { physicalClick: false, accessibilityClick: true }, 'physical');
    expect(physical.runs('clicks')).toBe(false);

    const accessible = setup('accessible');
    accessible.desktopIt('clicks', { requires: ['click'] }, body);
    selectDesktopSpecs(accessible.registry, accessible.environment, { ...masked, accessibilityClick: true }, 'accessible');
    expect(accessible.runs('clicks')).toBe(true);
  });
});

describe('selectDesktopSpecs fail-closed checks', () => {
  test('an accessible lane on a host that still offers physical input disables every spec and says why', () => {
    const { desktopIt, environment, registry, runs } = setup('accessible');
    desktopIt('fine', body);

    expect(() => selectDesktopSpecs(registry, environment, { keyboard: true, physicalClick: false }, 'accessible')).toThrow(
      'The accessible input lane needs a host that reports keyboard, wheel disabled, and this one does not.',
    );
    expect(registry.blocked).toBe(true);
    expect(runs('fine')).toBe(false);
  });

  test('a lane whose session did not confirm its input policy disables every spec and says why', () => {
    const { desktopIt, environment, registry, runs } = setup('accessible');
    desktopIt('fine', body);

    expect(() => selectDesktopSpecs(registry, environment, masked, 'compatibility')).toThrow(
      'The accessible input lane needs a session that enforces the accessible input policy, and the driver reported compatibility.',
    );
    expect(registry.blocked).toBe(true);
    expect(runs('fine')).toBe(false);
    expect(() => selectDesktopSpecs(setup('physical').registry, environment, {})).toThrow(
      /physical input policy, and the driver reported none\./,
    );
  });

  test('an absent feature report counts as unmasked', () => {
    const { desktopIt, environment, registry } = setup('accessible');
    desktopIt('fine', body);

    expect(() => selectDesktopSpecs(registry, environment, undefined, 'accessible')).toThrow(/keyboard, physicalClick, wheel disabled/);
  });

  test('an accessible lane on a masked host runs', () => {
    const { desktopIt, environment, registry, runs } = setup('accessible');
    desktopIt('fine', body);

    selectDesktopSpecs(registry, environment, masked, 'accessible');

    expect(registry.blocked).toBe(false);
    expect(runs('fine')).toBe(true);
  });

  test('the physical lane needs no mask', () => {
    const { desktopIt, environment, registry } = setup('physical');
    desktopIt('fine', body);

    expect(() => selectDesktopSpecs(registry, environment, { keyboard: true }, 'physical')).not.toThrow();
  });

  test('a lane refuses specs that were not declared with desktopIt, however many', () => {
    const { api, desktopIt, environment, registry, runs } = setup('physical');
    desktopIt('declared', body);
    api.describe('legacy', () => {
      for (let index = 0; index < 12; index++) api.it(`spec ${index}`, body);
    });

    expect(() => selectDesktopSpecs(registry, environment, {}, 'physical')).toThrow(
      /12 specs were not declared with desktopIt or desktopDescribe: "legacy spec 0", .*"legacy spec 9" and 2 more\./,
    );
    expect(registry.blocked).toBe(true);
    expect(runs('declared')).toBe(false);
  });

  test('a lane cannot be verified without Jasmine, so it blocks', () => {
    const { registry } = setup('physical');

    expect(() => selectDesktopSpecs(registry, undefined, {})).toThrow('Jasmine did not expose its environment');
    expect(registry.blocked).toBe(true);
  });

  test('without a lane, undeclared specs are tolerated', () => {
    const { api, environment, registry } = setup();
    api.it('legacy', body);

    expect(() => selectDesktopSpecs(registry, environment, {})).not.toThrow();
  });

  test('a fault found while registering blocks the run even without a lane, together with any other problem', () => {
    const { environment, registry } = setup('accessible');
    registry.errors.push('Jasmine did not identify the spec registered for "ghost", so its selection cannot be verified.');

    expect(() => selectDesktopSpecs(registry, environment, {}, 'accessible')).toThrow(/ghost[\s\S]*accessible input lane/);
    expect(registry.blocked).toBe(true);
  });
});
