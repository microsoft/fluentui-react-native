---
'@fluentui-react-native/desktop-driver': patch
---

Fix window activation on macOS for SwiftUI applications, such as Calculator on macOS 27, whose windows refuse `AXRaise` with `attributeUnsupported`. Activation now records that refusal and lets its frontmost and main-window checks decide, so physical clicks and typing no longer fail before they start.
