# Change Log - @fluentui-react-native/experimental-appearance-additions

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
  - @fluentui-react-native/framework@0.15.0

<!-- This log was last generated on Tue, 05 Aug 2025 18:50:42 GMT and should not be manually modified. -->

<!-- Start content -->

## 0.7.12

Tue, 05 Aug 2025 18:50:42 GMT

### Patches

- move repo to pnpm, create babel and jest config packages, fix dependencies (jasonmo@microsoft.com)

## 0.7.6

Tue, 15 Jul 2025 23:27:19 GMT

### Patches

- fix: run beachball sync (sanajmi@microsoft.com)
- update builds to use node16 settings and modern export maps (jasonmo@microsoft.com)
- add react-native entrypoints that ensure metro targets TS files rather than JS files for bundling (jasonmo@microsoft.com)
- Bump our version of use-subscription (ruaraki@microsoft.com)
- fix repo linting with new configs and version, fixing linting errors as well (jasonmo@microsoft.com)

## 0.7.3

Thu, 10 Jul 2025 19:20:25 GMT

### Patches

- Add support for React Native 0.74 (4123478+tido64@users.noreply.github.com)

## 0.7.0

Thu, 11 Apr 2024 18:08:42 GMT

### Minor changes

- Update to RN 0.73 (30809111+acoates-ms@users.noreply.github.com)

## 0.6.10

Fri, 15 Mar 2024 16:26:19 GMT

### Patches

- Add many missing peerDependencies (30809111+acoates-ms@users.noreply.github.com)

## 0.6.9

Fri, 01 Mar 2024 20:39:10 GMT

### Patches

- Use workspace for version of local package (ruaraki@microsoft.com)

## 0.6.8

Thu, 22 Feb 2024 23:27:46 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.7

## 0.6.7

Mon, 22 Jan 2024 22:09:17 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.6

## 0.6.6

Thu, 04 Jan 2024 21:06:26 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.5

## 0.6.5

Thu, 04 Jan 2024 01:35:42 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.4

## 0.6.4

Wed, 03 Jan 2024 00:15:20 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.3

## 0.6.3

Thu, 21 Dec 2023 01:31:00 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.2

## 0.6.2

Wed, 20 Dec 2023 20:20:38 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.1

## 0.6.1

Wed, 20 Dec 2023 00:05:24 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.13.0

## 0.6.0

Thu, 09 Nov 2023 02:39:08 GMT

### Minor changes

- Update to react-native 0.72 (30809111+acoates-ms@users.noreply.github.com)
- Bump @fluentui-react-native/framework to v0.12.0

## 0.5.12

Tue, 07 Nov 2023 20:20:33 GMT

### Patches

- Manually bump packages stuck in the pipeline (safreibe@microsoft.com)
- Bump @fluentui-react-native/framework to v0.11.10

## 0.5.10

Mon, 30 Oct 2023 21:26:06 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.8

## 0.5.9

Wed, 25 Oct 2023 20:50:34 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.7

## 0.5.8

Tue, 29 Aug 2023 22:56:32 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.6

## 0.5.7

Mon, 14 Aug 2023 20:14:41 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.5

## 0.5.6

Wed, 09 Aug 2023 22:02:15 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.4

## 0.5.5

Mon, 31 Jul 2023 19:29:59 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.3

## 0.5.4

Tue, 18 Jul 2023 19:09:32 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.2

## 0.5.3

Fri, 07 Jul 2023 20:45:12 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.1

## 0.5.2

Mon, 12 Jun 2023 17:46:44 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.11.0

## 0.5.1

Fri, 09 Jun 2023 15:29:07 GMT

### Patches

- Fix package using `use-subscription` at runtime but does not correctly declare dependencies (4123478+tido64@users.noreply.github.com)

## 0.5.0

Mon, 05 Jun 2023 19:26:22 GMT

### Minor changes

- Upgrade to React Native 0.71 (sanajmi@microsoft.com)
- Bump @fluentui-react-native/framework to v0.10.0

## 0.4.2

Tue, 30 May 2023 20:34:15 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.9.10

## 0.4.1

Wed, 03 May 2023 07:08:52 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.9.9

## 0.4.0

Mon, 10 Apr 2023 16:10:16 GMT

### Minor changes

- Add trait collection support for multiwindow (78454019+lyzhan7@users.noreply.github.com)

## 0.3.9

Tue, 21 Mar 2023 21:53:46 GMT

### Patches

- Trigger manual bump (no changes) (krsiler@microsoft.com)
- Bump @fluentui-react-native/framework to v0.9.8

## 0.3.8

Sat, 18 Mar 2023 17:22:31 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.9.7

## 0.3.7

Tue, 14 Mar 2023 20:50:45 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.9.6

## 0.3.6

Tue, 07 Mar 2023 20:54:15 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.9.5

## 0.3.5

Fri, 03 Mar 2023 06:47:26 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.9.4

## 0.3.4

Fri, 24 Feb 2023 20:39:58 GMT

### Patches

- Order imports (78454019+lyzhan7@users.noreply.github.com)
- Bump @fluentui-react-native/framework to v0.9.3

## 0.3.3

Fri, 24 Feb 2023 02:22:40 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.9.2

## 0.3.2

Wed, 22 Feb 2023 20:36:09 GMT

### Patches

- Create method to initialize trait collection from root view (78454019+lyzhan7@users.noreply.github.com)

## 0.3.1

Sat, 11 Feb 2023 01:32:30 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.9.1

## 0.3.0

Wed, 08 Feb 2023 01:38:39 GMT

### Minor changes

- Add ability to get accessibilityContrast from traitcollection (78454019+lyzhan7@users.noreply.github.com)

## 0.2.4

Fri, 03 Feb 2023 01:49:36 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.9.0

## 0.2.3

Thu, 02 Feb 2023 01:29:38 GMT

### Patches

- Add eslint to packages missing a config (30809111+acoates-ms@users.noreply.github.com)
- Bump @fluentui-react-native/framework to v0.8.39

## 0.2.2

Wed, 01 Feb 2023 22:33:17 GMT

### Patches

- Bump @fluentui-react-native/framework to v0.8.38

## 0.2.1

Mon, 30 Jan 2023 07:12:38 GMT

### Patches

- Add `darkElevated` theme (mischreiber@microsoft.com)
- Bump @fluentui-react-native/framework to v0.8.37

## 0.2.0

Thu, 26 Jan 2023 17:47:06 GMT

### Minor changes

- Adding a new native module, `AppearanceAdditions` (mischreiber@microsoft.com)
