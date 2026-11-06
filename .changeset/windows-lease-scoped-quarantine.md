---
'@fluentui-react-native/desktop-driver': patch
---

Scope the Windows helper's mutation quarantine to the application lease. Closing a launched application ends its quarantine once the helper has verified the process exited, as the service already does, so one unsettled call no longer refuses mutations for every later session until the helper restarts. An attached application keeps running and stays quarantined. Adds an opt-in `protectedService` native contract that serves the Win32 fixture through a grant-protected service with the real helper behind it.
