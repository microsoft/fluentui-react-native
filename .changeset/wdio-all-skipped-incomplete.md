---
'@fluentui-react-native/storybook-desktop': patch
---

Report WDIO and smoke runs in which every selected test was skipped as `incomplete` instead of `passed`, and fail the command so an all-skipped selection cannot satisfy a required test gate. Run reports now include selected/passed/skipped/failed counts. Mixed pass/skip runs are unchanged.
