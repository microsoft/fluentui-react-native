---
'@fluentui-react-native/desktop-driver': patch
---

Harden the Windows helper: publish window lifecycle from WinEvent hooks, recheck input authority on every physical operation, never reuse element ids and bound retained elements with a fingerprint check before each action, treat a provider-reported UI Automation timeout on a mutation as indeterminate, refuse clicks that another application's window covers, and report provider failures with their named UI Automation results. Adds an opt-in plain Win32 fixture contract.
