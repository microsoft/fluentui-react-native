/**
 * Schema for the component-state metadata that drives `runComponentMatrix`.
 *
 * Metadata is meant to be serializable (plain JSON-ish data) so that an
 * agent following `instructions/state-discovery.md` can emit it directly
 * as a JSON literal. Functions, JSX, and other runtime values are
 * deliberately excluded from this shape — the driver supplies the
 * `React.ComponentType` separately at runtime.
 */

/**
 * A single state worth snapshotting for a component.
 *
 * Each state is rendered as a standalone test mount: the analyzer
 * applies `baseProps` from the metadata, then `props` from this entry,
 * then runs each `interactions` step in order before capturing the
 * render tree.
 */
export interface ComponentStateSpec {
  /** Stable identifier, e.g., 'default', 'disabled', 'pressed', 'focused'. */
  id: string;
  /** Props to pass when rendering this state. */
  props?: Record<string, unknown>;
  /** Interactions to drive the state. Applied in order before snapshotting. */
  interactions?: readonly ComponentInteraction[];
  /** Optional human-readable description. */
  description?: string;
}

/**
 * A scripted user action applied to the rendered component before its
 * tree is snapshotted. Each interaction targets a node by `testID`,
 * which the agent must ensure exists somewhere in the component's
 * render output (typically via `baseProps.testID` or a state-specific
 * prop).
 *
 * `hover` corresponds to FluentUI's pressable `onHoverIn`/`onHoverOut`
 * handlers — the analyzer fires the relevant pair directly because the
 * React Native test renderer has no real hover semantics.
 *
 * `custom` is the extension hook: prefer adding a typed kind here if
 * the same pattern shows up in two or more components.
 */
export type ComponentInteraction =
  | { kind: 'press'; targetTestID: string }
  | { kind: 'focus'; targetTestID: string }
  | { kind: 'blur'; targetTestID: string }
  | { kind: 'hover'; targetTestID: string; state: 'in' | 'out' }
  | { kind: 'changeText'; targetTestID: string; text: string }
  | { kind: 'scroll'; targetTestID: string; offset: { x: number; y: number } }
  // Extension hook — discourage growth unless a real component needs it.
  | { kind: 'custom'; name: string; payload: unknown };

/**
 * The full per-component metadata document. One of these describes a
 * component's testable surface; `runComponentMatrix` consumes it to
 * generate snapshots per state.
 */
export interface ComponentMetadata {
  /** Component display name, e.g. 'Button'. */
  name: string;
  /** Module specifier the component is exported from. */
  importPath: string;
  /** Named export within `importPath`. */
  exportName: string;
  /** Reasonable default props applied to every state unless overridden. */
  baseProps?: Record<string, unknown>;
  /** Ordered list of states to render. Must contain at least one entry. */
  states: readonly ComponentStateSpec[];
}
