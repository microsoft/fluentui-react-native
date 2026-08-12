export type BaseInteractiveStates = 'disabled' | 'hovered' | 'pressed';
export type BaseInteractiveStatesWithSelected = BaseInteractiveStates | 'selected' | 'selectedDisabled';

/**
 * Interactive states are resolved in order of precedence, with later states taking precedence over earlier ones.
 *
 * Root states are the states that can be built on by other states.
 * Branch states are the higher precedence states that either override or build on root states.
 *
 * - States earlier in the list take precedence over later states
 * - More specific states take precedence over less specific states
 * - Not all variants need to be defined, the state resolution will return a precedence lookup for how to apply states
 *
 * Example:
 * - if a component is selected and hovered, the state resolution will return ['selected.hovered', 'hovered', 'selected'] to apply styles in that order
 * - if selected.hovered is not defined, it will fall back to hovered, then selected
 */
const ROOT_STATES = ['selected'] as const;
type RootInteractiveState = (typeof ROOT_STATES)[number];

const BRANCH_STATES = ['disabled', 'pressed', 'hovered'] as const;
type BranchInteractiveState = (typeof BRANCH_STATES)[number];

export type InteractiveState = RootInteractiveState | BranchInteractiveState;
export type SubStates<Base extends string, States extends string> = `${Base}.${States}`;
export type AllInteractiveStates = InteractiveState | SubStates<RootInteractiveState, BranchInteractiveState>;
export type NamedInteractiveStates<Base extends string> = Base | `${Base}.${AllInteractiveStates}`;

/**
 * Definition for a typed set of styles that can be applied to a component based on its interactive state
 */
export type InteractiveStyles<BaseName extends string, StyleType extends {}> = {
  BaseName: StyleType;
} & Partial<Record<NamedInteractiveStates<BaseName>, StyleType>>;

/**
 * Pick the highest precedence state from a source object based on a list of states to check for.
 * @param source The source object containing states as keys
 * @param states The list of states to check for in order of precedence
 * @returns The highest precedence state found, or undefined if none are found
 */
function getState<States extends string>(source: Partial<Record<States, unknown>>, states: readonly States[]): States | undefined {
  for (const state of states) {
    if (source[state]) {
      return state;
    }
  }
  return undefined;
}

/**
 * Get the active interactive states from a given state object, returning them in order of precedence.
 * @param state The state object containing interactive states as keys
 * @returns An array of active interactive states in order of precedence
 */
export function getActiveState<States extends string>(state: Partial<Record<States, unknown>>): AllInteractiveStates[] {
  const root = getState<RootInteractiveState>(state, ROOT_STATES);
  const branch = getState<BranchInteractiveState>(state, BRANCH_STATES);
  if (root && branch) {
    return [`${root}.${branch}` as AllInteractiveStates, branch, root];
  }
  return root ? [root] : branch ? [branch] : [];
}

/**
 * Pick the active style from a set of styles based on the current interactive state
 * @param baseName The base name of the style values
 * @param styles The set of interactive styles to pick from
 * @param state The current interactive state of the component
 * @returns The active style based on the current interactive state
 */
export function pickActiveStyle<BaseName extends string, StyleType extends {}>(
  baseName: BaseName,
  styles: InteractiveStyles<BaseName, StyleType>,
  state: Partial<Record<AllInteractiveStates, unknown>>,
): StyleType {
  const root = getState<RootInteractiveState>(state, ROOT_STATES);
  const branch = getState<BranchInteractiveState>(state, BRANCH_STATES);
  return ((root && branch && styles[`${baseName}.${root}.${branch}`]) ||
    (branch && styles[`${baseName}.${branch}`]) ||
    (root && styles[`${baseName}.${root}`]) ||
    styles.BaseName) as StyleType;
}
