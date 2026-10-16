---
'@fluentui-react-native/desktop-driver': patch
---

Retry a Windows accessibility subtree read when a descendant disappears mid-read, such as an owned popup island
closing, while its root remains available. Only an unavailable root reports a stale element.
