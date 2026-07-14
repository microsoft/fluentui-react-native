# Metadata Plan

## Overall Goal

Use the @fluentui-react-native/analyzer package to generate metadata for all the controls in the repository, capturing their styles in terms of design tokens, their accessibility info, and any notes on each control. Ideally this metadata can be produced as a build step such that it is automatically updated as controls change. Then the metadata will be used to produce a new way of doing styling more consistent with the fluentui web library. (See the AGENTS.md file in that repo for reference)

## Execution Plan

The detailed, sub-agent-ready implementation plan is split into:

- `packages/ai/metadata/PLAN.md` (high-level roadmap)
- `packages/ai/metadata/plans/README.md` (parallelization and handoff index)
- `packages/ai/metadata/plans/*.md` (self-contained execution briefs)
