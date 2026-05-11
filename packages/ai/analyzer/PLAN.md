# Analyzer Package Plan

The high-level plan has been split into parallel-ready briefs under [`plans/`](./plans/README.md).

| File | Topic | Parallel? |
| --- | --- | --- |
| [`plans/00-setup.md`](./plans/00-setup.md) | Package skeleton, shared types, tree walker | Sequential (blocks the rest) |
| [`plans/01-test-theme.md`](./plans/01-test-theme.md) | Test theme with unique-sentinel tokens + style-to-token resolver | Parallel |
| [`plans/02-a11y-analyzer.md`](./plans/02-a11y-analyzer.md) | Accessibility tree extraction, rule engine, review prompt | Parallel |
| [`plans/03-component-analyzer.md`](./plans/03-component-analyzer.md) | Component state metadata + `@testing-library/react-native` matrix driver | Parallel |

Start with `00-setup.md`. Once its shared types are merged, hand `01`, `02`, `03` to three agents in parallel.

Each brief carries its own `permissions.allow` frontmatter so a spawned agent can run yarn/build/test/format/lint without prompting. Git mutations remain gated.
