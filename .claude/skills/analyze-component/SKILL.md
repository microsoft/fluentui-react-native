---
name: analyze-component
description: Use this skill when the user asks to generate, refresh, or check in `ComponentMetadata` for a component in this monorepo (e.g. "analyze the Button component", "/analyze-component packages/components/Checkbox Checkbox"). Produces a typed metadata document under `src/metadata/<ComponentName>.metadata.ts`, wires it through the barrel and package exports, and validates it via the analyzer. Do NOT use this skill to render snapshots, run accessibility checks, or generate styles — those are separate analyzer entry points; this skill produces only the input that drives them.
---

# analyze-component

Produce a `ComponentMetadata` document for one component in a furn package and check it in next to the source.

The metadata feeds `runComponentMatrix` (in `@fluentui-react-native/analyzer`) and any downstream codegen (e.g. styles). Component packages frequently export more than one component, so each component gets its own metadata file under `src/metadata/`, re-exported from a single `src/metadata/index.ts` barrel.

## Inputs

`/analyze-component <package-path> <ComponentName>`

- `<package-path>` — workspace-relative path to the component package, e.g. `packages/components/Button`.
- `<ComponentName>` — the named export the user wants to describe. For Button-style packages this might be `ButtonV1`, `CompoundButton`, `FAB`, or `ToggleButton`. Use the export name as it appears in the package's public barrel (`<package-path>/src/index.ts`), not the internal display name.

If either argument is missing, ask the user before doing anything else. Do not guess.

## Sources of truth (read these before emitting)

These files are authoritative — do not duplicate or re-summarize their rules in your output.

1. **State-selection heuristics**: `packages/ai/concepts/src/instructions/state-discovery.md`. This is the canonical guide for which states to emit, which interactions to use, and how to keep the matrix small. Follow it literally.
2. **Schema**: `packages/ai/concepts/src/metadata/ComponentMetadata.ts`. The declarative shape of `ComponentMetadata` — what concepts a component supports. The state matrix is derived from this document by `deriveComponentStates` (in `packages/ai/concepts/src/metadata/ComponentStates.ts`); you do not hand-pick states. `satisfies ComponentMetadata` in the emitted file enforces the shape at compile time.
3. **Validator behaviour**: `packages/ai/analyzer/src/component/validateMetadata.ts`. Knowing what rules `validateMetadata` emits helps you avoid dangling-testID warnings up front.

If any of these files have moved or changed shape, trust what you read now and update the skill or instructions accordingly.

## Steps

### 1. Inspect the component

Read every source file for this component before emitting anything:

- The component implementation: `<package-path>/src/<ComponentName>.tsx`, or `<package-path>/src/<ComponentName>/<ComponentName>.tsx` for components that live in their own subdirectory.
- The props/types file: `<ComponentName>.types.ts`.
- The styling file: `<ComponentName>.styling.ts` (token names like `pressedBackground`, `disabledIconColor` imply states).
- Any platform-specific files: `<ComponentName>.{ios,android,macos,win32,windows}.{ts,tsx}`.
- The associated hook(s): `useButton.ts`, `useToggleButton.ts`, etc. — these expose `usePressableState`, `useSelected`, `useFocusState` patterns that reveal hover/press/focus/selected states.
- The package barrel `<package-path>/src/index.ts` — confirm `<ComponentName>` is exported here, find the package's public `name` from `<package-path>/package.json`, and use that pair for `exportName` + `importPath`.

Prefer V1 exports over the deprecated foundation-compose variants. If the barrel re-exports both (e.g. `Button` and `ButtonV1`), describe the V1.

### 2. Apply the heuristics

Open `packages/ai/concepts/src/instructions/state-discovery.md` and follow it. It defines:

- Required vs. optional fields on `ComponentMetadata`.
- Where to read each concept from the source (which file, which symbol).
- How `framework`, `platforms`, `states`, `appearances`, `sizes`, `shapes` map to evidence in the code.
- Self-check rules before emitting.

Do not freelance beyond this guide. If you find yourself wanting a concept the heuristics don't justify, write the rationale in the file's doc comment.

### 3. Emit `src/metadata/<ComponentName>.metadata.ts`

Path: `<package-path>/src/metadata/<ComponentName>.metadata.ts`.

Template:

```ts
import type { ComponentMetadata } from '@fluentui-react-native/concepts';

/**
 * `<ComponentName>` from `<package-name>`. <One sentence on what it
 * is and what framework it uses.>
 *
 * <Short rationale paragraph: any non-obvious choices — appearances
 * that map to others, states that only render on one platform, combos
 * you considered and rejected.>
 */
export const <componentName>Metadata = {
  name: '<ComponentName>',
  importPath: '<package-name>',
  exportName: '<ComponentName>',
  framework: 'v1',
  platforms: ['ios', 'android', 'macos', 'win32', 'windows'],
  states: ['disabled', 'hover', 'press', 'focused'],
  // stateCombos: [['press', 'focused']],
  // appearances: ['primary', 'subtle'],
  // sizes: ['small', 'medium', 'large'],
  // shapes: ['rounded'],
  baseProps: {
    testID: '<component-name>-root',
  },
} as const satisfies ComponentMetadata;
```

Naming:

- Exported binding: `<componentName>Metadata` in camelCase (`buttonV1Metadata`, `compoundButtonMetadata`, `toggleButtonMetadata`). The barrel re-exports each by name.
- File: `<ComponentName>.metadata.ts` in PascalCase to match sibling files like `<ComponentName>.styling.ts`.

Use `import type` for `ComponentMetadata` — it is fully erased at build, so the metadata file has no runtime dependency on `@fluentui-react-native/concepts` at all (the concepts dep is dev-only).

### 4. Update `src/metadata/index.ts`

Path: `<package-path>/src/metadata/index.ts`.

- If the file doesn't exist, create it with a single export line.
- If it exists, add the new export alphabetically without disturbing other lines or comments.

```ts
export { buttonMetadata } from './Button.metadata.ts';
export { compoundButtonMetadata } from './CompoundButton.metadata.ts';
// ...
```

### 5. Wire up `package.json` exports

In `<package-path>/package.json`:

- Add to `exports` (preserving the existing entries and their key order):
  ```json
  "./metadata": {
    "types": "./lib/metadata/index.d.ts",
    "import": "./lib/metadata/index.js",
    "require": "./lib-commonjs/metadata/index.js",
    "default": "./src/metadata/index.ts"
  }
  ```
  Match the shape of the existing `"."` entry exactly — same keys, same order — because this repo's tooling is fussy about exports map shape. (The `"default": "./src/..."` line is the convention here for source-map-friendly workspace consumption.)
- Add `"@fluentui-react-native/concepts": "workspace:*"` to `devDependencies` if it's not already there (for the type-only `ComponentMetadata` import).
- Add `"@fluentui-react-native/analyzer": "workspace:*"` to `devDependencies` if it's not already there (for the `validateMetadata` runtime call in the test).

Don't touch `main`, `module`, `types`, `sideEffects`, or unrelated fields.

### 6. Ensure a `metadata.test.ts` exists

Path: `<package-path>/src/metadata/metadata.test.ts`.

If the file already exists, leave it alone — the barrel-walking test below picks up the new export automatically. If it doesn't exist, create it:

```ts
import { validateMetadata } from '@fluentui-react-native/analyzer';

import * as metadataModule from './index';

describe('metadata', () => {
  for (const [exportName, value] of Object.entries(metadataModule)) {
    it(`${exportName} validates against the ComponentMetadata schema`, () => {
      const result = validateMetadata(value);
      const errors = result.issues.filter((issue) => issue.severity === 'error');
      const warnings = result.issues.filter((issue) => issue.severity === 'warning');
      expect({ errors, warnings }).toEqual({ errors: [], warnings: [] });
    });
  }
});
```

This bakes shape validation into CI so future hand-edits can't drift.

### 7. Validate

Run, from the repo root:

```sh
yarn workspace <package-name> jest src/metadata/metadata.test.ts
```

Report the result back to the user verbatim. If the test reports warnings (typically `component/dangling-testid`), fix the metadata — usually by adding a `testID` to `baseProps` or to the state's `props` — and re-run. Do not call the task done while warnings or errors remain.

If type-checking would be more useful than running jest (e.g. the package's jest config is not yet wired for ESM TS), fall back to:

```sh
yarn workspace <package-name> build
```

to confirm the `satisfies ComponentMetadata` constraint holds.

## Conventions and gotchas

- **`importPath` is the public package name**, not a relative path. `'@fluentui-react-native/button'`, not `'./Button'`.
- **`exportName` is the name from the public barrel.** If `src/index.ts` does `export { Button as ButtonV1 } from './Button'`, use `'ButtonV1'`.
- **`baseProps.testID` is almost always worth setting** — most components have at least one interaction-driven state, and the testID anchors it. Pick a stable string like `'<component-name>-root'`.
- **Don't hand-pick state combinations.** `states` lists single states; `stateCombos` lists only the meaningful multi-state combos. The deriver expands the Cartesian product across appearances and parallel size/shape entries — that's its job, not yours.
- **Don't fork by platform.** The current matrix does not run per-platform. If a state only exists on one platform, write that in the doc comment and list the platform in `platforms` anyway.
- **Don't extend the schema.** If you genuinely need a new field, stop and propose adding it to `packages/ai/concepts/src/metadata/ComponentMetadata.ts`; do not invent fields here.
- **Don't include functions, JSX, or other non-serializable values** in `baseProps`. The analyzer expects JSON-shaped data.

## What this skill does NOT do

- Does not render the component or capture snapshots — `analyzeComponent` / `runComponentMatrix` do that.
- Does not generate styles, tokens, or any other derived artifact.
- Does not modify component source, tests outside `src/metadata/`, the test app, or changelogs.
- Does not add a changeset. If the user wants one, suggest they run `yarn changeset` after reviewing the diff.
