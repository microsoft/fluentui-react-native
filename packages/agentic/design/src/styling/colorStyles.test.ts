import type { FlexTokens } from '../tokens/flex.types';
import { defaultFlexTokens } from '../tokens/defaultTokens';
import { defaultResolvedThemeAppearance } from '../theming/appearance';
import type { ThemeState } from '../useThemeState';

import { colorStyleDef, getThemedColorStyleFactory } from './colorStyles';
import type { ColorStyleDefinition, ViewColorStyle } from './colorStyles';

const stateLevels = [['selected'], ['disabled', 'pressed', 'hovered']] as const;
const definition: ColorStyleDefinition<ViewColorStyle, typeof stateLevels> = {
  backgroundColor: 'backgroundNeutralSubtle',
  borderColor: 'strokeNeutralTransparent',
  selected: {
    backgroundColor: 'backgroundNeutralHeavy',
    hovered: {
      borderColor: 'strokeNeutralHeavy',
    },
    disabled: {
      backgroundColor: 'backgroundNeutralHeavyDisabled',
      borderColor: 'strokeNeutralDisabled',
    },
  },
  disabled: {
    backgroundColor: 'backgroundNeutralSubtleDisabled',
    borderColor: 'strokeNeutralDisabled',
  },
};

function createThemeState(): ThemeState {
  return {
    tokens: defaultFlexTokens,
    appearance: defaultResolvedThemeAppearance,
    highContrast: false,
    themeStyles: {},
  };
}

describe('colorStyles', () => {
  it('resolves base and explicitly defined semantic colors', () => {
    const tokens = defaultFlexTokens;
    const styles = colorStyleDef(definition, stateLevels)(tokens);

    expect(styles.backgroundColor).toBe(tokens.color.backgroundNeutralSubtle);
    expect(styles.borderColor).toBe(tokens.color.strokeNeutralTransparent);
    expect(styles.selected).toMatchObject({
      backgroundColor: tokens.color.backgroundNeutralHeavy,
    });
    expect(styles.disabled).toEqual({
      backgroundColor: tokens.color.backgroundNeutralSubtleDisabled,
      borderColor: tokens.color.strokeNeutralDisabled,
    });
  });

  it('synthesizes hovered and pressed colors at the base and under root states', () => {
    const tokens = defaultFlexTokens;
    const styles = colorStyleDef(definition, stateLevels)(tokens);

    expect(styles.hovered).toEqual({
      backgroundColor: tokens.color.hover.backgroundNeutralSubtle,
      borderColor: tokens.color.hover.strokeNeutralTransparent,
    });
    expect(styles.pressed).toEqual({
      backgroundColor: tokens.color.pressed.backgroundNeutralSubtle,
      borderColor: tokens.color.pressed.strokeNeutralTransparent,
    });
    expect(styles.selected?.hovered).toEqual({
      backgroundColor: tokens.color.hover.backgroundNeutralHeavy,
      borderColor: tokens.color.hover.strokeNeutralHeavy,
    });
    expect(styles.selected?.pressed).toEqual({
      backgroundColor: tokens.color.pressed.backgroundNeutralHeavy,
      borderColor: tokens.color.pressed.strokeNeutralTransparent,
    });
  });

  it('falls back to rest colors when an interaction map does not override a semantic key', () => {
    const tokens = defaultFlexTokens;
    const levels = [['hovered']] as const;
    const styles = colorStyleDef<ViewColorStyle, typeof levels>(
      {
        backgroundColor: 'backgroundNeutralSubtle',
        hovered: {
          backgroundColor: 'backgroundNeutralHeavyDisabled',
        },
      },
      levels,
    )(tokens);

    expect(styles.hovered?.backgroundColor).toBe(tokens.color.backgroundNeutralHeavyDisabled);
  });

  it('preserves valid falsy color values', () => {
    const tokens = defaultFlexTokens;
    const zeroColorTokens = {
      ...tokens,
      color: {
        ...tokens.color,
        backgroundBrandHeavy: '',
      },
    } satisfies FlexTokens;
    const levels = [['disabled']] as const;
    const styles = colorStyleDef<ViewColorStyle, typeof levels>(
      {
        backgroundColor: 'backgroundBrandHeavy',
      },
      levels,
    )(zeroColorTokens);

    expect(styles.backgroundColor).toBe('');
  });

  it('propagates interaction colors through later hierarchy levels', () => {
    const tokens = defaultFlexTokens;
    const levels = [['selected'], ['pressed', 'hovered'], ['highContrast']] as const;
    const threeLevelDefinition: ColorStyleDefinition<ViewColorStyle, typeof levels> = {
      backgroundColor: 'backgroundNeutralSubtle',
      borderColor: 'strokeNeutralTransparent',
      selected: {
        backgroundColor: 'backgroundNeutralHeavy',
        pressed: {
          highContrast: {
            borderColor: 'strokeNeutralHeavy',
          },
        },
      },
    };
    const styles = colorStyleDef(threeLevelDefinition, levels)(tokens);

    expect(styles.selected?.pressed?.highContrast).toEqual({
      backgroundColor: tokens.color.pressed.backgroundNeutralHeavy,
      borderColor: tokens.color.pressed.strokeNeutralHeavy,
    });
  });

  it('selects state styles and caches resolved definitions per ThemeState', () => {
    const themeState = createThemeState();
    const colors = themeState.tokens.color;
    const getStyle = getThemedColorStyleFactory('test.colors', definition, stateLevels);

    expect(getStyle(themeState, { selected: true, hovered: true })).toEqual({
      backgroundColor: colors.hover.backgroundNeutralHeavy,
      borderColor: colors.hover.strokeNeutralHeavy,
    });
    const cachedEntries = Reflect.ownKeys(themeState.themeStyles).length;

    expect(getStyle(themeState, { selected: true, disabled: true })).toEqual({
      backgroundColor: colors.backgroundNeutralHeavyDisabled,
      borderColor: colors.strokeNeutralDisabled,
    });
    expect(Reflect.ownKeys(themeState.themeStyles)).toHaveLength(cachedEntries);
  });
});
