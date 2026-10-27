---
id: components.contributing
kind: instruction-reference
owner_paths:
  - packages/agentic/components
---

# Contributing to Components

## Source map

| Path                      | Owns                                                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/components/<name>/`  | One higher-order component, its `SPEC.md` contract and `spec/` companions; see `higher-order-components.md` |
| `src/primitives/<name>/`  | One public primitive and its `CONTRACT.md`; see `primitives.md`                                             |
| `src/test/<name>/`        | Shared runtime-safe Storybook/test UI and local `CONTRACT.md`; see `test-components.md`                     |
| `src/common/`             | Package-private helpers shared by components; see `source-boundaries.md`                                    |
| `src/index.ts`            | Root exports: higher-order components, public types, and `_unstable` pipeline stages                        |
| `src/primitives/index.ts` | The `./primitives` entry point                                                                              |
| `spec-contracts/` scripts | The contract checker and the Flex source drift reporter; see `contracts.md`                                 |
| `test-contracts/` scripts | Presence/export checks for the local test-component contract catalog                                        |
| `spec-source-lock.json`   | The pinned Flex catalog, X3 lineage, and legacy staged-spec records                                         |
| `spec-source-report.json` | The generated contract and drift report                                                                     |
| `tsconfig.stories.json`   | Type coverage for every test-bearing story                                                                  |

The canonical implementations are `src/components/button` and `src/primitives/icon`.

## Tests

`yarn test` runs the HOC and test-component contract checks, the story type check, and Jest with the macOS platform preset declared in
`package.json`. While iterating, run only the affected component's Jest tests with `yarn test <component>` or
`yarn test --findRelatedTests <source>` (R-VALID-004), and run `yarn check:spec-contracts` after contract changes.
`tests-and-stories.md` covers runtime, type, snapshot, and Storybook coverage, including native `wdio` story tests,
which run from the Storybook app with `yarn storybook test --<platform>`.

## Validation

Run `yarn format`, `yarn lint`, `yarn build`, and `yarn test` in this package (R-VALID-001). Contract source reviews
also run `yarn report:spec-source-drift`; see `contracts.md`. This is a published package; add a changeset
(R-REPO-003). Finish code or configuration changes with one `yarn clean-lage-cache` and then `yarn lage buildci`
(R-VALID-003, R-VALID-004). Report native story runs per platform and renderer; Jest and bundles are not native
qualification (R-VALID-002).
