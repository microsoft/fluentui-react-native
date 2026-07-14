# Metadata Package — Plan Index

This directory contains self-contained briefs that can be handed directly to separate sub-agents.

## Goal recap

Build `@fluentui-react-native/metadata` to:

1. Generate metadata for all controls using `@fluentui-react-native/analyzer`.
2. Capture style-token attribution, accessibility structure/issues, and component notes.
3. Run generation as a build task so metadata stays current as components evolve.
4. Feed a downstream styling model aligned with Fluent web concepts.

## Parallelization graph

```text
00-contract-and-scaffold.md   (must finish first)
            |
   +--------+--------+
   |        |        |
  01       02       03
   \        |        /
    \       |       /
     +------04------+
```

- `01-extraction-engine.md` depends on the schema/contracts from `00`.
- `02-notes-and-enrichment.md` depends on schema/contracts from `00`.
- `03-build-integration-and-ci.md` depends on package scripts and command surface from `00`.
- `04-web-styling-bridge.md` depends on outputs from `01` and `02`.

## Branching/merge strategy

- Each brief should be executed in an isolated branch.
- Merge order: `00` -> (`01`,`02`,`03`) -> `04`.
- After each merge, run package-local build/test/lint and then one repo-level metadata generation smoke run.

## Shared conventions for every brief

- Keep all public API surface explicit (no wildcard barrel exports).
- Generated artifacts must be deterministic (stable key order, stable file ordering, stable timestamp strategy).
- Metadata format must be versioned and forward-compatible (`schemaVersion` with migration hooks).
- Failures should be surfaced per-component where possible; do not hide extraction failures.
- Every brief includes a `permissions.allow` frontmatter block so sub-agents can run build/test/lint/generation commands without interactive approval.
- The same allow list is mirrored in `.claude/settings.local.json` for unattended local execution.
