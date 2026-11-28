---
id: components.agentic.rendering
kind: instruction-reference
owner_paths:
  - packages/agentic/components
---

# Rendering and assembly

Use this reference for `render<Component>.tsx`, `<component>.ts`, slot ordering, conditional structure, display names,
and package exports. The canonical examples are
[`renderButton.tsx`](../src/components/button/renderButton.tsx) and
[`button.ts`](../src/components/button/button.ts).

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

Keep slot order visible in JSX. Button renders the leading icon, content, and trailing icon in that order.
Avoid array construction or opaque helper loops when direct JSX makes the public ordering contract clearer.

## Resolve conditional structure from state

The render function may select among already-resolved slots and compose conditional layout:

- ToggleButton resolves each selected icon and falls back to that side's regular icon before rendering.
- ToggleButton uses a private width reservation and visible label; action-only Button renders the content directly.

Do not create missing slots in the render stage. If a structural element can exist, represent it in the state type and
construct it in the state hook.

`useSlot` runs a phased child immediately. If styling supplies structural props such as Input's leading icon,
resolve the complete child props before its first phase. SearchBox passes the resolved props to an ordinary child
element so the Input phase sees the leading icon and its presentation at once.

Components that own children should render only their declared slots. Do not spread native `children` into the tree and
let consumers bypass slot order.

When responsive overflow changes a trail, render all visible items in one keyed sequence. A key does not preserve
the native target if it moves between separately rendered arrays. Pair a genuinely removed focused target with a
live successor; do not restore over an accepted navigation.

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
