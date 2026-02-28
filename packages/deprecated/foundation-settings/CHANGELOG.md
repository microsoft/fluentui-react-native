# Change Log - @uifabricshared/foundation-settings

## 0.16.1

### Patch Changes

- 0d6e9c1: chore: migrate to `oxfmt`
- ac6e7af: Ensure packages have a default export that references the typescript entrypoint and clean up build dependency ordering
- Updated dependencies [0d6e9c1]
- Updated dependencies [ac6e7af]
  - @fluentui-react-native/framework-base@0.3.1

## 0.16.0

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

## 0.15.11

Tue, 05 Aug 2025 18:50:39 GMT

### Patches

- move repo to pnpm, create babel and jest config packages, fix dependencies (jasonmo@microsoft.com)

## 0.15.6

Wed, 16 Jul 2025 20:06:45 GMT

### Patches

- create common framework-base package to share common utiltities more broadly (jasonmo@microsoft.com)

## 0.15.5

Tue, 15 Jul 2025 23:26:45 GMT

### Patches

- update builds to use node16 settings and modern export maps (jasonmo@microsoft.com)
- fix: run beachball sync (sanajmi@microsoft.com)
- add react-native entrypoints that ensure metro targets TS files rather than JS files for bundling (jasonmo@microsoft.com)
- fix repo linting with new configs and version, fixing linting errors as well (jasonmo@microsoft.com)

## 0.15.2

Thu, 10 Jul 2025 19:20:12 GMT

### Patches

- Add support for React Native 0.74 (4123478+tido64@users.noreply.github.com)

## 0.15.0

Thu, 11 Apr 2024 18:08:40 GMT

### Minor changes

- Update to RN 0.73 (30809111+acoates-ms@users.noreply.github.com)

## 0.14.1

Fri, 01 Mar 2024 20:39:08 GMT

### Patches

- Use workspace for version of local package (ruaraki@microsoft.com)

## 0.14.0

Thu, 09 Nov 2023 02:39:06 GMT

### Minor changes

- Update to react-native 0.72 (30809111+acoates-ms@users.noreply.github.com)
- Bump @fluentui-react-native/merge-props to v0.8.0

## 0.13.2

Wed, 09 Aug 2023 22:02:15 GMT

### Patches

- Bump @fluentui-react-native/immutable-merge to v1.2.1
- Bump @fluentui-react-native/merge-props to v0.7.1

## 0.13.1

Mon, 12 Jun 2023 17:46:44 GMT

### Patches

- Bump @fluentui-react-native/merge-props to v0.7.0

## 0.13.0

Mon, 05 Jun 2023 19:26:25 GMT

### Minor changes

- Upgrade to React Native 0.71 (sanajmi@microsoft.com)
- Bump @fluentui-react-native/immutable-merge to v1.2.0
- Bump @fluentui-react-native/merge-props to v0.6.0

## 0.12.3

Fri, 24 Feb 2023 20:40:00 GMT

### Patches

- Order imports (78454019+lyzhan7@users.noreply.github.com)
- Bump @fluentui-react-native/merge-props to v0.5.3

## 0.12.2

Wed, 01 Feb 2023 22:33:17 GMT

### Patches

- Enable @typescript-eslint/consistent-type-imports (30809111+acoates-ms@users.noreply.github.com)
- Bump @fluentui-react-native/immutable-merge to v1.1.8
- Bump @fluentui-react-native/merge-props to v0.5.2

## 0.12.1

Fri, 30 Sep 2022 00:54:37 GMT

### Patches

- Update react-native to 0.68 (krsiler@microsoft.com)
- Bump @fluentui-react-native/merge-props to v0.5.1

## 0.12.0

Thu, 14 Jul 2022 18:09:50 GMT

### Minor changes

- Update to React Native 0.66 (sanajmi@microsoft.com)
- Bump @fluentui-react-native/merge-props to v0.5.0

## 0.11.3

Thu, 31 Mar 2022 07:27:48 GMT

### Patches

- Ban `export *` in index files for better tree-shakeability (4123478+tido64@users.noreply.github.com)
- Bump @fluentui-react-native/immutable-merge to v1.1.7
- Bump @fluentui-react-native/merge-props to v0.4.3

## 0.11.2

Mon, 20 Dec 2021 22:56:02 GMT

### Patches

- Add repository property to all package.json files (ruaraki@microsoft.com)
- Bump @fluentui-react-native/immutable-merge to v1.1.6
- Bump @fluentui-react-native/merge-props to v0.4.2

## 0.11.1

Sat, 18 Dec 2021 04:15:05 GMT

### Patches

- Bump @fluentui-react-native/immutable-merge to v1.1.5
- Bump @fluentui-react-native/merge-props to v0.4.1

## 0.11.0

Wed, 17 Nov 2021 19:28:07 GMT

### Minor changes

- Update to react-native 0.64 (afoxman@microsoft.com)

### Patches

- Bump @fluentui-react-native/merge-props to v0.4.0 (afoxman@microsoft.com)

## 0.10.3

Mon, 25 Oct 2021 19:24:43 GMT

### Patches

- Bump @fluentui-react-native/immutable-merge to v1.1.4 (ruaraki@microsoft.com)

## 0.10.2

Tue, 28 Sep 2021 21:08:25 GMT

### Patches

- Delete NativeButton (67026167+chiuam@users.noreply.github.com)

## 0.10.1

Sat, 07 Aug 2021 00:40:04 GMT

### Patches

- enable usePressableState with stock Pressable component (jasonmo@microsoft.com)

## 0.10.0

Wed, 04 Aug 2021 06:26:25 GMT

### Minor changes

- radio group on macOS (67026167+chiuam@users.noreply.github.com)

### Patches

- Bump @fluentui-react-native/immutable-merge to v1.1.3 (67026167+chiuam@users.noreply.github.com)
- Bump @fluentui-react-native/merge-props to v0.3.3 (67026167+chiuam@users.noreply.github.com)

## 0.9.2

Wed, 21 Jul 2021 22:55:40 GMT

### Patches

- expose use-tokens in framework package (jasonmo@microsoft.com)

## 0.9.1

Fri, 18 Jun 2021 00:38:19 GMT

### Patches

- Apply prettier to framework, run (ruaraki@microsoft.com)

## 0.9.0

Tue, 15 Jun 2021 00:55:36 GMT

### Minor changes

- Add support for ColorValue (ruaraki@microsoft.com)

## 0.8.0

Fri, 23 Oct 2020 22:27:37 GMT

### Minor changes

- RNIcon feature (warleu@microsoft.com)

## 0.7.2

Fri, 25 Sep 2020 19:21:43 GMT

### Patches

- Update react-native-win32 versions - enable logbox (acoates-ms@noreply.github.com)

## 0.7.1

Wed, 23 Sep 2020 18:31:48 GMT

### Patches

- start publishing src to fix customer source maps (jasonmo@microsoft.com)

## 0.7.0

Thu, 20 Aug 2020 00:14:01 GMT

### Minor changes

- split mergeProps and mergeStyles out of foundation-settings (jasonmo@microsoft.com)

## 0.6.4

Mon, 17 Aug 2020 22:08:34 GMT

### Patches

- fix dependency errors (jasonmo@microsoft.com)

## 0.6.3

Thu, 13 Aug 2020 04:48:19 GMT

### Patches

- release @fluentui-react-native/memo-cache (jasonmo@microsoft.com)

## 0.6.2

Wed, 12 Aug 2020 23:52:15 GMT

### Patches

- release @fluentui-react-native/immutable-merge (jasonmo@microsoft.com)

## 0.6.0

Sat, 04 Jul 2020 06:24:16 GMT

### Minor changes

- make all style merging use caching, get rid of unused finalizer (jasonmo@microsoft.com)

## 0.5.57

Wed, 17 Jun 2020 05:00:56 GMT

### Patches

- add memo-cache package and consume it in the core framework (jasonmo@microsoft.com)

## 0.5.39

Tue, 09 Jun 2020 17:39:01 GMT

### Patches

- switch dependencies to use greater than semver until we reach 1.0.0 (jasonmo@microsoft.com)

## 0.5.1

Tue, 21 Apr 2020 00:41:10 GMT

### Patches

- update beachball hook to use new prepublish strategy (jasonmo@microsoft.com)

## 0.5.0

Fri, 17 Apr 2020 22:36:03 GMT

### Minor changes

- yarn.lock (warleu@microsoft.com)

## 0.4.13

Thu, 16 Apr 2020 23:57:38 GMT

### Patches

- publish with correct main/module references (jasonmo@microsoft.com)

## 0.4.12

Thu, 09 Apr 2020 21:14:58 GMT

### Patches

- rework merge with improved API (jasonmo@microsoft.com)

## 0.4.11

Thu, 09 Apr 2020 18:39:15 GMT

### Patches

- merge conflicts (ppatboyd@outlook.com)

## 0.4.9

Fri, 03 Apr 2020 20:40:51 GMT

### Patches

- switch the bin name from just-script to fluent-scripts to disambiguate names (jasonmo@microsoft.com)

## 0.4.8

Tue, 31 Mar 2020 18:01:09 GMT

### Patches

- Merge branch 'sammy/checkboxV1' of https://github.com/samuelfreiberg/fluentui-react-native into sammy/checkboxV1 (safreibe@microsoft.com)

## 0.4.7

Mon, 30 Mar 2020 16:27:00 GMT

### Patches

- Update main attribute to specify TypeScript index file. (kinhln@microsoft.com)

## 0.4.5

Sat, 07 Mar 2020 00:42:50 GMT

### Patches

- more config fixes (jasonmo@microsoft.com)

## 0.4.4

Thu, 20 Feb 2020 01:36:35 GMT

### Patches

- restructure directories in project (jasonmo@microsoft.com)

## 0.4.3

Fri, 07 Feb 2020 00:29:25 GMT

### Patches

- clean up just tasks and remove unnecessary webpack configs (jasonmo@microsoft.com)

## 0.4.2

Thu, 06 Feb 2020 01:00:13 GMT

### Patches

- clean up just tasks and remove unnecessary webpack configs (jasonmo@microsoft.com)

## 0.4.1

Fri, 13 Dec 2019 21:50:31 GMT

### Patches

- 🐛 Add missing tokens typing to theme definitions (adrum@microsoft.com)

## 0.4.0

Wed, 20 Nov 2019 19:37:06 GMT

### Minor changes

- 📦 fix package entrypoints to distinguish CJS/ES6 (adrum@microsoft.com)

## 0.3.3

Fri, 01 Nov 2019 16:51:54 GMT

### Patches

- fix version references for packages (jasonmo@microsoft.com)

## 0.3.2

Wed, 30 Oct 2019 20:23:45 GMT

### Patches

- ensure styles merge selectors and merge handles className (jasonmo360@gmail.com)

## 0.3.1

Tue, 15 Oct 2019 02:11:41 GMT

### Patches

- api-extractor setup (taamireh@microsoft.com)

## 0.3.0

Thu, 26 Sep 2019 19:45:56 GMT

### Minor changes

- remove \_parent from component settings and stop using augment platform theme for settings (jasonmo360@gmail.com)

## 0.2.2

Thu, 19 Sep 2019 23:21:48 GMT

### Patches

- force publish (taamireh@microsoft.com)

## 0.2.1

Thu, 19 Sep 2019 00:21:30 GMT

### Patches

- change scope names (taamireh@microsoft.com)

## 0.2.0

Sat, 14 Sep 2019 01:56:36 GMT

### Minor changes

- Fix applying stacked overrides (jasonmo@microsoft.com)

### Patches

- Begin turning on some linting rules (taamireh@microsoft.com)
