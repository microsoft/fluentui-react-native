# Change Log - @fluentui-react-native/use-slot

## 0.7.0

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
- Updated dependencies [d7adbdd]
- Updated dependencies [d1d8c26]
  - @fluentui-react-native/framework-base@0.3.0

<!-- This log was last generated on Tue, 05 Aug 2025 18:50:39 GMT and should not be manually modified. -->

<!-- Start content -->

## 0.6.12

Tue, 05 Aug 2025 18:50:39 GMT

### Patches

- move repo to pnpm, create babel and jest config packages, fix dependencies (jasonmo@microsoft.com)

## 0.6.8

Tue, 22 Jul 2025 19:06:24 GMT

### Patches

- centralize jsx rendering functionality in framework-base (jasonmo@microsoft.com)

## 0.6.7

Wed, 16 Jul 2025 20:06:46 GMT

### Patches

- create common framework-base package to share common utiltities more broadly (jasonmo@microsoft.com)

## 0.6.6

Tue, 15 Jul 2025 23:26:52 GMT

### Patches

- fix: run beachball sync (sanajmi@microsoft.com)
- add react-native entrypoints that ensure metro targets TS files rather than JS files for bundling (jasonmo@microsoft.com)
- fix repo linting with new configs and version, fixing linting errors as well (jasonmo@microsoft.com)
- update builds to use node16 settings and modern export maps (jasonmo@microsoft.com)

## 0.6.3

Thu, 10 Jul 2025 19:20:14 GMT

### Patches

- Add support for React Native 0.74 (4123478+tido64@users.noreply.github.com)

## 0.6.2

Wed, 29 Jan 2025 23:43:52 GMT

### Patches

- remove enzyme tests (sanajmi@microsoft.com)

## 0.6.0

Thu, 11 Apr 2024 18:08:40 GMT

### Minor changes

- Update to RN 0.73 (30809111+acoates-ms@users.noreply.github.com)

## 0.5.2

Fri, 01 Mar 2024 20:39:08 GMT

### Patches

- Use workspace for version of local package (ruaraki@microsoft.com)

## 0.5.1

Thu, 22 Feb 2024 23:27:44 GMT

### Patches

- Rework package json version notation (rofang@microsoft.com)

## 0.5.0

Thu, 09 Nov 2023 02:39:11 GMT

### Minor changes

- Update to react-native 0.72 (30809111+acoates-ms@users.noreply.github.com)
- Bump @fluentui-react-native/merge-props to v0.8.0

## 0.4.2

Wed, 09 Aug 2023 22:02:15 GMT

### Patches

- Bump @fluentui-react-native/merge-props to v0.7.1

## 0.4.1

Mon, 12 Jun 2023 17:46:44 GMT

### Patches

- Bump @fluentui-react-native/merge-props to v0.7.0

## 0.4.0

Mon, 05 Jun 2023 19:26:25 GMT

### Minor changes

- Upgrade to React Native 0.71 (sanajmi@microsoft.com)
- Bump @fluentui-react-native/merge-props to v0.6.0

## 0.3.4

Fri, 24 Feb 2023 20:40:00 GMT

### Patches

- Order imports (78454019+lyzhan7@users.noreply.github.com)
- Bump @fluentui-react-native/merge-props to v0.5.3

## 0.3.3

Thu, 02 Feb 2023 01:29:39 GMT

### Patches

- Add eslint to packages missing a config (30809111+acoates-ms@users.noreply.github.com)

## 0.3.2

Wed, 01 Feb 2023 22:33:17 GMT

### Patches

- Bump @fluentui-react-native/merge-props to v0.5.2

## 0.3.1

Fri, 30 Sep 2022 00:54:37 GMT

### Patches

- Update react-native to 0.68 (krsiler@microsoft.com)
- Bump @fluentui-react-native/merge-props to v0.5.1

## 0.3.0

Thu, 14 Jul 2022 18:09:50 GMT

### Minor changes

- Update to React Native 0.66 (sanajmi@microsoft.com)
- Bump @fluentui-react-native/merge-props to v0.5.0

## 0.2.6

Thu, 31 Mar 2022 07:27:48 GMT

### Patches

- Bump @fluentui-react-native/merge-props to v0.4.3

## 0.2.5

Tue, 21 Dec 2021 20:56:31 GMT

### Patches

- Fix chevron on menu button (ruaraki@microsoft.com)

## 0.2.4

Mon, 20 Dec 2021 22:56:01 GMT

### Patches

- Add repository property to all package.json files (ruaraki@microsoft.com)
- Bump @fluentui-react-native/merge-props to v0.4.2

## 0.2.3

Sat, 18 Dec 2021 04:15:05 GMT

### Patches

- Update to TypeScript 4.5.4. (afoxman@microsoft.com)
- Bump @fluentui-react-native/merge-props to v0.4.1

## 0.2.2

Fri, 17 Dec 2021 22:06:58 GMT

### Patches

- Revert "Remove content prop (#1257)" (ruaraki@microsoft.com)

## 0.2.1

Fri, 17 Dec 2021 19:53:21 GMT

### Patches

- Fix chevron on menu button (ruaraki@microsoft.com)

## 0.2.0

Wed, 17 Nov 2021 19:28:07 GMT

### Minor changes

- Update to react-native 0.64 (afoxman@microsoft.com)

### Patches

- Bump @fluentui-react-native/merge-props to v0.4.0 (afoxman@microsoft.com)

## 0.1.7

Mon, 25 Oct 2021 19:24:43 GMT

### Patches

- Use tslib where spreadArray is used (ruaraki@microsoft.com)

## 0.1.6

Tue, 28 Sep 2021 21:08:25 GMT

### Patches

- Delete NativeButton (67026167+chiuam@users.noreply.github.com)

## 0.1.5

Sat, 07 Aug 2021 00:40:04 GMT

### Patches

- enable usePressableState with stock Pressable component (jasonmo@microsoft.com)

## 0.1.4

Wed, 04 Aug 2021 06:26:25 GMT

### Patches

- radio on macOS (67026167+chiuam@users.noreply.github.com)

## 0.1.3

Tue, 27 Jul 2021 22:17:20 GMT

### Patches

- add compressible utility and a snapshot test / demo to framework (jasonmo@microsoft.com)

## 0.1.2

Mon, 26 Jul 2021 20:41:04 GMT

### Patches

- add new use-slot package, move framework to consume that package (jasonmo@microsoft.com)
