import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens, InteractiveColor, SemanticColorName, SemanticColors } from '../tokens.types';
import type { ThemeState } from '../../types/themeState.types';

import { createStateLevelMap, getThemedStateStyleFactory } from '../../styling/branchedStyle';
import type { StateLevels, StateNames, StateSource, StyleDefinition, StyleDefFromTokens } from '../../styling/branchedStyle';

export type ViewColorStyle = Pick<ViewStyle, 'backgroundColor' | 'borderColor'>;
export type TextColorStyle = Pick<TextStyle, 'color'>;

type ColorStyleKeys = keyof (ViewColorStyle & TextColorStyle);
const colorStyleKeys: readonly ColorStyleKeys[] = ['backgroundColor', 'borderColor', 'color'];

/**
 * A semantic color key available in the Flex tokens.
 */
export type ColorKey = SemanticColorName;

type AnyColorStyle = ViewColorStyle | TextColorStyle;
type ColorKeysForStyle<StyleType extends AnyColorStyle> = { [K in keyof StyleType]: ColorKey };

type ColorStateEntries<StyleType extends AnyColorStyle, Levels extends StateLevels> = Levels extends readonly [
  infer Head extends readonly string[],
  ...infer Tail extends StateLevels,
]
  ? Partial<Record<Head[number], ColorStyleDefinition<StyleType, Tail>>> & ColorStateEntries<StyleType, Tail>
  : unknown;

/**
 * A hierarchical style definition that uses semantic color keys in place of
 * resolved React Native color values.
 */
export type ColorStyleDefinition<StyleType extends AnyColorStyle, Levels extends StateLevels> = ColorKeysForStyle<StyleType> &
  ColorStateEntries<StyleType, Levels>;

interface RawColorDef {
  [key: string]: ColorKey | RawColorDef | undefined;
}
type InheritedColorKeys = Partial<Record<ColorStyleKeys, ColorKey>>;
type RawStyleDef = Record<string, unknown>;
type ColorState = Exclude<keyof InteractiveColor, 'rest'>;

function getColorKey(definition: RawColorDef, key: ColorStyleKeys): ColorKey | undefined {
  const value = definition[key];
  return typeof value === 'string' ? (value as ColorKey) : undefined;
}

function getStateDefinition(definition: RawColorDef, key: string): RawColorDef | undefined {
  const value = definition[key];
  return typeof value === 'object' && value !== null ? value : undefined;
}

function getColorState(state: string | undefined): ColorState | undefined {
  if (state === 'hovered') {
    return 'hover';
  }
  if (state === 'pressed') {
    return 'pressed';
  }
  return undefined;
}

/**
 * Converts semantic color keys into resolved style values while synthesizing
 * hovered and pressed nodes wherever those states are declared. Hovered and
 * pressed nodes read each color's matching state, so a derived state is
 * computed when the style is first built for a theme state.
 */
function convertToStyleDef(
  name: string | undefined,
  parent: InheritedColorKeys | undefined,
  colors: SemanticColors,
  rawColorDef: RawColorDef,
  stateLevels: StateLevels,
  nextLevel: number,
  activeInteractionState?: ColorState,
): RawStyleDef {
  const result: RawStyleDef = {};
  const inheritedKeys: InheritedColorKeys = { ...parent };
  const interactionState = getColorState(name) ?? activeInteractionState;

  for (const styleKey of colorStyleKeys) {
    const colorKey = getColorKey(rawColorDef, styleKey) ?? (interactionState ? parent?.[styleKey] : undefined);
    if (colorKey !== undefined) {
      inheritedKeys[styleKey] = colorKey;
      const colorValue = colors[colorKey]?.[interactionState ?? 'rest'];
      if (colorValue !== undefined) {
        result[styleKey] = colorValue;
      }
    }
  }

  for (let level = nextLevel; level < stateLevels.length; level++) {
    for (const state of stateLevels[level]) {
      const stateDefinition = getStateDefinition(rawColorDef, state);
      const isInteractionState = state === 'hovered' || state === 'pressed';
      if (!stateDefinition && !isInteractionState) {
        continue;
      }

      const subStyle = convertToStyleDef(state, inheritedKeys, colors, stateDefinition ?? {}, stateLevels, level + 1, interactionState);
      if (Object.keys(subStyle).length > 0) {
        result[state] = subStyle;
      }
    }
  }

  return result;
}

/**
 * Creates a token factory that resolves a semantic color definition.
 */
export function colorStyleDef<StyleType extends AnyColorStyle, Levels extends StateLevels>(
  colorDef: ColorStyleDefinition<StyleType, Levels>,
  stateLevels: Levels,
): StyleDefFromTokens<StyleType, Levels> {
  createStateLevelMap(stateLevels);
  return ({ color }: FlexTokens) =>
    convertToStyleDef(undefined, undefined, color, colorDef as RawColorDef, stateLevels, 0) as StyleDefinition<StyleType, Levels>;
}

/**
 * Creates a themed semantic color getter with ordered hierarchy precedence.
 */
export function getThemedColorStyleFactory<StyleType extends AnyColorStyle, Levels extends StateLevels>(
  name: string,
  colorDef: ColorStyleDefinition<StyleType, Levels>,
  stateLevels: Levels,
): (state: ThemeState, source: StateSource<StateNames<Levels>>) => StyleType {
  return getThemedStateStyleFactory(name, colorStyleDef(colorDef, stateLevels), stateLevels);
}
