---
'@fluentui-react-native/framework-base': minor
---

Replace `useFocusablePressable`'s `focusOnPress` boolean with a `pointerFocus`
mode. `platform` (the default) keeps the existing behavior: Windows and Win32
focus a pressed target, and macOS follows AppKit by leaving keyboard focus in
place. `always` and `never` select an explicit behavior on every platform.
Export `PointerFocusMode`, `FocusablePressableOptions`, and
`requestsFocusOnPointerPress`.
