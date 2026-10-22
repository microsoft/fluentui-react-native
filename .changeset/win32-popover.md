---
'@fluentui-react-native/components': patch
'@fluentui-react-native/native-core': minor
'@fluentui-react-native/desktop-driver': patch
---

Present Popover on Office Win32 through a new `Callout` adapter in native-core's `win32` entrypoint. The adapter
implements the modern props and presentation handle over the host's existing Callout registration and sends it no
new commands. It supports view anchors only, and its popup sits flush against the anchor. The host draws the surface
fill and corner radius, because its popup window has no per-pixel transparency. On Win32 the Popover trigger also
declares `Expand` and `Collapse` accessibility actions, so UI Automation exposes its expanded state.

On Windows, the modern Callout popup window now has rounded corners and the platform popup shadow. A press on the
live view anchor no longer light-dismisses it before the anchor handles that press.

The Windows desktop driver no longer reactivates a window whose owned popup is in the foreground. It also retries a
subtree walk when a closing popup's UI Automation provider reports a transient failure.
