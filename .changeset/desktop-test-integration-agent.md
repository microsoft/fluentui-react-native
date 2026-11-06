---
'@fluentui-react-native/desktop-test': patch
---

Let an imported integration serve `serve --agent` by declaring `supportsAgent`; `run` receives the agent descriptor options and, for `serve`, the output format for its readiness document. `startNativeDesktopService` accepts `agent` options to protect the driver and publish its agent connection.
