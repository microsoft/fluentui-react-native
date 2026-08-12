import type { SemanticColors, ThemeState, FlexTokens } from '@fluentui-react-native/design';
import type { ViewStyle, TextStyle } from 'react-native';
import type { StyleDefinition, StyleDefFromTokens } from './branchedStyle';
import { getThemedStateStyleFactory } from './branchedStyle';

// the set of color values that can be set on a ViewStyle
export type ViewColorStyle = Pick<ViewStyle, 'backgroundColor' | 'borderColor'>;
// the set of color values that can be set on a TextStyle
export type TextColorStyle = Pick<TextStyle, 'color'>;

type ColorStyleKeys = keyof (ViewColorStyle & TextColorStyle);
const colorStyleKeys: readonly ColorStyleKeys[] = ['backgroundColor', 'borderColor', 'color'] as const;

/**
 * A semantic color key available in the Flex tokens.
 */
export type ColorKey = keyof Omit<SemanticColors, 'hover' | 'pressed'>;
type SemanticColorValues = Omit<SemanticColors, 'hover' | 'pressed'>;

type MapStyleToDef<StyleType extends AnyColorStyle> = { [K in keyof StyleType]: ColorKey };

type AnyColorStyle = ViewColorStyle | TextColorStyle;
type ColorStyleWithStates<StyleType extends AnyColorStyle, States> = States extends string
  ? MapStyleToDef<StyleType> & Partial<Record<States, StyleType>>
  : MapStyleToDef<StyleType>;

/**
 * A ColorStyleDefinition is an equivalent of a StyleDefinition, but instead of using the actual color values, it uses the semantic color keys
 * from the Flex tokens. This allows automatic overloading of hover and pressed states according to the values present in the flex tokens.
 */
export type ColorStyleDefinition<
  StyleType extends AnyColorStyle,
  RootState extends string,
  BranchState = never,
> = BranchState extends string
  ? MapStyleToDef<StyleType> &
      Partial<Record<RootState, ColorStyleWithStates<StyleType, BranchState>>> &
      Partial<Record<BranchState, MapStyleToDef<StyleType>>>
  : MapStyleToDef<StyleType> & Partial<Record<RootState, MapStyleToDef<StyleType>>>;

/**
 * Create a closure that will create a style definition structure from a color definition and a passed in set of theme tokens. If hovered
 * or pressed are included in the set of states, extra handling will be done for any nodes that have hovered/pressed as valid child states.
 * in these cases the color keys will be looked up based on any override values or parent values.
 *
 * @param colorDef The color definition to convert into a style definition.
 * @param rootStates The root states to consider for the style definition.
 * @param branchStates The branch states to consider for the style definition.
 * @returns A closure that will create the style definition based on the provided theme tokens.
 */
export function colorStyleDef<StyleType extends AnyColorStyle, RootState extends string, BranchState extends string>(
  colorDef: ColorStyleDefinition<StyleType, RootState, BranchState>,
  rootStates: readonly RootState[],
  branchStates?: readonly BranchState[],
): StyleDefFromTokens<StyleType, RootState, BranchState> {
  // return the closure that will map the color definition to a style definition based on the provided theme tokens
  return ({ color }: FlexTokens) =>
    convertToStyleDef(undefined, undefined, color, colorDef as RawColorDef, rootStates, branchStates) as StyleDefinition<
      StyleType,
      RootState,
      BranchState
    >;
}

/** Helper types to make the workers more generic */
type RawColorDef = { [K in ColorStyleKeys]?: ColorKey } & { [K in string]?: RawColorDef };
type RawStyleDef = Record<string, unknown>;

/**
 * Worker function for converting a raw color definition into a style definition, resolving the semantic color values from the theme state.
 * and doing special processing to add hover/pressed overrides for the color keys if they are present in the raw color definition.
 * @param name the name of the current state being processed, this will be used to look up the hover/pressed overrides in the theme state if present
 * @param parent the parent raw color definition, used for looking up inherited color keys
 * @param colors the semantic color lookup table from the theme state
 * @param rawColorDef the raw color definition to convert
 * @param l1 the first level of keys to consider for nested color definitions
 * @param l2 the second level of keys to consider for nested color definitions
 * @returns the resulting style definition
 */
function convertToStyleDef(
  name: string | undefined,
  parent: RawColorDef | undefined,
  colors: SemanticColors,
  rawColorDef: RawColorDef,
  l1?: readonly string[],
  l2?: readonly string[],
): RawStyleDef {
  const result: RawStyleDef = {};
  const newParent = { ...parent };
  const allSubkeys = [...(l1 ?? []), ...(l2 ?? [])];
  for (const key of colorStyleKeys) {
    if (name === 'hovered' || name === 'pressed') {
      const lookup = colors[name];
      const colorKey = rawColorDef[key] ?? parent?.[key];
      if (colorKey !== undefined) {
        newParent[key] = colorKey;
        const colorValue = lookup[colorKey] ?? colors[colorKey];
        if (colorValue) {
          result[key] = colorValue;
        }
      }
    } else if (rawColorDef[key] !== undefined) {
      const colorKey = rawColorDef[key];
      if (colorKey && typeof colorKey === 'string' && colorKey in colors) {
        result[key] = colors[colorKey];
        newParent[key] = colorKey;
      }
    }
  }
  for (const key of allSubkeys) {
    const isHoverOrPressed = name === 'hovered' || name === 'pressed';
    const subObject = rawColorDef[key] ?? (isHoverOrPressed ? {} : undefined);
    const subL1 = l1?.includes(key) ? l2 : undefined;
    if (subObject) {
      const subStyle = convertToStyleDef(key, newParent, colors, subObject, subL1);
      if (Object.keys(subStyle).length > 0) {
        result[key] = subStyle;
      }
    }
  }
  return result;
}

/**
 * C
 * @param name The name of the themed style, used for the symbol
 * @param factory A function that takes theme tokens and returns a style definition
 * @param rootStates The list of root states
 * @param branchStates The list of branch states
 * @returns A function that takes the current theme state and a state source, and returns the corresponding style
 */
export function getThemedColorStyleFactory<StyleDef extends AnyColorStyle, RootState extends string, BranchState extends string>(
  name: string,
  colorDef: ColorStyleDefinition<StyleDef, RootState, BranchState>,
  rootStates: readonly RootState[],
  branchStates?: readonly BranchState[],
) {
  return getThemedStateStyleFactory(name, colorStyleDef(colorDef, rootStates, branchStates), rootStates, branchStates);
}
