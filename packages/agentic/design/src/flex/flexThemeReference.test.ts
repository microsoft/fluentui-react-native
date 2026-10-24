import { PlatformColor } from 'react-native';
import type { ColorValue } from 'react-native';

import { defaultResolvedThemeAppearance } from '../theming/appearance';
import { flexColor, selectColorEntry } from './colors/flexColor';
import { deriveInteractionColor } from './colors/interactionPolicy';
import { defaultFlexTokenDescription, defaultFlexTokens } from './defaults/defaultTokens';
import { FlexThemeReference } from './flexThemeReference';
import type { FlexTokenDescription, PartialFlexTokens } from './tokens.types';

const darkAppearance = {
  colorScheme: 'dark',
  contrast: 'standard',
  interfaceLevel: 'base',
} as const;

describe('FlexThemeReference', () => {
  it('resolves one stable token object per appearance', () => {
    const reference = new FlexThemeReference({}, (_description, appearance) => ({
      color: {
        backgroundBrandHeavy: appearance.colorScheme === 'dark' ? '#111111' : '#eeeeee',
      },
    }));

    const light = reference.resolveFlexTokens(defaultResolvedThemeAppearance);
    const lightAgain = reference.resolveFlexTokens(defaultResolvedThemeAppearance);
    const dark = reference.resolveFlexTokens(darkAppearance);

    expect(lightAgain).toBe(light);
    expect(dark).not.toBe(light);
    expect(light.color.backgroundBrandHeavy.rest).toBe('#eeeeee');
    expect(dark.color.backgroundBrandHeavy.rest).toBe('#111111');
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
    expect(reference.resolveFlexTokens(defaultResolvedThemeAppearance).color.backgroundBrandHeavy.rest).toBe('#123456');
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
      (_description, appearance) => {
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
        expect(tokens.color).toEqual(defaultFlexTokens.color);
      }
    }
  });
});

describe('FlexThemeReference interaction derivation', () => {
  const omitInteraction = (rest: ColorValue): PartialFlexTokens => ({ color: { backgroundNeutralTranslucent: rest } });

  it('derives omitted states from rest with the appearance tone', () => {
    const reference = new FlexThemeReference({}, omitInteraction('#e9e9e980'));
    const cool = reference.resolveFlexTokens(defaultResolvedThemeAppearance).color;
    const warm = reference.resolveFlexTokens({ ...defaultResolvedThemeAppearance, colorTone: 'warm' }).color;

    expect(cool.backgroundNeutralTranslucent.hover).toBe('#dfdfdf8a');
    expect(cool.backgroundNeutralTranslucent.pressed).toBe('#d5d5d594');
    expect(warm.backgroundNeutralTranslucent.hover).toBe('#dcdcd68a');
    expect(warm.backgroundNeutralTranslucent.pressed).toBe('#d2cfc894');
  });

  it('keeps authored interaction values', () => {
    const reference = new FlexThemeReference(
      {},
      {
        color: { backgroundNeutralTranslucent: { rest: '#e9e9e980', hover: '#123456' } },
      },
    );
    const colors = reference.resolveFlexTokens(defaultResolvedThemeAppearance).color;

    expect(colors.backgroundNeutralTranslucent.hover).toBe('#123456');
    expect(colors.backgroundNeutralTranslucent.pressed).toBe('#d5d5d594');
  });

  it('falls back to the same rest value when it cannot be derived', () => {
    const rest = PlatformColor('windowBackgroundColor');
    const reference = new FlexThemeReference({}, omitInteraction(rest));
    const colors = reference.resolveFlexTokens({ ...defaultResolvedThemeAppearance, colorTone: 'warm' }).color;

    expect(colors.backgroundNeutralTranslucent.rest).toBe(rest);
    expect(colors.backgroundNeutralTranslucent.hover).toBe(rest);
    expect(colors.backgroundNeutralTranslucent.pressed).toBe(rest);
  });

  it('uses rest in high contrast', () => {
    const reference = new FlexThemeReference({}, omitInteraction('#e9e9e980'));
    const colors = reference.resolveFlexTokens({ ...defaultResolvedThemeAppearance, contrast: 'highContrast' }).color;

    expect(colors.backgroundNeutralTranslucent.hover).toBe('#e9e9e980');
    expect(colors.backgroundNeutralTranslucent.pressed).toBe('#e9e9e980');
  });

  it('replaces a color atomically so earlier explicit states do not leak', () => {
    const parent = new FlexThemeReference({
      base: { color: { backgroundBrandHeavy: { rest: '#0f6cbd', hover: '#111111', pressed: '#222222' } } },
    });
    const child = new FlexThemeReference({ base: parent }, { color: { backgroundBrandHeavy: flexColor('#0f6cbd', 'inverted') } });
    const color = child.resolveFlexTokens(defaultResolvedThemeAppearance).color.backgroundBrandHeavy;

    expect(parent.resolveFlexTokens(defaultResolvedThemeAppearance).color.backgroundBrandHeavy.hover).toBe('#111111');
    expect(color.hover).toBe(
      deriveInteractionColor('#0f6cbd', 'backgroundBrandHeavy', 'hover', 'inverted', defaultResolvedThemeAppearance),
    );
    expect(color.hover).not.toBe('#111111');
  });

  it('derives a plain override as standard unless flexColor marks it inverted', () => {
    const plain = new FlexThemeReference({}, { color: { backgroundBrandHeavy: '#0f6cbd' } });
    const inverted = new FlexThemeReference({}, { color: { backgroundBrandHeavy: flexColor('#0f6cbd', 'inverted') } });
    const appearance = { ...defaultResolvedThemeAppearance, colorTone: 'cool' } as const;

    expect(plain.resolveFlexTokens(appearance).color.backgroundBrandHeavy.hover).toBe(
      deriveInteractionColor('#0f6cbd', 'backgroundBrandHeavy', 'hover', 'standard', appearance),
    );
    expect(inverted.resolveFlexTokens(appearance).color.backgroundBrandHeavy.hover).toBe(
      deriveInteractionColor('#0f6cbd', 'backgroundBrandHeavy', 'hover', 'inverted', appearance),
    );
  });

  it('selects light and dark tuple entries for each scheme', () => {
    const reference = new FlexThemeReference({
      base: { color: { surfaceNeutralFarther: { rest: ['#fafafa', '#1f1f1f'], hover: ['#f0f0f0', '#292929'] } } },
    });

    expect(reference.resolveFlexTokens(defaultResolvedThemeAppearance).color.surfaceNeutralFarther).toMatchObject({
      rest: '#fafafa',
      hover: '#f0f0f0',
    });
    expect(reference.resolveFlexTokens(darkAppearance).color.surfaceNeutralFarther).toMatchObject({ rest: '#1f1f1f', hover: '#292929' });
  });
});

describe('FlexThemeReference authored descriptions', () => {
  it('passes recipes the accumulated authored description', () => {
    const descriptions: FlexTokenDescription[] = [];
    const reference = new FlexThemeReference(
      { base: { color: { surfaceNeutralFarther: ['#fafafa', '#1f1f1f'] } } },
      (description, appearance) => {
        descriptions.push(description);
        return { color: { foregroundNeutralPrimary: selectColorEntry(description.color.surfaceNeutralFarther.rest, appearance) } };
      },
    );

    expect(reference.resolveFlexTokens(darkAppearance).color.foregroundNeutralPrimary.rest).toBe('#1f1f1f');
    expect(descriptions[0].color.backgroundBrandHeavy).toBe(defaultFlexTokenDescription.color.backgroundBrandHeavy);
    expect(descriptions[0].color.backgroundBrandHeavy.type).toBe('inverted');
    expect(Object.isFrozen(descriptions[0].color.surfaceNeutralFarther)).toBe(true);
  });

  it('shares the default description when nothing is authored', () => {
    const descriptions: FlexTokenDescription[] = [];
    const reference = new FlexThemeReference({}, (description) => {
      descriptions.push(description);
      return {};
    });
    reference.resolveFlexTokens(defaultResolvedThemeAppearance);

    expect(descriptions[0]).toBe(defaultFlexTokenDescription);
  });

  it('rejects resolved tokens as authored input', () => {
    const reference = new FlexThemeReference({}, defaultFlexTokens as unknown as PartialFlexTokens);

    expect(() => reference.resolveFlexTokens(defaultResolvedThemeAppearance)).toThrow('resolved InteractiveColor');
  });

  it('rejects the removed color state maps with a migration message', () => {
    const reference = new FlexThemeReference({}, { color: { hover: { backgroundBrandHeavy: '#123456' } } } as unknown as PartialFlexTokens);

    expect(() => reference.resolveFlexTokens(defaultResolvedThemeAppearance)).toThrow('color.hover maps are no longer supported');
  });
});
