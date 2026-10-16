---
'@fluentui-react-native/native-core': patch
---

Fix macOS Fabric FocusZone inside popups. Opening a Callout whose content
starts with a FocusZone no longer aborts the app, and Escape and other
unhandled keys now continue past the zone, so they reach the popup and dismiss
it. Add Menu composition stories for the default and explicit `pointerFocus`
trigger behaviors.
