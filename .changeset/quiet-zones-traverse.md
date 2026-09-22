---
'@fluentui-react-native/focus-zone': patch
---

Fix Windows Fabric FocusZone Shift+Tab traversal when the zone is a first child so backward navigation cannot re-enter the zone or jump to a later sibling.
