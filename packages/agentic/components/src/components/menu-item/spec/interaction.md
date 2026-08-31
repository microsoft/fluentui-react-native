# MenuItem interaction

Interactive list-item roots forward React Native Pressable handlers. Native
pointer and keyboard activation call `onPress`; disabled rows cannot activate
or receive focus. Pressing never changes `selected`, so an owning menu must
update that value and clear peers when required.

Hover and press state select the root and text colors after style selection.
The dual-ring FocusVisual remains mounted and is visible only for an enabled,
focused list item. Section headers do not activate or focus, including when
their skeleton is shown.

This component does not implement arrow navigation, Home/End, type-ahead,
submenu opening, focus restoration, dismissal, or timed motion. Those are
menu-container responsibilities on Windows and macOS.
