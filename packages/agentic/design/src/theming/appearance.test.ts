import {
  appearanceOptionFromResolved,
  appearanceOptionsFromLegacy,
  internResolvedThemeAppearance,
  legacyThemeAppearanceKey,
  normalizeThemeAppearanceRequest,
  resolveThemeAppearance,
  themeAppearanceKey,
} from './appearance';

describe('structured theme appearance', () => {
  it('resolves requested axes independently', () => {
    const state = resolveThemeAppearance(
      { colorScheme: 'system', contrast: 'highContrast', interfaceLevel: 'system' },
      { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'elevated' },
    );

    expect(state.requested).toEqual({
      colorScheme: 'system',
      contrast: 'highContrast',
      interfaceLevel: 'system',
    });
    expect(state.resolved).toEqual({
      colorScheme: 'dark',
      contrast: 'highContrast',
      interfaceLevel: 'elevated',
      colorTone: 'cool',
    });
  });

  it('shares identities for equivalent requests and resolutions', () => {
    const first = resolveThemeAppearance({ colorScheme: 'system' }, { colorScheme: 'dark' });
    const second = resolveThemeAppearance({ colorScheme: 'system' }, { colorScheme: 'dark' });

    expect(first).toBe(second);
    expect(first.resolved).toBe(second.resolved);
    expect(normalizeThemeAppearanceRequest()).toBe(normalizeThemeAppearanceRequest());
  });

  it.each([
    ['light', { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' }],
    ['dark', { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'base' }],
    ['darkElevated', { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'elevated' }],
    ['highContrast', { colorScheme: 'system', contrast: 'highContrast', interfaceLevel: 'base' }],
    ['dynamic', { colorScheme: 'system', contrast: 'system', interfaceLevel: 'system' }],
  ] as const)('normalizes legacy %s appearance', (legacy, expected) => {
    expect(appearanceOptionsFromLegacy(legacy)).toEqual(expected);
  });

  it('maps structured appearance back to the legacy compatibility union', () => {
    expect(appearanceOptionFromResolved({ colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'elevated' })).toBe('darkElevated');
    expect(appearanceOptionFromResolved({ colorScheme: 'dark', contrast: 'highContrast', interfaceLevel: 'base' })).toBe('highContrast');
    expect(appearanceOptionFromResolved({ colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'base', colorTone: 'warm' })).toBe(
      'dark',
    );
  });
});

describe('color tone', () => {
  const base = { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' } as const;

  it('keeps the historical key for omitted and cool tones and suffixes warm', () => {
    expect(themeAppearanceKey(base)).toBe('light|standard|base');
    expect(themeAppearanceKey({ ...base, colorTone: 'cool' })).toBe('light|standard|base');
    expect(themeAppearanceKey({ ...base, colorTone: 'warm' })).toBe('light|standard|base|warm');
    expect(legacyThemeAppearanceKey({ ...base, colorTone: 'warm' })).toBe('light|standard|base');
  });

  it('interns omitted and cool tones to one normalized identity', () => {
    const omitted = internResolvedThemeAppearance(base);

    expect(omitted).toEqual({ ...base, colorTone: 'cool' });
    expect(internResolvedThemeAppearance({ ...base, colorTone: 'cool' })).toBe(omitted);
    expect(internResolvedThemeAppearance({ ...base, colorTone: 'warm' })).toEqual({ ...base, colorTone: 'warm' });
    expect(Object.isFrozen(omitted)).toBe(true);
  });

  it('records an explicit tone request without changing omitted requests', () => {
    expect(normalizeThemeAppearanceRequest({ colorScheme: 'dark' })).not.toHaveProperty('colorTone');
    expect(normalizeThemeAppearanceRequest({ colorTone: 'cool' })).toMatchObject({ colorTone: 'cool' });
  });

  it('distinguishes omitted from explicit cool requests while sharing the resolved identity', () => {
    const omitted = resolveThemeAppearance({ colorScheme: 'light' });
    const cool = resolveThemeAppearance({ colorScheme: 'light', colorTone: 'cool' });

    expect(omitted).not.toBe(cool);
    expect(omitted.requested).not.toHaveProperty('colorTone');
    expect(cool.requested.colorTone).toBe('cool');
    expect(omitted.resolved).toBe(cool.resolved);
  });

  it('resolves the requested tone before the fallback tone and then cool', () => {
    const warmFallback = { ...base, colorTone: 'warm' } as const;

    expect(resolveThemeAppearance({ colorTone: 'cool' }, {}, warmFallback).resolved.colorTone).toBe('cool');
    expect(resolveThemeAppearance({}, {}, warmFallback).resolved.colorTone).toBe('warm');
    expect(resolveThemeAppearance({}, {}, base).resolved.colorTone).toBe('cool');
    expect(resolveThemeAppearance().resolved.colorTone).toBe('cool');
  });

  it('ignores platform snapshots for tone', () => {
    const snapshot = { colorScheme: 'dark', colorTone: 'warm' } as unknown as Parameters<typeof resolveThemeAppearance>[1];

    expect(resolveThemeAppearance({ colorScheme: 'system' }, snapshot).resolved).toEqual({
      colorScheme: 'dark',
      contrast: 'standard',
      interfaceLevel: 'base',
      colorTone: 'cool',
    });
  });
});
