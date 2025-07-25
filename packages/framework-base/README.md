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

- TODO: There are a number of issues with the way types are handled in the larger fluentui-react-native project, helpers and core types will be added here to help solve inference issues, avoid hard typecasts, and help the project eventually move to typescript 5.x.
