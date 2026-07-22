# @fluentui-react-native/design

## 0.2.0

### Minor Changes

- d2690c9: Move theme type definitions into the `@fluentui-react-native/design` package under the new `@fluentui-react-native/design/theming` submodule export. The `@fluentui-react-native/theme-types` package is now a thin compatibility shim that re-exports from `@fluentui-react-native/design/theming`, and all in-repo consumers now reference the new submodule.

### Patch Changes

- e37b04b: Adding new core design package to consolidate design types, values, concepts, and utilities
- 01ed385: Switch packages that referenced globalTokens by object to use the new constant references instead
- 1eef74e: Add a default implementation of flex tokens
- 801d8b1: Switch to the released typescript 7
- 80bf14d: Move platform theming utilities into the design package, update usage in the repo to use the new source"
- c1de024: Add central font size/weight lookup by name to design package and consume in Text.tsx
- 03ba7ef: Add flex tokens draft shape
- Updated dependencies [1eef74e]
- Updated dependencies [801d8b1]
- Updated dependencies [e2a4065]
- Updated dependencies [5b5afea]
- Updated dependencies [9d2bb3e]
  - @fluentui-react-native/framework-base@0.5.0
