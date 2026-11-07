import {
  accessibleLaneMaskedFeatures,
  matchesDesktopPlatforms,
  matchesDesktopScope,
  mergeDesktopCaseOptions,
  resolveDesktopInput,
  resolveDesktopScopeDomains,
  resolveDesktopScopeValues,
  unmaskedAccessibleFeatures,
  validateDesktopCaseOptions,
  validateDesktopGroupOptions,
} from './input.js';

describe('accessible lane masks', () => {
  test('lists the features a lane must hide, and fails closed when a host does not report them', () => {
    expect(accessibleLaneMaskedFeatures).toEqual(['keyboard', 'physicalClick', 'wheel']);
    expect(unmaskedAccessibleFeatures({ keyboard: false, physicalClick: false, wheel: false, focus: true })).toEqual([]);
    expect(unmaskedAccessibleFeatures({ keyboard: true, physicalClick: false, wheel: false })).toEqual(['keyboard']);
    expect(unmaskedAccessibleFeatures({ keyboard: false })).toEqual(['physicalClick', 'wheel']);
    expect(unmaskedAccessibleFeatures(undefined)).toEqual(['keyboard', 'physicalClick', 'wheel']);
    expect(unmaskedAccessibleFeatures('masked')).toEqual(['keyboard', 'physicalClick', 'wheel']);
  });
});

describe('desktop option groups', () => {
  const group = (options: object) => validateDesktopGroupOptions(options);
  const kase = (options: object) => validateDesktopCaseOptions(options);

  test('a group cannot declare a gap, because a gap describes one case', () => {
    expect(() => group({ unsupported: { platforms: ['win32'], reason: 'No.' } })).toThrow('declare the gap on the case');
    expect(() => group({ quarantine: { issue: '#1', reason: 'Flaky.', expires: '2099-01-01' } })).toThrow('declare the gap on the case');
  });

  test('composes requirements, platforms and scope, and derives the input from the union', () => {
    const merged = mergeDesktopCaseOptions(
      group({ requires: ['wheel'], platforms: ['!win32'], scope: { 'rn.renderer': ['fabric', 'paper'] } }),
      kase({ requires: ['wheel', 'focus'], platforms: ['windows', 'win32'], scope: { 'rn.renderer': ['fabric'] } }),
    );
    expect(merged).toEqual({
      requires: ['wheel', 'focus'],
      platforms: ['windows'],
      scope: { 'rn.renderer': ['fabric'] },
      input: 'physical',
      inputSource: 'derived',
    });
  });

  test('returns the case unchanged outside any group', () => {
    const options = kase({ requires: ['click'] });
    expect(mergeDesktopCaseOptions(undefined, options)).toBe(options);
  });

  test('lets a group narrow the input, but a nested declaration can never widen or switch it', () => {
    const physical = group({ input: 'physical' });
    expect(mergeDesktopCaseOptions(physical, kase({}))).toMatchObject({ input: 'physical', inputSource: 'declared' });
    expect(mergeDesktopCaseOptions(physical, kase({ input: 'physical' }))).toMatchObject({ input: 'physical' });
    expect(() => mergeDesktopCaseOptions(physical, kase({ input: 'both' }))).toThrow('cannot change the enclosing group');
    expect(() => mergeDesktopCaseOptions(physical, kase({ input: 'accessible' }))).toThrow('cannot change the enclosing group');
    expect(() => mergeDesktopCaseOptions(physical, kase({ requires: ['accessibility-click'] }))).toThrow('cannot widen');
  });

  test('keeps a group that requires a transport from being widened or mixed by a case', () => {
    const keyboard = group({ requires: ['keyboard'] });
    expect(() => mergeDesktopCaseOptions(keyboard, kase({ input: 'both' }))).toThrow('cannot widen');
    expect(() => mergeDesktopCaseOptions(keyboard, kase({ requires: ['accessibility-click'] }))).toThrow('split the case');
  });

  test('an explicit both on a group narrows nothing', () => {
    const open = group({ input: 'both' });
    expect(mergeDesktopCaseOptions(open, kase({ requires: ['keyboard'] }))).toMatchObject({ input: 'physical', inputSource: 'derived' });
    expect(mergeDesktopCaseOptions(open, kase({}))).toMatchObject({ input: 'both', inputSource: 'derived' });
  });

  test('rejects a case that could never run', () => {
    expect(() => mergeDesktopCaseOptions(group({ platforms: ['win32'] }), kase({ platforms: ['!win32'] }))).toThrow('could never run');
    expect(() =>
      mergeDesktopCaseOptions(group({ scope: { 'rn.renderer': ['fabric'] } }), kase({ scope: { 'rn.renderer': ['paper'] } })),
    ).toThrow('could never run');
  });

  test('carries a case gap through its groups', () => {
    const unsupported = { platforms: ['win32'], reason: 'Win32 keeps the cycle behavior.', issue: '#4377' } as const;
    expect(mergeDesktopCaseOptions(group({ requires: ['keyboard'] }), kase({ unsupported }))).toMatchObject({ unsupported });
  });
});

describe('desktop input descriptors', () => {
  test.each([
    [undefined, [], 'both'],
    [undefined, ['click'], 'both'],
    [undefined, ['physical-click'], 'physical'],
    [undefined, ['accessibility-click'], 'accessible'],
    ['accessible', [], 'accessible'],
    ['physical', ['click'], 'physical'],
  ] as const)('derives input from %s and %s', (input, requires, expected) => {
    expect(resolveDesktopInput(input, requires)).toBe(expected);
  });

  test('rejects mixed transports and explicit widening', () => {
    expect(() => resolveDesktopInput(undefined, ['keyboard', 'accessibility-click'])).toThrow('split the case');
    expect(() => resolveDesktopInput('both', ['physical-click'])).toThrow('cannot widen');
    expect(() => resolveDesktopInput('physical', ['accessibility-click'])).toThrow('cannot widen');
  });

  test('validates platform filters and negation', () => {
    expect(matchesDesktopPlatforms(['!win32'], 'windows')).toBe(true);
    expect(matchesDesktopPlatforms(['!win32'], 'win32')).toBe(false);
    expect(() => validateDesktopCaseOptions({ platforms: ['macos', '!win32'] })).toThrow('known');
    expect(() => validateDesktopCaseOptions({ platforms: ['!macos', '!windows', '!win32'] })).toThrow('every platform');
  });

  test('rejects duplicate and unknown requirements', () => {
    expect(() => validateDesktopCaseOptions({ requires: ['click', 'click'] })).toThrow('duplicate');
    expect(() => validateDesktopCaseOptions({ requires: ['input'] })).toThrow('unsupported requirement');
  });
});

describe('desktop scope domains', () => {
  const domains = resolveDesktopScopeDomains({ flavor: ['stable', 'insider'] });
  const supplied = resolveDesktopScopeValues({ 'rn.renderer': 'fabric', flavor: 'stable' }, domains);

  test('merges custom domains with the built-in renderer and reserves rn.*', () => {
    expect(domains).toEqual({ 'rn.renderer': ['fabric', 'paper'], flavor: ['stable', 'insider'] });
    expect(resolveDesktopScopeDomains()).toEqual({ 'rn.renderer': ['fabric', 'paper'] });
    expect(() => resolveDesktopScopeDomains({ 'rn.renderer': ['x'] })).toThrow('reserved');
    expect(() => resolveDesktopScopeDomains({ 'rn.other': ['x'] })).toThrow('reserved');
    expect(() => resolveDesktopScopeDomains({ Flavor: ['x'] })).toThrow('invalid key');
    expect(() => resolveDesktopScopeDomains({ flavor: [] })).toThrow('non-empty');
  });

  test('rejects supplied values outside their domain', () => {
    expect(() => resolveDesktopScopeValues({ unknown: 'a' }, domains)).toThrow('unknown scope key');
    expect(() => resolveDesktopScopeValues({ 'rn.renderer': 'metal' }, domains)).toThrow('must be one of: fabric, paper');
    expect(() => resolveDesktopScopeValues({ flavor: 3 }, domains)).toThrow('must be one of');
    expect(() => resolveDesktopScopeValues({ constructor: 'a' }, domains)).toThrow('unknown scope key');
  });

  test('ORs values within a key and ANDs keys', () => {
    expect(matchesDesktopScope(undefined, supplied, domains)).toBe(true);
    expect(matchesDesktopScope({ 'rn.renderer': ['fabric', 'paper'] }, supplied, domains)).toBe(true);
    expect(matchesDesktopScope({ 'rn.renderer': ['paper'] }, supplied, domains)).toBe(false);
    expect(matchesDesktopScope({ 'rn.renderer': ['fabric'], flavor: ['stable'] }, supplied, domains)).toBe(true);
    expect(matchesDesktopScope({ 'rn.renderer': ['fabric'], flavor: ['insider'] }, supplied, domains)).toBe(false);
  });

  test('treats an undeclared key or value, or an unsupplied key, as a configuration error even when another key excludes', () => {
    expect(() => matchesDesktopScope({ 'rn.renderer': ['paper'], missing: ['a'] }, supplied, domains)).toThrow(
      'unknown scope key "missing"',
    );
    expect(() => matchesDesktopScope({ 'rn.renderer': ['paper'], flavor: ['beta'] }, supplied, domains)).toThrow('"beta"');
    expect(() => matchesDesktopScope({ flavor: ['stable'] }, resolveDesktopScopeValues({}, domains), domains)).toThrow('not supplied');
    const inherited: Record<string, [string, ...string[]]> = JSON.parse('{"constructor":["a"]}');
    expect(() => matchesDesktopScope(inherited, supplied, domains)).toThrow('unknown scope key');
  });
});
