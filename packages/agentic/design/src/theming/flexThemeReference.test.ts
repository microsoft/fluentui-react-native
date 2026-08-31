import { defaultResolvedThemeAppearance } from './appearance';
import { FlexThemeReference } from './flexThemeReference';

const darkAppearance = {
  colorScheme: 'dark',
  contrast: 'standard',
  interfaceLevel: 'base',
} as const;

describe('FlexThemeReference', () => {
  it('resolves one stable token object per appearance', () => {
    const reference = new FlexThemeReference({}, (_tokens, appearance) => ({
      color: {
        backgroundBrandHeavy: appearance.colorScheme === 'dark' ? '#111111' : '#eeeeee',
      },
    }));

    const light = reference.resolveFlexTokens(defaultResolvedThemeAppearance);
    const lightAgain = reference.resolveFlexTokens(defaultResolvedThemeAppearance);
    const dark = reference.resolveFlexTokens(darkAppearance);

    expect(lightAgain).toBe(light);
    expect(dark).not.toBe(light);
    expect(light.color.backgroundBrandHeavy).toBe('#eeeeee');
    expect(dark.color.backgroundBrandHeavy).toBe('#111111');
  });

  it('replaces all appearance identities after invalidation', () => {
    const reference = new FlexThemeReference();
    const before = reference.resolveFlexTokens(defaultResolvedThemeAppearance);

    reference.invalidate();

    expect(reference.revision).toBe(1);
    expect(reference.resolveFlexTokens(defaultResolvedThemeAppearance)).not.toBe(before);
  });

  it('updates recipes and notifies subscribed consumers', () => {
    const reference = new FlexThemeReference();
    const listener = jest.fn();
    reference.addOnThemeChanged(listener);

    reference.update({ color: { backgroundBrandHeavy: '#123456' } });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(reference.resolveFlexTokens(defaultResolvedThemeAppearance).color.backgroundBrandHeavy).toBe('#123456');
  });

  it('inherits source configuration and composes legacy fallbacks from a parent reference', () => {
    const appearanceSource = {
      getSnapshot: () => defaultResolvedThemeAppearance,
      subscribe: () => () => undefined,
    };
    const parent = new FlexThemeReference({
      appearance: { colorScheme: 'dark' },
      fallbackAppearance: darkAppearance,
      appearanceSource,
      legacyFallback: { components: { ParentComponent: { tokens: { parent: true } } } },
    });
    const child = new FlexThemeReference({
      base: parent,
      legacyFallback: { components: { ChildComponent: { tokens: { child: true } } } },
    });

    expect(child.appearanceOptions).toBe(parent.appearanceOptions);
    expect(child.fallbackAppearance).toBe(parent.fallbackAppearance);
    expect(child.appearanceSource).toBe(appearanceSource);
    expect(child.resolveLegacyFallback(darkAppearance)?.components).toEqual({
      ParentComponent: { tokens: { parent: true } },
      ChildComponent: { tokens: { child: true } },
    });
  });

  it('synchronizes a parent invalidation before exposing its revision', () => {
    const parent = new FlexThemeReference();
    const child = new FlexThemeReference({ base: parent });
    const initial = child.resolveFlexTokens(defaultResolvedThemeAppearance);

    parent.invalidate();

    expect(child.revision).toBe(1);
    expect(child.resolveFlexTokens(defaultResolvedThemeAppearance)).not.toBe(initial);
  });
});
