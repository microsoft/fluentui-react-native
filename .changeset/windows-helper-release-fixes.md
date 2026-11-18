---
'@fluentui-react-native/desktop-driver': patch
---

Fix a Windows and Win32 helper crash when the first window listing encounters an open popup. Reject wheel deltas and
pointer coordinates that cannot be represented in native input events instead of wrapping or injecting them.
Recover an abandoned physical-input lock even when there are no recorded keys or buttons to release.
Restrict the Windows helper's default DLL search to System32 and suppress blocking system error dialogs.
