---
"@fluentui-react-native/desktop-driver": patch
---

Recover abandoned physical input locks after an unexpected helper exit even when no pressed keys or buttons were recorded. Empty-ledger recovery never posts input or waits for a live lock holder.
