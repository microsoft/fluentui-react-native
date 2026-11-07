---
'@fluentui-react-native/desktop-driver': patch
'@fluentui-react-native/desktop-test': patch
'@fluentui-react-native/storybook-desktop': patch
---

Add modality-aware desktop test descriptors: `desktopIt` and `desktopDescribe` declare `requires`, `input`, `platforms`, `scope`, and known gaps for Storybook cases and, through `desktop-test/jasmine`, WebdriverIO Jasmine specs. `--input accessible|physical` (or `DESKTOP_INPUT`) runs one input lane, selects the cases that apply, masks the host for the accessible lane, and reports the lane and what it excluded.
