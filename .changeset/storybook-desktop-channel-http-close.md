---
'@fluentui-react-native/storybook-desktop': patch
---

Close the upstream Storybook HTTP listener and its open connections when the legacy channel service stops, so lingering keep-alive or reconnect sockets cannot keep the channel process alive past its shutdown budget.
