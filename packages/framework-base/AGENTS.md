# Framework Base component authoring

These instructions apply to `packages/framework-base` and its descendants.

Read [`src/component-patterns/README.md`](./src/component-patterns/README.md) before
adding or changing a component pattern.

## Pattern selection

- Use `directComponent` only for hook-free prop and render transformations.
- Use `phasedComponent` when hooks, context, state, tokens, or slots are needed.
- Create slots in the first phase and return a hook-free `directComponent` for the
  final render when practical.
- Use a normal React component when a distinct React boundary is intentional.
- Do not add new uses of `legacyDirectComponent` or `stagedComponent`.

## Authoring rules

- Put `/** @jsxImportSource @fluentui-react-native/framework-base */` on the first
  line of component files using these patterns.
- Keep children in props for modern direct and phased render functions.
- Never call hooks from a `directComponent` or from the render phase returned by
  `phasedComponent`.
- Declare slots from component types, for example `Slot<typeof View>` and
  `OptionalSlot<typeof Text>`.
- Prefer inferred calls such as `useSlot(View, props)` so native ref types are
  preserved.
- Use `useSlot` for required slots and `useOptionalSlot` for optional slots. Both
  accept raw props, shorthand children, and `as` customization.
- For `useOptionalSlot`, treat `null` as explicitly hidden and use
  `renderByDefault` to control whether `undefined` renders.
- Ensure an `as` replacement accepts the declared props and forwards a compatible
  ref when the slot is referenced.
- Render ref-bearing callable slots through the custom JSX runtime. React 18's
  classic `React.createElement` path does not forward refs through function slots.

## Coverage

Add compile-time type assertions for public type behavior and runtime tests for
rendering, prop merging, children, keys, and refs affected by a change.
