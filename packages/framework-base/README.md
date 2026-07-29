# `@fluentui-react-native/framework-base`

This package provides core implementations and types to support both the legacy and current frameworks.

The functionality in these packages is now exposed as part of this package.

## Component Patterns

The shared rendering patterns and JSX handlers are centralized in this package. See the
[component authoring guide](./src/component-patterns/README.md) for how to choose and
combine `directComponent`, `phasedComponent`, and slots.

## Type Helpers

This package provides several TypeScript utility types:

- `PropsOf<TComponent>` - Extract props from a React component type
- `PropsWithRefOf<TComponent>` - Extract props, including a supported ref, from a React component type
- `PropsChildren<TProps>` - Extract the children entry from a props type
- `PropsWithoutChildren<TProps>` / `PartialWithoutChildren<TProps>` - Remove children while preserving unions
- `FunctionComponent<TProps>` - A function component type without the children handling complications of React.FC
- `DirectComponent<TProps>` - A function component marked for direct rendering
- `PhasedComponent<TProps>` - A component with two-phase rendering support
- `PhasedRender<TProps>` - The render signature for phased components (phase one returns the phase two renderer)
- `SlotComponent<TProps>` - Slot component type used in the composition framework
- `PropsTransform<TPropsIn, TPropsOut>` - A transform that maps one set of props to another
- `ComponentPropsTransform<TComponent>` - A transform for the resolved props of a component type
- `SlotOptions<TComponent>` - Default props, transform, and optional-slot rendering behavior
- `Simplify<T>`, `OuterPartial<T>`, and `PartialExcept<T, K>` - Helpers for producing readable partial object types
- `MergeCoreOptions` - Options accepted by `immutableMergeCore`
- `ValueFactory<T>` - Factory signature accepted by memo cache functions

## JSX Runtime

This package exports a custom JSX runtime at `@fluentui-react-native/framework-base/jsx-runtime`. Use it in your component files by adding this pragma as the **first line** of the file:

```tsx
/** @jsxImportSource @fluentui-react-native/framework-base */
```

The custom runtime enables automatic element flattening for direct and phased components. Any package using this pragma must include `@fluentui-react-native/framework-base` in its `devDependencies`.

> **Note:** This is the current pattern and replaces the legacy `/** @jsx withSlots */` directive (which required importing `withSlots` explicitly). The exported `withSlots` helper remains available only for the classic runtime used by deprecated framework code.
