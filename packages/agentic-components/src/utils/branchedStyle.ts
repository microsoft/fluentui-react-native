import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens, ThemeState } from '@fluentui-react-native/design';

type AnyStyle = ViewStyle | ImageStyle | TextStyle;

type BranchVariantKeys<RootState extends string, BranchState extends string> = [BranchState] extends [never]
  ? never
  : BranchState extends string
    ? BranchState | `${RootState}.${BranchState}`
    : never;

/**
 * A flattened style set containing the base style and every defined root,
 * branch, and root/branch combination.
 */
export type BranchedStyles<StyleType extends AnyStyle, RootState extends string, BranchState extends string = never> = {
  base: StyleType;
} & Partial<Record<RootState | BranchVariantKeys<RootState, BranchState>, StyleType>>;

type StyleWithStates<StyleType extends AnyStyle, States extends string> = StyleType & Partial<Record<States, StyleType>>;

/**
 * A hierarchical style definition with base properties, optional root states,
 * optional branch states, and optional branch states nested under each root.
 */
export type StyleDefinition<StyleType extends AnyStyle, RootState extends string, BranchState extends string = never> = StyleType &
  Partial<Record<RootState, StyleWithStates<StyleType, BranchState>>> &
  Partial<Record<BranchState, StyleType>>;

/**
 * Source of active states, either an array of names or an object whose truthy
 * properties indicate active states.
 */
export type StateSource<States extends string> = Partial<Record<States, unknown>> | readonly States[];

/**
 * Factory function for generating a style definition from theme tokens.
 */
export type StyleDefFromTokens<StyleType extends AnyStyle, RootState extends string, BranchState extends string = never> = (
  tokens: FlexTokens,
) => StyleDefinition<StyleType, RootState, BranchState>;

type MergedStates<RootState extends string, BranchState extends string> = RootState | BranchState;

function hasState(source: StateSource<string>, state: string): boolean {
  if (Array.isArray(source)) {
    return source.includes(state);
  }
  return Boolean((source as Partial<Record<string, unknown>>)[state]);
}

/**
 * Picks the first active state according to the supplied precedence order.
 */
export function getActiveState<States extends string>(source: StateSource<string>, states?: readonly States[]): States | undefined {
  for (const state of states ?? []) {
    if (hasState(source, state)) {
      return state;
    }
  }
  return undefined;
}

/**
 * Selects a style in this order: root/branch combination, branch, root, base.
 */
export function pickActiveStyle<StyleType extends AnyStyle, RootState extends string, BranchState extends string = never>(
  state: StateSource<MergedStates<RootState, BranchState>>,
  rootStates: readonly RootState[],
  branchStates: readonly BranchState[] | undefined,
  styles: BranchedStyles<StyleType, RootState, BranchState>,
): StyleType {
  const root = getActiveState(state, rootStates);
  const branch = getActiveState(state, branchStates);
  const combinedKey = root && branch ? (`${root}.${branch}` as BranchVariantKeys<RootState, BranchState>) : undefined;

  return (
    (combinedKey ? (styles as Partial<Record<string, StyleType>>)[combinedKey] : undefined) ??
    (branch ? (styles as Partial<Record<string, StyleType>>)[branch] : undefined) ??
    (root ? (styles as Partial<Record<string, StyleType>>)[root] : undefined) ??
    styles.base
  );
}

function isStyle(value: unknown): value is AnyStyle {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Splits a definition node into a base style and its declared child states.
 */
function splitStyles<StyleType extends AnyStyle>(
  target: Record<string, StyleType>,
  styles: Record<string, unknown>,
  subStates: ReadonlySet<string>,
  baseKey = 'base',
): void {
  const style = {} as StyleType;
  const subStyles: Record<string, StyleType> = {};

  for (const [key, value] of Object.entries(styles)) {
    if (subStates.has(key)) {
      if (value !== undefined) {
        if (!isStyle(value)) {
          throw new TypeError(`State style "${key}" must be an object.`);
        }
        subStyles[key] = value as StyleType;
      }
    } else {
      Object.assign(style, { [key]: value });
    }
  }

  target[baseKey] = style;
  for (const [key, subStyle] of Object.entries(subStyles)) {
    target[baseKey === 'base' ? key : `${baseKey}.${key}`] = { ...style, ...subStyle };
  }
}

/**
 * Flattens a hierarchical style definition and applies base/root inheritance
 * to every style that was explicitly defined.
 */
export function styleDefinitionToBranchedStyles<StyleType extends AnyStyle, RootState extends string, BranchState extends string = never>(
  styles: StyleDefinition<StyleType, RootState, BranchState>,
  rootStates: readonly RootState[],
  branchStates?: readonly BranchState[],
): BranchedStyles<StyleType, RootState, BranchState> {
  const result: Record<string, StyleType> = {};
  const topLevelStates = new Set<string>([...rootStates, ...(branchStates ?? [])]);

  splitStyles(result, styles as Record<string, unknown>, topLevelStates);

  if (branchStates?.length) {
    const branchStateSet = new Set<string>(branchStates);
    for (const root of rootStates) {
      const rootStyle = result[root];
      if (rootStyle) {
        splitStyles(result, rootStyle as Record<string, unknown>, branchStateSet, root);
      }
    }
  }

  return result as BranchedStyles<StyleType, RootState, BranchState>;
}

/**
 * Creates a state style getter that lazily flattens and caches one definition.
 */
export function getStateStyleFactory<StyleType extends AnyStyle, RootState extends string, BranchState extends string = never>(
  definition: StyleDefinition<StyleType, RootState, BranchState>,
  rootStates: readonly RootState[],
  branchStates?: readonly BranchState[],
): (source: StateSource<MergedStates<RootState, BranchState>>) => StyleType {
  let branchedStyles: BranchedStyles<StyleType, RootState, BranchState> | undefined;

  return (source) => {
    branchedStyles ??= styleDefinitionToBranchedStyles(definition, rootStates, branchStates);
    return pickActiveStyle(source, rootStates, branchStates, branchedStyles);
  };
}

/**
 * Creates a state style getter that resolves and caches one definition per
 * ThemeState.
 */
export function getThemedStateStyleFactory<StyleType extends AnyStyle, RootState extends string, BranchState extends string = never>(
  name: string,
  factory: StyleDefFromTokens<StyleType, RootState, BranchState>,
  rootStates: readonly RootState[],
  branchStates?: readonly BranchState[],
): (state: ThemeState, source: StateSource<MergedStates<RootState, BranchState>>) => StyleType {
  const cacheKey = Symbol(name);

  return (state, source) => {
    const cachedStyles = state.themeStyles[cacheKey] as BranchedStyles<StyleType, RootState, BranchState> | undefined;
    const branchedStyles = cachedStyles ?? styleDefinitionToBranchedStyles(factory(state.tokens), rootStates, branchStates);

    if (!cachedStyles) {
      state.themeStyles[cacheKey] = branchedStyles;
    }

    return pickActiveStyle(source, rootStates, branchStates, branchedStyles);
  };
}
