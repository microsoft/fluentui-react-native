---
'@fluentui-react-native/components': patch
'@fluentui-react-native/storybook-desktop': patch
'@fluentui-react-native/storybook-desktop-runtime': patch
---

Publish retained Windows and Win32 Storybook readiness only after the application's authenticated runtime renders its
initial story, exclude transient story-test runner workspaces from Metro, and make the Avatar activity-ring toggle test
self-driving so it no longer depends on story argument updates.
