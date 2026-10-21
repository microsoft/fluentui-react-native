---
'@fluentui-react-native/components': minor
'@fluentui-react-native/native-core': minor
---

Add the reviewed Popover contract and its macOS and Windows implementation: a Button trigger, a token-styled
surface in a native popup, controlled and uncontrolled presence with native dismissal reasons, entry focus, and
focus return to the trigger. Popover is exported from the package root.

On macOS, the experimental modern Callout now presents an unstyled transparent popup window with a native shadow
that follows its content. Pointer input on a live view anchor no longer light-dismisses it, Tab moves within the
popup, and Paper orders modern commands after previously committed view updates. Legacy Callout behavior and APIs
are unchanged.
