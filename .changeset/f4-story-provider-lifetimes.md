---
'@fluentui-react-native/desktop-driver': patch
'@fluentui-react-native/storybook-desktop': patch
'@fluentui-react-native/storybook-desktop-runtime': patch
---

Add local story-provider lifetime/cancellation context, authenticated connection
epochs, versioned native marker conformance, prompt disconnect failure, and stale
preview mutation rejection. Fence interrupted navigation conservatively and
report renderer-specific bridge/relaunch failures without claiming transparent
upstream reconnect or clearing unknown-effect quarantine.
