---
'@fluentui-react-native/desktop-driver': patch
---

Implement bounded observation in the Windows helper. `observe` pages each family of UI Automation children with the cached tree walker, so the visited, depth, byte, and deadline budgets take effect between any two siblings, and a 10,000-item tree returns a partial sample instead of failing `tree-too-large`. Records that `observe` emits are pinned until `releaseElements` or their window ends, a full record table ends the sample with the `references` truncation instead of evicting them, and `releaseElements` drops only the named records. Password fields never report `value` or `text`. The helper negotiates `boundedObservation` in `hello` and `probe`, so agent operations now work on Windows.
