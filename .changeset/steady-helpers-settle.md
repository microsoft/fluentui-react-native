---
'@fluentui-react-native/desktop-driver': patch
'@fluentui-react-native/desktop-test': patch
'@fluentui-react-native/storybook-desktop': patch
---

Treat empty reporter environment variables as unset and stop CLIs crashing when stdout closes, and make the Windows helper fail closed when a UI Automation mutation does not settle by reporting `mutation-indeterminate` and refusing later mutations with `target-quarantined`.
