# Change Log - @fluentui-react-native/theme-types

<!-- This log was last generated on Thu, 18 Sep 2025 20:23:08 GMT and should not be manually modified. -->

<!-- Start content -->

## 0.41.0

Thu, 18 Sep 2025 20:23:08 GMT

### Minor changes

- Remove BkgCtlSubtleSelectionHighlight from palette (email not defined)

## 0.40.0

Wed, 13 Aug 2025 22:23:25 GMT

### Minor changes

- Add BkgAccentTint and TextAccentTint palette types (patboyd@exchange.microsoft.com)

## 0.39.6

Tue, 05 Aug 2025 18:50:38 GMT

### Patches

- move repo to pnpm, create babel and jest config packages, fix dependencies (jasonmo@microsoft.com)

## 0.39.5

Tue, 15 Jul 2025 23:26:54 GMT

### Patches

- add react-native entrypoints that ensure metro targets TS files rather than JS files for bundling (jasonmo@microsoft.com)
- fix: run beachball sync (sanajmi@microsoft.com)
- update builds to use node16 settings and modern export maps (jasonmo@microsoft.com)
- fix repo linting with new configs and version, fixing linting errors as well (jasonmo@microsoft.com)

## 0.39.2

Thu, 10 Jul 2025 19:20:15 GMT

### Patches

- Add support for React Native 0.74 (4123478+tido64@users.noreply.github.com)

## 0.39.1

Wed, 29 Jan 2025 23:43:54 GMT

### Patches

- fix tsconfig for jest types (sanajmi@microsoft.com)

## 0.39.0

Thu, 11 Apr 2024 18:08:40 GMT

### Minor changes

- Update to RN 0.73 (30809111+acoates-ms@users.noreply.github.com)

## 0.38.1

Fri, 01 Mar 2024 20:39:13 GMT

### Patches

- Use workspace for version of local package (ruaraki@microsoft.com)

## 0.38.0

Thu, 04 Jan 2024 21:06:26 GMT

### Minor changes

-  Remove unused colors (ruaraki@microsoft.com)

## 0.37.0

Thu, 04 Jan 2024 01:35:42 GMT

### Minor changes

- Delete unused colors (ruaraki@microsoft.com)

## 0.36.0

Wed, 03 Jan 2024 00:15:19 GMT

### Minor changes

- Remove unused colors (ruaraki@microsoft.com)

## 0.35.0

Thu, 21 Dec 2023 01:31:00 GMT

### Minor changes

- Remove unused colors (ruaraki@microsoft.com)

## 0.34.0

Wed, 20 Dec 2023 00:05:24 GMT

### Minor changes

- Delete unused colors (ruaraki@microsoft.com)

## 0.33.0

Thu, 09 Nov 2023 02:39:11 GMT

### Minor changes

- Update to react-native 0.72 (30809111+acoates-ms@users.noreply.github.com)

## 0.32.3

Tue, 07 Nov 2023 20:20:35 GMT

### Patches

- Use RN-based dynamic type (adgleitm@microsoft.com)
- Manually bump packages stuck in the pipeline (safreibe@microsoft.com)

## 0.32.1

Mon, 30 Oct 2023 21:26:06 GMT

### Patches

- remove deprecated alias tokens from v1 components (email not defined)

## 0.32.0

Mon, 05 Jun 2023 19:26:25 GMT

### Minor changes

- Upgrade to React Native 0.71 (sanajmi@microsoft.com)

## 0.31.2

Tue, 30 May 2023 20:34:15 GMT

### Patches

- Add macOS status tokens and accessible mobile stroke colors to AliasColorTokens interface (78454019+lyzhan7@users.noreply.github.com)

## 0.31.1

Wed, 03 May 2023 07:08:52 GMT

### Patches

- Update design-tokens package to 0.47.0 (78454019+lyzhan7@users.noreply.github.com)

## 0.31.0

Tue, 14 Mar 2023 20:50:45 GMT

### Minor changes

- Add numeric font family type (ruaraki@microsoft.com)

## 0.30.4

Fri, 03 Mar 2023 06:47:25 GMT

### Patches

- Comment (email not defined)

## 0.30.3

Fri, 24 Feb 2023 20:40:00 GMT

### Patches

- Order imports (78454019+lyzhan7@users.noreply.github.com)

## 0.30.2

Wed, 01 Feb 2023 22:33:17 GMT

### Patches

- Enable @typescript-eslint/consistent-type-imports (30809111+acoates-ms@users.noreply.github.com)

## 0.30.1

Mon, 30 Jan 2023 07:12:38 GMT

### Patches

- Add `darkElevated` theme (mischreiber@microsoft.com)

## 0.30.0

Wed, 25 Jan 2023 21:31:17 GMT

### Minor changes

- Adding shared colors android (email not defined)

## 0.29.1

Wed, 18 Jan 2023 01:55:11 GMT

### Patches

- Add shared colors to AliasColorTokens and mapPipelineToTheme (78454019+lyzhan7@users.noreply.github.com)

## 0.29.0

Tue, 10 Jan 2023 20:17:18 GMT

### Minor changes

- Set up iOS color alias tokens (78454019+lyzhan7@users.noreply.github.com)

## 0.28.0

Thu, 29 Dec 2022 03:47:47 GMT

### Minor changes

- Define `FontWeightValue` in terms of what RN says (adam.gleitman@gmail.com)

## 0.27.1

Tue, 27 Dec 2022 22:21:15 GMT

### Patches

- List platforms each token is defined on (78454019+lyzhan7@users.noreply.github.com)

## 0.27.0

Thu, 15 Dec 2022 14:50:50 GMT

### Minor changes

- Add MaximumFontSize test element (adgleitm@microsoft.com)

## 0.26.0

Fri, 09 Dec 2022 05:23:38 GMT

### Minor changes

- switch initial tokenization and tester app changes (rohanpd.work@gmail.com)

## 0.25.0

Tue, 06 Dec 2022 00:46:41 GMT

### Minor changes

- Allow V1 usage of V2 text variants (adgleitm@microsoft.com)

## 0.24.0

Thu, 01 Dec 2022 03:12:20 GMT

### Minor changes

- theme spacing tokens change (rohanpd.work@gmail.com)

## 0.23.1

Fri, 04 Nov 2022 14:36:23 GMT

### Patches

- missingTokens (email not defined)

## 0.23.0

Thu, 27 Oct 2022 11:09:35 GMT

### Minor changes

- BrandTokensIntegration (email not defined)

## 0.22.0

Wed, 12 Oct 2022 21:54:15 GMT

### Minor changes

- Make `Theme.spacing` read-only (adgleitm@microsoft.com)

## 0.21.0

Tue, 11 Oct 2022 22:41:44 GMT

### Minor changes

- Add new spacing tokens (adam.gleitman@gmail.com)

## 0.20.0

Fri, 30 Sep 2022 08:04:44 GMT

### Minor changes

- Made color type properties optional (email not defined)

## 0.19.2

Fri, 30 Sep 2022 00:54:37 GMT

### Patches

- Update react-native to 0.68 (krsiler@microsoft.com)

## 0.19.1

Wed, 21 Sep 2022 21:00:40 GMT

### Patches

- Merge branch 'main' into ios-typography-tokens (adam.gleitman@gmail.com)

## 0.19.0

Fri, 16 Sep 2022 01:53:06 GMT

### Minor changes

- Rename FontLightHeight to FontLineHeight (adam.gleitman@gmail.com)

## 0.18.0

Thu, 14 Jul 2022 18:09:50 GMT

### Minor changes

- Update to React Native 0.66 (sanajmi@microsoft.com)

## 0.17.0

Wed, 25 May 2022 18:43:10 GMT

### Minor changes

- Add text implementation v2 (email not defined)

### Patches

- Version bump for packages to attempt to fix NPM publish pipeline (krsiler@microsoft.com)
- beachball sync (krsiler@microsoft.com)

## 0.15.0

Sat, 21 May 2022 01:47:57 GMT

### Minor changes

- Add shadows to the theme (ruaraki@microsoft.com)

## 0.14.3

Thu, 28 Apr 2022 19:09:51 GMT

### Patches

- Revert "Add Text props and test new Variant types (#1615)" (sanajmi@microsoft.com)

## 0.14.2

Wed, 27 Apr 2022 19:30:38 GMT

### Patches

- initial Text implementation (email not defined)

## 0.14.1

Thu, 31 Mar 2022 07:27:48 GMT

### Patches

- Ban `export *` in index files for better tree-shakeability (4123478+tido64@users.noreply.github.com)

## 0.14.0

Thu, 03 Mar 2022 20:20:09 GMT

### Minor changes

- New alias tokens (ruaraki@microsoft.com)

## 0.13.3

Fri, 14 Jan 2022 01:00:04 GMT

### Patches

- fix disabled button (email not defined)

## 0.13.2

Thu, 06 Jan 2022 23:14:38 GMT

### Patches

- Add fallback entries (ruaraki@microsoft.com)

## 0.13.1

Mon, 20 Dec 2021 22:56:01 GMT

### Patches

- Add repository property to all package.json files (ruaraki@microsoft.com)

## 0.13.0

Wed, 17 Nov 2021 19:28:07 GMT

### Minor changes

- Update to react-native 0.64 (afoxman@microsoft.com)

## 0.12.4

Mon, 01 Nov 2021 18:53:37 GMT

### Patches

- Pipe changes through theme system (ruaraki@microsoft.com)

## 0.12.3

Tue, 28 Sep 2021 21:08:25 GMT

### Patches

- Delete NativeButton (67026167+chiuam@users.noreply.github.com)

## 0.12.2

Tue, 21 Sep 2021 16:32:12 GMT

### Patches

- adding an adapter for macOS (67026167+chiuam@users.noreply.github.com)

## 0.12.1

Thu, 09 Sep 2021 20:03:01 GMT

### Patches

- Reshape input (ruaraki@microsoft.com)

## 0.12.0

Thu, 26 Aug 2021 21:02:08 GMT

### Minor changes

- Add HC plumbing (ruaraki@microsoft.com)

## 0.11.3

Thu, 26 Aug 2021 04:48:40 GMT

### Patches

- fix text truncation for radio button (67026167+chiuam@users.noreply.github.com)

## 0.11.2

Wed, 18 Aug 2021 23:00:57 GMT

### Patches

- Rename tokens to avoid name clash, initial token re-population (ruaraki@microsoft.com)

## 0.11.1

Fri, 13 Aug 2021 16:12:26 GMT

### Patches

- Fix icons in experimental button and add fab (t-lindaweng@microsoft.com)

## 0.11.0

Thu, 12 Aug 2021 17:23:44 GMT

### Minor changes

- rename an alias token to avoid name clash (ruaraki@microsoft.com)

## 0.10.0

Tue, 10 Aug 2021 21:12:30 GMT

### Minor changes

- Add missing tokens (ruaraki@microsoft.com)

## 0.9.3

Wed, 04 Aug 2021 06:26:25 GMT

### Patches

- radio group on macOS (67026167+chiuam@users.noreply.github.com)

## 0.9.2

Tue, 27 Jul 2021 22:17:20 GMT

### Patches

- add compressible utility and a snapshot test / demo to framework (jasonmo@microsoft.com)

## 0.9.1

Mon, 26 Jul 2021 20:41:04 GMT

### Patches

- add new use-slot package, move framework to consume that package (jasonmo@microsoft.com)

## 0.9.0

Sat, 24 Jul 2021 00:28:25 GMT

### Minor changes

- createAliasTokens to generate alias token structure (email not defined)

## 0.8.3

Fri, 23 Jul 2021 17:28:27 GMT

### Patches

- Fix @types/react to be less than 16.14.0 since our react version is less than 16.14 (email not defined)

## 0.8.2

Wed, 21 Jul 2021 22:55:40 GMT

### Patches

- expose use-tokens in framework package (jasonmo@microsoft.com)

## 0.8.1

Wed, 21 Jul 2021 21:46:12 GMT

### Patches

- Use peer dependencies for react-native version not dependencies (30809111+acoates-ms@users.noreply.github.com)

## 0.8.0

Fri, 25 Jun 2021 06:21:11 GMT

### Minor changes

- Add activity ring to PersonaCoin (tamasane@gmail.com)

## 0.7.2

Mon, 21 Jun 2021 11:19:28 GMT

### Patches

- Add checkmarkColor to apple theme (tamasane@gmail.com)

## 0.7.1

Fri, 18 Jun 2021 00:38:19 GMT

### Patches

- Apply prettier to libraries core and theming, run (ruaraki@microsoft.com)

## 0.7.0

Tue, 15 Jun 2021 00:55:36 GMT

### Minor changes

- Add support for ColorValue (ruaraki@microsoft.com)

## 0.6.0

Sat, 06 Mar 2021 00:20:05 GMT

### Minor changes

- Update to react-native 0.63 (30809111+acoates-ms@users.noreply.github.com)
- Use React Native ColorValue type as our ColorValue type (saadnajmi2@gmail.com)

### Patches

- Fixed a typo (saadnajmi2@gmail.com)

## 0.5.0

Fri, 05 Feb 2021 08:02:13 GMT

### Minor changes

- Added an auto type for appearance (saadnajmi2@gmail.com)

## 0.4.0

Fri, 23 Oct 2020 22:27:37 GMT

### Minor changes

- RNIcon feature (warleu@microsoft.com)

## 0.3.1

Mon, 19 Oct 2020 22:06:02 GMT

### Patches

- rework theme usage in tester (jasonmo@microsoft.com)

## 0.3.0

Mon, 12 Oct 2020 04:09:31 GMT

### Minor changes

- button semantic colors (email not defined)

## 0.2.1

Tue, 29 Sep 2020 18:14:46 GMT

### Patches

- remove extra componentTokens reference and route everything to components (jasonmo@microsoft.com)

## 0.2.0

Mon, 28 Sep 2020 20:32:21 GMT

### Minor changes

- add more host colors (aliciakds88@gmail.com)

## 0.1.5

Sun, 27 Sep 2020 04:08:27 GMT

### Patches

- add light and dark awareness to default themes (jasonmo@microsoft.com)

## 0.1.4

Fri, 25 Sep 2020 18:01:57 GMT

### Patches

- add experimental theme package (jasonmo@microsoft.com)

## 0.1.3

Wed, 23 Sep 2020 18:31:48 GMT

### Patches

- start publishing src to fix customer source maps (jasonmo@microsoft.com)

## 0.1.2

Tue, 22 Sep 2020 04:57:02 GMT

### Patches

- add theme-types package (jasonmo@microsoft.com)
- remove I preface on theme types, add context (jasonmo@microsoft.com)
