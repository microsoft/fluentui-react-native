# Change Log - @fluentui-react-native/tablist

## 0.8.0

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
  - @fluentui-react-native/adapters@0.14.0
  - @fluentui-react-native/focus-zone@0.22.0
  - @fluentui-react-native/framework@0.15.0
  - @fluentui-react-native/icon@0.22.0
  - @fluentui-react-native/interactive-hooks@0.28.0
  - @fluentui-react-native/text@0.25.0
  - @fluentui-react-native/theming-utils@0.27.0
  - @fluentui-react-native/tokens@0.24.0
  - @fluentui-react-native/use-styling@0.14.0

<!-- This log was last generated on Tue, 05 Aug 2025 18:50:41 GMT and should not be manually modified. -->

<!-- Start content -->

## 0.7.14

Tue, 05 Aug 2025 18:50:41 GMT

### Patches

- move repo to pnpm, create babel and jest config packages, fix dependencies (jasonmo@microsoft.com)

## 0.7.8

Tue, 15 Jul 2025 23:26:58 GMT

### Patches

- add react-native entrypoints that ensure metro targets TS files rather than JS files for bundling (jasonmo@microsoft.com)
- update builds to use node16 settings and modern export maps (jasonmo@microsoft.com)
- fix: run beachball sync (sanajmi@microsoft.com)
- fix repo linting with new configs and version, fixing linting errors as well (jasonmo@microsoft.com)

## 0.7.5

Thu, 10 Jul 2025 19:20:17 GMT

### Patches

- Add support for React Native 0.74 (4123478+tido64@users.noreply.github.com)

## 0.7.2

Wed, 29 Jan 2025 23:43:54 GMT

### Patches

- remove enzyme tests (sanajmi@microsoft.com)

## 0.7.0

Tue, 28 Jan 2025 23:24:31 GMT

### Minor changes

- Add native "Ctrl + Tab" keyboard shortcut for TabList component. (winlarry@microsoft.com)

## 0.6.12

Thu, 16 Jan 2025 19:12:11 GMT

### Patches

- Make tablist test not async so that it runs faster (ruaraki@microsoft.com)

## 0.6.1

Fri, 12 Apr 2024 21:02:38 GMT

### Patches

- chore: Update react-native-svg to 15.1.0 (sanajmi@microsoft.com)

## 0.6.0

Thu, 11 Apr 2024 18:08:39 GMT

### Minor changes

- Update to RN 0.73 (30809111+acoates-ms@users.noreply.github.com)

## 0.5.22

Mon, 18 Mar 2024 23:42:00 GMT

### Patches

- Remove usages of react-native-win32 from non win32 overrides (30809111+acoates-ms@users.noreply.github.com)

## 0.5.21

Fri, 15 Mar 2024 16:26:21 GMT

### Patches

- Add many missing peerDependencies (30809111+acoates-ms@users.noreply.github.com)

## 0.5.20

Thu, 14 Mar 2024 01:39:46 GMT

### Patches

- Fix layout callback chaining, and added new styling token allowing for customization of text's numberOfLines prop. (winlarry@microsoft.com)

## 0.5.17

Fri, 01 Mar 2024 20:39:12 GMT

### Patches

- Use workspace for version of local package (ruaraki@microsoft.com)

## 0.5.16

Fri, 23 Feb 2024 03:22:29 GMT

### Patches

- Bump @fluentui-react-native/focus-zone to v0.16.9
- Bump @fluentui-react-native/icon to v0.20.10
- Bump @fluentui-react-native/interactive-hooks to v0.26.0
- Bump @fluentui-react-native/text to v0.22.9

## 0.5.15

Thu, 22 Feb 2024 23:27:43 GMT

### Patches

- Rework package json version notation (rofang@microsoft.com)
- Bump @fluentui-react-native/focus-zone to v0.16.8
- Bump @fluentui-react-native/framework to v0.13.7
- Bump @fluentui-react-native/icon to v0.20.9
- Bump @fluentui-react-native/interactive-hooks to v0.25.8
- Bump @fluentui-react-native/text to v0.22.8
- Bump @fluentui-react-native/theming-utils to v0.25.6
- Bump @fluentui-react-native/tokens to v0.22.6

## 0.5.14

Mon, 22 Jan 2024 22:09:17 GMT

### Patches

- Bump @fluentui-react-native/focus-zone to v0.16.7
- Bump @fluentui-react-native/framework to v0.13.6
- Bump @fluentui-react-native/icon to v0.20.8
- Bump @fluentui-react-native/interactive-hooks to v0.25.7
- Bump @fluentui-react-native/text to v0.22.7

## 0.5.13

Tue, 09 Jan 2024 20:05:27 GMT

### Patches

- Move TabList package from 'experimental' to 'components' folder (winlarry@microsoft.com)

## 0.5.12

Thu, 04 Jan 2024 21:06:26 GMT

### Patches

- Bump @fluentui-react-native/focus-zone to v0.16.6
- Bump @fluentui-react-native/framework to v0.13.5
- Bump @fluentui-react-native/icon to v0.20.7
- Bump @fluentui-react-native/interactive-hooks to v0.25.6
- Bump @fluentui-react-native/text to v0.22.6
- Bump @fluentui-react-native/theming-utils to v0.25.5
- Bump @fluentui-react-native/tokens to v0.22.5

## 0.5.11

Thu, 04 Jan 2024 01:35:42 GMT

### Patches

- Bump @fluentui-react-native/focus-zone to v0.16.5
- Bump @fluentui-react-native/framework to v0.13.4
- Bump @fluentui-react-native/icon to v0.20.6
- Bump @fluentui-react-native/interactive-hooks to v0.25.5
- Bump @fluentui-react-native/text to v0.22.5
- Bump @fluentui-react-native/theming-utils to v0.25.4
- Bump @fluentui-react-native/tokens to v0.22.4

## 0.5.10

Wed, 03 Jan 2024 00:15:20 GMT

### Patches

- Bump @fluentui-react-native/focus-zone to v0.16.4
- Bump @fluentui-react-native/framework to v0.13.3
- Bump @fluentui-react-native/icon to v0.20.5
- Bump @fluentui-react-native/interactive-hooks to v0.25.4
- Bump @fluentui-react-native/text to v0.22.4
- Bump @fluentui-react-native/theming-utils to v0.25.3
- Bump @fluentui-react-native/tokens to v0.22.3

## 0.5.9

Thu, 21 Dec 2023 01:31:00 GMT

### Patches

- Bump @fluentui-react-native/focus-zone to v0.16.3
- Bump @fluentui-react-native/framework to v0.13.2
- Bump @fluentui-react-native/icon to v0.20.4
- Bump @fluentui-react-native/interactive-hooks to v0.25.3
- Bump @fluentui-react-native/text to v0.22.3
- Bump @fluentui-react-native/theming-utils to v0.25.2
- Bump @fluentui-react-native/tokens to v0.22.2

## 0.5.8

Wed, 20 Dec 2023 20:20:38 GMT

### Patches

- Bump @fluentui-react-native/focus-zone to v0.16.2
- Bump @fluentui-react-native/framework to v0.13.1
- Bump @fluentui-react-native/icon to v0.20.3
- Bump @fluentui-react-native/interactive-hooks to v0.25.2
- Bump @fluentui-react-native/text to v0.22.2

## 0.5.7

Wed, 20 Dec 2023 00:05:24 GMT

### Patches

- Bump @fluentui-react-native/focus-zone to v0.16.1
- Bump @fluentui-react-native/framework to v0.13.0
- Bump @fluentui-react-native/icon to v0.20.2
- Bump @fluentui-react-native/interactive-hooks to v0.25.1
- Bump @fluentui-react-native/text to v0.22.1
- Bump @fluentui-react-native/theming-utils to v0.25.1
- Bump @fluentui-react-native/tokens to v0.22.1

## 0.5.6

Tue, 19 Dec 2023 21:03:38 GMT

### Patches

- Fix color token for selected, hovered, subtle tab (winlarry@microsoft.com)

## 0.5.5

Thu, 14 Dec 2023 00:40:41 GMT

### Patches

- Fix win32 high contrast theming for TabList (winlarry@microsoft.com)

## 0.5.4

Wed, 13 Dec 2023 18:47:39 GMT

### Patches

- Change TabList test page title to be correct (winlarry@microsoft.com)

## 0.5.3

Wed, 06 Dec 2023 22:21:57 GMT

### Patches

- Bump @fluentui-react-native/icon to v0.20.1

## 0.5.2

Wed, 29 Nov 2023 19:35:12 GMT

### Patches

- Fix disabled selected tab impeding keyboard navigation (winlarry@microsoft.com)

## 0.5.1

Mon, 13 Nov 2023 19:40:23 GMT

### Patches

- Fix various tab styling bugs (winlarry@microsoft.com)

## 0.5.0

Thu, 09 Nov 2023 02:39:10 GMT

### Minor changes

- Update to react-native 0.72 (30809111+acoates-ms@users.noreply.github.com)
- Bump @fluentui-react-native/adapters to v0.12.0
- Bump @fluentui-react-native/focus-zone to v0.16.0
- Bump @fluentui-react-native/framework to v0.12.0
- Bump @fluentui-react-native/icon to v0.20.0
- Bump @fluentui-react-native/interactive-hooks to v0.25.0
- Bump @fluentui-react-native/text to v0.22.0
- Bump @fluentui-react-native/tokens to v0.22.0
- Bump @fluentui-react-native/use-styling to v0.12.0

## 0.4.10

Tue, 07 Nov 2023 20:20:35 GMT

### Patches

- Manually bump packages stuck in the pipeline (safreibe@microsoft.com)
- Add documentation to TabList package (winlarry@microsoft.com)
- Bump @fluentui-react-native/focus-zone to v0.15.0
- Bump @fluentui-react-native/framework to v0.11.10
- Bump @fluentui-react-native/icon to v0.19.16
- Bump @fluentui-react-native/interactive-hooks to v0.24.12
- Bump @fluentui-react-native/text to v0.21.14
- Bump @fluentui-react-native/tokens to v0.21.6

## 0.4.8

Tue, 31 Oct 2023 19:11:10 GMT

### Patches

- Bump @fluentui-react-native/focus-zone to v0.13.3

## 0.4.7

Mon, 30 Oct 2023 21:26:06 GMT

### Patches

- Bump @fluentui-react-native/focus-zone to v0.13.2
- Bump @fluentui-react-native/framework to v0.11.8
- Bump @fluentui-react-native/icon to v0.19.14
- Bump @fluentui-react-native/interactive-hooks to v0.24.10
- Bump @fluentui-react-native/text to v0.21.12
- Bump @fluentui-react-native/tokens to v0.21.4

## 0.4.6

Fri, 27 Oct 2023 23:51:57 GMT

### Patches

- Fix small tab styling bugs regarding indicator color and tab sizing (winlarry@microsoft.com)

## 0.4.5

Fri, 27 Oct 2023 22:22:51 GMT

### Patches

- Make FURN complaint by migrating to 1ESPT pipelines (dannyvv@microsoft.com)

## 0.4.4

Wed, 25 Oct 2023 20:50:34 GMT

### Patches

- Bump @fluentui-react-native/focus-zone to v0.13.1
- Bump @fluentui-react-native/framework to v0.11.7
- Bump @fluentui-react-native/icon to v0.19.13
- Bump @fluentui-react-native/interactive-hooks to v0.24.9
- Bump @fluentui-react-native/text to v0.21.11

## 0.4.3

Wed, 25 Oct 2023 17:21:07 GMT

### Patches

- Bump @fluentui-react-native/icon to v0.19.12

## 0.4.2

Wed, 25 Oct 2023 00:10:15 GMT

### Patches

- Add TabList page to mac tester (winlarry@microsoft.com)

## 0.4.1

Tue, 17 Oct 2023 19:21:23 GMT

### Patches

- Bump @fluentui-react-native/focus-zone to v0.13.0

## 0.4.0

Wed, 27 Sep 2023 00:35:39 GMT

### Minor changes

- Implement tablist animation on win32 (winlarry@microsoft.com)

## 0.3.11

Mon, 25 Sep 2023 12:49:34 GMT

### Patches

- Bump @fluentui-react-native/icon to v0.19.11
- Bump @fluentui-react-native/text to v0.21.10

## 0.3.10

Tue, 29 Aug 2023 22:56:32 GMT

### Patches

- update snapshots (krsiler@microsoft.com)
- Bump @fluentui-react-native/adapters to v0.11.3
- Bump @fluentui-react-native/focus-zone to v0.12.10
- Bump @fluentui-react-native/framework to v0.11.6
- Bump @fluentui-react-native/icon to v0.19.10
- Bump @fluentui-react-native/interactive-hooks to v0.24.8
- Bump @fluentui-react-native/text to v0.21.9
- Bump @fluentui-react-native/tokens to v0.21.3

## 0.3.9

Tue, 29 Aug 2023 21:59:04 GMT

### Patches

- Bump @fluentui-react-native/icon to v0.19.9

## 0.3.8

Wed, 23 Aug 2023 18:55:24 GMT

### Patches

- Bump @fluentui-react-native/icon to v0.19.8
- Bump @fluentui-react-native/text to v0.21.8

## 0.3.7

Mon, 14 Aug 2023 20:14:41 GMT

### Patches

- Bump @fluentui-react-native/adapters to v0.11.2
- Bump @fluentui-react-native/focus-zone to v0.12.9
- Bump @fluentui-react-native/framework to v0.11.5
- Bump @fluentui-react-native/icon to v0.19.7
- Bump @fluentui-react-native/interactive-hooks to v0.24.7
- Bump @fluentui-react-native/text to v0.21.7
- Bump @fluentui-react-native/tokens to v0.21.2

## 0.3.6

Thu, 10 Aug 2023 19:05:55 GMT

### Patches

- Add snapshot testing to TabList (winlarry@microsoft.com)

## 0.3.5

Wed, 09 Aug 2023 22:02:14 GMT

### Patches

- Result of yarn (ruaraki@microsoft.com)
- Bump @fluentui-react-native/focus-zone to v0.12.8
- Bump @fluentui-react-native/framework to v0.11.4
- Bump @fluentui-react-native/icon to v0.19.6
- Bump @fluentui-react-native/interactive-hooks to v0.24.6
- Bump @fluentui-react-native/text to v0.21.6
- Bump @fluentui-react-native/use-styling to v0.11.1

## 0.3.4

Thu, 03 Aug 2023 21:20:10 GMT

### Patches

- Add dev warning for duplicate tabKeys (winlarry@microsoft.com)

## 0.3.3

Tue, 01 Aug 2023 21:14:56 GMT

### Patches

- Fix keyboarding implementation and narration bugs (winlarry@microsoft.com)

## 0.3.2

Mon, 31 Jul 2023 19:29:59 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.3
- Bump @fluentui-react-native/interactive-hooks to v0.24.5
- Bump @fluentui-react-native/focus-zone to v0.12.7
- Bump @fluentui-react-native/text to v0.21.5
- Bump @fluentui-react-native/icon to v0.19.5

## 0.3.1

Thu, 27 Jul 2023 18:43:21 GMT

### Patches

- Fix keyboarding, a11y, and icon rendering for TabList and Tab (winlarry@microsoft.com)

## 0.3.0

Mon, 24 Jul 2023 19:01:40 GMT

### Minor changes

- Update tokens to add new variants (winlarry@microsoft.com)

## 0.2.1

Tue, 18 Jul 2023 19:09:32 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.2
- Bump @fluentui-react-native/interactive-hooks to v0.24.4
- Bump @fluentui-react-native/focus-zone to v0.12.6
- Bump @fluentui-react-native/text to v0.21.4
- Bump @fluentui-react-native/icon to v0.19.4

## 0.2.0

Fri, 14 Jul 2023 22:28:56 GMT

### Minor changes

- Port old experimental Tabs implementation, refactor props (winlarry@microsoft.com)

## 0.1.5

Mon, 10 Jul 2023 17:25:04 GMT

### Patches

- Bump @fluentui-react-native/focus-zone to v0.12.5

## 0.1.4

Fri, 07 Jul 2023 20:45:12 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.1
- Bump @fluentui-react-native/interactive-hooks to v0.24.3
- Bump @fluentui-react-native/focus-zone to v0.12.4
- Bump @fluentui-react-native/text to v0.21.3
- Bump @fluentui-react-native/tokens to v0.21.1
- Bump @fluentui-react-native/icon to v0.19.3
- Bump @fluentui-react-native/adapters to v0.11.1

## 0.1.3

Wed, 21 Jun 2023 22:47:32 GMT

### Patches

- manually update TabList package (joannaquu@gmail.com)

## 0.1.2

Mon, 19 Jun 2023 18:37:35 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.0
- Bump @fluentui-react-native/interactive-hooks to v0.24.2
- Bump @fluentui-react-native/focus-zone to v0.12.3
- Bump @fluentui-react-native/text to v0.21.2
- Bump @fluentui-react-native/use-styling to v0.11.0
- Bump @fluentui-react-native/icon to v0.19.2

## 0.1.1

Sat, 17 Jun 2023 00:00:18 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.0
- Bump @fluentui-react-native/interactive-hooks to v0.24.1
- Bump @fluentui-react-native/focus-zone to v0.12.2
- Bump @fluentui-react-native/text to v0.21.1
- Bump @fluentui-react-native/use-styling to v0.11.0
- Bump @fluentui-react-native/icon to v0.19.1
