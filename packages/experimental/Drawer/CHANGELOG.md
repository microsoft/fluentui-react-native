# Change Log - @fluentui-react-native/drawer

## 0.5.0

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
- Updated dependencies [d1d8c26]
  - @fluentui-react-native/framework@0.15.0
  - @fluentui-react-native/interactive-hooks@0.28.0
  - @fluentui-react-native/theme-tokens@0.28.0
  - @fluentui-react-native/use-styling@0.14.0

<!-- This log was last generated on Tue, 05 Aug 2025 18:50:42 GMT and should not be manually modified. -->

<!-- Start content -->

## 0.4.14

Tue, 05 Aug 2025 18:50:42 GMT

### Patches

- move repo to pnpm, create babel and jest config packages, fix dependencies (jasonmo@microsoft.com)

## 0.4.8

Tue, 15 Jul 2025 23:27:21 GMT

### Patches

- add react-native entrypoints that ensure metro targets TS files rather than JS files for bundling (jasonmo@microsoft.com)
- update builds to use node16 settings and modern export maps (jasonmo@microsoft.com)
- fix: run beachball sync (sanajmi@microsoft.com)

## 0.4.5

Thu, 10 Jul 2025 19:20:26 GMT

### Patches

- Add support for React Native 0.74 (4123478+tido64@users.noreply.github.com)

## 0.4.4

Wed, 29 Jan 2025 23:43:55 GMT

### Patches

- fix tsconfig for jest types (sanajmi@microsoft.com)

## 0.4.0

Thu, 11 Apr 2024 18:08:42 GMT

### Minor changes

- Update to RN 0.73 (30809111+acoates-ms@users.noreply.github.com)

## 0.3.12

Fri, 15 Mar 2024 16:26:19 GMT

### Patches

- Add many missing peerDependencies (30809111+acoates-ms@users.noreply.github.com)

## 0.3.10

Fri, 01 Mar 2024 20:39:10 GMT

### Patches

- Use workspace for version of local package (ruaraki@microsoft.com)

## 0.3.9

Fri, 23 Feb 2024 03:22:29 GMT

### Patches

- Bump @fluentui-react-native/interactive-hooks to v0.26.0

## 0.3.8

Thu, 22 Feb 2024 23:27:45 GMT

### Patches

- Rework package json version notation (rofang@microsoft.com)
- Bump @fluentui-react-native/framework to v0.13.7
- Bump @fluentui-react-native/interactive-hooks to v0.25.8
- Bump @fluentui-react-native/theme-tokens to v0.26.6

## 0.3.7

Mon, 22 Jan 2024 22:09:17 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.6
- Bump @fluentui-react-native/interactive-hooks to v0.25.7

## 0.3.6

Thu, 04 Jan 2024 21:06:26 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.5
- Bump @fluentui-react-native/interactive-hooks to v0.25.6
- Bump @fluentui-react-native/theme-tokens to v0.26.5

## 0.3.5

Thu, 04 Jan 2024 01:35:42 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.4
- Bump @fluentui-react-native/interactive-hooks to v0.25.5
- Bump @fluentui-react-native/theme-tokens to v0.26.4

## 0.3.4

Wed, 03 Jan 2024 00:15:20 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.3
- Bump @fluentui-react-native/interactive-hooks to v0.25.4
- Bump @fluentui-react-native/theme-tokens to v0.26.3

## 0.3.3

Thu, 21 Dec 2023 01:31:00 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.2
- Bump @fluentui-react-native/interactive-hooks to v0.25.3
- Bump @fluentui-react-native/theme-tokens to v0.26.2

## 0.3.2

Wed, 20 Dec 2023 20:20:38 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.1
- Bump @fluentui-react-native/interactive-hooks to v0.25.2

## 0.3.1

Wed, 20 Dec 2023 00:05:24 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.0
- Bump @fluentui-react-native/interactive-hooks to v0.25.1
- Bump @fluentui-react-native/theme-tokens to v0.26.1

## 0.3.0

Thu, 09 Nov 2023 02:39:08 GMT

### Minor changes

- Update to react-native 0.72 (30809111+acoates-ms@users.noreply.github.com)
- Bump @fluentui-react-native/framework to v0.12.0
- Bump @fluentui-react-native/interactive-hooks to v0.25.0
- Bump @fluentui-react-native/theme-tokens to v0.26.0
- Bump @fluentui-react-native/use-styling to v0.12.0

## 0.2.13

Tue, 07 Nov 2023 20:20:33 GMT

### Patches

- Manually bump packages stuck in the pipeline (safreibe@microsoft.com)
- Bump @fluentui-react-native/framework to v0.11.10
- Bump @fluentui-react-native/interactive-hooks to v0.24.12
- Bump @fluentui-react-native/theme-tokens to v0.25.4

## 0.2.11

Mon, 30 Oct 2023 21:26:06 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.8
- Bump @fluentui-react-native/interactive-hooks to v0.24.10
- Bump @fluentui-react-native/theme-tokens to v0.25.2

## 0.2.10

Wed, 25 Oct 2023 20:50:34 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.7
- Bump @fluentui-react-native/interactive-hooks to v0.24.9

## 0.2.9

Tue, 29 Aug 2023 22:56:32 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.6
- Bump @fluentui-react-native/interactive-hooks to v0.24.8

## 0.2.8

Mon, 14 Aug 2023 20:14:41 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.5
- Bump @fluentui-react-native/interactive-hooks to v0.24.7

## 0.2.7

Wed, 09 Aug 2023 22:02:15 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.4
- Bump @fluentui-react-native/interactive-hooks to v0.24.6
- Bump @fluentui-react-native/theme-tokens to v0.25.1
- Bump @fluentui-react-native/use-styling to v0.11.1

## 0.2.6

Mon, 31 Jul 2023 19:29:59 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.3
- Bump @fluentui-react-native/interactive-hooks to v0.24.5

## 0.2.5

Tue, 18 Jul 2023 19:09:32 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.2
- Bump @fluentui-react-native/interactive-hooks to v0.24.4

## 0.2.4

Fri, 07 Jul 2023 20:45:12 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.1
- Bump @fluentui-react-native/interactive-hooks to v0.24.3

## 0.2.3

Mon, 19 Jun 2023 18:37:35 GMT

### Patches

- Bump @fluentui-react-native/interactive-hooks to v0.24.2

## 0.2.2

Sat, 17 Jun 2023 00:00:18 GMT

### Patches

- Bump @fluentui-react-native/interactive-hooks to v0.24.1

## 0.2.1

Mon, 12 Jun 2023 17:46:44 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.0
- Bump @fluentui-react-native/interactive-hooks to v0.24.0
- Bump @fluentui-react-native/use-styling to v0.11.0

## 0.2.0

Mon, 05 Jun 2023 19:26:22 GMT

### Minor changes

- Upgrade to React Native 0.71 (30809111+acoates-ms@users.noreply.github.com)
- Bump @fluentui-react-native/framework to v0.10.0
- Bump @fluentui-react-native/interactive-hooks to v0.23.0
- Bump @fluentui-react-native/theme-tokens to v0.25.0
- Bump @fluentui-react-native/use-styling to v0.10.0

## 0.1.1

Tue, 30 May 2023 20:34:15 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.9.10
- Bump @fluentui-react-native/interactive-hooks to v0.22.31
- Bump @fluentui-react-native/theme-tokens to v0.24.7

## 0.1.0

Fri, 19 May 2023 04:14:45 GMT

### Minor changes

- feat: initial structuring for v1 js drawer (rohanpd.work@gmail.com)
