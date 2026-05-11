---
title: Analyzer — Package Setup & Shared Contracts
status: ready
parallelizable: false
blocks: [01-test-theme, 02-a11y-analyzer, 03-component-analyzer]
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

# Setup & Shared Contracts

## Context

You are creating the foundation for a new package at `packages/ai/analyzer` (npm name `@fluentui-react-native/analyzer`). The package is a toolkit for AI agents to analyze FluentUI React Native components — token usage, accessibility trees, and component state surfaces.

Three parallel briefs (`01-test-theme.md`, `02-a11y-analyzer.md`, `03-component-analyzer.md`) depend on the structure and shared types you ship here. Pick stable names; downstream code will import them.

The package skeleton already exists:
- `packages/ai/analyzer/package.json` — already configured (yarn workspace, tsgo build, jest, `@testing-library/react-native` in devDeps).
- `packages/ai/analyzer/src/index.ts` — empty.
- `packages/ai/analyzer/tsconfig.json` — present.

The wider repo uses Yarn 4 (pnpm mode) and Lage. See `/Users/jasonmorse/dev/furn/CLAUDE.md` for repo conventions.

## Deliverables

### 1. Directory layout

Create the following structure under `src/`:

```
src/
  index.ts            # barrel re-exporting public API of each area
  types.ts            # shared types (see §2)
  tree/
    index.ts
    walk.ts           # tree walker utility (see §3)
    walk.test.ts
  theme/              # 01-test-theme.md fills this in
    index.ts          # empty stub re-export
  a11y/               # 02-a11y-analyzer.md fills this in
    index.ts          # empty stub re-export
  component/          # 03-component-analyzer.md fills this in
    index.ts          # empty stub re-export
```

The empty `index.ts` files in `theme/`, `a11y/`, `component/` should each contain a single `export {};` so the build doesn't fail and parallel agents have a known import target.

### 2. Shared types in `src/types.ts`

Define and export these types. They are the **contract** between parallel parts — pick names carefully, document each with a short JSDoc.

```ts
// A node from react-test-renderer's toJSON(), normalized.
export interface RenderNode {
  type: string;                          // e.g., 'View', 'Text', 'RCTView'
  props: Record<string, unknown>;
  children: ReadonlyArray<RenderNode | string>;
}

// A path through the rendered tree, e.g., ['root', 'content'] or indices.
// Used by every area to refer to a specific slot/element in a snapshot.
export type SlotPath = ReadonlyArray<string | number>;

// Standard envelope every analyzer utility returns. Generic over T.
export interface AnalyzerOutput<T> {
  component: string;        // component display name
  variant?: string;         // optional variant label (e.g., 'disabled', 'pressed')
  generatedAt: string;      // ISO timestamp
  data: T;
}

// Result reference returned by every issue-finding utility.
export interface AnalyzerIssue {
  severity: 'error' | 'warning' | 'info';
  rule: string;             // stable id, e.g., 'a11y/missing-label'
  message: string;
  path?: SlotPath;
}
```

### 3. Tree walker in `src/tree/walk.ts`

Implement a small, dependency-free utility used by all three parallel parts:

```ts
export function walkTree(
  root: RenderNode,
  visit: (node: RenderNode, path: SlotPath) => void,
): void;
```

Rules:
- Visit `root` first, then recursively each child that is a `RenderNode` (skip string children).
- The `path` is the chain of child indices from root: `[]` for root, `[0]`, `[0, 1]`, etc.
- Write a Jest test covering: a leaf, a tree with mixed string + node children, and indexing correctness.

### 4. Barrel export

`src/index.ts` should re-export everything from `./types`, `./tree`, `./theme`, `./a11y`, `./component`.

### 5. Verify the package builds and tests pass

From the repo root:

```sh
yarn workspace @fluentui-react-native/analyzer build
yarn workspace @fluentui-react-native/analyzer test
yarn workspace @fluentui-react-native/analyzer lint
```

All three must pass before you mark this brief done. If `yarn` itself is needed first, run it from the repo root.

## Done when

- [ ] Directory structure above exists with stub `index.ts` in each area.
- [ ] `src/types.ts` exports `RenderNode`, `SlotPath`, `AnalyzerOutput`, `AnalyzerIssue`.
- [ ] `walkTree` implemented with a passing unit test.
- [ ] `yarn workspace @fluentui-react-native/analyzer build && test && lint` all pass.
- [ ] Replace `packages/ai/analyzer/PLAN.md` content with a short pointer to `plans/README.md` (the original goals are now captured in the split files).

## Out of scope

- Theme creation, a11y rules, component state discovery — those belong to the three downstream briefs.
- Documentation prose beyond JSDoc on the shared types.
