---
'@fluentui-react-native/desktop-driver': patch
---

List the accessibility actions an element publishes through a new `accessibilityActions` element property, gated by the `accessibilityActions` entry in `furn:features`. The macOS provider reports authored custom actions such as `Toggle` and `Select` by name without exposing provider handles, while Windows and Win32 keep returning `unsupported operation`. The property only lists actions; it does not invoke them.
