---
'@fluentui-react-native/native-core': patch
---

Implement the macOS Paper Callout `focusWindow` and `blurWindow` commands in Swift so the Objective-C manager no longer imports the generated Swift header, which duplicates the manager's interface when hosts compile Swift with an Objective-C bridging header.
