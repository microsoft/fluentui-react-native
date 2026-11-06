---
'@fluentui-react-native/desktop-driver': patch
---

Add `createWindowsApplicationProbe` to `./authority` and the Windows helper's `--application-incarnation` mode behind it, so a Windows service's `recovery.probeApplication` can lift a persisted quarantine once the recorded application process is proven to have exited. The helper answers `exited` only when the process id names no process, the process holding it has exited, or it names a process created more than one second later; a creation time within 10 ms is `running`, and access denied or anything else is `unknown`.
