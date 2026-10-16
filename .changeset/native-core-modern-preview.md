---
'@fluentui-react-native/native-core': minor
---

Add platform-scoped React 19 Callout and FocusZone previews built as phased
components, with live targets, confirmed cancellable native commands, a shared
hook-free Callout host, Swift macOS focus/placement services, and a
cross-machine validation plan. Implement the new macOS Paper Callout commands
in Swift behind header-independent bridges. Preserve Win32 legacy
registrations without new managed transport.

Honor explicit Windows FocusZone destinations without entry-focus redirection
and cover live-target refusal, cancellation, and detached command handles in
native stories.

Fix the Windows Callout crash on popup creation caused by an unsupported weak
light-dismiss revoker, and release each mount's popup, window, and
subscriptions on unmount. Windows Callout now dismisses on outside pointer
input and Escape, honors legacy `dismissBehaviors`, returns keyboard input to
the owner after a focused presentation closes, and keeps the requested gap
when placement flips. Windows FocusZone requests inside owned popups are
accepted while the popup's owner is active, enabling flat Menu and Popover
composition.
