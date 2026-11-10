---
'@fluentui-react-native/desktop-driver': patch
---

Make the macOS helper count mouse-button events and drags in the effect ledger, so a cancelled or failed physical click reports a partial effect instead of none and cannot be retried into a second activation. End launched applications with a verified quit, wait, kill, and exit proof on close, dispose, and failed or late launches, keeping the lease when the exit cannot be proven. Release input and stop queued work when the client disconnects or a response cannot be written, ignore `SIGPIPE`, and fail the transport on invalid JSON. Fail closed on an unreadable login session or pointer position, take the cross-process input lock for focus and window geometry changes, require a window frame that matches before capturing it, and report unreadable Accessibility state as unsupported or `target-non-response` instead of a definite answer.
