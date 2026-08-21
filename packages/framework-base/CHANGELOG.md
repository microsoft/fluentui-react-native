# Change Log - @fluentui-react-native/framework-base

## 0.6.1

### Patch Changes

- 5bc9e81: Normalize component controlled and uncontrolled state patterns and utilities
- 5bc9e81: Give each stateful component axis an explicit owner.

  Adds `useToggleState` to `framework-base` for controls whose interaction _is_ the state change. It wraps
  `useControllableValue` and adds a disabled guard and no-op suppression, so the control works both when a caller owns the
  value and when it owns the value itself.

  Self-driving controls support both directions through the `<state>` / `default<State>` / `on<State>Change` triple:

  - `Accordion` gains `defaultExpanded` and no longer treats a supplied `expanded` value as its own uncontrolled default,
    which previously left `expanded={false}` permanently collapsed.
  - `Checkbox` and `Switch` route their existing axes through the shared hook so disabled and redundant changes behave
    consistently, and `Switch` now forwards `onPress`.

  `Button`, `Card`, `ListItem`, `ListboxItem`, `MenuItem`, `Radio`, and `Tab` keep `selected` as externally driven state.
  They render the value they are given and report the interaction through `onPress`, because a press on a button is an
  action and a press on a tab, radio, or item is a message to the group that owns the selection.

  Storybook stories now demonstrate each axis correctly: `default<State>` drives the self-driving controls, and a
  caller-owned `React.useState` story drives selection. `Button` and `Card` no longer expose `selected` as a control,
  because that prop decides whether the component is a toggle button or a selectable card at all, and flipping it between
  `undefined` and `false` resized or re-roled the component.

- cbd319c: Bump package to publish via ESRP (no changes)

## 0.6.0

### Minor Changes

- 778d82b: Add shared component primitives, styling utilities, state hooks, accessibility diagnostics, and owned native-root prop types.

### Patch Changes

- 3abc13a: Updated packages with agent instructions and type fixes
- 778d82b: Consolidation of shared utilities, dependency profile updates, and more generated components

## 0.5.0

### Minor Changes

- e2a4065: rework framework rendering to prepare for new component structure
- b28f021: Add fluent style slot functionality to framework-base

### Patch Changes

- 1eef74e: Add a default implementation of flex tokens
- 801d8b1: Switch to the released typescript 7
- 5b5afea: Remove depcheck script, allow jest to run tests with platform module suffixes
- 9d2bb3e: Stop caching styles automatically in mergeProps

## 0.4.1

### Patch Changes

- 6c2d6e6: Update packages to esm, with new builds with project references
- 6805bf5: Change base furn packages to stricter types

## 0.4.0

### Minor Changes

- b5a686c: Switch packages to type module

### Patch Changes

- ce37a6d: Remove the final configuration package (moving it to scripts) and switch to running various package validation tasks from the root
- ad85949: Configuration and dependency changes
- f10715d: remove oxlint config package and move it into scripts
- 1598157: Switch tsconfig settings to more modern settings

## 0.3.3

### Patch Changes

- 9cf4444: Migrate from ESLint to oxlint

## 0.3.2

### Patch Changes

- 8a7b549: Update to the latest rnx-kit versions, fix some typing issues, and correct the vscode settings

## 0.3.1

### Patch Changes

- 0d6e9c1: chore: migrate to `oxfmt`
- ac6e7af: Ensure packages have a default export that references the typescript entrypoint and clean up build dependency ordering

## 0.3.0

### Minor Changes

- d7adbdd: # Migration from Beachball to Changesets

  This changeset represents the migration from Beachball to Changesets for version management and consolidates all changes from 440+ beachball change files that were in the `change/` directory.

  All 75 affected packages receive a minor version bump to acknowledge the accumulated changes from the beachball era.

  ## What Changed

  Going forward, all version management uses Changesets via `yarn changeset`. The following beachball infrastructure has been removed:

  - ❌ 440+ beachball change files from `change/` directory
  - ❌ `beachball` package dependency
  - ❌ Beachball scripts from `package.json`
  - ❌ `beachball.config.js` configuration file
  - ❌ Beachball publish steps from Azure Pipelines

  ## New Workflow

  ✅ **Create changes**: Run `yarn changeset` to document changes
  ✅ **Version bump PRs**: Automatically created by GitHub Actions
  ✅ **Publishing**: Handled by Azure Pipelines using `changeset publish`
  ✅ **Validation**: CI validates changesets and blocks major version bumps

  For details, see `CHANGESETS_SETUP.md` and `CONTRIBUTING.md`.

### Patch Changes

- d1d8c26: We were pinning @types/react and react-native-macos via resolutions. This fixes that which uncovered a bunch of type inconsistencies that needed to be addressed.

<!-- This log was last generated on Tue, 05 Aug 2025 18:50:43 GMT and should not be manually modified. -->

<!-- Start content -->

## 0.2.1

Tue, 05 Aug 2025 18:50:43 GMT

### Patches

- move repo to pnpm, create babel and jest config packages, fix dependencies (jasonmo@microsoft.com)

## 0.2.0

Tue, 29 Jul 2025 06:35:19 GMT

### Minor changes

- implement both new and old render patterns for classic and jsx-runtimes (jasonmo@microsoft.com)

## 0.1.4

Fri, 25 Jul 2025 21:36:33 GMT

### Patches

- tune lage.config and fix @types/node version (jasonmo@microsoft.com)

## 0.1.3

Wed, 23 Jul 2025 00:22:13 GMT

### Patches

- fix types in memo-cache as well as a codescan security issue (jasonmo@microsoft.com)

## 0.1.2

Tue, 22 Jul 2025 19:06:23 GMT

### Patches

- centralize jsx rendering functionality in framework-base (jasonmo@microsoft.com)

## 0.1.1

Wed, 16 Jul 2025 20:06:45 GMT

### Patches

- create common framework-base package to share common utiltities more broadly (jasonmo@microsoft.com)
