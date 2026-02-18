# Change Log - @fluentui-react-native/tokens

## 0.24.0

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
  - @fluentui-react-native/adapters@0.14.0
  - @fluentui-react-native/theme-types@0.44.0

<!-- This log was last generated on Tue, 05 Aug 2025 18:50:38 GMT and should not be manually modified. -->

<!-- Start content -->

## 0.23.6

Tue, 05 Aug 2025 18:50:38 GMT

### Patches

- move repo to pnpm, create babel and jest config packages, fix dependencies (jasonmo@microsoft.com)

## 0.23.5

Tue, 15 Jul 2025 23:26:51 GMT

### Patches

- update builds to use node16 settings and modern export maps (jasonmo@microsoft.com)
- fix: run beachball sync (sanajmi@microsoft.com)
- add react-native entrypoints that ensure metro targets TS files rather than JS files for bundling (jasonmo@microsoft.com)

## 0.23.2

Thu, 10 Jul 2025 19:20:15 GMT

### Patches

- Add support for React Native 0.74 (4123478+tido64@users.noreply.github.com)

## 0.23.0

Thu, 11 Apr 2024 18:08:40 GMT

### Minor changes

- Update to RN 0.73 (30809111+acoates-ms@users.noreply.github.com)

## 0.22.8

Fri, 15 Mar 2024 16:26:21 GMT

### Patches

- Add many missing peerDependencies (30809111+acoates-ms@users.noreply.github.com)

## 0.22.7

Fri, 01 Mar 2024 20:39:13 GMT

### Patches

- Use workspace for version of local package (ruaraki@microsoft.com)

## 0.22.6

Thu, 22 Feb 2024 23:27:43 GMT

### Patches

- Rework package json version notation (rofang@microsoft.com)

## 0.22.5

Thu, 04 Jan 2024 21:06:26 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.38.0

## 0.22.4

Thu, 04 Jan 2024 01:35:42 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.37.0

## 0.22.3

Wed, 03 Jan 2024 00:15:20 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.36.0

## 0.22.2

Thu, 21 Dec 2023 01:31:00 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.35.0

## 0.22.1

Wed, 20 Dec 2023 00:05:24 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.34.0

## 0.22.0

Thu, 09 Nov 2023 02:39:11 GMT

### Minor changes

- Update to react-native 0.72 (30809111+acoates-ms@users.noreply.github.com)
- Bump @fluentui-react-native/adapters to v0.12.0
- Bump @fluentui-react-native/theme-types to v0.33.0

## 0.21.6

Tue, 07 Nov 2023 20:20:36 GMT

### Patches

- Use RN-based dynamic type (adgleitm@microsoft.com)
- Manually bump packages stuck in the pipeline (safreibe@microsoft.com)
- Bump @fluentui-react-native/theme-types to v0.32.3

## 0.21.4

Mon, 30 Oct 2023 21:26:06 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.32.1

## 0.21.3

Tue, 29 Aug 2023 22:56:32 GMT

### Patches

- Bump @fluentui-react-native/adapters to v0.11.3

## 0.21.2

Mon, 14 Aug 2023 20:14:41 GMT

### Patches

- Bump @fluentui-react-native/adapters to v0.11.2

## 0.21.1

Fri, 07 Jul 2023 20:45:12 GMT

### Patches

- Bump @fluentui-react-native/adapters to v0.11.1

## 0.21.0

Mon, 05 Jun 2023 19:26:25 GMT

### Minor changes

- Upgrade to React Native 0.71 (sanajmi@microsoft.com)
- Bump @fluentui-react-native/adapters to v0.11.0
- Bump @fluentui-react-native/theme-types to v0.32.0

## 0.20.16

Tue, 30 May 2023 20:34:15 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.31.2

## 0.20.15

Wed, 03 May 2023 07:08:52 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.31.1

## 0.20.14

Tue, 21 Mar 2023 21:53:45 GMT

### Patches

- Trigger manual bump (no changes) (krsiler@microsoft.com)

## 0.20.13

Sat, 18 Mar 2023 17:22:31 GMT

### Patches

- Add 'width' to layout-tokens (winlarry@microsoft.com)

## 0.20.12

Tue, 14 Mar 2023 20:50:45 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.31.0

## 0.20.11

Fri, 03 Mar 2023 06:47:26 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.30.4

## 0.20.10

Fri, 24 Feb 2023 20:40:00 GMT

### Patches

- Order imports (78454019+lyzhan7@users.noreply.github.com)
- Bump @fluentui-react-native/adapters to v0.10.2
- Bump @fluentui-react-native/theme-types to v0.30.3

## 0.20.9

Fri, 24 Feb 2023 02:22:40 GMT

### Patches

- Add fontStyle and textDecorationLine to FontStyleTokens interface (winlarry@microsoft.com)

## 0.20.8

Sat, 11 Feb 2023 01:32:30 GMT

### Patches

- Add maxHeight token to layout tokens (winlarry@microsoft.com)

## 0.20.7

Wed, 01 Feb 2023 22:33:17 GMT

### Patches

- Enable @typescript-eslint/consistent-type-imports (30809111+acoates-ms@users.noreply.github.com)
- Bump @fluentui-react-native/adapters to v0.10.1
- Bump @fluentui-react-native/theme-types to v0.30.2

## 0.20.6

Mon, 30 Jan 2023 07:12:38 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.30.1

## 0.20.5

Wed, 25 Jan 2023 21:31:18 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.30.0

## 0.20.4

Wed, 18 Jan 2023 01:55:11 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.29.1

## 0.20.3

Tue, 10 Jan 2023 20:17:18 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.29.0

## 0.20.2

Thu, 29 Dec 2022 03:47:47 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.28.0

## 0.20.1

Tue, 27 Dec 2022 22:21:15 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.27.1

## 0.20.0

Thu, 15 Dec 2022 14:50:50 GMT

### Minor changes

- Add maximumSize (adgleitm@microsoft.com)
- Bump @fluentui-react-native/theme-types to v0.27.0

## 0.19.1

Fri, 09 Dec 2022 05:23:38 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.26.0

## 0.19.0

Tue, 06 Dec 2022 00:46:41 GMT

### Minor changes

- Allow V1 usage of V2 text variants (adgleitm@microsoft.com)
- Bump @fluentui-react-native/theme-types to v0.25.0

## 0.18.1

Thu, 01 Dec 2022 03:12:20 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.24.0

## 0.18.0

Mon, 28 Nov 2022 11:51:06 GMT

### Minor changes

- Added padding start and end to LayoutTokens (ayushsinghs@yahoo.in)

## 0.17.8

Tue, 08 Nov 2022 22:18:44 GMT

### Patches

- Bump @fluentui-react-native/adapters to v0.10.0

## 0.17.7

Fri, 04 Nov 2022 14:36:23 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.23.1

## 0.17.6

Thu, 27 Oct 2022 11:09:35 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.23.0

## 0.17.5

Fri, 14 Oct 2022 19:11:13 GMT

### Patches

- Bump @fluentui-react-native/adapters to v0.9.3

## 0.17.4

Wed, 12 Oct 2022 21:54:15 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.22.0

## 0.17.3

Tue, 11 Oct 2022 22:41:44 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.21.0

## 0.17.2

Fri, 30 Sep 2022 08:04:44 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.20.0

## 0.17.1

Fri, 30 Sep 2022 00:54:37 GMT

### Patches

- Update react-native to 0.68 (krsiler@microsoft.com)
- Bump @fluentui-react-native/adapters to v0.9.2
- Bump @fluentui-react-native/theme-types to v0.19.2

## 0.17.0

Wed, 21 Sep 2022 21:00:40 GMT

### Minor changes

- Add iOS typography variants (adam.gleitman@gmail.com)
- Bump @fluentui-react-native/theme-types to v0.19.1

## 0.16.2

Fri, 16 Sep 2022 01:53:06 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.19.0

## 0.16.1

Wed, 14 Sep 2022 23:07:42 GMT

### Patches

- Bump @fluentui-react-native/adapters to v0.9.1

## 0.16.0

Thu, 14 Jul 2022 18:09:50 GMT

### Minor changes

- Update to React Native 0.66 (sanajmi@microsoft.com)
- Bump @fluentui-react-native/adapters to v0.9.0
- Bump @fluentui-react-native/theme-types to v0.18.0

## 0.15.1

Fri, 08 Jul 2022 21:23:36 GMT

### Patches

- Move used tokens types to tokens package (ruaraki@microsoft.com)

## 0.15.0

Thu, 07 Jul 2022 21:24:07 GMT

### Minor changes

- added letter spacing (joannaquu@gmail.com)

## 0.14.0

Wed, 25 May 2022 18:43:10 GMT

### Minor changes

- Add text implementation v2 (email not defined)
- Bump @fluentui-react-native/theme-types to v0.17.0
- Bump @uifabricshared/theming-ramp to v0.16.11

### Patches

- beachball sync (krsiler@microsoft.com)
- Version bump for packages to attempt to fix NPM publish pipeline (krsiler@microsoft.com)

## 0.12.2

Sat, 21 May 2022 16:18:06 GMT

### Patches

- add back elevation as a token (sanajmi@microsoft.com)

## 0.12.1

Sat, 21 May 2022 01:47:57 GMT

### Patches

- Separate out elevation from iOS Shadow styles (sanajmi@microsoft.com)
- Bump @fluentui-react-native/theme-types to v0.15.0
- Bump @uifabricshared/theming-ramp to v0.16.9

## 0.12.0

Wed, 04 May 2022 21:06:04 GMT

### Minor changes

- MenuList styling (ruaraki@microsoft.com)

## 0.11.11

Thu, 28 Apr 2022 19:09:51 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.14.3
- Bump @uifabricshared/theming-ramp to v0.16.8

## 0.11.10

Wed, 27 Apr 2022 19:30:38 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.14.2
- Bump @uifabricshared/theming-ramp to v0.16.7

## 0.11.9

Thu, 31 Mar 2022 07:27:48 GMT

### Patches

- Ban `export *` in index files for better tree-shakeability (4123478+tido64@users.noreply.github.com)
- Bump @fluentui-react-native/adapters to v0.8.5
- Bump @fluentui-react-native/theme-types to v0.14.1
- Bump @uifabricshared/foundation-tokens to v0.11.3
- Bump @uifabricshared/theming-ramp to v0.16.6

## 0.11.8

Mon, 07 Mar 2022 19:15:33 GMT

### Patches

- Bump @fluentui-react-native/adapters to v0.8.4

## 0.11.7

Thu, 03 Mar 2022 20:20:09 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.14.0
- Bump @uifabricshared/theming-ramp to v0.16.5

## 0.11.6

Fri, 18 Feb 2022 23:27:11 GMT

### Patches

- Bump @fluentui-react-native/adapters to v0.8.3

## 0.11.5

Fri, 14 Jan 2022 01:00:04 GMT

### Patches

- fix disabled button (email not defined)
- Bump @fluentui-react-native/theme-types to v0.13.3
- Bump @uifabricshared/theming-ramp to v0.16.4

## 0.11.4

Thu, 06 Jan 2022 23:14:38 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.13.2
- Bump @uifabricshared/theming-ramp to v0.16.3

## 0.11.3

Mon, 20 Dec 2021 22:56:01 GMT

### Patches

- Add repository property to all package.json files (ruaraki@microsoft.com)
- Bump @fluentui-react-native/adapters to v0.8.2
- Bump @fluentui-react-native/theme-types to v0.13.1
- Bump @uifabricshared/foundation-tokens to v0.11.2
- Bump @uifabricshared/theming-ramp to v0.16.2

## 0.11.2

Sat, 18 Dec 2021 04:15:05 GMT

### Patches

- Update to TypeScript 4.5.4. (afoxman@microsoft.com)
- Bump @uifabricshared/foundation-tokens to v0.11.1
- Bump @uifabricshared/theming-ramp to v0.16.1

## 0.11.1

Thu, 16 Dec 2021 19:10:31 GMT

### Patches

- Bump @fluentui-react-native/adapters to v0.8.1

## 0.11.0

Wed, 17 Nov 2021 19:28:07 GMT

### Minor changes

- Update to react-native 0.64 (afoxman@microsoft.com)

### Patches

- Bump @fluentui-react-native/adapters to v0.8.0 (afoxman@microsoft.com)
- Bump @uifabricshared/foundation-tokens to v0.11.0 (afoxman@microsoft.com)
- Bump @uifabricshared/theming-ramp to v0.16.0 (afoxman@microsoft.com)
- Bump @fluentui-react-native/theme-types to v0.13.0 (afoxman@microsoft.com)

## 0.10.3

Mon, 01 Nov 2021 18:53:37 GMT

### Patches

- Bump @uifabricshared/theming-ramp to v0.15.11 (ruaraki@microsoft.com)

## 0.10.2

Mon, 25 Oct 2021 19:24:43 GMT

### Patches

- Use tslib where spreadArray is used (ruaraki@microsoft.com)

## 0.10.1

Tue, 19 Oct 2021 20:23:36 GMT

### Patches

- Bump @fluentui-react-native/adapters to v0.7.5 (ruaraki@microsoft.com)

## 0.10.0

Thu, 07 Oct 2021 20:59:20 GMT

### Minor changes

- Add styling changes (ruaraki@microsoft.com)

## 0.9.25

Tue, 28 Sep 2021 21:08:25 GMT

### Patches

- Delete NativeButton (67026167+chiuam@users.noreply.github.com)

## 0.9.24

Tue, 21 Sep 2021 16:32:12 GMT

### Patches

- adding an adapter for macOS (67026167+chiuam@users.noreply.github.com)

## 0.9.23

Thu, 09 Sep 2021 20:03:01 GMT

### Patches

- Bump @uifabricshared/theming-ramp to v0.15.7 (ruaraki@microsoft.com)

## 0.9.22

Thu, 26 Aug 2021 21:02:08 GMT

### Patches

- Bump @fluentui-react-native/adapters to v0.7.2 (ruaraki@microsoft.com)

## 0.9.21

Thu, 26 Aug 2021 04:48:40 GMT

### Patches

- fix text truncation for radio button (67026167+chiuam@users.noreply.github.com)

## 0.9.20

Mon, 23 Aug 2021 23:35:47 GMT

### Patches

- Bump @fluentui-react-native/adapters to v0.7.0 (dake.3601@gmail.com)

## 0.9.19

Thu, 19 Aug 2021 18:31:21 GMT

### Patches

- Finish move (ruaraki@microsoft.com)

## 0.9.18

Wed, 18 Aug 2021 23:00:57 GMT

### Patches

- Bump @uifabricshared/theming-ramp to v0.15.4 (ruaraki@microsoft.com)

## 0.9.17

Fri, 13 Aug 2021 16:12:26 GMT

### Patches

- Fix icons in experimental button and add fab (t-lindaweng@microsoft.com)

## 0.9.16

Thu, 12 Aug 2021 17:23:44 GMT

### Patches

- Bump @uifabricshared/theming-ramp to v0.15.2 (ruaraki@microsoft.com)

## 0.9.15

Tue, 10 Aug 2021 21:12:30 GMT

### Patches

- Bump @uifabricshared/theming-ramp to v0.15.1 (ruaraki@microsoft.com)

## 0.9.14

Sat, 07 Aug 2021 00:40:04 GMT

### Patches

- enable usePressableState with stock Pressable component (jasonmo@microsoft.com)

## 0.9.13

Wed, 04 Aug 2021 06:26:25 GMT

### Patches

- radio group on macOS (67026167+chiuam@users.noreply.github.com)

## 0.9.12

Tue, 27 Jul 2021 22:17:20 GMT

### Patches

- add compressible utility and a snapshot test / demo to framework (jasonmo@microsoft.com)

## 0.9.11

Mon, 26 Jul 2021 20:41:04 GMT

### Patches

- add new use-slot package, move framework to consume that package (jasonmo@microsoft.com)

## 0.9.10

Sun, 25 Jul 2021 16:30:17 GMT

### Patches

- Bump @fluentui-react-native/adapters to v0.6.5 (email not defined)

## 0.9.6

Wed, 21 Jul 2021 22:55:40 GMT

### Patches

- expose use-tokens in framework package (jasonmo@microsoft.com)

## 0.9.5

Wed, 21 Jul 2021 21:46:12 GMT

### Patches

- Use peer dependencies for react-native version not dependencies (30809111+acoates-ms@users.noreply.github.com)

## 0.9.1

Fri, 18 Jun 2021 00:38:19 GMT

### Patches

- Apply prettier to utils, run (ruaraki@microsoft.com)

## 0.9.0

Tue, 15 Jun 2021 00:55:36 GMT

### Minor changes

- Add support for ColorValue (ruaraki@microsoft.com)

## 0.8.0

Sat, 06 Mar 2021 00:20:05 GMT

### Minor changes

- Update to react-native 0.63 (30809111+acoates-ms@users.noreply.github.com)

### Patches

- Use ColorValue from @fluentui-react-native/theme-types (saadnajmi2@gmail.com)

## 0.7.0

Fri, 23 Oct 2020 22:27:37 GMT

### Minor changes

- RNIcon feature (warleu@microsoft.com)

## 0.6.0

Mon, 12 Oct 2020 04:09:31 GMT

### Minor changes

- Added layout tokens (email not defined)

## 0.5.10

Fri, 25 Sep 2020 19:21:43 GMT

### Patches

- Update react-native-win32 versions - enable logbox (acoates-ms@noreply.github.com)

## 0.5.5

Mon, 17 Aug 2020 22:08:34 GMT

### Patches

- fix dependency errors (jasonmo@microsoft.com)

## 0.5.0

Tue, 28 Jul 2020 18:21:12 GMT

### Minor changes

- rename some token types and update Text (jasonmo@microsoft.com)

## 0.4.57

Wed, 17 Jun 2020 05:00:56 GMT

### Patches

- add memo-cache package and consume it in the core framework (jasonmo@microsoft.com)

## 0.4.39

Tue, 09 Jun 2020 17:39:01 GMT

### Patches

- switch dependencies to use greater than semver until we reach 1.0.0 (jasonmo@microsoft.com)

## 0.4.14

Mon, 11 May 2020 20:15:56 GMT

### Patches

- bump react native win32 version to 0.62 and pull in matching tester (jasonmo@microsoft.com)

## 0.4.3

Fri, 24 Apr 2020 19:41:08 GMT

### Patches

- more package version updates (jasonmo@microsoft.com)

## 0.4.2

Fri, 24 Apr 2020 19:11:27 GMT

### Patches

- renormalize files (jasonmo@microsoft.com)

## 0.4.1

Fri, 24 Apr 2020 17:13:37 GMT

### Patches

- Dont import \* from react-native (acoates@microsoft.com)

## 0.4.0

Tue, 21 Apr 2020 17:03:45 GMT

### Minor changes

- Add variants and new fluent typeramp to text (krsiler@microsoft.com)

## 0.3.1

Tue, 21 Apr 2020 00:41:10 GMT

### Patches

- update beachball hook to use new prepublish strategy (jasonmo@microsoft.com)

## 0.3.0

Fri, 17 Apr 2020 22:36:03 GMT

### Minor changes

- yarn.lock (warleu@microsoft.com)

## 0.2.2

Fri, 17 Apr 2020 16:48:18 GMT

### Patches

- Revert "Merge pull request #136 from ksiler/fluent-variant-support" (krsiler@microsoft.com)

## 0.2.1

Thu, 16 Apr 2020 23:57:38 GMT

### Patches

- publish with correct main/module references (jasonmo@microsoft.com)

## 0.2.0

Mon, 13 Apr 2020 22:48:23 GMT

### Minor changes

- Add variants and fluent typeramp to text (krsiler@microsoft.com)

## 0.1.7

Thu, 09 Apr 2020 18:39:15 GMT

### Patches

- merge conflicts (ppatboyd@outlook.com)

## 0.1.5

Fri, 03 Apr 2020 20:40:51 GMT

### Patches

- switch the bin name from just-script to fluent-scripts to disambiguate names (jasonmo@microsoft.com)

## 0.1.4

Tue, 31 Mar 2020 18:01:09 GMT

### Patches

- Merge branch 'sammy/checkboxV1' of https://github.com/samuelfreiberg/fluentui-react-native into sammy/checkboxV1 (safreibe@microsoft.com)

## 0.1.3

Mon, 30 Mar 2020 16:27:00 GMT

### Patches

- Update main attribute to specify TypeScript index file. (kinhln@microsoft.com)

## 0.1.1

Tue, 17 Mar 2020 21:24:06 GMT

### Patches

- Publish (email not defined)
