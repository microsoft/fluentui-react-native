---
'@fluentui-react-native/desktop-driver': patch
---

Let typed-client operation calls take an `AbortSignal`, which the service treats as the caller leaving, and export `maxRequestIdLength` from `/operations`.
