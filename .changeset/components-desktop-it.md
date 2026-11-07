---
'@fluentui-react-native/components': patch
---

Declare every component and primitive story test with `desktopIt`, so each case states the input it needs, the endpoints it runs on, and its known gaps instead of skipping at run time, and remove the internal `requireDesktopFocus` story helper.
