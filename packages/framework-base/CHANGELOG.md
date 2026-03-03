# Change Log - @fluentui-react-native/framework-base

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
