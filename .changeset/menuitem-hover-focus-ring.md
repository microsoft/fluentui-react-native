---
'@fluentui-react-native/menu': patch
---

Fix `MenuItem` showing a focus ring when focus moves to it from mouse hover on win32. The hover-initiated focus is now tracked with a ref instead of stale pressable state.
