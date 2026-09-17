---
"@fluentui-react-native/components": patch
"@fluentui-react-native/storybook-desktop": patch
---

Migrate all component catalog story tests to named WDIO callbacks and add Windows/Win32 focus contract coverage, including activation pairing, native target lifetime, nested modality, editable fields, TabList sequencing, and FocusZone navigation. Keep Node-only test helpers out of production emit, require story type coverage, preserve focused smoke filters, and allow worker HTTP handles to close naturally while retaining bounded cleanup.
