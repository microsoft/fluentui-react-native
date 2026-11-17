---
'@fluentui-react-native/desktop-test': patch
'@fluentui-react-native/storybook-desktop': patch
---

Move Windows Fabric and Win32 Paper smoke lifecycles from PowerShell coordinators into neutral supervised resources with exact native application ownership, protected attach leases, cancellation, and explicit cleanup failure reporting. Preserve fixed Windows Metro, relaunch readiness before authored tests, and Win32 required-story and native chrome checks.
