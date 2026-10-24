import { createInteractiveColor } from '../colors/interactiveColor';
import type { FlexTokens } from '../tokens.types';
import { defaultFlexTokens } from '../defaults/defaultTokens';
import { defaultResolvedThemeAppearance } from '../../theming/appearance';
import type { ThemeState } from '../../types/themeState.types';

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

    expect(styles.backgroundColor).toBe(tokens.color.backgroundNeutralSubtle.rest);
    expect(styles.borderColor).toBe(tokens.color.strokeNeutralTransparent.rest);
    expect(styles.selected).toMatchObject({
      backgroundColor: tokens.color.backgroundNeutralHeavy.rest,
    });
    expect(styles.disabled).toEqual({
      backgroundColor: tokens.color.backgroundNeutralSubtleDisabled.rest,
      borderColor: tokens.color.strokeNeutralDisabled.rest,
    });
  });

  it('synthesizes hovered and pressed colors at the base and under root states', () => {
    const tokens = defaultFlexTokens;
    const styles = colorStyleDef(definition, stateLevels)(tokens);

    expect(styles.hovered).toEqual({
      backgroundColor: tokens.color.backgroundNeutralSubtle.hover,
      borderColor: tokens.color.strokeNeutralTransparent.hover,
    });
    expect(styles.pressed).toEqual({
      backgroundColor: tokens.color.backgroundNeutralSubtle.pressed,
      borderColor: tokens.color.strokeNeutralTransparent.pressed,
    });
    expect(styles.selected?.hovered).toEqual({
      backgroundColor: tokens.color.backgroundNeutralHeavy.hover,
      borderColor: tokens.color.strokeNeutralHeavy.hover,
    });
    expect(styles.selected?.pressed).toEqual({
      backgroundColor: tokens.color.backgroundNeutralHeavy.pressed,
      borderColor: tokens.color.strokeNeutralTransparent.pressed,
    });
  });

  it('uses the rest value in hovered nodes for colors without interaction states', () => {
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

    expect(styles.hovered?.backgroundColor).toBe(tokens.color.backgroundNeutralHeavyDisabled.rest);
  });

  it('preserves valid falsy color values', () => {
    const tokens = defaultFlexTokens;
    const zeroColorTokens = {
      ...tokens,
      color: {
        ...tokens.color,
        backgroundBrandHeavy: createInteractiveColor('', '', ''),
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
      backgroundColor: tokens.color.backgroundNeutralHeavy.pressed,
      borderColor: tokens.color.strokeNeutralHeavy.pressed,
    });
  });

  it('selects state styles and caches resolved definitions per ThemeState', () => {
    const themeState = createThemeState();
    const colors = themeState.tokens.color;
    const getStyle = getThemedColorStyleFactory('test.colors', definition, stateLevels);

    expect(getStyle(themeState, { selected: true, hovered: true })).toEqual({
      backgroundColor: colors.backgroundNeutralHeavy.hover,
      borderColor: colors.strokeNeutralHeavy.hover,
    });
    const cachedEntries = Reflect.ownKeys(themeState.themeStyles).length;

    expect(getStyle(themeState, { selected: true, disabled: true })).toEqual({
      backgroundColor: colors.backgroundNeutralHeavyDisabled.rest,
      borderColor: colors.strokeNeutralDisabled.rest,
    });
    expect(Reflect.ownKeys(themeState.themeStyles)).toHaveLength(cachedEntries);
  });
});
