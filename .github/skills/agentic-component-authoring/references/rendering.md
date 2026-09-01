# Rendering and assembly

Use this reference for `render<Component>.tsx`, `<component>.ts`, slot ordering, conditional structure, display names,
and package exports. The canonical examples are
[`renderButton.tsx`](../../../../packages/agentic/components/src/components/button/renderButton.tsx) and
[`button.ts`](../../../../packages/agentic/components/src/components/button/button.ts).

## Keep render functions pure

The render function receives resolved state and returns the final element tree.

- Add `/** @jsxImportSource @fluentui-react-native/framework-base */` when rendering slot components.
- Do not call hooks.
- Do not read themes or tokens.
- Do not create styles.
- Do not reinterpret defaults or accessibility.
- Do not mutate slot props.

All those decisions belong to earlier stages.

## Render slot functions directly

Capitalize local optional slot variables when that improves readability. Render required roots through the state slot:

```tsx
return <state.root>{content}</state.root>;
```

Keep slot order visible in JSX. Button renders its active icon before or after content according to `iconPosition`.
Avoid array construction or opaque helper loops when direct JSX makes the public ordering contract clearer.

## Resolve conditional structure from state

The render function may select among already-resolved slots and compose conditional layout:

- Button chooses `selectedIcon` when selected and falls back to `icon`.
- Toggle content uses the private container, hidden ghost, and visible label.
- Ordinary content renders without that wrapper.

Do not create missing slots in the render stage. If a structural element can exist, represent it in the state type and
construct it in the state hook.

Components that own children should render only their declared slots. Do not spread native `children` into the tree and
let consumers bypass slot order.

## Assemble the component in one small file

`<component>.ts` should show the pipeline without embedding stage logic:

```ts
export const Component = (props: ComponentProps) => {
  const state = useComponent_unstable(props);
  useComponentStyles_unstable(state);
  return renderComponent_unstable(state);
};
```

Set `displayName` for diagnostics and Storybook metadata. Keep unstable stage functions named consistently so tests and
future composition work can identify them. Do not wrap the component in memoization or another boundary without measured
need and repository precedent.

Under this package's React 19.1.4 baseline, `ref` is an ordinary component prop. Include it in the public root props and
let the state hook forward it to the resolved root slot; do not wrap assembly components in `forwardRef`. If rendering a
second internal ref on the same slot, pass it in JSX so the slot runtime composes it with the captured consumer ref.

After assembly, export `use<Component>_unstable`, `use<Component>Styles_unstable`, and
`render<Component>_unstable` from the package root together with `<Component>State`, according to the
[types and slots export rules](types-and-slots.md#exports). These stages are intentionally unstable but public so other
components can reuse and extend the pipeline without importing internal paths.

## Review checklist

- Render contains JSX and conditional structure only.
- Slot order matches the spec.
- Optional and replacement slots fall back intentionally.
- State-only structure does not leak into public props.
- The assembly file is a readable state -> styles -> render pipeline.
- `displayName` is present and all three composition stages are exported under component-qualified unstable names.
