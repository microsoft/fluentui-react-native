---
'@fluentui-react-native/desktop-driver': patch
---

Add the `perform` action to `act`, which runs an accessibility action an element publishes by name. The macOS helper binds each listed action to an opaque per-process key so the action performed is exactly the one listed.
