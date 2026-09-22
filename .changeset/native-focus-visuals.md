---
"@fluentui-react-native/components": patch
"@fluentui-react-native/callout": patch
"@fluentui-react-native/focus-zone": patch
---

Use native focus visuals on all platforms by default while retaining the custom
FocusVisual implementation behind a shared evaluation switch. Require React
Native Windows 0.81.35 or newer for the native focus visual crash fix.
Refresh the Windows Callout and FocusZone NuGet locks to the same runtime version.
