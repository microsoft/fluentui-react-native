---
"@fluentui-react-native/desktop-driver": patch
---

Reject non-finite and out-of-range WebDriver pointer and wheel values before dispatch. Safely convert action values in the macOS helper so oversized wheel deltas cannot crash it.
