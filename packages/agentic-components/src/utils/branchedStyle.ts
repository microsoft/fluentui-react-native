import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens, ThemeState } from '@fluentui-react-native/design';

type AnyStyle = ViewStyle | ImageStyle | TextStyle;

/**
 * Ordered hierarchy levels. Each level contains mutually exclusive states in
 * precedence order.
 */
export type StateLevels = readonly (readonly string[])[];

/**
 * Every state declared in a hierarchy.
 */
export type StateNames<Levels extends StateLevels> = Levels[number][number];

type StateEntries<StyleType extends AnyStyle, Levels extends StateLevels> = Levels extends readonly [
  infer Head extends readonly string[],
  ...infer Tail extends StateLevels,
]
  ? Partial<Record<Head[number], StyleDefinition<StyleType, Tail>>> & StateEntries<StyleType, Tail>
  : unknown;

/**
 * Every valid ordered state path, including paths that skip hierarchy levels
 * to provide fallback styles.
 */
export type StatePath<Levels extends StateLevels> = Levels extends readonly [
  infer Head extends readonly string[],
  ...infer Tail extends StateLevels,
]
  ? Head[number] | StatePath<Tail> | `${Head[number]}.${StatePath<Tail> & string}`
  : never;

/**
 * A flattened style set containing the base style and every explicitly
 * defined state path.
 */
export type BranchedStyles<StyleType extends AnyStyle, Levels extends StateLevels> = {
  base: StyleType;
} & Partial<Record<StatePath<Levels>, StyleType>>;

/**
 * A hierarchical style definition. A state can contain states from any later
 * hierarchy level, while later-level states can also appear at the base as
 * fallbacks.
 */
export type StyleDefinition<StyleType extends AnyStyle, Levels extends StateLevels> = StyleType & StateEntries<StyleType, Levels>;

/**
 * Source of active states, either an array of names or an object whose truthy
 * properties indicate active states.
 */
export type StateSource<States extends string> = Partial<Record<States, unknown>> | readonly States[];

/**
 * Factory function for generating a style definition from theme tokens.
 */
export type StyleDefFromTokens<StyleType extends AnyStyle, Levels extends StateLevels> = (
  tokens: FlexTokens,
) => StyleDefinition<StyleType, Levels>;

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

interface ActiveState {
  level: number;
  name: string;
}

function getActiveStatePaths<Levels extends StateLevels>(source: StateSource<StateNames<Levels>>, stateLevels: Levels): string[] {
  const activeStates: ActiveState[] = [];
  for (const [level, states] of stateLevels.entries()) {
    const name = getActiveState(source, states);
    if (name) {
      activeStates.push({ level, name });
    }
  }

  const combinations: ActiveState[][] = [[]];
  for (const activeState of activeStates) {
    const existingCombinations = [...combinations];
    for (const combination of existingCombinations) {
      combinations.push([...combination, activeState]);
    }
  }

  return combinations
    .filter((combination) => combination.length > 0)
    .sort((left, right) => {
      if (left.length !== right.length) {
        return right.length - left.length;
      }
      for (let index = left.length - 1; index >= 0; index--) {
        const levelDifference = right[index].level - left[index].level;
        if (levelDifference !== 0) {
          return levelDifference;
        }
      }
      return 0;
    })
    .map((combination) => combination.map(({ name }) => name).join('.'));
}

/**
 * Selects the most specific defined state path. Paths with more active states
 * win, followed by paths containing states from deeper hierarchy levels.
 */
export function pickActiveStyle<StyleType extends AnyStyle, Levels extends StateLevels>(
  state: StateSource<StateNames<Levels>>,
  stateLevels: Levels,
  styles: BranchedStyles<StyleType, Levels>,
): StyleType {
  for (const path of getActiveStatePaths(state, stateLevels)) {
    const style = (styles as Partial<Record<string, StyleType>>)[path];
    if (style !== undefined) {
      return style;
    }
  }
  return styles.base;
}

function isStyle(value: unknown): value is AnyStyle {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Creates a state-to-level lookup and rejects ambiguous hierarchies.
 */
export function createStateLevelMap(stateLevels: StateLevels): ReadonlyMap<string, number> {
  const stateLevelMap = new Map<string, number>();

  for (const [level, states] of stateLevels.entries()) {
    for (const state of states) {
      if (stateLevelMap.has(state)) {
        throw new TypeError(`State "${state}" must belong to only one hierarchy level.`);
      }
      stateLevelMap.set(state, level);
    }
  }

  return stateLevelMap;
}

function flattenStyleDefinition<StyleType extends AnyStyle>(
  target: Record<string, StyleType>,
  definition: Record<string, unknown>,
  stateLevelMap: ReadonlyMap<string, number>,
  nextLevel: number,
  path: readonly string[],
  inheritedStyle: StyleType,
): void {
  const localStyle = {} as StyleType;
  const childStates: { definition: StyleType; level: number; name: string }[] = [];

  for (const [key, value] of Object.entries(definition)) {
    const stateLevel = stateLevelMap.get(key);
    if (stateLevel === undefined) {
      Object.assign(localStyle, { [key]: value });
      continue;
    }
    if (stateLevel < nextLevel) {
      throw new TypeError(`State "${key}" cannot be nested beneath a state from the same or a later hierarchy level.`);
    }
    if (value === undefined) {
      continue;
    }
    if (!isStyle(value)) {
      throw new TypeError(`State style "${key}" must be an object.`);
    }
    childStates.push({ definition: value as StyleType, level: stateLevel, name: key });
  }

  const resolvedStyle = { ...inheritedStyle, ...localStyle };
  target[path.length > 0 ? path.join('.') : 'base'] = resolvedStyle;

  for (const child of childStates) {
    flattenStyleDefinition(
      target,
      child.definition as Record<string, unknown>,
      stateLevelMap,
      child.level + 1,
      [...path, child.name],
      resolvedStyle,
    );
  }
}

/**
 * Flattens a hierarchical style definition and applies ancestor inheritance
 * to every explicitly defined state path.
 */
export function styleDefinitionToBranchedStyles<StyleType extends AnyStyle, Levels extends StateLevels>(
  styles: StyleDefinition<StyleType, Levels>,
  stateLevels: Levels,
): BranchedStyles<StyleType, Levels> {
  const result: Record<string, StyleType> = {};
  const stateLevelMap = createStateLevelMap(stateLevels);

  flattenStyleDefinition(result, styles as Record<string, unknown>, stateLevelMap, 0, [], {} as StyleType);

  return result as BranchedStyles<StyleType, Levels>;
}

/**
 * Creates a state style getter that lazily flattens and caches one definition.
 */
export function getStateStyleFactory<StyleType extends AnyStyle, Levels extends StateLevels>(
  definition: StyleDefinition<StyleType, Levels>,
  stateLevels: Levels,
): (source: StateSource<StateNames<Levels>>) => StyleType {
  let branchedStyles: BranchedStyles<StyleType, Levels> | undefined;

  return (source) => {
    branchedStyles ??= styleDefinitionToBranchedStyles(definition, stateLevels);
    return pickActiveStyle(source, stateLevels, branchedStyles);
  };
}

/**
 * Creates a state style getter that resolves and caches one definition per
 * ThemeState.
 */
export function getThemedStateStyleFactory<StyleType extends AnyStyle, Levels extends StateLevels>(
  name: string,
  factory: StyleDefFromTokens<StyleType, Levels>,
  stateLevels: Levels,
): (state: ThemeState, source: StateSource<StateNames<Levels>>) => StyleType {
  const cacheKey = Symbol(name);

  return (state, source) => {
    const cachedStyles = state.themeStyles[cacheKey] as BranchedStyles<StyleType, Levels> | undefined;
    const branchedStyles = cachedStyles ?? styleDefinitionToBranchedStyles(factory(state.tokens), stateLevels);

    if (!cachedStyles) {
      state.themeStyles[cacheKey] = branchedStyles;
    }

    return pickActiveStyle(source, stateLevels, branchedStyles);
  };
}
