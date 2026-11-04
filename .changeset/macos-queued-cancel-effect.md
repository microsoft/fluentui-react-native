---
'@fluentui-react-native/desktop-driver': patch
---

The macOS helper no longer attaches an `effect` when a queued read or lifecycle command is cancelled before it starts, matching the native protocol and the Windows helper. A queued mutation and an unknown id still report `none`. A new self-test drives the stdio host over in-process pipes and checks that cancelled queued requests never run.
