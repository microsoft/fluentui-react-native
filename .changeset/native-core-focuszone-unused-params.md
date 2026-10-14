---
"@fluentui-react-native/native-core": patch
---

Mark the unused block parameters in the macOS FocusZone traversal as `__unused` so the file compiles cleanly with `-Wunused-parameter` treated as an error.
