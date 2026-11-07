import { resolveDesktopScopeDomains, resolveDesktopScopeValues, validateDesktopCaseOptions } from './input.js';
import { decideDesktopCase, missingDesktopRequirements, resolveDesktopClickMode } from './selection.js';
import type { DesktopCaseTarget } from './selection.js';

describe('decideDesktopCase', () => {
  const domains = resolveDesktopScopeDomains();
  const target = (overrides: Partial<DesktopCaseTarget> = {}): DesktopCaseTarget => ({
    endpoint: 'windows',
    domains,
    values: resolveDesktopScopeValues({ 'rn.renderer': 'fabric' }, domains),
    now: Date.parse('2026-01-01T00:00:00Z'),
    ...overrides,
  });
  const decide = (options: object, overrides?: Partial<DesktopCaseTarget>) =>
    decideDesktopCase(validateDesktopCaseOptions(options), target(overrides), 'story / case');

  test('runs a case that applies, and ignores the input outside a lane', () => {
    expect(decide({})).toEqual({ kind: 'run' });
    expect(decide({ requires: ['keyboard'] })).toEqual({ kind: 'run' });
    expect(decide({ requires: ['keyboard'] }, { lane: 'physical' })).toEqual({ kind: 'run' });
  });

  test('excludes by the first applicable reason: platform, then scope, then input', () => {
    const options = { platforms: ['macos'], scope: { 'rn.renderer': ['paper'] }, requires: ['keyboard'] };
    expect(decide(options, { lane: 'accessible' })).toEqual({ kind: 'excluded', reason: 'platform' });
    expect(decide({ ...options, platforms: ['windows'] }, { lane: 'accessible' })).toEqual({ kind: 'excluded', reason: 'scope' });
    expect(decide({ ...options, platforms: ['windows'], scope: { 'rn.renderer': ['fabric'] } }, { lane: 'accessible' })).toEqual({
      kind: 'excluded',
      reason: 'input',
    });
  });

  test('keeps a case that runs in both lanes', () => {
    expect(decide({ requires: ['click'] }, { lane: 'accessible' })).toEqual({ kind: 'run' });
    expect(decide({ requires: ['click'] }, { lane: 'physical' })).toEqual({ kind: 'run' });
  });

  test('resolves a declared unsupported case as a gap instead of running or excluding it', () => {
    const unsupported = { platforms: ['windows'], reason: 'Not projected yet.' };
    expect(decide({ unsupported })).toEqual({ kind: 'gap', gap: { kind: 'unsupported', reason: 'Not projected yet.' } });
    expect(decide({ unsupported }, { endpoint: 'macos' })).toEqual({ kind: 'run' });
  });

  test('applies a quarantine to its lane and platforms, and rejects an expired one before anything runs', () => {
    const quarantine = { issue: '#9', reason: 'Flaky.', expires: '2026-06-01', input: 'physical', platforms: ['windows'] };
    expect(decide({ quarantine }, { lane: 'physical' })).toEqual({ kind: 'gap', gap: { kind: 'quarantine', reason: '#9: Flaky.' } });
    expect(decide({ quarantine }, { lane: 'accessible' })).toEqual({ kind: 'run' });
    expect(decide({ quarantine })).toEqual({ kind: 'run' });
    expect(decide({ quarantine }, { endpoint: 'win32', lane: 'physical' })).toEqual({ kind: 'run' });
    expect(() => decide({ quarantine }, { lane: 'physical', now: Date.parse('2026-06-02T00:00:00Z') })).toThrow(
      'Quarantine #9 expired on 2026-06-01.',
    );
  });
});

describe('click mode and requirement preflight', () => {
  test('adapts a click requirement to the lane without falling back to the other transport', () => {
    const descriptor = validateDesktopCaseOptions({ requires: ['click'] });
    const accessibleMode = resolveDesktopClickMode(descriptor, 'auto', 'accessible');
    const physicalMode = resolveDesktopClickMode(descriptor, 'auto', 'physical');
    expect(accessibleMode).toBe('accessibility');
    expect(physicalMode).toBe('physical');
    expect(missingDesktopRequirements(descriptor, { accessibilityClick: true, physicalClick: false }, physicalMode)).toEqual(['click']);
    expect(missingDesktopRequirements(descriptor, { accessibilityClick: false, physicalClick: true }, accessibleMode)).toEqual(['click']);
    expect(missingDesktopRequirements(descriptor, { accessibilityClick: true }, accessibleMode)).toEqual([]);
  });

  test('outside a lane only an accessible case pins its click transport, and the rest keep the configured mode', () => {
    expect(resolveDesktopClickMode(validateDesktopCaseOptions({ requires: ['accessibility-click'] }), 'auto', undefined)).toBe(
      'accessibility',
    );
    expect(resolveDesktopClickMode(validateDesktopCaseOptions({ input: 'accessible' }), 'physical', undefined)).toBe('accessibility');
    // A physical case must not pin physical click, or a host that masks it fails the session instead of reporting unsupported.
    expect(resolveDesktopClickMode(validateDesktopCaseOptions({ requires: ['physical-click'] }), 'auto', undefined)).toBe('auto');
    expect(resolveDesktopClickMode(validateDesktopCaseOptions({ requires: ['keyboard'] }), 'auto', undefined)).toBe('auto');
    expect(resolveDesktopClickMode(validateDesktopCaseOptions({ requires: ['click'] }), 'physical', undefined)).toBe('physical');
    expect(resolveDesktopClickMode(undefined, 'auto', undefined)).toBe('auto');
  });

  test('an automatic click needs either transport, and an absent report meets nothing', () => {
    const click = validateDesktopCaseOptions({ requires: ['click'] });
    expect(missingDesktopRequirements(click, { physicalClick: false, accessibilityClick: false }, 'auto')).toEqual(['click']);
    expect(missingDesktopRequirements(click, { physicalClick: true }, 'auto')).toEqual([]);
    expect(missingDesktopRequirements(validateDesktopCaseOptions({ requires: ['keyboard', 'focus'] }), undefined, 'auto')).toEqual([
      'keyboard',
      'focus',
    ]);
    expect(
      missingDesktopRequirements(
        validateDesktopCaseOptions({ requires: ['element-screenshot', 'set-window-rect'] }),
        { elementScreenshot: true, setWindowRect: false },
        'auto',
      ),
    ).toEqual(['set-window-rect']);
  });
});
