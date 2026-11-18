---
'@fluentui-react-native/desktop-test': patch
---

On Windows and Win32, recognize the exited supervisor's own WebDriver listener during workload recovery. Claims for
unverified owners or resources remain fenced.

Retry transient sharing violations when releasing the workload claim, and treat Ctrl+Break as a graceful interrupt.
