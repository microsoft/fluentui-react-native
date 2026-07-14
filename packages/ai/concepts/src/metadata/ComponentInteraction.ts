/**
 * A scripted user action applied to a rendered component before its
 * tree is snapshotted. Each interaction targets a node by `testID`,
 * which the metadata's `baseProps.testID` typically supplies.
 *
 * `hover` corresponds to FluentUI's pressable `onHoverIn`/`onHoverOut`
 * handlers — the analyzer fires the relevant pair directly because the
 * React Native test renderer has no real hover semantics.
 *
 * `custom` is the extension hook: discourage growth unless a real
 * component requires it.
 */
export type ComponentInteraction =
  | { kind: 'press'; targetTestID: string }
  | { kind: 'focus'; targetTestID: string }
  | { kind: 'blur'; targetTestID: string }
  | { kind: 'hover'; targetTestID: string; state: 'in' | 'out' }
  | { kind: 'changeText'; targetTestID: string; text: string }
  | { kind: 'scroll'; targetTestID: string; offset: { x: number; y: number } }
  | { kind: 'custom'; name: string; payload: unknown };
