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
- **R-VALID-003:** Before declaring a code, configuration, or instruction change complete, run
  `yarn lage buildci --no-cache` once as final validation. It bypasses and resets the Lage cache, so incorrect cache
  invalidation cannot hide a failure. After that run, a plain `yarn lage buildci` re-checks any package that has not
  passed. Read-only reviews and plans do not need it.
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
| `yarn clean`                    | `tsc -b --clean` plus `lage clean`                                                                    |
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

Lage caches task outputs; add `--no-cache` to bypass the cache and `--verbose` for detail. Iterate with cached runs,
then finish with one `yarn lage buildci --no-cache` (R-VALID-003). Before committing moved or renamed files, run
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
`fluentui-scripts jest` appends every discovered test path after forwarded arguments, so a positional file name does
not isolate one file; use `--testNamePattern` to focus a run.

## Validation discipline

- During iteration, run the smallest relevant test, and run package lint or build early after type-heavy edits.
- For final validation, run format, lint, the package build, and package tests, then the root build when public types,
  manifests, or project references change. Finish with one `yarn lage buildci --no-cache` (R-VALID-003).
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
- [Dynamic package extensions](../../../scripts/dynamic.extensions.mts) add TypeScript, Jest, oxlint, and oxfmt
  development dependencies when the package has the matching configuration or scripts.
- New components belong in the agentic package and new modern native code in native-core; see the
  [classification guide](../components/classification.md).
