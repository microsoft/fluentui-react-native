# Change Log - @fluentui-react-native/theme-tokens

## 0.28.1

### Patch Changes

- 0d6e9c1: chore: migrate to `oxfmt`
- ac6e7af: Ensure packages have a default export that references the typescript entrypoint and clean up build dependency ordering
- Updated dependencies [0d6e9c1]
- Updated dependencies [ac6e7af]
  - @fluentui-react-native/theme-types@0.44.1

## 0.28.0

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
  - @fluentui-react-native/theme-types@0.44.0

<!-- This log was last generated on Tue, 05 Aug 2025 18:50:38 GMT and should not be manually modified. -->

<!-- Start content -->

## 0.27.6

Tue, 05 Aug 2025 18:50:38 GMT

### Patches

- move repo to pnpm, create babel and jest config packages, fix dependencies (jasonmo@microsoft.com)

## 0.27.5

Tue, 15 Jul 2025 23:26:57 GMT

### Patches

- fix repo linting with new configs and version, fixing linting errors as well (jasonmo@microsoft.com)
- fix: run beachball sync (sanajmi@microsoft.com)
- update builds to use node16 settings and modern export maps (jasonmo@microsoft.com)
- add react-native entrypoints that ensure metro targets TS files rather than JS files for bundling (jasonmo@microsoft.com)

## 0.27.2

Thu, 10 Jul 2025 19:20:16 GMT

### Patches

- Add support for React Native 0.74 (4123478+tido64@users.noreply.github.com)

## 0.27.1

Wed, 29 Jan 2025 23:43:54 GMT

### Patches

- fix tsconfig for jest types (sanajmi@microsoft.com)

## 0.27.0

Thu, 11 Apr 2024 18:08:40 GMT

### Minor changes

- Update to RN 0.73 (30809111+acoates-ms@users.noreply.github.com)

## 0.26.7

Fri, 01 Mar 2024 20:39:12 GMT

### Patches

- Use workspace for version of local package (ruaraki@microsoft.com)

## 0.26.6

Thu, 22 Feb 2024 23:27:43 GMT

### Patches

- Rework package json version notation (rofang@microsoft.com)

## 0.26.5

Thu, 04 Jan 2024 21:06:26 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.38.0

## 0.26.4

Thu, 04 Jan 2024 01:35:42 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.37.0

## 0.26.3

Wed, 03 Jan 2024 00:15:20 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.36.0

## 0.26.2

Thu, 21 Dec 2023 01:31:00 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.35.0

## 0.26.1

Wed, 20 Dec 2023 00:05:24 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.34.0

## 0.26.0

Thu, 09 Nov 2023 02:39:11 GMT

### Minor changes

- Update to react-native 0.72 (30809111+acoates-ms@users.noreply.github.com)
- Bump @fluentui-react-native/theme-types to v0.33.0

## 0.25.4

Tue, 07 Nov 2023 20:20:35 GMT

### Patches

- Manually bump packages stuck in the pipeline (safreibe@microsoft.com)
- Bump @fluentui-react-native/theme-types to v0.32.3

## 0.25.2

Mon, 30 Oct 2023 21:26:06 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.32.1

## 0.25.1

Wed, 09 Aug 2023 22:02:15 GMT

### Patches

- Bump design-tokens packages to 0.51.0 (78454019+lyzhan7@users.noreply.github.com)

## 0.25.0

Mon, 05 Jun 2023 19:26:25 GMT

### Minor changes

- Upgrade to React Native 0.71 (sanajmi@microsoft.com)
- Bump @fluentui-react-native/theme-types to v0.32.0

## 0.24.7

Tue, 30 May 2023 20:34:15 GMT

### Patches

- Add macOS status tokens and accessible mobile stroke colors to AliasColorTokens interface (78454019+lyzhan7@users.noreply.github.com)
- Bump @fluentui-react-native/theme-types to v0.31.2

## 0.24.6

Wed, 03 May 2023 07:08:51 GMT

### Patches

- Update design-tokens package to 0.47.0 (78454019+lyzhan7@users.noreply.github.com)
- Bump @fluentui-react-native/theme-types to v0.31.1

## 0.24.5

Tue, 14 Mar 2023 20:50:45 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.31.0

## 0.24.4

Fri, 03 Mar 2023 06:47:26 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.30.4

## 0.24.3

Fri, 24 Feb 2023 20:40:00 GMT

### Patches

- Order imports (78454019+lyzhan7@users.noreply.github.com)
- Bump @fluentui-react-native/theme-types to v0.30.3

## 0.24.2

Wed, 01 Feb 2023 22:33:16 GMT

### Patches

- Enable @typescript-eslint/consistent-type-imports (30809111+acoates-ms@users.noreply.github.com)
- Bump @fluentui-react-native/theme-types to v0.30.2

## 0.24.1

Mon, 30 Jan 2023 07:12:38 GMT

### Patches

- Add `darkElevated` theme (mischreiber@microsoft.com)
- Bump @fluentui-react-native/theme-types to v0.30.1

## 0.24.0

Wed, 25 Jan 2023 21:31:17 GMT

### Minor changes

- Adding shared colors android (email not defined)
- Bump @fluentui-react-native/theme-types to v0.30.0

## 0.23.2

Fri, 20 Jan 2023 18:06:46 GMT

### Patches

- Update all design-tokens packages to 0.42.0 (78454019+lyzhan7@users.noreply.github.com)

## 0.23.1

Wed, 18 Jan 2023 01:55:11 GMT

### Patches

- Add shared colors to AliasColorTokens and mapPipelineToTheme (78454019+lyzhan7@users.noreply.github.com)
- Bump @fluentui-react-native/theme-types to v0.29.1

## 0.23.0

Tue, 10 Jan 2023 20:17:18 GMT

### Minor changes

- Bump iOS token packages to include iOS color alias tokens (78454019+lyzhan7@users.noreply.github.com)
- Bump @fluentui-react-native/theme-types to v0.29.0

## 0.22.5

Thu, 29 Dec 2022 03:47:47 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.28.0

## 0.22.4

Tue, 27 Dec 2022 22:21:15 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.27.1

## 0.22.3

Tue, 27 Dec 2022 10:18:14 GMT

### Patches

- Update android token values. (email not defined)

## 0.22.2

Thu, 15 Dec 2022 14:50:50 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.27.0

## 0.22.1

Fri, 09 Dec 2022 05:23:38 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.26.0

## 0.22.0

Tue, 06 Dec 2022 16:59:54 GMT

### Minor changes

- Integrate shadow tokens (email not defined)

## 0.21.5

Tue, 06 Dec 2022 00:46:41 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.25.0

## 0.21.4

Thu, 01 Dec 2022 03:12:20 GMT

### Patches

- theme spacing tokens change (rohanpd.work@gmail.com)
- Bump @fluentui-react-native/theme-types to v0.24.0

## 0.21.3

Fri, 11 Nov 2022 18:06:31 GMT

### Patches

- Bump all design-tokens packages to 0.29.0 (78454019+lyzhan7@users.noreply.github.com)

## 0.21.2

Tue, 08 Nov 2022 19:22:01 GMT

### Patches

- New AndroidTokens (email not defined)

## 0.21.1

Fri, 04 Nov 2022 14:36:23 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.23.1

## 0.21.0

Thu, 27 Oct 2022 11:09:35 GMT

### Minor changes

- Snapshots (email not defined)
- Bump @fluentui-react-native/theme-types to v0.23.0

## 0.20.1

Tue, 25 Oct 2022 22:47:45 GMT

### Patches

- Add tokens-global.ios.ts (78454019+lyzhan7@users.noreply.github.com)

## 0.20.0

Mon, 17 Oct 2022 17:52:49 GMT

### Minor changes

- updating new android tokens (email not defined)

## 0.19.6

Wed, 12 Oct 2022 21:54:15 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.22.0

## 0.19.5

Tue, 11 Oct 2022 22:41:44 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.21.0

## 0.19.4

Thu, 06 Oct 2022 17:24:49 GMT

### Patches

- Undo peer package change (ruaraki@microsoft.com)

## 0.19.3

Tue, 04 Oct 2022 21:09:28 GMT

### Patches

- Update peer dependencies to allow for other RN versions (ruaraki@microsoft.com)

## 0.19.2

Fri, 30 Sep 2022 08:04:44 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.20.0

## 0.19.1

Fri, 30 Sep 2022 00:54:36 GMT

### Patches

- Update react-native to 0.68 (krsiler@microsoft.com)

## 0.19.0

Thu, 14 Jul 2022 18:09:50 GMT

### Minor changes

- Update to React Native 0.66 (sanajmi@microsoft.com)

## 0.18.0

Wed, 25 May 2022 18:43:10 GMT

### Minor changes

- Add text implementation v2 (email not defined)

### Patches

- Version bump for packages to attempt to fix NPM publish pipeline (krsiler@microsoft.com)
- beachball sync (krsiler@microsoft.com)

## 0.16.3

Sat, 21 May 2022 01:47:57 GMT

### Patches

- Update design-tokens packages (ruaraki@microsoft.com)

## 0.16.2

Wed, 27 Apr 2022 19:30:38 GMT

### Patches

- initial Text implementation (email not defined)

## 0.16.1

Thu, 21 Apr 2022 21:50:03 GMT

### Patches

- Bump design tokens packages (ruaraki@microsoft.com)

## 0.16.0

Tue, 19 Apr 2022 16:54:55 GMT

### Minor changes

- Move alias tokens to default theme (ruaraki@microsoft.com)

## 0.15.0

Wed, 06 Apr 2022 22:58:21 GMT

### Minor changes

- Pull in design tokens (ruaraki@microsoft.com)

## 0.14.0

Tue, 05 Apr 2022 20:05:50 GMT

### Minor changes

- Move win32 alias tokens out (ruaraki@microsoft.com)

## 0.13.2

Thu, 31 Mar 2022 07:27:48 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.14.1

## 0.13.1

Wed, 23 Mar 2022 17:24:05 GMT

### Patches

- Fix color mappings (ruaraki@microsoft.com)

## 0.13.0

Thu, 03 Mar 2022 20:20:09 GMT

### Minor changes

- New alias tokens (ruaraki@microsoft.com)
- Bump @fluentui-react-native/theme-types to v0.14.0

## 0.12.0

Wed, 02 Feb 2022 02:29:07 GMT

### Minor changes

- Fix UWP HC (ruaraki@microsoft.com)

## 0.11.6

Fri, 14 Jan 2022 21:49:07 GMT

### Patches

- resolve json modules in tsconfig (sanajmi@microsoft.com)

## 0.11.5

Fri, 14 Jan 2022 01:00:03 GMT

### Patches

- fix disabled button (email not defined)
- Bump @fluentui-react-native/theme-types to v0.13.3

## 0.11.4

Thu, 06 Jan 2022 23:14:38 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.13.2

## 0.11.3

Thu, 06 Jan 2022 21:30:08 GMT

### Patches

- Fix brand color (67026167+chiuam@users.noreply.github.com)

## 0.11.2

Mon, 20 Dec 2021 22:56:01 GMT

### Patches

- Add repository property to all package.json files (ruaraki@microsoft.com)
- Bump @fluentui-react-native/theme-types to v0.13.1

## 0.11.1

Fri, 17 Dec 2021 01:26:42 GMT

### Patches

- Move generated tokens under a generated folder (ruaraki@microsoft.com)

## 0.11.0

Thu, 16 Dec 2021 19:10:25 GMT

### Minor changes

- Consume mac tokens in Button (67026167+chiuam@users.noreply.github.com)

## 0.10.0

Wed, 17 Nov 2021 19:28:07 GMT

### Minor changes

- Update to react-native 0.64 (afoxman@microsoft.com)

### Patches

- Bump @fluentui-react-native/theme-types to v0.13.0 (afoxman@microsoft.com)

## 0.9.2

Tue, 09 Nov 2021 23:04:33 GMT

### Patches

- Add mac design tokens (67026167+chiuam@users.noreply.github.com)

## 0.9.1

Mon, 01 Nov 2021 18:53:37 GMT

### Patches

- Pipe changes through theme system (ruaraki@microsoft.com)

## 0.9.0

Wed, 20 Oct 2021 03:46:25 GMT

### Minor changes

- add global and alias tokens for Android (email not defined)

## 0.8.0

Thu, 07 Oct 2021 20:59:20 GMT

### Minor changes

- Fix font for UWP (ruaraki@microsoft.com)

## 0.7.3

Tue, 28 Sep 2021 21:08:25 GMT

### Patches

- Delete NativeButton (67026167+chiuam@users.noreply.github.com)

## 0.7.2

Tue, 21 Sep 2021 16:32:12 GMT

### Patches

- adding an adapter for macOS (67026167+chiuam@users.noreply.github.com)

## 0.7.1

Fri, 10 Sep 2021 18:16:59 GMT

### Patches

- Add web versions (ruaraki@microsoft.com)

## 0.7.0

Thu, 09 Sep 2021 22:12:19 GMT

### Minor changes

- Integrate updated themes (ruaraki@microsoft.com)

## 0.6.1

Thu, 09 Sep 2021 20:03:01 GMT

### Patches

- Reshape input (ruaraki@microsoft.com)

## 0.6.0

Thu, 26 Aug 2021 21:02:08 GMT

### Minor changes

- Add input for HC (ruaraki@microsoft.com)

### Patches

- Bump @fluentui-react-native/theme-types to v0.12.0 (ruaraki@microsoft.com)

## 0.5.4

Thu, 26 Aug 2021 04:48:40 GMT

### Patches

- fix text truncation for radio button (67026167+chiuam@users.noreply.github.com)

## 0.5.3

Wed, 18 Aug 2021 23:00:57 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.11.2 (ruaraki@microsoft.com)

## 0.5.2

Fri, 13 Aug 2021 16:12:26 GMT

### Patches

- Fix icons in experimental button and add fab (t-lindaweng@microsoft.com)

## 0.5.1

Thu, 12 Aug 2021 17:23:44 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.11.0 (ruaraki@microsoft.com)

## 0.5.0

Tue, 10 Aug 2021 21:12:30 GMT

### Minor changes

- Add missing tokens (ruaraki@microsoft.com)

### Patches

- Bump @fluentui-react-native/theme-types to v0.10.0 (ruaraki@microsoft.com)

## 0.4.0

Mon, 09 Aug 2021 19:16:08 GMT

### Minor changes

- Edit input file to have shadow tokens (ruaraki@microsoft.com)

## 0.3.6

Sat, 07 Aug 2021 00:40:04 GMT

### Patches

- enable usePressableState with stock Pressable component (jasonmo@microsoft.com)

## 0.3.5

Fri, 06 Aug 2021 23:18:21 GMT

### Patches

- Clean up output from token pipeline (ruaraki@microsoft.com)

## 0.3.4

Fri, 06 Aug 2021 00:36:02 GMT

### Patches

- Revert "Add shadow tokens" #856 (sanajmi@microsoft.com)

## 0.3.3

Wed, 04 Aug 2021 06:26:25 GMT

### Patches

- radio group on macOS (67026167+chiuam@users.noreply.github.com)

## 0.3.2

Tue, 27 Jul 2021 22:17:20 GMT

### Patches

- add compressible utility and a snapshot test / demo to framework (jasonmo@microsoft.com)

## 0.3.1

Mon, 26 Jul 2021 20:41:04 GMT

### Patches

- Bump @fluentui-react-native/theme-types to v0.9.1 (jasonmo@microsoft.com)

## 0.3.0

Sat, 24 Jul 2021 00:28:25 GMT

### Minor changes

- Add more aslias tokens, regenerate files (email not defined)

## 0.2.4

Wed, 21 Jul 2021 22:55:40 GMT

### Patches

- expose use-tokens in framework package (jasonmo@microsoft.com)

## 0.2.3

Wed, 14 Jul 2021 21:28:07 GMT

### Patches

- Add dark mode files (email not defined)

## 0.2.2

Wed, 23 Jun 2021 18:53:56 GMT

### Patches

- Fix tokens (ruaraki@microsoft.com)

## 0.2.1

Fri, 18 Jun 2021 00:38:19 GMT

### Patches

- Apply prettier to libraries core and theming, run (ruaraki@microsoft.com)

## 0.2.0

Tue, 15 Jun 2021 00:55:36 GMT

### Minor changes

- Initial tokens file, tokens integrated into default theme (ruaraki@microsoft.com)
- Integrate token pipeline (ruaraki@microsoft.com)
