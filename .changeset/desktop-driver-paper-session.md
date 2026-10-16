---
'@fluentui-react-native/desktop-driver': patch
---

Report macOS elements that do not publish `AXEnabled`, such as React Native
Paper views without an explicit disabled state, as enabled so they can be
clicked and queried. Diagnose a locked or switched-out macOS login session:
launch, attach, window discovery, and new physical input fail immediately with
an explicit session diagnosis, and `doctor --permissions` reports the session.

Record macOS window notifications and recent helper commands in a bounded
diagnostic timeline exposed through `furn/window-events`, publish
`window-closed` events, and describe transient windows by role, frame, and
WindowServer identity. Activate macOS targets through Accessibility instead of
waiting about a second for cooperative workspace activation, and name the
occluder of an intercepted click. Add `captureDesktopFailureEvidence`, which
captures window events first and then the current and other open windows.
Attached WebdriverIO sessions now use explicit wait defaults so `waitUntil`
polls until its timeout instead of stopping after the first poll.
