---
'@fluentui-react-native/desktop-driver': patch
---

Keep hit-test windows from other macOS processes distinct while refusing same-process and unproven obstructions before activation, fall back to workspace activation when an acknowledged Accessibility request does not establish foreground state, wait for pointer placement without replaying motion, and use menu-independent document selection with verified focus, selection, and empty-value postconditions before reporting keyboard-clear success.
