---
title: Analyzer — Component State Discovery & Interaction Tests
status: ready
parallelizable: true
blockedBy: [00-setup]
permissions:
  allow:
    - "Bash(yarn:*)"
    - "Bash(npm:*)"
    - "Bash(npx:*)"
    - "Bash(node:*)"
    - "Bash(tsgo:*)"
    - "Bash(tsc:*)"
    - "Bash(jest:*)"
    - "Bash(eslint:*)"
    - "Bash(ls:*)"
    - "Bash(find:*)"
    - "Bash(grep:*)"
    - "Bash(rg:*)"
    - "Bash(cat:*)"
    - "Bash(head:*)"
    - "Bash(tail:*)"
    - "Bash(wc:*)"
    - "Bash(mkdir:*)"
    - "Bash(cp:*)"
    - "Bash(mv:*)"
    - "Bash(touch:*)"
    - "Bash(git status)"
    - "Bash(git diff:*)"
    - "Bash(git log:*)"
    - "Bash(git show:*)"
---

# Component State Discovery & Interaction Tests

## Context

Package: `@fluentui-react-native/analyzer` at `packages/ai/analyzer/`. The setup brief (`00-setup.md`) has created the directory skeleton and shared types in `src/types.ts`. You are filling in `src/component/`.

This part is the "driver" — given a FluentUI RN component, work out **which states need testing** (pressed, focused, hovered, disabled, checked, loading, error, etc.), encode that decision as a serializable **`ComponentMetadata`** object, and then use that metadata to render the component through every state with `@testing-library/react-native` so other analyzers (token map, a11y tree) can be captured per state.

The package already depends on `@testing-library/react-native` (^13.3.3) — this is the first place in the repo to use it; existing component tests use `react-test-renderer` directly. That is fine, but it means you may need to add or align Jest setup for `@testing-library/react-native` matchers. Confirm by running the tests after your first one is in place.

A V1 component for end-to-end reference: `packages/components/Button/src/Button.tsx`. Its slots are `root`, `icon`, `content`, `rippleContainer` (Android), `focusInnerBorder` (Windows).

## Deliverables

All under `packages/ai/analyzer/src/component/`.

### 1. `ComponentMetadata.ts` — the metadata schema

```ts
export interface ComponentStateSpec {
  /** Stable identifier, e.g., 'default', 'disabled', 'pressed', 'focused'. */
  id: string;
  /** Props to pass when rendering this state. */
  props?: Record<string, unknown>;
  /** Interactions to drive the state. Applied in order before snapshotting. */
  interactions?: ComponentInteraction[];
  /** Optional human-readable description. */
  description?: string;
}

export type ComponentInteraction =
  | { kind: 'press'; targetTestID: string }
  | { kind: 'focus'; targetTestID: string }
  | { kind: 'blur'; targetTestID: string }
  | { kind: 'changeText'; targetTestID: string; text: string }
  | { kind: 'scroll'; targetTestID: string; offset: { x: number; y: number } }
  // Extension hook — discourage growth unless a real component needs it.
  | { kind: 'custom'; name: string; payload: unknown };

export interface ComponentMetadata {
  name: string;                      // e.g., 'Button'
  importPath: string;                // e.g., '@fluentui-react-native/button'
  exportName: string;                // e.g., 'Button'
  /** Reasonable default props applied to every state unless overridden. */
  baseProps?: Record<string, unknown>;
  states: ComponentStateSpec[];
}
```

### 2. Agent instructions: `src/component/instructions/state-discovery.md`

Markdown prompt — not code. Given a component's source file(s), the agent should output a `ComponentMetadata` JSON object describing the states worth testing. The prompt must instruct the agent to:

- Identify props that toggle visual states (`disabled`, `loading`, `checked`, `selected`, etc.).
- Identify interactions the component handles (`onPress`, `onFocus`, `onChangeText`, etc.).
- Enumerate state combinations conservatively — don't generate the full Cartesian product; pick a representative cross-section.
- Emit the `ComponentMetadata` JSON literally — no surrounding prose — so it can be parsed.

Keep the prompt under ~200 lines, with one fully-worked example (Button) at the bottom.

### 3. `validateMetadata.ts` — schema check

```ts
import type { ComponentMetadata } from './ComponentMetadata';
import type { AnalyzerIssue } from '../types';

export function validateMetadata(metadata: unknown): {
  metadata: ComponentMetadata | null;
  issues: AnalyzerIssue[];
};
```

- Checks required fields exist with the right types.
- Verifies every interaction `targetTestID` appears at least once in `baseProps`/`states[*].props` as a `testID` value, or warns if it can't be statically verified.
- No runtime dependency on the component being importable — pure shape check.

### 4. `runComponentMatrix.ts` — the driver

```ts
import type { ComponentMetadata, ComponentStateSpec } from './ComponentMetadata';
import type { AnalyzerOutput, RenderNode } from '../types';
import type { ComponentTokenMap } from '../theme';     // from 01
import type { A11yNode } from '../a11y';               // from 02

export interface StateSnapshot {
  state: ComponentStateSpec;
  renderTree: RenderNode;
  a11yTree: A11yNode;
  tokenMap?: ComponentTokenMap;
}

export interface ComponentMatrixOptions {
  /** If supplied, wraps each render with a test theme + records token map per state. */
  themeRegistry?: import('../theme').TokenRegistry;
}

export async function runComponentMatrix(
  Component: React.ComponentType<any>,
  metadata: ComponentMetadata,
  options?: ComponentMatrixOptions,
): Promise<AnalyzerOutput<{ snapshots: StateSnapshot[] }>>;
```

Implementation rules:

- Use `render` from `@testing-library/react-native`.
- For each `state`:
  1. Render `<Component {...baseProps} {...state.props} />` (wrap in `ThemeProvider` if `themeRegistry` is provided).
  2. Apply each interaction in order using `fireEvent` (`press`, `changeText`, etc.) — look up the target by `testID`.
  3. Capture the render tree (`toJSON()`), run `extractA11yTree` from `../a11y`, run `mapComponentToTokens` from `../theme` if a registry was supplied.
  4. Unmount before the next state.
- Do **not** swallow exceptions — if a state fails, the result should surface the error against that state, not abort the whole matrix. Push an `AnalyzerIssue` into the output and continue.

### 5. CLI-ish convenience: `analyzeComponent.ts`

```ts
export interface AnalyzeComponentInput {
  Component: React.ComponentType<any>;
  metadata: ComponentMetadata;
}

export async function analyzeComponent(
  input: AnalyzeComponentInput,
): Promise<{
  matrix: Awaited<ReturnType<typeof runComponentMatrix>>;
  issues: AnalyzerIssue[];                  // a11y issues, validation issues, render errors
}>;
```

Wires the metadata → matrix → a11y rule run end to end, returning a single result object. This is the function an agent will call when handed a component plus its discovered metadata.

### 6. Tests

In `src/component/*.test.ts`:

- `validateMetadata` — accepts a hand-written valid metadata object; rejects with specific issues when fields are missing/mistyped.
- `runComponentMatrix` — hand-write a tiny inline component (`function Toy({ disabled, onPress }) { return <Pressable testID="root" disabled={disabled} onPress={onPress}><Text>Hi</Text></Pressable>; }`) with metadata that exercises `default`, `disabled`, and `pressed` states. Assert the matrix produces three snapshots with the right `a11yTree.state.disabled` and a `press` interaction was applied.
- `analyzeComponent` — same toy component, assert the wired-up version returns matrix + empty issues.
- One real-component smoke test: `<Button>Hi</Button>` with a minimal metadata describing two states (`default` and `disabled`). Assert the matrix completes without errors and contains two snapshots.

## Done when

- [ ] All deliverables above implemented under `src/component/` with tests.
- [ ] `src/component/index.ts` re-exports the public API.
- [ ] `yarn workspace @fluentui-react-native/analyzer build && test && lint` all pass.
- [ ] `state-discovery.md` exists with a worked Button example.

## Open questions to resolve as you go

- **Hover state** — RN doesn't have hover natively in test renderers. If a component uses `onHoverIn`/`onHoverOut` (FluentUI's `usePressableState` does), `fireEvent` can drive those handlers directly. Make sure the `press`/`focus`/etc. interactions in §1 cover hover via the `custom` extension or add a `hover` kind if it shows up often.
- **Async interactions** — some components use `useState` async work that needs `act()` flushes. `@testing-library/react-native` handles this for synchronous events, but if you find flakes, document the pattern explicitly.

## Out of scope

- Generating metadata automatically from source (that's an agent task driven by `state-discovery.md`, not code in this package).
- Native module / platform-specific behavior — JS render tree only.
