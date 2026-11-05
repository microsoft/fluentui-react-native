---
'@fluentui-react-native/desktop-driver': patch
---

Implement bounded observation in the macOS helper. `observe` samples a window's accessibility tree breadth first with one multi-attribute read per element under visited, depth, string, byte, and deadline budgets, and `releaseElements` drops element records. Element ids are shared with `tree`, `find`, and `snapshot`. The `actions` fact and `accessibilityActions` now return an empty list for an element whose action query reports a general failure, as AppKit split dividers do, instead of failing the command.
