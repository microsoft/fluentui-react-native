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

type VariantKeys<RootState extends string, BranchState> = BranchState extends string
  ? RootState | BranchState | `${RootState}.${BranchState}`
  : RootState;

type StyleWithStates<StyleType extends AnyStyle, States> = States extends string
  ? StyleType & Partial<Record<States, StyleType>>
  : StyleType;

type StateRecord<States, Target> = States extends string ? Partial<Record<States, Target>> : {};

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
export type StyleDefinition<StyleType extends AnyStyle, RootState extends string, BranchState> = BranchState extends string
  ? StyleType & Partial<Record<RootState, StyleWithStates<StyleType, BranchState>>> & Partial<Record<BranchState, StyleType>>
  : StyleType & Partial<Record<RootState, StyleType>>;

/**
 * Source of states when resolving a style, either an array of states or an object with state keys and truthy values
 */
export type StateSource<States extends string> = Partial<Record<States, unknown>> | States[];

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

function splitStyles<StyleType extends AnyStyle, RootState extends string, BranchState>(
  styles: StyleDefinition<StyleType, RootState, BranchState>,
  rootStates: readonly RootState[],
  branchStates: readonly BranchState[] | undefined,
): [StyleType, Partial<Record<RootState, StyleWithStates<StyleType, BranchState>>>, Partial<Record<BranchState, StyleType>> | undefined] {
  const style = {} as StyleType;
  const rootStyles: Partial<Record<RootState, StyleWithStates<StyleType, BranchState>>> = {};
  const branchStyles: Partial<Record<BranchState, StyleType>> | undefined = branchStates ? {} : undefined;
  // first build the base style and collect any root and branch substyles
  for (const key of Object.keys(styles)) {
    if (rootStates.includes(key as RootState)) {
      rootStyles[key as RootState] = styles[key as keyof StyleType] as StyleWithStates<StyleType, BranchState>;
    } else if (branchStates && branchStates.includes(key as BranchState)) {
      branchStyles[key as BranchState] = styles[key as keyof StyleType] as StyleType;
    } else {
      style[key as keyof StyleType] = styles[key as keyof StyleType];
    }
  }
  return [style, rootStyles, branchStyles];
}

function styleDefinitionToBranchedStyles<StyleType extends AnyStyle, RootState extends string, BranchState>(
  styles: StyleDefinition<StyleType, RootState, BranchState>,
  rootStates: readonly RootState[],
  branchStates: readonly BranchState[] | undefined,
): BranchedStyles<StyleType, RootState, BranchState> {
  type ResultType = BranchedStyles<StyleType, RootState, BranchState>;
  const result = { base: {} as StyleType } as ResultType;
  for (const key )
}

export function branchedStyleFactory<StyleType extends AnyStyle, RootState extends string, BranchState extends string>(
  name: string,
  factory:
    | StyleDefinition<StyleType, RootState, BranchState>
    | ((themeState: ThemeState) => StyleDefinition<StyleType, RootState, BranchState>),
  rootStates: readonly RootState[],
  branchStates?: readonly BranchState[],
): (tokens: FlexTokens, source: StateSource<MergedStates<RootState, BranchState>>) => StyleType {
  return (tokens: FlexTokens, source: StateSource<MergedStates<RootState, BranchState>>): StyleType => {
    const resolvedFactory = typeof factory === 'function' ? factory({ tokens }) : factory;
    return pickActiveStyle(source, rootStates, branchStates, resolvedFactory);
  };
}
