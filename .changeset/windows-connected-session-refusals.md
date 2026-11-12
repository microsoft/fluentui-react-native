---
'@fluentui-react-native/desktop-driver': patch
---

Refuse Windows legacy-only semantic activation before dispatch, preserving machine-readable reasons without recording a delivery or implicitly retrying with physical input.

Register untitled Windows secondary tool popups only when their exact-process ownership and bounded UIA content are verified, retaining helper-window exclusions.
