import type { ThemeState, FlexTokens } from '@fluentui-react-native/design';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

type AnyStyle = ViewStyle | ImageStyle | TextStyle;

/**
 * A branched style takes a style of a certain name and type, which must be defined, then adds the permutations of that style for
 * the roots and branches of the states.
 *
 * For example: BranchedStyle<ViewStyle, 'selected', 'pressed' | 'hovered'> will yield:
 * {
 *   default: ViewStyle;
 *   selected?: ViewStyle;
 *   pressed?: ViewStyle;
 *   hovered?: ViewStyle;
 *   'selected.pressed'?: ViewStyle;
 *   'selected.hovered'?: ViewStyle;
 * }
 *
 * If the BranchState generic is not defined, then the style will only have the root state permutations, so BranchedStyle<ViewStyle, 'hovered' | 'pressed'> will yield:
 * {
 *   default: ViewStyle;
 *   hovered?: ViewStyle;
 *   pressed?: ViewStyle;
 * }
 */
export type BranchedStyles<StyleType extends AnyStyle, RootState extends string, BranchState> = {
  base: StyleType;
} & {
  [K in RootState]?: StyleType;
} & (BranchState extends string
    ? {
        [K in BranchState]?: StyleType;
      } & {
        [K in `${RootState}.${BranchState}`]?: StyleType;
      }
    : {});

export type BranchedStyles2<StyleType extends AnyStyle, RootState extends string, BranchState> = {
  base: StyleType;
} & {
  [K in
    | RootState
    | (BranchState extends string ? BranchState : never)
    | (BranchState extends string ? `${RootState}.${BranchState}` : never)]?: StyleType;
};

type StyleWithStates<StyleType extends AnyStyle, States> = States extends string
  ? StyleType & Partial<Record<States, StyleType>>
  : StyleType;

/**
 * Style definition type, allows declaring a hierarchical style with a base style and optional root and branch states.
 * So for StyleDefinition<ViewStyle, 'selected', 'pressed' | 'hovered'>, the resulting type will be:
 *   ViewStyle & {
 *     selected?: ViewStyle & {
 *       pressed?: ViewStyle;
 *       hovered?: ViewStyle;
 *     };
 *     pressed?: ViewStyle;
 *     hovered?: ViewStyle;
 *   };
 */
export type StyleDefinition<StyleType extends AnyStyle, RootState extends string, BranchState = never> = BranchState extends string
  ? StyleType & Partial<Record<RootState, StyleWithStates<StyleType, BranchState>>> & Partial<Record<BranchState, StyleType>>
  : StyleType & Partial<Record<RootState, StyleType>>;

/**
 * Source of states when resolving a style, either an array of states or an object with state keys and truthy values
 */
export type StateSource<States extends string> = Partial<Record<States, unknown>> | States[];

/**
 * Factory function type for generating theme styles based on theme tokens.
 */
export type StyleDefFromTokens<StyleType extends AnyStyle, RootState extends string, BranchState = never> = (
  tokens: FlexTokens,
) => StyleDefinition<StyleType, RootState, BranchState>;

/**
 *
 */

type MergedStates<RootState extends string, BranchState> = BranchState extends string ? RootState | BranchState : RootState;

/**
 * Utility helper to check if a given state is valid
 * @param source The source of states, either an array of states or an object with state keys
 * @param state The state to check for
 * @returns True if the state is present in the source, false otherwise
 */
function hasState<States extends string>(source: StateSource<States>, state: States): boolean {
  return Array.isArray(source) ? source.includes(state) : Boolean(source[state]);
}

/**
 * Pick the highest precedence state from a source object based on a list of states to check for.
 * @param source The source object containing states as keys, typically a component state object
 * @param states The list of states to check for in order of precedence, the state will be enabled if truthy
 * @returns The highest precedence state found, or undefined if none are found
 */
export function getActiveState<States extends string>(source: StateSource<string>, states?: readonly States[]): States | undefined {
  if (states) {
    for (const state of states) {
      if (hasState(source, state)) {
        return state;
      }
    }
  }
  return undefined;
}

/**
 * Pick the active style from a set of styles based on the current interactive state
 * @param baseName The base name of the style values
 * @param styles The set of interactive styles to pick from
 * @param state The current interactive state of the component
 * @returns The active style based on the current interactive state
 */
export function pickActiveStyle<StyleType extends AnyStyle, RootState extends string, BranchState extends string>(
  state: StateSource<MergedStates<RootState, BranchState>>,
  rootStates: readonly RootState[],
  branchStates: readonly BranchState[] | undefined,
  styles: BranchedStyles<StyleType, RootState, BranchState>,
): StyleType {
  const root = getActiveState(state, rootStates);
  const branch = getActiveState(state, branchStates);
  // try root + branch, then branch, then root, then base
  return ((root && branch && styles[`${root}.${branch}`]) ||
    (branch && styles[branch]) ||
    (root && styles[root]) ||
    styles.base) as StyleType;
}

/**
 * Split a style definition object into a base style and sub-styles for each state and put them into a style sheet.
 * The styles are designed to be used as-is which means that any values in the base style will be inherited by the sub-styles
 * unless they are overridden.
 * @param target The target object to receive the split styles
 * @param styles The style definition object to split
 * @param subStates The list of sub-states to extract from the style definition
 * @param baseKey The key to use for the base style in the target object
 */
function splitStyles<StyleType extends AnyStyle>(
  target: Record<string, StyleType>,
  styles: Record<string, unknown>,
  subStates: readonly string[] | undefined,
  baseKey?: string,
) {
  const style = {} as StyleType;
  const subStyles = {} as Partial<Record<string, StyleType>>;
  for (const key of Object.keys(styles)) {
    if (subStates && subStates.includes(key)) {
      subStyles[key] = styles[key] as StyleType;
    } else {
      style[key] = styles[key];
    }
  }
  target[baseKey ?? 'base'] = style;
  for (const key of Object.keys(subStyles)) {
    const subStyle = subStyles[key];
    const targetKey = baseKey ? `${baseKey}.${key}` : key;
    target[targetKey] = { ...style, ...subStyle };
  }
}

/**
 * Convert a style definition into branched styles
 * @param styles The style definition to convert
 * @param rootStates The list of root states
 * @param branchStates The list of branch states
 * @returns The branched styles derived from the style definition
 */
export function styleDefinitionToBranchedStyles<StyleType extends AnyStyle, RootState extends string, BranchState>(
  styles: StyleDefinition<StyleType, RootState, BranchState>,
  rootStates: readonly RootState[],
  branchStates: readonly BranchState[] | undefined,
): BranchedStyles<StyleType, RootState, BranchState> {
  type ResultType = BranchedStyles<StyleType, RootState, BranchState>;
  const result = {} as ResultType;
  const allStates = [...rootStates, ...(branchStates ?? [])] as MergedStates<RootState, BranchState>[];
  // split out all root and branch states into their own keys, filling in missing styles from the base style
  splitStyles(result, styles, allStates);
  // if there are branch states, then reprocess the root states to split out branch states into their own keys
  if (branchStates) {
    for (const root of rootStates) {
      const rootStyle = result[root];
      if (rootStyle) {
        splitStyles(result, rootStyle as Record<string, unknown>, branchStates as readonly string[], root);
      }
    }
  }
  return result;
}

/**
 * Create a getStateStyle function that will return the correct style for a given state source based on the provided style
 * definition and states. This will build up the branched styles on the first call and then cache them for subsequent calls.
 * @param definition The style definition to use
 * @param rootStates The list of root states
 * @param branchStates The list of branch states
 * @returns A function that takes a state source and returns the corresponding style
 */
export function getStateStyleFactory<StyleType extends AnyStyle, RootState extends string, BranchState extends string>(
  definition: StyleDefinition<StyleType, RootState, BranchState>,
  rootStates: readonly RootState[],
  branchStates?: readonly BranchState[],
): (source: StateSource<MergedStates<RootState, BranchState>>) => StyleType {
  let branchedStyles: BranchedStyles<StyleType, RootState, BranchState>;
  return (source: StateSource<MergedStates<RootState, BranchState>>): StyleType => {
    branchedStyles ??= styleDefinitionToBranchedStyles(definition, rootStates, branchStates);
    return pickActiveStyle(source, rootStates, branchStates, branchedStyles);
  };
}

/**
 * Create a getThemedStateStyle function that will return the correct style for a given state source based on the provided style
 * definition and states given the current theme. This will build up the branched styles once per-theme and then cache them for
 * subsequent calls. This is useful for creating themed styles that can be used in components that support theming.
 * @param name The name of the themed style, used for the symbol
 * @param factory A function that takes theme tokens and returns a style definition
 * @param rootStates The list of root states
 * @param branchStates The list of branch states
 * @returns A function that takes the current theme state and a state source, and returns the corresponding style
 */
export function getThemedStateStyleFactory<StyleType extends AnyStyle, RootState extends string, BranchState extends string>(
  name: string,
  factory: (tokens: FlexTokens) => StyleDefinition<StyleType, RootState, BranchState>,
  rootStates: readonly RootState[],
  branchStates?: readonly BranchState[],
): (state: ThemeState, source: StateSource<MergedStates<RootState, BranchState>>) => StyleType {
  const cacheKey = Symbol(name);
  return (state: ThemeState, source: StateSource<MergedStates<RootState, BranchState>>): StyleType => {
    const cache = state.themeStyles as Record<symbol, BranchedStyles<StyleType, RootState, BranchState>>;
    const branchedStyles = (cache[cacheKey] ??= styleDefinitionToBranchedStyles(factory(state.tokens), rootStates, branchStates));
    return pickActiveStyle(source, rootStates, branchStates, branchedStyles);
  };
}
