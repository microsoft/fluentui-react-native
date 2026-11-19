---
"@fluentui-react-native/desktop-driver": patch
---

Disable automatic WebdriverIO request retries for connected and attached desktop sessions so a failed launch or input operation is not replayed. Keep the driver's mutation outcome on command errors.
