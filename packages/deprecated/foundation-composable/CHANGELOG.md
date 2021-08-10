# Change Log - @uifabricshared/foundation-composable

This log was last generated on Sat, 07 Aug 2021 00:40:04 GMT and should not be manually modified.

<!-- Start content -->

## 0.9.1

Sat, 07 Aug 2021 00:40:04 GMT

### Patches

- enable usePressableState with stock Pressable component (jasonmo@microsoft.com)

## 0.9.0

Wed, 04 Aug 2021 06:26:25 GMT

### Minor changes

- radio group on macOS (67026167+chiuam@users.noreply.github.com)

### Patches

- Bump @uifabricshared/foundation-settings to v0.10.0 (67026167+chiuam@users.noreply.github.com)
- Bump @fluentui-react-native/merge-props to v0.3.3 (67026167+chiuam@users.noreply.github.com)

## 0.8.6

Tue, 27 Jul 2021 22:17:20 GMT

### Patches

- add compressible utility and a snapshot test / demo to framework (jasonmo@microsoft.com)

## 0.8.5

Mon, 26 Jul 2021 20:41:04 GMT

### Patches

- add new use-slot package, move framework to consume that package (jasonmo@microsoft.com)

## 0.8.4

Fri, 23 Jul 2021 17:28:27 GMT

### Patches

- Fix @types/react to be less than 16.14.0 since our react version is less than 16.14 (email not defined)

## 0.8.3

Wed, 21 Jul 2021 22:55:40 GMT

### Patches

- expose use-tokens in framework package (jasonmo@microsoft.com)

## 0.8.2

Fri, 18 Jun 2021 00:38:19 GMT

### Patches

- Apply prettier to framework, run (ruaraki@microsoft.com)

## 0.8.0

Sat, 06 Mar 2021 00:20:05 GMT

### Minor changes

- Update to react-native 0.63 (30809111+acoates-ms@users.noreply.github.com)

## 0.7.0

Fri, 23 Oct 2020 22:27:37 GMT

### Minor changes

- RNIcon feature (warleu@microsoft.com)

## 0.6.75

Fri, 25 Sep 2020 19:21:43 GMT

### Patches

- Update react-native-win32 versions - enable logbox (acoates-ms@noreply.github.com)

## 0.6.74

Wed, 23 Sep 2020 18:31:48 GMT

### Patches

- start publishing src to fix customer source maps (jasonmo@microsoft.com)

## 0.6.73

Thu, 20 Aug 2020 00:14:01 GMT

### Patches

- update code to use split out merge-props package (jasonmo@microsoft.com)

## 0.6.72

Mon, 17 Aug 2020 22:08:34 GMT

### Patches

- fix dependency errors (jasonmo@microsoft.com)

## 0.6.69

Fri, 07 Aug 2020 21:50:55 GMT

### Patches

- Remove unnecessary calls to slot data factories (jasonmo@microsoft.com)

## 0.6.67

Sat, 04 Jul 2020 06:24:16 GMT

### Patches

- make all style merging use caching, get rid of unused finalizer (jasonmo@microsoft.com)

## 0.6.57

Wed, 17 Jun 2020 05:00:56 GMT

### Patches

- add memo-cache package and consume it in the core framework (jasonmo@microsoft.com)

## 0.6.39

Tue, 09 Jun 2020 17:39:01 GMT

### Patches

- switch dependencies to use greater than semver until we reach 1.0.0 (jasonmo@microsoft.com)

## 0.6.3

Fri, 24 Apr 2020 19:41:08 GMT

### Patches

- more package version updates (jasonmo@microsoft.com)

## 0.6.1

Tue, 21 Apr 2020 00:41:10 GMT

### Patches

- update beachball hook to use new prepublish strategy (jasonmo@microsoft.com)

## 0.6.0

Fri, 17 Apr 2020 22:36:03 GMT

### Minor changes

- yarn.lock (warleu@microsoft.com)

## 0.5.15

Thu, 16 Apr 2020 23:57:38 GMT

### Patches

- publish with correct main/module references (jasonmo@microsoft.com)

## 0.5.13
Thu, 09 Apr 2020 18:39:15 GMT

### Patches

- merge conflicts (ppatboyd@outlook.com)
## 0.5.11
Fri, 03 Apr 2020 20:40:51 GMT

### Patches

- switch the bin name from just-script to fluent-scripts to disambiguate names (jasonmo@microsoft.com)
## 0.5.10
Tue, 31 Mar 2020 18:01:09 GMT

### Patches

- Merge branch 'sammy/checkboxV1' of https://github.com/samuelfreiberg/fluentui-react-native into sammy/checkboxV1 (safreibe@microsoft.com)
## 0.5.9
Mon, 30 Mar 2020 16:27:00 GMT

### Patches

- Update main attribute to specify TypeScript index file. (kinhln@microsoft.com)
## 0.5.7
Tue, 24 Mar 2020 21:40:11 GMT

### Patches

- 🐛 Fix children crashing the test app (email not defined)
## 0.5.5
Fri, 28 Feb 2020 00:04:18 GMT

### Patches

- split hooks into dedicated files (jasonmo@microsoft.com)
## 0.5.4
Thu, 20 Feb 2020 01:36:35 GMT

### Patches

- restructure directories in project (jasonmo@microsoft.com)
## 0.5.3
Fri, 07 Feb 2020 00:29:25 GMT

### Patches

- clean up just tasks and remove unnecessary webpack configs (jasonmo@microsoft.com)
## 0.5.2
Thu, 06 Feb 2020 01:00:13 GMT

### Patches

- Get RNTester test app launch for uifabric package. (kinhln@microsoft.com)
- clean up just tasks and remove unnecessary webpack configs (jasonmo@microsoft.com)
## 0.5.1
Thu, 05 Dec 2019 23:11:01 GMT

### Patches

- fix typing for slots when type is a forward ref (jasonmo360@gmail.com)
## 0.5.0
Wed, 20 Nov 2019 19:51:16 GMT

### Minor changes

- ease typing of slots when no filters are present (jasonmo360@gmail.com)
## 0.4.0
Wed, 20 Nov 2019 19:37:06 GMT

### Minor changes

- 📦 fix package entrypoints to distinguish CJS/ES6 (adrum@microsoft.com)
## 0.3.0
Tue, 19 Nov 2019 22:37:36 GMT

### Minor changes

- add token support to settings, change to type objects (jasonmo@microsoft.com)
## 0.2.3
Tue, 05 Nov 2019 22:51:54 GMT

### Patches

- fix bug in tree compression for composable (jasonmo@microsoft.com)
## 0.2.2
Fri, 01 Nov 2019 16:51:54 GMT

### Patches

- fix version references for packages (jasonmo@microsoft.com)
## 0.2.1
Tue, 15 Oct 2019 02:11:41 GMT

### Patches

- api-extractor setup (taamireh@microsoft.com)
## 0.2.0
Wed, 25 Sep 2019 23:15:41 GMT

### Minor changes

- Get new compose infrastructure working (jasonmo@microsoft.com)
## 0.1.4
Thu, 19 Sep 2019 23:21:48 GMT

### Patches

- force publish (taamireh@microsoft.com)
## 0.1.3
Thu, 19 Sep 2019 00:21:30 GMT

### Patches

- change scope names (taamireh@microsoft.com)
## 0.1.2
Sat, 14 Sep 2019 01:56:36 GMT

### Patches

- Begin turning on some linting rules (taamireh@microsoft.com)
