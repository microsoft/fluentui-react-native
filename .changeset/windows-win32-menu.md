---
'@fluentui-react-native/components': patch
'@fluentui-react-native/native-core': minor
'@fluentui-react-native/desktop-driver': patch
---

Present Menu and MenuButton on Windows and Office Win32. On Windows, the modern Callout now implements
`tabNavigation`: Tab or Shift+Tab in any popup of a nested family closes the whole family and either keeps focus at
the owner (`dismiss`) or moves it past the anchor (`continue`). Closing an outer Callout also closes the Callouts
nested in it, and focus requests treat a nested popup's owner window as active.

Native-core's `win32` entrypoint adds a `FocusZone` adapter over the host's FocusZone registration. Its `Callout`
adapter adds `initialFocus`, keeps the popup's focus and key events from bubbling to its owner, and closes the
outermost popup on Tab. On Win32, Menu handles Home and End itself, and MenuButton returns Tab to its trigger.
Because the Win32 host reports a pointer leave together with its enter, a pending submenu change there survives the
leave until another row is hovered.

The Windows desktop driver injects a character that one unmodified key of the foreground keyboard layout types as
that virtual key, so key-based handlers such as type-ahead match it.
