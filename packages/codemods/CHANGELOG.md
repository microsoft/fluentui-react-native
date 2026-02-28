# Change Log - @fluentui-react-native/codemods

## 0.6.1

### Patch Changes

- 0d6e9c1: chore: migrate to `oxfmt`
- ac6e7af: Ensure packages have a default export that references the typescript entrypoint and clean up build dependency ordering

## 0.6.0

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

<!-- This log was last generated on Tue, 05 Aug 2025 18:50:42 GMT and should not be manually modified. -->

<!-- Start content -->

## 0.5.19

Tue, 05 Aug 2025 18:50:42 GMT

### Patches

- move repo to pnpm, create babel and jest config packages, fix dependencies (jasonmo@microsoft.com)

## 0.5.18

Tue, 15 Jul 2025 23:27:26 GMT

### Patches

- update builds to use node16 settings and modern export maps (jasonmo@microsoft.com)
- fix repo linting with new configs and version, fixing linting errors as well (jasonmo@microsoft.com)
- fix: run beachball sync (sanajmi@microsoft.com)
- add react-native entrypoints that ensure metro targets TS files rather than JS files for bundling (jasonmo@microsoft.com)

## 0.5.14

Wed, 29 Jan 2025 23:43:54 GMT

### Patches

- fix tsconfig for jest types (sanajmi@microsoft.com)

## 0.5.13

Mon, 23 Sep 2024 18:26:22 GMT

### Patches

- Updating jscodeshift (ruaraki@microsoft.com)

## 0.5.11

Fri, 15 Mar 2024 16:26:18 GMT

### Patches

- Add many missing peerDependencies (30809111+acoates-ms@users.noreply.github.com)

## 0.5.10

Fri, 01 Mar 2024 20:39:09 GMT

### Patches

- Use workspace for version of local package (ruaraki@microsoft.com)

## 0.5.3

Tue, 07 Nov 2023 20:20:32 GMT

### Patches

- Manually bump packages stuck in the pipeline (safreibe@microsoft.com)

## 0.5.0

Mon, 12 Jun 2023 17:46:42 GMT

### Minor changes

- Changes for treeshake to work (ayushsinghs@yahoo.in)

## 0.4.0

Mon, 05 Jun 2023 19:26:22 GMT

### Minor changes

- Upgrade to React Native 0.71 (sanajmi@microsoft.com)

## 0.3.7

Fri, 24 Feb 2023 20:39:57 GMT

### Patches

- Order imports (78454019+lyzhan7@users.noreply.github.com)

## 0.3.6

Thu, 02 Feb 2023 01:29:38 GMT

### Patches

- Add eslint to packages missing a config (30809111+acoates-ms@users.noreply.github.com)

## 0.3.0

Wed, 04 Jan 2023 02:04:50 GMT

### Minor changes

- Build cli for codemod package (ruaraki@microsoft.com)

## 0.2.0

Mon, 03 Oct 2022 16:40:48 GMT

### Minor changes

- Add deprecate script and test (ruaraki@microsoft.com)

## 0.1.0

Thu, 22 Sep 2022 18:51:04 GMT

### Minor changes

- Add button-v0-to-button-v1 script (ruaraki@microsoft.com)
