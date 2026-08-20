# Interaction Tag blockers

## Classification

- Pure RN feasibility: **yes in principle** (`View`/`Pressable`/`Text`/`Icon` can cover the interaction model).
- Component kind: **HOC / molecular**, not a primitive.

## Blockers

1. **Public export is required, but forbidden here.**  
   A new component under `src/components/interaction-tag` must be surfaced from `packages/agentic-components\src\index.ts` to be usable. The task explicitly forbids editing shared exports/manifests/config, so the component cannot be fully landed.

2. **The spec depends on Avatar/Tag contracts outside this package.**  
   `SPEC.md`, `interaction.md`, `accessibility.md`, and `usage.md` define an Avatar leading-content variant and inherit Tag language/tokens. `packages/agentic-components` currently only owns Button/Icon, so a faithful implementation would need additional package wiring or a local Avatar contract that is outside the allowed scope.

## Result

Implementation, test authoring, and spec migration are blocked until export/dependency scope is authorized.
