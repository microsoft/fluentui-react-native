import { useFlexTokens } from '@fluentui-react-native/design';
import type { FlexTokens, ThemeState } from '@fluentui-react-native/design';

import { colorStyleDef, getThemedColorStyleFactory } from './colorStyles';
import type { ColorStyleDefinition, ViewColorStyle } from './colorStyles';

type RootState = 'selected';
type BranchState = 'disabled' | 'pressed' | 'hovered';

const rootStates = ['selected'] as const;
const branchStates = ['disabled', 'pressed', 'hovered'] as const;
const definition: ColorStyleDefinition<ViewColorStyle, RootState, BranchState> = {
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
    tokens: useFlexTokens(),
    highContrast: false,
    themeStyles: {},
  };
}

describe('colorStyles', () => {
  it('resolves base and explicitly defined semantic colors', () => {
    const tokens = useFlexTokens();
    const styles = colorStyleDef(definition, rootStates, branchStates)(tokens);

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
    const tokens = useFlexTokens();
    const styles = colorStyleDef(definition, rootStates, branchStates)(tokens);

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
    const tokens = useFlexTokens();
    const styles = colorStyleDef<ViewColorStyle, 'hovered'>(
      {
        backgroundColor: 'backgroundNeutralSubtle',
        hovered: {
          backgroundColor: 'backgroundNeutralHeavyDisabled',
        },
      },
      ['hovered'],
    )(tokens);

    expect(styles.hovered?.backgroundColor).toBe(tokens.color.backgroundNeutralHeavyDisabled);
  });

  it('preserves valid falsy color values', () => {
    const tokens = useFlexTokens();
    const zeroColorTokens = {
      ...tokens,
      color: {
        ...tokens.color,
        backgroundBrandHeavy: '',
      },
    } satisfies FlexTokens;
    const styles = colorStyleDef<ViewColorStyle, 'disabled'>(
      {
        backgroundColor: 'backgroundBrandHeavy',
      },
      ['disabled'],
    )(zeroColorTokens);

    expect(styles.backgroundColor).toBe('');
  });

  it('selects state styles and caches resolved definitions per ThemeState', () => {
    const themeState = createThemeState();
    const colors = themeState.tokens.color;
    const getStyle = getThemedColorStyleFactory('test.colors', definition, rootStates, branchStates);

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
