---
'@fluentui-react-native/desktop-driver': patch
---

Make native helper shutdown and cancellation reliable. `dispose` now settles when a helper ignores cancel or stops answering: it kills the helper after the cancellation deadline, shares one disposal across callers, and runs every failure through one path that recovers input before rejecting each pending request once. Malformed helper output, duplicate binary identifiers, and stdio errors fail the transport instead of throwing, a lingering grandchild can no longer hold failure handling on the stdio pipes, large frames decode in linear time, and helper stderr is bounded and decoded as whole UTF-8 lines. `NativeDesktopHost` gains a validated `cancellationTimeoutMs` option (default 2000 ms on macOS and 10000 ms on Windows), starts no helper after `dispose`, and no longer rethrows a failed startup from `dispose`. On macOS the helper now runs in its own process group so a terminal Ctrl+C no longer races the orderly shutdown.
