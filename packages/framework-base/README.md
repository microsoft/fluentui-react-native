# `@fluentui-react-native/framework-base`

This package provides core implementations and types to support both the legacy and current frameworks.

Several previously standalone packages have had their implementations moved into this package. This allows them to share certain typings and helpers without having to work around circular dependency issues. The moved packages are:

- [`@fluentui-react-native/immutable-merge`](./src/immutable-merge/README.md)
- [`@fluentui-react-native/memo-cache`](./src/memo-cache/README.md)
- [`@fluentui-react-native/merge-props`](./src/merge-props/README.md)

The functionality in these packages is now exposed as part of this package.

## Component Patterns

The shared patterns for rendering components, as well as the JSX handlers have been centralized in this package. More information can be found [here](./src/component-patterns/README.md).

## Type Helpers

This package provides several TypeScript utility types:

- `PropsOf<TComponent>` - Extract props from a React component type
- `FunctionComponent<TProps>` - A function component type without the children handling complications of React.FC
- `DirectComponent<TProps>` - A function component marked for direct rendering
- `PhasedComponent<TProps>` - A component with two-phase rendering support
- `SlotFn<TProps>` - Slot function type used in the composition framework
- `FinalRender<TProps>` - The final rendering signature for phased components

## JSX Runtime

This package exports a custom JSX runtime at `@fluentui-react-native/framework-base/jsx-runtime`. Use it in your component files with:

```tsx
/** @jsxImportSource @fluentui-react-native/framework-base */
```

The custom runtime enables automatic element flattening for direct and phased components.
