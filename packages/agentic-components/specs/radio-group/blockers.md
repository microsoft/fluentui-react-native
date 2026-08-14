# RadioGroup blockers

## Result

- **Component shape:** Higher-order component (HOC), not a primitive.
- **Pure RN feasibility:** Not fully feasible in `packages/agentic-components` under the current scope.

## Why this is blocked

- The RadioGroup spec depends on a dedicated **Radio** child contract and a **Label**-style legend composition.
- `packages/agentic-components` currently only has `button` and `icon` source trees; there is no `radio`, `label`, or `radio-group` implementation to build on.
- The task scope forbids editing other components or shared files, so the missing dependencies cannot be added here.

## What would unblock it

- Add a `Radio` component contract in this package.
- Add a `Label`/legend composition contract in this package.
- Then implement `src/components/radio-group` and migrate the RadioGroup specs there with tests, type tests, and stories.

## Current action

- Leave the RadioGroup specs in `specs/radio-group`.
- Do not migrate or implement until the missing component dependencies exist.
