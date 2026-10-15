---
name: maintain-v0-v1-component
description: Fix or maintain existing v0 (foundation-compose) or v1 (framework compose/compressible) components, including their platform variants. Classifies the generation first and loads only its recipe. Not for new components, agentic components, read-only reviews, or native-only changes.
license: MIT
---

# Maintain v0 and v1 components

v0 and v1 are maintenance-only (R-V0-001 and R-V1-001). A request for a new component uses the
[agentic authoring skill](../agentic-component-authoring/SKILL.md). A read-only review uses
[review-component](../review-component/SKILL.md).

## Workflow

1. Classify every surface the change touches with the
   [classification guide](../../../references/agents/components/classification.md). Confirm the generation from
   imports and structure, not directory names (R-CLASSIFY-001); Button contains both generations.
2. Load only the matching recipe: [v0](../../../references/agents/components/v0.md) or
   [v1](../../../references/agents/components/v1.md). Load both only when the change touches both generations.
3. Add overlays only when the change triggers them:
   - native root, registration, codegen, podspec, or native project: the
     [native component skill](../implement-native-component/SKILL.md) checklist;
   - focus, keyboard activation, or focus visuals: [common focus authoring](../../../references/agents/focus/common.md)
     and its platform file;
   - token values or theme behavior: [tokens and theming](../../../references/agents/design/tokens-and-theming.md);
   - FluentTester pages or E2E specs: [legacy test apps](../../../references/agents/components/legacy-test-apps.md).
4. Read the component's existing tests, snapshots, platform variants, and any `SPEC.md` or `MIGRATION.md` before
   editing.
5. Make the smallest change that fixes the problem. Preserve public props, types, exports and aliases, display names,
   `componentRef`, token contracts, and native registration names (R-V0-002, R-V0-003, R-V1-002, R-V1-003).
6. Validate with the owning package's declared scripts (R-VALID-001): build, test, and lint, plus the framework
   packages named in the recipe when framework semantics change. Review snapshot diffs before accepting them. Report
   each check's outcome (R-VALID-002).
7. Add a changeset for published packages (R-REPO-003).

Stop and confirm scope before migrating between frameworks, creating a component, or changing a public API. Those
are separate tasks, not maintenance.
