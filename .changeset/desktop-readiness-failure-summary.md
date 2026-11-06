---
'@fluentui-react-native/desktop-driver': patch
'@fluentui-react-native/desktop-test': patch
'@fluentui-react-native/storybook-desktop': patch
---

Long-lived `serve`, `driver`, and `server` commands now write their bounded summary when they fail before readiness, instead of exiting with empty structured output. Integrations receive an `onReady` callback for `serve`. Storybook CLI tests no longer overwrite a live app's generated driver state. Records the live macOS paging and delta qualification.
