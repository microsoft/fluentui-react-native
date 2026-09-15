# MenuItem interaction

Interactive list-item roots forward React Native Pressable handlers. Native
pointer and keyboard activation call `onPress`; disabled rows cannot activate
or receive focus. Pressing never changes `selected`, so an owning menu must
update that value and clear peers when required.

Hover and press state select the root and text colors after style selection.

Section headers do not activate, focus, or show a ring, including when their
skeleton is shown.

The focus target follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.

This component does not implement arrow navigation, Home/End, type-ahead,
submenu opening, focus restoration, dismissal, or timed motion. Those are
menu-container responsibilities on Windows and macOS.

## Focus target lifetime

The state hook uses the shared ref-backed focus foundation. Internal focus-target
refs compose with caller refs on the actual interactive slot, without redirecting
structural root refs. Native self-focus is distinct from descendant events, and
detach/disable invalidates pending focus requests. Focus visuals observe root
modality only while focused on the custom path; there is no scene-wide rerender.
