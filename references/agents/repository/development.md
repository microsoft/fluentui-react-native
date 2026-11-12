---
id: repository.development
kind: instruction-reference
owner_paths:
  - package.json
  - lage.config.mjs
  - scripts
---

# Development commands and validation

The repository builds as one TypeScript project-references graph compiled by `tsc`. Lage orchestrates bundle, test,
lint, and repository-check tasks. Yarn 4 in pnpm mode manages dependencies (see `.yarnrc.yml`). Commands below match
the declared scripts in the root [package.json](../../../package.json) and [lage.config.mjs](../../../lage.config.mjs).

## Repository-wide rules

- **R-VALID-001:** Run commands through the owning workspace's declared scripts. Inspect its `package.json` before
  invoking an underlying runner; do not assume scripts such as `jest`, `check`, or `depcheck` exist, and do not bypass
  project references with ad-hoc `tsc` file arguments.
- **R-VALID-002:** Report each validation as passed, failed, skipped, not run, or unsupported, with the reason. Never
  report an unrun, all-skipped, or unsupported check as passed. JavaScript tests, bundles, and source builds are not
  evidence of native runtime behavior, physical input, UIA/AX action dispatch, or Office qualification.
- **R-VALID-003:** Before declaring a code, configuration, or instruction change complete, run `yarn clean-lage-cache`
  and then `yarn lage buildci` as final validation. Clearing the Lage cache means incorrect cache invalidation cannot
  hide a failure. If that run fails, fix the failure and rerun plain `yarn lage buildci`: tasks that never ran have no
  cache entry, so they execute, and tasks that passed after the clear reuse fresh results. Read-only reviews and plans
  do not need it.
- **R-VALID-004:** While iterating, validate with the narrowest scope that covers the change: the selected tests in the
  owning package, then its whole suite, then its dependents when shared code changed (see
  [Focused test runs](#focused-test-runs)). Do not repeat the repository-wide aggregate after each edit; run it once as
  final acceptance (R-VALID-003). Report the scope of every test run, because a focused run is not evidence that the
  full suite passes.
- **R-REPO-001:** Do not use barrel exports (`export * from '...'`). Use explicit named re-exports such as
  `export { Foo, Bar } from './module'` and `export type { Baz } from './module'` so bundlers can tree-shake.
- **R-REPO-004:** Do not copy or mechanically transform private source bodies into this public repository. Record
  source identifiers and author original documentation and code.

## Root commands

Set up a clone with `yarn` to install dependencies, then `yarn build`.

| Command                         | Effect                                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `yarn build`                    | `lage root-build`: runs `root-prebuild` (package `prebuild` steps), then `tsc -b` over the root graph |
| `yarn build:clean`              | Cleans the root TypeScript build, then rebuilds                                                       |
| `yarn clean`                    | `tsc -b --clean` plus package artifact cleanup; Lage skips the root script to prevent recursion       |
| `yarn clean-lage-cache`         | Clears the Lage task cache (`lage cache --clear`)                                                     |
| `yarn lage test`                | Package tests after the root build and agentic contract checks                                        |
| `yarn lage lint`                | Package lint (oxlint through `fluentui-scripts lint`)                                                 |
| `yarn lint-fix`                 | Package lint with autofix (`FURN_FIX_MODE=true`)                                                      |
| `yarn format` / `format:check`  | Format or check formatting with oxfmt                                                                 |
| `yarn lint-repo`                | Yarn constraints, dependency alignment, Knip, lockfile lint, and formatting                           |
| `yarn lint-lockfile`            | Lockfile validation                                                                                   |
| `yarn check-publishing`         | Published packages must not depend on private packages                                                |
| `yarn check-agent-instructions` | Integrity of agent instructions, skills, references, and evaluation cases                             |
| `yarn test:agent-permissions`   | Tests the agent permission hook                                                                       |
| `yarn lage test-links`          | Markdown link validation, one worker per workspace                                                    |
| `yarn bundle:repo`              | Package bundles (`lage bundle`)                                                                       |
| `yarn lage buildci`             | CI aggregate: repository lint, publishing check, agent-instruction check, build, test, and lint       |
| `yarn change` / `change:check`  | Create or validate changesets; see [release](release.md)                                              |

Lage caches task outputs in `node_modules/.cache/lage`. Iterate with cached runs, and add `--verbose` for detail.
The repository patches Lage 2.14.19's task runner to use `cross-spawn` instead of spawning argument arrays with
`shell: true` on Windows. The root resolution and matching `.yarnrc.yml` package extension must stay together;
remove both once the upstream runner supports Windows command shims without DEP0190.
`--no-cache` bypasses the cache for one run but leaves earlier entries in place, so a later cached run can still reuse
results for tasks the uncached run never reached. For final validation, clear the cache instead (R-VALID-003). Before committing moved or renamed files, run
`yarn lage test-links` and update stale links.

## Package commands

Each package's `build` script is `tsc -b`, which builds the package with its referenced dependencies. Other tasks run
through the `fluentui-scripts` CLI in [`scripts/`](../../../scripts/package.json). Common package scripts are:

- `yarn build`: project-references build that emits `lib/`;
- `yarn lint`: oxlint;
- `yarn test`: Jest where the package declares it (`fluentui-scripts jest`);
- `yarn update-snapshots`: Jest snapshot update where declared;
- `yarn format`: formats the package; `yarn format --check` only checks.

Packages differ. Check the scripts before running them; for example, `apps/storybook` has no `build` or `test` script.
Run a subset of a package's tests as described in [Focused test runs](#focused-test-runs).

## Focused test runs

`yarn test` and `yarn update-snapshots` run `fluentui-scripts jest`, which accepts test selectors, so a change to one
component does not need the whole suite. Run these from the package directory, and widen the scope only as the change
settles (R-VALID-004):

| Scope                         | Command                                                      | Use it for                                                  |
| ----------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| Test files selected by path   | `yarn test popover`                                          | the component or file you are editing                       |
| One test by name              | `yarn test popover -t "opens on press"`                      | a single new or failing case                                |
| Tests that depend on a source | `yarn test --findRelatedTests src/common/useFocusVisuals.ts` | shared helpers, primitives, and hooks                       |
| Tests related to your changes | `yarn test --changedSince=origin/main`                       | a pass over everything changed in the package               |
| Whole package                 | `yarn test`                                                  | before handing the package over                             |
| Package and its dependents    | `yarn lage test --scope @fluentui-react-native/<package>`    | a change to design, framework-base, native-core, or scripts |
| Final acceptance              | `yarn clean-lage-cache`, then `yarn lage buildci`            | once, when the change is complete (R-VALID-003)             |

- A bare argument is a case-insensitive pattern, either plain text or a regular expression, matched against the test
  path relative to the package. `menu` also selects the `menu-item` and `menu-button` tests; `src/components/menu/`
  selects one directory. Selectors combine, may follow flags such as `-u`, and may be absolute or repository-relative
  paths. `yarn update-snapshots popover` refreshes only the popover snapshots.
- A selector that matches no test file fails the run, so a typo is never a pass. `--listTests` prints the files a
  selection runs without running them.
- `--findRelatedTests` takes source files relative to the package directory, and a path that does not exist is an
  error. `--changedSince=<ref>` includes committed changes; `-o` sees only uncommitted ones. When nothing relates, the
  run prints `Selected 0 of N test files` and runs nothing: report that check as not run (R-VALID-002), not passed.
- A passing `*.types.test.ts` under Jest says nothing about its types, because Babel strips them. `yarn build`
  type-checks them, so pair a focused run with `yarn build` after changing types.
- Workspace dependencies resolve through their package `exports`, and some point at built `lib/` output. After editing a
  dependency, run `yarn build` before testing a dependent.
- A multi-step `test` script, such as the agentic components package's, runs its earlier checks in full and applies
  the selector to the Jest step. A package with platform-suffixed tests runs Jest once for each platform that has
  selected files, so `yarn test ColorTokens.test.win32` runs only the win32 file.
- Do not call `jest` directly (R-VALID-001): it would run platform-suffixed test files under the package's base
  platform instead of their own.

## Validation discipline

- During iteration, run the focused tests for the code you changed (R-VALID-004), and run package lint or build early
  after type-heavy edits.
- For final validation, run format, lint, the package build, and package tests, then the root build when public types,
  manifests, or project references change. Finish with `yarn clean-lage-cache` and `yarn lage buildci` (R-VALID-003).
- After fixing a failed step, rerun that step and its downstream checks before rerunning the whole chain.
- Prefer committed `*.types.test.ts` coverage for compile-time contracts. Keep exploratory probes outside package
  source, or remove them before package validation.
- Run working-directory-sensitive native tools from the owning app workspace. Flags such as CocoaPods'
  `--project-directory` select project files but do not change subprocess resolution roots.
- Run `yarn` only after dependency manifests change or when a declared command fails because a dependency is missing.
- Review small, localized diffs directly. Use an independent review agent only after focused validation passes and
  when the change still has an ambiguous or cross-cutting contract.
- Keep sessions scoped to one reviewable outcome; start unrelated work in a fresh session.

## Adding a package

- Use `workspace:*` for internal dependencies.
- Add the package's `tsconfig.json` to the root `tsconfig.json` `references` so it joins the unified build.
- Follow the [package-owned guidance standard](package-guidance.md) for guided packages and register them in the package guidance list.
- [Dynamic package extensions](../../../scripts/dynamic.extensions.mts) add TypeScript, Jest, oxlint, and oxfmt
  development dependencies when the package has the matching configuration or scripts.
- New components belong in the agentic package and new modern native code in native-core; see the
  [classification guide](../components/classification.md).
