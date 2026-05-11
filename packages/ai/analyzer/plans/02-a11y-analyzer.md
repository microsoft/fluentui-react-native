---
title: Analyzer — Accessibility Tree Analyzer
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

# Accessibility Tree Analyzer

## Context

Package: `@fluentui-react-native/analyzer` at `packages/ai/analyzer/`. The setup brief (`00-setup.md`) has created the directory skeleton and shared types in `src/types.ts`. You are filling in `src/a11y/`.

The goal is to give an AI agent the tools to:

1. Reduce a rendered component to a clean, stable **accessibility tree** suitable for checkin as metadata.
2. Run a small set of **rule checks** that catch common a11y errors.
3. Hand an agent a prompt template for performing an accessibility-focused review of a component.

React Native exposes accessibility via props on each element. The relevant ones (gathered from real usage in `packages/components/`):

- `accessible` (boolean)
- `accessibilityRole` (e.g., `'button'`, `'checkbox'`, `'tab'`, `'header'`, `'image'`, `'link'`, `'text'`, `'adjustable'`, `'menu'`, `'menuitem'`)
- `accessibilityLabel`, `accessibilityHint`
- `accessibilityState` (`{ disabled?, selected?, checked?, busy?, expanded? }`)
- `accessibilityValue` (`{ min?, max?, now?, text? }`)
- `accessibilityActions`, `onAccessibilityAction`
- `accessibilityPosInSet`, `accessibilitySetSize`
- `accessibilityLiveRegion` (Android)
- `importantForAccessibility` (Android)
- `accessibilityViewIsModal`, `accessibilityElementsHidden` (iOS)
- `testID` (not strictly a11y, but useful for path identification)

Read `packages/components/RadioGroup/src/__tests__/RadioGroupExperimental.test.tsx` for the most accessibility-aware test pattern in the repo currently.

## Deliverables

All under `packages/ai/analyzer/src/a11y/`.

### 1. `extractA11yTree.ts`

```ts
import type { RenderNode, SlotPath } from '../types';

export interface A11yNode {
  path: SlotPath;
  type: string;                          // RN node type
  role?: string;                         // accessibilityRole
  label?: string;
  hint?: string;
  state?: Record<string, boolean>;
  value?: { min?: number; max?: number; now?: number; text?: string };
  actions?: Array<{ name: string; label?: string }>;
  text?: string;                         // collected string children, if any
  testID?: string;
  // Add new fields conservatively — they ship into snapshots.
  children: A11yNode[];
}

export function extractA11yTree(root: RenderNode): A11yNode;
```

Rules:
- Keep only nodes where `accessible !== false` and that contribute a11y info. Specifically, **drop a node** if all of these are true: no role, no label, no hint, no state, no value, no actions, no testID, and all children are themselves dropped. (Collapse the tree.)
- For `Text` nodes, set `text` to the concatenated string children.
- Use `walkTree` from `src/tree/walk.ts` to traverse.

### 2. `serializeA11yTree.ts`

Stable JSON serialization suitable for checkin under a snapshot directory. Sort object keys alphabetically. Skip `undefined` values. Indent with 2 spaces.

```ts
export function serializeA11yTree(tree: A11yNode): string;
```

### 3. `findA11yIssues.ts` — rule engine

```ts
import type { AnalyzerIssue } from '../types';
import type { A11yNode } from './extractA11yTree';

export interface A11yRule {
  id: string;                              // e.g., 'a11y/missing-label'
  check(node: A11yNode, ancestors: A11yNode[]): AnalyzerIssue[];
}

export const defaultA11yRules: A11yRule[];

export function findA11yIssues(
  tree: A11yNode,
  rules?: A11yRule[],
): AnalyzerIssue[];
```

Ship these rules in `defaultA11yRules`:

| id | severity | description |
| --- | --- | --- |
| `a11y/missing-label` | error | Interactive role (`button`, `checkbox`, `link`, `menuitem`, `tab`, `radio`, `switch`, `adjustable`) has no `label`, no `hint`, and no `text` child |
| `a11y/disabled-state-missing` | warning | Component appears non-interactive (`pointerEvents: 'none'` or `onPress` absent at slot type='Pressable') but `accessibilityState.disabled` is not set |
| `a11y/nested-interactive` | error | An interactive role is nested inside another interactive role |
| `a11y/duplicate-label` | warning | Two sibling nodes share the same `label` |
| `a11y/empty-label` | error | `accessibilityLabel` is set but empty/whitespace |
| `a11y/no-role-on-pressable` | warning | A node of type `Pressable`/`TouchableOpacity` has no `accessibilityRole` |

Each rule is small and independent. Make them easy to add to.

### 4. Agent instructions file: `src/a11y/instructions/accessibility-review.md`

A markdown prompt template — not code — that an orchestrator hands to an LLM. It should:

- State the goal: produce a structured a11y review of a single component.
- Tell the agent what inputs it will receive (component source, rendered a11y tree JSON, list of automated issues from `findA11yIssues`).
- Instruct it to verify each automated finding, look for issues the rules miss (focus order, screen reader prose quality, role choice, etc.), and produce output in this format:

  ```json
  {
    "component": "Button",
    "findings": [
      { "severity": "error|warning|info", "rule": "...", "message": "...", "path": [...], "suggestedFix": "..." }
    ],
    "summary": "..."
  }
  ```

- Keep the prompt under ~200 lines. No prose flourishes.

### 5. Tests

In `src/a11y/*.test.ts`:

- `extractA11yTree` — given hand-built `RenderNode` literals (no rendering needed), produces expected `A11yNode` trees. Cover: a leaf with a role, nested structures, collapse of nodes without a11y info.
- `serializeA11yTree` — round-trip stability (same input → same output), alphabetical key order.
- Each rule has its own unit test (positive + negative case).
- One end-to-end test: render a real component (e.g., `<Button>Click me</Button>`) via `react-test-renderer`, run `extractA11yTree` + `findA11yIssues`, assert the issue list is empty (or matches a known small set if you find real issues).

## Done when

- [ ] All deliverables above implemented under `src/a11y/` with tests.
- [ ] `src/a11y/index.ts` re-exports the public API.
- [ ] `yarn workspace @fluentui-react-native/analyzer build && test && lint` all pass.
- [ ] `accessibility-review.md` is present and concrete (no `TODO` placeholders).

## Out of scope

- Rendering or driving components in different states — that belongs to `03-component-analyzer.md`.
- Token-based styling concerns — that belongs to `01-test-theme.md`.
- Any platform-specific runtime testing (iOS/Android E2E). Stay in the JS render tree.
