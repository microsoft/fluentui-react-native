---
'@fluentui-react-native/desktop-driver': patch
---

Make the Windows helper acknowledge cancellation promptly: bounded UI Automation calls, the whole-subtree cache, window restore, move, and activation, and `closeApplication` observe cancellation, and a cancelled mutation reports effect `unknown`. Window management and activation probe a hung target and fail with reason `target-non-response` instead of blocking. Held keys and buttons keep the physical input lock until released, and queued commands are dropped after the transport ends. A malformed JSON frame now fails the transport. Pointer presses and scrolls over another application's window are refused, failed pattern and focus reads are no longer reported as unsupported or unfocused, a job-contained launch root is no longer terminated after launch, a packaged launch root must report its AUMID, an unreadable start time fails the lease, and activation grants foreground rights only to the target process.
