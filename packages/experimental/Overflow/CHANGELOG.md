# Change Log - @fluentui-react-native/overflow

## 0.3.43

### Patch Changes

- d7adbdd: # Migration from Beachball to Changesets

  This changeset represents the migration from Beachball to Changesets for version management and consolidates all changes from 440+ beachball change files that were in the `change/` directory.

  All 75 affected packages receive a patch version bump to acknowledge the accumulated changes from the beachball era.

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

- Updated dependencies [d7adbdd]
  - @fluentui-react-native/framework@0.14.18
  - @fluentui-react-native/framework-base@0.2.2

<!-- This log was last generated on Tue, 05 Aug 2025 18:50:40 GMT and should not be manually modified. -->

<!-- Start content -->

## 0.3.34

Tue, 05 Aug 2025 18:50:40 GMT

### Patches

- move repo to pnpm, create babel and jest config packages, fix dependencies (jasonmo@microsoft.com)

## 0.3.26

Tue, 15 Jul 2025 23:27:07 GMT

### Patches

- update builds to use node16 settings and modern export maps (jasonmo@microsoft.com)
- fix: run beachball sync (sanajmi@microsoft.com)
- add react-native entrypoints that ensure metro targets TS files rather than JS files for bundling (jasonmo@microsoft.com)

## 0.3.23

Thu, 10 Jul 2025 19:20:20 GMT

### Patches

- Add support for React Native 0.74 (4123478+tido64@users.noreply.github.com)

## 0.3.19

Wed, 29 Jan 2025 23:43:53 GMT

### Patches

- remove enzyme tests (sanajmi@microsoft.com)

## 0.3.4

Wed, 19 Jun 2024 18:09:31 GMT

### Patches

- fix(Apple): Render vector borders on Button (sanajmi@microsoft.com)

## 0.3.0

Thu, 11 Apr 2024 18:08:38 GMT

### Minor changes

- Update to RN 0.73 (30809111+acoates-ms@users.noreply.github.com)

## 0.2.9

Fri, 29 Mar 2024 00:57:12 GMT

### Patches

- Fix dynamic removal and addition of OverflowItems not causing overflow updates. (winlarry@microsoft.com)

## 0.2.7

Wed, 20 Mar 2024 22:58:12 GMT

### Patches

- Fix OverflowItem incorrectly merging its props with its cloned child. (winlarry@microsoft.com)

## 0.2.4

Sat, 16 Mar 2024 18:50:13 GMT

### Patches

- Fix more typos in Overflow doc (winlarry@microsoft.com)

## 0.2.3

Fri, 15 Mar 2024 22:44:19 GMT

### Patches

- Fix typos, add visual examples of Overflow scenarios to spec. (winlarry@microsoft.com)

## 0.2.1

Fri, 15 Mar 2024 16:26:20 GMT

### Patches

- Add many missing peerDependencies (30809111+acoates-ms@users.noreply.github.com)

## 0.2.0

Thu, 14 Mar 2024 22:02:05 GMT

### Minor changes

- Add Overflow / OverflowItem components (winlarry@microsoft.com)
