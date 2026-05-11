# Analyzer Package — Plan Index

This directory splits the original `PLAN.md` into self-contained briefs so multiple agents can work in parallel. Each file is written to be handed to a fresh agent with no prior conversation context.

## Goals (recap)

Build a `@fluentui-react-native/analyzer` package that gives AI agents the tooling to:

1. Map rendered component styles back to the **theme tokens** that produced them.
2. Extract and check **accessibility trees** from rendered components.
3. Discover **component states/interactions** and drive automated interaction tests.

## Execution order

```
00-setup.md            <-- must finish first; defines shared types/contracts
                            |
        +-------------------+-------------------+
        |                   |                   |
01-test-theme.md   02-a11y-analyzer.md   03-component-analyzer.md
        |                   |                   |
        +-------------------+-------------------+
                            |
04-integration.md      <-- (deferred) component matrix wiring once 1/2/3 land
```

`01`, `02`, `03` are independent after `00` ships the shared interfaces (`RenderNode`, `SlotPath`, `AnalyzerOutput<T>`). They can each be assigned to a separate agent in parallel.

## Shared conventions

- All public utility entry points live under `src/<area>/index.ts` and re-export from `src/index.ts`.
- Public types live in `src/types.ts` (created in `00-setup.md`).
- Tests are co-located: `src/<area>/<name>.test.ts`.
- The package uses `@testing-library/react-native` (already in `devDependencies`) for any component interaction work. Note the rest of the repo uses `react-test-renderer` directly — that is fine; this package is the place we adopt the testing-library API.

## Permissions

Each plan file ships a YAML frontmatter `permissions.allow` block so a spawned agent can run yarn/build/test/format/lint without prompting. Mutating git operations (commit, push, reset, rebase) are intentionally **not** in the allow list — confirm before running them. Read-only git (`status`, `diff`, `log`, `show`) is allowed.

The repo-level `.claude/settings.local.json` has been extended with the same allow list so the permissions apply whether a plan is run directly or by a sub-agent.
