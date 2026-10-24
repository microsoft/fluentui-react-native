import { PlatformColor } from 'react-native';
import type { ColorValue } from 'react-native';

import { defaultResolvedThemeAppearance } from '../theming/appearance';
import { defaultFlexTokens } from './defaults/defaultTokens';
import { FlexThemeReference } from './flexThemeReference';
import type { PartialFlexTokens } from './flexThemeReference';

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

describe('FlexThemeReference color tone', () => {
  const lightAppearance = { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' } as const;

  it('passes a concrete tone to bases and recipes and keys warm separately', () => {
    const tones: string[] = [];
    const reference = new FlexThemeReference(
      {
        base: (appearance) => {
          tones.push(`base:${appearance.colorTone}`);
          return {};
        },
      },
      (_tokens, appearance) => {
        tones.push(`recipe:${appearance.colorTone}`);
        return {};
      },
    );
    const omitted = reference.resolveFlexTokens(lightAppearance);

    expect(reference.resolveFlexTokens({ ...lightAppearance, colorTone: 'cool' })).toBe(omitted);
    expect(reference.resolveFlexTokens({ ...lightAppearance, colorTone: 'warm' })).not.toBe(omitted);
    expect(tones).toEqual(['base:cool', 'recipe:cool', 'base:warm', 'recipe:warm']);
  });

  it('keeps the complete default interaction values for every tone', () => {
    const reference = new FlexThemeReference();

    for (const colorTone of ['cool', 'warm'] as const) {
      for (const colorScheme of ['light', 'dark'] as const) {
        const tokens = reference.resolveFlexTokens({ ...lightAppearance, colorScheme, colorTone });
        expect(tokens.color).toBe(defaultFlexTokens.color);
      }
    }
  });
});

describe('FlexThemeReference interaction derivation', () => {
  const omitInteraction = (rest: ColorValue) =>
    ({
      color: {
        backgroundNeutralTranslucent: rest,
        hover: { backgroundNeutralTranslucent: undefined },
        pressed: { backgroundNeutralTranslucent: undefined },
      },
    }) as PartialFlexTokens;

  it('derives omitted states from rest with the appearance tone', () => {
    const reference = new FlexThemeReference({}, omitInteraction('#e9e9e980'));
    const cool = reference.resolveFlexTokens(defaultResolvedThemeAppearance).color;
    const warm = reference.resolveFlexTokens({ ...defaultResolvedThemeAppearance, colorTone: 'warm' }).color;

    expect(cool.hover.backgroundNeutralTranslucent).toBe('#dfdfdf8a');
    expect(cool.pressed.backgroundNeutralTranslucent).toBe('#d5d5d594');
    expect(warm.hover.backgroundNeutralTranslucent).toBe('#dcdcd68a');
    expect(warm.pressed.backgroundNeutralTranslucent).toBe('#d2cfc894');
  });

  it('keeps authored interaction values', () => {
    const reference = new FlexThemeReference({}, omitInteraction('#e9e9e980'), {
      color: { hover: { backgroundNeutralTranslucent: '#123456' } },
    });
    const colors = reference.resolveFlexTokens(defaultResolvedThemeAppearance).color;

    expect(colors.hover.backgroundNeutralTranslucent).toBe('#123456');
    expect(colors.pressed.backgroundNeutralTranslucent).toBe('#d5d5d594');
  });

  it('falls back to the same rest value when it cannot be derived', () => {
    const rest = PlatformColor('windowBackgroundColor');
    const reference = new FlexThemeReference({}, omitInteraction(rest));
    const colors = reference.resolveFlexTokens({ ...defaultResolvedThemeAppearance, colorTone: 'warm' }).color;

    expect(colors.hover.backgroundNeutralTranslucent).toBe(rest);
    expect(colors.pressed.backgroundNeutralTranslucent).toBe(rest);
  });

  it('uses rest in high contrast', () => {
    const reference = new FlexThemeReference({}, omitInteraction('#e9e9e980'));
    const colors = reference.resolveFlexTokens({ ...defaultResolvedThemeAppearance, contrast: 'highContrast' }).color;

    expect(colors.hover.backgroundNeutralTranslucent).toBe('#e9e9e980');
    expect(colors.pressed.backgroundNeutralTranslucent).toBe('#e9e9e980');
  });
});
