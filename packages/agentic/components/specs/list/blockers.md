# List blockers

## Classification

- **Component shape:** HOC / composed component
- **React Native feasibility:** Feasible in React Native Windows/macOS in principle, but **blocked for this task**

## Blockers

1. The List spec depends on a `ListItem` implementation for row anatomy, selection indicators, focus orchestration, and row-level accessibility.
2. This package currently has List specs only; there is no `src/components/list-item` implementation to compose against.
3. The task scope forbids changing another component or shared package files, so a complete List implementation cannot be landed safely in isolation.

## Evidence

- `specs/list/SPEC.md`
- `specs/list/accessibility.md`
- `specs/list/interaction.md`
- `specs/list/usage.md`
- `specs/list-item/SPEC.md`

## Next step

Implement `ListItem` first, or allow a paired change that adds both the row component and the List container/export together.
