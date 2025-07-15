# Framework Base package

This package provides core types and helpers used by both the old and new versions of the framework.

Several previously standalone packages have had their implementations moved into this package. This allows them to share certain typings and helpers without having to work around circular dependency issues. The moved packages are:

- `@fluentui-react-native/immutable-merge`
- `@fluentui-react-native/memo-cache`
- `@fluentui-react-native/merge-props`

The functionality in these packages can be imported either by the base entry point for the package, or by using dedicated exports. The previous packages will continue to exist for the time being but are now just references to their individual exports.

## Type Helpers

- TODO: There are a number of issues with the way types are handled in the larger fluentui-react-native project, helpers and core types will be added here to help solve inference issues, avoid hard typecasts, and help the project eventually move to typescript 5.x.

## JSX Helpers

- TODO: Both classic and the new jsx-runtime helpers will eventually come out of this package and be shared between old and new frameworks. This will be necessary to improve typing across the board.
