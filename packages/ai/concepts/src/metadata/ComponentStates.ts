import type { ComponentState } from '../concepts/states.ts';

import type { ComponentInteraction } from './ComponentInteraction.ts';
import type { ComponentMetadata } from './ComponentMetadata.ts';

/**
 * A single derived state: the prop overrides and interactions needed
 * to drive the component into one snapshot-worthy configuration.
 *
 * `props` is merged over the metadata's `baseProps` at render time;
 * `interactions` are applied in order after mount.
 */
export interface ComponentStateEntry {
  props?: Record<string, unknown>;
  interactions?: readonly ComponentInteraction[];
}

/**
 * The full expanded map of states for a component, keyed by a
 * dash-joined combination string. Keys follow these conventions:
 *
 * - `'default'` — baseline render with only `baseProps`.
 * - `'default-<state>'` — baseline + one declared state.
 * - `'default-<state1>-<state2>'` — baseline + a declared `stateCombo`.
 * - `'<appearance>'` — appearance prop set, no states.
 * - `'<appearance>-<state>'` — appearance + one declared state.
 * - `'<appearance>-<combo>'` — appearance + one declared `stateCombo`.
 * - `'size-<value>'` — size prop set, default appearance, no states.
 * - `'shape-<value>'` — shape prop set, default appearance, no states.
 *
 * State and combo names are emitted in the order declared in the
 * `COMPONENT_STATE_VALUES` constant (canonical ordering) so two
 * metadata documents that declare the same combo produce identical
 * keys.
 */
export type ComponentStates = Readonly<Record<string, ComponentStateEntry>>;

/**
 * Deterministic derivation of the full `ComponentStates` matrix from a
 * `ComponentMetadata` document.
 *
 * The deriver is pure and platform-agnostic. Platform forks (e.g.
 * win32-specific focus borders) are captured at render time by the
 * analyzer; this function does not branch on `metadata.platforms`.
 */
export function deriveComponentStates(metadata: ComponentMetadata): ComponentStates {
  const out: Record<string, ComponentStateEntry> = {};
  const testID = typeof metadata.baseProps?.testID === 'string' ? metadata.baseProps.testID : undefined;

  const branches: readonly { keyPrefix: string; props: Record<string, unknown> }[] = [
    { keyPrefix: 'default', props: {} },
    ...(metadata.appearances ?? []).map((appearance) => ({
      keyPrefix: appearance,
      props: { appearance },
    })),
  ];

  for (const branch of branches) {
    out[branch.keyPrefix] = entry(branch.props);
    for (const state of metadata.states) {
      out[`${branch.keyPrefix}-${state}`] = entry(branch.props, [state], testID);
    }
    for (const combo of metadata.stateCombos ?? []) {
      const sorted = sortStates(combo);
      const comboKey = sorted.join('-');
      out[`${branch.keyPrefix}-${comboKey}`] = entry(branch.props, sorted, testID);
    }
  }

  for (const size of metadata.sizes ?? []) {
    out[`size-${size}`] = entry({ size });
  }
  for (const shape of metadata.shapes ?? []) {
    out[`shape-${shape}`] = entry({ shape });
  }

  return sortKeys(out);
}

function entry(
  branchProps: Record<string, unknown>,
  states: readonly ComponentState[] = [],
  testID?: string,
): ComponentStateEntry {
  const props: Record<string, unknown> = { ...branchProps };
  const interactions: ComponentInteraction[] = [];

  for (const state of states) {
    const driver = STATE_DRIVERS[state];
    if (driver.kind === 'prop') {
      Object.assign(props, driver.props);
    } else if (testID !== undefined) {
      interactions.push(...driver.interactions(testID));
    }
  }

  const result: ComponentStateEntry = {};
  if (Object.keys(props).length > 0) {
    result.props = props;
  }
  if (interactions.length > 0) {
    result.interactions = interactions;
  }
  return result;
}

type StateDriver =
  | { kind: 'prop'; props: Record<string, unknown> }
  | { kind: 'interaction'; interactions: (testID: string) => ComponentInteraction[] };

const STATE_DRIVERS: Record<ComponentState, StateDriver> = {
  disabled: { kind: 'prop', props: { disabled: true } },
  checked: { kind: 'prop', props: { checked: true } },
  hover: {
    kind: 'interaction',
    interactions: (testID) => [{ kind: 'hover', targetTestID: testID, state: 'in' }],
  },
  press: {
    kind: 'interaction',
    interactions: (testID) => [{ kind: 'press', targetTestID: testID }],
  },
  focused: {
    kind: 'interaction',
    interactions: (testID) => [{ kind: 'focus', targetTestID: testID }],
  },
};

const STATE_ORDER: Record<ComponentState, number> = {
  disabled: 0,
  checked: 1,
  hover: 2,
  press: 3,
  focused: 4,
};

function sortStates(states: readonly ComponentState[]): readonly ComponentState[] {
  return [...states].sort((a, b) => STATE_ORDER[a] - STATE_ORDER[b]);
}

function sortKeys(record: Record<string, ComponentStateEntry>): ComponentStates {
  const sorted: Record<string, ComponentStateEntry> = {};
  for (const key of Object.keys(record).sort()) {
    sorted[key] = record[key];
  }
  return sorted;
}
