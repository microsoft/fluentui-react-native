import {
  appearanceOptionFromResolved,
  appearanceOptionsFromLegacy,
  normalizeThemeAppearanceRequest,
  resolveThemeAppearance,
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
  });
});
