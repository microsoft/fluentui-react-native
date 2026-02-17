# Change Log - @fluentui-react-native/memo-cache

## 1.3.13

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
  - @fluentui-react-native/framework-base@0.2.2

<!-- This log was last generated on Tue, 05 Aug 2025 18:50:40 GMT and should not be manually modified. -->

<!-- Start content -->

## 1.3.12

Tue, 05 Aug 2025 18:50:40 GMT

### Patches

- move repo to pnpm, create babel and jest config packages, fix dependencies (jasonmo@microsoft.com)

## 1.3.10

Fri, 25 Jul 2025 21:36:33 GMT

### Patches

- tune lage.config and fix @types/node version (jasonmo@microsoft.com)

## 1.3.9

Wed, 23 Jul 2025 00:22:13 GMT

### Patches

- fix types in memo-cache as well as a codescan security issue (jasonmo@microsoft.com)

## 1.3.7

Wed, 16 Jul 2025 20:06:46 GMT

### Patches

- create common framework-base package to share common utiltities more broadly (jasonmo@microsoft.com)

## 1.3.6

Tue, 15 Jul 2025 23:27:08 GMT

### Patches

- add react-native entrypoints that ensure metro targets TS files rather than JS files for bundling (jasonmo@microsoft.com)
- update builds to use node16 settings and modern export maps (jasonmo@microsoft.com)
- fix repo linting with new configs and version, fixing linting errors as well (jasonmo@microsoft.com)
- fix: run beachball sync (sanajmi@microsoft.com)

## 1.3.3

Wed, 29 Jan 2025 18:42:24 GMT

### Patches

- Potential fix for code scanning alert no. 3: Prototype-polluting assignment (ruaraki@microsoft.com)

## 1.3.2

Fri, 01 Mar 2024 20:39:11 GMT

### Patches

- Use workspace for version of local package (ruaraki@microsoft.com)

## 1.3.1

Wed, 09 Aug 2023 22:02:14 GMT

### Patches

- Result of yarn (ruaraki@microsoft.com)

## 1.3.0

Mon, 12 Jun 2023 17:46:43 GMT

### Minor changes

- Changes for treeshake to work (ayushsinghs@yahoo.in)

## 1.2.0

Mon, 05 Jun 2023 19:26:24 GMT

### Minor changes

- Update to react-native 0.71 (30809111+acoates-ms@users.noreply.github.com)

## 1.1.8

Wed, 01 Feb 2023 22:33:16 GMT

### Patches

- Enable @typescript-eslint/consistent-type-imports (30809111+acoates-ms@users.noreply.github.com)

## 1.1.7

Mon, 20 Dec 2021 22:56:01 GMT

### Patches

- Add repository property to all package.json files (ruaraki@microsoft.com)

## 1.1.6

Sat, 18 Dec 2021 04:15:04 GMT

### Patches

- Update to TypeScript 4.5.4. (afoxman@microsoft.com)

## 1.1.5

Mon, 25 Oct 2021 19:24:43 GMT

### Patches

- Use tslib where spreadArray is used (ruaraki@microsoft.com)

## 1.1.4

Tue, 28 Sep 2021 21:08:25 GMT

### Patches

- Delete NativeButton (67026167+chiuam@users.noreply.github.com)

## 1.1.3

Wed, 04 Aug 2021 06:26:25 GMT

### Patches

- radio group on macOS (67026167+chiuam@users.noreply.github.com)

## 1.1.2

Wed, 21 Jul 2021 22:55:40 GMT

### Patches

- expose use-tokens in framework package (jasonmo@microsoft.com)

## 1.1.1

Fri, 18 Jun 2021 00:38:19 GMT

### Patches

- Apply prettier to framework, run (ruaraki@microsoft.com)

## 1.1.0

Fri, 23 Oct 2020 22:27:37 GMT

### Minor changes

- RNIcon feature (warleu@microsoft.com)

## 1.0.4

Fri, 25 Sep 2020 19:21:43 GMT

### Patches

- Update react-native-win32 versions - enable logbox (acoates-ms@noreply.github.com)

## 1.0.3

Wed, 23 Sep 2020 18:31:48 GMT

### Patches

- start publishing src to fix customer source maps (jasonmo@microsoft.com)

## 1.0.2

Mon, 17 Aug 2020 22:08:34 GMT

### Patches

- fix dependency errors (jasonmo@microsoft.com)

## 1.0.1

Thu, 13 Aug 2020 04:48:19 GMT

### Patches

- release @fluentui-react-native/memo-cache (jasonmo@microsoft.com)

## 0.2.10

Thu, 23 Jul 2020 21:28:55 GMT

### Patches

- comment (taamireh@microsoft.com)

## 0.2.0

Wed, 17 Jun 2020 05:00:56 GMT

### Minor changes

- add memo-cache package and consume it in the core framework (jasonmo@microsoft.com)
