import type { ColorValue } from 'react-native';

import type { SemanticColors, ThemeState } from '@fluentui-react-native/design';

/**
 * A semantic color key available in the Flex tokens.
 */
export type ColorKey = keyof Omit<SemanticColors, 'hover' | 'pressed'>;
type SemanticColorValues = Omit<SemanticColors, 'hover' | 'pressed'>;

/**
 * Constant symbol keys to not re-resolve the hover and pressed color overrides on every pass.
 */
const HOVERED_COLORS = Symbol('hoveredColors');
const PRESSED_COLORS = Symbol('pressedColors');

/**
 * The semantic color keys for a component in one visual state.
 */
export type ColorSet = {
  background: ColorKey;
  border: ColorKey;
  foreground: ColorKey;
};

export type BackgroundStyle = {
  backgroundColor: ColorValue;
  borderColor: ColorValue;
};

export type ForegroundStyle = {
  color: ColorValue;
};

type BackgroundStates<States extends string> = `bg.${States}`;
type ForegroundStates<States extends string> = `fg.${States}`;

export type BackgroundStyleSet<States extends string> = {
  bg: BackgroundStyle;
} & Record<BackgroundStates<States>, BackgroundStyle>;

export type ForegroundStyleSet<States extends string> = {
  fg: ForegroundStyle;
} & Record<ForegroundStates<States>, ForegroundStyle>;

export type InteractiveStyleSet<States extends string> = BackgroundStyleSet<States> & ForegroundStyleSet<States>;

function getBackgroundStyle(themeColors: SemanticColorValues, colorSet: ColorSet): BackgroundStyle {
  return {
    backgroundColor: themeColors[colorSet.background],
    borderColor: themeColors[colorSet.border],
  };
}

function getForegroundStyle(themeColors: SemanticColorValues, colorSet: ColorSet): ForegroundStyle {
  return {
    color: themeColors[colorSet.foreground],
  };
}

/**
 * Get the semantic color values from a theme state for resolving colors
 * @param themeState the theme state to get the semantic color values from
 * @param name the name of the state, this will have special handling for 'hovered' and 'pressed' states to resolve override colors
 * @returns the resolved set of SemanticColorValues for the given state name
 */
export function getSemanticColorValues(themeState: ThemeState, name?: string): SemanticColorValues {
  const colors = themeState.tokens.color;
  const cache = themeState.themeStyles as Record<symbol, SemanticColorValues>;
  if (name === 'hovered') {
    return (cache[HOVERED_COLORS] ??= { ...colors, ...colors.hover });
  }
  if (name === 'pressed') {
    return (cache[PRESSED_COLORS] ??= { ...colors, ...colors.pressed });
  }
  return colors;
}

/**
 * Add additional states to the states if not present. Used to ensure that 'hovered' and 'pressed' get added.
 *
 * @param stateKeys the existing state keys
 * @param additionalKeys the additional state keys to ensure are present
 * @returns the updated array of state keys
 */
function ensureStateKeys(stateKeys: string[], additionalKeys: string[]): string[] {
  for (const key of additionalKeys) {
    if (!stateKeys.includes(key)) {
      stateKeys.push(key);
    }
  }
  return stateKeys;
}

/**
 * Builds background and foreground styles for a base color set and each named
 * state.
 *
 * Every key in `states` produces `bg.<state>` and `fg.<state>`. By default,
 * `hovered` and `pressed` are added automatically and reuse the base color keys
 * against the corresponding cached Flex interaction overrides. A partial
 * entry replaces only the specified color keys. Pass `false` as the fourth
 * argument to suppress automatic hovered and pressed styles.
 *
 * @param themeState The current theme state, used to resolve semantic color values.
 * @param base The base color set for the component.
 * @param states A record of named states and their corresponding color sets.
 * @param addHoveredAndPressed Whether to automatically add `hovered` and `pressed` states if not present.
 * @returns An object containing background and foreground styles for the base and each state.
 */
export function buildInteractiveStyles<States extends string>(
  themeState: ThemeState,
  base: ColorSet,
  states: Record<States, Partial<ColorSet> | undefined>,
  addHoveredAndPressed?: true,
): InteractiveStyleSet<States | 'hovered' | 'pressed'>;
export function buildInteractiveStyles<States extends string>(
  themeState: ThemeState,
  base: ColorSet,
  states: Record<States, Partial<ColorSet> | undefined>,
  addHoveredAndPressed: false,
): InteractiveStyleSet<States>;
export function buildInteractiveStyles<States extends string>(
  themeState: ThemeState,
  base: ColorSet,
  states: Record<States, Partial<ColorSet> | undefined>,
  addHoveredAndPressed = true,
): InteractiveStyleSet<States> {
  const baseColors = getSemanticColorValues(themeState);
  const bg = getBackgroundStyle(baseColors, base);
  const fg = getForegroundStyle(baseColors, base);
  const styles: Record<string, BackgroundStyle | ForegroundStyle> = {
    bg,
    fg,
  };
  const stateKeys = addHoveredAndPressed ? ensureStateKeys(Object.keys(states), ['hovered', 'pressed']) : Object.keys(states);
  for (const state of stateKeys) {
    const semanticTarget = getSemanticColorValues(themeState, state);
    const colorSet = { ...base, ...states[state] };
    styles[`bg.${state}`] = getBackgroundStyle(semanticTarget, colorSet);
    styles[`fg.${state}`] = getForegroundStyle(semanticTarget, colorSet);
  }

  return styles as InteractiveStyleSet<States | 'hovered' | 'pressed'>;
}
