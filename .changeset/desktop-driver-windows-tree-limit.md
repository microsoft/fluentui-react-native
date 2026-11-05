---
'@fluentui-react-native/desktop-driver': patch
---

Report `tree-too-large` from the Windows helper's `tree` and `find` when an oversized tree outlasts the whole-subtree UI Automation transaction, by counting the subtree one child at a time up to the node limit instead of failing with `automation-failed`.
