# Metadata Package Plan

This package will produce repository-wide component metadata by orchestrating `@fluentui-react-native/analyzer` and emitting versioned JSON artifacts that can run in CI/build workflows.

The implementation is split into sub-agent briefs under [`plans/`](./plans/README.md).

| File | Topic | Parallel? |
| --- | --- | --- |
| [`plans/00-contract-and-scaffold.md`](./plans/00-contract-and-scaffold.md) | Package scaffold, metadata schema/contracts, CLI surface | Sequential (blocks all) |
| [`plans/01-extraction-engine.md`](./plans/01-extraction-engine.md) | Analyzer orchestration + per-component extraction pipeline | Parallel after `00` |
| [`plans/02-notes-and-enrichment.md`](./plans/02-notes-and-enrichment.md) | Notes/enrichment model + manual override flow | Parallel after `00` |
| [`plans/03-build-integration-and-ci.md`](./plans/03-build-integration-and-ci.md) | Lage/build integration + determinism checks in CI | Parallel after `00` |
| [`plans/04-web-styling-bridge.md`](./plans/04-web-styling-bridge.md) | Token metadata transforms for Fluent web-style alignment | Parallel after `01` + `02` |

Execution order:

1. Land `00`.
2. Fan out `01`, `02`, `03` to three sub-agents in parallel.
3. Land `04` after `01` and `02`.
4. Final integration pass to ensure the package can generate deterministic metadata in a single command.
