import type { ColorValue, TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens, SemanticColors, ThemeState } from '@fluentui-react-native/design';

import { getThemedStateStyleFactory } from './branchedStyle';
import type { StateSource, StyleDefinition, StyleDefFromTokens } from './branchedStyle';

export type ViewColorStyle = Pick<ViewStyle, 'backgroundColor' | 'borderColor'>;
export type TextColorStyle = Pick<TextStyle, 'color'>;

type ColorStyleKeys = keyof (ViewColorStyle & TextColorStyle);
const colorStyleKeys: readonly ColorStyleKeys[] = ['backgroundColor', 'borderColor', 'color'];

/**
 * A semantic color key available in the Flex tokens.
 */
export type ColorKey = keyof Omit<SemanticColors, 'hover' | 'pressed'>;

type AnyColorStyle = ViewColorStyle | TextColorStyle;
type ColorKeysForStyle<StyleType extends AnyColorStyle> = { [K in keyof StyleType]: ColorKey };
type ColorStyleWithStates<StyleType extends AnyColorStyle, States> = ColorKeysForStyle<StyleType> &
  Partial<Record<Extract<States, string>, ColorKeysForStyle<StyleType>>>;

/**
 * A hierarchical style definition that uses semantic color keys in place of
 * resolved React Native color values.
 */
export type ColorStyleDefinition<
  StyleType extends AnyColorStyle,
  RootState extends string,
  BranchState = never,
> = ColorKeysForStyle<StyleType> &
  Partial<Record<RootState, ColorStyleWithStates<StyleType, BranchState>>> &
  Partial<Record<Extract<BranchState, string>, ColorKeysForStyle<StyleType>>>;

interface RawColorDef {
  [key: string]: ColorKey | RawColorDef | undefined;
}
type InheritedColorKeys = Partial<Record<ColorStyleKeys, ColorKey>>;
type RawStyleDef = Record<string, unknown>;
type InteractionColors = Partial<Record<ColorKey, ColorValue>>;

function getColorKey(definition: RawColorDef, key: ColorStyleKeys): ColorKey | undefined {
  const value = definition[key];
  return typeof value === 'string' ? (value as ColorKey) : undefined;
}

function getStateDefinition(definition: RawColorDef, key: string): RawColorDef | undefined {
  const value = definition[key];
  return typeof value === 'object' && value !== null ? value : undefined;
}

function getInteractionColors(colors: SemanticColors, state: string | undefined): InteractionColors | undefined {
  if (state === 'hovered') {
    return colors.hover;
  }
  if (state === 'pressed') {
    return colors.pressed;
  }
  return undefined;
}

/**
 * Converts semantic color keys into resolved style values while synthesizing
 * hovered and pressed nodes wherever those states are declared.
 */
function convertToStyleDef(
  name: string | undefined,
  parent: InheritedColorKeys | undefined,
  colors: SemanticColors,
  rawColorDef: RawColorDef,
  rootStates?: readonly string[],
  branchStates?: readonly string[],
): RawStyleDef {
  const result: RawStyleDef = {};
  const inheritedKeys: InheritedColorKeys = { ...parent };
  const interactionColors = getInteractionColors(colors, name);

  for (const styleKey of colorStyleKeys) {
    const colorKey = getColorKey(rawColorDef, styleKey) ?? (interactionColors ? parent?.[styleKey] : undefined);
    if (colorKey !== undefined) {
      inheritedKeys[styleKey] = colorKey;
      const colorValue = interactionColors?.[colorKey] ?? colors[colorKey];
      if (colorValue !== undefined) {
        result[styleKey] = colorValue;
      }
    }
  }

  const childStates = new Set<string>([...(rootStates ?? []), ...(branchStates ?? [])]);
  for (const state of childStates) {
    const stateDefinition = getStateDefinition(rawColorDef, state);
    const isInteractionState = state === 'hovered' || state === 'pressed';
    if (!stateDefinition && !isInteractionState) {
      continue;
    }

    const nestedRootStates = rootStates?.includes(state) ? branchStates : undefined;
    const subStyle = convertToStyleDef(state, inheritedKeys, colors, stateDefinition ?? {}, nestedRootStates);
    if (Object.keys(subStyle).length > 0) {
      result[state] = subStyle;
    }
  }

  return result;
}

/**
 * Creates a token factory that resolves a semantic color definition.
 */
export function colorStyleDef<StyleType extends AnyColorStyle, RootState extends string, BranchState extends string = never>(
  colorDef: ColorStyleDefinition<StyleType, RootState, BranchState>,
  rootStates: readonly RootState[],
  branchStates?: readonly BranchState[],
): StyleDefFromTokens<StyleType, RootState, BranchState> {
  return ({ color }: FlexTokens) =>
    convertToStyleDef(undefined, undefined, color, colorDef as RawColorDef, rootStates, branchStates) as StyleDefinition<
      StyleType,
      RootState,
      BranchState
    >;
}

/**
 * Creates a themed semantic color getter with root/branch state precedence.
 */
export function getThemedColorStyleFactory<StyleType extends AnyColorStyle, RootState extends string, BranchState extends string = never>(
  name: string,
  colorDef: ColorStyleDefinition<StyleType, RootState, BranchState>,
  rootStates: readonly RootState[],
  branchStates?: readonly BranchState[],
): (state: ThemeState, source: StateSource<RootState | BranchState>) => StyleType {
  return getThemedStateStyleFactory(name, colorStyleDef(colorDef, rootStates, branchStates), rootStates, branchStates);
}
